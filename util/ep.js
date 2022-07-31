const EventEmitter = require('events');
const https = require('https');
const http = require('http');
const fs = require('fs');

var server = https.createServer({})

class responseError extends Error {

    data = null;

    constructor(data) {
        super('Request Failed')
        this.data = data
    }
}

class epRequest extends EventEmitter {

    #request = http.ClientRequest.prototype;
    #id = 0;
    #prams = []
    #method = ''
    static endpoint = new URL("https://services.educationperfect.com/json.rpc");
    static eventMethods = {
        login: 'EP.API.AppLoginPortal.PasswordLogin',
        getTasks: 'nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.GetCurrentTasksForUser',
        getTaskLists: 'nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.GetUserTaskListProgressDetails',
        getBasicListInfo: 'nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.GetActivityBasicInfo',
        getAdvancedInfo: 'nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.GetPreGameDataForClassicActivity',
        updateList: 'nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.StoreActivityProgress',
        storeUserData: 'nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.StoreActivityUsageData3',
        unkwnown: [
            'nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.UpdateLastActivityForUser2',
        ]
    }

    /**
     * @param {String} method 
     * @param  {...Object} prams 
     */
    constructor(method, ...prams) {
        super({ captureRejections: true })
        var requrl = new URL(epRequest.endpoint)
        requrl.searchParams.set('target', method)
        this.#request = https.request({
            method: 'POST',
            host: requrl.host,
            path: requrl.pathname,
            searchParams: requrl.searchParams
        })
        this.#id = Math.floor(Math.random() * 8999) + 1000
        this.#method = method

        this.#prams = prams

        this.#request.on('error', (...e) => this.emit('error', ...e))

        this.#request.on('response', (res) => {
            var data = ''
            res.on('data', d => data += d.toString())

            res.on('end', () => {

                switch (res.statusCode) {
                    case 200:
                        try {
                            data = JSON.parse(data)
                        } catch (err) {
                            this.emit('error', new SyntaxError('Failed to phrase json'))
                            return;
                        }
                        if (data.result?.Success) {
                            this.emit('response', data.result)
                        } else {
                            this.emit('error', new responseError(data))
                        }
                        break;
                    case 404:
                        this.emit('error', new Error('Coulden\'t find method'))
                        break;
                }
            })
        })
    }

    /**
     * @param  {...Object} prams 
     */
    addPrams(...prams) {
        prams.push(...this.#prams)
    }

    send() {
        this.#request.write(JSON.stringify({
            id: this.#id,
            method: this.#method,
            params: this.#prams
        }))
        this.#request.end()
    }

}

class epClient extends EventEmitter {

    #config = {
        misc: {
            AppId: 6,
            AppVersion: "OSX 5.0.78649",
            DeviceInformation: {
                BrowserName: "Safari",
                BrowserVersion: "15.5",
                OperatingSystemName: "macOS",
                OperatingSystemVersion: "10.15.7",
                PlatformType: "desktop",
                UserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15", "ScreenWidth": 1440, "ScreenHeight": 900
            },
            ClientFlags: [
                "ALLOW_INACTIVE_USER"
            ]
        }
    }
    #userinfo = {
        PrivilegesLevel: 0,
        Subjects: [
            {
                SubjectId: 0,
                ClassId: null,
                Licenced: false,
                PaymentStatus: 0,
                StartDate: null,
                ExpiryDate: "",
                UserSelected: false
            }
        ],
        School: {
            Id: 0,
            Name: "",
            CountryId: 0,
            Country: "",
            StateId: 0,
            State: "",
            LogoUrl: "https://www.educationperfect.com/Images/SchoolLogos/434_2017-04-20_01-26-45.jpg",
            OrganizationType: 0,
            Attributes: {
                ScriboEnabled: false
            },
            UserIsActive: false
        },
        Theme: {
            GradientColor1: "",
            GradientColor2: "",
            Id: 0,
            Name: "",
            AccentColor: "",
            AccentColorDark: "",
            AccentColorSemiLight: "",
            AccentColorLight: "",
            Type: ""
        },
        User: {
            PublicId: "",
            Id: 0,
            UserIdHash: "",
            Username: "",
            FirstName: "",
            Surname: "",
            Title: "",
            Email: "",
            Avatar: {
                Id: 0,
                Url: "https://static.educationperfect.com/images/avatars/2021-05/24-Tech.svg",
                Set: 0
            },
            SelectedBaseLanguageId: 0
        }
    }
    get user() { return this.#userinfo }
    get tasks() { return this.#tasks }
    #sesssionId = 0
    #active = false
    #tasks = []

    constructor() {
        super({ captureRejections: true })
    }

    async login(username, password) {
        var req = new epRequest(epRequest.eventMethods.login, {
            Username: username,
            Password: password,
            AppId: this.#config.misc.AppId
        })

        return new Promise((res, reg) => {
            req.on('response', (response) => {
                this.#sesssionId = response.SessionId
                this.#active = true
                this.#userinfo.PrivilegesLevel = response.PrivilegesLevel
                this.#userinfo.School = response.School
                this.#userinfo.Subjects = response.Subjects
                this.#userinfo.Theme = response.Theme
                this.#userinfo.User = response.User
                this.emit('ready')
                res(this.#sesssionId)
            })
            req.on('error', reg)
            req.send()
        })
    }

    async getTasks() {
        if (!this.#active) throw new Error('Client Not Connected');
        var req = new epRequest(epRequest.eventMethods.getTasks, this.#sesssionId)

        return new Promise((res, reg) => {
            req.on('response', (response) => {
                this.#tasks = response.LearnContentTasks
                res(this.#tasks)
            })
            req.on('error', reg)
            req.send()
        })
    }

    async getTaskLists(taskid) {
        if (!this.#active) throw new Error('Client Not Connected');
        var req = new epRequest(epRequest.eventMethods.getTaskLists, this.#sesssionId, taskid)

        return new Promise((res, reg) => {
            req.on('response', (response) => {
                res(response.Details)
            })
            req.on('error', reg)
            req.send()
        })
    }

    async getBasicListInfo(taskIdInfo) {
        if (!this.#active) throw new Error('Client Not Connected');
        var req = new epRequest(epRequest.eventMethods.getBasicListInfo, this.#sesssionId, taskIdInfo)

        return new Promise((res, reg) => {
            req.on('response', (response) => {
                res(response.Activity)
            })
            req.on('error', reg)
            req.send()
        })
    }

    async getAdvancedListInfo(taskIdInfo) {
        if (!this.#active) throw new Error('Client Not Connected');
        var req = new epRequest(epRequest.eventMethods.getAdvancedInfo, this.#sesssionId, taskIdInfo)

        return new Promise((res, reg) => {
            req.on('response', (response) => {
                Object.assign(response, {
                    Fault: undefined,
                    FaultSeverity: undefined,
                    FaultTrackingGuid: undefined,
                    Success: undefined,
                })
                res(response)
            })
            req.on('error', reg)
            req.send()
        })
    }

    async updateList(
        data
    ) {
        if (!this.#active) throw new Error('Client Not Connected');
        var req = new epRequest(epRequest.eventMethods.updateList, this.#sesssionId, data)

        return new Promise((res, reg) => {
            req.on('response', (response) => {
                res(response)
            })
            req.on('error', reg)
            req.send()
        })
    }

    async request(method, ...args) {
        if (!this.#active) throw new Error('Client Not Connected');
        var req = new epRequest(method, this.#sesssionId, ...args)

        return new Promise((res, reg) => {
            req.on('response', (response) => {
                res(response)
            })
            req.on('error', reg)
            req.send()
        })
    }
}

(async () => {
    const client = new epClient()

    await client.login("MB6087@scotchmel.vic.edu.au", "Betsie99")
    await client.getTasks()

    var lists = await Promise.all(client.tasks.map(t => t.TargetContentIDs.Lists.map(
        n => client.getAdvancedListInfo({ ActivityID: n.ListID, DatasetID: t.ScoreDataSet }))).flat());
    var targetList = await client.getAdvancedListInfo({ DatasetID: 6716359, ActivityID: 4912835 });
    var data = {
        ActivityTypeId: 1,
        BaseLanguageId: 6,
        ClientTimezoneOffsetMinutes: 600,
        Data: targetList.Translations.map(t => ({
            TranslationID: t.id,
            TranslationDirection: 2,
            NewNumberRight: 3,
            NewNumberWrong: 0,
            NewData: 3
        })),
        ListIds: [4912835],
        TargetLanguageId: 8,
        ModuleId: 6716359,
        RequestId: "c4bbdaad-f8db-6a96-483e-ffc079c8340f"
    }

    // console.log(await client.updateList(data))
    fs.writeFileSync("ep.json", JSON.stringify(targetList.Translations))

    await client.request(epRequest.eventMethods.storeUserData, [], [], null, null, null)

})();

({
    "id": 3346,
    "method": "nz.co.LanguagePerfect.Services.PortalsAsync.App.AppServicesPortal.StoreActivityUsageData3",
    "params": [
        3359149321116341,
        [
            {
                "UserID": 3245058,
                "QuestionID": 19043,
                "Time": 3,
                "TimeMS": null,
                "Correct": true,
                "Attempts": 4,
                "ListID": 4912835,
                "LearningContext": 1
            }
        ],
        [
            {
                "ListID": 4912835,
                "QuestionsAnswered": 1,
                "TimeTaken": 5,
                "TimeTakenMS": null,
                "LearningContext": 1
            }
        ],
        5,
        null,
        3832197761788222
    ]
})
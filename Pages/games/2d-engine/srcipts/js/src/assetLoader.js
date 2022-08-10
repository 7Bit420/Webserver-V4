class assetLoader {

    #assets = []

    /**
     * 
     * @param {ImageData} imageData 
     * @param {number} gs
     */
    constructor(imageData, gs) {
        var phrasedData = new Array(imageData.width / gs)
            .fill(new Array(imageData.height / gs));
        ;
        for (let i = 1; i < (imageData.width / gs); i++) {
            var data = []
            for (let n = 1; n < (imageData.height / gs); n++) {
                data.push(imageData.data.subarray(((i - 1) * gs) + ((n - 1) * gs), (i * gs) + (n * gs)))
            }
        }
    }

    getAsset(x, y) {

    }
}

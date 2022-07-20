#include <emscripten/emscripten.h>
#include <queue>
#include <utility>
using namespace std;
using pii = pair<int, int>;

;

#ifdef __cplusplus
extern "C"
{
#endif

    queue<pii> q;
    vector<pii> path;
    pii parent[1005][1005];
    bool seen[1005][1005];
    pii finish;
    pii start;
    int width;
    int height;

    EMSCRIPTEN_KEEPALIVE vector<pii> BFS()
    {
        parent[start.first][start.second] = {-1, -1};
        seen[start.first][start.second] = true;
        q.push(start);
        while (!q.empty())
        {
            pii node = q.front();
            int r = node.first;
            int c = node.second;
            q.pop();
            //
            if (r > 0 && !seen[r - 1][c])
            {
                seen[r - 1][c] = true;
                parent[r - 1][c] = node;
                q.push({r - 1, c});
                if (finish.first == r - 1 && finish.second == c)
                    break;
            }
            if (r < height - 1 && !seen[r + 1][c])
            {
                seen[r + 1][c] = true;
                parent[r + 1][c] = node;
                q.push({r + 1, c});
                if (finish.first == r + 1 && finish.second == c)
                    break;
            }
            if (c > 0 && !seen[r][c - 1])
            {
                seen[r][c - 1] = true;
                parent[r][c - 1] = node;
                q.push({r, c - 1});
                if (finish.first == r && finish.second == c - 1)
                    break;
            }
            if (c < width - 1 && !seen[r][c + 1])
            {
                seen[r][c + 1] = true;
                parent[r][c + 1] = node;
                q.push({r, c + 1});
                if (finish.first == r && finish.second == c + 1)
                    break;
            }
        }
        //
        pii node = finish;
        while (!(node.first == -1 && node.second == -1))
        {
            path.push_back(node);
            node = parent[node.first][node.second];
        }
        return path;
    }

#ifdef __cplusplus
}
#endif

//*/
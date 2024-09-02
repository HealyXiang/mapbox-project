## 概况

本项目使用 React + Vite + MapBox 技术栈开发

## 本地运行

1. 安装 Nodejs, npm 或者 pnpm(推荐)
2. 在根目录新建 `.env`文件，并填入`VITE_MAP_BOX_ACCESS_TOKEN=mapbox_token`
3. 在命令行工具中，执行 `pnpm i`安装项目所需依赖包
4. 在命令行工具中，执行 `pnpm dev` 本地启动项目运行，在按照命令行中提示浏览器打开页面链接
5. 执行 `pnpm build` 进行项目构建，打包出的产物在 `dist`根目录下面，`dist`目录下的 `index.html`就是根 html 文件
6. 将上述 `dist`目录作为服务器根目录，然后启动服务器即可通过 url 在浏览器中访问

   用 Nodejs 和 python 分别举例如下：

   Nodejs：
   直接在项目的根目录执行 `pnpm preview` 或者 `npm run preview`，此时看命令行中提示，在浏览器地址栏输入 http://localhost:4173/ 即可访问该服务。这是 Vite 打包工具内置封装的基于 Nodejs 的服务器。

   Python:

   ```
   cd /path/to/your/folder  本项目即切换到dist目录下

   python -m http.server 8000 或者 python3 -m http.server 8000

   或者不使用cd切换到dist目录，直接
   python3 -m http.server 8000 --directory ./dist

   在浏览器中输入以下地址 http://localhost:8000 即可访问该页面的所在的服务
   ```

项目命令行内容见根目录下`package.json`文件。

## MapBox 热力图

1. 热力图也是通过点数据表现的，核心是通过点数据的 `properties.mag`字段实现的
2. 绘制热力图 layer 时，核心参数如下：

```
   layer.type = "heatmap";
   layer.paint = {
   "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 1, 1],
   // 控制每个点的权重，影响热力图的强度。线性差值，mag为0时，权重为1；mag为1时，权重也为1
   "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 20, 10],
   // 控制热力图的强度，影响颜色和透明度。会根据当前的缩放级别来决定热力图的强度。
   "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(33,102,172,0)",
      0.2,
      "rgb(103,169,207)",
      0.4,
      "rgb(209,229,240)",
      0.6,
      "rgb(253,219,199)",
      0.8,
      "rgb(239,138,98)",
      1,
      "rgb(178,24,43)",
   ],
   // 表示当前热力图的密度值。Mapbox 会根据当前的密度值来决定热力图的颜色
   "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 15, 10],
   // Mapbox 会根据当前的缩放级别来决定热力图中每个数据点的半径。
   "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 1, 1, 20, 0.9],
   // Mapbox 会根据当前的缩放级别来决定热力图的透明度。
   };
```

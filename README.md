# TV_Server

> 🎬 **TV_Server** 是一个 Node.js + Vue 的影视聚合 Web 应用。它通过 CatPawOpen 的 `/spider/*` 能力完成站点搜索/详情/播放解析，并提供后台管理页面用于配置与维护。

# 改用go作为后端,此仓库不再更新

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-3c873a?logo=nodedotjs&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003b57?logo=sqlite&logoColor=white)
![Docker Ready](https://img.shields.io/badge/Docker-ready-blue?logo=docker&logoColor=white)

</div>

---

## ✨ 功能特性

- 🔍 **多站点聚合**：搜索 / 详情 / 选集播放
- ▶️ **播放器**：支持 HLS / FLV / DASH（`hls.js` / `flv.js` / `shaka-player`）
- ❤️ **收藏 + 继续观看**：收藏与播放历史记录
- 🪄 **魔法匹配**：列表清洗正则 + 选集匹配规则（用于生成/匹配集数）
- 🚀 **GoProxy（可选）**：支持直链注册后透传播放（用于部分网盘场景）

## 🗺 目录

- [技术栈](#技术栈)
- [部署](#部署)
- [默认账号](#默认账号)
- [环境变量](#环境变量)
- [相关项目](#相关项目)
- [致谢](#致谢)

## 技术栈

| 分类 | 主要依赖 |
| --- | --- |
| 前端 | Vue 3 + Vite（多页面构建） |
| 后端 | Node.js + Express |
| 数据库 | SQLite（`better-sqlite3`） |
| 播放 | `artplayer` + `hls.js` + `flv.js` + `shaka-player` |
| 部署 | Docker |

## 部署

前置：请先独立部署 CatPawOpen，并确保浏览器可访问（见 `../CatPawOpen/readme.md`）。

### 方式一：Docker Compose（生产）

在 `TV_Server/` 目录执行：

```bash
docker compose up -d --build
```

说明：

- 运行时会把整个目录映射到容器 `/app`（等价“用当前目录代码运行”）
- `node_modules` 使用单独的 volume，并在启动时从镜像内置依赖自动填充（避免容器启动时反复 `npm install`）
- 数据库默认写入项目根目录下的 `data.db`
- 默认会执行 `npm run build` 后再 `npm run start`

### 方式二：本地运行（生产）

在 `TV_Server/` 目录执行：

```bash
npm install
npm run build
npm run start
```

默认端口为 `8080`，可用 `PORT=18080 npm run start` 自定义。

## 默认账号

首次启动会初始化数据库并创建默认管理员账号：`admin/admin`。

## 环境变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `PORT` | TV_Server 监听端口 | `8080` |
| `TV_SERVER_COOKIE_SECURE` | 登录 Cookie 是否 `Secure`（HTTPS 下建议设为 `1`） | `0` |
| `ASSET_VERSION` | 静态资源版本号（用于前端资源刷新） | `V1.0.0` |

## 相关项目

- CatPawOpen：`../CatPawOpen/readme.md`
- GoProxy（可选）：`../go_proxy/README.md`

## 致谢

- [MoonTV](https://github.com/666zmy/MoonTV) — 并由此启发
- [Vue](https://github.com/vuejs/core)
- [Vite](https://github.com/vitejs/vite)
- [Express](https://github.com/expressjs/express)
- [ArtPlayer](https://github.com/zhw2590582/ArtPlayer)
- [HLS.js](https://github.com/video-dev/hls.js)
- [flv.js](https://github.com/bilibili/flv.js)
- [Shaka Player](https://github.com/shaka-project/shaka-player)

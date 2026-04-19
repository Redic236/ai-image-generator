# AI 图片生成器

基于智谱 AI CogView 的文生图应用，前端 Vite + React + TypeScript + Tailwind CSS，
图片 CDN 走 Cloudflare Worker 代理，规避本地网络到智谱 CDN 的 TLS 握手问题。

---

## 项目结构

```
.
├── index.html                 # Vite 入口
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx               # React 入口
│   ├── App.tsx
│   ├── index.css              # Tailwind + 全局样式
│   └── vite-env.d.ts
├── worker/                    # Cloudflare Worker 图片代理
│   ├── src/index.ts
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
└── legacy/                    # 归档的单文件 HTML 版本（供参考）
    ├── index.html
    └── server.py
```

## 前置

- Node.js **18+**
- 智谱 AI API Key — [申请](https://bigmodel.cn/usercenter/proj-mgmt/apikeys)
- Cloudflare 账号（部署 Worker 用，免费）

## 开发

### 1. 安装依赖

```bash
npm install
```

### 2. 部署图片代理 Worker（只需一次）

```bash
cd worker
npm install
npx wrangler login          # 浏览器授权 Cloudflare
npx wrangler deploy
```

部署成功后会输出 Worker URL，形如：

```
https://ai-image-proxy.<your-subdomain>.workers.dev
```

### 3. 配置前端代理 URL

复制 `.env.example` 为 `.env.local`，填入 Worker URL：

```bash
cp .env.example .env.local
# 编辑 .env.local，替换 VITE_PROXY_URL
```

### 4. 启动前端

```bash
npm run dev
```

浏览器打开 `http://localhost:5174`，点右上角「设置」填入 API Key 即可使用。

## Worker 功能

- 路由：`GET /proxy?url=<encoded-image-url>`
- 域名白名单：`.ufileos.com`、`.bigmodel.cn`、`.zhipuai.cn`、`.aliyuncs.com`
- 返回 CORS + 缓存头
- 缓存：Cloudflare 边缘缓存 1 小时
- 健康检查：`GET /` 返回 JSON 状态

### 测试 Worker 是否正常

```bash
# 健康检查
curl https://ai-image-proxy.<your-subdomain>.workers.dev/

# 代理一张图（把 url 替换为实际 CDN URL）
curl -I "https://ai-image-proxy.<your-subdomain>.workers.dev/proxy?url=https%3A%2F%2Fmaas-watermark-prod-new.cn-wlcb.ufileos.com%2F..."
```

## 构建

```bash
npm run build
```

产物在 `dist/`，可部署到任意静态托管（Cloudflare Pages、Vercel、Netlify 等）。

## 迁移阶段

| Phase | 内容 | 状态 |
|---|---|---|
| 1 | Vite 脚手架 + Cloudflare Worker | ✅ |
| 2 | 迁移 UI 组件、hooks、services | 进行中 |

Phase 1 完成后，dev server 能跑起来显示一个占位页。Phase 2 完成后功能齐全。

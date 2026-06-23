# 千面 · 爱情人格画像

> 探索你的爱情人格——78 道陈述题，12 个维度，10 种爱情人格类型。

## 快速开始

1. 在浏览器中打开 `index.html`（推荐使用本地静态服务器，如 VS Code Live Server 或 `npx serve .`）
2. 阅读隐私声明并同意
3. 开始答题，探索你的爱情人格

## 功能

- **78 题爱情观问卷**：覆盖冲突处理、依恋风格、亲密表达等 12 个维度
- **离线规则引擎**：余弦相似度匹配 10 种爱情人格类型，即时生成 600+ 字画像报告
- **AI 深度画像**（可选）：接入 DeepSeek 等 OpenAI 兼容 API，由大模型生成个性化分析
- **题库导入**：支持 CSV / 纯文本格式导入自定义题库
- **历史记录**：本地保存所有答题记录和画像
- **分享长图**：一键生成 PNG 长图保存或分享
- **完全本地**：所有数据存储在浏览器 localStorage，不上传任何服务器

## 文件结构

```
qianmian/
├── index.html              # 入口
├── css/
│   └── style.css           # 暖橙心理风主题
├── js/
│   ├── app.js              # 主控制器
│   ├── questions.js        # 78题 + 12维度定义
│   ├── templates.js        # 10种人格模板 + 特征向量
│   ├── engine.js           # 离线规则引擎
│   ├── storage.js          # localStorage 封装
│   ├── ai.js               # AI 调用模块
│   ├── import.js           # 题库导入解析
│   └── share.js            # 复制 + 长图生成
├── proxy/
│   └── worker.js           # Cloudflare Worker 代理脚本
└── README.md
```

## AI 配置

### 直接调用

如果使用支持浏览器 CORS 的 API（如 Gemini、Groq），直接在设置中填入 Key 和端点即可。

### 使用代理（解决 CORS 问题）

DeepSeek 等 API 默认不允许浏览器跨域调用，需部署代理：

1. 注册 [Cloudflare](https://cloudflare.com) → Workers & Pages → 创建 Worker
2. 将 `proxy/worker.js` 内容粘贴到编辑器 → 部署
3. 获得 Worker URL（如 `https://your-proxy.workers.dev`）
4. 在千面「设置」→「代理地址」中填入该 URL

代理仅做请求转发，不存储任何数据，且运行在你自己账号下。

## 技术栈

纯 HTML + CSS + JavaScript，零框架，零构建，零后端。

## 隐私

- 所有数据仅存储在浏览器 localStorage 中
- AI 调用数据仅发送至用户配置的 API 服务商
- API Key 由用户自行配置，存储在本地
- 清除浏览器数据即永久删除所有记录

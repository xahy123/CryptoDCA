# 加密货币定投计划

这是一个使用React、Vite和Ant Design开发的加密货币定投统计应用，可以帮助用户跟踪和管理加密货币投资。

## 功能特点

- 跟踪多种加密货币的投资情况
- 记录交易历史和定投记录
- 计算平均成本、当前价值和收益率
- 数据本地存储，保护隐私
- 响应式设计，适配各种设备

## 技术栈

- **前端框架**: React
- **构建工具**: Vite
- **UI组件库**: Ant Design
- **部署平台**: Vercel

## 快速开始

### 本地开发

1. 克隆仓库
```bash
git clone <repository-url>
cd CryptoDCA
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在浏览器中访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 部署到Vercel

1. 安装Vercel CLI
```bash
npm install -g vercel
```

2. 部署
```bash
vercel
```

## 使用指南

### 添加新币种

1. 点击「添加新币种」按钮
2. 输入币种名称和符号
3. 点击「添加」按钮

### 添加交易记录

1. 在「添加交易记录」表单中选择币种
2. 输入价格和数量
3. 点击「添加交易」按钮

### 更新价格

1. 在「更新价格」表单中选择币种
2. 输入当前价格
3. 点击「更新价格」按钮

## 数据存储

所有数据都存储在浏览器的本地存储中，不会上传到任何服务器，保证您的投资数据隐私安全。

## 许可证

MIT

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

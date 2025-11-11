# 记一笔APP (Jiyibi APP)

[English](README.md)

一款基于Web的个人及小型团队记账应用。该应用提供了一种高效便捷的方式来记录、管理和分析财务交易，支持多语言和响应式设计。

## 功能特性

- **多语言支持**：支持中英文界面实时切换
- **响应式设计**：适配PC、平板和移动设备，具有优化的布局
- **用户认证**：基于JWT的安全登录和注册系统
- **账本管理**：创建和管理多个账本，支持自定义描述和币种
- **账目管理**：记录、编辑和分类财务交易，包含日期、描述、类别和金额
- **数据可视化**：图表展示消费模式和财务趋势
- **数据导出**：支持Excel(XLSX)和CSV格式导出账本数据
- **离线存储**：本地数据存储，联网时同步
- **类别管理**：可自定义收入和支出类别
- **安全性**：密码加密、HTTPS数据传输和基于角色的访问控制

## 技术栈

- **后端**：Node.js、Express.js
- **数据库**：MongoDB with Mongoose ODM
- **前端**：HTML、CSS、JavaScript
- **安全**：Helmet、CORS、JWT
- **其他**：Bcrypt用于密码哈希、XLSX用于导出功能

## 安装步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/comesoon/jiyibi.git
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 在根目录创建 `.env` 文件并添加以下环境变量：
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=your_frontend_url
   PORT=5000
   ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 生产环境运行：
   ```bash
   npm start
   ```

## API路由

- `/api/auth` - 认证相关（登录、注册、密码重置）
- `/api/users` - 用户管理
- `/api/ledgers` - 账本操作
- `/api/categories` - 类别管理
- `/api/transactions` - 账目操作
- `/api/export` - 数据导出功能
- `/api/invitation-codes` - 邀请码管理
- `/api/admin` - 管理员功能

## 项目结构

```
jiyibi-app/
├── controllers/          # 请求处理程序
├── middleware/           # 认证和验证中间件
├── models/               # 数据库模型
├── public/               # 前端文件（HTML、CSS、JS）
├── routes/               # API路由定义
├── server.js             # 主服务器文件
└── package.json
```

## 前端组件

前端文件位于 `public/` 目录，包括：

- `index.html` - 主应用页面
- `css/main.css` - 样式文件
- `js/` - JavaScript功能文件，包括：
  - `api.js` - API通信
  - `auth.js` - 认证逻辑
  - `chart.js` - 图表生成
  - `components.js` - UI组件
  - `main.js` - 主应用逻辑
  - `store.js` - 数据存储和管理
  - `sync.js` - 离线同步功能
  - `toast.js` - 通知系统

## 贡献指南

1. Fork 该仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

## 许可证

该项目采用MIT许可证 - 详情请见 [LICENSE](LICENSE) 文件。

## 鸣谢

- 基于 Express.js 和 MongoDB 构建
- 使用了多个开源库以增强功能
- 灵感来源于对简单有效的个人财务管理工具的需求
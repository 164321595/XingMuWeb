# 票务系统前端

这是票务系统的前端React应用，负责用户界面展示和交互功能。

## 项目信息

- **项目名称**: starry_sky
- **技术栈**: React 18 + TypeScript + Vite + Tailwind CSS
- **项目版本**: 0.0.1

## 技术栈详情

### 核心依赖
- **React**: 18.3.1 - UI库
- **React DOM**: 18.3.1 - DOM渲染
- **React Router DOM**: 7.3.0 - 路由管理
- **Framer Motion**: 12.9.2 - 动画效果
- **Recharts**: 2.15.1 - 数据可视化
- **Sonner**: 2.0.2 - 通知组件
- **Clsx**: 2.1.1 - CSS类名管理
- **Tailwind Merge**: 3.0.2 - Tailwind类名合并
- **Zod**: 3.24.2 - 数据验证

### 开发依赖
- **TypeScript**: ~5.7.2 - 类型系统
- **Vite**: ^6.2.0 - 构建工具
- **@vitejs/plugin-react**: ^4.3.4 - React插件
- **Tailwind CSS**: ^3.4.17 - CSS框架
- **Autoprefixer**: ^10.4.21 - CSS前缀自动添加
- **PostCSS**: ^8.5.3 - CSS处理工具
- **@types/react**: ^18.3.12 - React类型定义
- **@types/react-dom**: ^18.3.1 - React DOM类型定义
- **vite-tsconfig-paths**: ^5.1.4 - 路径别名支持

## 项目结构

```
Web/
├── src/                   # 源代码目录
│   ├── api/               # API请求封装
│   ├── components/        # 公共组件
│   ├── contexts/          # React Context
│   ├── hooks/             # 自定义Hooks
│   ├── lib/               # 工具库
│   ├── pages/             # 页面组件
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 应用入口组件
│   ├── index.css          # 全局样式
│   └── main.tsx           # 程序入口文件
├── public/                # 静态资源
├── .gitignore             # Git忽略配置
├── package.json           # 项目配置和依赖
├── pnpm-lock.yaml         # 依赖锁定文件
├── postcss.config.js      # PostCSS配置
├── tailwind.config.js     # Tailwind配置
├── tsconfig.json          # TypeScript配置
└── vite.config.ts         # Vite配置
```

## 快速开始

### 环境准备
- 安装 [Node.js](https://nodejs.org/en) (推荐16.x或更高版本)
- 安装 [pnpm](https://pnpm.io/installation) 包管理器

### 开发流程

1. **安装依赖**

```bash
pnpm install
```

2. **启动开发服务器**

```bash
pnpm dev
```

开发服务器默认运行在 http://localhost:3000

3. **构建生产版本**

```bash
pnpm build
```

构建产物将生成在 `dist/` 目录下

## 页面功能

### 核心页面
- **首页** (`Home.tsx`) - 展示热门演出、分类导航
- **登录/注册** (`Login.tsx`, `Register.tsx`) - 用户认证
- **演出列表** (`Performances.tsx`) - 浏览和搜索演出
- **演出详情** (`PerformanceDetail.tsx`) - 查看演出详细信息
- **订单确认** (`OrderConfirm.tsx`) - 确认购票信息
- **订单列表** (`Orders.tsx`) - 查看用户订单
- **订单详情** (`OrderDetail.tsx`) - 查看订单详情
- **用户中心** (`UserProfile.tsx`) - 个人信息管理
- **账号设置** (`AccountSettings.tsx`) - 账号安全设置
- **票务秒杀** (`TicketSeckill.tsx`) - 抢购热门门票

## API接口

前端通过 `api/` 目录下的文件与后端进行通信，主要包含以下模块：
- `user.ts` - 用户相关API
- `performance.ts` - 演出相关API
- `ticket.ts` - 票务相关API
- `order.ts` - 订单相关API
- `index.ts` - API基础配置

## 自定义Hooks

项目使用自定义Hooks来复用逻辑：
- `useTheme.ts` - 主题切换功能
- `useUser.tsx` - 用户信息和认证状态管理

## 开发规范

1. **代码规范**
   - 使用TypeScript进行类型约束
   - 遵循React Hooks最佳实践
   - 组件命名使用大驼峰式
   - 函数和变量命名使用小驼峰式

2. **样式规范**
   - 优先使用Tailwind CSS工具类
   - 复杂样式可在组件内使用`@layer`定义
   - 使用`clsx`和`tailwind-merge`管理CSS类名

3. **提交规范**
   - 遵循语义化提交信息格式
   - 提交前确保代码通过TypeScript编译检查

## 注意事项
- 请确保后端服务正常运行，API请求才能成功
- 开发环境下，API请求默认指向 http://localhost:8080
- 生产环境构建前，请修改API基础URL配置

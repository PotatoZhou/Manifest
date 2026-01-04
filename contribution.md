## 安装与运行

### 前置要求
- Go 1.18 或更高版本
- Node.js 16 或更高版本
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### 开发模式

1. 克隆项目
```bash
git clone <https://github.com/PotatoZhou/Manifest.git>
cd Manifest
```

2. 安装依赖
```bash
# 安装 Go 依赖
go mod tidy

# 安装前端依赖
cd frontend
npm install
cd ..
```

3. 启动开发服务器
```bash
wails dev
```

### 构建生产版本

```bash
wails build -platform all
```

构建后的文件将生成在 `build/bin/` 目录下。

## 项目结构

```
Manifest/
├── build/                  # 构建输出目录
├── frontend/               # UI代码
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # React 组件
│   │   │   ├── Button/     # 按钮组件
│   │   │   ├── Dimension/  # 维度相关组件
│   │   │   ├── Sidebar/    # 侧边栏组件
│   │   │   └── YearSelector/ # 年份选择器
│   │   ├── pages/          # 页面组件
│   │   ├── styles/         # CSS 样式
│   │   ├── utils/          # 工具函数
│   │   ├── App.tsx         # 应用入口组件
│   │   └── main.tsx        # 入口文件
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── app.go                  # 应用主逻辑
├── config.go               # 配置管理
├── database.go             # 数据库操作
├── main.go                 # Go 程序入口
├── models.go               # 数据模型
└── wails.json              # Wails 配置文件
```

## 构建与发布

### 平台支持
- macOS (Intel/Apple Silicon)
- Windows (x64)
- Linux (x64)

### 构建命令

```bash
# 构建所有平台
wails build -platform all

# 构建特定平台
wails build -platform darwin/amd64
wails build -platform darwin/arm64
wails build -platform windows/amd64
wails build -platform linux/amd64
```

构建后的文件将生成在 `build/bin/` 目录下。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License

---

**Note:** 这是一个正在开发中的项目，功能和结构可能会有变化。
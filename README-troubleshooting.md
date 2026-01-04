# Wails Dev 错误解决方案

## 错误信息
```
ERROR   unable to start frontend DevWatcher: exec: "vite": executable file not found in $PATH
```

## 错误原因
这个错误表示 Wails 在执行 `wails dev` 命令时，无法在系统路径中找到 `vite` 可执行文件。

## 解决方案

### 方案 1：全局安装 Vite
```bash
npm install -g vite
```

### 方案 2：使用 npx 运行本地 Vite
修改 `wails.json` 配置文件，让 Wails 使用项目本地的 Vite：

```json
{
  "frontend": {
    "dev": "npx vite",
    "build": "npx vite build"
  }
}
```

### 方案 3：确保 node_modules/.bin 在 PATH 中
将项目的 node_modules/.bin 目录添加到环境变量中：

```bash
export PATH=$PATH:./node_modules/.bin
```

## 建议
推荐使用方案 1 或方案 2，这两种方法比较可靠且易于实施。

## 测试
修复后，重新运行 `wails dev` 命令，应该可以成功启动开发服务器。
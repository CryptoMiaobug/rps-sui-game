# 部署指南

## GitHub Pages 部署

### 方法 1: 使用 GitHub Actions（推荐）

1. 将代码推送到 GitHub 仓库

2. 在仓库设置中启用 GitHub Pages:
   - 进入 Settings > Pages
   - Source 选择 "GitHub Actions"

3. 推送代码到 main 分支，GitHub Actions 会自动构建和部署

4. 访问 `https://<username>.github.io/<repo-name>/`

### 方法 2: 手动部署

1. 构建项目:
```bash
npm run build
```

2. 将 `dist/` 目录内容推送到 `gh-pages` 分支:
```bash
# 安装 gh-pages
npm install -D gh-pages

# 添加部署脚本到 package.json
"scripts": {
  "deploy": "gh-pages -d dist"
}

# 部署
npm run deploy
```

3. 在仓库设置中:
   - Settings > Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "gh-pages" / (root)

## Vercel 部署

1. 导入 GitHub 仓库到 Vercel

2. 构建设置:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. 部署完成后会获得一个 `.vercel.app` 域名

## Netlify 部署

1. 导入 GitHub 仓库到 Netlify

2. 构建设置:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. 部署完成后会获得一个 `.netlify.app` 域名

## 自定义域名

部署后可以在平台设置中绑定自定义域名。

## 环境变量

本项目不需要环境变量，所有合约地址都硬编码在 `src/constants/index.ts` 中。

如需修改合约地址，直接编辑该文件后重新构建即可。

## 注意事项

- 确保使用 HashRouter（已配置）以支持 GitHub Pages 的静态路由
- base 路径设置为 `./` 以支持子目录部署（已配置）
- 所有资源使用相对路径

# 发布到 GitHub 指南

## ✅ 已完成的安全检查

### 1. 数据脱敏
- [x] 代码中无硬编码的 App ID / App Secret
- [x] 环境变量通过 `os.getenv()` 读取
- [x] 提供了 `.env.example` 模板（不含真实凭证）
- [x] `.gitignore` 已配置忽略 `.env` 和 `.clawhub/`

### 2. 文档完善
- [x] SKILL.md - 详细的使用说明和配置指南
- [x] README.md - GitHub 展示用简介
- [x] LICENSE - MIT 许可证
- [x] .env.example - 配置模板

### 3. CI 配置
- [x] GitHub Actions 工作流 - 语法检查和密钥扫描

---

## 📤 发布步骤

### 第一步：创建 GitHub 仓库

1. 登录 GitHub → 点击右上角 "+" → "New repository"
2. 填写信息：
   - Repository name: `bitable-attachment-uploader`
   - Description: "飞书多维表格附件上传工具 - 支持单文件/多文件上传"
   - Public（推荐，方便分享）
   - 不勾选 "Add a README"（我们已有）
3. 点击 "Create repository"

### 第二步：初始化本地仓库并推送

```bash
cd ~/.openclaw/skills/bitable-attachment-uploader

# 初始化 git（如果还没初始化）
git init

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/YOUR_USERNAME/bitable-attachment-uploader.git

# 添加所有文件（.gitignore 中配置的文件会被自动忽略）
git add .

# 提交
git commit -m "Initial commit: bitable attachment uploader skill

Features:
- Single and multi-file upload support
- Append mode (preserve existing attachments)
- Interactive and CLI modes
- Complete documentation

Co-authored-by: 虾虾猫 🐈‍⬛"

# 推送
git push -u origin main
```

### 第三步：验证发布

1. 访问 `https://github.com/YOUR_USERNAME/bitable-attachment-uploader`
2. 检查文件列表：
   - ✅ 应该有：README.md, SKILL.md, LICENSE, scripts/, .github/
   - ✅ 不应该有：.env, .clawhub/
3. 检查 README 渲染是否正常
4. 检查 Actions 是否运行成功

### 第四步：打标签（可选但推荐）

```bash
# 打版本标签
git tag -a v1.0.0 -m "Release v1.0.0 - Multi-file upload support"
git push origin v1.0.0
```

---

## 🔧 用户使用说明（发布后）

其他 OpenClaw 用户安装时：

```bash
# 通过 GitHub 安装
openclaw skills install https://github.com/YOUR_USERNAME/bitable-attachment-uploader

# 配置环境变量
# 编辑 ~/.openclaw/settings.json，添加：
{
  "skills": {
    "entries": {
      "bitable-attachment-uploader": {
        "env": {
          "FEISHU_APP_ID": "cli_xxx",
          "FEISHU_APP_SECRET": "xxx"
        }
      }
    }
  }
}
```

---

## 📝 后续维护

### 更新版本

```bash
# 修改代码后
git add .
git commit -m "feat: add xxx feature"
git push

# 打新标签
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

### 安全提醒

- **永远不要提交 `.env` 文件**
- **定期轮换 App Secret**
- **使用 GitHub Secrets 存储 CI 所需的凭证**（如果有自动化测试）

---

**当前技能版本**: 1.0.0  
**最后更新**: 2026-03-23

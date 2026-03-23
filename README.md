# Bitable Attachment Uploader

📎 飞书多维表格附件上传工具 - 支持单文件/多文件上传，自动追加模式。

## 功能特性

- ✅ **单文件上传** - 快速上传单个附件
- ✅ **多文件批量上传** - 一次上传多个文件
- ✅ **智能追加模式** - 自动保留已有附件，不覆盖
- ✅ **交互式引导** - 无需记忆参数，逐步选择
- ✅ **命令行支持** - 脚本化集成，CI/CD 友好

## 快速开始

### 安装

```bash
# 通过 OpenClaw 安装
openclaw skills install bitable-attachment-uploader

# 或手动克隆
git clone https://github.com/yourusername/bitable-attachment-uploader.git
cd bitable-attachment-uploader
```

### 配置

1. 在飞书开放平台创建应用，获取 `App ID` 和 `App Secret`
2. 添加权限：`bitable:app`、`docs:document.media:upload`
3. 配置环境变量：

```bash
export FEISHU_APP_ID="cli_xxxxxxxxxxxx"
export FEISHU_APP_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 使用

**单文件上传：**
```bash
python3 scripts/upload.py \
  OfLUbtggbaa7zgsWVN0cuosnnLC \
  tblNuJFffM8Kw3TA \
  recvecptPytYCc \
  图片附件 \
  /path/to/photo.png
```

**多文件追加：**
```bash
python3 scripts/upload.py \
  OfLUbtggbaa7zgsWVN0cuosnnLC \
  tblNuJFffM8Kw3TA \
  recvecptPytYCc \
  图片附件 \
  /tmp/a.png /tmp/b.png /tmp/c.pdf
```

## 文档

详见 [SKILL.md](./SKILL.md)

## 贡献

欢迎 PR！请确保：
- 代码通过语法检查
- 不提交敏感信息（App ID、Secret 等）
- 更新相关文档

## License

MIT

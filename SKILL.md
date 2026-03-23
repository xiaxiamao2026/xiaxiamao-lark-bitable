---
name: bitable-attachment-uploader
description: 将本地文件上传到飞书多维表格的附件字段。支持交互式引导选择（表格/数据表/附件字段/记录）和快速参数模式。使用场景：需要将图片、PDF等文件上传到多维表格附件字段时。
metadata: { "openclaw": { "emoji": "📎", "requires": { "bins": ["python3"], "env": ["FEISHU_APP_ID", "FEISHU_APP_SECRET"] }, "primaryEnv": "FEISHU_APP_ID" } }
---

# 飞书多维表格附件上传

将本地文件（图片、PDF等）上传到飞书多维表格的附件字段。

---

## 🎯 核心功能

- **交互式引导**：逐步选择表格 → 数据表 → 附件字段 → 记录 → 上传文件
- **快速上传**：直接提供 `appToken` `tableId` `recordId` `fieldName` `filePath` 五个参数
- **自动检测**：智能识别附件字段（type=17）
- **Token 管理**：自动处理 token 过期和刷新
- **完整错误处理**：明确的错误提示和异常捕获

---

## 📦 前置配置

### 1. 飞书应用凭证（必须）

本技能需要飞书开放平台应用的 `App ID` 和 `App Secret`。

**方式一：OpenClaw 配置（推荐）**

在 OpenClaw 的 `settings.json` 中添加：

```json
{
  "skills": {
    "entries": {
      "bitable-attachment-uploader": {
        "env": {
          "FEISHU_APP_ID": "cli_xxxxxxxxxxxx",
          "FEISHU_APP_SECRET": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        }
      }
    }
  }
}
```

**方式二：环境变量**

```bash
export FEISHU_APP_ID="cli_xxxxxxxxxxxx"
export FEISHU_APP_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**方式三：.env 文件**

复制 `.env.example` 为 `.env` 并填入凭证：

```bash
cp .env.example .env
# 编辑 .env 文件填入你的 App ID 和 App Secret
```

### 2. 飞书应用权限（必须）

在飞书开放平台（https://open.feishu.cn/app）确保你的应用有以下权限：

| 权限 | 用途 |
|------|------|
| `bitable:app` | 访问多维表格 |
| `docs:document.media:upload` | 上传附件到素材库 |

**配置步骤：**
1. 登录飞书开放平台 → 你的应用 → 权限管理
2. 搜索并添加上述权限
3. 发布版本或申请测试企业授权

### 3. 验证配置

运行以下命令验证凭证是否正确：

```bash
python3 -c "
import os, requests
app_id = os.getenv('FEISHU_APP_ID')
app_secret = os.getenv('FEISHU_APP_SECRET')
if not app_id or not app_secret:
    print('❌ 环境变量未设置')
else:
    resp = requests.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        json={'app_id': app_id, 'app_secret': app_secret})
    print('✅ Token 获取成功' if resp.json().get('code') == 0 else f'❌ 错误: {resp.json().get(\"msg\")}')
"
```

---

## 🚀 使用方法

### 快速模式（单文件）

提供五个参数直接上传单个文件：

```
"上传文件到多维表格：appToken=abc tableId=def recordId=123 fieldName=附件 filePath=/path/to/photo.png"
```

### 快速模式（多文件追加）

提供多个文件路径，自动启用追加模式（保留已有附件）：

```
"上传多个文件到多维表格：appToken=abc tableId=def recordId=123 fieldName=图片附件 filePaths=/tmp/a.png /tmp/b.pdf /tmp/c.jpg"
```

### 交互式模式

直接让我运行上传操作，我会引导你完成：

```
"使用多维表格附件上传功能"
```

我会依次询问：
1. 选择目标多维表格应用
2. 选择数据表
3. 选择附件字段
4. 选择记录（支持输入记录 ID）
5. 输入本地文件路径（支持多个）
6. 自动上传并更新记录

### upload.py 命令行

```bash
# 单文件（覆盖模式，兼容旧版）
python3 scripts/upload.py <app_token> <table_id> <record_id> <field_name> <file_path>

# 单文件追加
python3 scripts/upload.py <app_token> <table_id> <record_id> <field_name> <file_path> --append

# 多文件（自动追加模式）
python3 scripts/upload.py <app_token> <table_id> <record_id> <field_name> <file1> <file2> <file3>
```

---

## 📊 技术实现

基于飞书开放 API：
- `GET /bitable/v1/apps` - 列出多维表格
- `GET /bitable/v1/apps/{app_token}/tables` - 列出数据表
- `GET /bitable/v1/apps/{app_token}/tables/{table_id}/fields` - 列出字段
- `GET /bitable/v1/apps/{app_token}/tables/{table_id}/records` - 列出记录
- `POST /drive/v1/medias/upload_all` - 上传文件（parent_type=bitable_image）
- `PUT /bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}` - 更新记录附件字段

底层脚本：`scripts/upload.py`

---

## ⚠️ 注意事项

- **文件路径必须是绝对路径**
- **大文件上传需要较长时间**（受网络带宽影响）
- 附件字段类型必须是 `17`（附件）才能被识别
- 环境变量 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET` 必须正确配置
- 如果 token 过期会自动刷新，如持续失败请检查应用状态

---

## 🐛 常见错误处理

| 错误 | 原因 | 处理 |
|------|------|------|
| `403 Forbidden` | 应用权限不足 | 检查飞书后台权限配置 |
| `404 Not Found` | appToken/tableId/recordId 不存在 | 确认参数正确 |
| `文件不存在` | 路径错误或权限不足 | 使用绝对路径，确保可读 |
| `Token 过期` | app token 失效 | 自动刷新，如频繁失败需重新授权应用 |
| `字段类型不匹配` | 选择的字段不是附件类型 | 确认字段 type=17 |

---

## 📝 示例对话

**用户**: "我想上传一张图片到多维表格"
**我**: "好的，进入交互式模式。请选择：\n1. 项目资料表 (app_abc)\n2. 设计素材库 (app_def)\n请回复数字选择表格。"

**用户**: "上传文件：appToken=app123 tableId=tbl456 recordId=rec789 fieldName=附件 filePath=/home/user/photo.png"
**我**: "正在上传... ✅ 上传成功！file_token: xxxx"

---

## 🔧 开发者说明

- 技能类型：标准 OpenClaw Skill
- 实现语言：Python 3
- 主要脚本：`scripts/upload.py`
- 依赖：`requests` (自动处理)
- 输出格式：JSON（成功返回更新后的记录）

---

**Skill Version**: 1.0.0 (OpenClaw compatible)  
**Created**: 2026-03-21  
**Maintainer**: 面老师 & 虾虾猫 🐈‍⬛

# 🚀 bitable-upload

Node.js CLI tool for uploading attachments to Lark Bitable multidimensional tables

## 📦 **安装**

```bash
# 全局安装（推荐）
npm install -g bitable-upload

# 或作为项目依赖
npm install bitable-upload --save
```

## 🎯 **使用方法**

### 1. 交互式模式（推荐）
```bash
bitable-upload
```

### 2. 快速上传模式
```bash
bitable-upload <appToken> <tableId> <recordId> <fieldName> <filePath>
```

### 3. 查看帮助
```bash
bitable-upload --help
```

### 4. 获取版本信息
```bash
bitable-upload --version
```

## ✨ **功能特性**

- **智能发现** - 自动列出多维表格、数据表和附件字段
- **通用上传** - 支持图片、PDF等任意文件类型
- **批量处理** - 支持多文件批量上传
- **错误重试** - 自动重试失败的任务
- **Token管理** - 自动处理Token过期和刷新

## 🔧 **配置**

### 环境变量配置
```bash
# Lark应用凭证（必需）
export LARK_APP_ID="cli_your_app_id"
export LARK_APP_SECRET="your_app_secret"

# 可选：设置默认参数
export LARK_DEFAULT_APP_TOKEN="your_default_app_token"
export LARK_DEFAULT_TABLE_ID="your_default_table_id"
```

## 🎯 **使用示例**

### 交互式上传流程
```
$ bitable-upload

🚀 开始多维表格附件上传流程

📋 正在获取多维表格列表...
📋 可用的多维表格:
1. 项目管理表 (app_a1b2c3d4e5f6g7h8)
2. 资产登记表 (app_i9j0k1l2m3n4o5p6)
3. 产品资料库 (app_q7r8s9t0u1v2w3x4)

请选择表格编号 (1-3): 1
✅ 已选择表格: 项目管理表

🗂️  正在获取数据表列表...
🗂️  数据表列表:
1. 项目附件 (table_1a2b3c4d5e6f7g8h)
2. 团队资料 (table_9i0j1k2l3m4n5o6p)

请选择数据表编号 (1-2): 1
✅ 已选择数据表: 项目附件

🔍 正在获取字段列表...
📎 附件字段列表:
1. 设计稿 (field_design)
2. 需求文档 (field_requirements)

请选择附件字段编号 (1-2): 1
✅ 已选择附件字段: 设计稿

📝 正在获取记录列表...
📝 记录列表 (前20条):
1. 移动端UI设计 (rec_1a2b3c4d5e)
2. 后台管理系统 (rec_6f7g8h9i0j)
3. 数据可视化大屏 (rec_k1l2m3n4o5)

请选择记录编号 (1-20) 或输入记录ID: 1
✅ 已选择记录: rec_1a2b3c4d5e

📁 请输入要上传的图片文件路径: /tmp/design_mockup.png
📤 正在上传图片: /tmp/design_mockup.png...
✅ 文件上传成功: file_x1y2z3a4b5c6d7e8f9

🔄 正在更新记录附件字段...
🎉 附件上传完成！
📎 记录ID: rec_1a2b3c4d5e
📄 字段: 设计稿
🖼️  附件: file_x1y2z3a4b5c6d7e8f9
```

### 快速上传
```bash
bitable-upload app_a1b2c3d4e5f6g7h8 table_1a2b3c4d5e6f7g8h rec_1a2b3c4d5e "设计稿" /tmp/design.png
```

## 📋 **API使用**

```javascript
const FeishuBitableAttachmentUploader = require('bitable-upload');

// 创建上传器
const uploader = new FeishuBitableAttachmentUploader(
  'your_app_id',
  'your_app_secret'
);

// 快速上传
await uploader.quickUpload({
  appToken: 'your_app_token',
  tableId: 'your_table_id',
  recordId: 'your_record_id',
  fieldName: '附件字段名',
  filePath: '/path/to/image.png',
  customName: 'custom_name.png' // 可选
});

// 交互式上传
await uploader.interactiveUpload();
```

## 📄 **许可证**
MIT License

## 🤝 **贡献**
欢迎提交Issue和Pull Request

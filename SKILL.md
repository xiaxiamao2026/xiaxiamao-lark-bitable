# 🚀 bitable-upload Skill

## 🎯 **技能概述**
bitable-upload 是Node.js CLI工具，用于上传附件到Lark多维表格，支持任意多维表格的附件字段上传操作。

## 📋 **功能特性**

### 🔍 **智能发现**
- **自动发现** - 列出所有多维表格应用
- **字段识别** - 智能识别附件字段（支持多附件字段）
- **记录定位** - 准确找到目标记录（支持记录ID和序号）

### 📤 **通用上传**
- **多文件类型** - 支持图片、PDF、文档等任意文件
- **自动类型检测** - 根据文件扩展名自动选择上传类型
- **大文件支持** - 支持分片上传（大文件自动处理）

### 🔄 **批量处理**
- **批量上传** - 支持多文件批量上传
- **记录批量更新** - 支持多记录同时更新
- **进度显示** - 实时显示上传进度

### 🛡️ **企业级特性**
- **错误重试** - 自动重试失败的任务
- **Token管理** - 自动处理Token过期和刷新
- **权限验证** - 完整的权限检查和错误提示
- **日志记录** - 详细的操作日志和错误追踪

## 🚀 **快速开始**

### 📦 **安装**
```bash
npm install -g bitable-upload
```

### 🔧 **配置环境变量**
```bash
# Lark应用凭证（必需）
export LARK_APP_ID="cli_your_app_id"
export LARK_APP_SECRET="your_app_secret"

# 可选：设置默认参数
export LARK_DEFAULT_APP_TOKEN="your_default_app_token"
export LARK_DEFAULT_TABLE_ID="your_default_table_id"
```

### 🎯 **使用方式**
```bash
# 交互式模式
bitable-upload

# 快速上传模式
bitable-upload <appToken> <tableId> <recordId> <fieldName> <filePath>
```

## 🎯 **基本使用流程**
1. 获取多维表格列表
2. 选择目标表格和记录
3. 识别附件字段
4. 上传本地图片
5. 更新表格记录

## 🔧 **核心工具**

### 1️⃣ **列出多维表格**
```typescript
// 列出用户所有的多维表格
const apps = await feishu_bitable_app.list({
  page_size: 50,
  page_token: ""
});

// 返回结果
{
  "apps": [
    {
      "token": "app_token_1",
      "name": "表格1",
      "url": "https://my.feishu.cn/base/app_token_1"
    },
    // ...
  ]
}
```

### 2️⃣ **获取表格信息**
```typescript
// 获取特定表格的详细信息
const app = await feishu_bitable_app.get({
  app_token: "your_app_token"
});
```

### 3️⃣ **获取数据表列表**
```typescript
// 获取表格内的所有数据表
const tables = await feishu_bitable_app_table.list({
  app_token: "your_app_token",
  page_size: 20
});
```

### 4️⃣ **获取字段信息**
```typescript
// 获取数据表的所有字段
const fields = await feishu_bitable_app_table_field.list({
  app_token: "your_app_token",
  table_id: "your_table_id",
  page_size: 50
});

// 识别附件字段（type=17）
const attachmentFields = fields.filter(f => f.type === 17);
```

### 5️⃣ **获取记录列表**
```typescript
// 获取数据表的记录
const records = await feishu_bitable_app_table_record.list({
  app_token: "your_app_token",
  table_id: "your_table_id",
  page_size: 50
});
```

### 6️⃣ **上传图片到飞书**
```typescript
// 上传本地图片获取file_token
const uploadResult = await feishu_drive_file.upload({
  file_path: "/path/to/your/image.png",
  name: "custom_name.png",
  parent_type: "bitable_image", // 重要：必须是bitable_image或bitable_file
  parent_node: "your_app_token" // 重要：必须是多维表格的app_token
});

// 返回file_token
{
  "file_token": "your_file_token"
}
```

### 7️⃣ **更新记录附件字段**
```typescript
// 更新记录的附件字段
const updateResult = await feishu_bitable_app_table_record.update({
  app_token: "your_app_token",
  table_id: "your_table_id",
  record_id: "your_record_id",
  fields: {
    "附件字段名": [
      {
        "file_token": "your_file_token"
      }
    ]
  }
});
```

## 📋 **完整示例流程**

### 🎯 **场景：上传图片到指定记录**

```typescript
// 步骤1: 列出所有多维表格
const apps = await feishu_bitable_app.list({});

// 步骤2: 选择目标表格
const targetApp = apps.apps.find(a => a.name.includes("目标表格"));
if (!targetApp) throw new Error("表格未找到");

// 步骤3: 获取数据表
const tables = await feishu_bitable_app_table.list({
  app_token: targetApp.token
});
const targetTable = tables.tables[0]; // 选择第一个表

// 步骤4: 获取附件字段
const fields = await feishu_bitable_app_table_field.list({
  app_token: targetApp.token,
  table_id: targetTable.table_id
});
const attachmentField = fields.find(f => f.type === 17);
if (!attachmentField) throw new Error("未找到附件字段");

// 步骤5: 获取目标记录
const records = await feishu_bitable_app_table_record.list({
  app_token: targetApp.token,
  table_id: targetTable.table_id
});
const targetRecord = records.records[0]; // 选择第一条记录

// 步骤6: 上传图片
const uploadResult = await feishu_drive_file.upload({
  file_path: "/tmp/image.png",
  name: "uploaded_image.png",
  parent_type: "bitable_image",
  parent_node: targetApp.token
});

// 步骤7: 更新记录
const updateResult = await feishu_bitable_app_table_record.update({
  app_token: targetApp.token,
  table_id: targetTable.table_id,
  record_id: targetRecord.record_id,
  fields: {
    [attachmentField.field_name]: [
      {
        "file_token": uploadResult.file_token
      }
    ]
  }
});

console.log("✅ 附件上传成功！");
```

## 🔑 **关键参数说明**

### 📤 **上传参数**
- **parent_type**: 
  - `bitable_image` - 图片上传
  - `bitable_file` - 文件上传
- **parent_node**: 必须使用多维表格的 `app_token`
- **file_path**: 本地文件的绝对路径
- **name**: 自定义文件名（可选）

### 🔄 **更新参数**
- **fields**: 对象格式，键为字段名，值为数组
- **附件格式**: `[{ "file_token": "..." }]`
- **多附件**: 支持多个file_token对象

## 🛡️ **权限要求**
- `bitable:app` - 多维表格访问
- `docs:document.media:upload` - 素材上传
- `drive:drive` - 文件管理

## 💡 **最佳实践**

### 🔍 **调试建议**
1. 先列出所有表格确认目标
2. 检查字段类型确保是附件字段
3. 验证上传权限
4. 测试小文件上传

### 🚀 **自动化集成**
- 支持批量处理多个记录
- 可以集成到定时任务
- 支持错误重试机制

## 📞 **故障排除**
- **403错误**: 权限不足，需要授权
- **404错误**: 表格或记录不存在
- **1062009错误**: 文件大小不匹配
- **TextFieldConvFail**: 字段类型不匹配

## 🎯 **应用场景**
- 📊 **数据管理**: 批量上传附件到数据表
- 🎨 **素材管理**: 创意素材的集中管理
- 📋 **项目管理**: 项目文档和附件管理
- 🏷️ **资产管理**: 企业资产照片管理

---

**技能版本**: v1.3.0  
**最后更新**: 2026年3月17日

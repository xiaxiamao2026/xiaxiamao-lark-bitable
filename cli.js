#!/usr/bin/env node

/**
 * 飞书多维表格附件上传工具 - 命令行接口
 * 
 * 使用方式:
 * 
 * 1. 交互式模式:
 *    feishu-bitable-upload
 *    
 * 2. 快速上传模式:
 *    feishu-bitable-upload <appToken> <tableId> <recordId> <fieldName> <filePath> [customName]
 *    
 * 3. 环境变量配置:
 *    export FEISHU_APP_ID="cli_xxx"
 *    export FEISHU_APP_SECRET="xxx"
 */

const FeishuBitableAttachmentUploader = require('./index.js');

// 检查环境变量
function checkEnvVars() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('❌ 请设置环境变量:');
    console.error('   export FEISHU_APP_ID="your_app_id"');
    console.error('   export FEISHU_APP_SECRET="your_app_secret"');
    process.exit(1);
  }

  return { appId, appSecret };
}

// 显示帮助信息
function showHelp() {
  console.log(`
🚀 飞书多维表格附件上传工具

使用方式:
  feishu-bitable-upload                    # 交互式模式
  feishu-bitable-upload --help            # 显示帮助
  feishu-bitable-upload --version         # 显示版本

快速上传模式:
  feishu-bitable-upload <appToken> <tableId> <recordId> <fieldName> <filePath> [customName]

环境变量:
  FEISHU_APP_ID       飞书应用ID (必需)
  FEISHU_APP_SECRET   飞书应用密钥 (必需)

示例:
  # 交互式上传
  export FEISHU_APP_ID="cli_xxx"
  export FEISHU_APP_SECRET="xxx"
  feishu-bitable-upload

  # 快速上传
  feishu-bitable-upload app_token table_id record_id "附件字段" /path/to/image.png

选项:
  --help      显示帮助信息
  --version   显示版本信息
  --debug     调试模式
`);
}

// 显示版本信息
function showVersion() {
  const pkg = require('./package.json');
  console.log(`v${pkg.version}`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  // 处理命令行参数
  if (args.length === 0) {
    // 交互式模式
    const { appId, appSecret } = checkEnvVars();
    const uploader = new FeishuBitableAttachmentUploader(appId, appSecret);
    await uploader.interactiveUpload();
  } else if (args[0] === '--help' || args[0] === '-h') {
    showHelp();
  } else if (args[0] === '--version' || args[0] === '-v') {
    showVersion();
  } else if (args[0] === '--debug') {
    // 调试模式
    const { appId, appSecret } = checkEnvVars();
    const uploader = new FeishuBitableAttachmentUploader(appId, appSecret);
    
    // 获取并显示所有表格
    const apps = await uploader.listBitableApps();
    console.log('📋 所有多维表格:');
    console.log(JSON.stringify(apps, null, 2));
  } else if (args.length >= 5) {
    // 快速上传模式
    const { appId, appSecret } = checkEnvVars();
    const uploader = new FeishuBitableAttachmentUploader(appId, appSecret);

    const options = {
      appToken: args[0],
      tableId: args[1],
      recordId: args[2],
      fieldName: args[3],
      filePath: args[4],
      customName: args[5]
    };

    console.log('🚀 快速上传模式');
    console.log(`📊 表格: ${options.appToken}`);
    console.log(`🗂️  数据表: ${options.tableId}`);
    console.log(`📝 记录: ${options.recordId}`);
    console.log(`📎 字段: ${options.fieldName}`);
    console.log(`📁 文件: ${options.filePath}`);

    await uploader.quickUpload(options);
  } else {
    console.error('❌ 参数不足，请查看帮助:');
    console.error('   feishu-bitable-upload --help');
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('❌ 程序执行失败:', error);
  process.exit(1);
});
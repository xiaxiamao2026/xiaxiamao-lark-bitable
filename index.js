#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 飞书API基础配置
const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis';

class FeishuBitableAttachmentUploader {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.tenantAccessToken = null;
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken() {
    try {
      const response = await axios.post(
        `${FEISHU_API_BASE}/auth/v3/tenant_access_token/internal`,
        {
          app_id: this.appId,
          app_secret: this.appSecret
        }
      );
      
      this.tenantAccessToken = response.data.tenant_access_token;
      console.log('✅ 访问令牌获取成功');
      return this.tenantAccessToken;
    } catch (error) {
      console.error('❌ 获取访问令牌失败:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 请求封装
   */
  async request(method, url, data = null, headers = {}) {
    if (!this.tenantAccessToken) {
      await this.getAccessToken();
    }

    const config = {
      method,
      url: `${FEISHU_API_BASE}${url}`,
      headers: {
        'Authorization': `Bearer ${this.tenantAccessToken}`,
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      // 处理401错误，尝试重新获取token
      if (error.response?.status === 401) {
        console.log('🔄 Token过期，重新获取...');
        await this.getAccessToken();
        config.headers['Authorization'] = `Bearer ${this.tenantAccessToken}`;
        return await axios(config);
      }
      
      throw error;
    }
  }

  /**
   * 列出多维表格应用
   */
  async listBitableApps(pageSize = 50, pageToken = '') {
    console.log('📋 正在获取多维表格列表...');
    
    const params = new URLSearchParams({
      page_size: pageSize.toString()
    });
    
    if (pageToken) {
      params.append('page_token', pageToken);
    }

    const response = await this.request(
      'GET',
      `/bitable/v1/apps?${params.toString()}`
    );

    return response;
  }

  /**
   * 获取表格详情
   */
  async getBitableApp(appToken) {
    console.log(`📊 正在获取表格详情: ${appToken}...`);
    
    const response = await this.request(
      'GET',
      `/bitable/v1/apps/${appToken}`
    );

    return response;
  }

  /**
   * 列出数据表
   */
  async listTables(appToken, pageSize = 20, pageToken = '') {
    console.log(`🗂️  正在获取数据表列表...`);
    
    const params = new URLSearchParams({
      page_size: pageSize.toString()
    });
    
    if (pageToken) {
      params.append('page_token', pageToken);
    }

    const response = await this.request(
      'GET',
      `/bitable/v1/apps/${appToken}/tables?${params.toString()}`
    );

    return response;
  }

  /**
   * 列出字段
   */
  async listFields(appToken, tableId, pageSize = 50, pageToken = '') {
    console.log(`🔍 正在获取字段列表...`);
    
    const params = new URLSearchParams({
      page_size: pageSize.toString()
    });
    
    if (pageToken) {
      params.append('page_token', pageToken);
    }

    const response = await this.request(
      'GET',
      `/bitable/v1/apps/${appToken}/tables/${tableId}/fields?${params.toString()}`
    );

    return response;
  }

  /**
   * 列出记录
   */
  async listRecords(appToken, tableId, pageSize = 50, pageToken = '') {
    console.log(`📝 正在获取记录列表...`);
    
    const params = new URLSearchParams({
      page_size: pageSize.toString()
    });
    
    if (pageToken) {
      params.append('page_token', pageToken);
    }

    const response = await this.request(
      'GET',
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params.toString()}`
    );

    return response;
  }

  /**
   * 上传图片文件
   */
  async uploadImage(filePath, appToken, customName = null) {
    console.log(`📤 正在上传图片: ${filePath}...`);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    // 获取文件信息
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const fileName = customName || path.basename(filePath);

    // 使用FormData上传
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file_name', fileName);
    form.append('parent_type', 'bitable_image');
    form.append('parent_node', appToken);
    form.append('size', fileSize.toString());
    form.append('file', fs.createReadStream(filePath), {
      filename: fileName,
      contentType: 'image/png'
    });

    const response = await this.request(
      'POST',
      `/drive/v1/medias/upload_all`,
      form,
      {
        'Content-Type': `multipart/form-data; boundary=${form._boundary}`
      }
    );

    // 提取file_token
    if (response.code === 0 && response.data && response.data.file_token) {
      return {
        file_token: response.data.file_token,
        ...response
      };
    }
    
    throw new Error(`文件上传失败: ${response.msg || '未知错误'}`);
  }

  /**
   * 更新记录附件字段
   */
  async updateRecordAttachment(appToken, tableId, recordId, fieldName, fileToken) {
    console.log(`🔄 正在更新记录附件字段...`);
    
    // 构建请求数据
    const requestData = {
      fields: {
        [fieldName]: [
          {
            file_token: fileToken
          }
        ]
      }
    };

    const response = await this.request(
      'PATCH',
      `/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
      requestData
    );

    return response;
  }

  /**
   * 查找附件字段
   */
  findAttachmentFields(fields) {
    return fields.filter(field => field.type === 17); // 17 = 附件字段
  }

  /**
   * 交互式选择表格
   */
  async selectBitableApp() {
    const apps = await this.listBitableApps();
    
    if (apps.apps.length === 0) {
      throw new Error('没有找到多维表格应用');
    }

    console.log('\n📋 可用的多维表格:');
    apps.apps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.name} (${app.token})`);
    });

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question('\n请选择表格编号 (1-' + apps.apps.length + '): ', async (answer) => {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < apps.apps.length) {
          readline.close();
          resolve(apps.apps[index]);
        } else {
          console.log('❌ 无效的选择');
          readline.close();
          resolve(await this.selectBitableApp());
        }
      });
    });
  }

  /**
   * 交互式选择数据表
   */
  async selectTable(appToken) {
    const tables = await this.listTables(appToken);
    
    if (tables.tables.length === 0) {
      throw new Error('没有找到数据表');
    }

    console.log('\n🗂️  数据表列表:');
    tables.tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name} (${table.table_id})`);
    });

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question('\n请选择数据表编号 (1-' + tables.tables.length + '): ', async (answer) => {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < tables.tables.length) {
          readline.close();
          resolve(tables.tables[index]);
        } else {
          console.log('❌ 无效的选择');
          readline.close();
          resolve(await this.selectTable(appToken));
        }
      });
    });
  }

  /**
   * 交互式选择附件字段
   */
  async selectAttachmentField(appToken, tableId) {
    const fields = await this.listFields(appToken, tableId);
    const attachmentFields = this.findAttachmentFields(fields.fields);
    
    if (attachmentFields.length === 0) {
      throw new Error('没有找到附件字段');
    }

    console.log('\n📎 附件字段列表:');
    attachmentFields.forEach((field, index) => {
      console.log(`${index + 1}. ${field.field_name} (${field.field_id})`);
    });

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question('\n请选择附件字段编号 (1-' + attachmentFields.length + '): ', async (answer) => {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < attachmentFields.length) {
          readline.close();
          resolve(attachmentFields[index]);
        } else {
          console.log('❌ 无效的选择');
          readline.close();
          resolve(await this.selectAttachmentField(appToken, tableId));
        }
      });
    });
  }

  /**
   * 交互式选择记录
   */
  async selectRecord(appToken, tableId) {
    const records = await this.listRecords(appToken, tableId);
    
    if (records.records.length === 0) {
      throw new Error('没有找到记录');
    }

    console.log('\n📝 记录列表 (前20条):');
    records.records.slice(0, 20).forEach((record, index) => {
      const title = record.fields['标题'] || record.fields['名称'] || `记录${record.record_id}`;
      console.log(`${index + 1}. ${Array.isArray(title) ? title[0]?.text || title[0] : title} (${record.record_id})`);
    });

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      readline.question('\n请选择记录编号 (1-' + Math.min(20, records.records.length) + ') 或输入记录ID: ', async (answer) => {
        readline.close();
        
        // 检查是否是记录ID
        if (answer.length > 20) {
          const record = records.records.find(r => r.record_id === answer);
          if (record) {
            resolve(record);
          } else {
            console.log('❌ 未找到该记录ID');
            return await this.selectRecord(appToken, tableId);
          }
        } else {
          const index = parseInt(answer) - 1;
          if (index >= 0 && index < Math.min(20, records.records.length)) {
            resolve(records.records[index]);
          } else {
            console.log('❌ 无效的选择');
            return await this.selectRecord(appToken, tableId);
          }
        }
      });
    });
  }

  /**
   * 完整交互式上传流程
   */
  async interactiveUpload() {
    try {
      console.log('🚀 开始多维表格附件上传流程\n');

      // 步骤1: 选择多维表格
      const selectedApp = await this.selectBitableApp();
      console.log(`✅ 已选择表格: ${selectedApp.name}\n`);

      // 步骤2: 选择数据表
      const selectedTable = await this.selectTable(selectedApp.token);
      console.log(`✅ 已选择数据表: ${selectedTable.name}\n`);

      // 步骤3: 选择附件字段
      const selectedField = await this.selectAttachmentField(selectedApp.token, selectedTable.table_id);
      console.log(`✅ 已选择附件字段: ${selectedField.field_name}\n`);

      // 步骤4: 选择记录
      const selectedRecord = await this.selectRecord(selectedApp.token, selectedTable.table_id);
      console.log(`✅ 已选择记录: ${selectedRecord.record_id}\n`);

      // 步骤5: 输入文件路径
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const filePath = await new Promise((resolve) => {
        readline.question('📁 请输入要上传的图片文件路径: ', (answer) => {
          readline.close();
          resolve(answer.trim());
        });
      });

      // 步骤6: 上传文件
      const uploadResult = await this.uploadImage(filePath, selectedApp.token);
      console.log(`✅ 文件上传成功: ${uploadResult.file_token}\n`);

      // 步骤7: 更新记录
      const updateResult = await this.updateRecordAttachment(
        selectedApp.token,
        selectedTable.table_id,
        selectedRecord.record_id,
        selectedField.field_name,
        uploadResult.file_token
      );

      console.log('🎉 附件上传完成！');
      console.log(`📎 记录ID: ${updateResult.record.record_id}`);
      console.log(`📄 字段: ${selectedField.field_name}`);
      console.log(`🖼️  附件: ${uploadResult.file_token}`);

      return updateResult;

    } catch (error) {
      console.error('❌ 上传过程中出错:', error.message);
      throw error;
    }
  }

  /**
   * 快速上传（非交互式）
   */
  async quickUpload(options) {
    const {
      appToken,
      tableId,
      recordId,
      fieldName,
      filePath,
      customName
    } = options;

    try {
      console.log('🚀 开始快速上传流程');

      // 上传图片
      const uploadResult = await this.uploadImage(filePath, appToken, customName);
      console.log(`✅ 文件上传成功: ${uploadResult.file_token}`);

      // 更新记录
      const updateResult = await this.updateRecordAttachment(
        appToken,
        tableId,
        recordId,
        fieldName,
        uploadResult.file_token
      );

      console.log('🎉 快速上传完成！');
      return updateResult;

    } catch (error) {
      console.error('❌ 快速上传出错:', error.message);
      throw error;
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  
  // 检查是否是快速模式
  if (args.length >= 5) {
    // 快速模式: node script.js appToken tableId recordId fieldName filePath [customName]
    const uploader = new FeishuBitableAttachmentUploader(
      process.env.FEISHU_APP_ID,
      process.env.FEISHU_APP_SECRET
    );

    const options = {
      appToken: args[0],
      tableId: args[1],
      recordId: args[2],
      fieldName: args[3],
      filePath: args[4],
      customName: args[5]
    };

    await uploader.quickUpload(options);
  } else {
    // 交互式模式
    const uploader = new FeishuBitableAttachmentUploader(
      process.env.FEISHU_APP_ID,
      process.env.FEISHU_APP_SECRET
    );

    await uploader.interactiveUpload();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序执行失败:', error);
    process.exit(1);
  });
}

module.exports = FeishuBitableAttachmentUploader;
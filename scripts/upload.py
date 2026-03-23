#!/usr/bin/env python3
"""
飞书多维表格附件上传工具

支持单文件/多文件上传，覆盖/追加模式。

用法:
  # 单文件（默认覆盖模式，兼容旧版）
  upload.py <app_token> <table_id> <record_id> <field_name> <file_path>

  # 单文件追加
  upload.py <app_token> <table_id> <record_id> <field_name> <file_path> --append

  # 多文件（追加模式自动启用）
  upload.py <app_token> <table_id> <record_id> <field_name> <file1> <file2> ...

  # 多文件追加指定
  upload.py <app_token> <table_id> <record_id> <field_name> <file1> <file2> --append
"""
import os
import sys
import json
import argparse
import requests

FEISHU_API_BASE = 'https://open.feishu.cn/open-apis'


def get_access_token(app_id, app_secret):
    url = f"{FEISHU_API_BASE}/auth/v3/tenant_access_token/internal"
    resp = requests.post(url, json={"app_id": app_id, "app_secret": app_secret}, timeout=30)
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"获取token失败: {data.get('msg')}")
    return data["tenant_access_token"]


def upload_file(file_path, app_token, token):
    """上传单个文件，返回 file_token"""
    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    with open(file_path, 'rb') as f:
        resp = requests.post(
            f"{FEISHU_API_BASE}/drive/v1/medias/upload_all",
            headers={'Authorization': f'Bearer {token}'},
            data={
                'file_name': file_name,
                'parent_type': 'bitable_image',
                'parent_node': app_token,
                'size': str(file_size)
            },
            files={'file': (file_name, f)},
            timeout=120
        )
    result = resp.json()
    if result.get("code") != 0:
        raise Exception(f"上传 {file_name} 失败: {result.get('msg')}")
    return result["data"]["file_token"]


def get_record_attachments(app_token, table_id, record_id, field_name, token):
    """获取记录当前指定字段的附件列表"""
    url = f"{FEISHU_API_BASE}/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}"
    resp = requests.get(url, headers={'Authorization': f'Bearer {token}'}, timeout=30)
    data = resp.json()
    if data.get("code") != 0:
        raise Exception(f"获取记录失败: {data.get('msg')}")
    record = data.get("data", {}).get("record", {})
    attachments = record.get("fields", {}).get(field_name, [])
    return attachments


def update_record(app_token, table_id, record_id, field_name, attachments, token):
    """更新记录的附件字段"""
    url = f"{FEISHU_API_BASE}/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}"
    payload = {"fields": {field_name: attachments}}
    resp = requests.put(url, headers={'Authorization': f'Bearer {token}'}, json=payload, timeout=30)
    result = resp.json()
    if result.get("code") != 0:
        raise Exception(f"更新记录失败: {result.get('msg')}")
    return result


def main():
    parser = argparse.ArgumentParser(description='飞书多维表格附件上传')
    parser.add_argument('app_token', help='多维表格 app_token')
    parser.add_argument('table_id', help='数据表 table_id')
    parser.add_argument('record_id', help='记录 record_id')
    parser.add_argument('field_name', help='附件字段名称')
    parser.add_argument('file_paths', nargs='+', help='要上传的文件路径（支持多个）')
    parser.add_argument('--append', action='store_true', default=None,
                        help='追加模式（保留已有附件）；多文件时自动启用')

    args = parser.parse_args()

    # 多文件时自动启用追加模式
    append_mode = args.append if args.append is not None else (len(args.file_paths) > 1)

    app_id = os.getenv("FEISHU_APP_ID")
    app_secret = os.getenv("FEISHU_APP_SECRET")
    if not app_id or not app_secret:
        print("错误: 请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量", file=sys.stderr)
        sys.exit(1)

    # 验证文件存在
    for fp in args.file_paths:
        if not os.path.isfile(fp):
            print(f"错误: 文件不存在: {fp}", file=sys.stderr)
            sys.exit(1)

    print(f"获取 token...")
    token = get_access_token(app_id, app_secret)

    # 追加模式：先获取已有附件
    existing = []
    if append_mode:
        print(f"追加模式: 读取当前附件...")
        existing = get_record_attachments(args.app_token, args.table_id, args.record_id, args.field_name, token)
        print(f"  当前已有 {len(existing)} 个附件")

    # 逐个上传
    new_attachments = []
    for i, fp in enumerate(args.file_paths, 1):
        fname = os.path.basename(fp)
        print(f"上传 [{i}/{len(args.file_paths)}]: {fname} ({os.path.getsize(fp)} bytes)...")
        file_token = upload_file(fp, args.app_token, token)
        new_attachments.append({"file_token": file_token})
        print(f"  -> file_token: {file_token}")

    # 合并
    all_attachments = existing + new_attachments
    if append_mode and existing:
        print(f"合并: {len(existing)} 已有 + {len(new_attachments)} 新增 = {len(all_attachments)} 总计")

    # 更新记录
    print(f"更新记录 {args.record_id}.{args.field_name}...")
    result = update_record(args.app_token, args.table_id, args.record_id,
                           args.field_name, all_attachments, token)

    final_count = len(result.get("data", {}).get("record", {}).get("fields", {}).get(args.field_name, []))
    print(f"✅ 成功! 字段现在有 {final_count} 个附件。")

    # 输出 JSON 结果供脚本解析
    if os.getenv("UPLOAD_JSON_OUTPUT"):
        print(f"\n{json.dumps(result, ensure_ascii=False)}")


if __name__ == "__main__":
    main()

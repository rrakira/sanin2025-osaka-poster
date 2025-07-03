#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
参院選2025大阪府選挙ポスター貼り付けデータ JSON to CSV変換スクリプト
"""

import json
import csv
import os
from datetime import datetime

# 変換するJSONファイルのパス（ここで指定）
JSON_FILE_PATH = "data/poster-data-export-2025-07-03 (6).json"

def format_comments(comments):
    """コメントリストを文字列に変換"""
    if not comments:
        return ""
    
    comment_texts = []
    for comment in comments:
        # コメントの内容とタイムスタンプを結合
        timestamp = comment.get('timestamp', '')
        if timestamp:
            try:
                # ISO形式の日時を日本語形式に変換
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                formatted_time = dt.strftime('%Y/%m/%d %H:%M')
                comment_text = f"{comment.get('text', '')} ({formatted_time})"
            except:
                comment_text = comment.get('text', '')
        else:
            comment_text = comment.get('text', '')
        comment_texts.append(comment_text)
    
    return " | ".join(comment_texts)

def format_datetime(iso_string):
    """ISO形式の日時を日本語形式に変換"""
    if not iso_string:
        return ""
    
    try:
        dt = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
        return dt.strftime('%Y/%m/%d %H:%M')
    except:
        return iso_string

def convert_json_to_csv(json_file_path, output_csv_path=None):
    """JSONファイルをCSVに変換"""
    
    # 出力ファイル名を自動生成
    if output_csv_path is None:
        base_name = os.path.splitext(os.path.basename(json_file_path))[0]
        output_csv_path = f"{base_name}.csv"
    
    # JSONファイルを読み込み
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"エラー: ファイル '{json_file_path}' が見つかりません。")
        return False
    except json.JSONDecodeError:
        print(f"エラー: ファイル '{json_file_path}' のJSON形式が不正です。")
        return False
    
    # CSVヘッダー
    headers = [
        '市名',
        '投票区番号',
        '場所番号',
        '場所名',
        '住所',
        '備考',
        'チェック状態',
        '最終更新日時',
        'コメント',
        '投票区チェック状態',
        '投票区最終更新日時',
        '投票区コメント'
    ]
    
    rows = []
    
    # データを変換
    timestamp = data.get('timestamp', '')
    formatted_timestamp = format_datetime(timestamp)
    
    cities = data.get('cities', {})
    
    for city_key, city_data in cities.items():
        city_name = city_data.get('name', city_key)
        districts = city_data.get('districts', {})
        
        for district_key, district_data in districts.items():
            # 投票区レベルの情報
            district_comments = district_data.get('districtComments', {})
            district_checked = district_comments.get('isChecked', False)
            district_last_updated = format_datetime(district_comments.get('lastUpdated', ''))
            district_comment_text = format_comments(district_comments.get('comments', []))
            
            # 各掲示場所の情報
            locations = district_data.get('locations', [])
            
            for location in locations:
                row = [
                    city_name,                                          # 市名
                    district_key,                                       # 投票区番号
                    location.get('number', ''),                         # 場所番号
                    location.get('name', '').replace('\r', '').replace('\n', ''),  # 場所名（改行文字除去）
                    location.get('address', ''),                        # 住所
                    location.get('remark', ''),                         # 備考
                    '✓' if location.get('isChecked', False) else '',    # チェック状態
                    format_datetime(location.get('lastUpdated', '')),   # 最終更新日時
                    format_comments(location.get('comments', [])),      # コメント
                    '✓' if district_checked else '',                    # 投票区チェック状態
                    district_last_updated,                              # 投票区最終更新日時
                    district_comment_text                               # 投票区コメント
                ]
                rows.append(row)
    
    # CSVファイルに書き込み
    try:
        with open(output_csv_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            
            # ヘッダー情報を追加
            writer.writerow(['# 参院選2025大阪府選挙ポスター貼り付けデータ'])
            writer.writerow([f'# エクスポート日時: {formatted_timestamp}'])
            writer.writerow([f'# 変換日時: {datetime.now().strftime("%Y/%m/%d %H:%M")}'])
            writer.writerow([])  # 空行
            
            # データヘッダーとデータ
            writer.writerow(headers)
            writer.writerows(rows)
        
        print(f"変換完了: {output_csv_path}")
        print(f"総レコード数: {len(rows)}行")
        return True
        
    except Exception as e:
        print(f"エラー: CSVファイルの書き込みに失敗しました。{e}")
        return False

def main():
    """メイン処理"""
    print("JSON to CSV変換スクリプト")
    print("=" * 50)
    
    # ファイル存在確認
    if not os.path.exists(JSON_FILE_PATH):
        print(f"エラー: 指定されたJSONファイルが見つかりません: {JSON_FILE_PATH}")
        print("スクリプト内のJSON_FILE_PATHを正しいパスに変更してください。")
        return
    
    print(f"入力ファイル: {JSON_FILE_PATH}")
    
    # 変換実行
    success = convert_json_to_csv(JSON_FILE_PATH)
    
    if success:
        print("\n変換が正常に完了しました。")
        print("生成されたCSVファイルをExcelなどで開いて確認してください。")
    else:
        print("\n変換に失敗しました。")

if __name__ == "__main__":
    main() 
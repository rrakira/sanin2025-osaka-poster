#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
吹田市投票区別設置場所数一覧スクリプト
"""

import json
import csv
import os
from datetime import datetime

# 読み込むJSONファイルのパス
JSON_FILE_PATH = "data/poster-data-export-2025-07-03 (6).json"

def format_datetime(iso_string):
    """ISO形式の日時を日本語形式に変換"""
    if not iso_string:
        return ""
    
    try:
        dt = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
        return dt.strftime('%Y/%m/%d %H:%M')
    except:
        return iso_string

def analyze_suita_districts(json_file_path):
    """吹田市の投票区データを分析"""
    
    # JSONファイルを読み込み
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"エラー: ファイル '{json_file_path}' が見つかりません。")
        return None
    except json.JSONDecodeError:
        print(f"エラー: ファイル '{json_file_path}' のJSON形式が不正です。")
        return None
    
    # 吹田市のデータを取得
    cities = data.get('cities', {})
    suita_data = cities.get('suita', {})
    
    if not suita_data:
        print("エラー: 吹田市のデータが見つかりません。")
        return None
    
    districts = suita_data.get('districts', {})
    if not districts:
        print("エラー: 吹田市の投票区データが見つかりません。")
        return None
    
    # 投票区ごとの集計データ
    summary_data = []
    total_locations = 0
    total_checked = 0
    
    # 各投票区を分析
    for district_key in sorted(districts.keys(), key=int):
        district_data = districts[district_key]
        locations = district_data.get('locations', [])
        
        # 基本情報
        location_count = len(locations)
        checked_count = sum(1 for loc in locations if loc.get('isChecked', False))
        unchecked_count = location_count - checked_count
        progress_rate = (checked_count / location_count * 100) if location_count > 0 else 0
        
        # 投票区レベルのチェック状態
        district_comments = district_data.get('districtComments', {})
        district_checked = district_comments.get('isChecked', False)
        district_last_updated = format_datetime(district_comments.get('lastUpdated', ''))
        
        # 最終更新日時（場所レベル）
        last_updated_times = [loc.get('lastUpdated', '') for loc in locations if loc.get('lastUpdated')]
        latest_update = ""
        if last_updated_times:
            # 最新の更新日時を取得
            try:
                sorted_times = sorted(last_updated_times, reverse=True)
                latest_update = format_datetime(sorted_times[0])
            except:
                pass
        
        # コメント付きの場所数
        commented_count = sum(1 for loc in locations if loc.get('comments', []))
        
        summary_data.append({
            'district': district_key,
            'total_locations': location_count,
            'checked': checked_count,
            'unchecked': unchecked_count,
            'progress_rate': progress_rate,
            'district_checked': district_checked,
            'district_last_updated': district_last_updated,
            'latest_location_update': latest_update,
            'commented_locations': commented_count
        })
        
        total_locations += location_count
        total_checked += checked_count
    
    return {
        'summary': summary_data,
        'total_locations': total_locations,
        'total_checked': total_checked,
        'total_unchecked': total_locations - total_checked,
        'overall_progress': (total_checked / total_locations * 100) if total_locations > 0 else 0,
        'timestamp': format_datetime(data.get('timestamp', ''))
    }

def print_summary(analysis_result):
    """分析結果をコンソールに出力"""
    
    if not analysis_result:
        return
    
    print("=" * 80)
    print("吹田市 投票区別設置場所数一覧")
    print("=" * 80)
    print(f"データ取得日時: {analysis_result['timestamp']}")
    print()
    
    # ヘッダー
    print(f"{'投票区':>4} | {'場所数':>4} | {'完了':>4} | {'未完':>4} | {'進捗率':>6} | {'投票区':>6} | {'最終更新':>16} | {'コメント':>6}")
    print(f"{'番号':>4} | {'合計':>4} | {'数':>4} | {'了数':>4} | {'(%)':>6} | {'完了':>6} | {'(場所レベル)':>16} | {'場所数':>6}")
    print("-" * 80)
    
    # 各投票区のデータ
    for item in analysis_result['summary']:
        district_status = "✓" if item['district_checked'] else ""
        print(f"{item['district']:>4} | "
              f"{item['total_locations']:>4} | "
              f"{item['checked']:>4} | "
              f"{item['unchecked']:>4} | "
              f"{item['progress_rate']:>5.1f}% | "
              f"{district_status:>6} | "
              f"{item['latest_location_update']:>16} | "
              f"{item['commented_locations']:>6}")
    
    print("-" * 80)
    print(f"{'合計':>4} | "
          f"{analysis_result['total_locations']:>4} | "
          f"{analysis_result['total_checked']:>4} | "
          f"{analysis_result['total_unchecked']:>4} | "
          f"{analysis_result['overall_progress']:>5.1f}% | "
          f"{'':>6} | "
          f"{'':>16} | "
          f"{'':>6}")
    print()

def export_to_csv(analysis_result, output_file="suita_district_summary.csv"):
    """分析結果をCSVファイルに出力"""
    
    if not analysis_result:
        return False
    
    try:
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            
            # ヘッダー情報
            writer.writerow(['# 吹田市 投票区別設置場所数一覧'])
            writer.writerow([f'# データ取得日時: {analysis_result["timestamp"]}'])
            writer.writerow([f'# 分析実行日時: {datetime.now().strftime("%Y/%m/%d %H:%M")}'])
            writer.writerow([])
            
            # データヘッダー
            headers = [
                '投票区番号',
                '設置場所数',
                '完了数',
                '未完了数',
                '進捗率(%)',
                '投票区完了状態',
                '投票区最終更新',
                '最終更新(場所レベル)',
                'コメント付き場所数'
            ]
            writer.writerow(headers)
            
            # データ行
            for item in analysis_result['summary']:
                writer.writerow([
                    item['district'],
                    item['total_locations'],
                    item['checked'],
                    item['unchecked'],
                    f"{item['progress_rate']:.1f}",
                    '✓' if item['district_checked'] else '',
                    item['district_last_updated'],
                    item['latest_location_update'],
                    item['commented_locations']
                ])
            
            # 合計行
            writer.writerow([])
            writer.writerow([
                '合計',
                analysis_result['total_locations'],
                analysis_result['total_checked'],
                analysis_result['total_unchecked'],
                f"{analysis_result['overall_progress']:.1f}",
                '',
                '',
                '',
                ''
            ])
        
        print(f"CSVファイルを出力しました: {output_file}")
        return True
        
    except Exception as e:
        print(f"エラー: CSVファイルの出力に失敗しました。{e}")
        return False

def main():
    """メイン処理"""
    print("吹田市投票区別設置場所数分析スクリプト")
    print()
    
    # ファイル存在確認
    if not os.path.exists(JSON_FILE_PATH):
        print(f"エラー: 指定されたJSONファイルが見つかりません: {JSON_FILE_PATH}")
        print("スクリプト内のJSON_FILE_PATHを正しいパスに変更してください。")
        return
    
    # 分析実行
    print(f"分析中: {JSON_FILE_PATH}")
    analysis_result = analyze_suita_districts(JSON_FILE_PATH)
    
    if analysis_result:
        # コンソール出力
        print_summary(analysis_result)
        
        # CSV出力
        export_to_csv(analysis_result)
        
        print("\n分析完了!")
        print("※ 進捗率は各投票区内の完了した場所数の割合を示しています")
        print("※ 投票区完了状態は投票区全体のチェックボックス状態を示しています")
    else:
        print("\n分析に失敗しました。")

if __name__ == "__main__":
    main() 
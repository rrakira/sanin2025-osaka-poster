#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import re
import os

def parse_ibaraki_data(file_path):
    """茨木市の選挙ポスター掲示場所データをCSVに変換"""
    
    data = []
    
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # ヘッダー行をスキップ（1行目）
    for line_num, line in enumerate(lines[1:], 2):
        line = line.strip()
        if not line:
            continue
        
        # 半角スペースで分割
        parts = line.split()
        
        if len(parts) < 5:
            print(f"警告: 行 {line_num} のデータが不完全です: {line}")
            continue
        
        通し番号 = parts[0]
        投票区 = parts[1]
        番号 = parts[2]
        設置場所 = parts[3]
        設置説明 = ' '.join(parts[4:])  # 4番目以降をすべて結合
        
        # 住所に「大阪府茨木市」を追加
        住所 = f"大阪府茨木市{設置場所}"
        
        # 名称を生成
        名称 = f"{投票区}-{番号} {設置説明}"
        
        data.append({
            '通し番号': 通し番号,
            '投票区': 投票区,
            '番号': 番号,
            '名称': 名称,
            '住所': 住所,
            '設置説明': 設置説明
        })
    
    return data

def save_to_csv(data, output_file):
    """データをCSVファイルに保存"""
    
    if not data:
        print("保存するデータがありません")
        return
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['通し番号', '投票区', '番号', '名称', '住所', '設置説明']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(data)
    
    print(f"CSVファイル '{output_file}' に {len(data)} 件のデータを保存しました")

def save_by_voting_district(data, output_dir):
    """投票区ごとのCSVファイルを作成"""
    
    if not data:
        print("保存するデータがありません")
        return
    
    # 出力ディレクトリが存在しない場合は作成
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 投票区ごとにデータを分類
    from collections import defaultdict
    voting_districts = defaultdict(list)
    
    for item in data:
        voting_districts[item['投票区']].append(item)
    
    # 各投票区のCSVファイルを作成
    for voting_district in sorted(voting_districts.keys(), key=int):
        output_file = os.path.join(output_dir, f"投票区{voting_district}.csv")
        
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['通し番号', '投票区', '番号', '名称', '住所', '設置説明']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            writer.writerows(voting_districts[voting_district])
        
        print(f"投票区{voting_district}.csv ({len(voting_districts[voting_district])}件)")
    
    print(f"\n投票区ごとのCSVファイルを '{output_dir}' ディレクトリに作成しました")

def save_specific_districts(data, district_numbers, output_file):
    """特定の投票区のデータを抽出して新しい列構成でCSVファイルを作成"""
    
    if not data:
        print("保存するデータがありません")
        return
    
    # 指定された投票区のデータを抽出
    filtered_data = []
    for item in data:
        if int(item['投票区']) in district_numbers:
            # 新しい列構成に変換
            new_item = {
                '投票区': item['投票区'],
                '番号': item['番号'],
                '住所': item['住所'],
                '備考': item['設置説明'],
                '名称': item['名称']
            }
            filtered_data.append(new_item)
    
    # CSVファイルに保存
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['投票区', '番号', '住所', '備考', '名称']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(filtered_data)
    
    print(f"指定された投票区のCSVファイル '{output_file}' に {len(filtered_data)} 件のデータを保存しました")
    
    # 投票区別の件数を表示
    from collections import Counter
    district_count = Counter(item['投票区'] for item in filtered_data)
    print("投票区別の件数:")
    for district in sorted(district_count.keys(), key=int):
        print(f"  第{district}投票区: {district_count[district]}件")

def main():
    """メイン処理"""
    
    # 入力ファイルと出力ファイルのパス
    input_file = 'text.txt'
    output_file = 'ibaraki_poster_locations.csv'
    
    print(f"茨木市の選挙ポスター掲示場所データを処理中...")
    print(f"入力ファイル: {input_file}")
    print(f"出力ファイル: {output_file}")
    print()
    
    # データを解析
    data = parse_ibaraki_data(input_file)
    
    # 統計を表示
    if data:
        投票区_set = set(int(item['投票区']) for item in data)
        print(f"処理結果:")
        print(f"- 総件数: {len(data)} 件")
        print(f"- 投票区数: {len(投票区_set)} 区")
        print(f"- 投票区範囲: {min(投票区_set)}〜{max(投票区_set)}")
        print()
        
        # 投票区別の集計
        from collections import Counter
        投票区_count = Counter(item['投票区'] for item in data)
        print("投票区別の設置場所数:")
        for 投票区 in sorted(投票区_count.keys(), key=int):
            print(f"  第{投票区}投票区: {投票区_count[投票区]}件")
        print()
    
    # CSVファイルに保存
    save_to_csv(data, output_file)
    
    # 投票区ごとのCSVファイルを作成
    print("\n投票区ごとのCSVファイルを作成中...")
    save_by_voting_district(data, 'voting_districts')
    
    # 指定された投票区のCSVファイルを作成
    print("\n指定された投票区のCSVファイルを作成中...")
    specific_districts = [22, 36, 40, 41, 47, 56, 59]
    save_specific_districts(data, specific_districts, 'specific_districts.csv')
    
    print("\n処理が完了しました。")

if __name__ == "__main__":
    main() 
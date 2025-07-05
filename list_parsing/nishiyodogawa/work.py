#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import re
import os

def parse_nishiyodogawa_data(input_file):
    """
    西淀川区の選挙ポスター掲示場所データを解析する
    
    Args:
        input_file (str): 入力ファイルのパス
        
    Returns:
        list: 解析されたデータのリスト
    """
    data = []
    current_voting_district = None
    current_district_num = None
    current_number = 1
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            # 投票区行の判定（数字+ピリオドから始まる行）
            district_match = re.match(r'^(\d+)\.(.+)$', line)
            if district_match:
                district_num = district_match.group(1)
                district_name = district_match.group(2)
                current_voting_district = f"{district_num}.{district_name}"
                current_district_num = district_num
                current_number = 1
                continue
            
            # 設置場所の行（投票区行以外）
            if current_voting_district:
                # 半角スペースで分割
                parts = line.split()
                if len(parts) >= 2:
                    # 最後の部分を住所、それ以外を備考として扱う
                    address_part = parts[-1]
                    remarks_parts = parts[:-1]
                    
                    # 住所に「大阪府大阪市西淀川区」を追加
                    full_address = f"大阪府大阪市西淀川区{address_part}"
                    
                    # 備考を結合
                    remarks = ' '.join(remarks_parts)
                    
                    # 名称を生成（投票区番号-番号 備考）
                    name = f"{current_district_num}-{current_number} {remarks}"
                    
                    data.append({
                        '投票区': current_district_num,
                        '番号': current_number,
                        '住所': full_address,
                        '備考': remarks,
                        '名称': name
                    })
                    
                    current_number += 1
    
    return data

def create_csv_files(data, output_dir):
    """
    CSVファイルを作成する
    
    Args:
        data (list): 解析されたデータ
        output_dir (str): 出力ディレクトリ
    """
    # 出力ディレクトリを作成
    os.makedirs(output_dir, exist_ok=True)
    
    # 統合CSV作成
    output_file = os.path.join(output_dir, 'nishiyodogawa_poster_locations.csv')
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['投票区', '番号', '住所', '備考', '名称']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"統合CSV作成完了: {output_file}")
    print(f"総件数: {len(data)}件")
    
    # 投票区別の統計情報を収集
    district_counts = {}
    for row in data:
        district = row['投票区']
        district_counts[district] = district_counts.get(district, 0) + 1
    
    print("\n投票区別件数:")
    for district, count in sorted(district_counts.items()):
        print(f"  {district}: {count}件")
    
    # 投票区別CSVファイルを作成
    voting_districts_dir = os.path.join(output_dir, 'voting_districts')
    os.makedirs(voting_districts_dir, exist_ok=True)
    
    # 投票区別にデータを分類
    district_data = {}
    for row in data:
        district = row['投票区']
        if district not in district_data:
            district_data[district] = []
        district_data[district].append(row)
    
    # 各投票区のCSVファイルを作成
    for district, rows in district_data.items():
        # ファイル名用に投票区名を正規化
        safe_district = re.sub(r'[^\w\-_\.]', '_', district)
        district_file = os.path.join(voting_districts_dir, f'投票区{safe_district}.csv')
        
        with open(district_file, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['投票区', '番号', '住所', '備考', '名称']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"投票区別CSV作成: {district_file} ({len(rows)}件)")

def main():
    # 入力ファイルパス
    input_file = 'text.txt'
    
    # 出力ディレクトリ
    output_dir = 'output'
    
    print("西淀川区選挙ポスター掲示場所データ処理開始")
    print(f"入力ファイル: {input_file}")
    
    # データ解析
    data = parse_nishiyodogawa_data(input_file)
    
    # CSVファイル作成
    create_csv_files(data, output_dir)
    
    print("\n処理完了!")

if __name__ == "__main__":
    main() 
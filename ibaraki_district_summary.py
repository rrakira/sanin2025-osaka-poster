#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
茨木市投票区別設置場所数分析スクリプト
"""

import pandas as pd
import sys
import os

def analyze_ibaraki_districts():
    """茨木市の投票区別設置場所数を分析"""
    
    # CSVファイルのパスを取得
    csv_path = os.path.join(os.path.dirname(__file__), 'public', 'ibaraki.csv')
    
    # CSVファイルの存在確認
    if not os.path.exists(csv_path):
        print(f"エラー: CSVファイルが見つかりません: {csv_path}")
        return
    
    try:
        # CSVファイルを読み込み
        df = pd.read_csv(csv_path)
        
        # 投票区ごとの設置場所数を集計
        district_counts = df.groupby('投票区').size().reset_index(name='設置場所数')
        district_counts = district_counts.sort_values('投票区')
        
        # 総計を計算
        total_districts = len(district_counts)
        total_locations = district_counts['設置場所数'].sum()
        
        print("=" * 60)
        print("茨木市 投票区別設置場所数分析")
        print("=" * 60)
        print()
        
        # 投票区別詳細
        print("投票区別設置場所数:")
        print("-" * 30)
        for _, row in district_counts.iterrows():
            print(f"投票区 {row['投票区']:2d}: {row['設置場所数']:2d} 箇所")
        
        print("-" * 30)
        print(f"総投票区数: {total_districts} 区")
        print(f"総設置場所数: {total_locations} 箇所")
        
        # 統計情報
        print()
        print("統計情報:")
        print("-" * 30)
        min_locations = district_counts['設置場所数'].min()
        max_locations = district_counts['設置場所数'].max()
        avg_locations = district_counts['設置場所数'].mean()
        
        print(f"最小設置場所数: {min_locations} 箇所")
        print(f"最大設置場所数: {max_locations} 箇所")
        print(f"平均設置場所数: {avg_locations:.1f} 箇所")
        
        # 分布情報
        print()
        print("設置場所数分布:")
        print("-" * 30)
        distribution = district_counts['設置場所数'].value_counts().sort_index()
        for locations, count in distribution.items():
            print(f"{locations} 箇所: {count} 投票区")
        
        # 投票区一覧（参考）
        print()
        print("投票区一覧:")
        print("-" * 30)
        districts_list = district_counts['投票区'].tolist()
        print(f"投票区: {', '.join(map(str, districts_list))}")
        
        print()
        print("=" * 60)
        
    except Exception as e:
        print(f"エラー: データの処理中にエラーが発生しました: {e}")
        return

def main():
    """メイン関数"""
    analyze_ibaraki_districts()

if __name__ == "__main__":
    main() 
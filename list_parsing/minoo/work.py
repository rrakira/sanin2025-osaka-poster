import re
import csv
import os

def parse_poster_locations(input_file, output_file):
    """
    選挙ポスター掲示場所一覧表をCSVに変換する
    """
    
    # CSVの出力データ
    csv_data = []
    current_voting_district = 0
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for line in lines:
        line = line.strip()
        
        # 一桁の数字＋半角スペースで始まる行を特定
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if match:
            number = int(match.group(1))
            rest_text = match.group(2)
            
            # 番号が1の場合、新しい投票区の開始
            if number == 1:
                current_voting_district += 1
            
            # 住所と備考を分離（2番目の半角スペースで区切る）
            parts = rest_text.split(' ', 1)  # 最初の1つの空白で分割
            if len(parts) >= 2:
                address = parts[0]
                remarks = parts[1]
            else:
                address = rest_text
                remarks = ""
            
            # 住所に「大阪府箕面市」を冒頭に付加
            full_address = f"大阪府箕面市{address}"
            
            # 名称を作成（No.{番号} {備考}）
            name = f"No.{number} {remarks}" if remarks else f"No.{number}"
            
            # CSVデータに追加（投票区、番号、住所、備考、名称）
            csv_data.append([current_voting_district, number, full_address, remarks, name])
    
    # 統合CSVファイルに出力
    with open(output_file, 'w', encoding='utf-8', newline='') as csvfile:
        writer = csv.writer(csvfile)
        # ヘッダー行を書き込み
        writer.writerow(['投票区', '番号', '住所', '備考', '名称'])
        # データ行を書き込み
        writer.writerows(csv_data)
    
    print(f"統合CSV変換完了: {len(csv_data)}件のデータを{output_file}に出力しました")
    print(f"投票区数: {current_voting_district}")
    
    # 投票区ごとに別々のCSVファイルを作成
    create_separate_csv_by_district(csv_data, current_voting_district)

def create_separate_csv_by_district(csv_data, total_districts):
    """
    投票区ごとに別々のCSVファイルを作成する
    """
    # 出力ディレクトリを作成
    output_dir = "voting_districts"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 投票区ごとにデータを分離
    for district_num in range(1, total_districts + 1):
        # 該当する投票区のデータのみを抽出
        district_data = [row for row in csv_data if row[0] == district_num]
        
        # ファイル名を生成（投票区{番号}.csv）
        filename = f"{output_dir}/投票区{district_num}.csv"
        
        # CSVファイルに出力
        with open(filename, 'w', encoding='utf-8', newline='') as csvfile:
            writer = csv.writer(csvfile)
            # ヘッダー行を書き込み
            writer.writerow(['投票区', '番号', '住所', '備考', '名称'])
            # データ行を書き込み
            writer.writerows(district_data)
        
        print(f"投票区{district_num}: {len(district_data)}件のデータを{filename}に出力")

# 実行
if __name__ == "__main__":
    parse_poster_locations('text.txt', 'poster_locations.csv')

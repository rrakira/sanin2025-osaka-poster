import re
import csv
import os

def create_individual_district_csv_files(input_csv_file):
    """
    統合CSVファイルから投票区ごとの個別CSVファイルを作成する
    """
    # 保存用ディレクトリを作成
    output_dir = 'districts_csv'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"ディレクトリ '{output_dir}' を作成しました")
    
    # 統合CSVファイルを読み込む
    with open(input_csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # ヘッダー行を取得
        all_data = list(reader)  # 全データを読み込み
    
    print("=== 投票区ごとの個別CSVファイル作成開始 ===")
    
    # 投票区ごとにデータをグループ化
    district_data = {}
    for row in all_data:
        district_num = int(row[0])
        if district_num not in district_data:
            district_data[district_num] = []
        district_data[district_num].append(row)
    
    # 各投票区ごとにCSVファイルを作成
    created_files = []
    for district_num in sorted(district_data.keys()):
        data = district_data[district_num]
        
        # ファイル名を生成
        output_filename = os.path.join(output_dir, f'投票区{district_num}.csv')
        
        # CSVファイルを作成
        with open(output_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            writer.writerows(data)
        
        created_files.append(output_filename)
        print(f"投票区{district_num}: {len(data)}件 → {output_filename}")
    
    print(f"\n全{len(district_data)}投票区の個別CSVファイルを作成しました")
    print(f"保存場所: {output_dir}/ ディレクトリ")
    print(f"投票区範囲: {min(district_data.keys())}〜{max(district_data.keys())}")
    
    return created_files

def create_grouped_csv_files(input_csv_file):
    """
    統合CSVファイルから投票区グループ別のCSVファイルを作成する
    """
    # 投票区グループの定義
    groups = {
        '101-113': list(range(101, 114)),
        '121-124': list(range(121, 125)),
        '131-137': list(range(131, 138)),
        '141-145': list(range(141, 146)),
        '151-159': list(range(151, 160)),
        '161-169': list(range(161, 170)),
        '181-188': list(range(181, 189)),
        '191-194': list(range(191, 195))
    }
    
    # 統合CSVファイルを読み込む
    with open(input_csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # ヘッダー行を取得
        all_data = list(reader)  # 全データを読み込み
    
    print("=== 投票区グループ別CSVファイル作成開始 ===")
    
    # 各グループごとにCSVファイルを作成
    for group_name, district_range in groups.items():
        # 該当するグループのデータを抽出
        group_data = []
        for row in all_data:
            district_num = int(row[0])
            if district_num in district_range:
                group_data.append(row)
        
        # グループ用CSVファイルを作成
        output_filename = f'suita_poster_locations_{group_name}.csv'
        with open(output_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            writer.writerows(group_data)
        
        # 統計情報を表示
        district_counts = {}
        for row in group_data:
            district = int(row[0])
            district_counts[district] = district_counts.get(district, 0) + 1
        
        print(f"グループ{group_name}: {len(group_data)}件 → {output_filename}")
        print(f"  投票区: {', '.join(map(str, sorted(district_counts.keys())))}")
        print(f"  投票区数: {len(district_counts)}区")
    
    print(f"\n全{len(groups)}グループのCSVファイルを作成しました")

def parse_suita_poster_locations_unified(output_file):
    """
    吹田市のポスター掲示場所データを統合してCSVに変換する
    101-103投票区（text copy.txt）と104以降投票区（text.txt）を統合処理
    """
    # 101-103投票区のデータを抽出
    districts_101_103 = extract_districts_101_103('text copy.txt')
    
    # 104以降の投票区のデータを抽出
    with open('text.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    lines = content.split('\n')
    
    districts_data = extract_all_districts_sequentially(lines)
    address_sections = extract_all_addresses_sequentially(lines)
    districts_104_plus = match_districts_with_addresses(districts_data, address_sections)
    
    # データを統合
    all_data = districts_101_103 + districts_104_plus
    
    # 投票区番号でソート
    all_data.sort(key=lambda x: (int(x[0]), int(x[1])))
    
    # CSVファイルに書き込み
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['投票区', '番号', '住所', '備考', '名称'])
        writer.writerows(all_data)
    
    # 統計情報を表示
    print(f"\n=== 統合結果 ===")
    print(f"CSVファイル '{output_file}' を生成しました")
    
    district_101_103_count = len([d for d in all_data if int(d[0]) <= 103])
    district_104_plus_count = len([d for d in all_data if int(d[0]) >= 104])
    
    print(f"投票区101-103: {district_101_103_count}件")
    print(f"投票区104以降: {district_104_plus_count}件")
    print(f"総件数: {len(all_data)}件")
    
    # 投票区別の件数表示
    district_counts = {}
    for data in all_data:
        district = int(data[0])
        district_counts[district] = district_counts.get(district, 0) + 1
    
    print(f"\n投票区範囲: {min(district_counts.keys())}〜{max(district_counts.keys())}")
    print(f"処理済み投票区数: {len(district_counts)}区")

def convert_to_halfwidth(text):
    """全角数字を半角数字に変換"""
    fullwidth_digits = '０１２３４５６７８９'
    halfwidth_digits = '0123456789'
    for fw, hw in zip(fullwidth_digits, halfwidth_digits):
        text = text.replace(fw, hw)
    return text

def extract_districts_101_103(input_file):
    """
    text copy.txtから101-103投票区の情報を抽出してCSV形式のデータを返す
    フォーマット: 投票区の行、ヘッダーの行、番号＋備考＋住所の行
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.strip().split('\n')
    results = []
    current_district = None
    
    print("=== 投票区101-103のデータ抽出開始 ===")
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 投票区の行を検出（全角・半角対応）
        district_match = re.match(r'第([０-９\d]+)投票区', line)
        if district_match:
            current_district = convert_to_halfwidth(district_match.group(1))
            continue
            
        # ヘッダー行をスキップ
        if '番号 設 置 場 所 所 在 地' in line:
            continue
            
        # データ行を処理（番号 設置場所 住所）
        if current_district and line and not line.startswith('番号'):
            # 行を分割（最初の数字、最後の住所部分、中間の設置場所）
            parts = line.split()
            if len(parts) >= 3:
                number = parts[0]
                
                # 住所部分を特定（丁目、町、番などで終わる部分）
                address_start = -1
                for i in range(len(parts) - 1, -1, -1):
                    if re.search(r'[丁目町番号－]\d*$', parts[i]) or parts[i].endswith('号'):
                        address_start = i
                        break
                
                if address_start == -1:
                    # 住所が見つからない場合、最後の部分を住所とする
                    address_start = len(parts) - 1
                
                # 設置場所は番号の次から住所の前まで
                location_parts = parts[1:address_start]
                address_parts = parts[address_start:]
                
                location = ' '.join(location_parts)
                address = ' '.join(address_parts)
                
                # 住所に「大阪府吹田市」を付加
                if not address.startswith('大阪府'):
                    address = f'大阪府吹田市{address}'
                
                name = f"{current_district}-{number} {location}"
                results.append([current_district, number, address, location, name])
    
    # 投票区別の件数を表示
    for district in ['101', '102', '103']:
        count = len([d for d in results if d[0] == district])
        print(f"投票区{district}: {count}件")
    
    return results

def parse_suita_poster_locations(input_file, output_file):
    """
    吹田市のポスター掲示場所データをCSVに変換する
    シンプルな順次処理方式（104以降の投票区用）
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # データを行単位に分割
    lines = content.split('\n')
    
    # 1. 全投票区の設置場所データを順次抽出
    districts_data = extract_all_districts_sequentially(lines)
    
    # 2. 全住所セクションを順次抽出
    address_sections = extract_all_addresses_sequentially(lines)
    
    # 3. 投票区と住所セクションを順序で対応付け
    csv_data = match_districts_with_addresses(districts_data, address_sections)
    
    # CSVファイルに書き込み
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['投票区', '番号', '住所', '備考', '名称'])
        writer.writerows(csv_data)
    
    print(f"\nCSVファイル '{output_file}' を生成しました")
    print(f"総件数: {len(csv_data)}件")

def extract_all_districts_sequentially(lines):
    """
    全投票区の設置場所データを順次抽出する
    """
    districts_data = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # 投票区名を検出（全角数字も含む）
        district_match = re.search(r'第([０-９\d]+)投票区', line)
        if district_match:
            district_num = district_match.group(1)
            
            # 全角数字を半角数字に変換
            district_num = district_num.translate(str.maketrans('０１２３４５６７８９', '0123456789'))
            
            # 設置場所データを取得
            items = extract_district_items(lines, i)
            
            if items:
                districts_data.append((district_num, items))
                print(f"投票区 {district_num}: {len(items)}件の設置場所を抽出")
            else:
                print(f"警告: 投票区 {district_num}: 設置場所データが見つかりません")
        
        i += 1
    
    return districts_data

def extract_district_items(lines, district_line_index):
    """
    特定の投票区の設置場所データを抽出する
    投票区名より後で最も近い「番号 設 置 場 所」から次の区切りまでを抽出
    """
    district_line = lines[district_line_index]
    district_match = re.search(r'第([０-９\d]+)投票区', district_line)
    if not district_match:
        return []
    
    district_num = district_match.group(1)
    # 全角数字を半角数字に変換
    district_num = district_num.translate(str.maketrans('０１２３４５６７８９', '0123456789'))
    items_start_index = None
    
    # まず投票区名より後の行で「番号 設 置 場 所」を探す（優先）
    for i in range(district_line_index + 1, len(lines)):
        if '番号 設 置 場 所' in lines[i]:
            items_start_index = i
            break
    
    # 見つからない場合、同じ行内で投票区名より後の部分をチェック
    if items_start_index is None:
        district_pos = district_line.find(f'第{district_num}投票区')
        after_district = district_line[district_pos + len(f'第{district_num}投票区'):]
        if '番号 設 置 場 所' in after_district:
            items_start_index = district_line_index
    
    # 最後の手段として投票区名より前をチェック（行末投票区の場合）
    if items_start_index is None:
        district_pos = district_line.find(f'第{district_num}投票区')
        before_district = district_line[:district_pos]
        if '番号 設 置 場 所' in before_district:
            items_start_index = district_line_index
    
    if items_start_index is None:
        return []
    
    # 設置場所データの終了位置を特定
    items_end_index = len(lines)
    
    for i in range(items_start_index + 1, len(lines)):
        line = lines[i].strip()
        
        # 次の投票区名、所在地、ページ番号で終了
        if (re.search(r'第[０-９\d]+投票区', line) or 
            line.startswith('所 在 地') or 
            line.endswith('所 在 地') or
            re.match(r'^\d+$', line)):
            items_end_index = i
            break
    
    # 範囲内の全ての行を結合して設置場所データを抽出
    collected_lines = []
    for i in range(items_start_index, items_end_index):
        line = lines[i].strip()
        # ページ番号行は除外
        if not re.match(r'^\d+$', line):
            collected_lines.append(line)
    
    # 最後の行に投票区名がある場合は、その投票区名より前の部分だけ使用
    if collected_lines and items_end_index < len(lines):
        last_line = lines[items_end_index].strip()
        next_district_match = re.search(r'第[０-９\d]+投票区', last_line)
        if next_district_match:
            # 次の投票区名より前の部分があれば追加
            before_next_district = last_line[:next_district_match.start()].strip()
            if before_next_district and not re.match(r'^\d+$', before_next_district):
                collected_lines.append(before_next_district)
    
    # 全ての行を結合
    combined_text = ' '.join(collected_lines)
    

    
    # 投票区名より後の部分のみを抽出する場合の処理
    if items_start_index == district_line_index:
        district_pos = combined_text.find(f'第{district_num}投票区')
        if district_pos != -1:
            # 投票区名より前の部分を取得（行末投票区の場合）
            before_district = combined_text[:district_pos]
            # 投票区名より後の部分を取得
            after_district = combined_text[district_pos + len(f'第{district_num}投票区'):]
            
            # 前の部分に「番号 設 置 場 所」があれば前の部分を使用（行末投票区）
            if '番号 設 置 場 所' in before_district:
                combined_text = before_district
            # そうでなければ後の部分を使用
            elif '番号 設 置 場 所' in after_district:
                combined_text = after_district
    
    return extract_items_from_text(combined_text)

def extract_all_addresses_sequentially(lines):
    """
    全住所セクションを順次抽出する
    """
    address_sections = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # 「所在地」セクションを検出
        if line.startswith('所 在 地') or line.endswith('所 在 地'):
            addresses = extract_address_section(lines, i)
            if addresses:
                address_sections.append(addresses)
                print(f"住所セクション {len(address_sections)}: {len(addresses)}件の住所を抽出")
        
        i += 1
    
    return address_sections

def extract_address_section(lines, start_index):
    """
    「所在地」セクションから住所リストを抽出する
    """
    addresses = []
    
    # 次の行から住所を収集
    for i in range(start_index + 1, len(lines)):
        line = lines[i].strip()
        
        # 次のセクションが始まったら終了
        if (line.startswith('所 在 地') or 
            line.endswith('所 在 地') or
            re.search(r'第[０-９\d]+投票区', line) or
            line.startswith('番号 設 置 場 所')):
            break
        
        # 住所データを追加（空行やページ番号は除外）
        if line and not re.match(r'^\d+$', line):
            addresses.append(line)
    
    return addresses

def match_districts_with_addresses(districts_data, address_sections):
    """
    投票区と住所セクションを順序で対応付け
    """
    csv_data = []
    
    print(f"\n=== 対応付け結果 ===")
    print(f"投票区数: {len(districts_data)}")
    print(f"住所セクション数: {len(address_sections)}")
    
    for i, (district_num, items) in enumerate(districts_data):
        # 対応する住所セクションを取得
        if i < len(address_sections):
            addresses = address_sections[i]
        else:
            addresses = []
            print(f"警告: 投票区{district_num}に対応する住所セクションがありません")
        
        # 件数チェック
        if len(items) == len(addresses):
            print(f"投票区 {district_num}: {len(items)}件の設置場所が正常に処理されました")
        else:
            print(f"警告: 投票区{district_num}で設置場所({len(items)}件)と住所({len(addresses)}件)の数が一致しません")
        
        # CSVデータを生成
        min_length = min(len(items), len(addresses))
        for j in range(min_length):
            number, remark = items[j]
            address = f"大阪府吹田市{addresses[j]}" if j < len(addresses) else "住所不明"
            name = f"{district_num}-{number} {remark}"
            csv_data.append([district_num, number, address, remark, name])
    
    return csv_data

def extract_items_from_text(text):
    """
    テキストから番号と設置場所のペアを抽出する
    """
    items = []
    
    # 「番号 設 置 場 所」を除去
    text = re.sub(r'番号\s*設\s*置\s*場\s*所\s*', '', text)
    
    # 末尾の不要な文字列を除去
    text = re.sub(r'\s+\d+\s*$', '', text)  # ページ番号
    text = re.sub(r'\s+所\s*在\s*地\s*$', '', text)  # 所在地
    text = re.sub(r'\s+第[０-９\d]+投票区.*$', '', text)  # 次の投票区名
    
    # 番号と設置場所のペアを抽出
    pattern = r'(\d+)\s+(.+?)(?=\s+\d+|$)'
    matches = re.findall(pattern, text)
    
    for number_str, remark in matches:
        number = int(number_str)
        remark = re.sub(r'\s+', ' ', remark).strip()
        
        if remark:
            items.append((number, remark))
    
    return items

# 実行
if __name__ == "__main__":
    # 統合版を実行
    unified_csv = 'suita_poster_locations_unified.csv'
    parse_suita_poster_locations_unified(unified_csv)
    
    # 投票区ごとの個別CSVファイルを作成
    create_individual_district_csv_files(unified_csv)
    
    # グループ別CSVファイルを作成
    create_grouped_csv_files(unified_csv) 
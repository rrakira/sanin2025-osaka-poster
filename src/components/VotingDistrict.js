import React, { useState, useEffect } from 'react';

const VotingDistrict = ({ 
  districtId, 
  locations, 
  city, 
  checkStates, 
  memos, 
  onCheckStateChange, 
  onMemoChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 投票区のチェック状態を取得
  const districtKey = `${districtId}-district`;
  const isDistrictChecked = checkStates[districtKey] || false;
  
  // 投票区のメモを取得
  const districtMemo = memos[districtKey] || '';
  
  // 全ての掲示場所がチェック済みかどうかを確認
  const allLocationsChecked = locations.every(location => 
    checkStates[`${districtId}-${location.number}`] || false
  );
  
  // 一部の掲示場所がチェック済みかどうかを確認
  const someLocationsChecked = locations.some(location => 
    checkStates[`${districtId}-${location.number}`] || false
  );

  // 投票区チェックボックスの状態を計算
  const districtCheckboxState = allLocationsChecked ? 'checked' : 
    (someLocationsChecked ? 'indeterminate' : 'unchecked');

  // 投票区チェックボックスのクリック処理
  const handleDistrictCheckboxChange = (e) => {
    e.stopPropagation();
    const shouldCheck = !allLocationsChecked;
    
    // 投票区のチェック状態を更新
    onCheckStateChange(city, districtId, null, shouldCheck);
    
    // 全ての掲示場所のチェック状態を更新
    locations.forEach(location => {
      onCheckStateChange(city, districtId, location.number, shouldCheck);
    });
  };

  // 掲示場所チェックボックスのクリック処理
  const handleLocationCheckboxChange = (location, checked) => {
    onCheckStateChange(city, districtId, location.number, checked);
  };

  // 投票区メモの変更処理
  const handleDistrictMemoChange = (e) => {
    onMemoChange(city, districtId, null, e.target.value);
  };

  // 掲示場所メモの変更処理
  const handleLocationMemoChange = (location, memo) => {
    onMemoChange(city, districtId, location.number, memo);
  };

  // 投票区ヘッダーのクリック処理（トグル）
  const handleHeaderClick = (e) => {
    if (e.target.type === 'checkbox' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  // チェックボックスの状態をref経由で設定
  useEffect(() => {
    const checkbox = document.querySelector(`#district-checkbox-${districtId}`);
    if (checkbox) {
      checkbox.indeterminate = districtCheckboxState === 'indeterminate';
    }
  }, [districtCheckboxState, districtId]);

  return (
    <div className="voting-district">
      <div className="district-header" onClick={handleHeaderClick}>
        <div className="district-header-content">
          <input
            id={`district-checkbox-${districtId}`}
            type="checkbox"
            className="district-checkbox"
            checked={districtCheckboxState === 'checked'}
            onChange={handleDistrictCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
          <h3 className="district-title">
            投票区 {districtId} ({locations.length}箇所)
          </h3>
          <button
            className={`district-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            ▶
          </button>
        </div>
        
        <div className="district-memo">
          <textarea
            className="memo-input"
            placeholder="投票区のメモを入力..."
            value={districtMemo}
            onChange={handleDistrictMemoChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="locations-list">
          {locations.map(location => (
            <LocationItem
              key={location.number}
              location={location}
              districtId={districtId}
              isChecked={checkStates[`${districtId}-${location.number}`] || false}
              memo={memos[`${districtId}-${location.number}`] || ''}
              onCheckboxChange={handleLocationCheckboxChange}
              onMemoChange={handleLocationMemoChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 掲示場所アイテムコンポーネント
const LocationItem = ({ 
  location, 
  districtId, 
  isChecked, 
  memo, 
  onCheckboxChange, 
  onMemoChange 
}) => {
  const handleCheckboxChange = (e) => {
    onCheckboxChange(location, e.target.checked);
  };

  const handleMemoChange = (e) => {
    onMemoChange(location, e.target.value);
  };

  return (
    <div className="location-item">
      <div className="location-header">
        <input
          type="checkbox"
          className="location-checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <div className="location-info">
          <div className="location-name">{location.name}</div>
          <div className="location-address">{location.address}</div>
          {location.remark && (
            <div className="location-remark">備考: {location.remark}</div>
          )}
        </div>
      </div>
      
      <div className="location-memo">
        <textarea
          className="memo-input"
          placeholder="掲示場所のメモを入力..."
          value={memo}
          onChange={handleMemoChange}
        />
      </div>
    </div>
  );
};

export default VotingDistrict; 
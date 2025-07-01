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
  const [showMemos, setShowMemos] = useState({});
  const [copySuccess, setCopySuccess] = useState({});
  
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
    if (e.target.type === 'checkbox' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
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

  // メモがある場合は自動でメモ欄を表示
  useEffect(() => {
    if (districtMemo) {
      setShowMemos(prev => ({ ...prev, [`district-${districtId}`]: true }));
    }
  }, [districtMemo, districtId]);

  // 住所をクリップボードにコピー
  const copyAddress = async (address, locationId) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(prev => ({ ...prev, [locationId]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [locationId]: false }));
      }, 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      // フォールバック: テキスト選択
      const textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(prev => ({ ...prev, [locationId]: true }));
        setTimeout(() => {
          setCopySuccess(prev => ({ ...prev, [locationId]: false }));
        }, 2000);
      } catch (fallbackErr) {
        console.error('フォールバックコピーも失敗しました:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const checkedCount = locations.filter(location => 
    checkStates[`${districtId}-${location.number}`]
  ).length;

  const shouldShowDistrictMemo = showMemos[`district-${districtId}`] || districtMemo;

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
          <div className="district-info">
            <h3 className="district-title">
              投票区 {districtId}
            </h3>
            <span className="district-count">
              {locations.length}箇所
              {someLocationsChecked && (
                <span className="progress-indicator">
                  ({checkedCount}/{locations.length}完了)
                </span>
              )}
            </span>
          </div>
          <button
            className={`district-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            ▼
          </button>
        </div>
        
        <div className="district-actions">
          {!shouldShowDistrictMemo && (
            <button
              className="memo-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMemos(prev => ({ ...prev, [`district-${districtId}`]: true }));
              }}
            >
              📝 メモを追加
            </button>
          )}
          
          {shouldShowDistrictMemo && (
            <div className="district-memo">
              <textarea
                className="memo-input"
                placeholder="投票区のメモを入力..."
                value={districtMemo}
                onChange={handleDistrictMemoChange}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="memo-close"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!districtMemo) {
                    setShowMemos(prev => ({ ...prev, [`district-${districtId}`]: false }));
                  }
                }}
                title="メモを閉じる"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="locations-list">
          {locations.map(location => {
            const locationKey = `${districtId}-${location.number}`;
            const locationMemoKey = `${districtId}-${location.number}`;
            const hasLocationMemo = memos[locationMemoKey] && memos[locationMemoKey].trim() !== '';
            const shouldShowLocationMemo = showMemos[`location-${locationKey}`] || hasLocationMemo;

            return (
              <div key={location.number} className="location-item">
                <div className="location-header">
                  <input
                    type="checkbox"
                    className="location-checkbox"
                    checked={checkStates[locationKey] || false}
                    onChange={(e) => handleLocationCheckboxChange(location, e.target.checked)}
                  />
                  <div className="location-info">
                    <div className="location-name">{location.name}</div>
                    <div className="location-address">{location.address}</div>
                    <button
                      className={`copy-address-btn ${copySuccess[locationKey] ? 'copied' : ''}`}
                      onClick={() => copyAddress(location.address, locationKey)}
                      title="住所をクリップボードにコピー"
                    >
                      {copySuccess[locationKey] ? '✅ コピー済み' : '📍 住所をコピー'}
                    </button>
                    {location.remark && (
                      <div className="location-remark">備考: {location.remark}</div>
                    )}
                  </div>
                </div>
                
                <div className="location-actions">
                  {!shouldShowLocationMemo && (
                    <button
                      className="memo-button small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMemos(prev => ({ ...prev, [`location-${locationKey}`]: true }));
                      }}
                    >
                      📝 メモを追加
                    </button>
                  )}
                </div>

                {shouldShowLocationMemo && (
                  <div className="location-memo">
                    <textarea
                      className="memo-input small"
                      placeholder="メモを入力..."
                      value={memos[locationMemoKey] || ''}
                      onChange={(e) => handleLocationMemoChange(location, e.target.value)}
                    />
                    <button
                      className="memo-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!memos[locationMemoKey]) {
                          setShowMemos(prev => ({ ...prev, [`location-${locationKey}`]: false }));
                        }
                      }}
                      title="メモを閉じる"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VotingDistrict; 
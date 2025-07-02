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
  const [editingComments, setEditingComments] = useState({});
  const [tempComments, setTempComments] = useState({});
  const [copySuccess, setCopySuccess] = useState({});
  
  // 投票区のチェック状態を取得
  const districtKey = `${districtId}-district`;
  const isDistrictChecked = checkStates[districtKey] || false;
  
  // 投票区のコメントを取得
  const districtComment = memos[districtKey] || '';
  
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

  // コメント編集開始
  const startEditingComment = (key, currentComment) => {
    setEditingComments(prev => ({ ...prev, [key]: true }));
    setTempComments(prev => ({ ...prev, [key]: currentComment }));
  };

  // コメント保存
  const saveComment = (key, isDistrict = false) => {
    const comment = tempComments[key] || '';
    if (isDistrict) {
      onMemoChange(city, districtId, null, comment);
    } else {
      const locationNumber = key.split('-').pop();
      onMemoChange(city, districtId, locationNumber, comment);
    }
    setEditingComments(prev => ({ ...prev, [key]: false }));
    setTempComments(prev => ({ ...prev, [key]: '' }));
  };

  // コメント編集キャンセル
  const cancelEditComment = (key) => {
    setEditingComments(prev => ({ ...prev, [key]: false }));
    setTempComments(prev => ({ ...prev, [key]: '' }));
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

  const districtCommentKey = `district-${districtId}`;
  const isEditingDistrictComment = editingComments[districtCommentKey];

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
          {/* コメント機能 */}
          {!districtComment && !isEditingDistrictComment && (
            <button
              className="comment-button"
              onClick={(e) => {
                e.stopPropagation();
                startEditingComment(districtCommentKey, '');
              }}
            >
              💬 コメント追加
            </button>
          )}
          
          {districtComment && !isEditingDistrictComment && (
            <div className="comment-display">
              <span className="comment-text">{districtComment}</span>
              <button
                className="comment-edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditingComment(districtCommentKey, districtComment);
                }}
              >
                ✏️
              </button>
            </div>
          )}
          
          {isEditingDistrictComment && (
            <div className="comment-editor">
              <textarea
                className="comment-input"
                placeholder="投票区のコメントを入力..."
                value={tempComments[districtCommentKey] || ''}
                onChange={(e) => {
                  e.stopPropagation();
                  setTempComments(prev => ({ ...prev, [districtCommentKey]: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="comment-buttons">
                <button
                  className="comment-save-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveComment(districtCommentKey, true);
                  }}
                >
                  保存
                </button>
                <button
                  className="comment-cancel-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelEditComment(districtCommentKey);
                  }}
                >
                  取り消し
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="locations-list">
          {locations.map(location => {
            const locationKey = `${districtId}-${location.number}`;
            const locationCommentKey = `location-${locationKey}`;
            const locationComment = memos[locationKey] || '';
            const isEditingLocationComment = editingComments[locationCommentKey];

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
                  {/* 掲示場所のコメント機能 */}
                  {!locationComment && !isEditingLocationComment && (
                    <button
                      className="comment-button small"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingComment(locationCommentKey, '');
                      }}
                    >
                      💬 コメント追加
                    </button>
                  )}
                  
                  {locationComment && !isEditingLocationComment && (
                    <div className="comment-display small">
                      <span className="comment-text">{locationComment}</span>
                      <button
                        className="comment-edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingComment(locationCommentKey, locationComment);
                        }}
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  
                  {isEditingLocationComment && (
                    <div className="comment-editor small">
                      <textarea
                        className="comment-input small"
                        placeholder="コメントを入力..."
                        value={tempComments[locationCommentKey] || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          setTempComments(prev => ({ ...prev, [locationCommentKey]: e.target.value }));
                        }}
                      />
                      <div className="comment-buttons">
                        <button
                          className="comment-save-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveComment(locationCommentKey, false);
                          }}
                        >
                          保存
                        </button>
                        <button
                          className="comment-cancel-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditComment(locationCommentKey);
                          }}
                        >
                          取り消し
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VotingDistrict; 

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
  const districtCheckData = checkStates[districtKey] || { checked: false, lastUpdated: null };
  const isDistrictChecked = districtCheckData.checked || false;
  
  // 投票区のコメントキー（統一）
  const districtCommentKey = districtKey; // `${districtId}-district`と同じ
  
  // 投票区のコメントを取得（配列形式）
  const getCommentsFromData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }
    
    if (typeof data === 'string') {
      try {
        // JSON文字列として解析を試行
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        // パースできたがオブジェクトの場合は配列として扱う
        if (typeof parsed === 'object' && parsed !== null) {
          return [{ id: '1', text: JSON.stringify(parsed), timestamp: new Date().toISOString() }];
        }
        // パースできたが配列でもオブジェクトでもない場合
        return [{ id: '1', text: String(parsed), timestamp: new Date().toISOString() }];
      } catch (e) {
        // JSON解析に失敗した場合は文字列として扱う
        return [{ id: '1', text: data, timestamp: new Date().toISOString() }];
      }
    }
    
    if (data && typeof data === 'object') {
      return [{ id: '1', text: JSON.stringify(data), timestamp: new Date().toISOString() }];
    }
    
    return [];
  };

  const districtComments = getCommentsFromData(memos[districtCommentKey]);
  
  // 全ての掲示場所がチェック済みかどうかを確認
  const allLocationsChecked = locations.every(location => {
    const checkData = checkStates[`${districtId}-${location.number}`];
    return checkData?.checked || false;
  });
  
  // 一部の掲示場所がチェック済みかどうかを確認
  const someLocationsChecked = locations.some(location => {
    const checkData = checkStates[`${districtId}-${location.number}`];
    return checkData?.checked || false;
  });

  // 投票区チェックボックスの状態を計算
  const districtCheckboxState = allLocationsChecked ? 'checked' : 
    (someLocationsChecked ? 'indeterminate' : 'unchecked');

  // 投票区チェックボックスのクリック処理
  const handleDistrictCheckboxChange = (e) => {
    e.stopPropagation();
    const shouldCheck = !allLocationsChecked;
    
    // 確認ポップアップを表示
    const action = shouldCheck ? 'チェックを入れます' : 'チェックを外します';
    const message = `投票区 ${districtId} の全ての掲示場所（${locations.length}箇所）に${action}。よろしいですか？`;
    
    if (!window.confirm(message)) {
      return; // キャンセルされた場合は処理を中止
    }
    
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

  // 日時フォーマット関数
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 新しいコメント追加開始
  const startAddingComment = (key) => {
    setEditingComments(prev => ({ ...prev, [`${key}-new`]: true }));
    setTempComments(prev => ({ ...prev, [`${key}-new`]: '' }));
  };

  // コメント編集開始
  const startEditingComment = (key, commentId, currentText) => {
    setEditingComments(prev => ({ ...prev, [`${key}-edit-${commentId}`]: true }));
    setTempComments(prev => ({ ...prev, [`${key}-edit-${commentId}`]: currentText }));
  };

  // 新しいコメント保存
  const saveNewComment = (key, isDistrict = false) => {
    const text = tempComments[`${key}-new`] || '';
    if (!text.trim()) return;

    // 既存のコメントを配列形式に変換
    const currentComments = getCommentsFromData(memos[key]);

    const newComment = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    const updatedComments = [...currentComments, newComment];
    
    if (isDistrict) {
      onMemoChange(city, districtId, null, updatedComments);
    } else {
      const locationNumber = key.split('-').pop();
      onMemoChange(city, districtId, locationNumber, updatedComments);
    }
    
    setEditingComments(prev => ({ ...prev, [`${key}-new`]: false }));
    setTempComments(prev => ({ ...prev, [`${key}-new`]: '' }));
  };

  // コメント編集保存
  const saveEditComment = (key, commentId, isDistrict = false) => {
    const newText = tempComments[`${key}-edit-${commentId}`] || '';
    if (!newText.trim()) return;

    // 既存のコメントを配列形式に変換
    const currentComments = getCommentsFromData(memos[key]);

    const updatedComments = currentComments.map(comment => 
      comment.id === commentId 
        ? { ...comment, text: newText.trim(), timestamp: new Date().toISOString() }
        : comment
    );
    
    if (isDistrict) {
      onMemoChange(city, districtId, null, updatedComments);
    } else {
      const locationNumber = key.split('-').pop();
      onMemoChange(city, districtId, locationNumber, updatedComments);
    }
    
    setEditingComments(prev => ({ ...prev, [`${key}-edit-${commentId}`]: false }));
    setTempComments(prev => ({ ...prev, [`${key}-edit-${commentId}`]: '' }));
  };

  // コメント削除
  const deleteComment = (key, commentId, isDistrict = false) => {
    if (!window.confirm('このコメントを削除しますか？')) return;

    // 既存のコメントを配列形式に変換
    const currentComments = getCommentsFromData(memos[key]);

    const updatedComments = currentComments.filter(comment => comment.id !== commentId);
    
    if (isDistrict) {
      onMemoChange(city, districtId, null, updatedComments);
    } else {
      const locationNumber = key.split('-').pop();
      onMemoChange(city, districtId, locationNumber, updatedComments);
    }
  };

  // 編集キャンセル
  const cancelEdit = (editKey) => {
    setEditingComments(prev => ({ ...prev, [editKey]: false }));
    setTempComments(prev => ({ ...prev, [editKey]: '' }));
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

  const checkedCount = locations.filter(location => {
    const checkData = checkStates[`${districtId}-${location.number}`];
    return checkData?.checked || false;
  }).length;

  const isAddingDistrictComment = editingComments[`${districtCommentKey}-new`];

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
            {districtCheckData.lastUpdated && (
              <div className="last-updated">
                最終更新: {formatDateTime(districtCheckData.lastUpdated)}
              </div>
            )}
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
          {/* 投票区のコメント機能 */}
          <div className="comments-section">
            {/* 既存のコメント表示 */}
            {districtComments.map(comment => {
              const editKey = `${districtCommentKey}-edit-${comment.id}`;
              const isEditing = editingComments[editKey];
              
              return (
                <div key={comment.id} className="comment-item">
                  {!isEditing ? (
                    <div className="comment-display">
                      <div className="comment-content">
                        <div className="comment-text">{comment.text}</div>
                        <div className="comment-timestamp">
                          {formatDateTime(comment.timestamp)}
                        </div>
                      </div>
                      <div className="comment-actions">
                        <button
                          className="comment-edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingComment(districtCommentKey, comment.id, comment.text);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="comment-delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComment(districtCommentKey, comment.id, true);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="comment-editor">
                      <textarea
                        className="comment-input"
                        value={tempComments[editKey] || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          setTempComments(prev => ({ ...prev, [editKey]: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="comment-buttons">
                        <button
                          className="comment-save-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEditComment(districtCommentKey, comment.id, true);
                          }}
                        >
                          保存
                        </button>
                        <button
                          className="comment-cancel-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit(editKey);
                          }}
                        >
                          取り消し
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* 新しいコメント追加 */}
            {!isAddingDistrictComment && (
              <button
                className="comment-add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  startAddingComment(districtCommentKey);
                }}
              >
                💬 コメント追加
              </button>
            )}
            
            {isAddingDistrictComment && (
              <div className="comment-editor">
                <textarea
                  className="comment-input"
                  placeholder="投票区のコメントを入力..."
                  value={tempComments[`${districtCommentKey}-new`] || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    setTempComments(prev => ({ ...prev, [`${districtCommentKey}-new`]: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="comment-buttons">
                  <button
                    className="comment-save-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveNewComment(districtCommentKey, true);
                    }}
                  >
                    保存
                  </button>
                  <button
                    className="comment-cancel-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEdit(`${districtCommentKey}-new`);
                    }}
                  >
                    取り消し
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="locations-list">
          {locations.map(location => {
            const locationKey = `${districtId}-${location.number}`;
            const locationCheckData = checkStates[locationKey] || { checked: false, lastUpdated: null };
            const locationComments = getCommentsFromData(memos[locationKey]);
            const isAddingLocationComment = editingComments[`${locationKey}-new`];

            return (
              <div key={location.number} className="location-item">
                <div className="location-header">
                  <input
                    type="checkbox"
                    className="location-checkbox"
                    checked={locationCheckData.checked || false}
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

                    {locationCheckData.lastUpdated && (
                      <div className="last-updated small">
                        最終更新: {formatDateTime(locationCheckData.lastUpdated)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="location-actions">
                  {/* 掲示場所のコメント機能 */}
                  <div className="comments-section small">
                    {/* 既存のコメント表示 */}
                    {locationComments.map(comment => {
                      const editKey = `${locationKey}-edit-${comment.id}`;
                      const isEditing = editingComments[editKey];
                      
                      return (
                        <div key={comment.id} className="comment-item small">
                          {!isEditing ? (
                            <div className="comment-display small">
                              <div className="comment-content">
                                <div className="comment-text">{comment.text}</div>
                                <div className="comment-timestamp">
                                  {formatDateTime(comment.timestamp)}
                                </div>
                              </div>
                              <div className="comment-actions">
                                <button
                                  className="comment-edit-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingComment(locationKey, comment.id, comment.text);
                                  }}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="comment-delete-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteComment(locationKey, comment.id, false);
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="comment-editor small">
                              <textarea
                                className="comment-input small"
                                value={tempComments[editKey] || ''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setTempComments(prev => ({ ...prev, [editKey]: e.target.value }));
                                }}
                              />
                              <div className="comment-buttons">
                                <button
                                  className="comment-save-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    saveEditComment(locationKey, comment.id, false);
                                  }}
                                >
                                  保存
                                </button>
                                <button
                                  className="comment-cancel-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEdit(editKey);
                                  }}
                                >
                                  取り消し
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* 新しいコメント追加 */}
                    {!isAddingLocationComment && (
                      <button
                        className="comment-add-button small"
                        onClick={(e) => {
                          e.stopPropagation();
                          startAddingComment(locationKey);
                        }}
                      >
                        💬 コメント追加
                      </button>
                    )}
                    
                    {isAddingLocationComment && (
                      <div className="comment-editor small">
                        <textarea
                          className="comment-input small"
                          placeholder="コメントを入力..."
                          value={tempComments[`${locationKey}-new`] || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            setTempComments(prev => ({ ...prev, [`${locationKey}-new`]: e.target.value }));
                          }}
                        />
                        <div className="comment-buttons">
                          <button
                            className="comment-save-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveNewComment(locationKey, false);
                            }}
                          >
                            保存
                          </button>
                          <button
                            className="comment-cancel-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEdit(`${locationKey}-new`);
                            }}
                          >
                            取り消し
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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

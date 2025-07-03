import React, { useState, useEffect } from 'react';
import VotingDistrictsList from './components/VotingDistrictsList';
import './App.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('suita');
  const [data, setData] = useState({ minoo: [], suita: [] });
  const [loading, setLoading] = useState(true);
  const [checkStates, setCheckStates] = useState({
    minoo: {},
    suita: {}
  });
  const [memos, setMemos] = useState({
    minoo: {},
    suita: {}
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isEditingAnything, setIsEditingAnything] = useState(false);

  // CSVデータをJSONに変換する関数
  const csvToJson = (csvText) => {
    const lines = csvText.trim().split('\n');
    
    const result = {};
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const votingDistrict = values[0];
      
      if (!result[votingDistrict]) {
        result[votingDistrict] = [];
      }
      
      result[votingDistrict].push({
        number: values[1],
        address: values[2],
        remark: values[3],
        name: values[4]
      });
    }
    
    return result;
  };

  // APIから状態データを読み込む
  const loadStatesFromAPI = async (city) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/states/${city}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('API状態取得エラー:', response.status);
        return { checkStates: {}, memos: {} };
      }
    } catch (error) {
      console.error('API接続エラー:', error);
      return { checkStates: {}, memos: {} };
    }
  };

  // データを読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        const [minooResponse, suitaResponse] = await Promise.all([
          fetch('/minoo.csv'),
          fetch('/suita.csv')
        ]);
        
        const minooText = await minooResponse.text();
        const suitaText = await suitaResponse.text();
        
        const minooData = csvToJson(minooText);
        const suitaData = csvToJson(suitaText);
        
        setData({
          minoo: minooData,
          suita: suitaData
        });
        
        // APIから状態データを読み込み
        const [minooStates, suitaStates] = await Promise.all([
          loadStatesFromAPI('minoo'),
          loadStatesFromAPI('suita')
        ]);
        
              // チェック状態を新しいフォーマットに変換（後方互換性のため）
      const convertCheckStates = (states) => {
        const converted = {};
        for (const [key, value] of Object.entries(states || {})) {
          if (typeof value === 'boolean') {
            // 旧APIからの単純なboolean値を新しいフォーマットに変換
            converted[key] = {
              checked: value,
              lastUpdated: null
            };
          } else if (typeof value === 'object' && value !== null && 'checked' in value) {
            // 新しいフォーマット（checked + lastUpdated）はそのまま使用
            converted[key] = {
              checked: value.checked || false,
              lastUpdated: value.lastUpdated || null
            };
          } else {
            // その他の場合はfalseとして扱う
            converted[key] = {
              checked: false,
              lastUpdated: null
            };
          }
        }
        return converted;
      };

        setCheckStates({
          minoo: convertCheckStates(minooStates.checkStates),
          suita: convertCheckStates(suitaStates.checkStates)
        });
        
        setMemos({
          minoo: minooStates.memos || {},
          suita: suitaStates.memos || {}
        });
        
        setLoading(false);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // チェック状態をAPIに送信
  const updateCheckStateAPI = async (city, districtId, locationId, checked) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/states/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          districtId,
          locationId,
          isChecked: checked
        })
      });
      
      if (!response.ok) {
        console.error('チェック状態更新エラー:', response.status);
      }
    } catch (error) {
      console.error('API通信エラー:', error);
    }
  };

  // メモをAPIに送信
  const updateMemoAPI = async (city, districtId, locationId, memo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/states/memo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          districtId,
          locationId,
          memo
        })
      });
      
      if (!response.ok) {
        console.error('メモ更新エラー:', response.status);
      }
    } catch (error) {
      console.error('API通信エラー:', error);
    }
  };

  const updateCheckState = (city, districtId, locationId, checked) => {
    const timestamp = new Date().toISOString();
    
    // ローカル状態を即座に更新（日時情報付き）
    setCheckStates(prev => ({
      ...prev,
      [city]: {
        ...prev[city],
        [`${districtId}-${locationId || 'district'}`]: {
          checked: checked,
          lastUpdated: timestamp
        }
      }
    }));
    
    // APIに送信（非同期）
    updateCheckStateAPI(city, districtId, locationId, checked);
  };

  const updateMemo = (city, districtId, locationId, memo) => {
    // ローカル状態を即座に更新
    setMemos(prev => ({
      ...prev,
      [city]: {
        ...prev[city],
        [`${districtId}-${locationId || 'district'}`]: memo
      }
    }));
    
    // APIに送信（非同期）
    updateMemoAPI(city, districtId, locationId, memo);
  };

  // 最新データを取得する更新機能
  const refreshData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      // APIから最新の状態データを読み込み
      const [minooStates, suitaStates] = await Promise.all([
        loadStatesFromAPI('minoo'),
        loadStatesFromAPI('suita')
      ]);

      // チェック状態を新しいフォーマットに変換（後方互換性のため）
      const convertCheckStates = (states) => {
        const converted = {};
        for (const [key, value] of Object.entries(states || {})) {
          if (typeof value === 'boolean') {
            // 旧APIからの単純なboolean値を新しいフォーマットに変換
            converted[key] = {
              checked: value,
              lastUpdated: null
            };
          } else if (typeof value === 'object' && value !== null && 'checked' in value) {
            // 新しいフォーマット（checked + lastUpdated）はそのまま使用
            converted[key] = {
              checked: value.checked || false,
              lastUpdated: value.lastUpdated || null
            };
          } else {
            // その他の場合はfalseとして扱う
            converted[key] = {
              checked: false,
              lastUpdated: null
            };
          }
        }
        return converted;
      };

      setCheckStates({
        minoo: convertCheckStates(minooStates.checkStates),
        suita: convertCheckStates(suitaStates.checkStates)
      });

      setMemos({
        minoo: minooStates.memos || {},
        suita: suitaStates.memos || {}
      });

    } catch (error) {
      console.error('データの更新に失敗しました:', error);
      if (!silent) {
        alert('データの更新に失敗しました。もう一度お試しください。');
      }
      // エラー時は自動更新を一時停止
      setAutoRefreshEnabled(false);
      setTimeout(() => setAutoRefreshEnabled(true), 60000); // 1分後に再開
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // 自動更新機能
  useEffect(() => {
    if (!autoRefreshEnabled || isEditingAnything || loading) {
      return;
    }

    // Page Visibility APIを使用してページがアクティブな時のみ実行
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRefreshEnabled && !isEditingAnything) {
        refreshData(true); // サイレント更新
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 30秒間隔で自動更新
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isEditingAnything && !isRefreshing) {
        refreshData(true); // サイレント更新
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoRefreshEnabled, isEditingAnything, loading, isRefreshing]);

  // 編集状態を管理する関数
  const setEditingState = (isEditing) => {
    setIsEditingAnything(isEditing);
  };

  // データエクスポート機能
  const exportData = () => {
    const password = prompt('エクスポート用パスワードを入力してください:');
    if (password !== 'azuma') {
      alert('パスワードが正しくありません。');
      return;
    }

    try {
      // エクスポートするデータを準備
      const exportData = {
        timestamp: new Date().toISOString(),
        cities: {}
      };

      ['minoo', 'suita'].forEach(city => {
        const cityData = data[city];
        const cityCheckStates = checkStates[city] || {};
        const cityMemos = memos[city] || {};

        exportData.cities[city] = {
          name: city === 'minoo' ? '箕面市' : '吹田市',
          districts: {}
        };

        if (cityData && typeof cityData === 'object') {
          Object.keys(cityData).forEach(districtId => {
            const locations = cityData[districtId];
            exportData.cities[city].districts[districtId] = {
              locations: locations.map(location => {
                const locationKey = `${districtId}-${location.number}`;
                const checkData = cityCheckStates[locationKey] || { checked: false, lastUpdated: null };
                const locationMemos = cityMemos[locationKey] || [];

                return {
                  number: location.number,
                  name: location.name,
                  address: location.address,
                  remark: location.remark,
                  isChecked: checkData.checked,
                  lastUpdated: checkData.lastUpdated,
                  comments: Array.isArray(locationMemos) ? locationMemos : 
                    (locationMemos ? [{ id: '1', text: locationMemos, timestamp: new Date().toISOString() }] : [])
                };
              }),
              districtComments: (() => {
                const districtKey = `${districtId}-district`;
                const districtCheckData = cityCheckStates[districtKey] || { checked: false, lastUpdated: null };
                const districtMemos = cityMemos[districtKey] || [];
                
                return {
                  isChecked: districtCheckData.checked,
                  lastUpdated: districtCheckData.lastUpdated,
                  comments: Array.isArray(districtMemos) ? districtMemos : 
                    (districtMemos ? [{ id: '1', text: districtMemos, timestamp: new Date().toISOString() }] : [])
                };
              })()
            };
          });
        }
      });

      // JSONファイルとしてダウンロード
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('データをエクスポートしました。');
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました。');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>参院選2025 大阪府<br />選挙ポスター貼り付け状況</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'suita' ? 'active' : ''}`}
            onClick={() => setActiveTab('suita')}
          >
            吹田市
          </button>
          <button 
            className={`tab ${activeTab === 'minoo' ? 'active' : ''}`}
            onClick={() => setActiveTab('minoo')}
          >
            箕面市
          </button>
        </div>
      </header>

      <main className="main-content">
        <VotingDistrictsList
          data={data[activeTab]}
          city={activeTab}
          checkStates={checkStates[activeTab] || {}}
          memos={memos[activeTab] || {}}
          onCheckStateChange={updateCheckState}
          onMemoChange={updateMemo}
          onRefresh={refreshData}
          isRefreshing={isRefreshing}
          autoRefreshEnabled={autoRefreshEnabled}
          setAutoRefreshEnabled={setAutoRefreshEnabled}
          onEditingStateChange={setEditingState}
          onExportData={exportData}
        />
      </main>
    </div>
  );
}

export default App; 
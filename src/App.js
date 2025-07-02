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
        
        // チェック状態を新しいフォーマットに変換
        const convertCheckStates = (states) => {
          const converted = {};
          for (const [key, value] of Object.entries(states || {})) {
            if (typeof value === 'boolean') {
              // 既存の単純なboolean値を新しいフォーマットに変換
              converted[key] = {
                checked: value,
                lastUpdated: null // 既存データには日時がないため null
              };
            } else if (typeof value === 'object' && value !== null) {
              // 既に新しいフォーマットの場合はそのまま使用
              converted[key] = value;
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
        />
      </main>
    </div>
  );
}

export default App; 
import React, { useState, useEffect } from 'react';
import VotingDistrictsList from './components/VotingDistrictsList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('minoo');
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
    const headers = lines[0].split(',');
    
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

  // 共有データを読み込む関数
  const loadSharedData = async () => {
    try {
      const response = await fetch('/shared-data.json');
      if (response.ok) {
        const sharedData = await response.json();
        setCheckStates(sharedData.checkStates || { minoo: {}, suita: {} });
        setMemos(sharedData.memos || { minoo: {}, suita: {} });
        console.log('共有データを読み込みました');
      } else {
        console.log('共有データが見つかりません。ローカルデータを使用します。');
      }
    } catch (error) {
      console.log('共有データの読み込みに失敗しました。ローカルデータを使用します。');
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
        
        // 共有データを読み込み
        await loadSharedData();
        
        // ローカルストレージから状態を復元（フォールバック）
        const savedCheckStates = localStorage.getItem('posterCheckStates');
        const savedMemos = localStorage.getItem('posterMemos');
        
        if (savedCheckStates && Object.keys(checkStates.minoo).length === 0 && Object.keys(checkStates.suita).length === 0) {
          setCheckStates(JSON.parse(savedCheckStates));
        }
        
        if (savedMemos && Object.keys(memos.minoo).length === 0 && Object.keys(memos.suita).length === 0) {
          setMemos(JSON.parse(savedMemos));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 状態変更を保存
  useEffect(() => {
    localStorage.setItem('posterCheckStates', JSON.stringify(checkStates));
  }, [checkStates]);

  useEffect(() => {
    localStorage.setItem('posterMemos', JSON.stringify(memos));
  }, [memos]);

  const updateCheckState = (city, districtId, locationId, checked) => {
    setCheckStates(prev => ({
      ...prev,
      [city]: {
        ...prev[city],
        [`${districtId}-${locationId || 'district'}`]: checked
      }
    }));
  };

  const updateMemo = (city, districtId, locationId, memo) => {
    setMemos(prev => ({
      ...prev,
      [city]: {
        ...prev[city],
        [`${districtId}-${locationId || 'district'}`]: memo
      }
    }));
  };

  // データをJSONファイルとしてダウンロード
  const exportData = () => {
    const exportData = {
      checkStates,
      memos,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shared-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSONファイルをインポート
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.checkStates && importedData.memos) {
          setCheckStates(importedData.checkStates);
          setMemos(importedData.memos);
          alert('データをインポートしました！');
        } else {
          alert('無効なデータファイルです。');
        }
      } catch (error) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    
    // ファイル選択をリセット
    event.target.value = '';
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
        <h1>参院選2025 大阪府選挙ポスター貼り付け状況</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'minoo' ? 'active' : ''}`}
            onClick={() => setActiveTab('minoo')}
          >
            箕面市
          </button>
          <button 
            className={`tab ${activeTab === 'suita' ? 'active' : ''}`}
            onClick={() => setActiveTab('suita')}
          >
            吹田市
          </button>
        </div>
        
        <div className="data-sharing">
          <div className="sharing-buttons">
            <button className="share-button export" onClick={exportData}>
              📤 データをエクスポート
            </button>
            <label className="share-button import">
              📥 データをインポート
              <input
                type="file"
                accept=".json"
                onChange={importData}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <p className="sharing-help">
            💡 エクスポートしたファイルを共有して、チーム間でデータを同期できます
          </p>
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
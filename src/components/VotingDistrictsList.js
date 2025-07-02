import React from 'react';
import VotingDistrict from './VotingDistrict';

const VotingDistrictsList = ({ 
  data, 
  city, 
  checkStates, 
  memos, 
  onCheckStateChange, 
  onMemoChange,
  onRefresh,
  isRefreshing
}) => {
  // Google Mapsリンクデータ
  const mapsLinksData = {
    minoo: [
      { range: '1-10', url: 'https://www.google.com/maps/d/u/0/edit?mid=1MRDYWFjH_r7zeNf_iYhD_whTa7YHpG0&usp=sharing' },
      { range: '11-20', url: 'https://www.google.com/maps/d/u/0/edit?mid=1NfzNegtDQATTY1Z_IeMR6a7p_qFwu_M&usp=sharing' },
      { range: '21-30', url: 'https://www.google.com/maps/d/u/0/edit?mid=1c7JX9zfwD3j2QJyzAxWoK38K3SazHik&usp=sharing' },
      { range: '31-38', url: 'https://www.google.com/maps/d/u/0/edit?mid=1WikfiaU3YKb348Ho31I6o06QR0KuA1A&usp=sharing' }
    ],
    suita: [
      { range: '101-110', url: 'https://www.google.com/maps/d/u/0/edit?mid=1Ot9m7j_ZzSPLGyR0EqOMH_yztiC2CfE&usp=sharing' },
      { range: '111-133', url: 'https://www.google.com/maps/d/u/0/edit?mid=1cYBM5hzJoY37Xw9gGgheLFFO9bZmApI&usp=sharing' },
      { range: '134-145', url: 'https://www.google.com/maps/d/u/0/edit?mid=1pTeUw-OJDJGtZxFDk0lyp41lxwPPuK0&usp=sharing' },
      { range: '151-161', url: 'https://www.google.com/maps/d/u/0/edit?mid=1U45Y7I1QCYdVUvAXIgT-aspnvsWYg2o&usp=sharing' },
      { range: '162-183', url: 'https://www.google.com/maps/d/u/0/edit?mid=1OE8O_NEk4nY1ede0xi5D_uKYEiOjQG4&usp=sharing' },
      { range: '184-194', url: 'https://www.google.com/maps/d/u/0/edit?mid=1GpmSpTjw_5hQWm8GZDq4UjdD6vBf7KM&usp=sharing' }
    ]
  };

  // データがオブジェクトの場合、投票区IDでソート
  const sortedDistricts = data && typeof data === 'object' 
    ? Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b))
    : [];

  // 進捗状況を計算
  const calculateProgress = () => {
    if (!data || sortedDistricts.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    let totalLocations = 0;
    let completedLocations = 0;

    // 全投票区の全掲示場所をカウント
    sortedDistricts.forEach(districtId => {
      const locations = data[districtId] || [];
      totalLocations += locations.length;
      
      // チェック済みの掲示場所をカウント
      locations.forEach(location => {
        const locationKey = `${districtId}-${location.number}`;
        const checkData = checkStates[locationKey];
        if (checkData?.checked) {
          completedLocations++;
        }
      });
    });

    const percentage = totalLocations > 0 ? Math.round((completedLocations / totalLocations) * 100) : 0;
    
    return {
      completed: completedLocations,
      total: totalLocations,
      percentage: percentage
    };
  };

  const progress = calculateProgress();
  const cityName = city === 'minoo' ? '箕面市' : '吹田市';

  if (!data || sortedDistricts.length === 0) {
    return (
      <div className="no-data">
        <p>データがありません</p>
      </div>
    );
  }

  return (
    <div className="voting-districts-container">
      {/* 進捗状況表示 */}
      <div className="progress-section">
        <h2 className="progress-title">
          📊 {cityName} 進捗状況
        </h2>
        <div className="progress-info">
          <div className="progress-stats">
            <span className="progress-text">
              {progress.completed}/{progress.total} 箇所完了 ({progress.percentage}%)
            </span>
            <button
              className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
              onClick={onRefresh}
              disabled={isRefreshing}
              title="最新の状況に更新"
            >
              {isRefreshing ? '🔄 更新中...' : '🔄 更新'}
            </button>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progress.percentage}%` }}
              >
                <span className="progress-bar-text">
                  {progress.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Mapsリンク表 */}
      {mapsLinksData[city] && mapsLinksData[city].length > 0 && (
        <div className="maps-links-section">
          <h2 className="maps-links-title">
            🗺️ Google Maps リンク ({cityName})
          </h2>
          <table className="maps-links-table">
            <thead>
              <tr>
                <th>投票区</th>
                <th>Google Maps リンク</th>
              </tr>
            </thead>
            <tbody>
              {mapsLinksData[city].map((item, index) => (
                <tr key={index}>
                  <td>{item.range}</td>
                  <td>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      📍 地図を開く
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 投票区一覧 */}
      <div className="voting-districts-list">
        {sortedDistricts.map(districtId => (
          <VotingDistrict
            key={districtId}
            districtId={districtId}
            locations={data[districtId]}
            city={city}
            checkStates={checkStates}
            memos={memos}
            onCheckStateChange={onCheckStateChange}
            onMemoChange={onMemoChange}
          />
        ))}
      </div>
    </div>
  );
};

export default VotingDistrictsList; 
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
  isRefreshing,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
  onEditingStateChange,
  onExportData
}) => {
  // Google Mapsリンクデータ
  const mapsLinksData = {
    minoo: [
      { range: '1-10', url: 'https://www.google.com/maps/d/u/0/edit?mid=1MRDYWFjH_r7zeNf_iYhD_whTa7YHpG0&usp=sharing' },
      { range: '11-20', url: 'https://www.google.com/maps/d/u/0/edit?mid=1NfzNegtDQATTY1Z_IeMR6a7p_qFwu_M&usp=sharing' },
      { range: '21-30', url: 'https://www.google.com/maps/d/u/0/edit?mid=1c7JX9zfwD3j2QJyzAxWoK38K3SazHik&usp=sharing' },
      { range: '31-38', url: 'https://www.google.com/maps/d/u/0/edit?mid=1WikfiaU3YKb348Ho31I6o06QR0KuA1A&usp=sharing' }
    ],
    ibaraki: [
      { 
        range: '全投票区',
        url: 'https://www.google.com/maps/d/u/0/edit?mid=1vvHeU2Nhi3cQcYzQj9-rIaX7JF5zfgk&usp=sharing',
        detailMaps: [
          { range: '1-30', url: 'https://drive.google.com/file/d/1naCGvX0hgwzHdrfvzAzA3Mv_DgZKVCyh/view?usp=drive_link' },
          { range: '31-62', url: 'https://drive.google.com/file/d/1aeM-NuDYy93Mu8lHHWuCrPFvgsFdZGyk/view?usp=drive_link' }
        ]
      }
    ],
    nishiyodogawa: [
      { range: '1-10', url: 'https://www.google.com/maps/d/u/0/edit?mid=1Of8ZHVfYqn7SonodLtTsteroT_6q4ow&usp=sharing' },
      { range: '1-15', url: 'https://www.google.com/maps/d/u/0/edit?mid=1f0ZYtyII-ATepdWdqzvMrrclsIPKfy0&usp=sharing' }
    ],
    suita: [
      { 
        range: '101-110', 
        url: 'https://www.google.com/maps/d/u/0/edit?mid=1Ot9m7j_ZzSPLGyR0EqOMH_yztiC2CfE&usp=sharing',
        detailMaps: [
          { range: '101-113', url: 'https://drive.google.com/file/d/1oguNZq_vwglenpUXxv6QvgX84wqYji4A/view?usp=drive_link' }
        ]
      },
      { 
        range: '111-133', 
        url: 'https://www.google.com/maps/d/u/0/edit?mid=1cYBM5hzJoY37Xw9gGgheLFFO9bZmApI&usp=sharing',
        detailMaps: [
          { range: '101-113', url: 'https://drive.google.com/file/d/1oguNZq_vwglenpUXxv6QvgX84wqYji4A/view?usp=drive_link' },
          { range: '121-124', url: 'https://drive.google.com/file/d/1J0U1uZwtZmOIXJaZ7yKXtf3wFLjAhxaP/view?usp=drive_link' },
          { range: '131-137', url: 'https://drive.google.com/file/d/1bhl0q8p1NUehSQ0xa6tcape_FD35Gw7W/view?usp=drive_link' }
        ]
      },
      { 
        range: '134-145', 
        url: 'https://www.google.com/maps/d/u/0/edit?mid=1pTeUw-OJDJGtZxFDk0lyp41lxwPPuK0&usp=sharing',
        detailMaps: [
          { range: '131-137', url: 'https://drive.google.com/file/d/1bhl0q8p1NUehSQ0xa6tcape_FD35Gw7W/view?usp=drive_link' },
          { range: '141-145', url: 'https://drive.google.com/file/d/1IsUDDKVASTCDy84WhbRautFHmRtWWjYF/view?usp=drive_link' }
        ]
      },
      { 
        range: '151-161', 
        url: 'https://www.google.com/maps/d/u/0/edit?mid=1U45Y7I1QCYdVUvAXIgT-aspnvsWYg2o&usp=sharing',
        detailMaps: [
          { range: '151-159', url: 'https://drive.google.com/file/d/15x4XHRtqCPpMEaEJME1zU4_GHEMela8x/view?usp=drive_link' },
          { range: '161-169', url: 'https://drive.google.com/file/d/1QJzz8UR-T_WxcPQ182uilNIiuSHqGQ_-/view?usp=drive_link' }
        ]
      },
      { 
        range: '162-183', 
        url: 'https://www.google.com/maps/d/u/0/edit?mid=1OE8O_NEk4nY1ede0xi5D_uKYEiOjQG4&usp=sharing',
        detailMaps: [
          { range: '161-169', url: 'https://drive.google.com/file/d/1QJzz8UR-T_WxcPQ182uilNIiuSHqGQ_-/view?usp=drive_link' },
          { range: '181-188', url: 'https://drive.google.com/file/d/1eUw49_H5Vg8arSwaM4AivSScVZe8dpih/view?usp=drive_link' }
        ]
      },
      { 
        range: '184-194', 
        url: 'https://www.google.com/maps/d/u/0/edit?mid=1GpmSpTjw_5hQWm8GZDq4UjdD6vBf7KM&usp=sharing',
        detailMaps: [
          { range: '181-188', url: 'https://drive.google.com/file/d/1eUw49_H5Vg8arSwaM4AivSScVZe8dpih/view?usp=drive_link' },
          { range: '191-194', url: 'https://drive.google.com/file/d/1KCWCotUA2PE0R94tUHDEJ5LcqGduO6I9/view?usp=drive_link' }
        ]
      }
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
  const cityName = city === 'minoo' ? '箕面市' : city === 'suita' ? '吹田市' : city === 'ibaraki' ? '茨木市' : '西淀川区';

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
            <div className="refresh-controls">
              <button
                className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                onClick={() => onRefresh(false)}
                disabled={isRefreshing}
                title="最新の状況に更新"
              >
                {isRefreshing ? '🔄 更新中...' : '🔄 更新'}
              </button>
              <button
                className={`auto-refresh-toggle ${autoRefreshEnabled ? 'enabled' : 'disabled'}`}
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                title={autoRefreshEnabled ? '自動更新を停止' : '自動更新を開始'}
              >
                {autoRefreshEnabled ? '⏸️ 自動更新中' : '▶️ 自動更新停止'}
              </button>
            </div>
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
                <th>Google Maps</th>
                {(city === 'suita' || city === 'ibaraki') && <th>詳細</th>}
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
                  {(city === 'suita' || city === 'ibaraki') && (
                    <td className="detail-maps-cell">
                      {item.detailMaps ? (
                        <div className="detail-maps-list">
                          {item.detailMaps.map((detailMap, detailIndex) => (
                            <div key={detailIndex} className="detail-map-item">
                              <a 
                                href={detailMap.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="detail-map-link"
                                title={`詳細マップ ${detailMap.range}`}
                              >
                                📋 {detailMap.range}
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-detail-map">-</span>
                      )}
                    </td>
                  )}
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
            onEditingStateChange={onEditingStateChange}
          />
        ))}
      </div>

      {/* データエクスポートボタン */}
      <div className="export-section">
        <button
          className="export-button"
          onClick={onExportData}
          title="全データをJSONファイルとしてエクスポート（パスワード保護）"
        >
          📁 データエクスポート
        </button>
      </div>
    </div>
  );
};

export default VotingDistrictsList; 
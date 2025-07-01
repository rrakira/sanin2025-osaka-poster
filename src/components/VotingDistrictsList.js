import React from 'react';
import VotingDistrict from './VotingDistrict';

const VotingDistrictsList = ({ 
  data, 
  city, 
  checkStates, 
  memos, 
  onCheckStateChange, 
  onMemoChange 
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
      // 吹田市のリンクは後で追加予定
    ]
  };

  // データがオブジェクトの場合、投票区IDでソート
  const sortedDistricts = data && typeof data === 'object' 
    ? Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b))
    : [];

  if (!data || sortedDistricts.length === 0) {
    return (
      <div className="no-data">
        <p>データがありません</p>
      </div>
    );
  }

  return (
    <div className="voting-districts-container">
      {/* Google Mapsリンク表（箕面市のみ） */}
      {city === 'minoo' && mapsLinksData[city] && mapsLinksData[city].length > 0 && (
        <div className="maps-links-section">
          <h2 className="maps-links-title">
            🗺️ Google Maps リンク
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
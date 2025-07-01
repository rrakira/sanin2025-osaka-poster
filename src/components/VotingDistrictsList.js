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
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#666' 
      }}>
        データがありません
      </div>
    );
  }

  return (
    <div className="voting-districts-container">
      {Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b)).map(districtId => (
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
  );
};

export default VotingDistrictsList; 
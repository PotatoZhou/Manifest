import React from 'react';

interface QuarterIndicatorProps {
  currentQuarter: number;
}

const QuarterIndicator: React.FC<QuarterIndicatorProps> = ({ currentQuarter }) => {
  return (
    <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px', borderLeft: '5px solid #3498db' }}>
      <h4>
        当前季度：第{currentQuarter + 1}季度
        <span className="current-quarter-indicator">进行中</span>
      </h4>
      <p>系统已智能识别当前季度，方便您查看和更新季度目标。</p>
    </div>
  );
};

export default QuarterIndicator;
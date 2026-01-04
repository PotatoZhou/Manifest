import React, { useState } from 'react';
import { CalendarCheck } from 'lucide-react';

interface Dimension {
  key: string;
  title: string;
  color: string;
}

interface YearData {
  dimensions: Record<string, {
    quarterlyGoals: string[];
    progress: number;
  }>;
}

interface QuarterGoalsProps {
  allDimensions: Dimension[];
  yearData: YearData;
  currentQuarter: number;
}

const QuarterGoals: React.FC<QuarterGoalsProps> = ({ allDimensions, yearData, currentQuarter }) => {
  // 季度选择状态
  const [selectedQuarter, setSelectedQuarter] = useState<number>(currentQuarter);

  // 季度点击处理函数
  const handleQuarterClick = (quarter: number) => {
    setSelectedQuarter(quarter - 1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
            <CalendarCheck size={18} />
          </div>
        <div>
          <div className="card-title">季度目标与进度</div>
          <div className="card-subtitle">查看和管理季度目标</div>
        </div>
      </div>
      
      {/* 季度标签页 */}
      <div className="quarter-tabs">
        {[1, 2, 3, 4].map(quarter => (
          <div
            key={quarter}
            className={`quarter-tab ${quarter - 1 === selectedQuarter ? 'active' : ''}`}
            onClick={() => handleQuarterClick(quarter)}
          >
            第{quarter}季度
          </div>
        ))}
      </div>
      
      {/* 季度内容 */}
      <div className="quarter-content active">
        <div className="quarter-highlight">
          <h4>季度目标</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {allDimensions.map(dimension => {
              const dimensionKey = dimension.key;
              const dimData = yearData.dimensions[dimensionKey];
              const goal = dimData?.quarterlyGoals?.[selectedQuarter] || '未设置季度目标';
              return (
                <div key={dimensionKey} style={{ padding: '10px', borderRadius: '8px', background: '#f8f9fa' }}>
                  <div style={{ fontWeight: 600, marginBottom: '6px' }}>{dimension.title}</div>
                  <div style={{ color: '#7f8c8d' }}>{goal}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="dimension-progress-cards">
          {allDimensions.map(dimension => {
            const dimensionKey = dimension.key;
            const dimData = yearData.dimensions[dimensionKey];
            const dimensionColor = dimension.color;
            return (
              <div key={dimensionKey} className="dimension-progress-card">
                <h5>{dimension.title}</h5>
                <div className="dimension-progress-value">
                  {dimData.progress}%
                </div>
                <div className="dimension-progress-bar">
                  <div 
                    className="dimension-progress-fill"
                    style={{
                      width: `${dimData.progress}%`, 
                      background: dimensionColor
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuarterGoals;
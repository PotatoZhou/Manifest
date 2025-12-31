import React from 'react';
import { Star, Calendar } from 'lucide-react';

interface PlanningViewProps {
  currentYear: string;
  config: {
    title: string;
    color: string;
  };
  dimData: {
    annualGoal: string;
    quarterlyGoals: string[];
  };
  handleAnnualGoalChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleQuarterlyGoalChange: (quarter: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ 
  currentYear, 
  config, 
  dimData, 
  handleAnnualGoalChange, 
  handleQuarterlyGoalChange 
}) => {
  return (
    <div className="view-animate" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 年度核心愿景 */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '16px',
        transition: 'all 0.3s ease'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Star size={18} style={{ color: config.color }} />
          年度核心愿景
        </h3>
        <textarea
          value={dimData.annualGoal}
          onChange={handleAnnualGoalChange}
          placeholder={`输入 ${currentYear} 年的 ${config.title} 维度大方向...`}
          style={{
            width: '100%',
            minHeight: '140px',
            padding: '16px',
            border: '2px solid #f0f0f0',
            borderRadius: '8px',
            fontSize: '1rem',
            lineHeight: '1.6',
            resize: 'vertical',
            transition: 'border-color 0.3s ease',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => e.target.style.borderColor = config.color}
          onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
        />
      </div>

      {/* 季度目标拆解 */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '24px'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Calendar size={18} style={{ color: config.color }} />
          季度目标拆解
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px' 
        }}>
          {[0, 1, 2, 3].map(q => {
            const quarterNames = ['第一季度', '第二季度', '第三季度', '第四季度'];
            const months = ['1-3月', '4-6月', '7-9月', '10-12月'];
            return (
              <div key={q} style={{ 
                padding: '20px', 
                borderRadius: '10px', 
                backgroundColor: `${config.color}08`,
                border: `2px solid ${config.color}15`,
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: config.color,
                    marginBottom: '4px'
                  }}>
                    Q{q + 1} {quarterNames[q]}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                    {months[q]}
                  </div>
                </div>
                <input
                  type="text"
                  value={dimData.quarterlyGoals[q] || ''}
                  onChange={(e) => handleQuarterlyGoalChange(q, e)}
                  placeholder="输入本季度核心目标..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.color;
                    e.target.style.boxShadow = `0 0 0 3px ${config.color}15`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanningView;
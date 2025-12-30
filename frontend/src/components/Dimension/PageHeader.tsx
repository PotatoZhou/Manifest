import React from 'react';
import { Sun, Moon } from 'lucide-react';
import Button from '../Button/Button';
import YearSelector from '../YearSelector/YearSelector';

interface PageHeaderProps {
  activeTab: 'planning' | 'tasks' | 'analysis';
  currentMonth: number;
  currentYear: string;
  onYearChange: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const months = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

const PageHeader: React.FC<PageHeaderProps> = ({ 
  activeTab, 
  currentMonth, 
  currentYear, 
  onYearChange, 
  darkMode, 
  toggleDarkMode 
}) => {
  const getTitle = () => {
    if (activeTab === 'planning') return '🎯 年度与季度规划';
    if (activeTab === 'tasks') return `📅 ${months[currentMonth]}任务清单`;
    return '📊 数据分析与复盘';
  };

  return (
    <div className="page-header" style={{ 
      background: '#fff', padding: '16px 24px', borderRadius: '12px', 
      marginBottom: '20px', display: 'flex', justifyContent: 'space-between', 
      alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
    }}>
      <div>
        <h3 style={{ margin: 0, color: '#262626' }}>
          {getTitle()}
        </h3>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <YearSelector currentYear={currentYear} onChange={onYearChange} />

        {/* <Button onClick={toggleDarkMode} type="light">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button> */}
      </div>
    </div>
  );
};

export default PageHeader;
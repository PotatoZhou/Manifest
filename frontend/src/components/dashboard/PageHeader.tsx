import React from 'react';
import { Gauge } from 'lucide-react';
// import Button from '../Button/Button';
import YearSelector from '../YearSelector/YearSelector';

interface PageHeaderProps {
  currentYear: string;
  onYearChange: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onExportToExcel?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  currentYear, 
  onYearChange, 
  // darkMode, 
  // toggleDarkMode,
}) => {
  return (
    <div className="page-header">
      <h2><Gauge size={18} style={{ marginRight: '8px' }} /> 年度绩效总览</h2>
      <div className="page-actions">
        <YearSelector currentYear={currentYear} onChange={onYearChange} />
        {/* <Button onClick={toggleDarkMode} type="light">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button> */}
      </div>
    </div>
  );
};

export default PageHeader;
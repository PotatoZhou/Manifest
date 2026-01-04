import React from 'react';
import { Gauge, Save, FileSpreadsheet, Sun, Moon } from 'lucide-react';
import Button from '../Button/Button';
import YearSelector from '../YearSelector/YearSelector';

interface PageHeaderProps {
  currentYear: string;
  onYearChange: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onSaveAllData: () => void;
  onExportToExcel: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  currentYear, 
  onYearChange, 
  darkMode, 
  toggleDarkMode,
  onSaveAllData,
  onExportToExcel
}) => {
  return (
    <div className="page-header">
      <h2><Gauge size={18} style={{ marginRight: '8px' }} /> 年度绩效总览</h2>
      <YearSelector currentYear={currentYear} onChange={onYearChange} />
      <div className="page-actions">
        <Button onClick={onSaveAllData}>
          <Save size={16} style={{ marginRight: '8px' }} /> 保存数据
        </Button>
        <Button type="success" onClick={onExportToExcel}>
          <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> 导出Excel
        </Button>
        <Button onClick={toggleDarkMode} type="light">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
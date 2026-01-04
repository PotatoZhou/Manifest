/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { performanceSystem } from '../utils/PerformanceSystem';
import PageHeader from '../components/dashboard/PageHeader';
import QuarterIndicator from '../components/dashboard/QuarterIndicator';
import DashboardCards from '../components/dashboard/DashboardCards';
import TaskCalendar from '../components/dashboard/TaskCalendar';
import QuarterGoals from '../components/dashboard/QuarterGoals';

interface DashboardPageProps {
  currentYear: string;
  onYearChange: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentYear, onYearChange, darkMode, toggleDarkMode }) => {
  // 使用状态管理数据，确保数据变化时组件重新渲染
  const [allDimensions, setAllDimensions] = useState(performanceSystem.getAllDimensionConfigs());
  const [currentQuarter, setCurrentQuarter] = useState(performanceSystem.getCurrentQuarter());
  const [yearData, setYearData] = useState(performanceSystem.getCurrentYearData());
  
  // 当currentYear变化时，更新数据
  useEffect(() => {
    // 切换年份并更新数据
    const updateData = async () => {
      await performanceSystem.switchYear(currentYear);
      refreshData();
    };
    updateData();
  }, [currentYear]);
  
  // 定时刷新数据，确保显示最新的季度目标
  useEffect(() => {
    // 立即刷新一次
    refreshData();
    
    // 设置定时器，每3秒刷新一次数据
    const interval = setInterval(refreshData, 3000);
    
    // 清理定时器
    return () => clearInterval(interval);
  }, []);
  
  // 刷新数据的函数
  const refreshData = () => {
    setAllDimensions(performanceSystem.getAllDimensionConfigs());
    setCurrentQuarter(performanceSystem.getCurrentQuarter());
    setYearData(performanceSystem.getCurrentYearData());
  };
  
  // 如果yearData或dimensions未定义，使用默认值
  if (!yearData || !yearData.dimensions) {
    console.error('yearData或dimensions未定义，使用默认值');
  }

  // 保存所有数据
  const handleSaveAllData = () => {
    const alertElement = document.getElementById('alert-success');
    if (alertElement) {
      alertElement.style.display = 'block';
      setTimeout(() => {
        alertElement.style.display = 'none';
      }, 3000);
    }
  };

  // 导出到Excel（简单实现）
  const handleExportToExcel = () => {
    alert('导出功能将在后续版本实现');
  };

  return (
    <div id="dashboard-page" className="page" style={{ padding: '20px 30px' }}>
      <PageHeader
        currentYear={currentYear}
        onYearChange={onYearChange}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onSaveAllData={handleSaveAllData}
        onExportToExcel={handleExportToExcel}
      />
      
      <div id="alert-success" className="alert alert-success" style={{ display: 'none' }}>
        ✅ 数据已成功保存！
      </div>
      
      <QuarterIndicator currentQuarter={currentQuarter} />
      
      <DashboardCards allDimensions={allDimensions} yearData={yearData} />
      
      <TaskCalendar
        currentYear={currentYear}
        allDimensions={allDimensions}
        yearData={yearData}
        darkMode={darkMode}
      />
      
      <QuarterGoals allDimensions={allDimensions} yearData={yearData} currentQuarter={currentQuarter} />
    </div>
  );
};

export default DashboardPage;

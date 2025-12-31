import React from 'react';
import { Calendar, Save, FileSpreadsheet, Sun, Moon, BarChart, Eye, LineChart, Scale } from 'lucide-react';
import { performanceSystem } from '../utils/PerformanceSystem';
import Button from '../components/Button/Button';
import YearSelector from '../components/YearSelector/YearSelector';

interface YearsPageProps {
  currentYear: string;
  onYearChange: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const YearsPage: React.FC<YearsPageProps> = ({ currentYear, onYearChange, darkMode, toggleDarkMode }) => {
  const years = performanceSystem.getAvailableYears();
  const allData = performanceSystem.getAllData();

  // 保存所有数据
  const handleSaveAllData = () => {
    // performanceSystem.saveData() 已在数据修改后自动调用
    const alertElement = document.getElementById('alert-success');
    if (alertElement) {
      alertElement.style.display = 'block';
      setTimeout(() => {
        alertElement.style.display = 'none';
      }, 3000);
    }
  };

  // 导出到Excel
  const handleExportToExcel = () => {
    alert('导出功能将在后续版本实现');
  };

  // 计算年度平均分
  const calculateYearAverage = (yearData: import('../utils/PerformanceSystem').AnnualData) => {
    const dimensions = ['dream', 'health', 'work', 'mind'];
    const totalScore = dimensions.reduce((sum, dimension) => sum + (yearData.dimensions?.[dimension]?.totalScore || 0), 0);
    return Math.round(totalScore / dimensions.length);
  };

  return (
    <div id="years-page" className="page" style={{ padding: '20px 30px' }}>
      <div className="page-header">
        <h2><Calendar size={18} style={{ marginRight: '8px' }} /> 历年绩效对比</h2>
        <YearSelector currentYear={currentYear} onChange={onYearChange} />
        <div className="page-actions">
          <Button onClick={handleSaveAllData}>
            <Save size={16} style={{ marginRight: '8px' }} /> 保存数据
          </Button>
          <Button type="success" onClick={handleExportToExcel}>
            <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> 导出Excel
          </Button>
          <Button onClick={toggleDarkMode} type="light">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>
      
      <div id="alert-success" className="alert alert-success" style={{ display: 'none' }}>
        ✅ 数据已成功保存！
      </div>

      {/* 年度数据表格 */}
      <div className="card" >
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(103, 58, 183, 0.1)', color: '#673ab7' }}>
            <BarChart size={18} />
          </div>
          <div>
            <div className="card-title">历年绩效数据</div>
            <div className="card-subtitle">查看和比较历年表现</div>
          </div>
        </div>
        
        <div className="years-table-container">
          <table className="years-table">
            <thead>
              <tr>
                <th>年份</th>
                <th>梦想维度</th>
                <th>健康维度</th>
                <th>工作维度</th>
                <th>心理维度</th>
                <th>年度平均分</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => {
                const yearData = allData[year] || { dimensions: {} };
                return (
                  <tr key={year}>
                    <td>{year}</td>
                    <td>{yearData.dimensions?.dream?.totalScore || 0} 分</td>
                    <td>{yearData.dimensions?.health?.totalScore || 0} 分</td>
                    <td>{yearData.dimensions?.work?.totalScore || 0} 分</td>
                    <td>{yearData.dimensions?.mind?.totalScore || 0} 分</td>
                    <td>{calculateYearAverage(yearData)} 分</td>
                    <td>
                      <Button size="sm" onClick={() => onYearChange(year)}>
                        <Eye size={16} style={{ marginRight: '8px' }} /> 查看详情
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 年度趋势图表 */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
            <LineChart size={18} />
          </div>
          <div>
            <div className="card-title">年度趋势</div>
            <div className="card-subtitle">绩效变化趋势分析</div>
          </div>
        </div>
        <div style={{ padding: '20px 0' }}>
          <canvas id="year-trend-chart" width="800" height="300" style={{ width: '100%' }}></canvas>
        </div>
      </div>
      
      {/* 维度对比 */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>
            <Scale size={18} />
          </div>
          <div>
            <div className="card-title">维度对比</div>
            <div className="card-subtitle">各维度表现对比</div>
          </div>
        </div>
        <div style={{ padding: '20px 0' }}>
          <canvas id="dimension-comparison-chart" width="800" height="300" style={{ width: '100%' }}></canvas>
        </div>
      </div>
    </div>
  );
};

export default YearsPage;
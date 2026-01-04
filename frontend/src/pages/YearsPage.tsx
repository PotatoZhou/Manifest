import React, { useEffect } from 'react';
import { Calendar, Save, FileSpreadsheet, Sun, Moon, BarChart, Eye, LineChart, Scale } from 'lucide-react';
import { performanceSystem } from '../utils/PerformanceSystem';
import Button from '../components/Button/Button';
import YearSelector from '../components/YearSelector/YearSelector';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';

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
    console.log('开始导出Excel...');
    try {
      const allData = performanceSystem.getAllData();
      console.log('获取到所有数据:', allData);
      
      const years = performanceSystem.getAvailableYears().sort((a, b) => parseInt(b) - parseInt(a));
      console.log('可用年份:', years);
      
      const currentYearData = allData[years[0]] || { dimensions: {} };
      const dims = (currentYearData.dimensionConfigs || []).map(c => c.key);
      const dimTitles = (currentYearData.dimensionConfigs || []).map(c => c.title);
      
      console.log('维度配置:', dims, dimTitles);
      
      // 准备Excel数据
      const headers = ['年份', ...dimTitles, '年度平均分'];
      const rows = years.map(year => {
        const yearData = allData[year] || { dimensions: {} };
        const dimScores = dims.map(dk => (yearData.dimensions?.[dk]?.totalScore || 0) + ' 分');
        const avgScore = calculateYearAverage(yearData) + ' 分';
        return [year, ...dimScores, avgScore];
      });
      
      console.log('准备导出的数据:', [headers, ...rows]);
      
      // 创建工作簿和工作表
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      console.log('创建工作表成功');
      
      const workbook = XLSX.utils.book_new();
      console.log('创建工作簿成功');
      
      XLSX.utils.book_append_sheet(workbook, worksheet, '历年绩效数据');
      console.log('添加工作表到工作簿成功');
      
      // 导出Excel文件
      const fileName = `performance-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log('准备导出文件:', fileName);
      
      XLSX.writeFile(workbook, fileName);
      console.log('导出文件成功');
      
      alert('导出成功！文件已保存到下载文件夹。');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败: ' + (error as Error).message);
    }
  };

  // 导入JSON数据
  const handleImportFromJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            await performanceSystem.importData(data);
            // 刷新页面数据
            window.location.reload();
          } catch (error) {
            alert('导入失败：' + (error as Error).message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 计算年度平均分（按当年维度配置动态计算）
  const calculateYearAverage = (yearData: import('../utils/PerformanceSystem').AnnualData) => {
    const dims = yearData.dimensionConfigs?.map(c => c.key) || Object.keys(yearData.dimensions || {});
    if (dims.length === 0) return 0;
    const totalScore = dims.reduce((sum, dimension) => sum + (yearData.dimensions?.[dimension]?.totalScore || 0), 0);
    return Math.round(totalScore / dims.length);
  };

  // 初始化图表
  useEffect(() => {
    // 销毁旧图表实例
    const destroyCharts = () => {
      const yearTrendChart = Chart.getChart('year-trend-chart');
      if (yearTrendChart) yearTrendChart.destroy();
      
      const dimensionChart = Chart.getChart('dimension-comparison-chart');
      if (dimensionChart) dimensionChart.destroy();
    };

    // 初始化年度趋势图表
    const initYearTrendChart = () => {
      const ctx = document.getElementById('year-trend-chart') as HTMLCanvasElement;
      if (!ctx) return;

      const yearsSorted = [...years].sort((a, b) => parseInt(a) - parseInt(b));
      const yearScores = yearsSorted.map(year => {
        const yearData = allData[year];
        return calculateYearAverage(yearData || { dimensions: {} });
      });

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: yearsSorted,
          datasets: [{
            label: '年度平均分',
            data: yearScores,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '年度绩效趋势'
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: '分数'
              }
            },
            x: {
              title: {
                display: true,
                text: '年份'
              }
            }
          }
        }
      });
    };

    // 初始化维度对比图表
    const initDimensionChart = () => {
      const ctx = document.getElementById('dimension-comparison-chart') as HTMLCanvasElement;
      if (!ctx) return;

      const currentYearData = allData[currentYear];
      if (!currentYearData) return;
      const dimensions = currentYearData.dimensionConfigs?.map(c => c.key) || Object.keys(currentYearData.dimensions || {});
      const labels = currentYearData.dimensionConfigs?.map(c => c.title) || dimensions;
      const colors = currentYearData.dimensionConfigs?.map(c => c.color) || dimensions.map(() => '#3498db');
      const dimensionScores = dimensions.map(dimension => currentYearData.dimensions?.[dimension]?.totalScore || 0);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: '维度得分',
            data: dimensionScores,
            backgroundColor: colors,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${currentYear}年各维度表现对比`
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: '分数'
              }
            },
            x: {
              title: {
                display: true,
                text: '维度'
              }
            }
          }
        }
      });
    };

    // 执行初始化
    destroyCharts();
    initYearTrendChart();
    initDimensionChart();

    // 组件卸载时销毁图表
    return () => {
      destroyCharts();
    };
  }, [years, allData, currentYear]);

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
          <Button type="primary" onClick={handleImportFromJson}>
            <FileSpreadsheet size={16} style={{ marginRight: '8px' }} /> 导入JSON
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
                {((allData[currentYear] && allData[currentYear].dimensionConfigs) || []).map(cfg => (
                  <th key={cfg.key}>{cfg.title}</th>
                ))}
                <th>年度平均分</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => {
                const yearData = allData[year] || { dimensions: {} };
                const dims = (allData[currentYear]?.dimensionConfigs || []).map(c => c.key);
                return (
                  <tr key={year}>
                    <td>{year}</td>
                    {dims.map(dk => (
                      <td key={dk}>{yearData.dimensions?.[dk]?.totalScore || 0} 分</td>
                    ))}
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

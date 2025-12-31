/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { performanceSystem } from '../utils/PerformanceSystem';
import Button from '../components/Button/Button';
import YearSelector from '../components/YearSelector/YearSelector';
import Chart from 'chart.js/auto';
import { Calendar, Popover, Badge } from 'antd';
import type { BadgeProps } from 'antd';
import dayjs from 'dayjs';
import { Gauge, Palette, Heart, Briefcase, Brain, Calendar as CalendarIcon, CalendarCheck, Save, FileSpreadsheet, Sun, Moon } from 'lucide-react';
import 'antd/dist/reset.css';

interface DashboardPageProps {
  currentYear: string;
  onYearChange: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentYear, onYearChange, darkMode, toggleDarkMode }) => {
  // 获取所有维度配置
  const allDimensions = performanceSystem.getAllDimensionConfigs();
  
  // 使用单个useRef存储canvas元素
  const dreamChartRef = useRef<HTMLCanvasElement>(null);

  // 使用单个useRef存储Chart实例
  const dreamChart = useRef<Chart | null>(null);

  const currentQuarter = performanceSystem.getCurrentQuarter();
  // 获取当前年度数据，确保始终有值
  const yearData = performanceSystem.getCurrentYearData();
  
  // 如果yearData或dimensions未定义，使用默认值
  if (!yearData || !yearData.dimensions) {
    console.error('yearData或dimensions未定义，使用默认值');
  }
  
  // 季度选择状态
  const [selectedQuarter, setSelectedQuarter] = useState<number>(currentQuarter);
  
  // 日历相关状态
  const [calendarValue, setCalendarValue] = useState(dayjs(`${currentYear}-01-01`));
  
  // 根据维度key获取对应的颜色
  const getDimensionColor = (dimensionKey: string): string => {
    const colors: Record<string, string> = {
      dream: '#9c27b0',
      health: '#4caf50',
      work: '#2196f3',
      mind: '#ff9800'
    };
    return colors[dimensionKey] || '#673ab7'; // 默认紫色
  };
  
  // 根据维度key获取对应的图标
  const getDimensionIcon = (dimensionKey: string) => {
    const icons: Record<string, React.ReactNode> = {
      dream: <Palette size={18} />,
      health: <Heart size={18} />,
      work: <Briefcase size={18} />,
      mind: <Brain size={18} />  
    };
    return icons[dimensionKey] || <Gauge size={18} />; // 默认图标
  };
  
  // 根据维度key获取对应的中文名称
  const getDimensionName = (dimensionKey: string): string => {
    const names: Record<string, string> = {
      dream: '梦想维度',
      health: '健康维度',
      work: '工作维度',
      mind: '心理维度'
    };
    return names[dimensionKey] || dimensionKey;
  };
  
  // 季度点击处理函数
  const handleQuarterClick = (quarter: number) => {
    setSelectedQuarter(quarter - 1);
  };
  
  // 日历月份/年份变化处理函数
  const handleCalendarChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setCalendarValue(date);
    }
  };

  // 转换任务数据为日历格式（纯函数）
  const getCalendarTasks = () => {
    const tasksByDate: Record<string, any[]> = {};
    
    // 使用所有维度配置，包括自定义维度
    allDimensions.forEach(dimensionConfig => {
      const dimension = dimensionConfig.key;
      const dimData = yearData.dimensions?.[dimension];
      // 确保dimData是DimensionData类型且monthlyTasks是有效数组
      if (typeof dimData === 'object' && dimData && 'monthlyTasks' in dimData && Array.isArray(dimData.monthlyTasks)) {
        dimData.monthlyTasks.forEach((monthTasks: any[], monthIndex: number) => {
          if (Array.isArray(monthTasks)) {
            monthTasks.forEach((task: any) => {
              // 处理开始日期
              if (task.startDate) {
                const dateKey = task.startDate;
                if (!tasksByDate[dateKey]) {
                  tasksByDate[dateKey] = [];
                }
                tasksByDate[dateKey].push({
                  ...task,
                  dimension,
                  type: 'start'
                });
              }
              
              // 处理结束日期
              if (task.endDate) {
                const dateKey = task.endDate;
                if (!tasksByDate[dateKey]) {
                  tasksByDate[dateKey] = [];
                }
                tasksByDate[dateKey].push({
                  ...task,
                  dimension,
                  type: 'end'
                });
              }
              
              // 如果没有日期，至少显示在当前月份的第一天
              if (!task.startDate && !task.endDate) {
                const monthStr = (monthIndex + 1).toString().padStart(2, '0');
                const dateKey = `${currentYear}-${monthStr}-01`;
                if (!tasksByDate[dateKey]) {
                  tasksByDate[dateKey] = [];
                }
                tasksByDate[dateKey].push({
                  ...task,
                  dimension,
                  type: 'no-date'
                });
              }
            });
          }
        });
      }
    });
    
    return tasksByDate;
  };



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

  // 初始化图表
  useEffect(() => {

    return () => {
      if (dreamChart.current) {
        dreamChart.current.destroy();
        dreamChart.current = null;
      }
    };
  }, [currentYear]);

  return (
    <div id="dashboard-page" className="page" style={{ padding: '20px 30px' }}>
      <div className="page-header">
        <h2><Gauge size={18} style={{ marginRight: '8px' }} /> 年度绩效总览</h2>
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
      

      
      {/* 当前季度提示 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px', borderLeft: '5px solid #3498db' }}>
        <h4>
          当前季度：第{currentQuarter + 1}季度
          <span className="current-quarter-indicator">进行中</span>
        </h4>
        <p>系统已智能识别当前季度，方便您查看和更新季度目标。</p>
      </div>
      
      {/* 仪表盘卡片 */}
      <div className="dashboard-cards">
        {allDimensions.map(dimension => {
          const dimensionKey = dimension.key;
          const dimensionData = yearData?.dimensions?.[dimensionKey];
          return (
            <div key={dimensionKey} className={`card ${dimensionKey}`}>
              <div className="card-header">
                <div className="card-icon">
                  {getDimensionIcon(dimensionKey)}
                </div>
                <div>
                  <div className="card-title">{getDimensionName(dimensionKey)}</div>
                  <div className="card-subtitle">年度目标完成情况</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: getDimensionColor(dimensionKey), marginBottom: '8px' }}>
                  {dimensionData?.progress || 0}%
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ color: '#27ae60', fontWeight: '600' }}>
                    {dimensionData?.completedTasks || 0} 已完成
                  </span>
                  <span style={{ color: '#7f8c8d', margin: '0 10px' }}>/</span>
                  <span style={{ color: '#95a5a6' }}>{dimensionData?.totalTasks || 0} 任务</span>
                </div>
                <canvas ref={dreamChartRef} width="200" height="80"></canvas>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 任务日历 */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(255, 99, 132, 0.1)', color: '#ff6384' }}>
              <CalendarIcon size={18} />
            </div>
          <div>
            <div className="card-title">任务日历</div>
            <div className="card-subtitle">查看每日任务安排</div>
          </div>
        </div>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          {/* 样式：统一日历背景颜色 */}
          <style>{`
            .ant-picker-calendar {
              width: 100% !important;
              max-width: 1200px !important;
            }
            .ant-picker-calendar-header {
              padding: 15px 20px;
            }
            .ant-picker-calendar-content th {
              padding: 12px 0;
            }
            .ant-picker-calendar-content .ant-picker-cell-inner {
              background-color: white;
              padding: 10px 0;
            }
            /* 修复年份视图中月份重复显示的问题 */
            .ant-picker-calendar-year-panel {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
            }
            .ant-picker-calendar-year-panel .ant-picker-calendar-month {
              width: auto !important;
              margin: 0 !important;
            }
          `}</style>
          
          <Calendar
            mode="year"
            value={calendarValue}
            onChange={handleCalendarChange}
            cellRender={(current, info) => {
              // 只处理日期单元格，不处理月份标题或其他类型的单元格
              if (info.type === 'date') {
                const dateKey = current.format('YYYY-MM-DD');
                const calendarData = getCalendarTasks();
                const tasks = calendarData[dateKey] || [];
                
                // 渲染Popover内容
                const renderPopoverContent = () => {
                  if (tasks.length === 0) {
                    return <div style={{ padding: '10px', textAlign: 'center' }}>当天没有任务</div>;
                  }
                  
                  return (
                    <div style={{ maxWidth: '350px', padding: '10px' }}>
                      <h4 style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px solid ${darkMode ? '#333333' : '#eee'}`, fontSize: '1.1rem', color: `${darkMode ? '#ffffff' : '#2c3e50'}` }}>
                        {dayjs(dateKey).format('YYYY年MM月DD日')} 任务详情
                      </h4>
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {tasks.map((task, index) => {
                          let statusColor = '#95a5a6'; // 默认灰色
                          if (task.status === 'completed') statusColor = '#27ae60'; // 已完成绿色
                          if (task.status === 'in-progress') statusColor = '#f39c12'; // 进行中黄色
                          
                          let dimensionColor = '#9c27b0'; // 梦想紫色
                          if (task.dimension === 'health') dimensionColor = '#4caf50'; // 健康绿色
                          if (task.dimension === 'work') dimensionColor = '#2196f3'; // 工作蓝色
                          if (task.dimension === 'mind') dimensionColor = '#ff9800'; // 心理橙色
                          
                          return (
                            <div key={index} style={{ marginBottom: '12px', padding: '10px', borderRadius: '6px', backgroundColor: '#f8f9fa', borderLeft: `3px solid ${dimensionColor}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600', color: dimensionColor }}>
                                  {task.dimension === 'dream' && '梦想'}
                                  {task.dimension === 'health' && '健康'}
                                  {task.dimension === 'work' && '工作'}
                                  {task.dimension === 'mind' && '心理'}
                                </span>
                                <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px', backgroundColor: statusColor, color: 'white' }}>
                                  {task.status === 'completed' && '已完成'}
                                  {task.status === 'in-progress' && '进行中'}
                                  {task.status === 'not-started' && '未开始'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.95rem', marginBottom: '6px', fontWeight: '500' }}>{task.title}</div>
                              <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                                {task.type === 'start' && '开始日期'}
                                {task.type === 'end' && '结束日期'}
                                {task.type === 'no-date' && '无具体日期'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                };
                
                // 日期单元格内容
                const cellContent = (
                  <div style={{ textAlign: 'center', padding: '15px 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                    
                    {tasks.length > 0 && (
                      <ul className="events" style={{ padding: '10px 0 0 0', margin: 0, listStyle: 'none' }}>
                        {tasks.slice(0, 3).map((task, index) => {
                          // 根据任务状态获取Badge类型
                          let badgeType: BadgeProps['status'] = 'default';
                          if (task.status === 'completed') badgeType = 'success';
                          if (task.status === 'in-progress') badgeType = 'processing';
                          if (task.status === 'not-started') badgeType = 'warning';
                          
                          return (
                            <li key={index} style={{ padding: '2px 0', fontSize: '0.85rem' }}>
                              <Badge status={badgeType} text={task.title} style={{ margin: 0 }} />
                            </li>
                          );
                        })}
                        {tasks.length > 3 && (
                          <li style={{ padding: '2px 0', fontSize: '0.85rem', color: '#999' }}>
                            ... 还有 {tasks.length - 3} 个任务
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
                
                // 使用Popover包装
                return (
                  <Popover
                    content={renderPopoverContent()}
                    title={null}
                    trigger="click"
                    placement="top"
                    style={{ boxShadow: 'var(--shadow)' }}
                  >
                    {cellContent}
                  </Popover>
                );
              }
              // 对于非日期单元格（包括月份标题），直接返回原始节点
              return info.originNode;
            }}

            style={{
              border: '1px solid #eee',
              borderRadius: '12px',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '1200px',
              minHeight: '600px'
            }}
          />
        </div>
      </div>
      
      {/* 季度目标与进度 */}
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
            <p>{yearData.dimensions.dream.quarterlyGoals[selectedQuarter] || '未设置季度目标'}</p>
          </div>
          
          <div className="dimension-progress-cards">
            {allDimensions.map(dimension => {
              const dimensionKey = dimension.key;
              const dimData = yearData.dimensions[dimensionKey];
              const dimensionColor = getDimensionColor(dimensionKey);
              return (
                <div key={dimensionKey} className="dimension-progress-card">
                  <h5>{getDimensionName(dimensionKey)}</h5>
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
    </div>
  );
};



export default DashboardPage;

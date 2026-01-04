/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Calendar, Popover, Badge } from 'antd';
import type { BadgeProps } from 'antd';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Dimension {
  key: string;
  title: string;
  color: string;
}

interface Task {
  title: string;
  status: 'completed' | 'in-progress' | 'not-started';
  startDate?: string;
  endDate?: string;
}

interface YearData {
  dimensions: Record<string, {
    monthlyTasks: Task[][];
    quarterlyGoals: string[];
  }>;
}

interface TaskCalendarProps {
  currentYear: string;
  allDimensions: Dimension[];
  yearData: YearData;
  darkMode: boolean;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ currentYear, allDimensions, yearData, darkMode }) => {
  // 日历相关状态
  const [calendarValue, setCalendarValue] = useState(dayjs(`${currentYear}-01-01`));
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('year');
  
  // 维度配置映射
  const configMap = Object.fromEntries(allDimensions.map(d => [d.key, d]));
  
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

  return (
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
            padding: 18px 24px;
          }
          .ant-picker-calendar-content th {
            padding: 16px 0;
          }
          .ant-picker-calendar-content .ant-picker-cell-inner {
            background-color: white;
            padding: 14px 8px;
            border-radius: 8px;
          }
          .ant-picker-calendar-content .ant-picker-cell {
            padding: 12px 10px;
          }
          /* 修复年份视图中月份重复显示的问题 */
          .ant-picker-calendar-year-panel {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px;
          }
          .ant-picker-calendar-year-panel .ant-picker-calendar-month {
            width: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .ant-picker-calendar-year-panel .ant-picker-cell {
            padding: 0 !important;
          }
          .ant-picker-calendar-year-panel .ant-picker-cell-inner {
            padding: 20px 15px;
            border-radius: 12px;
            height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid #f0f0f0;
            transition: all 0.3s ease;
          }
          .ant-picker-calendar-year-panel .ant-picker-cell-inner:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
            border-color: #1890ff;
          }
          /* 隐藏月份名称重复显示 */
          .ant-picker-calendar-month-name {
            display: none !important;
          }
        `}</style>
        
        <Calendar
          mode={calendarMode}
          value={calendarValue}
          onChange={(value) => value && setCalendarValue(value)}
          onPanelChange={(value, mode) => {
            setCalendarMode(mode);
            // 当从year模式切换到month模式时，自动选中当天日期
            if (mode === 'month') {
              const today = dayjs();
              const currentMonth = value.month();
              const currentYear = value.year();
              
              // 检查切换到的月份是否是当前月份
              if (today.month() === currentMonth && today.year() === currentYear) {
                setCalendarValue(today);
              } else {
                setCalendarValue(value);
              }
            } else {
              setCalendarValue(value);
            }
          }}
          onSelect={(date) => setCalendarValue(date)}
          cellRender={(current, info) => {
            // 处理年份视图中的月份单元格
            if (info.type === 'month' && calendarMode === 'year') {
              const month = current.month();
              
              // 计算该月份的任务数量
              let taskCount = 0;
              allDimensions.forEach(dimensionConfig => {
                const dimension = dimensionConfig.key;
                const dimData = yearData.dimensions?.[dimension];
                if (typeof dimData === 'object' && dimData && 'monthlyTasks' in dimData && Array.isArray(dimData.monthlyTasks)) {
                  const monthTasks = dimData.monthlyTasks[month];
                  if (Array.isArray(monthTasks)) {
                    taskCount += monthTasks.length;
                  }
                }
              });
              
              // 检查是否为季度月份（3,6,9,12月，对应索引2,5,8,11）
              const isQuarterMonth = [2, 5, 8, 11].includes(month);
              let quarterIndex = -1;
              
              // 存储所有维度的季度目标
              const allQuarterGoals: { dimension: string; goal: string; color: string }[] = [];
              
              if (isQuarterMonth) {
                quarterIndex = Math.floor(month / 3);
                
                // 遍历所有维度，收集每个维度的季度目标
                allDimensions.forEach(dimension => {
                  const dimData = yearData.dimensions?.[dimension.key];
                  const goal = dimData?.quarterlyGoals?.[quarterIndex] || '';
                  if (goal) {
                    allQuarterGoals.push({
                      dimension: dimension.title,
                      goal: goal,
                      color: dimension.color
                    });
                  }
                });
              }
              
              // 月份单元格内容
              return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="month-task-count" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3498db', marginBottom: '8px' }}>
                    {taskCount}
                  </div>
                  <div className="month-task-label" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                    任务数
                  </div>
                  {isQuarterMonth && (
                    <div className="quarter-goal" style={{ fontSize: '0.85rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                      <div style={{ fontWeight: '600', marginBottom: '6px', color: '#27ae60' }}>第{quarterIndex + 1}季度目标</div>
                      
                      {/* 显示所有维度的季度目标 */}
                      {allQuarterGoals.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                          {allQuarterGoals.map((item, index) => (
                            <div key={index} style={{ lineHeight: '1.4' }}>
                              <span style={{ fontWeight: '600', color: item.color, marginRight: '4px' }}>{item.dimension}:</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>{item.goal}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>未设置季度目标</div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            
            // 处理日期单元格
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
                        
                        const dimConf = configMap[task.dimension];
                        const dimensionColor = dimConf?.color || '#9c27b0';
                        
                        return (
                          <div key={index} style={{ marginBottom: '12px', padding: '10px', borderRadius: '6px', backgroundColor: '#f8f9fa', borderLeft: `3px solid ${dimensionColor}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '600', color: dimensionColor }}>
                                {dimConf?.title || task.dimension}
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
            // 对于其他类型的单元格，直接返回原始节点
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
  );
};

export default TaskCalendar;
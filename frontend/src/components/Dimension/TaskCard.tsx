import React from 'react';
import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { Task } from '../../utils/PerformanceSystem';

// 样式常量定义
const styles = {
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    deepGray: '#595959',
    mediumGray: '#8c8c8c',
    lightGray: '#d9d9d9',
    extraLightGray: '#f5f5f5',
    white: '#ffffff',
    black: '#262626',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  boxShadow: {
    light: '0 2px 8px rgba(0,0,0,0.04)',
    medium: '0 4px 12px rgba(0,0,0,0.06)',
    strong: '0 8px 24px rgba(0,0,0,0.08)',
  },
};

interface TaskCardProps {
  task: Task;
  config: {
    color: string;
  };
  minimizedTasks: Set<string>;
  toggleTaskMinimize: (taskId: string) => void;
  updateTask: <K extends keyof Task>(taskId: string, field: K, value: Task[K]) => void;
  deleteTask: (taskId: string) => void;
  isBatchMode: boolean;
  isSelected: boolean;
  toggleSelection: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  config, 
  minimizedTasks, 
  toggleTaskMinimize, 
  updateTask,
  isBatchMode,
  isSelected,
  toggleSelection
}) => {
  // 根据任务状态获取颜色
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return '#52c41a';
      case 'in-progress': return '#faad14';
      case 'not-started': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  };
  
  // 根据任务优先级获取颜色
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };
  
  // 检查任务是否最小化
  const isMinimized = minimizedTasks.has(task.id);
  
  const statusColor = getStatusColor();

  return (
    <div 
      key={task.id} 
      style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: isMinimized ? '10px 20px' : '28px', 
          borderLeft: `4px solid ${statusColor}`,
          transition: 'all 0.35s ease-in-out',
          boxShadow: isBatchMode ? (isSelected ? `0 0 0 2px ${config.color}20` : '0 4px 12px rgba(0,0,0,0.06)') : (isMinimized ? '0 4px 12px rgba(0,0,0,0.06)' : '0 10px 24px rgba(0,0,0,0.06)'),
          border: `2px solid ${isBatchMode ? (isSelected ? config.color : '#e8e8e8') : (isMinimized ? `${config.color}30` : '#e8e8e8')}`,
          overflow: 'hidden',
          position: 'relative',
          background: isBatchMode && isSelected ? `${config.color}08` : '#ffffff',
          cursor: isBatchMode ? 'default' : 'pointer',
          width: '100%', // 确保宽度相同
          height: isMinimized ? '48px' : 'auto', // 最小化时固定高度
          minHeight: isMinimized ? '48px' : 'auto', // 确保高度一致
          boxSizing: 'border-box' // 确保padding不影响总宽度
        }}
      onMouseEnter={(e) => {
        if (!isBatchMode) {
          if (isMinimized) {
            (e.currentTarget as HTMLElement).style.borderColor = config.color;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.1)`;
          } else {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.01)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isBatchMode) {
          if (isMinimized) {
            (e.currentTarget as HTMLElement).style.borderColor = `${config.color}30`;
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
          } else {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
          }
        }
      }}
      onClick={() => {
        if (isBatchMode) {
          toggleSelection(task.id);
        }
      }}
      onDoubleClick={() => {
        if (!isBatchMode) {
          toggleTaskMinimize(task.id);
        }
      }}
    >
      {/* 最小化状态：一行显示 */}
      {isMinimized ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          {/* 批量选择复选框 */}
          {isBatchMode && (
            <div 
              style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '4px',
                border: `2px solid ${isSelected ? config.color : '#d9d9d9'}`,
                backgroundColor: isSelected ? config.color : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(task.id);
              }}
            >
              {isSelected && (
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: '#ffffff',
                  borderRadius: '2px'
                }} />
              )}
            </div>
          )}
          {/* 任务名称和优先级 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.sm, flex: 1, minWidth: 0 }}>
            {/* 优先级指示器 */}
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: getPriorityColor(),
              boxShadow: `0 0 0 2px ${getPriorityColor()}20`
            }} />
            {/* 任务名称 */}
            <span style={{ 
              fontSize: styles.fontSize.sm, 
              fontWeight: styles.fontWeight.medium, 
              color: styles.colors.black,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {task.title}
            </span>
          </div>
          
          {/* 任务日期范围 */}
          {(task.startDate || task.endDate) && (
            <span style={{ 
              fontSize: styles.fontSize.xs, 
              color: statusColor,
              whiteSpace: 'nowrap',
              backgroundColor: `${statusColor}08`,
              padding: `${styles.spacing.xs} ${styles.spacing.sm}`,
              borderRadius: styles.borderRadius.md,
              border: `1px solid ${statusColor}15`,
              fontWeight: styles.fontWeight.medium
            }}>
              {task.startDate && task.endDate ? `${dayjs(task.startDate).format('YYYY-MM-DD')} - ${dayjs(task.endDate).format('YYYY-MM-DD')}` : 
               task.startDate ? `开始: ${dayjs(task.startDate).format('YYYY-MM-DD')}` : `结束: ${dayjs(task.endDate).format('YYYY-MM-DD')}`}
            </span>
          )}
          
          {/* 状态选择器 */}
          <div style={{ minWidth: '100px' }}>
            <Select
              value={task.status}
              onChange={(value) => updateTask(task.id, 'status', value as Task['status'])}
              style={{ 
                width: '100%',
                borderRadius: styles.borderRadius.sm,
                fontSize: styles.fontSize.xs,
                fontWeight: styles.fontWeight.medium
              }}
              dropdownStyle={{
                borderRadius: styles.borderRadius.md,
                border: `1px solid ${styles.colors.lightGray}`,
                boxShadow: styles.boxShadow.medium,
                padding: `${styles.spacing.sm} 0`
              }}

            >
              <Select.Option value="not-started">未开始</Select.Option>
              <Select.Option value="in-progress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
          </div>
        </div>
      ) : (
        /* 完整状态：详细显示 */
        <>
          {/* 批量选择复选框 */}
          {isBatchMode && (
            <div 
              style={{ 
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '20px', 
                height: '20px', 
                borderRadius: '4px',
                border: `2px solid ${isSelected ? config.color : '#d9d9d9'}`,
                backgroundColor: isSelected ? config.color : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(task.id);
              }}
            >
              {isSelected && (
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#ffffff',
                  borderRadius: '2px'
                }} />
              )}
            </div>
          )}
          {/* 任务头部信息 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: styles.spacing.md }}>
            {/* 优先级指示器 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: styles.spacing.sm
            }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: getPriorityColor(),
                boxShadow: `0 0 0 3px ${getPriorityColor()}15`
              }} />
              <span style={{ 
                fontSize: styles.fontSize.sm, 
                fontWeight: styles.fontWeight.semiBold, 
                color: getPriorityColor()
              }}>
                {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
              </span>
            </div>
            
            {/* 状态标签 */}
            <div style={{ 
              padding: '6px 16px', 
              borderRadius: '20px',
              backgroundColor: `${statusColor}15`,
              color: statusColor,
              fontSize: styles.fontSize.sm,
              fontWeight: styles.fontWeight.semiBold,
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              {task.status === 'completed' ? '已完成' : 
               task.status === 'in-progress' ? '进行中' : '未开始'}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: styles.spacing.lg, alignItems: 'flex-start' }}>
            {/* 任务主要信息 */}
            <div style={{ minWidth: 0, flex: 1 }}>
              {/* 任务名称 */}
              <div style={{ marginBottom: styles.spacing.md }}>
                <label style={{ 
                  fontSize: styles.fontSize.xs, 
                  color: styles.colors.mediumGray, 
                  fontWeight: styles.fontWeight.semiBold, 
                  display: 'block', 
                  marginBottom: styles.spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>任务名称</label>
                <input 
                  value={task.title} 
                  onChange={(e) => updateTask(task.id, 'title', e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${styles.colors.lightGray}`,
                    borderRadius: styles.borderRadius.md,
                    fontSize: styles.fontSize.md,
                    fontWeight: styles.fontWeight.medium,
                    transition: 'all 0.3s ease',
                    backgroundColor: styles.colors.white,
                    outline: 'none',
                    boxShadow: styles.boxShadow.light,

                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.colors.primary;
                    e.target.style.boxShadow = `0 0 0 2px ${styles.colors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = styles.colors.lightGray;
                    e.target.style.boxShadow = styles.boxShadow.light;
                  }}
                />
              </div>
              
              {/* 任务描述 */}
              <div>
                <label style={{ 
                  fontSize: styles.fontSize.xs, 
                  color: styles.colors.mediumGray, 
                  fontWeight: styles.fontWeight.semiBold, 
                  display: 'block', 
                  marginBottom: styles.spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>任务描述</label>
                <textarea 
                  value={task.description} 
                  onChange={(e) => updateTask(task.id, 'description', e.target.value)} 
                  style={{
                    width: '100%',
                    minHeight: '173px', // magic
                    padding: '12px 16px',
                    border: `1px solid ${styles.colors.lightGray}`,
                    borderRadius: styles.borderRadius.md,
                    fontSize: styles.fontSize.sm,
                    lineHeight: '1.6',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    backgroundColor: styles.colors.white,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxShadow: styles.boxShadow.light
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.colors.primary;
                    e.target.style.boxShadow = `0 0 0 2px ${styles.colors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = styles.colors.lightGray;
                    e.target.style.boxShadow = styles.boxShadow.light;
                  }}
                />
              </div>
            </div>
            
            {/* 任务属性面板 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.md, width: '320px' }}>
              {/* 状态 */}
              <div>
                <label style={{ 
                  fontSize: styles.fontSize.xs, 
                  color: styles.colors.mediumGray, 
                  fontWeight: styles.fontWeight.semiBold, 
                  display: 'block', 
                  marginBottom: styles.spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>状态</label>
                <Select
                  value={task.status}
                  onChange={(value) => updateTask(task.id, 'status', value as Task['status'])}
                  style={{ 
                    width: '100%',
                    borderRadius: styles.borderRadius.md,
                    fontSize: styles.fontSize.sm,
                    fontWeight: styles.fontWeight.medium,
                    border: `1px solid ${styles.colors.lightGray}`,
                    boxShadow: styles.boxShadow.light,
                    
                  }}
                  dropdownStyle={{
                    borderRadius: styles.borderRadius.md,
                    border: `1px solid ${styles.colors.lightGray}`,
                    boxShadow: styles.boxShadow.medium,
                    padding: `${styles.spacing.sm} 0`
                  }}

                >
                  <Select.Option value="not-started">未开始</Select.Option>
                  <Select.Option value="in-progress">进行中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                </Select>
              </div>
              
              {/* 分数 */}
              <div>
                <label style={{ 
                  fontSize: styles.fontSize.xs, 
                  color: styles.colors.mediumGray, 
                  fontWeight: styles.fontWeight.semiBold, 
                  display: 'block', 
                  marginBottom: styles.spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>分数</label>
                <input 
                  type="number" 
                  value={task.score} 
                  onChange={(e) => updateTask(task.id, 'score', parseInt(e.target.value))} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${styles.colors.lightGray}`,
                    borderRadius: styles.borderRadius.md,
                    fontSize: styles.fontSize.sm,
                    fontWeight: styles.fontWeight.medium,
                    transition: 'all 0.3s ease',
                    backgroundColor: styles.colors.white,
                    outline: 'none',
                    boxShadow: styles.boxShadow.light
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.colors.primary;
                    e.target.style.boxShadow = `0 0 0 2px ${styles.colors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = styles.colors.lightGray;
                    e.target.style.boxShadow = styles.boxShadow.light;
                  }}
                />
              </div>
              
              {/* 优先级 */}
              <div>
                <label style={{ 
                  fontSize: styles.fontSize.xs, 
                  color: styles.colors.mediumGray, 
                  fontWeight: styles.fontWeight.semiBold, 
                  display: 'block', 
                  marginBottom: styles.spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>优先级</label>
                <Select
                  value={task.priority}
                  onChange={(value) => updateTask(task.id, 'priority', value as Task['priority'])}
                  style={{ 
                    width: '100%',
                    borderRadius: styles.borderRadius.md,
                    fontSize: styles.fontSize.sm,
                    fontWeight: styles.fontWeight.medium,
                    border: `1px solid ${styles.colors.lightGray}`,
                    boxShadow: styles.boxShadow.light,
                    
                  }}
                  dropdownStyle={{
                    borderRadius: styles.borderRadius.md,
                    border: `1px solid ${styles.colors.lightGray}`,
                    boxShadow: styles.boxShadow.medium,
                    padding: `${styles.spacing.sm} 0`
                  }}

                >
                  <Select.Option value="low">低</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="high">高</Select.Option>
                </Select>
              </div>
              
              {/* 日期范围 */}
              <div style={{ display: 'flex', gap: styles.spacing.sm, alignItems: 'flex-start', width: '100%' }}>
                {/* 开始日期 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ 
                    fontSize: styles.fontSize.xs, 
                    color: styles.colors.mediumGray, 
                    fontWeight: styles.fontWeight.semiBold, 
                    display: 'block', 
                    marginBottom: styles.spacing.xs,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>开始日期</label>
                  <DatePicker
                    value={task.startDate ? dayjs(task.startDate) : undefined}
                    onChange={(value) => {
                      const dateStr = value ? value.format('YYYY-MM-DD') : undefined;
                      updateTask(task.id, 'startDate', dateStr);
                    }}
                    onBlur={(e) => {
                      // 确保失焦时数据已保存
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        const dateStr = dayjs(input.value).format('YYYY-MM-DD');
                        updateTask(task.id, 'startDate', dateStr);
                      }
                    }}
                    style={{ 
                      width: '100%',
                      borderRadius: styles.borderRadius.md,
                      fontSize: styles.fontSize.sm,
                      border: `1px solid ${styles.colors.lightGray}`,
                      boxShadow: styles.boxShadow.light,
                      padding: '6px 8px',
                      height: '32px'
                    }}
                    size="small"
                  />
                </div>
                
                {/* 结束日期 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ 
                    fontSize: styles.fontSize.xs, 
                    color: styles.colors.mediumGray, 
                    fontWeight: styles.fontWeight.semiBold, 
                    display: 'block', 
                    marginBottom: styles.spacing.xs,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>结束日期</label>
                  <DatePicker
                    value={task.endDate ? dayjs(task.endDate) : undefined}
                    onChange={(value) => {
                      const dateStr = value ? value.format('YYYY-MM-DD') : undefined;
                      updateTask(task.id, 'endDate', dateStr);
                    }}
                    onBlur={(e) => {
                      // 确保失焦时数据已保存
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        const dateStr = dayjs(input.value).format('YYYY-MM-DD');
                        updateTask(task.id, 'endDate', dateStr);
                      }
                    }}
                    style={{ 
                      width: '100%',
                      borderRadius: styles.borderRadius.md,
                      fontSize: styles.fontSize.sm,
                      border: `1px solid ${styles.colors.lightGray}`,
                      boxShadow: styles.boxShadow.light,
                      padding: '6px 8px',
                      height: '32px'
                    }}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;
import React from 'react';
import { Trash } from 'lucide-react';
import { Select } from 'antd';
import type { Task } from '../../utils/PerformanceSystem';

interface TaskCardProps {
  task: Task;
  config: {
    color: string;
  };
  minimizedTasks: Set<string>;
  toggleTaskMinimize: (taskId: string) => void;
  updateTask: (taskId: string, field: keyof Task, value: any) => void;
  deleteTask: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  config, 
  minimizedTasks, 
  toggleTaskMinimize, 
  updateTask, 
  deleteTask 
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
        boxShadow: isMinimized ? '0 4px 12px rgba(0,0,0,0.06)' : '0 10px 24px rgba(0,0,0,0.06)',
        border: `1px solid ${isMinimized ? `${config.color}30` : '#e8e8e8'}`,
        overflow: 'hidden',
        position: 'relative',
        background: '#ffffff',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        if (isMinimized) {
          (e.currentTarget as HTMLElement).style.borderColor = config.color;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.1)`;
        } else {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.01)';
        }
      }}
      onMouseLeave={(e) => {
        if (isMinimized) {
          (e.currentTarget as HTMLElement).style.borderColor = `${config.color}30`;
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
        } else {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
        }
      }}
      onDoubleClick={() => toggleTaskMinimize(task.id)}
    >
      {/* 最小化状态：一行显示 */}
      {isMinimized ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          {/* 任务名称和优先级 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            {/* 优先级指示器 */}
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: getPriorityColor(),
              boxShadow: `0 0 0 3px ${getPriorityColor()}15`
            }} />
            {/* 任务名称 */}
            <span style={{ 
              fontSize: '0.95rem', 
              fontWeight: '500', 
              color: '#262626',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {task.title}
            </span>
          </div>
          
          {/* 任务日期（如果有的话） */}
          {task.dueDate && (
            <span style={{ 
              fontSize: '0.85rem', 
              color: '#8c8c8c',
              whiteSpace: 'nowrap'
            }}>
              {task.dueDate}
            </span>
          )}
          
          {/* 状态选择器 */}
          <div style={{ minWidth: '100px' }}>
            <Select
              value={task.status}
              onChange={(value) => updateTask(task.id, 'status', value)}
              style={{ 
                width: '100%',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}
              dropdownStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 12px 48px rgba(0,0,0,0.15)' }}
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
          {/* 任务头部信息 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            {/* 优先级指示器 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px'
            }}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: getPriorityColor(),
                boxShadow: `0 0 0 3px ${getPriorityColor()}15`
              }} />
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600', 
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
              fontSize: '0.85rem',
              fontWeight: '600',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {task.status === 'completed' ? '已完成' : 
               task.status === 'in-progress' ? '进行中' : '未开始'}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'flex-start', padding: '0' }}>
            {/* 任务主要信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 任务名称 */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#8c8c8c', 
                  fontWeight: '600', 
                  display: 'block', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>任务名称</label>
                <input 
                  value={task.title} 
                  onChange={(e) => updateTask(task.id, 'title', e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #f5f5f5',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.color;
                    e.target.style.boxShadow = `0 0 0 3px ${config.color}15`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#f5f5f5';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                />
              </div>
              
              {/* 任务描述 */}
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#8c8c8c', 
                  fontWeight: '600', 
                  display: 'block', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>任务描述</label>
                <textarea 
                  value={task.description} 
                  onChange={(e) => updateTask(task.id, 'description', e.target.value)} 
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px 16px',
                    border: '2px solid #f5f5f5',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.color;
                    e.target.style.boxShadow = `0 0 0 3px ${config.color}15`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#f5f5f5';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                />
              </div>
            </div>
            
            {/* 任务属性面板 */}
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 状态 */}
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#8c8c8c', 
                  fontWeight: '600', 
                  display: 'block', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>状态</label>
                <div style={{ 
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #f5f5f5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease'
                }}>
                  <Select
                    value={task.status}
                    onChange={(value) => updateTask(task.id, 'status', value)}
                    style={{ 
                      width: '100%',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}
                    dropdownStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 12px 48px rgba(0,0,0,0.15)' }}
                  >
                    <Select.Option value="not-started">未开始</Select.Option>
                    <Select.Option value="in-progress">进行中</Select.Option>
                    <Select.Option value="completed">已完成</Select.Option>
                  </Select>
                </div>
              </div>
              
              {/* 分数 */}
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#8c8c8c', 
                  fontWeight: '600', 
                  display: 'block', 
                  marginBottom: '8px',
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
                    border: '2px solid #f5f5f5',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.color;
                    e.target.style.boxShadow = `0 0 0 3px ${config.color}15`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#f5f5f5';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                />
              </div>
              
              {/* 优先级 */}
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  color: '#8c8c8c', 
                  fontWeight: '600', 
                  display: 'block', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>优先级</label>
                <div style={{ 
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #f5f5f5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease'
                }}>
                  <Select
                    value={task.priority}
                    onChange={(value) => updateTask(task.id, 'priority', value)}
                    style={{ 
                      width: '100%',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}
                    dropdownStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 12px 48px rgba(0,0,0,0.15)' }}
                  >
                    <Select.Option value="low">低</Select.Option>
                    <Select.Option value="medium">中</Select.Option>
                    <Select.Option value="high">高</Select.Option>
                  </Select>
                </div>
              </div>
              
              {/* 删除按钮 */}
              <button 
                onClick={() => deleteTask(task.id)} 
                style={{ 
                  backgroundColor: '#ff4d4f', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  padding: '10px 16px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#ff7875';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#ff4d4f';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                <Trash size={16} />
                删除
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;
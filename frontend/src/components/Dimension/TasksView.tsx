import React from 'react';
import { Plus, ListTodo, Square } from 'lucide-react';
import { Button, Tooltip } from 'antd';
import type { Task } from '../../utils/PerformanceSystem';
import TaskCard from './TaskCard';

interface TasksViewProps {
  currentMonth: number;
  config: {
    title: string;
    color: string;
  };
  dimData: {
    monthlyTasks: Task[][];
  };
  addTask: () => void;
  minimizedTasks: Set<string>;
  toggleTaskMinimize: (taskId: string) => void;
  updateTask: <K extends keyof Task>(taskId: string, field: K, value: Task[K]) => void;
  deleteTask: (taskId: string) => void;
  isBatchMode: boolean;
  toggleBatchMode: () => void;
  selectedTasks: Set<string>;
  toggleTaskSelection: (taskId: string) => void;
  batchDeleteTasks: () => void;
}

const months = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

const TasksView: React.FC<TasksViewProps> = ({ 
  currentMonth, 
  config, 
  dimData, 
  addTask, 
  minimizedTasks, 
  toggleTaskMinimize, 
  updateTask, 
  deleteTask,
  isBatchMode,
  toggleBatchMode,
  selectedTasks,
  toggleTaskSelection,
  batchDeleteTasks
}) => {
  const monthlyTasks = dimData.monthlyTasks[currentMonth] || [];

  return (
    <div className="view-animate" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 任务卡片列表 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#262626' }}>
              <span style={{ color: config.color }}>{months[currentMonth]}</span> 行动项
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Tooltip title="批量管理">
                <Button 
                  onClick={toggleBatchMode} 
                  style={{ 
                    backgroundColor: isBatchMode ? config.color : '#f5f5f5', 
                    color: isBatchMode ? '#fff' : '#262626', 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '10px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Square size={16} />
                </Button>
              </Tooltip>
              <Button 
                onClick={addTask} 
                style={{ 
                  backgroundColor: config.color, 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <Plus size={16} style={{ marginRight: '6px' }} /> 新增任务
              </Button>
            </div>
          </div>
        
        {/* 批量操作栏 */}
        {isBatchMode && selectedTasks.size > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            gap: '12px',
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#595959',
              fontWeight: '500'
            }}>
              已选择 {selectedTasks.size} 项
            </span>
            <button 
              onClick={batchDeleteTasks}
              style={{ 
                backgroundColor: '#ff4d4f', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#ff7875';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#ff4d4f';
              }}
            >
              批量删除
            </button>
          </div>
        )}

        {/* 任务列表 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px' // 统一间距为8px
        }}>
          {monthlyTasks.map((task: Task) => (
            <TaskCard 
              key={task.id}
              task={task}
              config={config}
              minimizedTasks={minimizedTasks}
              toggleTaskMinimize={toggleTaskMinimize}
              updateTask={updateTask}
              deleteTask={deleteTask}
              isBatchMode={isBatchMode}
              isSelected={selectedTasks.has(task.id)}
              toggleSelection={toggleTaskSelection}
            />
          ))}
        </div>
        
        {/* 空状态 */}
        {monthlyTasks.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            color: '#8c8c8c',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '2px dashed #e8e8e8',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              width: '120px', 
              height: '120px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              backgroundColor: `${config.color}08`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              <ListTodo size={64} style={{ color: config.color, opacity: 0.6 }} />
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#595959'
            }}>暂无任务</h3>
            <p style={{ 
              fontSize: '1rem', 
              opacity: 0.8,
              marginBottom: '24px',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>点击上方"新增任务"按钮开始添加本月的任务吧，让我们一起规划行动！</p>
            <button 
              onClick={addTask} 
              style={{ 
                backgroundColor: config.color, 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 8px 20px ${config.color}30`;
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus size={18} /> 立即新增任务
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Popconfirm, Tooltip } from 'antd';
import { Plus, Map, CheckSquare, LineChart, Trash, Gauge } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { performanceSystem } from '../../utils/PerformanceSystem';

// 自定义滚动条样式 - 隐藏滚动条但保留滚动功能
const scrollbarStyles = `
  /* 隐藏滚动条但保留滚动功能 */
  .custom-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }

  /* Chrome, Safari 和 Opera */
  .custom-scrollbar::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

// 添加滚动条样式到文档头部
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

interface SubSidebarProps {
  activeTab: 'planning' | 'tasks' | 'analysis';
  currentMonth: number;
  setActiveTab: (tab: 'planning' | 'tasks' | 'analysis') => void;
  setCurrentMonth: (month: number) => void;
  allDimensions: ReturnType<typeof performanceSystem.getAllDimensionConfigs>;
  selectedDimension: string;
  setSelectedDimension: (dimension: string) => void;
  showAddDimension: boolean;
  setShowAddDimension: (show: boolean) => void;
  onDeleteDimension: (dimensionKey: string) => Promise<void>;
}

const months = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

const SubSidebar: React.FC<SubSidebarProps> = ({
  activeTab,
  currentMonth,
  setActiveTab,
  setCurrentMonth,
  allDimensions,
  selectedDimension,
  setSelectedDimension,
  showAddDimension,
  setShowAddDimension,
  onDeleteDimension
}) => {
  // 获取当前维度配置
  const config = performanceSystem.getDimensionConfig(selectedDimension) || {
    title: '未知维度',
    icon: 'Gauge',
    color: '#95a5a6'
  };

  const getIconByName = (name?: string) => {
    if (!name) return <Gauge size={18} />;
    
    const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
    if (typeof IconComponent === 'function') {
      return <IconComponent size={18} />;
    }
    
    return <Gauge size={18} />;
  };

  // --- 内部样式对象 ---
  const styles = {
    subSidebar: {
      width: '240px',
      height: '100%',
      backgroundColor: '#fff',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '20px 0',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      overflowX: 'hidden' as const // 防止横向滚动条
    },
    navItem: (isActive: boolean) => ({
      padding: '14px 24px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.95rem',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? config.color : '#595959',
      backgroundColor: isActive ? `${config.color}0D` : 'transparent',
      borderRight: `3px solid ${isActive ? config.color : 'transparent'}`,
      transition: 'all 0.3s'
    }),
    monthGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      padding: '15px'
    }
  };

  return (
    <aside style={styles.subSidebar}>
      {/* 维度列表区域 */}
      <div style={{ padding: '0 24px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#595959' }}>维度列表</div>
          <button
            onClick={() => setShowAddDimension(!showAddDimension)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#673ab7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* 维度列表 */}
        <div className="custom-scrollbar" style={{ maxHeight: '150px', overflowY: 'auto' }}>
          {allDimensions.map(dim => (
            <div
              key={dim.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                marginBottom: '8px',
                borderRadius: '6px',
                backgroundColor: selectedDimension === dim.key ? `${dim.color}15` : '#fff',
                border: `2px solid ${selectedDimension === dim.key ? dim.color : 'transparent'}`,
                transition: 'all 0.2s'
              }}
            >
              <div 
                onClick={() => setSelectedDimension(dim.key)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flex: 1,
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {/* 图标移除，保留色点 */}
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: dim.color,
                  marginRight: '8px'
                }}></div>
                <span style={{ fontSize: '0.85rem', color: '#595959' }}>{dim.title}</span>
              </div>
              {selectedDimension === dim.key && !dim.isDefault && (
                <Popconfirm
                  title="删除维度"
                  description={`确定要删除维度 "${dim.title}" 吗？此操作不可撤销。`}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => onDeleteDimension(dim.key)}
                >
                  <Tooltip title="删除维度">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        color: '#ff4d4f',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        zIndex: 10,
                        marginLeft: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff1f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash size={14} />
                    </button>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
          ))}
        </div>
        
        {/* 添加维度弹窗由上层控制，这里仅通过按钮开关 */}
      </div>

      {/* 当前维度信息 */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '6px', 
            backgroundColor: config.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem'
          }}>
            {getIconByName(config.icon)}
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{config.title}</div>
            <div style={{ fontSize: '0.7rem', color: '#8c8c8c' }}>维度管理控制台</div>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav style={{ marginTop: '20px', flex: 1 }}>
        <div 
          style={styles.navItem(activeTab === 'planning')} 
          onClick={() => setActiveTab('planning')}
        >
          <Map size={20} style={{ marginRight: '12px' }} />
          年度目标规划
        </div>
        <div 
          style={styles.navItem(activeTab === 'tasks')} 
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={20} style={{ marginRight: '12px' }} />
          月度任务执行
        </div>
        <div 
          style={styles.navItem(activeTab === 'analysis')} 
          onClick={() => setActiveTab('analysis')}
        >
          <LineChart size={20} style={{ marginRight: '12px' }} />
          绩效分析报告
        </div>
      </nav>

      {/* 侧边栏底部：快速月份切换 */}
      {activeTab === 'tasks' && (
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
          <div style={{ padding: '0 20px', fontSize: '0.8rem', color: '#8c8c8c', marginBottom: '10px' }}>
            快速跳转月份
          </div>
          <div style={styles.monthGrid}>
            {months.map((m, i) => (
              <button
                key={i}
                onClick={() => setCurrentMonth(i)}
                style={{
                  padding: '6px 0', border: '1px solid #d9d9d9', borderRadius: '4px',
                  backgroundColor: currentMonth === i ? config.color : '#fff',
                  color: currentMonth === i ? '#fff' : '#595959',
                  fontSize: '0.75rem', cursor: 'pointer'
                }}
              >
                {m.replace('月', '')}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default SubSidebar;

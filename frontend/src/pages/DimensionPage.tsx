/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Form, message } from 'antd';

import { performanceSystem } from '../utils/PerformanceSystem';
import type { Task } from '../utils/PerformanceSystem';

// 导入提取的组件
import SubSidebar from '../components/Dimension/SubSidebar';
import PageHeader from '../components/Dimension/PageHeader';
import PlanningView from '../components/Dimension/PlanningView';
import TasksView from '../components/Dimension/TasksView';
import AnalysisView from '../components/Dimension/AnalysisView';
import AddTaskModal from '../components/Dimension/AddTaskModal';
import AddDimensionModal from '../components/Dimension/AddDimensionModal';
import DeleteTaskModal from '../components/Dimension/DeleteTaskModal';


interface DimensionPageProps {
  dimensionKey: string;
  currentYear: string;
  onYearChange: (year: string) => void;
}

// 定义二级菜单类型
type ViewTab = 'planning' | 'tasks' | 'analysis';

const DimensionPage: React.FC<DimensionPageProps> = ({ dimensionKey, currentYear, onYearChange }) => {
  // --- 状态管理 ---
  const [activeTab, setActiveTab] = useState<ViewTab>('tasks');
  const [currentMonth, setCurrentMonth] = useState(performanceSystem.getCurrentMonth());

  const [yearData, setYearData] = useState(performanceSystem.getCurrentYearData());
  const [selectedDimension, setSelectedDimension] = useState(dimensionKey);
  const [showAddDimension, setShowAddDimension] = useState(false);
  
  // 新增任务模态框
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  // 删除任务确认模态框
  const [isDeleteTaskModalVisible, setIsDeleteTaskModalVisible] = useState(false);
  // 当前要删除的任务ID
  const [taskIdToDelete, setTaskIdToDelete] = useState('');
  // 新增任务表单
  const [addTaskForm] = Form.useForm();
  // 最小化的任务ID列表
  const [minimizedTasks, setMinimizedTasks] = useState<Set<string>>(new Set());
  // 显示烟花效果的任务ID
  // const [_, setFireworkTaskId] = useState<string | null>(null);
  // 批量选择模式
  const [isBatchMode, setIsBatchMode] = useState(false);
  // 选中的任务ID集合
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  
  // 获取所有维度配置
  const [allDimensions, setAllDimensions] = useState(performanceSystem.getAllDimensionConfigs());
  console.log('allDimension_page------->', allDimensions);

  // 确保选中有效的维度
  React.useEffect(() => {
    if (allDimensions.length > 0) {
      const dimensionExists = allDimensions.some(dim => dim.key === selectedDimension);
      if (!dimensionExists) {
        setSelectedDimension(allDimensions[0].key);
      }
    }
  }, [allDimensions, selectedDimension, setSelectedDimension]);

  // --- 数据获取 ---
  const config = performanceSystem.getDimensionConfig(selectedDimension) || {
    title: '未知维度',
    icon: 'Cube',
    color: '#95a5a6'
  };

  const dimData = yearData.dimensions?.[selectedDimension] || { 
    annualGoal: '',
    quarterlyGoals: ['', '', '', ''],
    monthlyTasks: Array(12).fill(null).map(() => []),
    totalScore: 0,
    completedTasks: 0,
    totalTasks: 0,
    progress: 0,
    settings: { scoring: { completedScore: 100, inProgressScore: 50, notStartedScore: 0 } }
  }


  // --- 业务逻辑处理 ---
  const handleAnnualGoalChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    await performanceSystem.updateDimensionAnnualGoal(selectedDimension, e.target.value);
    setYearData(performanceSystem.getCurrentYearData());
  };

  const handleQuarterlyGoalChange = async (quarter: number, e: React.ChangeEvent<HTMLInputElement>) => {
    await performanceSystem.updateDimensionQuarterlyGoal(selectedDimension, quarter, e.target.value);
    setYearData(performanceSystem.getCurrentYearData());
  };

  const addTask = () => {
    setIsAddTaskModalVisible(true);
  };

  // 处理新增任务表单提交
  const handleAddTaskFinish = async (values: any) => {
    try {
      // 使用performanceSystem添加新任务
      await performanceSystem.addMonthlyTask(selectedDimension, currentMonth, values);
      // 更新数据
      setYearData(performanceSystem.getCurrentYearData());
      // 关闭模态框
      setIsAddTaskModalVisible(false);
      // 重置表单
      addTaskForm.resetFields();
    } catch (error) {
      console.error('添加任务失败:', error);
    }
  };

  // 切换任务最小化状态
  const toggleTaskMinimize = (taskId: string) => {
    setMinimizedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // 任务完成时的烟花效果
  const showFirework = (taskId: string) => {
    console.log('firework----->', taskId);
  };

  const updateTask = async <K extends keyof Task>(taskId: string, field: K, value: Task[K]) => {
    // 如果任务状态变为已完成，记录下来
    const shouldMinimize = field === 'status' && value === 'completed';
    
    console.log('updateTask called:', { taskId, field, value, selectedDimension, currentMonth });
    // 创建一个类型安全的更新对象
    const updates = { [field]: value } as Partial<Task>;
    await performanceSystem.updateMonthlyTask(selectedDimension, currentMonth, taskId, updates);
    setYearData(performanceSystem.getCurrentYearData());
    
    // 如果任务完成，自动最小化并显示烟花
    if (shouldMinimize) {
      toggleTaskMinimize(taskId);
      showFirework(taskId);
    }
  };

  const deleteTask = (taskId: string) => {
    setTaskIdToDelete(taskId);
    setIsDeleteTaskModalVisible(true);
  };

  // 切换批量选择模式
  const toggleBatchMode = () => {
    const newBatchMode = !isBatchMode;
    setIsBatchMode(newBatchMode);
    
    // 如果进入批量选择模式，将所有当前月份的任务变为最小化
    if (newBatchMode) {
      const currentMonthTasks = dimData.monthlyTasks[currentMonth] || [];
      const allTaskIds = currentMonthTasks.map(task => task.id);
      setMinimizedTasks(new Set(allTaskIds));
    }
    
    // 如果退出批量选择模式，清空选中的任务
    if (isBatchMode) {
      setSelectedTasks(new Set());
    }
  };

  // 切换单个任务的选择状态
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // 批量删除选中的任务
  const batchDeleteTasks = async () => {
    // 显示确认模态框
    setTaskIdToDelete(Array.from(selectedTasks).join(','));
    setIsDeleteTaskModalVisible(true);
  };


  
  const handleAddDimensionSubmit = async (data: { title: string; color: string; icon: string }) => {
    try {
      const newKey = await performanceSystem.addDimension({
        title: data.title,
        icon: data.icon,
        color: data.color,
        isDefault: false
      });
      if (newKey) {
        setSelectedDimension(newKey);
        setShowAddDimension(false);
        setYearData(performanceSystem.getCurrentYearData());
        setAllDimensions(performanceSystem.getAllDimensionConfigs());
        message.success('维度添加成功');
      } else {
        message.error('维度添加失败');
      }
    } catch (error) {
      console.error('添加维度失败:', error);
      message.error('维度添加失败，请重试');
    }
  };

  // 删除维度
  const handleDeleteDimension = async (dimensionKey: string) => {
    try {
      const success = await performanceSystem.deleteDimension(dimensionKey);
      if (success) {
        // 如果删除的是当前选中的维度，切换到第一个维度
        const allDims = performanceSystem.getAllDimensionConfigs();
        if (selectedDimension === dimensionKey && allDims.length > 0) {
          setSelectedDimension(allDims[0].key);
        }
        // 更新数据
        setYearData(performanceSystem.getCurrentYearData());
        setAllDimensions(allDims);
        message.success('维度删除成功');
      } else {
        message.error('维度删除失败');
      }
    } catch (error) {
      console.error('删除维度失败:', error);
      message.error('维度删除失败，请重试');
    }
  };


 const styles = {
    container: {
      display: 'flex',
      height: '100%', 
      width: '100%',
      overflow: 'hidden', // 禁止父级滚动
      backgroundColor: 'transparent',
      margin: 0,
      padding: 0,
    },
    subSidebar: {
      width: '260px',
      height: '100%', // 关键 2: 侧边栏撑满容器高度
      backgroundColor: '#fff',
      borderRight: '1px solid #f0f0f0',
      display: 'flex',
      flexDirection: 'column' as const,
      flexShrink: 0, // 防止被右侧内容挤窄
      overflowY: 'auto' as const, // 如果侧边栏内容多，允许它自己滚动
      borderTopLeftRadius: '24px', // 左上角圆角，匹配外层
      borderBottomLeftRadius: '24px', // 左下角圆角，匹配外层
    },
    mainContent: {
      flex: 1,
      height: '100%', // 关键 3: 撑满容器
      padding: '24px',
      overflowY: 'auto' as const, // 关键 4: 只有这里允许上下滚动
      backgroundColor: '#f5f7fa',
      display: 'flex',
      flexDirection: 'column' as const,
      borderTopRightRadius: '24px', // 右上角圆角，匹配外层
      borderBottomRightRadius: '24px', // 右下角圆角，匹配外层
    },
    // ... 其他样式
  };

  return (
    <div style={styles.container} className="page-transition">
      {/* --- 1. 二级侧边栏 (Sub-Sidebar) --- */}
      <div style={styles.subSidebar}>
        <SubSidebar 
          activeTab={activeTab}
          currentMonth={currentMonth}
          setActiveTab={setActiveTab}
          setCurrentMonth={setCurrentMonth}
          allDimensions={allDimensions}
          selectedDimension={selectedDimension}
          setSelectedDimension={setSelectedDimension}
          showAddDimension={showAddDimension}
          setShowAddDimension={setShowAddDimension}
          onDeleteDimension={handleDeleteDimension}
        />
      </div>

      {/* --- 2. 主内容区域 (Main Content) --- */}
      <div style={styles.mainContent}>
        {/* 顶部通栏 */}
        <PageHeader 
          activeTab={activeTab}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onYearChange={onYearChange}
        />



        {/* --- 视图按需渲染 --- */}
        
        {/* 视图一：规划视图 */}
        {activeTab === 'planning' && (
          <PlanningView
            currentYear={currentYear}
            config={config}
            dimData={dimData}
            handleAnnualGoalChange={handleAnnualGoalChange}
            handleQuarterlyGoalChange={handleQuarterlyGoalChange}
          />
        )}

        {/* 视图二：任务视图 */}
        {activeTab === 'tasks' && (
          <TasksView
            currentMonth={currentMonth}
            config={config}
            dimData={dimData}
            addTask={addTask}
            minimizedTasks={minimizedTasks}
            toggleTaskMinimize={toggleTaskMinimize}
            updateTask={updateTask}
            deleteTask={deleteTask}
            isBatchMode={isBatchMode}
            toggleBatchMode={toggleBatchMode}
            selectedTasks={selectedTasks}
            toggleTaskSelection={toggleTaskSelection}
            batchDeleteTasks={batchDeleteTasks}
          />
        )}

        {/* 视图三：统计分析视图 */}
        {activeTab === 'analysis' && (
          <AnalysisView
            currentMonth={currentMonth}
            config={config}
            dimData={dimData}
          />
        )}

        {/* 新增任务模态框 */}
        <AddTaskModal
          open={isAddTaskModalVisible}
          onCancel={() => setIsAddTaskModalVisible(false)}
          onOk={() => addTaskForm.submit()}
          onFinish={handleAddTaskFinish}
          form={addTaskForm}
        />

        {/* 删除任务确认模态框 */}
        <DeleteTaskModal
          open={isDeleteTaskModalVisible}
          onCancel={() => setIsDeleteTaskModalVisible(false)}
          onOk={async () => {
            await performanceSystem.deleteMonthlyTask(selectedDimension, currentMonth, taskIdToDelete);
            setYearData(performanceSystem.getCurrentYearData());
            setIsDeleteTaskModalVisible(false);
          }}
        />

        {/* 添加维度弹窗 */}
        <AddDimensionModal
          open={showAddDimension}
          onCancel={() => setShowAddDimension(false)}
          onSubmit={handleAddDimensionSubmit}
        />
      </div>
    </div>
  );
};

export default DimensionPage;

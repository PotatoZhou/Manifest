/* eslint-disable @typescript-eslint/no-explicit-any */

// 数据结构定义
export interface Account {
  id: string;
  username: string;
  avatarPath: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score: number;
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
}

export interface DimensionConfig {
  key: string;
  title: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface DimensionData {
  annualGoal: string;
  quarterlyGoals: string[];
  monthlyTasks: Task[][];
  totalScore: number;
  completedTasks: number;
  totalTasks: number;
  progress: number;
  settings: {
    scoring: {
      completedScore: number;
      inProgressScore: number;
      notStartedScore: number;
      [key: string]: unknown;
    };
  };
}

export interface AnnualData {
  year: string;
  totalScore: number;
  settings: {
    scoring: {
      dimensionWeights: {
        [key: string]: number;
      };
      [key: string]: unknown;
    };
  };
  dimensionConfigs: DimensionConfig[];
  dimensions: {
    [key: string]: DimensionData;
  };
}

export interface SystemData {
  [year: string]: AnnualData;
}

class PerformanceSystem {
  public currentYear: string;
  private data: SystemData;
  private static readonly defaultDimensions: DimensionConfig[] = [
    { key: 'dream', title: '梦想', icon: 'Palette', color: '#9c27b0', isDefault: true },
    { key: 'health', title: '健康', icon: 'Heart', color: '#4caf50', isDefault: true },
    { key: 'work', title: '工作', icon: 'Briefcase', color: '#2196f3', isDefault: true },
    { key: 'mind', title: '心智', icon: 'Brain', color: '#ff9800', isDefault: true },
    { key: 'psychology', title: '心理', icon: 'Smile', color: '#e91e63', isDefault: true }
  ];

  constructor() {
    this.currentYear = new Date().getFullYear().toString();
    this.data = {};
    // 延迟初始化，等待 Wails 后端就绪后再调用
  }

  public async initialize(): Promise<void> {
    await this.loadDataFromBackend();
    await this.initCurrentYear();
  }

  // 从后端加载所有数据
  private async loadDataFromBackend(): Promise<void> {
    try {
      // 使用 Wails 调用后端方法
      console.log('Checking Wails backend availability...');
      if (typeof window !== 'undefined' && window.go?.main?.App?.GetAllAnnualData) {
        console.log('Wails backend available, calling GetAllAnnualData...');
        const data = await window.go.main.App.GetAllAnnualData();
        console.log('Received data from backend:', data);
        this.data = data;
      } else {
        console.error('Wails backend methods not available');
        // 初始化默认数据，以便在没有后端的情况下也能运行
        this.data = {};
        await this.initCurrentYear();
      }
    } catch (error) {
      console.error('Failed to load data from backend:', error);
      // 初始化默认数据，以便在没有后端的情况下也能运行
      this.data = {};
      await this.initCurrentYear();
    }
  }

  // 保存数据到后端
  private async saveDataToBackend(): Promise<void> {
    try {
      // 遍历所有年度数据并保存
      console.log('Attempting to save data to backend...');
      if (typeof window !== 'undefined' && window.go?.main?.App?.SaveAnnualData) {
        for (const year of Object.keys(this.data)) {
          const yearData = this.data[year];
          if (yearData) {
            console.log(`Saving data for year ${year}:`, yearData);
            await window.go.main.App.SaveAnnualData(yearData);
            console.log(`Data saved for year ${year}`);
          }
        }
      } else {
        console.warn('Wails backend methods not available, data will not be persisted');
      }
    } catch (error) {
      console.error('Failed to save data to backend:', error);
    }
  }

  // 保存数据
  private async saveData(): Promise<void> {
    await this.saveDataToBackend();
  }


  // 初始化当前年份数据
  private async initCurrentYear(): Promise<void> {
    if (!this.data[this.currentYear]) {
      await this.initYearData(this.currentYear);
    }
  }

  // 初始化年份数据
  public async initYearData(year: string): Promise<void> {
    const dimensions: { [key: string]: DimensionData } = {};
    
    // 初始化默认维度数据
    PerformanceSystem.defaultDimensions.forEach(dimConfig => {
      dimensions[dimConfig.key] = this.createDimensionData();
    });

    this.data[year] = {
      year,
      totalScore: 0,
      settings: {
        scoring: {
          dimensionWeights: {
            dream: 0.25,
            health: 0.25,
            work: 0.25,
            mind: 0.25,
            psychology: 0.25
          }
        }
      },
      dimensionConfigs: PerformanceSystem.defaultDimensions,
      dimensions: dimensions
    };

    await this.saveData();
  }

  // 同步初始化当前年份数据（用于getCurrentYearData中）
  private syncInitCurrentYear(): void {
    if (!this.data[this.currentYear]) {
      const dimensions: { [key: string]: DimensionData } = {};
      
      // 初始化默认维度数据
      PerformanceSystem.defaultDimensions.forEach(dimConfig => {
        dimensions[dimConfig.key] = this.createDimensionData();
      });

      this.data[this.currentYear] = {
        year: this.currentYear,
        totalScore: 0,
        settings: {
          scoring: {
            dimensionWeights: {
              dream: 0.25,
              health: 0.25,
              work: 0.25,
              mind: 0.25,
              psychology: 0.25
            }
          }
        },
        dimensionConfigs: PerformanceSystem.defaultDimensions,
        dimensions: dimensions
      };
    }
  }

  // 创建维度数据
  private createDimensionData(): DimensionData {
    return {
      annualGoal: '',
      quarterlyGoals: ['', '', '', ''],
      monthlyTasks: Array.from({ length: 12 }, () => []),
      totalScore: 0,
      completedTasks: 0,
      totalTasks: 0,
      progress: 0,
      settings: {
        scoring: {
          completedScore: 100,
          inProgressScore: 50,
          notStartedScore: 0
        }
      }
    };
  }

  // 获取可用年份
  public getAvailableYears(): string[] {
    const currentYear = parseInt(new Date().getFullYear().toString());
    const years: Set<string> = new Set();
    
    // 添加当前年份前后3年
    for (let i = -3; i <= 3; i++) {
      years.add((currentYear + i).toString());
    }
    
    // 添加已存在数据的年份
    Object.keys(this.data).forEach(year => years.add(year));
    
    // 按降序排序
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }

  // 切换年份
  public async switchYear(year: string): Promise<void> {
    this.currentYear = year;
    if (!this.data[year]) {
      await this.initYearData(year);
    }
  }

  // 获取当前年度数据
  public getCurrentYearData(): AnnualData {
    // 确保当前年份数据存在（使用同步初始化方法）
    this.syncInitCurrentYear();
    
    // 返回数据的深拷贝，确保 React 能够检测到状态变化
    return JSON.parse(JSON.stringify(this.data[this.currentYear])) as AnnualData;
  }

  // 获取指定年度数据
  public getYearData(year: string): AnnualData | undefined {
    if (!this.data[year]) {
      return undefined;
    }
    // 返回数据的深拷贝，确保 React 能够检测到状态变化
    return JSON.parse(JSON.stringify(this.data[year])) as AnnualData;
  }

  // 更新维度年度目标
  public async updateDimensionAnnualGoal(dimension: string, goal: string): Promise<void> {
    const yearData = this.data[this.currentYear];
    if (yearData && yearData.dimensions[dimension]) {
      yearData.dimensions[dimension].annualGoal = goal;
      await this.saveData();
    }
  }

  // 更新维度季度目标
  public async updateDimensionQuarterlyGoal(dimension: string, quarter: number, goal: string): Promise<void> {
    const yearData = this.data[this.currentYear];
    if (yearData && yearData.dimensions[dimension] && quarter >= 0 && quarter < 4) {
      yearData.dimensions[dimension].quarterlyGoals[quarter] = goal;
      await this.saveData();
    }
  }

  // 添加月度任务
  public async addMonthlyTask(dimension: string, month: number, task: Omit<Task, 'id'>): Promise<void> {
    const yearData = this.data[this.currentYear];
    if (yearData && yearData.dimensions[dimension] && month >= 0 && month < 12) {
      const newTask: Task = {
        ...task,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };
      
      const dimData = yearData.dimensions[dimension];
      if (!dimData.monthlyTasks[month]) {
        dimData.monthlyTasks[month] = [];
      }
      
      dimData.monthlyTasks[month].push(newTask);
      this.updateDimensionStats(dimension);
      await this.saveData();
    }
  }

  // 更新月度任务
  public async updateMonthlyTask(dimension: string, month: number, taskId: string, updates: Partial<Task>): Promise<void> {
    console.log('updateMonthlyTask called:', { dimension, month, taskId, updates });
    const yearData = this.data[this.currentYear];
    if (yearData && yearData.dimensions[dimension] && month >= 0 && month < 12) {
      const dimData = yearData.dimensions[dimension];
      const tasks = dimData.monthlyTasks[month];
      if (tasks) {
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex !== -1) {
          console.log('Task found, updating:', tasks[taskIndex]);
          tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
          console.log('Task after update:', tasks[taskIndex]);
          this.updateDimensionStats(dimension);
          await this.saveData();
        } else {
          console.log('Task not found:', taskId);
        }
      } else {
        console.log('No tasks found for month:', month);
      }
    } else {
      console.log('Invalid dimension or month:', { dimension, month });
    }
  }

  // 删除月度任务
  public async deleteMonthlyTask(dimension: string, month: number, taskId: string): Promise<void> {
    const yearData = this.data[this.currentYear];
    if (yearData && yearData.dimensions[dimension] && month >= 0 && month < 12) {
      const dimData = yearData.dimensions[dimension];
      const tasks = dimData.monthlyTasks[month];
      if (tasks) {
        dimData.monthlyTasks[month] = tasks.filter((t: Task) => t.id !== taskId);
        this.updateDimensionStats(dimension);
        await this.saveData();
      }
    }
  }

  // 更新维度统计数据
  private updateDimensionStats(dimension: string): void {
    const yearData = this.data[this.currentYear];
    if (!yearData || !yearData.dimensions[dimension]) return;

    const dimData = yearData.dimensions[dimension];
    let totalScore = 0;
    let completedTasks = 0;
    let totalTasks = 0;

    // 确保 monthlyTasks 是一个包含 12 个元素的数组
    if (!dimData.monthlyTasks || !Array.isArray(dimData.monthlyTasks)) {
      dimData.monthlyTasks = Array.from({ length: 12 }, () => []);
    } else if (dimData.monthlyTasks.length !== 12) {
      // 扩展或截断数组到 12 个元素
      const temp: Task[][] = Array.from({ length: 12 }, () => []);
      for (let i = 0; i < Math.min(dimData.monthlyTasks.length, 12); i++) {
        if (Array.isArray(dimData.monthlyTasks[i])) {
          temp[i] = dimData.monthlyTasks[i] as Task[];
        }
      }
      dimData.monthlyTasks = temp;
    }

    // 计算所有月度任务的统计数据
    dimData.monthlyTasks.forEach((monthTasks: Task[]) => {
      if (Array.isArray(monthTasks)) {
        monthTasks.forEach((task: Task) => {
          totalTasks++;
          if (task.status === 'completed') {
            completedTasks++;
            totalScore += dimData.settings.scoring.completedScore;
          } else if (task.status === 'in-progress') {
            totalScore += dimData.settings.scoring.inProgressScore;
          } else {
            totalScore += dimData.settings.scoring.notStartedScore;
          }
        });
      }
    });

    dimData.totalScore = totalScore;
    dimData.completedTasks = completedTasks;
    dimData.totalTasks = totalTasks;
    dimData.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 更新年度总分数
    this.updateAnnualTotalScore();
  }

  // 更新年度总分数
  private updateAnnualTotalScore(): void {
    const yearData = this.data[this.currentYear];
    if (!yearData) return;

    const weights = yearData.settings.scoring.dimensionWeights;
    let totalScore = 0;

    Object.keys(weights).forEach(dimension => {
      const weight = weights[dimension];
      const dimData = yearData.dimensions[dimension];
      if (dimData) {
        totalScore += dimData.totalScore * weight;
      }
    });

    yearData.totalScore = totalScore;
  }

  // 获取当前季度
  public getCurrentQuarter(): number {
    const month = new Date().getMonth();
    return Math.floor(month / 3);
  }

  // 获取当前月份
  public getCurrentMonth(): number {
    return new Date().getMonth();
  }

  // 获取维度配置
  public getDimensionConfig(dimensionKey: string): DimensionConfig | undefined {
    const yearData = this.data[this.currentYear];
    if (!yearData || !yearData.dimensionConfigs) return undefined;
    
    return yearData.dimensionConfigs.find(config => config.key === dimensionKey);
  }

  // 获取所有维度配置
  public getAllDimensionConfigs(): DimensionConfig[] {
    const yearData = this.data[this.currentYear];
    if (!yearData || !yearData.dimensionConfigs) return [];
    
    // 返回数据的深拷贝，确保 React 能够检测到状态变化
    return JSON.parse(JSON.stringify(yearData.dimensionConfigs)) as DimensionConfig[];
  }

  // 添加新维度
  public async addDimension(config: Omit<DimensionConfig, 'key'>): Promise<string> {
    const yearData = this.data[this.currentYear];
    if (!yearData || !yearData.dimensionConfigs) return '';

    // 生成唯一key
    const dimensionKey = `custom_${Date.now()}`;
    const newConfig: DimensionConfig = {
      ...config,
      key: dimensionKey
    };

    // 添加维度配置
    yearData.dimensionConfigs.push(newConfig);

    // 初始化维度数据
    yearData.dimensions[dimensionKey] = this.createDimensionData();

    // 添加维度权重
    yearData.settings.scoring.dimensionWeights[dimensionKey] = 0.25;

    await this.saveData();
    return dimensionKey;
  }

  // 删除维度
  public async deleteDimension(dimensionKey: string): Promise<boolean> {
    const yearData = this.data[this.currentYear];
    if (!yearData || !yearData.dimensionConfigs) return false;

    // 查找维度配置
    const configIndex = yearData.dimensionConfigs.findIndex(config => config.key === dimensionKey);
    if (configIndex === -1) return false;

    // 不能删除默认维度
    const config = yearData.dimensionConfigs[configIndex];
    if (config.isDefault) return false;

    // 删除维度配置
    yearData.dimensionConfigs.splice(configIndex, 1);

    // 删除维度数据
    delete yearData.dimensions[dimensionKey];

    // 删除维度权重
    delete yearData.settings.scoring.dimensionWeights[dimensionKey];

    await this.saveData();
    return true;
  }

  // 更新维度配置
  public async updateDimensionConfig(dimensionKey: string, updates: Partial<Omit<DimensionConfig, 'key' | 'isDefault'>>): Promise<boolean> {
    const yearData = this.data[this.currentYear];
    if (!yearData || !yearData.dimensionConfigs) return false;

    // 查找维度配置
    const config = yearData.dimensionConfigs.find(config => config.key === dimensionKey);
    if (!config) return false;

    // 更新配置
    Object.assign(config, updates);

    await this.saveData();
    return true;
  }

  // 重置所有数据
  public async resetAllData(): Promise<void> {
    try {
      // 调用后端重置数据的方法
      if (window.go?.main?.App?.ResetAllData) {
        await window.go.main.App.ResetAllData();
        
        // 重置内存中的数据
        this.data = {};
        
        // 重新初始化当前年份数据
        await this.initCurrentYear();
      } else {
        console.error('Wails backend methods not available');
      }
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  }

  // 获取所有数据
  public getAllData(): SystemData {
    return this.data;
  }
}

// 创建单例实例
export const performanceSystem = new PerformanceSystem();

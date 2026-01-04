/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import * as Icons from 'lucide-react';
import { Gauge } from 'lucide-react';

interface Dimension {
  key: string;
  title: string;
  color: string;
  icon?: string;
}

interface YearData {
  dimensions: Record<string, {
    progress: number;
    completedTasks: number;
    totalTasks: number;
  }>;
}

interface DashboardCardsProps {
  allDimensions: Dimension[];
  yearData: YearData;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ allDimensions, yearData }) => {
  // 使用单个useRef存储canvas元素
  const dreamChartRef = useRef<HTMLCanvasElement>(null);

  // 使用单个useRef存储Chart实例
  const dreamChart = useRef<Chart | null>(null);

  // 将十六进制颜色转换为RGB值
  const hexToRgb = (hex: string): string => {
    // 移除#符号
    const cleanHex = hex.replace('#', '');
    
    // 解析RGB值
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  };

  // 根据配置的图标名称获取对应的图标
  const getIconByName = (name?: string) => {
    const Comp = name ? (Icons as any)[name] : null;
    return Comp ? <Comp size={18} /> : <Gauge size={18} />;
  };

  // 初始化图表
  useEffect(() => {
    return () => {
      if (dreamChart.current) {
        dreamChart.current.destroy();
        dreamChart.current = null;
      }
    };
  }, []);

  return (
    <div className="dashboard-cards">
      {allDimensions.map(dimension => {
        const dimensionKey = dimension.key;
        const dimensionTitle = dimension.title;
        const dimensionColor = dimension.color;
        const dimensionData = yearData?.dimensions?.[dimensionKey];
        return (
          <div key={dimensionKey} className={`card ${dimensionKey}`}>
            <div className="card-header">
              <div className="card-icon" style={{ background: `rgba(${hexToRgb(dimensionColor)}, 0.1)`, color: dimensionColor }}>
                {getIconByName(dimension.icon)}
              </div>
              <div>
                <div className="card-title">{dimensionTitle}</div>
                <div className="card-subtitle">年度目标完成情况</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px 0' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: dimensionColor, marginBottom: '8px' }}>
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
  );
};

export default DashboardCards;
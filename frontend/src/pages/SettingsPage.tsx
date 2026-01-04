/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Sun, Moon, SlidersHorizontal, Database, Upload, Download, Trash, Info } from 'lucide-react';
import { Select, Modal } from 'antd';
import { performanceSystem } from '../utils/PerformanceSystem';
import Button from '../components/Button/Button';
import YearSelector from '../components/YearSelector/YearSelector';

interface SettingsPageProps {
  currentYear: string;
  onYearChange: (year: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentYear, onYearChange, darkMode, toggleDarkMode }) => {
  const [settings, setSettings] = useState({
    autoSave: true,
    theme: 'light',
    notifications: true,
    backupInterval: 30 // days
  });

  // 保存设置
  const handleSaveSettings = () => {
    // 这里可以将设置保存到localStorage
    localStorage.setItem('performance_system_settings', JSON.stringify(settings));
    const alertElement = document.getElementById('alert-success');
    if (alertElement) {
      alertElement.style.display = 'block';
      setTimeout(() => {
        alertElement.style.display = 'none';
      }, 3000);
    }
  };

  // 重置数据
  const handleResetData = () => {
    Modal.confirm({
      title: '确认重置数据',
      content: '确定要重置所有数据吗？此操作不可恢复！',
      okText: '确认重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await performanceSystem.resetAllData();
          Modal.success({
            title: '数据重置成功',
            content: '所有数据已成功重置！',
            onOk: () => {
              // 刷新页面或重新加载数据
              window.location.reload();
            }
          });
        } catch (error) {
          console.error('重置数据失败:', error);
          Modal.error({
            title: '数据重置失败',
            content: '重置数据时发生错误，请重试！'
          });
        }
      }
    });
  };

  // 导入数据
  const handleImportData = () => {
    // 创建文件选择输入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // 监听文件选择事件
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // 读取文件内容
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          // 解析JSON数据
          const data = JSON.parse(event.target.result);
          
          // 调用导入方法
          await performanceSystem.importData(data);
          
          // 提示成功
          alert('数据导入成功！');
          
          // 刷新页面或重新加载数据
          window.location.reload();
        } catch (error) {
          console.error('导入数据失败:', error);
          alert('导入数据失败，请检查文件格式是否正确！');
        }
      };
      
      // 读取文件
      reader.readAsText(file);
    };
    
    // 触发文件选择
    fileInput.click();
  };

  // 导出数据
  const handleExportData = () => {
    const data = performanceSystem.getAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="settings-page" className="page" style={{ padding: '20px 30px' }}>
      <div className="page-header">
        <h2><SettingsIcon size={18} style={{ marginRight: '8px' }} /> 系统设置</h2>
        <YearSelector currentYear={currentYear} onChange={onYearChange} />
        <div className="page-actions">
          <Button onClick={handleSaveSettings}>
            <Save size={16} style={{ marginRight: '8px' }} /> 保存设置
          </Button>
          <Button onClick={toggleDarkMode} type="light">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>
      
      <div id="alert-success" className="alert alert-success" style={{ display: 'none' }}>
        ✅ 设置已成功保存！
      </div>

      {/* 基本设置 */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <div className="card-title">基本设置</div>
            <div className="card-subtitle">调整系统基本功能</div>
          </div>
        </div>
        
        <div className="settings-container">
          <div className="setting-item">
            <div className="setting-info">
              <h4>自动保存</h4>
              <p>自动保存数据，避免数据丢失</p>
            </div>
            <div className="setting-control">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
              />
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h4>主题</h4>
              <p>选择系统主题</p>
            </div>
            <div className="setting-control">
              <Select
                value={settings.theme}
                onChange={(value) => setSettings({ ...settings, theme: value })}
                style={{ width: '150px' }}
              >
                <Select.Option value="light">浅色主题</Select.Option>
                <Select.Option value="dark">深色主题</Select.Option>
              </Select>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h4>通知提醒</h4>
              <p>接收任务提醒和进度通知</p>
            </div>
            <div className="setting-control">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              />
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h4>备份间隔</h4>
              <p>自动备份数据的间隔天数</p>
            </div>
            <div className="setting-control">
              <Select
                value={settings.backupInterval.toString()}
                onChange={(value) => setSettings({ ...settings, backupInterval: parseInt(value) })}
                style={{ width: '150px' }}
              >
                <Select.Option value="7">7天</Select.Option>
                <Select.Option value="15">15天</Select.Option>
                <Select.Option value="30">30天</Select.Option>
                <Select.Option value="90">90天</Select.Option>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* 数据管理 */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>
            <Database size={18} />
          </div>
          <div>
            <div className="card-title">数据管理</div>
            <div className="card-subtitle">管理系统数据</div>
          </div>
        </div>
        
        <div className="data-management-container">
          <div className="data-action">
            <h4>导入数据</h4>
            <p>从JSON文件导入数据</p>
            <Button onClick={handleImportData}>
              <Upload size={16} style={{ marginRight: '8px' }} /> 导入数据
            </Button>
          </div>
          
          <div className="data-action">
            <h4>导出数据</h4>
            <p>导出数据为JSON文件</p>
            <Button onClick={handleExportData}>
              <Download size={16} style={{ marginRight: '8px' }} /> 导出数据
            </Button>
          </div>
          
          <div className="data-action danger">
            <h4>重置数据</h4>
            <p>清除所有数据，此操作不可恢复</p>
            <Button type="danger" onClick={handleResetData}>
              <Trash size={16} style={{ marginRight: '8px' }} /> 重置数据
            </Button>
          </div>
        </div>
      </div>
      
      {/* 关于系统 */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' }}>
            <Info size={18} />
          </div>
          <div>
            <div className="card-title">关于系统</div>
            <div className="card-subtitle">了解系统信息</div>
          </div>
        </div>
        
        <div className="about-container">
          <div className="about-item">
            <h4>系统名称</h4>
            <p>Manifest</p>
          </div>
          
          <div className="about-item">
            <h4>版本</h4>
            <p>v0.0.1</p>
          </div>
          
          <div className="about-item">
            <h4>描述</h4>
            <p>一个全面的个人绩效管理工具，帮助您设定目标、跟踪进度、评估表现。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
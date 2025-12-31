import React from 'react';
import { Gauge, Palette, History, Settings, PanelLeftClose, Languages, Target, HelpCircle, BookOpen, PanelRightOpen } from 'lucide-react';

import type { Account } from '../../utils/PerformanceSystem';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  darkMode: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  language: 'zh' | 'en';
  toggleLanguage: () => void;
  translations: {
    zh: { [key: string]: string };
    en: { [key: string]: string };
  };
  currentAccount: Account | null;
  onSwitchAccount: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, darkMode, isCollapsed, onToggleCollapse, language, toggleLanguage, translations, 
  // currentAccount, onSwitchAccount 
}) => {
  const navItems = [
    { id: 'dashboard', icon: <Gauge size={20} /> },
    { id: 'dimension', icon: <Palette size={20} /> },
    { id: 'years', icon: <History size={20} /> },
    { id: 'settings', icon: <Settings size={20} /> }
  ];

  return (
    <div className={`sidebar ${darkMode ? 'dark' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo-section">
        {!isCollapsed && (
          <div className="logo-content">
            <Target className="logo-icon" size={24} strokeWidth={1.5} />
            <h1 className="logo-text">Manifest</h1>
          </div>
        )}
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <PanelRightOpen size={20} strokeWidth={1.25} /> : <PanelLeftClose size={20} strokeWidth={1.25} />}
        </button>
      </div>
      
      {/* Search bar */}
      <div className={`search-bar-container ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="search-bar">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          {!isCollapsed && <input type="text" className="search-input" placeholder="Search..." />}
          {!isCollapsed && (
            <div>
            </div>
          )}
        </div>
      </div>

      {navItems.map(item => (
        <a
          key={item.id}
          href="#"
          className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(item.id);
          }}
          title={isCollapsed ? translations[language][item.id] : undefined}
        >
          <span className="nav-icon">{item.icon}</span>
          {!isCollapsed && <span>{translations[language][item.id]}</span>}
        </a>
      ))}
      
      {/* 导航项和帮助中心之间的分隔线 */}
      <hr className="sidebar-divider" />
      
      <div style={{ flex: 1 }}></div>
      
      {/* 帮助中心和更新日志 */}
      <div className={`help-section ${isCollapsed ? 'collapsed' : ''}`}>
        <div 
          className={`help-item ${isCollapsed ? 'collapsed' : ''}`}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isCollapsed ? '0' : '8px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '12px' : '10px 12px',
            margin: isCollapsed ? '4px' : '0 0 8px 0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <HelpCircle size={isCollapsed ? 20 : 18} />
          {!isCollapsed && <span>帮助中心</span>}
        </div>
        <div 
          className={`help-item ${isCollapsed ? 'collapsed' : ''}`}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isCollapsed ? '0' : '8px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '12px' : '10px 12px',
            margin: isCollapsed ? '4px' : '0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <BookOpen size={isCollapsed ? 20 : 18} />
          {!isCollapsed && <span>更新日志</span>}
        </div>
      </div>
      
      {/* 任务完成进度已注释掉 */}
      {/* <div className="progress-card">
        <h3 className="progress-title">任务完成进度</h3>
        <p className="progress-subtitle">任务完成 (1/3)</p>
      </div> */}
      
      {/* 帮助中心和用户信息之间的分隔线 */}
      <hr className="sidebar-divider" />
      
      {/* 用户信息和切换账号 - 只有当有头像时才显示 */}
      {/* {currentAccount?.avatarPath && currentAccount.avatarPath !== '' && (
        <div className="user-section">
          <div 
            className="user-info"
            onClick={onSwitchAccount}
          >
            <div className="user-avatar-container">
              <img 
                src={currentAccount.avatarPath}
                alt={currentAccount.username || ''} 
                className="user-avatar"
              />
            </div>
            {!isCollapsed && <div className="user-name">{currentAccount.username || ''}</div>}
          </div>
        </div>
      )} */}
      
      {/* 语言切换按钮 */}
      <button
        className={`language-toggle-btn ${darkMode ? 'dark' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        onClick={toggleLanguage}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        title={isCollapsed ? (language === 'zh' ? '切换到英文' : 'Switch to Chinese') : undefined}
      >
        {!isCollapsed && <span>{language === 'zh' ? 'EN' : '中文'}</span>}
        <Languages size={20} strokeWidth={1.25} />
      </button>
    </div>
  );
};

export default Sidebar;

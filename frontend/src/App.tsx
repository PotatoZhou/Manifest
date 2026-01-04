/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import DashboardPage from './pages/DashboardPage'
import DimensionPage from './pages/DimensionPage'
import YearsPage from './pages/YearsPage'
import SettingsPage from './pages/SettingsPage'
import UpdateModal from './components/UpdateModal/UpdateModal'
import { performanceSystem } from './utils/PerformanceSystem'

// 动态导入 Wails 绑定，避免在非 Wails 环境下报错
let EventsOn: (event: string, callback: (data: any) => void) => () => void = () => () => {};

try {
  if (typeof window !== 'undefined' && window.go) {
    const { EventsOn: EO } = await import('../wailsjs/runtime/runtime');
    EventsOn = EO;
  }
} catch (error) {
  console.log(error)
  console.warn('Wails bindings not available, using mock implementations');
}

// 中英文翻译对象
const translations = {
  zh: {
    dashboard: '总览仪表盘',
    dimension: '维度管理',
    years: '年度管理',
    settings: '系统设置'
  },
  en: {
    dashboard: 'Dashboard',
    dimension: 'Dimension',
    years: 'Trends',
    settings: 'Settings'
  }
}

// 从 localStorage 或系统偏好获取初始主题设置
const getInitialDarkMode = () => {
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme !== null) {
    return savedTheme === 'true'
  }
  // 检查系统偏好
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 从 localStorage 获取初始语言设置
const getInitialLanguage = (): 'zh' | 'en' => {
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage !== null && (savedLanguage === 'zh' || savedLanguage === 'en')) {
    return savedLanguage
  }
  // 默认使用中文
  return 'zh'
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard')
  const [currentYear, setCurrentYear] = useState<string>(performanceSystem.currentYear)
  const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode())
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [language, setLanguage] = useState<'zh' | 'en'>(getInitialLanguage())
  // 更新提醒状态
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false)
  const [latestVersion, setLatestVersion] = useState<string>('')
  const [releaseNotes, setReleaseNotes] = useState<string>('')
  const [downloadURL, setDownloadURL] = useState<string>('')

  useEffect(() => {
    async function init() {
      // 初始化性能系统
      await performanceSystem.initialize()
    }

    init()
  }, [])

  // 监听更新事件
  useEffect(() => {
    // 监听后端发送的更新可用事件
    const cleanupFunction = EventsOn('updateAvailable', (result: any) => {
      if (result.updateAvailable) {
        setLatestVersion(result.latestVersion)
        setReleaseNotes(result.releaseNotes)
        setDownloadURL(result.downloadURL)
        setShowUpdateModal(true)
      }
    })

    // 清理函数
    return () => {
      // 调用返回的清理函数来取消事件监听
      cleanupFunction()
    }
  }, [])
  

  // 切换语言
  const toggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh'
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  // 切换主题
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
  }

  const handleYearChange = (year: string) => {
    setCurrentYear(year)
    performanceSystem.switchYear(year)
  }

  // 切换侧边栏折叠状态
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <div key="dashboard" className="page-transition"><DashboardPage currentYear={currentYear} onYearChange={handleYearChange} darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></div>
      case 'dimension':
        return <DimensionPage dimensionKey="dream" currentYear={currentYear} onYearChange={handleYearChange} />
      case 'years':
        return <div key="years" className="page-transition"><YearsPage currentYear={currentYear} onYearChange={handleYearChange} darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></div>
      case 'settings':
        return <div key="settings" className="page-transition"><SettingsPage currentYear={currentYear} onYearChange={handleYearChange} darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></div>
      default:
        return <div key="dashboard" className="page-transition"><DashboardPage currentYear={currentYear} onYearChange={handleYearChange} darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></div>
    }
  }

  // 显示应用主界面
  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {/* 侧边栏 */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        darkMode={darkMode} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        language={language}
        toggleLanguage={toggleLanguage}
        translations={translations}
      />
      
      {/* 主内容容器 */}
      <div className="main-content-wrapper">
        {/* 主卡片 */}
        <div className="content-card">
          {/* 业务内容 - 直接渲染页面，不使用main-content包装 */}
          {renderCurrentPage()}
        </div>
      </div>

      {/* 更新提醒模态框 */}
      <UpdateModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        latestVersion={latestVersion}
        releaseNotes={releaseNotes}
        downloadURL={downloadURL}
      />
    </div>
  )
}

export default App

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/hashicorp/go-version"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// 当前应用版本号
const currentVersion = "v0.1.0"

// GitHubRelease 结构体用于解析GitHub Releases API返回的JSON数据
type GitHubRelease struct {
	TagName string `json:"tag_name"` // 版本标签
	Body    string `json:"body"`     // 发布说明
	HTMLURL string `json:"html_url"` // 发布页面URL
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 初始化数据库
	if err := InitDatabase(); err != nil {
		log.Printf("数据库初始化失败: %v", err)
		fmt.Printf("数据库初始化失败: %v\n", err)
	}

	// 启动时自动检查更新
	go func() {
		result, err := a.CheckUpdate()
		if err != nil {
			log.Printf("自动检查更新失败: %v", err)
			return
		}

		// 如果有更新可用，向前端发送事件通知
		if result.UpdateAvailable {
			runtime.EventsEmit(ctx, "updateAvailable", result)
		}
	}()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetAllAnnualData 获取所有年度数据
func (a *App) GetAllAnnualData() (SystemData, error) {
	return GetAllAnnualData()
}

// GetAnnualData 获取特定年度的数据
func (a *App) GetAnnualData(year string) (*AnnualData, error) {
	return GetAnnualData(year)
}

// SaveAnnualData 保存年度数据
func (a *App) SaveAnnualData(data AnnualData) error {
	return SaveAnnualData(data)
}

// DeleteAnnualData 删除年度数据
func (a *App) DeleteAnnualData(year string) error {
	return DeleteAnnualData(year)
}

// AddTask 添加任务
func (a *App) AddTask(task Task) error {
	return AddTask(task)
}

// UpdateTask 更新任务
func (a *App) UpdateTask(task Task) error {
	return UpdateTask(task)
}

// DeleteTask 删除任务
func (a *App) DeleteTask(taskID string) error {
	return DeleteTask(taskID)
}

// ResetAllData 重置所有数据
func (a *App) ResetAllData() error {
	return ResetAllData()
}

// ImportData 导入数据
func (a *App) ImportData(data SystemData) error {
	return ImportData(data)
}

// GetAccounts 获取所有账号
func (a *App) GetAccounts() ([]Account, error) {
	return GetAccounts()
}

// SaveAccount 保存/更新账号
func (a *App) SaveAccount(account Account) error {
	return SaveAccount(account)
}

// SwitchAccount 切换当前活跃账号
func (a *App) SwitchAccount(accountID string) error {
	return SwitchAccount(accountID)
}

// GetLastUsedAccount 获取最后使用的账号
func (a *App) GetLastUsedAccount() (*Account, error) {
	return GetLastUsedAccount()
}

// NewAccount 创建新账号
func (a *App) NewAccount(username, avatarPath string) (Account, error) {
	return NewAccount(username, avatarPath)
}

// GetAvatarAbsolutePath 获取头像的绝对路径
func (a *App) GetAvatarAbsolutePath(relativePath string) (string, error) {
	return GetAvatarAbsolutePath(relativePath)
}

// CheckUpdateResult 定义更新检查结果的结构体
type CheckUpdateResult struct {
	UpdateAvailable bool   `json:"updateAvailable"` // 是否有更新可用
	CurrentVersion  string `json:"currentVersion"`  // 当前版本
	LatestVersion   string `json:"latestVersion"`   // 最新版本
	ReleaseNotes    string `json:"releaseNotes"`    // 发布说明
	DownloadURL     string `json:"downloadURL"`     // 下载URL
}

// CheckUpdate 检查是否有新版本可用
func (a *App) CheckUpdate() (*CheckUpdateResult, error) {
	// 创建带超时的HTTP客户端
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// 发送请求到GitHub Releases API
	resp, err := client.Get("https://api.github.com/repos/PotatoZhou/Manifest/releases/latest")
	if err != nil {
		log.Printf("检查更新失败: %v", err)
		return &CheckUpdateResult{UpdateAvailable: false}, nil
	}
	defer resp.Body.Close()

	// 读取响应体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("读取更新响应失败: %v", err)
		return &CheckUpdateResult{UpdateAvailable: false}, nil
	}

	// 解析JSON响应
	var release GitHubRelease
	if err := json.Unmarshal(body, &release); err != nil {
		log.Printf("解析更新响应失败: %v", err)
		return &CheckUpdateResult{UpdateAvailable: false}, nil
	}

	// 解析当前版本
	current, err := version.NewVersion(currentVersion)
	if err != nil {
		log.Printf("解析当前版本失败: %v", err)
		return &CheckUpdateResult{UpdateAvailable: false}, nil
	}

	// 解析最新版本
	latest, err := version.NewVersion(release.TagName)
	if err != nil {
		log.Printf("解析最新版本失败: %v", err)
		return &CheckUpdateResult{UpdateAvailable: false}, nil
	}

	// 比较版本
	if latest.GreaterThan(current) {
		// 有新版本可用
		return &CheckUpdateResult{
			UpdateAvailable: true,
			CurrentVersion:  currentVersion,
			LatestVersion:   release.TagName,
			ReleaseNotes:    release.Body,
			DownloadURL:     release.HTMLURL,
		}, nil
	}

	// 没有新版本
	return &CheckUpdateResult{UpdateAvailable: false}, nil
}

// OpenDownloadURL 打开下载链接
func (a *App) OpenDownloadURL(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

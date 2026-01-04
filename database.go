package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var db *sql.DB

// InitDatabase 初始化数据库连接并创建表结构
func InitDatabase() error {
	// 获取用户配置目录
	configDir, err := os.UserConfigDir()
	if err != nil {
		return fmt.Errorf("获取用户配置目录失败: %w", err)
	}

	// 创建应用配置目录
	appConfigDir := filepath.Join(configDir, "PerformanceWails")
	if err := os.MkdirAll(appConfigDir, 0755); err != nil {
		return fmt.Errorf("创建应用配置目录失败: %w", err)
	}

	// 数据库文件路径
	dbPath := filepath.Join(appConfigDir, "performance.db")

	// 连接数据库
	db, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("打开数据库失败: %w", err)
	}

	// 测试连接
	if err = db.Ping(); err != nil {
		return fmt.Errorf("数据库连接失败: %w", err)
	}

	// 创建表结构
	if err = createTables(); err != nil {
		return fmt.Errorf("创建表结构失败: %w", err)
	}

	return nil
}

// createTables 创建所有必要的表
func createTables() error {
	// 创建年度数据表
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS annual_data (
			year TEXT PRIMARY KEY,
			total_score REAL,
			settings TEXT
		)
	`)
	if err != nil {
		return fmt.Errorf("创建年度数据表失败: %w", err)
	}

	// 创建维度配置表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS dimension_configs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			year TEXT,
			key TEXT,
			title TEXT,
			icon TEXT,
			color TEXT,
			is_default INTEGER,
			FOREIGN KEY (year) REFERENCES annual_data(year),
			UNIQUE(year, key)
		)
	`)
	if err != nil {
		return fmt.Errorf("创建维度配置表失败: %w", err)
	}

	// 创建维度数据表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS dimension_data (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			year TEXT,
			dimension_key TEXT,
			annual_goal TEXT,
			total_score REAL,
			completed_tasks INTEGER,
			total_tasks INTEGER,
			progress INTEGER,
			settings TEXT,
			FOREIGN KEY (year) REFERENCES annual_data(year),
			UNIQUE(year, dimension_key)
		)
	`)
	if err != nil {
		return fmt.Errorf("创建维度数据表失败: %w", err)
	}

	// 创建季度目标表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS quarterly_goals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			year TEXT,
			dimension_key TEXT,
			quarter INTEGER,
			goal TEXT,
			FOREIGN KEY (year) REFERENCES annual_data(year),
			UNIQUE(year, dimension_key, quarter)
		)
	`)
	if err != nil {
		return fmt.Errorf("创建季度目标表失败: %w", err)
	}

	// 创建月度任务表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS monthly_tasks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			year TEXT,
			dimension_key TEXT,
			month INTEGER,
			task_id TEXT,
			FOREIGN KEY (year) REFERENCES annual_data(year),
			UNIQUE(year, dimension_key, month, task_id)
		)
	`)
	if err != nil {
		return fmt.Errorf("创建月度任务表失败: %w", err)
	}

	// 创建任务表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			title TEXT,
			description TEXT,
			status TEXT,
			score REAL,
			priority TEXT,
			start_date TEXT,
			end_date TEXT
		)
	`)
	if err != nil {
		return fmt.Errorf("创建任务表失败: %w", err)
	}

	// 创建账号表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS accounts (
			id TEXT PRIMARY KEY,
			username TEXT,
			avatar_path TEXT
		)
	`)
	if err != nil {
		return fmt.Errorf("创建账号表失败: %w", err)
	}

	// 创建配置表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS config (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			last_used_id TEXT
		)
	`)
	if err != nil {
		return fmt.Errorf("创建配置表失败: %w", err)
	}

	return nil
}

// CloseDatabase 关闭数据库连接
func CloseDatabase() error {
	if db != nil {
		return db.Close()
	}
	return nil
}

// GetAllAnnualData 获取所有年度数据
func GetAllAnnualData() (SystemData, error) {
	rows, err := db.Query(`SELECT year, total_score, settings FROM annual_data`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	systemData := make(SystemData)

	for rows.Next() {
		var year string
		var totalScore float64
		var settingsJSON string

		if err := rows.Scan(&year, &totalScore, &settingsJSON); err != nil {
			return nil, err
		}

		var settings AnnualSettings
		if err := json.Unmarshal([]byte(settingsJSON), &settings); err != nil {
			return nil, err
		}

		// 获取维度配置
		dimensionConfigs, err := getDimensionConfigs(year)
		if err != nil {
			return nil, err
		}

		// 获取维度数据
		dimensions, err := getDimensions(year)
		if err != nil {
			return nil, err
		}

		systemData[year] = AnnualData{
			Year:             year,
			TotalScore:       totalScore,
			Settings:         settings,
			DimensionConfigs: dimensionConfigs,
			Dimensions:       dimensions,
		}
	}

	return systemData, nil
}

// GetAnnualData 获取特定年度的数据
func GetAnnualData(year string) (*AnnualData, error) {
	row := db.QueryRow(`SELECT total_score, settings FROM annual_data WHERE year = ?`, year)

	var totalScore float64
	var settingsJSON string

	if err := row.Scan(&totalScore, &settingsJSON); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	var settings AnnualSettings
	if err := json.Unmarshal([]byte(settingsJSON), &settings); err != nil {
		return nil, err
	}

	// 获取维度配置
	dimensionConfigs, err := getDimensionConfigs(year)
	if err != nil {
		return nil, err
	}

	// 获取维度数据
	dimensions, err := getDimensions(year)
	if err != nil {
		return nil, err
	}

	return &AnnualData{
		Year:             year,
		TotalScore:       totalScore,
		Settings:         settings,
		DimensionConfigs: dimensionConfigs,
		Dimensions:       dimensions,
	}, nil
}

// SaveAnnualData 保存年度数据
func SaveAnnualData(data AnnualData) error {
	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 保存年度基本信息
	settingsJSON, err := json.Marshal(data.Settings)
	if err != nil {
		return err
	}

	_, err = tx.Exec(
		`INSERT OR REPLACE INTO annual_data (year, total_score, settings) VALUES (?, ?, ?)`,
		data.Year, data.TotalScore, string(settingsJSON),
	)
	if err != nil {
		return err
	}

	// 保存维度配置
	for _, config := range data.DimensionConfigs {
		_, err = tx.Exec(
			`INSERT OR REPLACE INTO dimension_configs (year, key, title, icon, color, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
			data.Year, config.Key, config.Title, config.Icon, config.Color, config.IsDefault,
		)
		if err != nil {
			return err
		}
	}

	// 保存维度数据
	for key, dimData := range data.Dimensions {
		if err := saveDimensionData(tx, data.Year, key, dimData); err != nil {
			return err
		}
	}

	return nil
}

// DeleteAnnualData 删除年度数据
func DeleteAnnualData(year string) error {
	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 删除相关的月度任务
	_, err = tx.Exec(`DELETE FROM monthly_tasks WHERE year = ?`, year)
	if err != nil {
		return err
	}

	// 删除相关的季度目标
	_, err = tx.Exec(`DELETE FROM quarterly_goals WHERE year = ?`, year)
	if err != nil {
		return err
	}

	// 删除相关的维度数据
	_, err = tx.Exec(`DELETE FROM dimension_data WHERE year = ?`, year)
	if err != nil {
		return err
	}

	// 删除相关的维度配置
	_, err = tx.Exec(`DELETE FROM dimension_configs WHERE year = ?`, year)
	if err != nil {
		return err
	}

	// 删除年度数据
	_, err = tx.Exec(`DELETE FROM annual_data WHERE year = ?`, year)
	if err != nil {
		return err
	}

	return nil
}

// 辅助函数：获取维度配置
func getDimensionConfigs(year string) ([]DimensionConfig, error) {
	rows, err := db.Query(`SELECT key, title, icon, color, is_default FROM dimension_configs WHERE year = ?`, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	configs := []DimensionConfig{}

	for rows.Next() {
		var config DimensionConfig
		var isDefault int

		if err := rows.Scan(&config.Key, &config.Title, &config.Icon, &config.Color, &isDefault); err != nil {
			return nil, err
		}

		config.IsDefault = isDefault == 1
		configs = append(configs, config)
	}

	return configs, nil
}

// 辅助函数：获取所有维度数据
func getDimensions(year string) (map[string]DimensionData, error) {
	rows, err := db.Query(`SELECT dimension_key, annual_goal, total_score, completed_tasks, total_tasks, progress, settings FROM dimension_data WHERE year = ?`, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	dimensions := make(map[string]DimensionData)

	for rows.Next() {
		var dimensionKey string
		var annualGoal string
		var totalScore float64
		var completedTasks int
		var totalTasks int
		var progress int
		var settingsJSON string

		if err := rows.Scan(&dimensionKey, &annualGoal, &totalScore, &completedTasks, &totalTasks, &progress, &settingsJSON); err != nil {
			return nil, err
		}

		var settings DimensionSettings
		if err := json.Unmarshal([]byte(settingsJSON), &settings); err != nil {
			return nil, err
		}

		// 获取季度目标
		quarterlyGoals, err := getQuarterlyGoals(year, dimensionKey)
		if err != nil {
			return nil, err
		}

		// 获取月度任务
		monthlyTasks, err := getMonthlyTasks(year, dimensionKey)
		if err != nil {
			return nil, err
		}

		dimensions[dimensionKey] = DimensionData{
			AnnualGoal:     annualGoal,
			QuarterlyGoals: quarterlyGoals,
			MonthlyTasks:   monthlyTasks,
			TotalScore:     totalScore,
			CompletedTasks: completedTasks,
			TotalTasks:     totalTasks,
			Progress:       progress,
			Settings:       settings,
		}
	}

	return dimensions, nil
}

// 辅助函数：获取季度目标
func getQuarterlyGoals(year, dimensionKey string) ([]string, error) {
	rows, err := db.Query(`SELECT quarter, goal FROM quarterly_goals WHERE year = ? AND dimension_key = ? ORDER BY quarter`, year, dimensionKey)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// 初始化4个季度的目标
	goals := make([]string, 4)

	for rows.Next() {
		var quarter int
		var goal string

		if err := rows.Scan(&quarter, &goal); err != nil {
			return nil, err
		}

		if quarter >= 0 && quarter < 4 {
			goals[quarter] = goal
		}
	}

	return goals, nil
}

// 辅助函数：获取月度任务
func getMonthlyTasks(year, dimensionKey string) ([][]Task, error) {
	// 初始化12个月的任务列表
	monthlyTasks := make([][]Task, 12)

	// 查询月度任务关联
	rows, err := db.Query(`SELECT month, task_id FROM monthly_tasks WHERE year = ? AND dimension_key = ? ORDER BY month`, year, dimensionKey)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// 收集所有任务ID
	taskIDs := []string{}
	monthTaskMap := make(map[int][]string)

	for rows.Next() {
		var month int
		var taskID string

		if err := rows.Scan(&month, &taskID); err != nil {
			return nil, err
		}

		if month >= 0 && month < 12 {
			taskIDs = append(taskIDs, taskID)
			monthTaskMap[month] = append(monthTaskMap[month], taskID)
		}
	}

	// 如果没有任务，直接返回空列表
	if len(taskIDs) == 0 {
		return monthlyTasks, nil
	}

	// 查询所有相关任务
	taskMap, err := getTasksByIDs(taskIDs)
	if err != nil {
		return nil, err
	}

	// 组织月度任务
	for month, ids := range monthTaskMap {
		for _, id := range ids {
			if task, ok := taskMap[id]; ok {
				monthlyTasks[month] = append(monthlyTasks[month], task)
			}
		}
	}

	return monthlyTasks, nil
}

// 辅助函数：根据ID获取多个任务
func getTasksByIDs(ids []string) (map[string]Task, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	// 构建查询语句
	query := `SELECT id, title, description, status, score, priority, start_date, end_date FROM tasks WHERE id IN (`
	args := []interface{}{}
	for i, id := range ids {
		if i > 0 {
			query += `, `
		}
		query += `?`
		args = append(args, id)
	}
	query += `)`

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	taskMap := make(map[string]Task)

	for rows.Next() {
		var task Task
		var startDate sql.NullString
		var endDate sql.NullString

		if err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.Status, &task.Score, &task.Priority, &startDate, &endDate); err != nil {
			return nil, err
		}

		if startDate.Valid {
			task.StartDate = &startDate.String
		}
		if endDate.Valid {
			task.EndDate = &endDate.String
		}

		taskMap[task.ID] = task
	}

	return taskMap, nil
}

// 辅助函数：保存维度数据
func saveDimensionData(tx *sql.Tx, year, dimensionKey string, dimData DimensionData) error {
	// 保存维度基本信息
	settingsJSON, err := json.Marshal(dimData.Settings)
	if err != nil {
		return err
	}

	_, err = tx.Exec(
		`INSERT OR REPLACE INTO dimension_data (year, dimension_key, annual_goal, total_score, completed_tasks, total_tasks, progress, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		year, dimensionKey, dimData.AnnualGoal, dimData.TotalScore, dimData.CompletedTasks, dimData.TotalTasks, dimData.Progress, string(settingsJSON),
	)
	if err != nil {
		return err
	}

	// 保存季度目标
	for quarter, goal := range dimData.QuarterlyGoals {
		_, err = tx.Exec(
			`INSERT OR REPLACE INTO quarterly_goals (year, dimension_key, quarter, goal) VALUES (?, ?, ?, ?)`,
			year, dimensionKey, quarter, goal,
		)
		if err != nil {
			return err
		}
	}

	// 删除现有的月度任务关联
	_, err = tx.Exec(
		`DELETE FROM monthly_tasks WHERE year = ? AND dimension_key = ?`,
		year, dimensionKey,
	)
	if err != nil {
		return err
	}

	// 保存月度任务
	for month, tasks := range dimData.MonthlyTasks {
		for _, task := range tasks {
			// 保存任务
			var startDate, endDate sql.NullString
			if task.StartDate != nil {
				startDate = sql.NullString{String: *task.StartDate, Valid: true}
			}
			if task.EndDate != nil {
				endDate = sql.NullString{String: *task.EndDate, Valid: true}
			}

			_, err = tx.Exec(
				`INSERT OR REPLACE INTO tasks (id, title, description, status, score, priority, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				task.ID, task.Title, task.Description, task.Status, task.Score, task.Priority, startDate, endDate,
			)
			if err != nil {
				return err
			}

			// 保存月度任务关联
			_, err = tx.Exec(
				`INSERT OR REPLACE INTO monthly_tasks (year, dimension_key, month, task_id) VALUES (?, ?, ?, ?)`,
				year, dimensionKey, month, task.ID,
			)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// AddTask 添加任务
func AddTask(task Task) error {
	var startDate, endDate sql.NullString
	if task.StartDate != nil {
		startDate = sql.NullString{String: *task.StartDate, Valid: true}
	}
	if task.EndDate != nil {
		endDate = sql.NullString{String: *task.EndDate, Valid: true}
	}

	_, err := db.Exec(
		`INSERT OR REPLACE INTO tasks (id, title, description, status, score, priority, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		task.ID, task.Title, task.Description, task.Status, task.Score, task.Priority, startDate, endDate,
	)
	return err
}

// UpdateTask 更新任务
func UpdateTask(task Task) error {
	return AddTask(task) // 复用AddTask，因为它使用了INSERT OR REPLACE
}

// DeleteTask 删除任务
func DeleteTask(taskID string) error {
	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 删除任务关联
	_, err = tx.Exec(`DELETE FROM monthly_tasks WHERE task_id = ?`, taskID)
	if err != nil {
		return err
	}

	// 删除任务
	_, err = tx.Exec(`DELETE FROM tasks WHERE id = ?`, taskID)
	if err != nil {
		return err
	}

	return nil
}

// ResetAllData 重置所有数据
func ResetAllData() error {
	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 删除所有表中的数据
	_, err = tx.Exec(`DELETE FROM tasks`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM monthly_tasks`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM quarterly_goals`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM dimension_data`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM dimension_configs`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM annual_data`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM accounts`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM config`)
	if err != nil {
		return err
	}

	return nil
}

// ImportData 导入数据
func ImportData(data SystemData) error {
	// 开始事务
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// 首先清空所有数据
	if err = resetAllData(tx); err != nil {
		return err
	}

	// 导入年度数据
	for year, annualData := range data {
		// 保存年度基本信息
		settingsJSON, err := json.Marshal(annualData.Settings)
		if err != nil {
			return err
		}

		_, err = tx.Exec(
			`INSERT INTO annual_data (year, total_score, settings) VALUES (?, ?, ?)`,
			year, annualData.TotalScore, string(settingsJSON),
		)
		if err != nil {
			return err
		}

		// 保存维度配置
		for _, dimConfig := range annualData.DimensionConfigs {
			_, err = tx.Exec(
				`INSERT INTO dimension_configs (year, dimension_key, title, icon, color, is_default) VALUES (?, ?, ?, ?, ?, ?)`,
				year, dimConfig.Key, dimConfig.Title, dimConfig.Icon, dimConfig.Color, dimConfig.IsDefault,
			)
			if err != nil {
				return err
			}
		}

		// 保存维度数据
		for dimKey, dimData := range annualData.Dimensions {
			if err = saveDimensionData(tx, year, dimKey, dimData); err != nil {
				return err
			}
		}
	}

	return nil
}

// 辅助函数：重置所有数据（使用事务）
func resetAllData(tx *sql.Tx) error {
	// 删除所有表中的数据
	_, err := tx.Exec(`DELETE FROM tasks`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM monthly_tasks`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM quarterly_goals`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM dimension_data`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM dimension_configs`)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM annual_data`)
	if err != nil {
		return err
	}

	return nil
}

// 账号相关数据库操作已在 config.go 中实现，这里只保留表结构定义

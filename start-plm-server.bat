@echo off
echo ========================================
echo    PLM全息投影系统启动脚本
echo ========================================
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

:: 检查npm是否可用
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] npm不可用，请检查Node.js安装
    pause
    exit /b 1
)

echo [信息] Node.js环境检查通过
echo.

:: 检查package.json是否存在
if not exist "package.json" (
    echo [错误] 未找到package.json文件
    echo [提示] 请确保在PLM系统根目录下运行此脚本
    pause
    exit /b 1
)

:: 检查node_modules是否存在，如果不存在则安装依赖
if not exist "node_modules" (
    echo [信息] 未检测到node_modules，开始安装依赖...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
    echo.
) else (
    echo [信息] 依赖已存在，跳过安装
    echo.
)

:: 显示系统信息
echo ========================================
echo    PLM全息投影系统信息
echo ========================================
echo 系统名称: PLM产品生命周期管理系统
echo 系统版本: v1.0.0
echo 端口号码: 3003
echo 访问地址: http://localhost:3003
echo 全息特效: 已启用
echo ========================================
echo.

:: 启动开发服务器
echo [启动] 正在启动PLM全息投影系统...
echo [提示] 系统启动后将自动打开浏览器
echo [提示] 按 Ctrl+C 可停止服务器
echo.

:: 启动Vite开发服务器
npm run dev

:: 如果启动失败，显示错误信息
if %errorlevel% neq 0 (
    echo.
    echo [错误] PLM系统启动失败
    echo [建议] 请检查以下问题：
    echo   1. 端口3003是否被占用
    echo   2. 依赖是否正确安装
    echo   3. 配置文件是否正确
    echo.
    pause
    exit /b 1
)

pause

@echo OFF
SETLOCAL enabledelayedexpansion

rem #
rem # フォルダ内のTSファイルを順次 app.js で処理するバッチ
rem #

set BASE_PATH=%~dp0

rem # 引数から各フォルダを変数にとる
set TS_FOLDER=%~1

if "%TS_FOLDER%"=="" (
	echo TSフォルダを指定してください
	exit
) else (
	set TS_FOLDER=%~1
)

if not exist %TS_FOLDER% (
	echo TSフォルダが存在しません
	exit
)

rem # 指定フォルダに移動
pushd %TS_FOLDER%

echo 以下のTSファイルが見つかりました
for /f "usebackq delims=" %%m in (`dir /b *.ts`) do (
	echo "%%~nxm"
)

for /f "usebackq delims=" %%m in (`dir /b *.ts`) do (
	rem # TSファイルのフルパス
	set TS_FULLPATH="%TS_FOLDER:"=%\%%~nxm"

	rem # エンコード開始
    rem # nodeが見つからない場合は node の部分をnode.exeのフルパスに置き換えてください
	call "node" "%BASE_PATH%\app.js" !TS_FULLPATH!
)

echo End Batch

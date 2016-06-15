@echo OFF
SETLOCAL enabledelayedexpansion

rem #
rem # EpgDataCap_Bonの録画後バッチ専用
rem #

rem # 変数セット
set BASE_PATH=%~dp0
set FILE_PATH=$FilePath$
set SCRAMBLES=$Scrambles$

echo "%FILE_PATH%"の録画後処理を開始します

if not exist "%FILE_PATH%" (
	echo TSが存在しません
	exit
)

rem # nodeが見つからない場合は node の部分をnode.exeのフルパスに置き換えてください
start /wait /NORMAL /min "" "node" "%BASE_PATH%\app.js" "%FILE_PATH%" %SCRAMBLES%

echo "%FILE_PATH%"の録画後処理を終了しました

exit

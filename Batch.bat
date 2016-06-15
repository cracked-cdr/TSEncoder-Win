@echo OFF
SETLOCAL enabledelayedexpansion

rem #
rem # �t�H���_����TS�t�@�C�������� app.js �ŏ�������o�b�`
rem #

set BASE_PATH=%~dp0

rem # ��������e�t�H���_��ϐ��ɂƂ�
set TS_FOLDER=%~1

if "%TS_FOLDER%"=="" (
	echo TS�t�H���_���w�肵�Ă�������
	exit
) else (
	set TS_FOLDER=%~1
)

if not exist %TS_FOLDER% (
	echo TS�t�H���_�����݂��܂���
	exit
)

rem # �w��t�H���_�Ɉړ�
pushd %TS_FOLDER%

echo �ȉ���TS�t�@�C����������܂���
for /f "usebackq delims=" %%m in (`dir /b *.ts`) do (
	echo "%%~nxm"
)

for /f "usebackq delims=" %%m in (`dir /b *.ts`) do (
	rem # TS�t�@�C���̃t���p�X
	set TS_FULLPATH="%TS_FOLDER:"=%\%%~nxm"

	rem # �G���R�[�h�J�n
    rem # node��������Ȃ��ꍇ�� node �̕�����node.exe�̃t���p�X�ɒu�������Ă�������
	call "node" "%BASE_PATH%\app.js" !TS_FULLPATH!
)

echo End Batch

@echo OFF
SETLOCAL enabledelayedexpansion

rem #
rem # EpgDataCap_Bon�̘^���o�b�`��p
rem #

rem # �ϐ��Z�b�g
set BASE_PATH=%~dp0
set FILE_PATH=$FilePath$
set SCRAMBLES=$Scrambles$
set SERVICE_NAME=$ServiceNameNEW$
set TS_ID=$TSID10$

echo "%FILE_PATH%"�̘^��㏈�����J�n���܂�

if not exist "%FILE_PATH%" (
	echo TS�����݂��܂���
	exit
)

rem # node��������Ȃ��ꍇ�� node �̕�����node.exe�̃t���p�X�ɒu�������Ă�������
start /wait /NORMAL /min "" "node" "%BASE_PATH%\app.js" "%FILE_PATH%" %SCRAMBLES% %SERVICE_NAME% %TS_ID%

echo "%FILE_PATH%"�̘^��㏈�����I�����܂���

exit

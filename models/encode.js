/**
 * encode.js
 * エンコード実行ロジック
 * 
 * Created by cracked-cdr
 */

var fs             = require('fs');
var path           = require('path');
var pathinfo       = require('pathinfo');
var iconv          = require('iconv-lite');
var child_process  = require('child_process');
var avisynth       = require('./avisynth');
var encode_setting = require('../config/encode-setting');
var exe_path       = require('../config/exe-path');
var config         = require('../config/config');
var logger         = require('log4js').getLogger();

// エンコードを実行
module.exports.encodeTS = function(filePath, serviceName, encConf) {
    logger.info('エンコードを開始します');

    var fileName = pathinfo(filePath).basename;
    if (!encConf) {
        encConf = encode_setting.createEncodeSettings(filePath, fileName, serviceName);
    }
    logger.info(encConf);
    
    try {
        fs.mkdirSync(config.MP4_FOLDER);
    } catch (err) {
        if (err.errno != -4075) {
            logger.error('MP4出力フォルダの作成に失敗しました: ' + err);
            return;
        }
    }

    var mp4Path = path.join(config.MP4_FOLDER, fileName + '.mp4');

    switch (config.ENCODE_APPLICATION) {
        case 1:
            return encodeByQSVEnc(filePath, mp4Path, encConf);
        case 2:
            return encodeByHandbrake(filePath, mp4Path, encConf);
    }
};

// QSVEnc(+Avisynth)によるエンコード処理
function encodeByQSVEnc(filePath, mp4Path, encConf) {
    var execStr = '';
    if (config.QSVENC_USE_AVS) {
        var avsPath = avisynth.generateAVS(filePath, encConf.start_cut_sec);
        execStr += `"${exe_path.AVS2PIPEMOD_PATH}" ${encConf.avs_options} "${avsPath}" | "${exe_path.QSVENC_PATH}" -i - `;

    } else {
        execStr += `"${exe_path.QSVENC_PATH}" -i "${filePath}" `;
        if (parseFloat(encConf.start_cut_sec) != 0.0) {
            execStr += `--seek ${encConf.start_cut_sec} `;
        }
    }
    execStr += `-o "${mp4Path}" ${encConf.qsvenc_options} `;

    logger.debug(execStr);

    var tmpBat = path.join(pathinfo(process.argv[1]).dirname, 'tmp.bat');
    try {
        fs.writeFileSync(tmpBat, iconv.encode(execStr + '\nexit', 'shift_jis'));
    } catch (err) {
        tmpBat = null
    }

    if (tmpBat) {
        child_process.execSync(`start /wait /min ${config.QSVENC_PRIORITY} "" "${tmpBat}"`);
        fs.unlinkSync(tmpBat);
    } else {
        child_process.execSync(execStr);
    }

    return mp4Path;
}

// Handbrakeによるエンコード処理
function encodeByHandbrake(filePath, mp4Path, encConf) {
    var execStr = `"${exe_path.HANDBRAKE_PATH}" -i "${filePath}" -o "${mp4Path}" ${encConf.handbrake_options} `;
    if (parseFloat(encConf.start_cut_sec) != 0.0) {
        execStr += `--start-at duration:${encConf.start_cut_sec} `;
    }

    logger.debug(execStr);

    child_process.execSync('start /wait /min ' + config.HANDBRAKE_PRIORITY + ' "" ' + execStr);
    return mp4Path;
}


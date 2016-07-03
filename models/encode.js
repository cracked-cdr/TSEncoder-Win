/**
 * encode.js
 * エンコード実行ロジック
 * 
 * Created by cracked-cdr
 */

var fs             = require('fs');
var path           = require('path');
var pathinfo       = require('pathinfo');
var child_process  = require('child_process');
var encode_setting = require('../config/encode-setting');
var exe_path       = require('../config/exe-path');
var config         = require('../config/config');
var logger         = require('log4js').getLogger();

// エンコードを実行
module.exports.encodeTS = function(filePath, serviceName) {
    logger.info('エンコードを開始します');

    var fileName = pathinfo(filePath).basename;
    var encConf = encode_setting.createEncodeSettings(filePath, fileName, serviceName);
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

    var execStr = '"' + exe_path.HANDBRAKE_PATH
        + '" -i "' + filePath
        + '" -o "' + mp4Path
        + '" -4 -f mp4 ' + encConf.crop + ' ' + encConf.anamorphic
        + ' --modulus 4 ' + encConf.video_size
        + ' -e qsv_h264 ' + encConf.quality_or_rate
        + ' -a 1,2'
        + ' ' + (encConf.audio_rate ? '-E av_aac -6 stereo -B ' + encConf.audio_rate : '-E copy')
        + ' --audio-fallback fdk_aac'
        + ' --h264-level="4.2" --h264-profile=high '
        + encConf.decomb + ' ' + encConf.detelecine + ' ' + encConf.frame_rate
        + ' ' + (encConf.start_at_sec ? '--start-at duration:' + encConf.start_at_sec : '')
        + ' --qsv-async-depth=2'
        + ' --verbose=1'
        + ' ' + encConf.other_options;

    logger.debug(execStr);

    child_process.execSync('start /wait /min ' + config.HANDBRAKE_PRIORITY + ' "" ' + execStr);
    return mp4Path;
};

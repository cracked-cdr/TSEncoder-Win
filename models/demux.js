/**
 * demux.js
 * 音声のDemux関連ロジック
 *
 * Created by cracked-cdr
 */

var fs            = require('fs');
var glob          = require('glob');
var pathinfo      = require('pathinfo');
var child_process = require('child_process');
var exe_path      = require('../config/exe-path');
var config        = require('../config/config');
var logger        = require('log4js').getLogger();

// ts_parserを利用して音声を分離
module.exports.demuxTsParser = function(filePath) {
    logger.info('TSファイルから音声を分離します');

    var info = pathinfo(filePath);

    var execStr = 'start /wait /min '
        + config.TS_PARSER_PRIORITY + ' "" "' + exe_path.TS_PARSER_PATH + '" --mode da --delay-type 3 "' + filePath
        + '"';

    logger.debug(execStr);

    child_process.execSync(execStr);

    logger.info('分離した音声にDelayを適用します');

    var aacs = glob.sync(info.dirname.normalize() + '/*ms.aac');
    aacs.forEach(function(aac) {
        applyDelay(aac);
    });

    logger.info('音声分離とDelay適用が終了しました');
};

// fawcl.exeを利用してディレイを適用
function applyDelay(aacPath) {
    logger.debug('Apply delay: ' + aacPath);

    var wavPath = aacPath + '.wav';

    // AAC -> WAV
    var execStr = 'start /wait /min '
        + config.FAWCL_PRIORITY + ' "" "' + exe_path.FAWCL_PATH + '" "' + aacPath + '" "' + wavPath + '"';

    logger.debug(execStr);

    child_process.execSync(execStr);

    // WAV -> AAC
    execStr = 'start /wait /min '
        + config.FAWCL_PRIORITY + ' "" "' + exe_path.FAWCL_PATH + '" "' + wavPath + '" "' + aacPath + '"';

    logger.debug(execStr);

    child_process.execSync(execStr);

    // WAVは不要なので削除
    try {
        fs.unlinkSync(wavPath);
    } catch (err) {
        logger.error('WAVファイルの削除に失敗しました: ' + err);
    }
}
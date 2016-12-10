/**
 * demux.js
 * 音声のDemux関連ロジック
 *
 * Created by cracked-cdr
 */

var fs             = require('fs');
var glob           = require('glob');
var pathinfo       = require('pathinfo');
var child_process  = require('child_process');
var exe_path       = require('../config/exe-path');
var config         = require('../config/config');
var logger         = require('log4js').getLogger();

// ts_parserを利用して音声を分離
module.exports.demuxTsParser = function(filePath, startCutSec, tsId) {
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
        var aacName = pathinfo(aac).filename;
        var delay = null;
        var m = aacName.match(/^.*DELAY (-?[0-9]+)ms.aac$/);
        if (m && m.length > 1) {
            // 作者環境では地デジとBSでTrim時に最適なディレイ値が異なるのでTransportStreamIDで判別・適用
            var baseDelay = Math.round(parseFloat(m[1]) * 0.8); // 地デジ・BSの中庸値
            if (tsId) {
                var iTsId = parseInt(tsId);
                if (iTsId < 20000) {
                    // BS
                    baseDelay = parseInt(m[1]);

                } else if (iTsId < 30000) {
                    // CS
                    baseDelay = parseInt(m[1]);

                } else {
                    // 地デジ
                    baseDelay = Math.round(parseFloat(m[1]) * 0.5);
                }
            }
            delay = baseDelay - parseInt(parseFloat(startCutSec) * 1000);
        }
        applyDelay(aac, delay);
    });

    logger.info('音声分離とDelay適用が終了しました');

    return aacs;
};

// fawcl.exeを利用してディレイを適用
function applyDelay(aacPath, delayMs) {
    logger.debug('Apply delay ' + delayMs + 'ms: ' + aacPath );

    var wavPath = aacPath + '.wav';

    // AAC -> WAV
    var d = delayMs ? ("-d" + delayMs) : "";
    var execStr = `start /wait /min ${config.FAWCL_PRIORITY} "" "${exe_path.FAWCL_PATH}" ${d} "${aacPath}" "${wavPath}"`;

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

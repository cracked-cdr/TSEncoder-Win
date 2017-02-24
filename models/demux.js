/**
 * demux.js
 * 音声のDemux関連ロジック
 *
 * Created by cracked-cdr
 */

'use strict';

const fs             = require('fs');
const glob           = require('glob');
const pathinfo       = require('pathinfo');
const child_process  = require('child_process');
const exe_path       = require('../config/exe-path');
const config         = require('../config/config');
const logger         = require('log4js').getLogger();

// ts_parserを利用して音声を分離
module.exports.demuxTsParser = function(filePath, startCutSec) {
    logger.info('TSファイルから音声を分離します');

    let info = pathinfo(filePath);

    let execStr = 'start /wait /min '
        + config.TS_PARSER_PRIORITY + ' "" "' + exe_path.TS_PARSER_PATH + '" --mode da --delay-type 3 "' + filePath
        + '"';

    logger.debug(execStr);

    child_process.execSync(execStr);

    logger.info('分離した音声にDelayを適用します');

    let aacs = glob.sync(info.dirname.normalize() + '/*ms.aac');
    aacs.forEach(function(aac) {
        let aacName = pathinfo(aac).filename;
        let delay = null;
        let m = aacName.match(/^.*DELAY (-?[0-9]+)ms.aac$/);
        if (m && m.length > 1) {
            delay = parseInt(m[1]) - parseInt(parseFloat(startCutSec) * 1000);
        } else {
            delay = parseInt(parseFloat(startCutSec) * 1000);
        }
        applyDelay(aac, delay);
    });

    logger.info('音声分離とDelay適用が終了しました');

    return aacs;
};

// fawcl.exeを利用してディレイを適用
function applyDelay(aacPath, delayMs) {
    logger.debug('Apply delay ' + delayMs + 'ms: ' + aacPath );

    let wavPath = aacPath + '.wav';

    // AAC -> WAV
    let d = delayMs ? ("-d" + delayMs) : "";
    let execStr = `start /wait /min ${config.FAWCL_PRIORITY} "" "${exe_path.FAWCL_PATH}" ${d} "${aacPath}" "${wavPath}"`;

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

/**
 * mux.js
 * 音声のMux関連ロジック
 *
 * Created by cracked-cdr
 */

'use strict';

const fs            = require('fs');
const child_process = require('child_process');
const exe_path      = require('../config/exe-path');
const config        = require('../config/config');
const logger        = require('log4js').getLogger();

// MP4Boxを使用して音声のMuxを行う
module.exports.muxForMp4 = function(demuxPaths, mp4Path) {
    logger.info('音声のMuxを行います');

    let addAac = '';
    demuxPaths.forEach(function(aac) {
        addAac += `-add "${aac}" `;
    });

    let execStr = `"${exe_path.MP4BOX_PATH}" "${mp4Path}" -tmp "${config.MP4_FOLDER}" ${addAac}`;
    logger.debug(execStr);
    child_process.execSync(`start /wait /min ${config.MP4BOX_PRIORITY} "" ${execStr}`);

    try {
        demuxPaths.forEach(function(aac) {
            fs.unlinkSync(aac);
        });
    } catch (err) {
        logger.error('AACファイルの削除に失敗しました: ' + err);
    }

    logger.info('音声のMuxを完了しました');
};

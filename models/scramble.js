/**
 * scramble.js
 * スクランブル解除実行ロジック
 * 
 * Created by cracked-cdr
 */

'use strict';

const path          = require('path');
const child_process = require('child_process');
const pathinfo      = require('pathinfo');
const exe_path      = require('../config/exe-path');
const config        = require('../config/config');
const logger        = require('log4js').getLogger();

// スクランブル解除
module.exports.decode = function(filePath) {
    logger.info('スクランブル解除を行います');

    let execStr = 'start /wait /min '
        + config.MULTI2DEC_PRIORITY + ' "" "' + exe_path.MULTI2DEC_PATH + '" /D "' + filePath
        + '"';
    
    logger.debug(execStr);
    
    child_process.execSync(execStr);

    let info = pathinfo(filePath);
    let decPath = path.join(info.dirname, info.basename + '_dec.ts');
    return decPath;
};

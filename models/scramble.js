/**
 * scramble.js
 * スクランブル解除実行ロジック
 * 
 * Created by cracked-cdr
 */

var path          = require('path');
var child_process = require('child_process');
var pathinfo      = require('pathinfo');
var exe_path      = require('../config/exe-path');
var config        = require('../config/config');
var logger        = require('log4js').getLogger();

// スクランブル解除
module.exports.decode = function(filePath) {
    logger.info('スクランブル解除を行います');

    var execStr = 'start /wait /min '
        + config.MULTI2DEC_PRIORITY + ' "" "' + exe_path.MULTI2DEC_PATH + '" /D "' + filePath
        + '"';
    
    logger.debug(execStr);
    
    child_process.execSync(execStr);

    var info = pathinfo(filePath);
    var decPath = path.join(info.dirname, info.basename + '_dec.ts');
    return decPath;
};

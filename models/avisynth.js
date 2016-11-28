/**
 * avisynth.js
 * Avisynth関連ロジック
 *
 * Created by cracked-cdr
 */

var fs       = require('fs');
var exe_path = require('../config/exe-path');
var config   = require('../config/config');
var logger   = require('log4js').getLogger();

// AVSファイルを作成する。戻り値はAVSファイルのパス
module.exports.generateAVS = function(filePath) {

    // AVSテキスト
    var avs = `# 処理開始
source = "${filePath}"
LoadPlugin("${exe_path.IT_DLL_PATH}")
LoadPlugin("${exe_path.LSMASH_DLL_PATH}")

video = LWLibavVideoSource(source, dr=true, repeat=true, dominance=1).AssumeFPS(30000, 1001)
video = (video.height == 738)  ? video.Crop(0, 0, 0 , -18) : video
video = (video.height == 1088) ? video.Crop(0, 0, 0 , -8)  : video

video = IT(video, fps=24, ref="TOP", blend=false)

return video
# 処理終了`;

    try {
        var avsPath = filePath + '.avs';
        fs.writeFileSync(avsPath, avs);
        logger.info('AVSファイルを作成しました');
        return avsPath;
    } catch (err) {
        logger.error('AVSファイルの作成に失敗しました: ' + err);
        return null;
    }
};

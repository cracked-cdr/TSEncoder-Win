/**
 * 処理本体
 * スクランブル解除 -> チャプター作成 -> エンコード -> チャプター埋め込み
 * 
 * Created by cracked-cdr
 */

var fs             = require('fs');
var path           = require('path');
var util           = require('util');
var pathinfo       = require('pathinfo');
var glob           = require('glob');
var chapter        = require('./models/chapter');
var scramble       = require('./models/scramble');
var encode         = require('./models/encode');
var config         = require('./config/config');
var encode_setting = require('./config/encode-setting');
var log4js         = require('log4js');
var logger         = log4js.getLogger();

var argv = process.argv;

// ロガー
var jsPathInfo = pathinfo(argv[1]);
logger.setLevel('INFO');
log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file',
            filename: path.join(jsPathInfo.dirname, 'logs', jsPathInfo.basename + '.log'),
            maxLogSize: 262144,   // 2MiB
            backups: 100
        }
    ]
});

if (argv.length < 3) {
    logger.error('処理対象のパスが指定されていません');
    return;
}

// TS存在チェック
var filePath = argv[2];
try {
    fs.statSync(filePath);
} catch (err) {
    if (err.errno == -4058) {
        logger.error('TSファイルが見つかりません: ' + filePath);
    } else {
        logger.fatal(err);
    }
    return;
}

var info = pathinfo(filePath);
var folderPath = info.dirname;
var fileName = info.filename;
var noExtFileName = info.basename;

var scrambles = argv[3] ? argv[3] : 0;

var serviceName = argv[4] ? argv[4] : null;

logger.info('-- 処理を開始します: ' + filePath + ', Scrambles: ' + scrambles);

// 禁止文字リネーム
var newFileName = fileName.replace('(', '（').replace(')', '）').replace('!', '！');
if (newFileName !== fileName) {
    try {
        var newFilePath = require('path').join(folderPath, newFileName);
        logger.info('replace: ' + filePath + ' -> ' + newFilePath);
        fileName = newFileName;
        filePath = newFilePath;
        noExtFileName = require('pathinfo')(newFilePath).basename;
    } catch (err) {
        logger.error('ファイル禁止文字リネームに失敗しました: ' + err);
        return;
    }
}

// スクランブル解除
if (scrambles > 0) {
    var decPath = scramble.decode(filePath);
    if (decPath) {
        // スクランブル解除後のファイルを以後は利用
        try {
            fs.unlinkSync(filePath);    // 古いファイルは削除
            fs.renameSync(decPath, filePath);
        } catch (err) {
            logger.error('スクランブル解除後のファイルリネームに失敗しました: ' + err);
            return;
        }
    }
}

// チャプター作成
var chapterPath = chapter.createChapter(filePath, config.CHAPTER_FOLDER, serviceName);

// エンコード実行
var mp4Path = null;
var tryCnt;
for (tryCnt = 0; tryCnt < config.TRY_ENCODE_MAX; tryCnt++) {

    mp4Path = encode.encodeTS(filePath);

    if (!mp4Path || fs.statSync(mp4Path).size < config.ERR_ENCODE_FILE_SIZE) {
        logger.info('エラーファイルが作成されたので再試行します');
        continue;
    }
    break;
}
if (!mp4Path || fs.statSync(mp4Path).size < config.ERR_ENCODE_FILE_SIZE) {
    logger.error(tryCnt + '回エンコードしましたが全てエラーファイルでした。処理を終了します: ' + mp4Path);
    return;
}

// チャプター埋め込み
if (chapterPath) {
    var settings = encode_setting.encSettings;
    chapter.embedChapter(mp4Path, chapterPath, settings.start_at_sec, settings.chapter_skip_sec);
}

// 処理済みフォルダに録画ファイルを移動
try {
    fs.mkdirSync(config.TS_DONE_FOLDER);
} catch (err) {
    if (err.errno != -4075) {
        logger.error('処理済みTSフォルダの作成に失敗しました: ' + err);
        return;
    }
}
try {
    var files = glob.sync(path.join(folderPath, noExtFileName + '*').replace(/\[/g, '[[]'));
    files.forEach(function (f) {
        fs.renameSync(f, path.join(config.TS_DONE_FOLDER, pathinfo(f).filename));
    });
} catch (err) {
    logger.error('処理済みファイルの移動に失敗しました: ' + err);
    return;
}

logger.info('-- 正常に処理を終了しました: ' + filePath);

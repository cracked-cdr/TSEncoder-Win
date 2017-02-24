/**
 * 処理本体
 * スクランブル解除 -> チャプター作成 -> エンコード -> チャプター埋め込み
 * 
 * Created by cracked-cdr
 */

'use strict';

const fs             = require('fs');
const path           = require('path');
const util           = require('util');
const pathinfo       = require('pathinfo');
const glob           = require('glob');
const ts_program_txt = require('./models/ts-program-txt');
const chapter        = require('./models/chapter');
const demux          = require('./models/demux');
const mux            = require('./models/mux');
const scramble       = require('./models/scramble');
const avisynth       = require('./models/avisynth');
const encode         = require('./models/encode');
const config         = require('./config/config');
const encode_setting = require('./config/encode-setting');
const log4js         = require('log4js');
const logger         = log4js.getLogger();

const argv = process.argv;

// ロガー
const jsPathInfo = pathinfo(argv[1]);
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
let filePath = argv[2];
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

let info = pathinfo(filePath);
let folderPath = info.dirname;
let fileName = info.filename;
let noExtFileName = info.basename;

let scrambles = argv[3] ? argv[3] : 0;
let serviceName = argv[4] ? argv[4] : null;

let tsProgram = ts_program_txt.parse(filePath);
if (tsProgram) {
    if (!serviceName) {
        serviceName = tsProgram.serviceName;
    }
}

logger.info('-- 処理を開始します: ' + filePath + ', Scrambles: ' + scrambles);

// 禁止文字リネーム
let newFileName = fileName.replace('(', '（').replace(')', '）').replace('!', '！');
if (newFileName !== fileName) {
    try {
        let newFilePath = require('path').join(folderPath, newFileName);
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
    let decPath = scramble.decode(filePath);
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
let chapterPath = chapter.createChapter(filePath, config.CHAPTER_FOLDER, serviceName);

// エンコードセッティング
let encodeSettings = encode_setting.createEncodeSettings(filePath, fileName, serviceName);

// エンコード実行
let mp4Path = null;
let tryCnt;
for (tryCnt = 0; tryCnt < config.TRY_ENCODE_MAX; tryCnt++) {

    mp4Path = encode.encodeTS(filePath, serviceName, encodeSettings);

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

// QSVEncC使用時のみ音声のDemux -> mp4にMux
if (config.ENCODE_APPLICATION == 1) {
    let demuxPaths = demux.demuxTsParser(filePath, encodeSettings.start_cut_sec);
    if (demuxPaths) {
        mux.muxForMp4(demuxPaths, mp4Path);
    }
}

// チャプター埋め込み
if (chapterPath) {
    chapter.embedChapter(mp4Path, chapterPath, encodeSettings.start_cut_sec, encodeSettings.chapter_skip_sec);
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
    let files = glob.sync(path.join(folderPath, noExtFileName + '*').replace(/\[/g, '[[]'));
    files.forEach(function (f) {
        fs.renameSync(f, path.join(config.TS_DONE_FOLDER, pathinfo(f).filename));
    });
} catch (err) {
    logger.error('処理済みファイルの移動に失敗しました: ' + err);
    return;
}

logger.info('-- 正常に処理を終了しました: ' + filePath);

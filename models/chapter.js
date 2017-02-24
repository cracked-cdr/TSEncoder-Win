/**
 * chapter.js
 * チャプター作成・埋め込み関連のロジック
 * 
 * Created by cracked-cdr
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const child_process = require('child_process');
const pathinfo      = require('pathinfo');
const sprintf       = require('sprintf-js').sprintf;
const exe_path      = require('../config/exe-path');
const config        = require('../config/config');
const logger        = require('log4js').getLogger();

// チャプターファイルの作成
module.exports.createChapter = function(filePath, chapterDir, serviceName) {
    logger.info('チャプターファイルを作成します');

    if (!filePath) {
        logger.error('ソースファイルのパスが空です');
        return;
    }
    if (!chapterDir) {
        logger.error('チャプター出力先のパスが空です');
        return;
    }

    let info     = pathinfo(filePath);
    let fileName = info.filename;

    let chapterFilePath = path.join(chapterDir, fileName + '.chapters.txt');

    try {
        if (fs.statSync(chapterFilePath).isFile) {
            logger.info('すでにチャプターファイルが作成されているためチャプター作成処理を中止しました');
            return chapterFilePath;
        }
    } catch (err) {
        // チャプターファイルは上書きされても問題ないので例外をスルー
    }

    try {
        fs.mkdirSync(chapterDir);
    } catch (err) {
        if (err.errno != -4075) {
            logger.error('チャプター出力フォルダの作成に失敗しました: ' + err);
            return;
        }
    }

    // ロゴデータとパラメータファイルの検索。
    // 放送局名が渡されていればによる検索を先に行い、ファイルが見つからない場合はファイル名で再度検索
    let lgdPath;
    let autoTunePath;
    if (serviceName) {
        lgdPath = findLgdPath(serviceName);
        autoTunePath = findAutoTuneParamPath(serviceName);
    }
    if (!lgdPath) {
        lgdPath = findLgdPath(fileName);
    }
    if (!autoTunePath) {
        autoTunePath = findAutoTuneParamPath(fileName);
    }

    if (!lgdPath) {
        logger.warn('ロゴファイルが見つからないためチャプター作成処理を中止しました');
        return;
    }
    if (!autoTunePath) {
        logger.warn('パラメータファイルが見つからないためチャプター作成処理を中止しました');
        return;
    }

    logger.debug('Use lgd: ' + lgdPath);
    logger.debug('Use param: ' + autoTunePath);

    let execStr = '"' + exe_path.LOGOGUILLO_PATH
                + '" -video "' + filePath
                + '" -lgd "' + lgdPath
                + '" -avs2x "' + exe_path.AVS2PIPEMOD_PATH
                + '" -avsPlg "' + exe_path.LSMASH_DLL_PATH
                + '" -prm "' + (autoTunePath ? autoTunePath : lgdPath)
                + '" -out "' + chapterFilePath
                + '" -outFmt chap -disScnChgDtc';

    logger.debug(execStr);

    child_process.execSync( 'start /wait /min ' + config.LOGOGUILLO_PRIORITY + ' "" ' + execStr);
    
    return chapterFilePath;
};

// mp4boxを利用してチャプターを埋め込む
module.exports.embedChapter = function(mp4Path, chapterPath, startAtSec, chapterSkipSec) {
    logger.info('動画にチャプターファイルを埋め込みます');

    if (!mp4Path) {
        logger.error('MP4ファイルパスが空です');
        return;
    }
    if (!chapterPath) {
        logger.error('チャプターファイルパスが空です');
        return;
    }
    
    logger.debug('mp4: ' + mp4Path);
    logger.debug('chapter: ' + chapterPath);
    logger.debug('startAtSec: ' + startAtSec);
    logger.debug('chapterSkipSec: ' + chapterSkipSec);
    
    // チャプターファイル存在チェック
    try {
        fs.statSync(chapterPath);
    } catch (err) {
        if (err.errno == -4058) {
            logger.warn('チャプターファイルが見つからないため埋め込み処理を中止しました');
        } else {
            logger.fatal(err);
        }
        return;
    }

    startAtSec     = startAtSec || 0.0;
    chapterSkipSec = chapterSkipSec || 0.0;

    // チャプターファイルを指定時間ずらす
    let slideChapterPath = timeSlide(chapterPath, startAtSec, chapterSkipSec);
    if (!fs.statSync(slideChapterPath)) {
        slideChapterPath = chapterPath;
    }

    let execStr = '"' + exe_path.MP4BOX_PATH
        + '" "' + mp4Path
        + '" -chap "' + slideChapterPath
        + '" -tmp "' + config.MP4_FOLDER + '"';

    logger.debug(execStr);

    child_process.execSync('start /wait /min ' + config.MP4BOX_PRIORITY + ' "" ' + execStr);
};

// ファイル名から放送局を探し、見つかった.lgdファイルパスを返却
function findLgdPath(searchName) {
    let bsDir  = path.join(exe_path.LOGO_PATH, 'bs');
    let dtvDir = path.join(exe_path.LOGO_PATH, 'dtv');

    logger.debug('LOGO_BS: ' + bsDir);
    logger.debug('LOGO_DTV: ' + dtvDir);

    // ファイル名の部分検索で見ているためBSを先に検索する（地デジを先に行うとBS"○○"に誤爆する）
    try {
        if (fs.statSync(bsDir)) {
            let logoPath = searchPath(bsDir, '.lgd', searchName);
            if (logoPath) {
                return path.join(bsDir, logoPath);
            }
        }
    } catch (err) {
        if (err.errno == -4058) {
            logger.warn('lgdファイル（BS）を格納したフォルダが見つかりません');
        } else {
            logger.fatal(err);
            return null;
        }
    }

    // 地デジ
    try {
        if (fs.statSync(dtvDir)) {
            let logoPath = searchPath(dtvDir, '.lgd', searchName);
            if (logoPath) {
                return path.join(dtvDir, logoPath);
            }
        }
    } catch (err) {
        if (err.errno == -4058) {
            logger.warn('lgdファイル（地デジ）を格納したフォルダが見つかりません');
        } else {
            logger.fatal(err);
            return null;
        }
    }

    return null;
}

//ファイル名から番組名を探し、対応した.lgd.autoTune.paramファイルパスを取得する
function findAutoTuneParamPath(searchName) {
    let bsDir  = path.join(exe_path.PARAM_PATH, 'bs');
    let dtvDir = path.join(exe_path.PARAM_PATH, 'dtv');

    logger.debug('PARAM_BS: ' + bsDir);
    logger.debug('PARAM_DTV: ' + dtvDir);

    // ファイル名の部分検索で見ているためBSを先に検索する（地デジを先に行うとBS"○○"に誤爆する）
    try {
        if (fs.statSync(bsDir)) {
            let logoPath = searchPath(bsDir, '.lgd.autoTune.param', searchName);
            if (logoPath) {
                return path.join(bsDir, logoPath);
            }
        }
    } catch (err) {
        if (err.errno == -4058) {
            logger.warn('lgd.autotune.paramファイル（BS）を格納したフォルダが見つかりません');
        } else {
            logger.fatal(err);
            return null;
        }
    }

    // 地デジ
    try {
        if (fs.statSync(dtvDir)) {
            let logoPath = searchPath(dtvDir, '.lgd.autoTune.param', searchName);
            if (logoPath) {
                return path.join(dtvDir, logoPath);
            }
        }
    } catch (err) {
        if (err.errno == -4058) {
            logger.warn('lgd.autotune.paramファイル（地デジ）を格納したフォルダが見つかりません');
        } else {
            logger.fatal(err);
            return null;
        }
    }

    // ファイルが見つからない場合は default.lgd.autoTune.paramを検索
    try {
        let defLogoPath = path.join(exe_path.PARAM_PATH, 'default.lgd.autoTune.param');
        if (fs.statSync(defLogoPath)) {
            return defLogoPath;
        }
    } catch (err) {
        if (err.errno != -4058) {
            logger.fatal(err);
            return null;
        }
    }

    return null;
}

// 指定ディレクトリを検索し、部分一致したファイルのパスを返す
//     dir   検索ディレクトリ
//     ext   検索ディレクトリ内の拡張子
//     fname 部分一致検索用のファイル名
function searchPath(dir, ext, fname) {
    let find = null;
    let files = fs.readdirSync(dir);
    for (let i=0; i < files.length; i++) {
        let f = files[i];
        if (fname.indexOf(f.replace(ext, '')) != -1) {
            find = f;
            break;
        }
    }
    return find;
}

// チャプターファイルのチャプタータイミングを指定秒数ずらす
function timeSlide(filePath, slideTime, skipTime, chapName) {
    if (!filePath) {
        logger.error('チャプターファイルパスが空です');
        return;
    }

    slideTime = slideTime || 0.0;
    skipTime  = skipTime || 0.0;
    chapName  = chapName || 'Chapter';

    let chapArray = fs.readFileSync(filePath, 'utf8').split('\n');
    let slidedChapters = '';
    let i = 0;
    
    chapArray.forEach(function(chap) {
        let matches = chap.match(/\d{2}:\d{2}:\d{2}.\d{3}/);
        if (matches) {
            let tmp = matches[0];

            tmp = tmp.replace(/:/g, '');

            // 時分秒を秒数の合計に直す
            let hour   = Math.floor(tmp.substr(0, 2) * 3600);
            let minute = Math.floor(tmp.substr(2, 2) * 60);
            let second = parseFloat(tmp.substr(4));
            tmp = hour + minute + second;

            // ファイルに記載された秒数 - コマンドライン引数で渡された秒数
            tmp -= slideTime;
            if (tmp < 0) { tmp = 0.0; }

            // tmpの秒数 < コマンドライン引数で渡されたスキップ基準秒数の場合はチャプター対象外とする
            // ただしもともと最初のチャプターとして定義されている行(i=0)は除く
            if (i > 0 && tmp < skipTime) {
                return;
            }

            // 秒数から時分秒に直す
            hour   = Math.floor(tmp / 3600);
            minute = Math.floor(tmp / 60);
            second = tmp % 60;
            tmp = sprintf('%02d:%02d:%06.3f', hour, minute, second);

            slidedChapters += tmp + ' ' + chapName + (++i) + '\r\n';
        }
    });

    let info = pathinfo(filePath);
    let newFilePath = path.join(info['dirname'], 'slide_' + info['filename']);
    fs.writeFileSync(newFilePath, slidedChapters, 'utf8');

    return newFilePath;
}

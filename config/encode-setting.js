/**
 * encode-setting.js
 * エンコード事前設定を行う
 * 
 * Created by cracked-cdr
 */

/*
 下の方にある関数定義でファイル名ごとのエンコード設定が行えます
*/

// テンプレート
const SIZE = {
    SOURCE  : '',   // ソースファイルに従う
    SIZE1920: '-w 1920 -l 1080',
    SIZE1440: '-w 1440 -l 1080',
    SIZE1280: '-w 1280 -l 720',
    SIZE960 : '-w 960 -l 720',
    SIZE640 : '-w 640 -l 480'
};
const AUDIO = {
    SOURCE : '',    // ソースファイル音声のコピー
    RATE128: '128',
    RATE256: '256'
};
const FRAME_RATE = {
    SOURCE: '', // ソースファイルに従う
    RATE24: '--rate 23.976',
    RATE30: '--rate 29.97',
    RATE60: '--rate 59.94'
};

// エンコード設定本体
// ここで記述されている内容をデフォルト値として、下の関数内の変更が適用されます
var encSettings = {
    quality_or_rate : '-q 24',              // エンコード画質。数値が下がるほど画質が上がる('-b 数値' にするとkbps指定)
    video_size      : SIZE.SOURCE,          // 動画のサイズ
    crop            : '--crop 0:0:0:0',     // 動画から上下左右の範囲をカット(デフォルトはカットしない)
    anamorphic      : '--loose-anamorphic', // 動画の内部アスペクト比設定(デフォルトは元動画に従う)
    audio_rate      : AUDIO.SOURCE,         // 音声のビットレート(デフォルトはソースからコピーする)
    start_at_sec    : '0.0',                // 先頭何秒をカットするか
    chapter_skip_sec: '0.0',                // エンコード後の先頭何秒間をチャプター設定しないようにするか
    frame_rate      : FRAME_RATE.SOURCE,    // 動画のフレームレート(デフォルトはソースに従う)
    detelecine      : '--detelecine="1:1:4:4:0:0:-1"',  // 逆テレシネ
    decomb          : '--decomb="7:2:6:9:80:16:16:10:20:20:4:2:50:24:1:-1"',    // Decomb(柔軟なインターレース除去)
    other_options   : ''                    // その他Handbrakeオプションを指定したい場合はここにまとめて記述
};

module.exports.encSettings = encSettings;

/*
 こちらの関数内で番組ごとのエンコード設定を記述できます
 fileNameにはファイル名が渡されるので、それをもとにencSettingsの値を変更してください
 (どう変更できるかはHandbrakeCLI.exeのヘルプ等を参照)
 わからない場合や不要な場合はそのままにするか関数内を "return encSettings;" の行のみにしてください
*/
module.exports.createEncodeSettings = function(fileName) {

    // Example
    // fileNameに"みんなのうた"が含まれていれば以下の設定にする
    // (記述していないものはデフォルト値のまま)
    if (~fileName.indexOf('みんなのうた')) {
        encSettings.quality_or_rate  = '-q 20';
        encSettings.video_size       = SIZE.SIZE1280;
        encSettings.start_at_sec     = '15.0';
        encSettings.chapter_skip_sec = '1.0';
        encSettings.frame_rate       = FRAME_RATE.RATE30;
    }

    return encSettings;
};

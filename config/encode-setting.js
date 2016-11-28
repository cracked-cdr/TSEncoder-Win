/**
 * encode-setting.js
 * エンコード事前設定を行う
 * 
 * Created by cracked-cdr
 */

// 引数strの内容が含まれていればtrue
String.prototype.hasStr = function(str) {
    return ~this.indexOf(str);
};

// エンコード設定本体
// ここで記述されている内容をデフォルト値として、下の関数内の変更が適用されます
var encSettings = {
    avs_options       : '-y4mp',
    qsvenc_options    : '--y4m --fallback-rc --dar 16:9 -u best --scenechange --profile Main ',
    handbrake_options : '-e qsv_h264 -4 -f mp4 --h264-profile=main --loose-anamorphic --modulus 4 -a 1,2 -E copy ' +
                        '--detelecine="1:1:4:4:0:0:-1" --decomb="7:2:6:9:80:16:16:10:20:20:4:2:50:24:1:-1" --verbose=1 ',
    start_cut_sec     : '0.0',    // 先頭何秒をカットするか(この値をエンコード時のカットとチャプター・音声のカットに使用します)
    chapter_skip_sec  : '0.0',    // エンコード後の先頭何秒間をチャプター設定しないようにするか（チャプターに使用）
};
module.exports.encSettings = encSettings;

/*
 こちらの関数内で番組ごとのエンコード設定を記述できます
 fileNameにはファイル名が渡されるので、それをもとにencSettingsのオプションを変更してください
 (オプションは各エンコーダのヘルプ等を参照)
 わからない場合や不要な場合はそのままにするか関数内を "return encSettings;" の行のみにしてください
*/
module.exports.createEncodeSettings = function(filePath, fileName, serviceName) {
    if (!serviceName) {
        serviceName = '';
    }


    // Example
    // fileNameに"みんなのうた"が含まれていれば以下の設定にする
    if (fileName.hasStr('みんなのうた')) {
        // エンコード時のオプションを追加
        encSettings.qsvenc_options += '--la-icq 20 --la-quality auto ';
        encSettings.handbrake_options += '-q 20 --rate 29.97 ';
        // 先頭15秒をカット
        encSettings.start_at_sec     = '15.0';
        // 先頭1秒以内のチャプターは反映しない
        encSettings.chapter_skip_sec = '1.0';

        return encSettings;
    }

    // それ以外の場合は以下の設定にする
    encSettings.qsvenc_options += '--la-icq 24 --la-quality auto --qp-max 21:23:24 ';
    encSettings.handbrake_options += '-q 24 ';

    return encSettings;
};


/**
 * config.js
 * 処理ファイルの出力先などの設定
 * 
 * Created by cracked-cdr
 */

/*
 パスの表記はフォルダの区切り(\)を 2つ記述する必要があります
 (C:\foo\bar -> C:\\foo\\bar)
 フォルダはあらかじめ作成しておいてください
*/

// MP4出力先フォルダ
module.exports.MP4_FOLDER = 'D:\\Videos\\mp4';

// チャプター出力フォルダ
module.exports.CHAPTER_FOLDER = 'D:\\Videos\\CHAPTER';

// 処理済みTSファイル移動先フォルダ
module.exports.TS_DONE_FOLDER = 'D:\\Videos\\TS\\done';

// エンコードファイルがエラーファイルだった場合に再度エンコードを行う回数
module.exports.TRY_ENCODE_MAX = 5;

// エンコードファイルをエラー判定する際のバイト数。この容量を下回るファイルはエラー扱いになります
module.exports.ERR_ENCODE_FILE_SIZE = 10241;

/* プロセス優先度については以下のいずれかを指定してください ('/'も含める。空欄可)
 /LOW         : アイドル優先度
 /BELOWNORMAL : 標準以下の優先度
 /NORMAL      : 通常
 /ABOVENORMAL : 標準以上の優先度
 /HIGH        : 上位の優先度
 /REALTIME    : リアルタイム
*/

// Multi2Decのプロセス優先度を指定
module.exports.MULTI2DEC_PRIORITY = '';

// LogoGuilloのプロセス優先度を指定
module.exports.LOGOGUILLO_PRIORITY = '';

// MP4Boxのプロセス優先度を指定
module.exports.MP4BOX_PRIORITY = '';

// Handbrakeのプロセス優先度を指定
module.exports.HANDBRAKE_PRIORITY = '';

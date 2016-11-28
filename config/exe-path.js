/**
 * exe-path.js
 * 処理に利用する各実行ファイルと関連ファイルの定義
 * 
 * Created by cracked-cdr
 */

var path     = require('path');
var pathinfo = require('pathinfo');
var root     = path.join(pathinfo(process.argv[1]).dirname, 'tools');

/*
 その他の場所にツールがある場合、'=' 以降を削除し、絶対パスで文字列指定してください。
 パスの表記はフォルダの区切り(\)を 2つ記述する必要があります
 
 ex: C:\\foo\\bar に Multi2DecDos.exe がある場合
     path.join(root, 'Multi2Dec', 'Multi2DecDos.exe'); -> 'C:\\foo\\bar\\Multi2DecDos.exe';
*/

// Multi2Decのパス（スクランブル解除に使用。Multi2DecDos.exeを指定してください）
module.exports.MULTI2DEC_PATH = path.join(root, 'Multi2Dec', 'Multi2DecDos.exe');

// logoGuillo実行ファイルパス
module.exports.LOGOGUILLO_PATH = path.join(root, 'logoGuillo', 'logoGuillo.exe');

// logoGuilloで利用するavs2pipemodのパス
module.exports.AVS2PIPEMOD_PATH = path.join(root, 'avs2pipemod', 'avs2pipemod.exe');

// logoGuillo, Avisynthで利用するTS展開プラグインのパス
module.exports.LSMASH_DLL_PATH = path.join(root, 'L-SMASH', 'LSMASHSource.dll');

// logoGuilloで使用するロゴデータフォルダ
// ※フォルダ内に"bs","dtv"フォルダを作成し、局名と同名のlgdファイルを格納してください
module.exports.LOGO_PATH = path.join(pathinfo(this.LOGOGUILLO_PATH).dirname, 'logo');

// LogoGuilloで使用するAutoTuneParamフォルダ
// ※フォルダ内に"bs","dtv"フォルダを作成し、局名と同名のlgd.autotune.paramファイルを格納してください
module.exports.PARAM_PATH = path.join(pathinfo(this.LOGOGUILLO_PATH).dirname, 'param');

// MP4Boxのパス（チャプター埋め込みに使用）
module.exports.MP4BOX_PATH = path.join(root, 'mp4box', 'mp4box.exe');

// HandbrakeCLIのパス
module.exports.HANDBRAKE_PATH = 'C:\\Program Files\\Handbrake\\HandBrakeCLI.exe';

// QSVEncCのパス
module.exports.QSVENC_PATH = path.join(root, 'QSVEnc', 'QSVEncC', 'x64', 'QSVEncC64.exe');

// ts_parser.exeのパス
// QSVEncCを利用する場合必須です。
module.exports.TS_PARSER_PATH = path.join(root, 'ts_parser', 'ts_parser.exe');

// fawcl.exeのパス
// QSVEncCを利用する場合必須です。
module.exports.FAWCL_PATH = path.join(root, 'FakeAacWav', 'fawcl.exe');

// Avisynthで利用するインターレース解除プラグインのパス(IT.dllを想定しています)
module.exports.IT_DLL_PATH = path.join(root, 'Avisynth_plugins', 'IT.dll');

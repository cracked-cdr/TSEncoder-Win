# TSEncoder-Win
TSファイルのスクランブル解除・チャプター作成・エンコードを一続きで行うnode.js製バッチプログラムです。  
作者の環境と必要なソフトウェアの関係上、Windows専用になります。

## 必要なソフトウェア
* [Node.js](https://nodejs.org/) v4.4.5 LTS
* [Handbrake](https://handbrake.fr/)
* [logoGuillo](http://loggialogic.blogspot.jp/)
* [L-SMASH Works](http://pop.4-bit.jp/)（同梱されているLSMASHSource.dllが必要になります）
* [avs2pipemod](http://csbarn.blogspot.jp/2012/09/avs2pipemod-17.html)
* [mp4box](https://gpac.wp.mines-telecom.fr/downloads/gpac-nightly-builds/)  
  インストーラ形式なので、[7-zip](https://sevenzip.osdn.jp/)などで解凍してコピーするかインストール後にexe-path.jsを編集してパスを指定してください（後述）
* [Multi2Dec](https://www.google.co.jp/search?q=Multi2Dec)

## セットアップ
ソースファイルをダウンロードして展開してください。

### npmの実行
コマンドプロンプトを開き、TSEncoder-Win 内に移動してください。
移動後に npm install コマンドを実行してください。

```
cd [TSEncoder-Winフォルダのパス]
npm install
```

### 必要ソフトウェアの配置
TSEncoder-Win/tools 内にHandbrake以外のソフトウェアを以下のように配置してください。  
（すでにソフトウェアを他の場所にインストールしている場合はexe-path.jsを編集します（後述））

```
tools
├── avs2pipemod
|   ├── avs2pipemod.exe
|   ├── avs2pipemod64.exe
|   └── …
├── logoGuillo
|   ├── logo
|   ├── param
|   ├── logoGuillo.exe
|   └── …
├── L-SMASH
|   └── LSMASHSource.dll
├── mp4box
|   ├── mp4box.exe
|   └── …
└── Multi2Dec
    ├── Multi2DecDos.exe
    └── …
```

### config.jsの編集
TSEncoder-Win/config/config.js をテキストエディタで開き、以下の行のパスの部分をそれぞれ自分の環境に合わせて編集します。   
区切り文字（￥）は2つ入力しないと反映されないので注意してください。

```
// MP4出力先フォルダ
module.exports.MP4_FOLDER = 'D:\\Videos\\mp4';

// チャプター出力フォルダ
module.exports.CHAPTER_FOLDER = 'D:\\Videos\\CHAPTER';

// 処理済みTSファイル移動先フォルダ
module.exports.TS_DONE_FOLDER = 'D:\\Videos\\TS\\done';
```

### exe-path.jsの編集（必要ソフトがすでに他の場所にある場合のみ）
TSEncoder-Win/config/exe-path.js をテキストエディタで開き、例に合わせてソフトウェアのパスを任意の場所の文字列に編集してください。  
Handbrakeもデフォルトのインストール先以外にインストールした場合は編集する必要があります。

```
 ex: C:\\foo\\bar に Multi2DecDos.exe がある場合
     path.join(root, 'Multi2Dec', 'Multi2DecDos.exe'); -> 'C:\\foo\\bar\\Multi2DecDos.exe';
```

## 使い方

### 単体で動かす場合
コマンドプロンプト上から以下のコマンドで動作します。

```
cd [TSEncoder-Winフォルダのパス]
node app.js [TSファイルのパス] 0
```

2行目末尾の0は省略可能です。値を1以上にした場合はMulti2Decを使用してスクランブル解除を行います。

### 複数のTSファイルを処理したい場合
TSEncoder-Win/Batch.bat を使用することで、指定したフォルダ直下のTSファイルを順番に処理します。  
スクランブル解除は行いません。

```
cd [TSEncoder-Winフォルダのパス]
Batch.bat [TSフォルダのパス]
```

### 録画後のバッチとして使う
録画ソフトから TSEncoder-Win/EpgTimer_Bon_RecEnd.bat を録画後のバッチとして指定してください。  
Scrambleの値が渡されますので、Scrambleが発生した場合は自動でスクランブル解除を行います。  

#### 注意
録画ソフトを常時起動またはサービスとして動作させている場合、Node.jsインストール時に追加された環境変数が反映されておらずエラーになる場合があります。  
その場合はOSを再起動させるか、EpgTimer_Bon_RecEnd.batのnode呼び出し部分をnode.exeまでのフルパスに書き換えれば解決します。

## logoGuilloのロゴデータ・パラメータデータについて

### プログラム内でのロゴデータ・パラメータデータ指定条件
logoGuilloはロゴデータの位置・表示タイミングの解析のためにロゴデータ（.lgd）とパラメータデータ（.lgd.autoTune.param）を各自で用意して利用します。  
本プログラム上でのこれらの指定なのですが、現状は  
「TSファイル名の中にロゴデータファイル/パラメータファイルの名称が含まれている場合、該当するファイルを使用」  
という形で行っています。  
例として「ＭＸ１.lgd」「ＭＸ２.lgd」「テレビ東京.lgd」ロゴデータがあったとして、TSファイルが「[ＴＯＫＹＯ　ＭＸ１] 機動戦士ガンダム.ts」というファイル名だった場合、「ＭＸ１.lgd」が選ばれることになります。  
そのため、現状はTSファイル名の命名規則によってはlogoGuilloの動作は困難になります。  

### ロゴデータ・パラメータデータの配置
logoGuilloフォルダ内に以下の形で配置してください。

```
logoGuillo
├── logo
|   ├── bs
|   |   └── BS用のロゴデータファイル
|   └── dtv
|       └── 地デジ用のロゴデータファイル
└── param
    ├── bs
    |   └── BS用のパラメータファイル
    ├── dtv
    |   └── 地デジ用のパラメータファイル
    └ default.autoTune.param(任意)
```

なぜこのような配置にするかというと、先述の使用ファイル指定方法の関係上、地デジとBSのファイルを混ぜておくと  
「ＢＳ日テレ」などのBSと地デジで類似したのチャンネル名の場合、地デジ側のファイル「日テレ.lgd」が選ばれてしまう可能性があるためです。  
それを回避するためにBSと地デジでフォルダを分離しています。

### default.autoTune.param
paramフォルダの直下に default.autoTune.param を置くことで、パラメータが見つからない場合に代用パラメータとして使用されます。

## encode-settings.jsについて

TSEncoder-Win/config/encode-settings.js ではエンコード前の設定を調整できます。  
HandbrakeCLIオプションを指定することと、JavaScriptの記述が必要ですが、ファイル名を見て番組ごとにオプションを変更できます。  
デフォルトの設定も記述しているので、デフォルト設定を変更したい場合は以下の部分だけ適宜修正してください。  
大体はquality_or_rate, video_size, audio_rate, frame_rate あたりの修正で済むと思います。  
（そのままでも私感ではそれなりに見える設定にしています）  

```
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
```

## 利用npm package

* [glob](https://www.npmjs.com/package/glob)
* [log4js](https://www.npmjs.com/package/log4js)
* [pathinfo](https://www.npmjs.com/package/pathinfo)
* [sprintf-js](https://www.npmjs.com/package/sprintf-js)

/**
 * Created by cracked-cdr on 2016/12/11.
 * EpgDataCap_Bonの録画情報ファイル(ts.program.txt)関連のロジック
 */

var fs       = require('fs');
var path     = require('path');
var pathinfo = require('pathinfo');
var iconv    = require('iconv-lite');
var logger   = require('log4js').getLogger();

// ts.program.txtをパースして連想配列で返す
module.exports.parse = function(filePath) {

    var program;
    try {
        var info = pathinfo(filePath);
        var readText = fs.readFileSync(path.join(info.dirname, info.basename + '.ts.program.txt'));
        readText = iconv.decode(readText, 'shift_jis').toString();
        program = readText.split('\r\n');
    } catch (err) {
        logger.error(err);
        return null;
    }

    if (!program) {
        return null;
    }

    var result = {};
    var multiLineInfo = {};
    program.forEach(function(line, i) {
        switch (i)  {
            case 0: result.broadcastDateTime = line; break;
            case 1: result.serviceName = line; break;
            case 2: result.title = line; break;
            case 4: result.subTitle = line; break;
            default:
                // その他複数行にわたる情報が存在するのでそれぞれの情報開始位置を記憶してあとから取得
                if (line == '詳細情報')                    { multiLineInfo.detail = i + 1; }
                if (line.startsWith('ジャンル :'))         { multiLineInfo.genre = i + 1; }
                if (line.startsWith('映像 :'))             { multiLineInfo.video = i; }
                if (line.startsWith('音声 :'))             { multiLineInfo.audio = i; }
                if (line.endsWith('放送'))                 { multiLineInfo.serviceType = i; }
                if (line.startsWith('OriginalNetworkID:')) { multiLineInfo.originalNetworkID = i; }
                if (line.startsWith('TransportStreamID:')) { multiLineInfo.transportStreamID = i; }
                if (line.startsWith('ServiceID:'))         { multiLineInfo.serviceId = i; }
                if (line.startsWith('EventID:'))           { multiLineInfo.eventId = i; }
        }
    });

    // 情報該当位置の配列範囲を取り出し
    var detail            = program.slice(multiLineInfo.detail, multiLineInfo.genre - 1);
    var genre             = program.slice(multiLineInfo.genre, multiLineInfo.video);
    var video             = program.slice(multiLineInfo.video, multiLineInfo.audio);
    var audio             = program.slice(multiLineInfo.audio, multiLineInfo.serviceType);
    var serviceType       = program[multiLineInfo.serviceType];
    var originalNetworkId = program[multiLineInfo.originalNetworkID];
    var transportStreamId = program[multiLineInfo.transportStreamID];
    var serviceId         = program[multiLineInfo.serviceId];
    var eventId           = program[multiLineInfo.eventId];

    result.detail       = detail.join('\n').replace(/\n\n$/, '');
    result.genre        = genre.filter(function(elem) { return elem; });
    result.video        = video.join('\n').replace('映像 : ', '');
    result.audio        = audio.join('\n').replace('音声 : ', '').replace(/\n$/, '');
    if (serviceType) {
        result.serviceType = serviceType.replace(/\n\n$/, '');
    }

    var m = originalNetworkId.match(/^OriginalNetworkID:(\d+)\(([a-zA-Z0-9]+)\)$/);
    if (m && m.length >= 3) {
        result.originalNetworkID10 = m[1];
        result.originalNetworkID16 = m[2];
    }

    m = transportStreamId.match(/^TransportStreamID:(\d+)\(([a-zA-Z0-9]+)\)$/);
    if (m && m.length >= 3) {
        result.transportStreamID10 = m[1];
        result.transportStreamID16 = m[2];
    }

    m = serviceId.match(/^ServiceID:(\d+)\(([a-zA-Z0-9]+)\)$/);
    if (m && m.length >= 3) {
        result.serviceID10 = m[1];
        result.serviceID16 = m[2];
    }

    m = eventId.match(/^EventID:(\d+)\(([a-zA-Z0-9]+)\)$/);
    if (m && m.length >= 3) {
        result.eventID10 = m[1];
        result.eventID16 = m[2];
    }

    logger.debug(result);

    return result;
};

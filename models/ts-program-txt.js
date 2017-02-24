/**
 * Created by cracked-cdr on 2016/12/11.
 * EpgDataCap_Bonの録画情報ファイル(ts.program.txt)関連のロジック
 */

'use strict';

const fs       = require('fs');
const path     = require('path');
const pathinfo = require('pathinfo');
const iconv    = require('iconv-lite');
const logger   = require('log4js').getLogger();

// ts.program.txtをパースして連想配列で返す
module.exports.parse = function(filePath) {

    let program;
    try {
        let info = pathinfo(filePath);
        let readText = fs.readFileSync(path.join(info.dirname, info.basename + '.ts.program.txt'));
        readText = iconv.decode(readText, 'shift_jis').toString();
        program = readText.split('\r\n');
    } catch (err) {
        logger.error(err);
        return null;
    }

    if (!program) {
        return null;
    }

    let result = {};
    let multiLineInfo = {};
    program.forEach(function(line, i) {
        switch (i)  {
            case 0: result.broadcastDatetime = line; break;
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
    let detail            = multiLineInfo.detail ? program.slice(multiLineInfo.detail, multiLineInfo.genre - 1) : null;
    let genre             = program.slice(multiLineInfo.genre, multiLineInfo.video);
    let video             = program.slice(multiLineInfo.video, multiLineInfo.audio);
    let audio             = program.slice(multiLineInfo.audio, (multiLineInfo.serviceType ? multiLineInfo.serviceType : multiLineInfo.originalNetworkID));
    let serviceType       = program[multiLineInfo.serviceType];
    let originalNetworkId = program[multiLineInfo.originalNetworkID];
    let transportStreamId = program[multiLineInfo.transportStreamID];
    let serviceId         = program[multiLineInfo.serviceId];
    let eventId           = program[multiLineInfo.eventId];

    if (detail) {
        result.detail = detail.join('\n').replace(/\n\n$/, '');
    }
    result.genre = genre.filter(function(elem) { return elem; });
    result.video = video.join('\n').replace('映像 : ', '');
    result.audio = audio.join('\n').replace('音声 : ', '').replace(/\n$/, '');
    if (serviceType) {
        result.serviceType = serviceType.replace(/\n\n$/, '');
    }

    let m = originalNetworkId.match(/^OriginalNetworkID:(\d+)\(([a-zA-Z0-9]+)\)$/);
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

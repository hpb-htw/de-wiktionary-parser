"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import XMLStream from "xml-stream";
var XMLStream = require("xml-stream");
var fs = require("fs");
var de_wiki_aux_1 = require("./de_wiki_aux");
var BUFFER_SIZE = 100;
/**
 * parse a XML dump file from http://dumps.wikimedia.org/backup-index.html
 * Result of this function is a Promise. See Unit test for Usage.
 *
 */
function parseWikiXml(dumpFile, collectNewEntry) {
    var xmlFile = fs.createReadStream(dumpFile);
    var count = 0;
    var promisses = new Promise(function (resolve, reject) {
        var xml = new XMLStream(xmlFile);
        xml.preserve('text', true);
        xml.on("endElement: page", function (page) {
            var ns = page["ns"];
            if (ns === '0') {
                ++count;
                var id = Number.parseInt(page["id"]);
                var title = page["title"];
                var originText = page["revision"]["text"]["$children"];
                try {
                    var text = joinText(originText);
                    collectNewEntry({
                        id: id,
                        title: title,
                        text: text
                    });
                }
                catch (ex) {
                    reject(ex);
                }
            }
        });
        xml.on("end", function () {
            resolve(count);
        });
    });
    return promisses;
}
exports.parseWikiXml = parseWikiXml;
function joinText(text) {
    return text.join("");
}
function importDic(xmlPath, filterEntryFn, insertEntriesFn) {
    var buffer = [];
    var countGermanWords = 0;
    var savedEntries = 0;
    var effectiveFilterFn = filterEntryFn ? filterEntryFn : function (index, entry) { return true; };
    function collectNewEntry(entry) {
        if (de_wiki_aux_1.isGermanWord(entry["title"], entry["text"])) {
            ++countGermanWords;
            if (effectiveFilterFn(countGermanWords, entry)) {
                var stringifyText = JSON.stringify(entry.text);
                entry.text = stringifyText;
                buffer.push(entry);
                if (buffer.length === BUFFER_SIZE) {
                    var cache = buffer;
                    buffer = [];
                    var r = insertEntriesFn(cache);
                    savedEntries += r;
                    console.error({ countGermanWords: countGermanWords, savedEntries: savedEntries, r: r });
                }
            }
        }
        else {
            console.error("ignore word " + entry["title"]);
        }
    }
    console.error("enter");
    return parseWikiXml(xmlPath, collectNewEntry)
        .then(function (countResultFromParseWikiDump) {
        console.error({ countGermanWords: countGermanWords, countResultFromParseWikiDump: countResultFromParseWikiDump });
        if (buffer.length > 0) {
            return insertEntriesFn(buffer);
        }
        else {
            return 0;
        }
    }).then(function (lastChunk) {
        console.error({ countGermanWords: countGermanWords, savedEntries: savedEntries, lastChunk: lastChunk });
        return savedEntries + lastChunk;
    });
}
exports.importDic = importDic;
//# sourceMappingURL=wiktionary.js.map
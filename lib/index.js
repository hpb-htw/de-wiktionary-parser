#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var wiktionary_1 = require("./wiktionary");
var smallDumpXML = {
    path: "../../big-file/small-dewiktionary-20191020-pages-articles.xml",
    nsZeroPageCount: 6
};
var bigDumpXML = {
    path: "../../big-file/dewiktionary-20191020-pages-articles.xml"
};
var SEPARATOR = "<separator>";
var count = 0;
function syncStdOutInsertEntriesFn(entries) {
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var e = entries_1[_i];
        console.log("" + e["id"] + SEPARATOR + e["title"] + SEPARATOR + e["text"]);
    }
    var inserted = entries.length;
    count += inserted;
    console.error("Count " + count + " entries inserted to console");
    return inserted;
}
function noOpFilterFN(index, entry) {
    return true;
}
function verify() {
    return new Promise(function () { return count; });
}
var xmlPath = path.join(__dirname, bigDumpXML.path);
wiktionary_1.importDic(xmlPath, noOpFilterFN, syncStdOutInsertEntriesFn)
    .then(function (countGermanWords) {
    console.error({ countGermanWords: countGermanWords });
})
    .then(function () {
    return verify();
})
    .then(function (verifyCount) {
    console.error({ verifyCount: verifyCount });
})
    /*.then(() => {
        backend.done();
    })*/
    .catch(function (ex) {
    console.error(ex);
});
//# sourceMappingURL=index.js.map
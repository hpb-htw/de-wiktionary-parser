#! /usr/bin/env node
import * as path from "path";
import {importDic, Entry } from "./wiktionary";

const smallDumpXML = {
    path:  "../../big-file/small-dewiktionary-20191020-pages-articles.xml",
    nsZeroPageCount: 6
};

const bigDumpXML = {
    path: "../../big-file/dewiktionary-20191020-pages-articles.xml"
};

const SEPARATOR = "<separator>";

let count = 0;

function syncStdOutInsertEntriesFn (entries: Entry[]) : number {
    for(let e of entries) {
        console.log(`${e["id"]}${SEPARATOR}${e["title"]}${SEPARATOR}${e["text"]}`);
    }    
    let inserted = entries.length;
    count += inserted;
    console.error(`Count ${count} entries inserted to console`);
    return inserted;
}

function noOpFilterFN (index:number, entry: Entry) {
    return true;
}

function verify (): Promise<number> {
    return new Promise(() =>count);
}

let xmlPath = path.join(__dirname, bigDumpXML.path);
importDic(xmlPath, noOpFilterFN, syncStdOutInsertEntriesFn)
    .then( (countGermanWords) => {
        console.error({ countGermanWords });
    })
    .then( () => {
        return verify();
    })
    .then((verifyCount) => {
        console.error({ verifyCount });
    })
    /*.then(() => {
        backend.done();
    })*/
    .catch((ex) => {
        console.error(ex);
    });
#! /usr/bin/env node
import * as path from "path";
import {importDic, Entry } from "./wiktionary";


const SEPARATOR = "<separator>";

let count = 0;


function makeInsertEntriesFn(separator:string) : (entries:Entry []) => number {
    let sep = separator;
    return (entries:Entry [] ):number => {
        for(let e of entries) {
            console.log(`${e["id"]}${sep}${e["title"]}${sep}${e["text"]}`);
        }   
        let inserted = entries.length;
        count += inserted;
        console.error(`inserted ${count} new entries to console`);
        return inserted;
    };
}

function noOpFilterFN (index:number, entry: Entry) {
    return true;
}

function verify (): Promise<number> {
    return new Promise(() =>count);
}

// main routine
let argv = process.argv.slice(2);
if(argv.length !== 2) {
    throw new Error("Expected XML Dump file and column separator");
}
let xmlPath = path.resolve(argv[0]);
let syncStdOutInsertEntriesFn = makeInsertEntriesFn(argv[1]);

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
    .catch((ex) => {
        console.error(ex);
    });

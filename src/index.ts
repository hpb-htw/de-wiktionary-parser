#! /usr/bin/env node
import * as path from "path";
import {importDic, Entry, getStatistic} from "./wiktionary";
import {writeFileSync} from "fs";


let count = 0;


function makeInsertEntriesFn(delimiter:string) : (entries:Entry []) => number {
    let sep = delimiter;
    return (entries:Entry [] ):number => {
        for(let e of entries) {
            // write result to stdout, all other thing is written into std error
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
    throw new Error("Expected XML Dump file and column delimiter");
}
let xmlPath = path.resolve(argv[0]);
let delimiter = argv[1];
let syncStdOutInsertEntriesFn = makeInsertEntriesFn(delimiter);
let statisticFileName = 'statistic.json';

// print header
console.log(`id${delimiter}title${delimiter}text`);
// print contents
importDic(xmlPath, noOpFilterFN, syncStdOutInsertEntriesFn)
    .then( (countGermanWords) => {
        console.error({fileName: "index.ts", countGermanWords });
        let statistics = JSON.stringify( getStatistic(50), null, 2 );
        writeFileSync(statisticFileName, statistics, 'utf8');
        return countGermanWords;
    })
    .catch((ex) => {
        console.error(ex);
    });

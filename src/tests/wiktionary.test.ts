import * as path from "path";
import {parseWikiXml, importDic, Entry } from "../wiktionary";

const halloPageDict = {
    path: "../../../big-file/hallo-page.xml",
    lineOfPage: 56,
    firstLine: '{{Siehe auch|[[hallo]], [[halló]]}}',
    lastLine: '{{Ähnlichkeiten 1|[[Hall]], [[Halle]], [[halle]], [[Halo]], [[holla]], [[Holle]]}}'
};

const smallDumpXML = {
    path:  "wikitext/small-dewiktionary-20191020-pages-articles.xml",
    nsZeroPageCount: 6
};

const NO_OP:Promise<any> = new Promise<any>(()=>{});

describe('wikipedia', () => {
    test('parse xml dump', async () => {
        let xmlPath = path.join(__dirname, smallDumpXML.path);
        let result: any[] = [];
        await parseWikiXml(xmlPath, (entry: Entry): any|undefined => {
            result.push(entry);
            return ;
        });
        let entriesCount = result.length;
       expect(entriesCount).toBe(smallDumpXML.nsZeroPageCount);       
    });

    
    test('parse page correct', async () => {
        let xmlPath = path.join(__dirname, halloPageDict.path);
        let result: Entry[] = [];
        await parseWikiXml(xmlPath, (entry: Entry): any|undefined => {
            result.push(entry);
            return ;
        });
        //console.log(result);
        let hallo = result.filter((page) => page.id === 555);
        //assert.equal(hallo.length, 1, "there is only one page with tile Hallo");
        let text = hallo[0].text.split("\n");
        expect(text.length).toBe(halloPageDict.lineOfPage);
        expect(text[0]).toBe(halloPageDict.firstLine);
        expect(text[halloPageDict.lineOfPage-1]).toBe(halloPageDict.lastLine);        
    });
    
    test("import dict", async()=>{
        let xmlPath = path.join(__dirname, smallDumpXML.path);
        let filter = (index:number, entry:Entry) => true;
        let count = 0;
        let insertEntriesFn = (en:Entry[]) => {
            let size = en.length;
            count += size;
            return size;
        };
        await importDic(xmlPath, filter, insertEntriesFn);
        // 5 Deutsche Einträge und 1 nicht deutcher Eintrag in XML
        expect(count + 1).toBe(smallDumpXML.nsZeroPageCount);
    });

});


//import XMLStream from "xml-stream";
const XMLStream = require("xml-stream");
import * as fs from "fs";



//TODO: create a typedef package and move this declaration into it, 
//      so that other projects can use this declaration to communicate with each others.
export type Entry = {
    /**
     * unique id of the entry in a dictionary
     */
    id: number,
    /**
     * title of the wiki page
     */
    title: string,
    /**
     * text description about the entry
     */
    text: string,
};

/**
 * parse a XML dump file from http://dumps.wikimedia.org/backup-index.html
 * Result of this function is a Promise. See Unit test for Usage.
 * 
 */
export async function parseWikiXml(dumpFile: string, collectNewEntry: (entry: Entry) => Promise<any>):Promise<number> {
    console.log(`call parseWiki`);
    let xmlFile = fs.createReadStream(dumpFile);
    let count = 0;
    let promisses = new Promise<number>((resolve, reject) => {
        let xml = new XMLStream(xmlFile);
        xml.preserve('text', true);
        xml.on("endElement: page", async (page: any) => {           
            let ns = page["ns"];
            if (ns === '0') {
                ++count;
                let id = Number.parseInt(page["id"]);
                let title = page["title"];
                let originText = page["revision"]["text"]["$children"];
                try {
                    let text = joinText(originText);                    
                    await collectNewEntry({
                        id: id,
                        title: title,
                        text: text
                    });
                } catch (ex) {                    
                    reject(ex);
                }
            }
        });
        xml.on("end", () => {
            resolve(count);
        });
    });
    return promisses;
}

function joinText(text: string[]): string {
    return text.map((line) => escape(line)).join("");
}

// Escapes text for XML.
function escape(value: string) {
    return value.replace(/"|&|'|<|>/g, function (entity) {
        return entities[entity];
    });
}

// XML entities.
const entities: { [index: string]: string } = {
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&apos;',
    '<': '&lt;',
    '>': '&gt;'
};
import {Body, ListItem} from "wikinary-eintopf/lib/de_wiki_lang";
import {
    SENSE_HAS_DOMAIN,
    SENSE_INCONSISTENT,
    SENSE_IS_MULTILINE,
    statisticEventEmitter,
    stripWikiFormat
} from "./de_wiki_aux";


export function consumeBedeutungBlock(body:Body, block:string[]) {
    body.sense = parseList(0, block.slice(1), body.lemma); // drop the first line {{Bedeutungen}}
}

function parseList(currentLevel:number, list:string[], lemma:string=''):ListItem {
    let item:ListItem = new ListItem("");
    let listLevel = 0;
    list.map(line => line.trim()).filter(line => line.length > 0).forEach( (line, idx) => {
        let lineLevel = Internal.computeLevel(listLevel, line, lemma);
        if (lineLevel > listLevel) {
            while (lineLevel-1 > listLevel) {
                let nextLevel:ListItem|undefined = item.lastChild();
                if(nextLevel === undefined) {
                    nextLevel = new ListItem("");
                    item.appendSubList(nextLevel);
                }
                item = nextLevel;
                listLevel++;
            }
        } else if (lineLevel-1 < listLevel) {
            while (lineLevel-1 < listLevel && item.parent !== undefined) {
                item = item.parent!;
                listLevel--;
            }
        }
        if(lineLevel===0) {
            item.text += line;
        }else {
            item.appendSubList(new ListItem(line));
        }
    });
    while(item.parent !== undefined) {
        item = item.parent;
    }
    return item;
}


export namespace Internal {
    /**
     * \w              => 0 or same as parent (see ach)
     * '*' or "''"     => 1                   (see essen, zocken)
     * ':'             => 2                   (normal case)
     * '::'            => 3                   (see Baum)
     * */
    export function computeLevel(currentLevel: number, line: string, lemma:string): number {
        // every lines, which starts with a normal word-character, is a continuous line, has same level like parents

        if (line.startsWith('::')) {
            return 3;
        } else if (line.startsWith(':')) {
            return 2;
        } else if (line.startsWith('*')  || line.startsWith("''" )) {
            return 1;
        } else if (line.search(/^\w/) === 0) {
            return currentLevel;
        } else {
            statisticEventEmitter.emit(SENSE_IS_MULTILINE, lemma, line);
            return currentLevel;
        }
    }
}


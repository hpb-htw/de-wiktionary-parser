import {Body, ListItem} from "wikinary-eintopf/lib/de_wiki_lang";
import {
    SENSE_IS_MULTILINE,
    statisticEventEmitter
} from "./de_wiki_aux";


export function consumeBedeutungBlock(body:Body, block:string[]) {
    try {
        body.sense = parseList(0, block.slice(1), body.lemma); // drop the first line {{Bedeutungen}}
    }catch (e) {
        let msg = `Cannot parse Bedeutungen: Lemma: ${body.lemma} Message: ${e.message}`;
        throw new Error(msg);
    }
}

function parseList(currentLevel:number, list:string[], lemma:string=''):ListItem {
    let item:ListItem = new ListItem("");// always point to the last processed item in the list.
    let listLevel = 0;
    list.map(line => line.trim()).filter(line => line.length > 0).forEach( (line, idx) => {
        let [lineLevel, isContinue] = Internal.computeLevel(listLevel, line, lemma);
        if (isContinue){
            item.content += (item.content.length === 0? line : '\n'+line );
        }else {
            if (lineLevel === listLevel) { // item and the line are sibling on the same level.
                let lastItem:ListItem = new ListItem(line);
                item.parent?.appendSubList(lastItem);
                item = lastItem;
            } else if (lineLevel > listLevel) { // line creates a new deeper level
                while (lineLevel > listLevel) {
                    let nextLevel = new ListItem("");
                    item.appendSubList(nextLevel);
                    item = nextLevel;
                    listLevel += 1;
                }
                item.content = line;
            } else if (lineLevel < listLevel) {
                while (lineLevel < listLevel) {
                    item = item.parent!;
                    listLevel -= 1;
                }
                let lastItem = new ListItem(line);
                item.parent?.appendSubList(lastItem);
                item = lastItem;
            }
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
     *
     * @return [lineLevel, isContinue]
     * */
    export function computeLevel(currentLevel: number, line: string, lemma:string): [number,boolean] {
        // every lines, which starts with a normal word-character, is a continuous line, has same level like parents

        if (line.startsWith('::')) {
            return [3, false];
        } else if (line.startsWith(':')) {
            return [2, false];
        } else if (line.startsWith('*')  || line.startsWith("''" )) {
            return [1, false];
        } else if (line.search(/^\w/) === 0) {
            return [currentLevel, true];
        } else {
            statisticEventEmitter.emit(SENSE_IS_MULTILINE, lemma, line);
            return [currentLevel, true];
        }
    }
}


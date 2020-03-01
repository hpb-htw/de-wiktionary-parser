import {Body, Sense, ListItem} from "wikinary-eintopf/lib/de_wiki_lang";
import {
    SENSE_HAS_DOMAIN,
    SENSE_INCONSISTENT,
    SENSE_IS_MULTILINE,
    statisticEventEmitter,
    stripWikiFormat
} from "./de_wiki_aux";

export function consumeBedeutungBlock(body:Body, block:string[]) {
    let introText:string = '';
    let idx:number = 1; // first line is always {{Bedeutungen}} so ignore it!
    let line:string = block[idx];
    while (line && isNotAnItem(line) ) {
        introText += line;
        idx+=1;
        line = block[idx];
    }
    if (introText) {
        body.sense.introText = introText;
    }
    let listItems:ListItem[] = body.sense.ambiguity;
    let listLevel = 0;
    let senseLines = block.slice(idx);
    senseLines.forEach( (line, idx) => {

    });
}


function isNotAnItem(line:string) {
    return ! ( line.startsWith(':')
                || line.startsWith('*')
                || line.startsWith("''")
    );
}

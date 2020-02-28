import {Body, Sense} from "wikinary-eintopf/lib/de_wiki_lang";
import {
    SENSE_HAS_DOMAIN,
    SENSE_INCONSISTENT,
    SENSE_IS_MULTILINE,
    statisticEventEmitter,
    stripWikiFormat
} from "./de_wiki_aux";

export function consumeBedeutungBlock(body:Body, block:string[]) {
    let category:string|undefined = undefined;
    const listToken = /:\[\s*\d+\s*\]\s*/;
    const domainToken = '*';
    let senseBlock = block.slice(1);
    let sense:Sense[] = body.sense;
    senseBlock.forEach( (line, idx) => {
        if (line.startsWith(':')) {
            let level = 0;
            let cachedLine = line;
            while (cachedLine.startsWith(':')) {
                cachedLine = cachedLine.slice(1);
                level += 1;
            }
            let currentLevel:Sense[] = sense;
            let consistentState = true;
            while(level > 1) {
                --level;
                let lastIdx = currentLevel.length - 1;
                if (lastIdx >= 0) {
                    currentLevel = currentLevel[lastIdx].sense;
                } else {
                    statisticEventEmitter.emit(SENSE_INCONSISTENT, body.lemma, line);
                    consistentState = false;
                }
            }
            if (consistentState) {
                currentLevel.push(new Sense(cachedLine));
            }
        } else if ( line.startsWith(domainToken) ) {
            statisticEventEmitter.emit(SENSE_HAS_DOMAIN, body.lemma, line);
        } else { // line is a continue of text above => ignore it
            statisticEventEmitter.emit(SENSE_IS_MULTILINE, body.lemma, line);
        }

        /*
        if (line.startsWith(":")) {
            cachedText = line.replace(listToken, ''); // drop first
        } else if (line.startsWith(domainToken)) {
            category = stripWikiFormat(line.slice(1));
        } else {
            cachedText += line;
        }
        let nextLine = block[idx+1];
        if (nextLine && nextLine.startsWith(":")) {
            let sense = new Sense(stripWikiFormat(cachedText), category);
            body.sense.push(sense);
            category = undefined;
            cachedText = "";
        }*/
    });

}
import {
    Body, PartOfSpeech, Sense, Title,
    UEBERSETZUNGS_TABELL,
    WikiBlockName,
    WikiPage
} from "wikinary-eintopf/lib/de_wiki_lang";
import {consumeWorttrennung} from "./de_wiktionary_worttrennung";
import {
    BadWikiSyntax,
    INGORE_WORD,
    NO_CONSUME_FOR_BLOCK,
    removeHTMLComment,
    statisticEventEmitter, stripCurly, stripWikiFormat
} from "./de_wiki_aux";
import {consumeFlexion, isFlexion} from "./de_wiktionary_flexion";
import {consumeBedeutungBlock} from "./de_wiktionary_sense";
import * as Ast from "./de_wiki_ast";
import {Block} from "./de_wiki_ast";

export function parseDeWikiTextToObject(wikiText: string, selectLanguages:string[]=["Deutsch"]): WikiPage[] {
    let wiki:Ast.WikiText;
    try {
        wiki = tokenizeWikiText(wikiText);
    }catch (e) {
        let message = `${e.message} ${e.stack} Parse Wiki error ${wikiText.split('\n').slice(0,4).join('<newline>')}`;
        throw new Error(message);
    }
    let pages:WikiPage[] = consumeWiki(wiki,selectLanguages);
    return pages;
}

enum ParserState  {
    extra,
    page,
    body,
    section,
    block
}
export const lineIntroducesAPage = (line:string) => /^(==)([^=]+)(==)$/.test(line.trim());
export const lineIntroducesABody = (line:string) => /^(===)([^=]+)(===)$/.test(line.trim());
export const lineIntroducesASection = (line:string) => /^(====)([^=]+)(====)$/.test(line.trim());

export function tokenizeWikiText(wikiText:string):Ast.WikiText {
    let wiki: Ast.WikiText = new Ast.WikiText();
    let plaintext = removeHTMLComment(wikiText);
    let lines = plaintext.split("\n");

    let state:ParserState = ParserState.extra;
    let currentPage:Ast.Page;
    let currentBody:Ast.Body;
    let currentSection:Ast.Section;
    let currentBlock:Ast.Block;

    lines.forEach( (line:string, idx:number) => {
        line = line.trim();
        if (state === ParserState.extra) {
            // == sein ({{Sprache|Deutsch}}) ==
            if ( lineIntroducesAPage(line) ) {
                state = ParserState.page;
                currentPage = new Ast.Page(line);
                wiki.pages.push( currentPage);
            } else {
                wiki.extraLines.push(line);
            }
        } else if (state === ParserState.page) {
            // === {{Wortart|Verb|Deutsch}}, {{Wortart|Hilfsverb|Deutsch}} ===
            if ( lineIntroducesABody(line) ) {
                state = ParserState.body;
                currentBody = new Ast.Body(currentPage!.lemma, line);
                currentPage!.bodies.push(currentBody);
                currentSection = currentBody.sections[0]; // pick the default section
            } else {
                wiki.extraLines.push(line);
            }
        } else if (state === ParserState.body ) {
            // ==== Übersetzung ====
            if ( lineIntroducesASection(line) ) {
                // start a new section
                state = ParserState.section;
                if(currentBody) {
                    currentSection = new Ast.Section(line, currentBody);
                    currentBody.sections.push(currentSection);
                }else {
                    let debugInfo = lines.slice(5, 15).join('<newline>');
                    throw new Error(`Token '== <lemma> ({{Sprache|<lang>}}) ==' not found ${debugInfo}`);
                }
            }
        } else if (state === ParserState.section) {
            if (line.startsWith("{{")) {
                state = ParserState.block;
                currentBlock = new Ast.Block(line);
                currentSection.blocks.push(currentBlock);
                currentBlock.appendText(line);
            }
        } else if (state === ParserState.block) {
            currentBlock.appendText(line);
        }
        let nextLine = lines[idx+1];
        // if next line start a block, state must be the section so
        // the current section can push the next block and so on
        if (nextLineStartABlock(state, line, nextLine)) {
            state = ParserState.section;
            if (currentSection.name === Ast.Body.uebersetzungSectionName &&
                                line !== Ast.Body.uebersetzungSectionName) {
                currentSection = currentBody.sections[0]; // reset to default section
            }
        } else if (nextLineStartASection(line, nextLine)) {
            state = ParserState.body;
        } else if (nextLineStartABody(line, nextLine)) {
            state = ParserState.page;
        } else if (nextLineStartAPage(line, nextLine)) {
            state = ParserState.extra;
        }
    });
    return wiki;
}

function nextLineStartABlock(state:ParserState, line:string, nextLine:string|undefined):boolean {
    return (nextLine !== undefined) && nextLine.startsWith("{{") &&
        state !== ParserState.extra && state !== ParserState.page;
}

function nextLineStartASection(line:string, nextLine:string|undefined):boolean {
    return (nextLine !== undefined) && lineIntroducesASection(nextLine);
}

function nextLineStartABody(line:string, nextLine:string|undefined) {
    return (nextLine !== undefined) && lineIntroducesABody(nextLine);
}

function nextLineStartAPage(line:string, nextLine:string|undefined) {
    return (nextLine !== undefined) && lineIntroducesAPage(line); // == sein ({{Sprache|Französisch}}) ==
}


function consumeWiki(wiki: Ast.WikiText, selectLanguages:string[]):WikiPage[] {
    let pages:WikiPage[] = [];
    for (let astPage of wiki.pages) {
        if (selectLanguages.includes(astPage.language)) {
            pages.push(consumePage(astPage));
        }
    }
    return pages;
}

function consumePage(page:Ast.Page) : WikiPage {
    let title:Title = new Title(page.lemma, page.language);
    let wikiPage:WikiPage = new WikiPage(title);
    for(let body of page.bodies ) {
        wikiPage.body.push( consumeBody(body) );
    }
    return wikiPage;
}

function consumeBody(body:Ast.Body ): Body {
    let pos:PartOfSpeech = new PartOfSpeech();
    for(let wortart of body.partOfSpeech) {
        pos.pos.push(wortart);
    }
    let wikiBody:Body = new Body(body.lemma, pos);
    for(let section of body.sections) {
        for (let block of section.blocks) {
            appendBlockToBody(block, wikiBody);
        }
    }
    return wikiBody;
}

function appendBlockToBody(astblock:Ast.Block, body:Body) {
    let title = astblock.name;
    if(title === undefined){
        throw new BadWikiSyntax(`Programming error, a block cannot contain only empty strings`, body.lemma);
    }
    let block = astblock.getText();
    if ( isFlexion(body, title) ) {
        let [_, flexion] = consumeFlexion(body,0, block);
        body.flexion = flexion;
    } else if (title === WikiBlockName.Lesungen){
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Anmerkung ) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Alternative_Schreibweisen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Nicht_mehr_gueltige_Schreibweisen ) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Veraltete_Schreibweisen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Nebenformen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Worttrennung) {
        consumeWorttrennung(body, block);
    } else if (title === WikiBlockName.in_arabischer_Schrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.in_kyrillischer_Schrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.in_lateinischer_Schrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Strichreihenfolge) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Vokalisierung) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Umschrift) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Aussprache) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Grammatische_Merkmale) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Bedeutungen) {
        consumeBedeutungBlock(body, block);
    } else if (title === WikiBlockName.Abkuerzungen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Symbole) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Herkunft) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Wortfamilie) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Synonyme) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Sinnverwandte_Woerter) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Sinnverwandte_Zeichen) {
        consumeUnknownBlock(body, block);
    } else if (title === WikiBlockName.Gegenwoerter) {
        consumeUnknownBlock(body, block);
    } else { // TODO: extend this part
        consumeUnknownBlock(body, block);
    }
}


function consumeUnknownBlock(body:Body, block:string[]) {
    statisticEventEmitter.emit(NO_CONSUME_FOR_BLOCK, block[0], body.lemma);
}










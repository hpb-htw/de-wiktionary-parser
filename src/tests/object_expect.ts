import {
    BAD_FLEXION,
    GENERAL_ERROR, INGORE_WORD,
    NO_CONSUME_FOR_BLOCK,
    PARSE_WIKI_TEXT,
    statisticEventEmitter,
    WIKI_OK
} from "../de_wiki_aux";

export function expectObjectEqual(object:any, expectObj:any): void {
    expect( JSON.parse(JSON.stringify(object)) )
        .toStrictEqual(JSON.parse(JSON.stringify(expectObj)));
}


statisticEventEmitter.addListener(PARSE_WIKI_TEXT,() => {
    //Ignore
});

statisticEventEmitter.addListener(WIKI_OK, () =>{
    //Ignore
});

statisticEventEmitter.addListener(BAD_FLEXION, (flexionName:string, lemma:string)=>{
    console.error(`${BAD_FLEXION.toString()} ${flexionName} ${lemma}`);
});

statisticEventEmitter.addListener(NO_CONSUME_FOR_BLOCK, (blockName:string, lemma:string)=> {
    //console.error(`${NO_CONSUME_FOR_BLOCK.toString()} ${blockName} ${lemma}`);
});

statisticEventEmitter.addListener(GENERAL_ERROR, (error:Error) => {
    console.error(`${error.message}`);
    throw error;
});

statisticEventEmitter.addListener(INGORE_WORD, (word:string)=> {
    //Nothing
});

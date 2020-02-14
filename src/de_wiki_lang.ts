export enum Lang {
    en = "Englisch",
    de = "Deutsch"
}

/**
 * One wiki text contain one or more pages  a page is a text from begin --or when it stats at the midle of a
 * multiple pages text-- from a line begin with `== ` to the line before the next line, which also begin
 * with `== `.
 *
 * The line with `== ` is the title of the page.
 * A Page contain one or more body. In most cases it has only *one* body. A Body begins with the line with Triple Equal
 * (`=== `) and ends with the line before the next line beginning with Triple Equal. Line beginning with Triple Equal
 * are partOfSpeech.
 * */
export class WikiPage {
    title: Title;                  // everything from begin to the line begining with `== ` (Double Equal sign)
    body: Body[] = [];             // everything from `=== ` to the line before the next line geginning with ` ===`
    constructor(title:Title) {
        this.title = title;
    }
}

export class Title {
    title:string;
    language:string;
    constructor(title:string, language:string) {
        this.title=title;
        this.language = language;
    }
}

export class Body {

    partofSpeech: PartOfSpeech;

    flexion?: SubstantivFlexion;

    //   {{Lesungen}} (Platzierung zwischen der Überschrift der Ebene 2 und der darauf folgenden Überschrift der Ebene 3; alle nachfolgenden Textbausteine stehen unterhalb beider Überschriften)

    //   {{Anmerkung}}
    notice?: fallbackPlaintext;

    //   {{Alternative Schreibweisen}}
    //   Für eine abweichende Platzierung siehe auch Hilfe:Vor- und Nachnamen und hinsichtlich einer speziellen Vorgabe für den Inhalt Hilfe:Schweiz und Liechtenstein.
    alternativeSpelling?: fallbackPlaintext ;

    //   {{Nicht mehr gültige Schreibweisen}} ersetzt die frühere Vorlage {{Veraltete Schreibweisen}}
    oldSpelling?: fallbackPlaintext;
    //   {{Nebenformen}}

    //   {{Worttrennung}}
    hyphen: Hyphen[] = [];

    //   {{in arabischer Schrift}}
    //   {{in kyrillischer Schrift}}
    //   {{in lateinischer Schrift}}
    //   {{Strichreihenfolge}}
    //   {{Vokalisierung}}

    //   {{Umschrift}}
    transcript: fallbackPlaintext[] = [];

    //   {{Aussprache}}
    pronunciation?: Pronunciation;  // for

    //   {{Grammatische Merkmale}}
    grammaticalNote?: fallbackPlaintext; // for now render as plain text

    //   {{Bedeutungen}}
    sense: Sense[] = [];

    //   {{Abkürzungen}}
    abbreviations: Abbreviation[] = [];
    //   {{Symbole}}
    //   {{Herkunft}}
    //   {{Wortfamilie}}
    //   {{Synonyme}}
    //   {{Sinnverwandte Wörter}} / {{Sinnverwandte Zeichen}} / {{Sinnverwandte Redewendungen}}
    //   {{Gegenwörter}}
    //   {{Weibliche Wortformen}}
    //   {{Männliche Wortformen}}
    //   {{Verkleinerungsformen}}
    //   {{Vergrößerungsformen}}
    //   {{Oberbegriffe}}
    //   {{Unterbegriffe}}
    //   {{Verbandsbegriffe}} / {{Holonyme}}
    //   {{Teilbegriffe}} / {{Meronyme}}
    //   {{Kurzformen}}
    //   {{Koseformen}}
    //   {{Namensvarianten}}
    //   {{Weibliche Namensvarianten}}
    //   {{Männliche Namensvarianten}}
    //   {{Bekannte Namensträger}}

    //   {{Beispiele}}
    examples: Example[] = [];

    //   {{Redewendungen}}
    phrase: string[] = [];
    //   {{Sprichwörter}}
    //   {{Charakteristische Wortkombinationen}}
    //   {{Wortbildungen}}
    //   {{Entlehnungen}}
    //   {{Lemmaverweis}}

    constructor(pos:PartOfSpeech) {
        this.partofSpeech = pos;
    }
}

export class PartOfSpeech {
    pos: string[] = [];
    addition:string[] = []; // Not implemented for now
}


export interface Kasus {
    singular:string[];
    plural:string[];
}
export class SubstantivFlexion {
    static title:string = "Deutsch Substantiv Übersicht";
    // Kasus
    static GENUS = "Genus";
    static NOMINATIV = "Nominativ";
    static GENITIVE = "Genitiv";
    static DATIV = "Dativ";
    static AKKUSATIV = "Akkusativ";
    // Numerus
    static  SINGULAR = "Singular";
    static PLURAL = "Plural";
    // Daten
    genus:string[] = [];
    nominativ : Kasus = {singular:[], plural: []};
    genitiv : Kasus  = {singular:[], plural: []};
    dativ : Kasus = {singular:[], plural: []};
    akkusativ: Kasus = {singular:[], plural: []};
}



export type HyphenType = "_" | "Pl." | "kSg." | "kPl." | "Prät." | "Part." | "Komp." | "Sup." | "kSt.";
export interface Hyphen {
    type_ : HyphenType;
    hyphen: string[];
}

export class Pronunciation {

    variant:string = "_";
    ipa:string;

    constructor(ipa: string, variant:string = "_") {
        this.variant = variant;
        this.ipa = ipa;
    }
}

export class Abbreviation {
    type_ :string = "_"; // default
    abb: string ;
    constructor(abb:string, type_:string = "_") {
        this.type_ = type_;
        this.abb = abb;
    }
}

export class Sense {
    catalog:string = "_";
    text: string;

    constructor(text:string, cat:string = "_") {
        this.catalog = cat;
        this.text = text;
    }
}

export class Example {
    ofSense:number[] = [];
    origin: string;
    translate: string|undefined = undefined;
    constructor(ofSense:number[], origin:string, translate:string|undefined=undefined) {
        this.ofSense = [...ofSense];
        this.origin = origin;
        this.translate = translate;
    }
}

export interface EndTeil {
    //TODO
}

export type fallbackPlaintext = string;




export enum Lang {
    en = "Englisch",
    de = "Deutsch"
}


export class WikiPage {
    kopf: Kopf;
    mittelTeil?: MittelTeil;
    endTeil: EndTeil|undefined = undefined;
    constructor(kopf:Kopf) {
        this.kopf = kopf;
    }
}

export class Kopf {
    title: string;
    language: string;
    partOfSpeech: string[];
    constructor(title:string, language:string, pos:string[]=[]) {
        this.title = title;
        this.language = language;
        this.partOfSpeech = pos;
    }
}

export class MittelTeil {

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
    genus:string = "";
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




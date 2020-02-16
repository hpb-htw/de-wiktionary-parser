export enum Lang {
    en = "Englisch",
    de = "Deutsch"
}

export const UEBERSETZUNGS_TABELL = "{{Ü-Tabelle|Ü-links=";

export namespace WikiBlockName {
    export const Lesungen = "{{Lesungen}}",
        Anmerkung = "{{Anmerkung}}",
        Alternative_Schreibweisen="{{Alternative Schreibweisen}}",
        Nicht_mehr_gueltige_Schreibweisen="{{Nicht mehr gültige Schreibweisen}}",
        Veraltete_Schreibweisen = "{{Veraltete Schreibweisen}}",
        Nebenformen = "{{Nebenformen}}",
        Worttrennung = "{{Worttrennung}}",
        in_arabischer_Schrift= "{{in arabischer Schrift}}",
        in_kyrillischer_Schrift = "{{in kyrillischer Schrift}}",
        in_lateinischer_Schrift = "{{in lateinischer Schrift}}",
        Strichreihenfolge= "{{Strichreihenfolge}}",
        Vokalisierung= "{{Vokalisierung}}",
        Umschrift= "{{Umschrift}}",
        Aussprache= "{{Aussprache}}",
        Grammatische_Merkmale= "{{Grammatische Merkmale}}",
        Bedeutungen = "{{Bedeutungen}}",
        Abkuerzungen = "{{Abkürzungen}}",
        Symbole = "{{Symbole}}",
        Herkunft= "{{Herkunft}}",
        Wortfamilie = "{{Wortfamilie}}",
        Synonyme= "{{Synonyme}}",

        Sinnverwandte_Woerter = "{{Sinnverwandte Wörter}}",
        Sinnverwandte_Zeichen = "{{Sinnverwandte Zeichen}}",
        Sinnverwandte_Redewendungen = "{{Sinnverwandte Redewendungen}}",

        Gegenwoerter = "{{Gegenwörter}}",
        Weibliche_Wortformen = "{{Weibliche Wortformen}}",
        Maennliche_Wortformen = "{{Männliche Wortformen}}",
        Verkleinerungsformen= "{{Verkleinerungsformen}}",
        Vergroeßerungsformen= "{{Vergrößerungsformen}}",
        Oberbegriffe= "{{Oberbegriffe}}",
        Unterbegriffe= "{{Unterbegriffe}}",

        Verbandsbegriffe= "{{Verbandsbegriffe}}",
        Holonyme= "{{Holonyme}}",

        Teilbegriffe= "{{Teilbegriffe}}",
        Meronyme= "{{Meronyme}}",

        Kurzformen= "{{Kurzformen}}",
        Koseformen= "{{Koseformen}}",
        Namensvarianten= "{{Namensvarianten}}",
        Weibliche_Namensvarianten= "{{Weibliche Namensvarianten}}",
        Maennliche_Namensvarianten= "{{Männliche Namensvarianten}}",
        Bekannte_Namenstraeger= "{{Bekannte Namensträger}}",
        Beispiele= "{{Beispiele}}",
        Redewendungen= "{{Redewendungen}}",
        Sprichwoerter= "{{Sprichwörter}}",
        Charakteristische_Wortkombinationen= "{{Charakteristische Wortkombinationen}}",
        Wortbildungen= "{{Wortbildungen}}",
        Entlehnungen= "{{Entlehnungen}}",
        Lemmaverweis= "{{Lemmaverweis}}",

        Aehnlichkeiten = "{{Ähnlichkeiten}}",
        Aehnlichkeiten_1= "{{Ähnlichkeiten 1}}",
        Aehnlichkeiten_2= "{{Ähnlichkeiten 2}}";
    // Exceptional: Übersetzung
    export const Uebungsetzungen = "{{Übersetzungen}}";
}

// this can be used as map table or as a set to check if a simple template exists
// the values of map are just explanation about the key, one can use other text for generate view of wiki entry
export const WikiSimpleTemplate = {
    "{{Akk.}}":"{{Akk.}}" ,
    "{{Dat.}}":"{{Dat.}}" ,
    "{{Du.}}":"{{Du.}}" ,
    "{{Fem.}}":"{{Fem.}}" ,
    "{{Gen.}}":"{{Gen.}}" ,

    "{{IPA}}":"{{IPA}}" ,
    "{{Imp.}}":"{{Imp.}}" ,
    "{{Impf.}}":"{{Impf.}}" ,
    "{{Komp.1}}":"{{Komp.1}}" ,
    "{{Komp.2}}":"{{Komp.2}}" ,
    "{{Komp.}}":"{{Komp.}}" ,
    "{{Mask.}}":"{{Mask.}}" ,
    "{{Neutr.}}":"{{Neutr.}}" ,
    "{{PPerf.}}":"{{PPerf.}}" ,
    "{{PPräs.}}":"{{PPräs.}}" ,
    "{{Part.}}":"{{Part.}}" ,

    "{{Pl.1}}":"{{Pl.1}}" ,
    "{{Pl.2}}":"{{Pl.2}}" ,
    "{{Pl.3}}":"{{Pl.3}}" ,
    "{{Pl.4}}":"{{Pl.4}}" ,
    "{{Pl.}}":"{{Pl.}}" ,
    "{{Pl}}":"{{Pl}}" ,
    "{{Pos.}}":"{{Pos.}}" ,
    "{{Präs.}}":"{{Präs.}}" ,
    "{{Prät.}}":"{{Prät.}}" ,
    "{{Sg.1}}":"{{Sg.1}}" ,
    "{{Sg.2}}":"{{Sg.2}}" ,
    "{{Sp.}}":"{{Sp.}}" ,
    "{{Sup.1}}":"{{Sup.1}}" ,
    "{{Sup.2}}":"{{Sup.2}}" ,
    "{{Sup.}}":"{{Sup.}}" ,

    "{{attr.}}":"{{attr.}}" ,
    "{{f}}":"{{f}}" ,
    "{{kP.}}":"{{kP.}}" ,
    "{{kPl.}}":"{{kPl.}}" ,
    "{{kPl..}}":"{{kPl..}}" ,
    "{{kPl}}":"{{kPl}}" ,
    "{{kSg.}}":"{{kSg.}}" ,
    "{{kSt.}}":"{{kSt.}}" ,
    "{{m}}":"{{m}}" ,
    "{{part.}}":"{{part.}}" ,

    "{{ugs.}}":"{{ugs.}}" ,
    "{{österr.}}":"{{österr.}}" ,
};


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

    flexion?: Flexion;

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

/**
 * these flexions need an argument ???
 * */
export const FlexionTemplate:string[] = [
    // Possessiv Pronomen
    "{{Deutsch Possessivpronomen|mein}}",
    "{{Deutsch Possessivpronomen|sein}}"
];


export class Flexion {
    // intend to be empty
}
export interface Kasus {
    singular:string[];
    plural:string[];
}
export class SubstantivFlexion extends Flexion {
    static substantiv:string = "Deutsch Substantiv Übersicht";
    static vorname: string = "Deutsch Vorname Übersicht";
    static posibleTitle:string[] = [
        SubstantivFlexion.substantiv,
        SubstantivFlexion.vorname
    ];
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

    static testFlexion(title:string):boolean {
        for(let subtitle of this.posibleTitle) {
            if (title.includes(subtitle)) {
                return true;
            }
        }
        return false;
    }
}

export class VornameFlexion extends SubstantivFlexion {
    static title:string = SubstantivFlexion.vorname;
}

export class PersonalpronomenFlexion extends Flexion {

    wikiTemplate :string;
    constructor(wikiTemplate:string) {
        super();
        this.wikiTemplate = wikiTemplate;
    }

    static personalpromomen:string[] = [
        "{{Deutsch Personalpronomen 1}}",
        "{{Deutsch Personalpronomen 3}}"
    ];
    static testFlexion(title:string):boolean {
        return PersonalpronomenFlexion.personalpromomen.includes(title.trim());
    }
}

export class Hyphen {
    form : string = "";
    additionalInformation: string = "";
    syllable: string[] = [];
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


/**
 * Flexion templates which have fixed content. This is just a merge from all Flexion
 * with fixed template; for now is only Personal Pronomen
 *
 * */
export const FlexionFixTemplate:string[] =
    PersonalpronomenFlexion.personalpromomen;

export interface EndTeil {
    //TODO
}

export type fallbackPlaintext = string;




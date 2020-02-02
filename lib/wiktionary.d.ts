export declare type Entry = {
    /**
     * unique id of the entry in a dictionary
     */
    id: number;
    /**
     * title of the wiki page
     */
    title: string;
    /**
     * text description about the entry
     */
    text: string;
};
/**
 * parse a XML dump file from http://dumps.wikimedia.org/backup-index.html
 * Result of this function is a Promise. See Unit test for Usage.
 *
 */
export declare function parseWikiXml(dumpFile: string, collectNewEntry: (entry: Entry) => Promise<any>): Promise<number>;
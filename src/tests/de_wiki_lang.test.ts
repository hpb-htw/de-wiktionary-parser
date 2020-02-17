import {VornameFlexion} from "../de_wiki_lang";

describe("VornameFlexion", ()=>{
   test("testFlexion '{{Deutsch Vorname Übersicht m'", () =>{
      let title = "'{{Deutsch Vorname Übersicht m'";
      let isFlexion = VornameFlexion.testFlexion(title);
      expect(isFlexion).toStrictEqual(true);
   });

    test("testFlexion '{{Deutsch Vorname Übersicht f'", () =>{
        let title = "'{{Deutsch Vorname Übersicht f'";
        let isFlexion = VornameFlexion.testFlexion(title);
        expect(isFlexion).toStrictEqual(true);
    });
});
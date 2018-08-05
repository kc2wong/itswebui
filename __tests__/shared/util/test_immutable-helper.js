import { Currency } from 'app/model/staticdata';
import update from 'immutability-helper';

describe("Test immutable-helper", () => {
    
    test("Test parseBool with boolean input parameter", () => {
        const hkd = new Currency("HKD", "hong kong dollar", 1);
        const hkdJson = hkd.toJson();

        const attr = "descptDefLang";
        const hkdJsonClone = update(hkdJson, {[attr]: {$set: "Hong Kong Dollar"}});

        const hkdClone = Currency.fromJson(hkdJsonClone);
        expect(hkdJson).not.toBe(hkdJsonClone);
        expect(hkd.descptDefLang).toBe("hong kong dollar");
        expect(hkdJson.descptDefLang).toBe("hong kong dollar");
        expect(hkdClone.descptDefLang).toBe("Hong Kong Dollar");
        expect(hkdJsonClone.descptDefLang).toBe("Hong Kong Dollar");
    });

});
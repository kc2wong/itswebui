import { parseBool } from 'shared/util/lang';

describe("Test lang.js", () => {
    
    test("Test parseBool with boolean input parameter", () => {
        expect(parseBool(true)).toBe(true)        
        expect(parseBool(false)).toBe(false)
    });

    test("Test parseBool with string input parameter", () => {
        expect(parseBool("true")).toBe(true)        
        expect(parseBool("True")).toBe(true)        
        expect(parseBool("TRUE")).toBe(true)        
        expect(parseBool("false")).toBe(false)
        expect(parseBool("False")).toBe(false)
        expect(parseBool("FALSE")).toBe(false)
    });

    test("Test parseBool with for default value", () => {
        const obj = {}
        expect(parseBool("aaa")).toBe(false)        
        expect(parseBool(null)).toBe(false)        
        expect(parseBool(null, true)).toBe(true)        
        expect(parseBool(obj.a)).toBe(false)        
        expect(parseBool(obj.a, true)).toBe(true)        
    });
    
});
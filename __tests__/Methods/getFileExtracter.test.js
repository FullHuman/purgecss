import Purgecss from "./../../src/index"
import {
    PurifyCssExtracterDefault,
    PurifyCssExtracterEjs,
    PurifyCssExtracterHtml,
    PurifyCssExtracterJs,
    PurifyCssExtracterMissingMethods,
    PurifyCssExtracterMissingParams,
    PurifyCssExtracterPug
} from "./getFileExtracterData"

import {
    TEST_1,
    TEST_1_EXPECTED,
    TEST_1_FILENAME,
    TEST_2,
    TEST_2_FILENAME,
    TEST_2_EXPECTED,
    TEST_3_FILENAME,
    TEST_3_EXPECTED,
    TEST_4_FILENAME,
    TEST_4_EXPECTED,
    TEST_5_FILENAME,
    TEST_5_EXPECTED,
    TEST_6_FILENAME,
    TEST_6_EXPECTED,
    TEST_7
} from "./getFileExtracterData"

describe("getFileExtracter", () => {
    it("should return the html extractor", () => {
        const purgecss = new Purgecss({
            content: ["./test.html"],
            css: ["./test.css"]
        })
        const expected = TEST_1_EXPECTED
        const received = purgecss.getFileExtracter(TEST_1_FILENAME, TEST_1)
        expect(received).toEqual(expected)
    })
    it("should return the html extracter", () => {
        const purgecss = new Purgecss({
            content: ["./test.html"],
            css: ["./test.css"]
        })
        const expected = TEST_2_EXPECTED
        const received = purgecss.getFileExtracter(TEST_2_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it("should return the js extracter", () => {
        const purgecss = new Purgecss({
            content: ["./test.html"],
            css: ["./test.css"]
        })
        const expected = TEST_3_EXPECTED
        const received = purgecss.getFileExtracter(TEST_3_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it("should return the pug extracter", () => {
        const purgecss = new Purgecss({
            content: ["./test.html"],
            css: ["./test.css"]
        })
        const expected = TEST_4_EXPECTED
        const received = purgecss.getFileExtracter(TEST_4_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it("should return the pug extracter", () => {
        const purgecss = new Purgecss({
            content: ["./test.html"],
            css: ["./test.css"]
        })
        const expected = TEST_5_EXPECTED
        const received = purgecss.getFileExtracter(TEST_5_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it("should return the ejs extracter", () => {
        const purgecss = new Purgecss({
            content: ["./test.html"],
            css: ["./test.css"]
        })
        const expected = TEST_6_EXPECTED
        const received = purgecss.getFileExtracter(TEST_6_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it("should throw an error for failing extractor", () => {
        const purgecss = new Purgecss({
            content: [
                "./__tests__/test_examples/attribute_selector/attribute_selector.html"
            ],
            css: [
                "./__tests__/test_examples/attribute_selector/attribute_selector.css"
            ],
            extracters: TEST_7
        })
        expect(() => {
            purgecss.purge()
        }).toThrow(Error)
    })
    it("should throw an error for wrong extractor definition", () => {
        expect(() => {
            const purgecss = new Purgecss({
                content: ["./test.html"],
                css: ["./test.css"],
                extracters: TEST_7
            })
            purgecss.purge()
        }).toThrow()
    })
})

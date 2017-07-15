import Purgecss from './../../src/index'
import {
    PurgecssExtractorDefault,
    PurgecssExtractorEjs,
    PurgecssExtractorHtml,
    PurgecssExtractorJs,
    PurgecssExtractorMissingMethods,
    PurgecssExtractorMissingParams,
    PurgecssExtractorPug
} from './getFileExtractorData'

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
} from './getFileExtractorData'

describe('getFileExtractor', () => {
    it('should return the html extractor', () => {
        const purgecss = new Purgecss({
            content: ['./test.html'],
            css: ['./test.css']
        })
        const expected = TEST_1_EXPECTED
        const received = purgecss.getFileExtractor(TEST_1_FILENAME, TEST_1)
        expect(received).toEqual(expected)
    })
    it('should return the html extractor', () => {
        const purgecss = new Purgecss({
            content: ['./test.html'],
            css: ['./test.css']
        })
        const expected = TEST_2_EXPECTED
        const received = purgecss.getFileExtractor(TEST_2_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it('should return the js extractor', () => {
        const purgecss = new Purgecss({
            content: ['./test.html'],
            css: ['./test.css']
        })
        const expected = TEST_3_EXPECTED
        const received = purgecss.getFileExtractor(TEST_3_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it('should return the pug extractor', () => {
        const purgecss = new Purgecss({
            content: ['./test.html'],
            css: ['./test.css']
        })
        const expected = TEST_4_EXPECTED
        const received = purgecss.getFileExtractor(TEST_4_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it('should return the pug extractor', () => {
        const purgecss = new Purgecss({
            content: ['./test.html'],
            css: ['./test.css']
        })
        const expected = TEST_5_EXPECTED
        const received = purgecss.getFileExtractor(TEST_5_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it('should return the ejs extractor', () => {
        const purgecss = new Purgecss({
            content: ['./test.html'],
            css: ['./test.css']
        })
        const expected = TEST_6_EXPECTED
        const received = purgecss.getFileExtractor(TEST_6_FILENAME, TEST_2)
        expect(received).toEqual(expected)
    })
    it('should throw an error for failing extractor', () => {
        const purgecss = new Purgecss({
            content: ['./__tests__/test_examples/attribute_selector/attribute_selector.html'],
            css: ['./__tests__/test_examples/attribute_selector/attribute_selector.css'],
            extractors: TEST_7
        })
        expect(() => {
            purgecss.purge()
        }).toThrow(Error)
    })
    it('should throw an error for wrong extractor definition', () => {
        expect(() => {
            const purgecss = new Purgecss({
                content: ['./test.html'],
                css: ['./test.css'],
                extractors: TEST_7
            })
            purgecss.purge()
        }).toThrow()
    })
})

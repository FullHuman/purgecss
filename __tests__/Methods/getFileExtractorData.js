export class PurgecssExtractorHtml {
    static extract(content) {}
}

export class PurgecssExtractorJs {
    static extract(content) {}
}

export class PurgecssExtractorPug {
    static extract(content) {}
}

export class PurgecssExtractorEjs {
    static extract(content) {}
}

export class PurgecssExtractorDefault {
    static extract(content) {}
}

export class PurgecssExtractorFailure {
    static extract() {
        return null
    }
}

export class PurgecssExtractorMissingMethods {
    static extrct() {}
}

export const TEST_1 = [
    {
        extractor: PurgecssExtractorHtml,
        extensions: ['html']
    }
]

export const TEST_1_FILENAME = 'hello.html'
export const TEST_1_EXPECTED = PurgecssExtractorHtml

export const TEST_2 = [
    {
        extractor: PurgecssExtractorHtml,
        extensions: ['html']
    },
    {
        extractor: PurgecssExtractorEjs,
        extensions: ['ejs']
    },
    {
        extractor: PurgecssExtractorJs,
        extensions: ['js']
    },
    {
        extractor: PurgecssExtractorPug,
        extensions: ['pug', 'jade']
    }
]
export const TEST_2_FILENAME = 'hello.html'
export const TEST_3_FILENAME = 'hello.js'
export const TEST_4_FILENAME = 'hello.pug'
export const TEST_5_FILENAME = 'hello.jade'
export const TEST_6_FILENAME = 'hello.ejs'

export const TEST_2_EXPECTED = PurgecssExtractorHtml
export const TEST_3_EXPECTED = PurgecssExtractorJs
export const TEST_4_EXPECTED = PurgecssExtractorPug
export const TEST_5_EXPECTED = PurgecssExtractorPug
export const TEST_6_EXPECTED = PurgecssExtractorEjs

export const TEST_7 = [
    {
        extractor: PurgecssExtractorFailure,
        extensions: ['html']
    },
    {
        extractor: PurgecssExtractorMissingMethods,
        extensions: ['js']
    },
    {
        extractor: () => {},
        extensions: ['pug', 'jade']
    },
    {
        extractor: PurgecssExtractorEjs,
        extensions: ['ejs']
    }
]

export const TEST_7_FILENAME = 'hello.html'
export const TEST_8_FILENAME = 'hello.js'

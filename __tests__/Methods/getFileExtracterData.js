export class PurgecssExtracterHtml {
    static extract(content) {}
}

export class PurgecssExtracterJs {
    static extract(content) {}
}

export class PurgecssExtracterPug {
    static extract(content) {}
}

export class PurgecssExtracterEjs {
    static extract(content) {}
}

export class PurgecssExtracterDefault {
    static extract(content) {}
}

export class PurgecssExtracterFailure {
    static extract() {
        return null
    }
}

export class PurgecssExtracterMissingMethods {
    static extrct() {}
}

export const TEST_1 = [
    {
        extracter: PurgecssExtracterHtml,
        extensions: ['html']
    }
]

export const TEST_1_FILENAME = 'hello.html'
export const TEST_1_EXPECTED = PurgecssExtracterHtml

export const TEST_2 = [
    {
        extracter: PurgecssExtracterHtml,
        extensions: ['html']
    },
    {
        extracter: PurgecssExtracterEjs,
        extensions: ['ejs']
    },
    {
        extracter: PurgecssExtracterJs,
        extensions: ['js']
    },
    {
        extracter: PurgecssExtracterPug,
        extensions: ['pug', 'jade']
    }
]
export const TEST_2_FILENAME = 'hello.html'
export const TEST_3_FILENAME = 'hello.js'
export const TEST_4_FILENAME = 'hello.pug'
export const TEST_5_FILENAME = 'hello.jade'
export const TEST_6_FILENAME = 'hello.ejs'

export const TEST_2_EXPECTED = PurgecssExtracterHtml
export const TEST_3_EXPECTED = PurgecssExtracterJs
export const TEST_4_EXPECTED = PurgecssExtracterPug
export const TEST_5_EXPECTED = PurgecssExtracterPug
export const TEST_6_EXPECTED = PurgecssExtracterEjs

export const TEST_7 = [
    {
        extracter: PurgecssExtracterFailure,
        extensions: ['html']
    },
    {
        extracter: PurgecssExtracterMissingMethods,
        extensions: ['js']
    },
    {
        extracter: () => {},
        extensions: ['pug', 'jade']
    },
    {
        extracter: PurgecssExtracterEjs,
        extensions: ['ejs']
    }
]

export const TEST_7_FILENAME = 'hello.html'
export const TEST_8_FILENAME = 'hello.js'

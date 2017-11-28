import Purgecss from './../src/index'
const root = './__tests__/test_examples/'

describe('purge methods with files and default extractor', () => {
    it('purge correctly with default extractor', () => {
        const purgeCss = new Purgecss({
            content: ['./__tests__/test_examples/attribute_selector/attribute_selector.html'],
            css: ['./__tests__/test_examples/attribute_selector/attribute_selector.css']
        })
        const received = purgeCss.purge()[0].css
        expect(received.includes('.ui.grid')).toBe(true)
    })

    describe('purge correctly (find intact classes) with default extractor', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`]
            }).purge()[0].css
        })
        it('finds .single', () => {
            expect(purgecssResult.includes('.single')).toBe(true)
        })

        it('finds .double-class', () => {
            expect(purgecssResult.includes('.double-class')).toBe(true)
        })

        it('can find .triple-simple-class', () => {
            expect(purgecssResult.includes('.triple-simple-class')).toBe(true)
        })
    })

    describe('filters out unused selectors', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`]
            }).purge()[0].css
        })
        it('contains .used-class', () => {
            expect(purgecssResult.includes('.used-class')).toBe(true)
        })

        it('removes .unused-class', () => {
            expect(purgecssResult.includes('.unused-class')).toBe(false)
        })

        it('removes .another-one-not-found', () => {
            expect(purgecssResult.includes('.another-one-not-found')).toBe(false)
        })
    })

    describe('camelCase', () => {
        it('finds testFoo', () => {
            const purgecss = new Purgecss({
                content: [`${root}camel_case/camel_case.js`],
                css: [`${root}camel_case/camel_case.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('testFoo')).toBe(true)
        })

        it('finds camelCase', () => {
            const purgecss = new Purgecss({
                content: [`${root}camel_case/camel_case.js`],
                css: [`${root}camel_case/camel_case.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('camelCase')).toBe(true)
        })
    })

    describe('wildcard', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`]
            }).purge()[0].css
        })
        it('finds universal selector', () => {
            expect(purgecssResult.includes('*')).toBe(true)
        })

        it('finds :before', () => {
            expect(purgecssResult.includes('before')).toBe(true)
        })

        it('finds scrollbar', () => {
            expect(purgecssResult.includes('scrollbar')).toBe(true)
        })

        it('finds selection', () => {
            expect(purgecssResult.includes('selection')).toBe(true)
        })

        it('finds vertical', () => {
            expect(purgecssResult.includes('vertical')).toBe(true)
        })

        it('finds :root', () => {
            expect(purgecssResult.includes(':root')).toBe(true)
        })
    })

    describe('media queries', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`]
            }).purge()[0].css
        })
        it('finds .media-class', () => {
            expect(purgecssResult.includes('.media-class')).toBe(true)
        })

        it('finds .alone', () => {
            expect(purgecssResult.includes('.alone')).toBe(true)
        })

        it('finds #id-in-media', () => {
            expect(purgecssResult.includes('#id-in-media')).toBe(true)
        })

        it('finds body', () => {
            expect(purgecssResult.includes('body')).toBe(true)
        })

        it('removes .unused-class', () => {
            expect(purgecssResult.includes('.unused-class')).toBe(false)
        })

        it('removes the empty media query', () => {
            expect(purgecssResult.includes('66666px')).toBe(false)
        })
    })

    describe('delimited', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`]
            }).purge()[0].css
        })
        it('removes the extra comma', () => {
            const commaCount = purgecssResult
                .split('')
                .reduce((total, chr) => (chr === ',' ? total + 1 : total), 0)

            expect(commaCount).toBe(0)
        })

        it('finds h1', () => {
            expect(purgecssResult.includes('h1')).toBe(true)
        })

        it('removes p', () => {
            expect(purgecssResult.includes('p')).toBe(false)
        })

        it('removes .unused-class-name', () => {
            expect(purgecssResult.includes('.unused-class-name')).toBe(false)
        })
    })

    describe('pseudo classes', () => {
        it('finds div:before', () => {
            const purgecss = new Purgecss({
                content: [`${root}pseudo_class/pseudo_class.js`],
                css: [`${root}pseudo_class/pseudo_class.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('div:before')).toBe(true)
        })

        it('removes row:after', () => {
            const purgecss = new Purgecss({
                content: [`${root}pseudo_class/pseudo_class.js`],
                css: [`${root}pseudo_class/pseudo_class.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('row:after')).toBe(false)
        })
    })

    describe('ignore comment', () => {
        it('ignore h1', () => {
            const purgecss = new Purgecss({
                content: [`${root}ignore_comment/ignore_comment.html`],
                css: [`${root}ignore_comment/ignore_comment.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('h1')).toBe(true)
        })
    })

    describe('font-face', () => {
        it('keeps font-face', () => {
            const purgecss = new Purgecss({
                content: [`${root}font_face/font_face.html`],
                css: [`${root}font_face/font_face.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('font-face')).toBe(true)
        })
    })

    describe('chaining rules', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}chaining_rules/index.html`],
                css: [`${root}chaining_rules/index.css`]
            }).purge()[0].css
        })
        it('keep parent1 selector', () => {
            expect(purgecssResult.includes('parent1')).toBe(true)
        })
        it('remove parent3 selector', () => {
            expect(purgecssResult.includes('parent3')).toBe(false)
        })
        it('remove d33ef1 selector', () => {
            expect(purgecssResult.includes('d33ef1')).toBe(false)
        })
        it('remove .parent2', () => {
            expect(purgecssResult.includes('parent2')).toBe(false)
        })
    })
})

describe('purge methods with raw content and default extractor', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [
                {
                    raw: '<span class="double-class"></span>',
                    extension: 'html'
                }
            ],
            css: [
                {
                    raw: `.single {color: black;}
                    .double-class {color: black;}`
                }
            ]
        }).purge()[0].css
    })
    it('remove .single', () => {
        expect(purgecssResult.includes('single')).toBe(false)
    })
    it('keep .double-class', () => {
        expect(purgecssResult.includes('double-class')).toBe(true)
    })
})

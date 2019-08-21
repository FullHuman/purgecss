import Purgecss from './../src/index'
const root = './__tests__/test_examples/'

describe('purge methods with files and default extractor', () => {
    it('purges correctly with default extractor', () => {
        const purgeCss = new Purgecss({
            content: ['./__tests__/test_examples/attribute_selector/attribute_selector.html'],
            css: ['./__tests__/test_examples/attribute_selector/attribute_selector.css']
        })
        const received = purgeCss.purge()[0].css
        expect(received.includes('.ui.grid')).toBe(true)
    })

    it('uses default extractor if no other extractor matches', () => {
        const purgeCss = new Purgecss({
            content: ['./__tests__/test_examples/attribute_selector/attribute_selector.html'],
            css: ['./__tests__/test_examples/attribute_selector/attribute_selector.css'],
            extractors: [
                {
                    extractor: undefined,
                    extensions: ['never_heard_of_please_use_default']
                }
            ]
        })
        const received = purgeCss.purge()[0].css
        expect(received.includes('.ui.grid')).toBe(true)
    })

    describe('purges correctly (find intact classes) with default extractor', () => {
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
        let purgecssResult
        beforeAll(() => {
            const purgecss = new Purgecss({
                content: [`${root}ignore_comment/ignore_comment.html`],
                css: [`${root}ignore_comment/ignore_comment.css`]
            })
            purgecssResult = purgecss.purge()[0].css
        })
        it('ignores h1', () => {
            expect(purgecssResult.includes('h1')).toBe(true)
        })

        it('removes the comment', () => {
            expect(purgecssResult.includes('/* purgecss ignore */')).toBe(false)
        })
    })

    describe('ignore comment range', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}ignore_comment_range/index.html`],
                css: [`${root}ignore_comment_range/index.css`]
            }).purge()[0].css
        })

        it('ignores h1, h3, h5, h6', () => {
            ;['h1', 'h3', 'h5', 'h6'].forEach(selector => {
                expect(purgecssResult.includes(selector)).toBe(true)
            })
        })

        it('removes h4', () => {
            expect(purgecssResult.includes('h4')).toBe(false)
        })

        it('removes the comments', () => {
            expect(purgecssResult.includes('/* purgecss start ignore */')).toBe(false)
            expect(purgecssResult.includes('/* purgecss end ignore */')).toBe(false)
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
        it('keeps parent1 selector', () => {
            expect(purgecssResult.includes('parent1')).toBe(true)
        })
        it('removes parent3 selector', () => {
            expect(purgecssResult.includes('parent3')).toBe(false)
        })
        it('removes d33ef1 selector', () => {
            expect(purgecssResult.includes('d33ef1')).toBe(false)
        })
        it('removes .parent2', () => {
            expect(purgecssResult.includes('parent2')).toBe(false)
        })
    })

    describe('attributes selectors', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}attribute_selector/attribute_selector.html`],
                css: [`${root}attribute_selector/attribute_selector.css`]
            }).purge()[0].css
        })

        it('keeps flexgrid', () => {
            expect(purgecssResult.includes('flexgrid {')).toBe(true)
        })

        it('keeps flexgrid[class*=', () => {
            expect(purgecssResult.includes('flexgrid[class*=')).toBe(true)
        })

        it('removes a.link', () => {
            expect(purgecssResult.includes('a.link')).toBe(false)
        })

        it('conserves empty attributes', () => {
            expect(purgecssResult.includes('input[value=""]')).toBe(true)
        })
    })

    describe('tables', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}tables/tables.html`],
                css: [`${root}tables/tables.css`]
            }).purge()[0].css
        })

        it('keeps css', () => {
            expect(purgecssResult.includes('white-space')).toBe(true)
        })
    })

    // Keyframe tests
    describe('purge unused keyframe animations', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}keyframes/index.html`],
                css: [`${root}keyframes/index.css`],
                keyframes: true
            }).purge()[0].css
        })
        it('removes `@keyframes flashAni`', () => {
            expect(purgecssResult.includes('@keyframes flashAni')).toBe(false)
        })
        it('keeps `@keyframes rotateAni`', () => {
            expect(purgecssResult.includes('@keyframes rotateAni')).toBe(true)
        })
    })

    describe('do not purge keyframes if option set to false', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}keyframes/index.html`],
                css: [`${root}keyframes/index.css`],
                keyframes: false
            }).purge()[0].css
        })
        it('keeps `@keyframes flashAni`', () => {
            expect(purgecssResult.includes('@keyframes flashAni')).toBe(true)
        })
        it('keeps `@keyframes rotateAni`', () => {
            expect(purgecssResult.includes('@keyframes rotateAni')).toBe(true)
        })
    })

    // Font Face
    describe('purge unused font-face', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}font_face/font_face.html`],
                css: [`${root}font_face/font_face.css`],
                fontFace: true
            }).purge()[0].css
        })
        it("keep @font-face 'Cerebri Bold'", () => {
            expect(purgecssResult.includes(`src: url('../fonts/CerebriSans-Bold.eot?')`)).toBe(true)
        })
        it("keep @font-face 'Cerebri Sans'", () => {
            expect(purgecssResult.includes(`src: url('../fonts/CerebriSans-Regular.eot?')`)).toBe(
                true
            )
        })
        it("remove @font-face 'OtherFont'", () => {
            expect(purgecssResult.includes(`src: url('xxx')`)).toBe(false)
        })
    })

    describe('keep keyframe decimals', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [
                    {
                        raw: '<div class="xx"></div>',
                        extension: 'html'
                    }
                ],
                css: [
                    {
                        raw: `
                    @keyframes xxx {
                        0% {opacity: 0;}
                        99.9% {opacity: 1;}
                    }
                    .xx { animation: xxx 200ms linear both }
                    `
                    }
                ],
                keyframes: false
            }).purge()[0].css
        })
        it('keeps `99.9%`', () => {
            expect(purgecssResult.includes('99.9%')).toBe(true)
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
    it('removes .single', () => {
        expect(purgecssResult.includes('single')).toBe(false)
    })
    it('keeps .double-class', () => {
        expect(purgecssResult.includes('double-class')).toBe(true)
    })
})

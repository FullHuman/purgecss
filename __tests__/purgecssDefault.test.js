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
        it('finds .single', () => {
            const purgeCss = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`]
            })
            const result = purgeCss.purge()[0].css
            expect(result.includes('.single')).toBe(true)
        })

        it('finds .double-class', () => {
            const purgeCss = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`]
            })
            const result = purgeCss.purge()[0].css
            expect(result.includes('.double-class')).toBe(true)
        })

        it('can find .triple-simple-class', () => {
            const purgeCss = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`]
            })
            const result = purgeCss.purge()[0].css
            expect(result.includes('.triple-simple-class')).toBe(true)
        })
    })

    describe('filters out unused selectors', () => {
        it('contains .used-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.used-class')).toBe(true)
        })

        it('removes .unused-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.unused-class')).toBe(false)
        })

        it('removes .another-one-not-found', () => {
            const purgecss = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.another-one-not-found')).toBe(false)
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
        it('finds universal selector', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('*')).toBe(true)
        })

        it('finds :before', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('before')).toBe(true)
        })

        it('finds scrollbar', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('scrollbar')).toBe(true)
        })

        it('finds selection', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('selection')).toBe(true)
        })

        it('finds vertical', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('vertical')).toBe(true)
        })

        it('finds :root', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes(':root')).toBe(true)
        })
    })

    describe('media queries', () => {
        it('finds .media-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.media-class')).toBe(true)
        })

        it('finds .alone', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.alone')).toBe(true)
        })

        it('finds #id-in-media', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('#id-in-media')).toBe(true)
        })

        it('finds body', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('body')).toBe(true)
        })

        it('removes .unused-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.unused-class')).toBe(false)
        })

        it('removes the empty media query', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('66666px')).toBe(false)
        })
    })

    describe('delimited', () => {
        it('removes the extra comma', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`]
            })
            const result = purgecss.purge()[0].css
            var commaCount = result.split('').reduce((total, chr) => {
                if (chr === ',') {
                    return total + 1
                }

                return total
            }, 0)

            expect(commaCount).toBe(0)
        })

        it('finds h1', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('h1')).toBe(true)
        })

        it('removes p', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('p')).toBe(false)
        })

        it('removes .unused-class-name', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.unused-class-name')).toBe(false)
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
        it('keep parent1 selector', () => {
            const purgecss = new Purgecss({
                content: [`${root}chaining_rules/index.html`],
                css: [`${root}chaining_rules/index.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('parent1')).toBe(true)
        })
        it('remove parent3 selector', () => {
            const purgecss = new Purgecss({
                content: [`${root}chaining_rules/index.html`],
                css: [`${root}chaining_rules/index.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('parent3')).toBe(false)
        })
        it('remove d33ef1 selector', () => {
            const purgecss = new Purgecss({
                content: [`${root}chaining_rules/index.html`],
                css: [`${root}chaining_rules/index.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('d33ef1')).toBe(false)
        })
        it('remove .parent2', () => {
            const purgecss = new Purgecss({
                content: [`${root}chaining_rules/index.html`],
                css: [`${root}chaining_rules/index.css`]
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('parent2')).toBe(false)
        })
    })
})

describe('purge methods with raw content and default extractor', () => {
    it('remove .remove - content passed', () => {
        const purgecss = new Purgecss({
            content: [
                {
                    raw: '<span class="double-class"></span>',
                    extension: 'html'
                }
            ],
            css: [
                {
                    raw: `
                .single {
                    color: black;
                }

                .double-class {
                    color: black;
                }
                `
                }
            ]
        })
        const result = purgecss.purge()[0].css
        expect(result.includes('single')).toBe(false)
        expect(result.includes('double-class')).toBe(true)
    })
})

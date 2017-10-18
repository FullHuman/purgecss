// import Purgecss from "./../lib/purgecss"
import Purgecss from './../src/index'
const root = './__tests__/test_examples/'

describe('initialize purgecss', () => {
    it('throw an error without options and config file', () => {
        expect(() => {
            new Purgecss()
        }).toThrow(Error)
    })

    it('throw an error without an object options and config file', () => {
        expect(() => {
            new Purgecss(1)
        }).toThrow(TypeError)
        expect(() => {
            new Purgecss('hello')
        }).toThrow(Error)
        expect(() => {
            new Purgecss(false)
        }).toThrow(TypeError)
    })

    it('throws an error without content option', () => {
        expect(() => {
            new Purgecss({})
        }).toThrow()
        expect(() => {
            new Purgecss({
                css: [],
                extractors: []
            })
        }).toThrow()
        expect(() => {
            new Purgecss({ css: ['style.css'] })
        }).toThrow()
    })

    it('throws an error with an empty content array option', () => {
        expect(() => {
            new Purgecss({ content: [] })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: [],
                css: []
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: [],
                css: ['style.css']
            })
        })
    })

    it('throws an error without css option', () => {
        expect(() => {
            new Purgecss({})
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: [],
                extractors: []
            })
        }).toThrow()
        expect(() => {
            new Purgecss({ content: ['index.html'] })
        }).toThrow()
    })

    it('throws an error with an empty css array option', () => {
        expect(() => {
            new Purgecss({ css: [] })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: [],
                css: []
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                css: [],
                content: ['index.html']
            })
        })
    })

    it('throws an error with an incorrect output option', () => {
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                output: {}
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                output: 100
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                output: true
            }).toThrow()
        })
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                output: () => {}
            }).toThrow()
        })
    })

    it('throws an error with an incorrect extractor option', () => {
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                extractors: {}
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                extractors: 100
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                extraters: 'hello'
            }).toThrow()
        })
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                extractors: () => {}
            }).toThrow()
        })
    })

    it('throws an error with an incorrect whitelist option', () => {
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelist: {}
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelist: 100
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelist: 'hello'
            }).toThrow()
        })
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelist: () => {}
            }).toThrow()
        })
    })

    it('throws an error with an incorrect stdout option', () => {
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                stdout: {}
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                stdout: 100
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                stdout: 'hello'
            }).toThrow()
        })
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                stdout: () => {}
            }).toThrow()
        })
    })

    it('throws an error with an incorrect info option', () => {
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                info: {}
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                info: 100
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                info: 'hello'
            }).toThrow()
        })
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                info: () => {}
            }).toThrow()
        })
    })

    it('throws an error with an incorrect rejected option', () => {
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                rejected: {}
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                rejected: 100
            })
        }).toThrow()
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                rejected: 'hello'
            }).toThrow()
        })
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                rejected: () => {}
            }).toThrow()
        })
    })

    it('initialize without error with a config file specified', () => {
        expect(() => {
            new Purgecss('./__tests__/purgecss.config.js')
        }).not.toThrow()
    })
})

describe('purge methods with files and legacy extractor', () => {
    it('purge correctly (legacy)', () => {
        const purgeCss = new Purgecss({
            content: ['./__tests__/test_examples/attribute_selector/attribute_selector.html'],
            css: ['./__tests__/test_examples/attribute_selector/attribute_selector.css'],
            legacy: true
        })
        const received = purgeCss.purge()[0].css
        expect(received.includes('.ui[class*="center aligned"].grid')).toBe(true)
    })

    describe('purge correctly (find intact classes)', () => {
        it('finds .single', () => {
            const purgeCss = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`],
                legacy: true
            })
            const result = purgeCss.purge()[0].css
            expect(result.includes('.single')).toBe(true)
        })

        it('finds .double-class', () => {
            const purgeCss = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`],
                legacy: true
            })
            const result = purgeCss.purge()[0].css
            expect(result.includes('.double-class')).toBe(true)
        })

        it('can find .triple-simple-class', () => {
            const purgeCss = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`],
                legacy: true
            })
            const result = purgeCss.purge()[0].css
            expect(result.includes('.triple-simple-class')).toBe(true)
        })
    })

    describe('classes that are added together', () => {
        it('can find .added-together', () => {
            const purgeCss = new Purgecss({
                content: [`${root}combined/combined.js`],
                css: [`${root}combined/combined.css`],
                legacy: true
            })

            const result = purgeCss.purge()[0].css
            expect(result.includes('.added-together')).toBe(true)
        })

        it('can find .array-joined', () => {
            const purgeCss = new Purgecss({
                content: [`${root}combined/combined.js`],
                css: [`${root}combined/combined.css`],
                legacy: true
            })

            const result = purgeCss.purge()[0].css
            expect(result.includes('.array-joined')).toBe(true)
        })
    })

    describe('filters out unused selectors', () => {
        it('contains .used-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.used-class')).toBe(true)
        })

        it('removes .unused-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.unused-class')).toBe(false)
        })

        it('removes .another-one-not-found', () => {
            const purgecss = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.another-one-not-found')).toBe(false)
        })
    })

    describe('camelCase', () => {
        it('finds testFoo', () => {
            const purgecss = new Purgecss({
                content: [`${root}camel_case/camel_case.js`],
                css: [`${root}camel_case/camel_case.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('testFoo')).toBe(true)
        })

        it('finds camelCase', () => {
            const purgecss = new Purgecss({
                content: [`${root}camel_case/camel_case.js`],
                css: [`${root}camel_case/camel_case.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('camelCase')).toBe(true)
        })
    })

    describe('wildcard', () => {
        it('finds universal selector', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('*')).toBe(true)
        })

        it('finds :before', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('before')).toBe(true)
        })

        it('finds scrollbar', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('scrollbar')).toBe(true)
        })

        it('finds selection', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('selection')).toBe(true)
        })

        it('finds vertical', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('vertical')).toBe(true)
        })

        it('finds :root', () => {
            const purgecss = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes(':root')).toBe(true)
        })
    })

    describe('media queries', () => {
        it('finds .media-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.media-class')).toBe(true)
        })

        it('finds .alone', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.alone')).toBe(true)
        })

        it('finds #id-in-media', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('#id-in-media')).toBe(true)
        })

        it('finds body', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('body')).toBe(true)
        })

        it('removes .unused-class', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.unused-class')).toBe(false)
        })

        it('removes the empty media query', () => {
            const purgecss = new Purgecss({
                content: [`${root}media_queries/media_queries.html`],
                css: [`${root}media_queries/media_queries.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('66666px')).toBe(false)
        })
    })

    describe('special characters', () => {
        it('finds @home', () => {
            const purgecss = new Purgecss({
                content: [`${root}special_characters/special_characters.js`],
                css: [`${root}special_characters/special_characters.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('@home')).toBe(true)
        })

        it('finds +rounded', () => {
            const purgecss = new Purgecss({
                content: [`${root}special_characters/special_characters.js`],
                css: [`${root}special_characters/special_characters.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('+rounded')).toBe(true)
        })

        it('finds button', () => {
            const purgecss = new Purgecss({
                content: [`${root}special_characters/special_characters.js`],
                css: [`${root}special_characters/special_characters.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('button')).toBe(true)
        })
    })

    describe('delimited', () => {
        it('removes the extra comma', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            var commaCount = result.split('').reduce((total, chr) => {
                if (chr === ',') {
                    return total + 1
                }

                return total
            }, 0)

            expect(commaCount).toBe(1)
        })

        it('finds h1', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('h1')).toBe(true)
        })

        it('finds p', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('p')).toBe(true)
        })

        it('removes .unused-class-name', () => {
            const purgecss = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('.unused-class-name')).toBe(false)
        })
    })

    describe('pseudo classes', () => {
        it('finds div:before', () => {
            const purgecss = new Purgecss({
                content: [`${root}pseudo_class/pseudo_class.js`],
                css: [`${root}pseudo_class/pseudo_class.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('div:before')).toBe(true)
        })

        it('removes row:after', () => {
            const purgecss = new Purgecss({
                content: [`${root}pseudo_class/pseudo_class.js`],
                css: [`${root}pseudo_class/pseudo_class.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('row:after')).toBe(false)
        })
    })

    describe('ignore comment', () => {
        it('ignore h1', () => {
            const purgecss = new Purgecss({
                content: [`${root}ignore_comment/ignore_comment.html`],
                css: [`${root}ignore_comment/ignore_comment.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('h1')).toBe(true)
        })
    })

    describe('font-face', () => {
        it('keeps font-face', () => {
            const purgecss = new Purgecss({
                content: [`${root}font_face/font_face.html`],
                css: [`${root}font_face/font_face.css`],
                legacy: true
            })
            const result = purgecss.purge()[0].css
            expect(result.includes('font-face')).toBe(true)
        })
    })
})

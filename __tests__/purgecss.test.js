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

    it('throws an error with an incorrect whitelistPatterns option', () => {
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelistPatterns: {}
            })
        }).toThrow(TypeError)
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelistPatterns: 100
            })
        }).toThrow(TypeError)
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelistPatterns: 'hello'
            }).toThrow(TypeError)
        })
        expect(() => {
            new Purgecss({
                content: ['index.html'],
                css: ['style.css'],
                whitelistPatterns: () => {}
            }).toThrow(TypeError)
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
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}simple/simple.js`],
                css: [`${root}simple/simple.css`],
                legacy: true
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

    describe('classes that are added together', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}combined/combined.js`],
                css: [`${root}combined/combined.css`],
                legacy: true
            }).purge()[0].css
        })
        it('can find .added-together', () => {
            expect(purgecssResult.includes('.added-together')).toBe(true)
        })

        it('can find .array-joined', () => {
            expect(purgecssResult.includes('.array-joined')).toBe(true)
        })
    })

    describe('filters out unused selectors', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}remove_unused/remove_unused.js`],
                css: [`${root}remove_unused/remove_unused.css`],
                legacy: true
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
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}camel_case/camel_case.js`],
                css: [`${root}camel_case/camel_case.css`],
                legacy: true
            }).purge()[0].css
        })
        it('finds testFoo', () => {
            expect(purgecssResult.includes('testFoo')).toBe(true)
        })

        it('finds camelCase', () => {
            expect(purgecssResult.includes('camelCase')).toBe(true)
        })
    })

    describe('wildcard', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}wildcard/wildcard.html`],
                css: [`${root}wildcard/wildcard.css`],
                legacy: true
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
                css: [`${root}media_queries/media_queries.css`],
                legacy: true
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

    describe('special characters', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}special_characters/special_characters.js`],
                css: [`${root}special_characters/special_characters.css`],
                legacy: true
            }).purge()[0].css
        })
        it('finds @home', () => {
            expect(purgecssResult.includes('@home')).toBe(true)
        })

        it('finds +rounded', () => {
            expect(purgecssResult.includes('+rounded')).toBe(true)
        })

        it('finds button', () => {
            expect(purgecssResult.includes('button')).toBe(true)
        })
    })

    describe('special characters, with custom Extractor', () => {
        let purgecssResult
        class CustomExtractor {
            static extract(content) {
                return content.match(/[A-z0-9-:\/]+/g)
            }
        }

        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}special_characters/special_characters.js`],
                css: [`${root}special_characters/special_characters.css`],
                extractors: [
                    {
                        extractor: CustomExtractor,
                        extensions: ['html', 'js']
                    }
                ],
                legacy: false
            }).purge()[0].css
        })

        it('finds tailwind class', () => {
            expect(purgecssResult.includes('md\\:w-1\\/3')).toBe(true)
        })
    })

    describe('delimited', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}delimited/delimited.html`],
                css: [`${root}delimited/delimited.css`],
                legacy: true
            }).purge()[0].css
        })
        it('removes the extra comma', () => {
            var commaCount = purgecssResult.split('').reduce((total, chr) => {
                if (chr === ',') return total + 1
                return total
            }, 0)

            expect(commaCount).toBe(1)
        })

        it('finds h1', () => {
            expect(purgecssResult.includes('h1')).toBe(true)
        })

        it('finds p', () => {
            expect(purgecssResult.includes('p')).toBe(true)
        })

        it('removes .unused-class-name', () => {
            expect(purgecssResult.includes('.unused-class-name')).toBe(false)
        })
    })

    describe('pseudo classes', () => {
        let purgecssResult
        beforeAll(() => {
            purgecssResult = new Purgecss({
                content: [`${root}pseudo_class/pseudo_class.js`],
                css: [`${root}pseudo_class/pseudo_class.css`],
                legacy: true
            }).purge()[0].css
        })
        it('finds div:before', () => {
            expect(purgecssResult.includes('div:before')).toBe(true)
        })

        it('removes row:after', () => {
            expect(purgecssResult.includes('row:after')).toBe(false)
        })
    })

    describe('nth-child', () => {
        let purgecssResult
        beforeAll(() => {
              purgecssResult = new Purgecss({
                    content: [`${root}nth_child/nth_child.html`],
                    css: [`${root}nth_child/nth_child.css`],
                    legacy: true
              }).purge()[0].css
        })
        it('finds some-item:nth-child(2n)', () => {
            expect(purgecssResult.includes('some-item:nth-child(2n)')).toBe(true)
        })

        it('finds some-item:nth-child(2n+1)', () => {
            expect(purgecssResult.includes('some-item:nth-child(2n+1)')).toBe(true)
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

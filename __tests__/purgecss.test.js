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

    it('initialize without error with a config file specified', () => {
        expect(() => {
            new Purgecss('./__tests__/purgecss.config.js')
        }).not.toThrow()
    })
})

describe(':not pseudo class', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}not/not.html`],
            css: [`${root}not/not.css`]
        }).purge()[0].css
    })

    it('finds foo-bar', () => {
        expect(purgecssResult.includes('foo-bar')).toBe(true)
    })
    it('finds foo', () => {
        expect(purgecssResult.includes('.foo')).toBe(true)
    })
})

describe('whitelist', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}whitelist/whitelist.html`],
            css: [`${root}whitelist/whitelist.css`],
            whitelist: ['random', 'h1', 'yep', 'button']
        }).purge()[0].css
    })

    it('finds random class', () => {
        expect(purgecssResult.includes('.random')).toBe(true)
    })

    it('finds h1', () => {
        expect(purgecssResult.includes('h1')).toBe(true)
    })

    it('finds #yep', () => {
        expect(purgecssResult.includes('#yep')).toBe(true)
    })

    it('finds button', () => {
        expect(purgecssResult.includes('button')).toBe(true)
    })
})

describe('special characters, with custom Extractor', () => {
    let purgecssResult
    class CustomExtractor {
        static extract(content) {
            return content.match(/[A-z0-9-:/]+/g)
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
            ]
        }).purge()[0].css
    })

    it('finds tailwind class', () => {
        expect(purgecssResult.includes('md\\:w-1\\/3')).toBe(true)
    })
})

describe('special characters, with custom Extractor as a function', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}special_characters/special_characters.js`],
            css: [`${root}special_characters/special_characters.css`],
            extractors: [
                {
                    extractor: content => content.match(/[A-z0-9-:/]+/g),
                    extensions: ['html', 'js']
                }
            ]
        }).purge()[0].css
    })

    it('finds tailwind class', () => {
        expect(purgecssResult.includes('md\\:w-1\\/3')).toBe(true)
    })
})

describe('nth-child', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}nth_child/nth_child.html`],
            css: [`${root}nth_child/nth_child.css`]
        }).purge()[0].css
    })
    it('finds some-item:nth-child(2n)', () => {
        expect(purgecssResult.includes('some-item:nth-child(2n)')).toBe(true)
    })
    it('finds some-item:nth-child(2n+1)', () => {
        expect(purgecssResult.includes('some-item:nth-child(2n+1)')).toBe(true)
    })
})

describe('keyframes', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}keyframes/keyframes.html`],
            css: [`${root}keyframes/keyframes.css`],
            keyframes: true
        }).purge()[0].css
    })
    it('finds bounce', () => {
        expect(purgecssResult.includes('bounce')).toBe(true)
    })
    it('removes flash', () => {
        expect(purgecssResult.includes('@keyframes flash')).toBe(false)
    })
    it('keeps keyframes from animations with multiple keyframes', () => {
        expect(purgecssResult.includes('@keyframes scale')).toBe(true)
        expect(purgecssResult.includes('@keyframes spin')).toBe(true)
    })
})

describe('pseudo selectors', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}pseudo_selector/pseudo_selector.html`],
            css: [`${root}pseudo_selector/pseudo_selector.css`]
        }).purge()[0].css
    })
    it('finds some-item:nth-child(2n)', () => {
        expect(purgecssResult.includes('some-item:nth-child(2n)')).toBe(true)
    })

    it('finds some-item:nth-child(2n + 1)', () => {
        expect(purgecssResult.includes('some-item:nth-child(2n + 1)')).toBe(true)
    })

    it('finds some-item:nth-of-type(n+3)', () => {
        expect(purgecssResult.includes('some-item:nth-of-type(n+3)')).toBe(true)
    })

    it('finds some-item:nth-of-type(-1n+6)', () => {
        expect(purgecssResult.includes('some-item:nth-of-type(-1n+6)')).toBe(true)
    })

    it('finds some-item:nth-of-type(-n+6)', () => {
        expect(purgecssResult.includes('some-item:nth-of-type(-n+6)')).toBe(true)
    })

    it('removes unused:only-child()', () => {
        expect(purgecssResult.includes('unused:only-child()')).toBe(false)
    })

    it('finds used:only-child()', () => {
        expect(purgecssResult.includes('used:only-child()')).toBe(true)
    })

    it('finds odd-item:nth-child(odd)', () => {
        expect(purgecssResult.includes('odd-item:nth-child(odd)')).toBe(true)
    })
})

describe('whitelistPatternsChildren', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}whitelist_patterns_children/whitelist_patterns_children.html`],
            css: [`${root}whitelist_patterns_children/whitelist_patterns_children.css`],
            whitelistPatternsChildren: [/^card$/]
        }).purge()[0].css
    })

    it('finds card class', () => {
        expect(purgecssResult.includes('.card')).toBe(true)
    })

    it('finds card--title', () => {
        expect(purgecssResult.includes('.title')).toBe(false)
    })

    it('finds card--content', () => {
        expect(purgecssResult.includes('.card .content')).toBe(true)
    })

    it('finds btn', () => {
        expect(purgecssResult.includes('.btn')).toBe(true)
    })

    it('finds btn yellow', () => {
        expect(purgecssResult.includes('.card .btn .yellow')).toBe(true)
    })

    it('finds btn red', () => {
        expect(purgecssResult.includes('.btn .red')).toBe(false)
    })

    it('excludes btn--green', () => {
        expect(purgecssResult.includes('.btn__green')).toBe(false)
    })
})

describe('rejected', () => {
    let purgecssResult
    beforeAll(() => {
        purgecssResult = new Purgecss({
            content: [`${root}simple/simple.js`],
            css: [`${root}simple/simple.css`]
        }).purge()[0]
    })

    it('does not return the rejected selectors if rejected set to false', () => {
        expect(purgecssResult.rejected).toBe(null)
    })

    it('returns an empty array if no selectors are rejected', () => {
        let purgecssResult = new Purgecss({
            content: [`${root}simple/simple.js`],
            css: [`${root}simple/simple.css`],
            rejected: true
        }).purge()[0]
        expect(purgecssResult.rejected).toEqual([])
    })

    it('returns the list of rejected selectors', () => {
        let purgecssResult = new Purgecss({
            content: [`${root}remove_unused/remove_unused.js`],
            css: [`${root}remove_unused/remove_unused.css`],
            rejected: true
        }).purge()[0]
        expect(purgecssResult.rejected).toEqual(['.unused-class', '.another-one-not-found'])
    })

    it('returns the list of rejected selectors with chaining rules', () => {
        let purgecssResult = new Purgecss({
            content: [`${root}chaining_rules/index.html`],
            css: [`${root}chaining_rules/index.css`],
            rejected: true
        }).purge()[0]
        expect(purgecssResult.rejected).toEqual([
            '.parent1 p',
            '.parent1.d22222ef',
            '.parent1.d222222222222222222ef',
            '.parent.def1',
            '.parent.def2',
            '.parent.de1',
            '.parent.d3ef1',
            '.parent.d33ef1',
            '.parent2.def',
            '.parent3.def1'
        ])
    })
})

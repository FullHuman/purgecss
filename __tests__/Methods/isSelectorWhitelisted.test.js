import Purgecss from './../../src/index'

describe('isSelectorWhitelisted', () => {
    const testWhitelist = ['.random', '#yep', 'button']
    const testWhitelistPatterns = [/^nav-/, /red$/]
    let purgecss
    beforeEach(() => {
        purgecss = new Purgecss({
            content: [''],
            css: [''],
            whitelist: testWhitelist,
            whitelistPatterns: testWhitelistPatterns
        })
    })
    it('return false when there is no whitelist and whitelistPatterns options', () => {
        const expected = false
        purgecss.options.whitelist = null
        purgecss.options.whitelistPatterns = null
        const received = purgecss.isSelectorWhitelisted('.navigation')
        expect(received).toBe(expected)
    })
    it('returns false when it is not in whitelist or whitelistPatterns', () => {
        expect(purgecss.isSelectorWhitelisted('.truc')).toBe(false)
        expect(purgecss.isSelectorWhitelisted('#hello-world')).toBe(false)
        expect(purgecss.isSelectorWhitelisted('a')).toBe(false)
        expect(purgecss.isSelectorWhitelisted('.test')).toBe(false)
        expect(purgecss.isSelectorWhitelisted('null')).toBe(false)
    })

    it('returns true when it is in whitelist', () => {
        expect(purgecss.isSelectorWhitelisted('.random')).toBe(true)
        expect(purgecss.isSelectorWhitelisted('#yep')).toBe(true)
        expect(purgecss.isSelectorWhitelisted('button')).toBe(true)
    })

    it('returns true when it is in the whitelistPatterns', () => {
        expect(purgecss.isSelectorWhitelisted('nav-item')).toBe(true)
        expect(purgecss.isSelectorWhitelisted('nav-tab')).toBe(true)
        expect(purgecss.isSelectorWhitelisted('icon-red')).toBe(true)
        expect(purgecss.isSelectorWhitelisted('button-red')).toBe(true)
    })
})

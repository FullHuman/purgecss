import { assets, files } from './../src/search'

describe('Search assets', () => {
    it('returns nothing if nothing is passed', () => {
        expect(assets()).toEqual([])
    })

    it('returns matches based on a pattern', () => {
        const modules = {
            'foobar.txt': {},
            'barbar.css': {}
        }
        const extensions = ['.txt']
        const matches = [{ name: 'foobar.txt', asset: {} }]

        expect(assets(modules, extensions)).toEqual(matches)
    })

    it('returns matches if they have query', () => {
        const modules = {
            'foobar.txt?123': {},
            'barbar.css': {}
        }
        const extensions = ['.txt']
        const matches = [{ name: 'foobar.txt?123', asset: {} }]

        expect(assets(modules, extensions)).toEqual(matches)
    })
})

describe('Search files', () => {
    let chunk
    beforeEach(() => {
        chunk = {
            mapModules: function(cb) {
                return Array.from(this.modules, cb)
            }
        }
    })

    it('returns matches based on extension', () => {
        chunk.modules = ['foobar.txt', 'barbar.css']
        const extensions = ['.txt']
        const matches = ['foobar.txt']

        expect(files(chunk, extensions)).toEqual(matches)
    })

    it('does not fail with missing modules', () => {
        chunk.modules = ['foobar.txt', '', 'barbar.css']
        const extensions = ['.txt']
        const matches = ['foobar.txt']

        expect(files(chunk, extensions)).toEqual(matches)
    })

    it('returns matches based on extension with a customized getter', () => {
        chunk.modules = [
            {
                resource: 'foobar.txt'
            },
            {
                resource: 'barbar.css'
            }
        ]
        const extensions = ['.txt']
        const matches = ['foobar.txt']

        expect(files(chunk, extensions, file => file.resource)).toEqual(matches)
    })

    it('does not fail with missing modules when a getter fails', () => {
        chunk.modules = [
            {
                resource: 'foobar.txt'
            },
            {},
            {
                resource: 'barbar.css'
            }
        ]
        const extensions = ['.txt']
        const matches = ['foobar.txt']

        expect(files(chunk, extensions, file => file.resource)).toEqual(matches)
    })
})

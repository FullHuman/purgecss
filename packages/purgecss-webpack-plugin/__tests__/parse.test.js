import { entryPaths, entries, flatten } from './../src/parse'

describe('Parse entry paths', () => {
    it('returns an empty array by default', () => {
        expect(entryPaths()).toEqual([])
    })

    it('returns an object as itself', () => {
        const o = { a: ['a', 'b', 'c'] }
        expect(entryPaths(o)).toEqual(o)
    })

    it('puts a string inside an array', () => {
        const str = 'foobar'
        expect(entryPaths(str)).toEqual([str])
    })
})

describe('Flatten entry paths', () => {
    it('returns an array as itself', () => {
        const a = ['a', 'b', 'c']
        expect(flatten(a)).toEqual(a)
    })

    it('returns an object of arrays as one flat array', () => {
        const o = { a: ['a', 'b'], b: ['c', 'd'] }
        expect(flatten(o)).toEqual(['a', 'b', 'c', 'd'])
    })
})

describe('Parse entries', () => {
    it('returns paths if there is no chunk name', () => {
        const paths = ['a', 'b', 'c']
        expect(entries(paths)).toEqual(paths)
    })

    it('returns paths if paths are an array already', () => {
        const paths = ['a', 'b', 'c']
        expect(entries(paths, 'foobar')).toEqual(paths)
    })

    it('returns chunk paths', () => {
        const entryPaths = ['a', 'b', 'c']
        const paths = {
            foobar: entryPaths
        }
        expect(entries(paths, 'foobar')).toEqual(entryPaths)
    })

    it('returns chunk path wrapped in an array', () => {
        const entryPaths = 'a'
        const paths = {
            foobar: entryPaths
        }
        expect(entries(paths, 'foobar')).toEqual([entryPaths])
    })

    it('returns an empty array if failed to find entry', () => {
        const paths = {
            foobar: 'a'
        }
        expect(entries(paths, 'barbar')).toEqual([])
    })

    it('returns an empty array if failed to find entry with multiple paths', () => {
        const paths = {
            foobar: 'a',
            barbar: 'b'
        }
        expect(entries(paths, 'foofoo')).toEqual([])
    })
})

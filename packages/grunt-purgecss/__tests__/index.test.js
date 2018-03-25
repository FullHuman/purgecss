const fs = require('fs')

describe('Purgecss grunt plugin', () => {
    const files = ['simple.css']
    for (const file of files) {
        it(`remove unused css successfully: ${file}`, () => {
            const actual = fs.readFileSync(`${__dirname}/tmp/${file}`).toString()
            const expected = fs.readFileSync(`${__dirname}/fixtures/expected/${file}`).toString()
            expect(actual).toBe(expected)
        })
    }
})

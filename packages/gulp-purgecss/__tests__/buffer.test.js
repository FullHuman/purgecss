import gulpPurgecss from "./../src/index.js"
import File from "vinyl"


describe('gulp-purgecss with buffer', () => {
    let myGulpPurgecss
    let fileTest
    beforeEach(() => {
        fileTest = new File({
            contents: new Buffer('.unused, .used, a { color: blue; }')
        })

        myGulpPurgecss = gulpPurgecss({
            content: ["./__tests__/test.html"]
        })    
    })

    it('returns a buffer', done => {
        myGulpPurgecss.write(fileTest)
        myGulpPurgecss.once('data', file => {
            expect(file.isBuffer()).toBe(true)
            done()
        })
    })

    it('returns a purified css buffer', done => {
        myGulpPurgecss.write(fileTest)
        myGulpPurgecss.once('data', file => {
            const result = file.contents.toString('utf8')
            expect(result.includes('used')).toBe(true)
            expect(result.includes('unused')).toBe(false)
            expect(result.includes('a')).toBe(true)
            done()
        })
    })

})
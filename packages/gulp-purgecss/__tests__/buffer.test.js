import gulpPurgecss from "./../src/index.js"
import File from "vinyl"


describe('gulp-purgecss with buffer', () => {
    it('', done => {
        const fileTest = new File({
            contents: new Buffer('.unused, .used, a { color: blue; }')
        })

        const myGulpPurgecss = gulpPurgecss({
            content: ["./__tests__/test.html"]
        })
        myGulpPurgecss.write(fileTest)
        myGulpPurgecss.once('data', file => {
            expect(file.isBuffer()).toBe(true)
            console.log(file.contents.toString('utf8'))
            done()
        })
    })
})
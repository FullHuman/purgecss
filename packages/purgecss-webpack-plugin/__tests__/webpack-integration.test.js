import fs from 'fs'
import path from 'path'
import webpack from 'webpack'

const cases = process.env.CASES
    ? process.env.CASES.split(',')
    : fs.readdirSync(path.join(__dirname, 'cases'))

describe('Webpack Integration Tests', () => {
    cases.forEach(testCase => {
        it(testCase, done => {
            let options = { entry: { test: './index.js' } }
            const testDirectory = path.join(__dirname, 'cases', testCase)
            const outputDirectory = path.join(__dirname, 'js', testCase)
            const configFile = path.join(testDirectory, 'webpack.config.js')

            if (fs.existsSync(configFile)) {
                options = require(configFile)
            }
            options.context = testDirectory
            if (!options.module) options.module = {}
            if (!options.output) options.output = { filename: '[name].js' }
            if (!options.output.path) options.output.path = outputDirectory
            if (process.env.CASES) {
                console.log(`\nwebpack.${testCase}.config.js ${JSON.stringify(options, null, 2)}`)
            }

            webpack(options, (err, stats) => {
                if (err) return done(err)
                if (stats.hasErrors()) return done(new Error(stats.toString()))
                const testFile = path.join(outputDirectory, 'test.js')
                if (fs.existsSync(testFile)) {
                    require(testFile)()
                }
                const expectedDirectory = path.join(testDirectory, 'expected')
                fs.readdirSync(expectedDirectory).forEach(file => {
                    const filePath = path.join(expectedDirectory, file)
                    const actualPath = path.join(outputDirectory, file)
                    expect(readFileOrEmpty(actualPath)).toEqual(readFileOrEmpty(filePath))
                    expect(readFileOrEmpty(actualPath)).toMatchSnapshot()
                })
                done()
            })
        })
    })
})

function readFileOrEmpty(path) {
    try {
        return fs.readFileSync(path, 'utf-8')
    } catch (e) {
        return ''
    }
}

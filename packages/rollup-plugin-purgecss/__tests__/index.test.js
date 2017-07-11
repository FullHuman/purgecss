import fs from 'fs'
import test from 'ava'
import { rollup } from 'rollup'
import purgecss from "../lib/rollup-plugin-purgecss"
import babel from 'rollup-plugin-babel'

const expectA = fs.readFileSync('__tests__/assets/expect_a.css').toString()
const expectB = fs.readFileSync('__tests__/assets/expect_b.css').toString()
const expectC = fs.readFileSync('__tests__/assets/expect_c.css').toString()
const expectD = fs.readFileSync('__tests__/assets/expect_d.css').toString()
const expectE = fs.readFileSync('__tests__/assets/expect_e.css').toString()

const squash = str => str.trim().replace(/\r/g, '')

test('should import *.css files', t => {
    return rollup({
        entry: '__tests__/fixtures/basic/index.js',
        plugins: [
            purgecss({
                content: ["__tests__/assets/test_a.html"]
            })
        ]
    }).then(bundle => {
        const result = bundle.generate().code
        t.true(result.includes(squash(expectA)))
    })
})

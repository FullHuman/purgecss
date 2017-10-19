import through from 'through2'
import gulpUtil from 'gulp-util'
import Purgecss from 'purgecss'

const PLUGIN_NAME = 'gulp-purgecss'

const gulpPurgecss = options => {
    return through.obj(function(file, encoding, callback) {
        // empty
        if (file.isNull()) return callback(null, file)
        // buffer
        if (file.isBuffer()) {
            try {
                const optionsGulp = Object.assign(options, {
                    css: [file.contents.toString()],
                    stdin: true
                })
                const result = new Purgecss(optionsGulp).purge()[0].css
                file.contents = new Buffer(result)
                callback(null, file)
            } catch (e) {
                this.emit('error', new gulpUtil.PluginError(PLUGIN_NAME, e.message))
            }
        }
        // stream
        if (file.isStream()) {
            var css = ''
            file
                .on('readable', buffer => {
                    css += buffer.read().toString()
                })
                .on('end', () => {
                    try {
                        const optionsGulp = Object.assign(options, { css: [css] })
                        const result = new Purgecss(optionsGulp).purge()[0].css
                        file.contents = new Buffer(result)
                        callback(null, file)
                    } catch (e) {
                        this.emit('error', new gulpUtil.PluginError(PLUGIN_NAME, e.message))
                    }
                })
        }
    })
}

export default gulpPurgecss

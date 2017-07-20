import path from 'path'

export const assets = (assets = [], extensions = []) =>
    Object.keys(assets)
        .map(name => {
            return (
                extensions.indexOf(
                    path.extname(
                        name.indexOf('?') >= 0
                            ? name.split('?').slice(0, -1).join('')
                            : name
                    )
                ) >= 0 && { name, asset: assets[name] }
            )
        })
        .filter(a => a)

export const files = (modules = {}, extensions = [], getter = a => a) =>
    Object.keys(modules)
        .map(name => {
            const file = getter(modules[name])

            if (!file) {
                return null
            }

            return extensions.indexOf(path.extname(file)) >= 0 && file
        })
        .filter(a => a)

import path from 'path'

export const assets = (assets = [], extensions = []) =>
    Object.keys(assets)
        .map(name => {
            return (
                extensions.indexOf(
                    path.extname(
                        name.indexOf('?') >= 0
                            ? name
                                  .split('?')
                                  .slice(0, -1)
                                  .join('')
                            : name
                    )
                ) >= 0 && { name, asset: assets[name] }
            )
        })
        .filter(a => a)

export const files = (chunk, extensions = [], getter = a => a) => {
    const mods = []

    Array.from(chunk.modulesIterable || [], module => {
        const file = getter(module)
        if (file) {
            mods.push(extensions.indexOf(path.extname(file)) >= 0 && file)
        }
    })

    return mods.filter(a => a)
}

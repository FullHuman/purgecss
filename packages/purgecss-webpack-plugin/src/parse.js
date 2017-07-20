export const entryPaths = paths => {
    const ret = paths || []

    // Convert possible string to an array
    if (typeof ret === 'string') {
        return [ret]
    }

    return ret
}

export const flatten = paths =>
    Array.isArray(paths)
        ? paths
        : Object.keys(paths).reduce((acc, val) => [...acc, ...paths[val]], [])

export const entries = (paths, chunkName) => {
    if (Array.isArray(paths)) {
        return paths
    }

    if (!(chunkName in paths)) {
        return []
    }

    const ret = paths[chunkName]

    return Array.isArray(ret) ? ret : [ret]
}

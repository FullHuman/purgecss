class DefaultExtractor {
    static extract(content) {
        return content.match(/[A-z0-9-]+/g)
    }
}

export default DefaultExtractor

class DefaultExtractor {
    static extract(content) {
        return content.match(/[A-Za-z0-9_-]+/g)
    }
}

export default DefaultExtractor

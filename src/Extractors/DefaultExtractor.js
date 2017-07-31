class DefaultExtractor {
    static extract(content) {
        return content.split(/[^A-z0-9-]/g)
    }
}

export default DefaultExtractor

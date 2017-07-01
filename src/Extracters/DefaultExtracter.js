class DefaultExtracter {
    static extract(content) {
        return content.split(/[^a-z]/g)
    }
}

export default DefaultExtracter

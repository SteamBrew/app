class Cache {
    constructor() {
        this.cache = {}
    }

    add(namespace, key, value) {
        if (!this.cache[namespace]) {
            this.cache[namespace] = {}
        }
        this.cache[namespace][key] = value
    }

    get(namespace, key) {
        if (this.cache[namespace]) {
            return this.cache[namespace][key]
        } 
        return null
    }

    delete(namespace, key) {
        if (this.cache[namespace]) {
            delete this.cache[namespace][key]
        }
    }

    clearNamespace(namespace) {
        this.cache[namespace] = {}
    }
}

export default Cache
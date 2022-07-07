export default class Loader<V, K = string | number> {
  cache: Map<K, Promise<V>> = new Map()
  data: Map<K, V> = new Map()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readonly handle: (key: K) => Promise<V>

  constructor(handle: (key: K) => Promise<V>) {
    this.handle = handle
  }

  private async _handle(key: K): Promise<V> {
    return this.handle(key)
      .then((result) => {
        this.data.set(key, result)
        return result
      })
      .catch((err) => {
        this.cache.delete(key)
        throw err
      })
  }

  async load(key: K): Promise<V> {
    if (!this.cache.has(key)) {
      this.cache.set(key, this._handle(key))
    }

    return this.cache.get(key)!
  }

  isLoading(key: K) {
    return this.cache.has(key) && !this.data.has(key)
  }

  get size() {
    return this.data.size
  }

  set(key: K, value: V) {
    this.cache.set(key, Promise.resolve(value))
    this.data.set(key, value)
  }

  clear(key: K) {
    this.data.delete(key)
    return this.cache.delete(key)
  }

  clearAll() {
    if (this.cache.size > 0) {
      this.cache = new Map()
      this.data = new Map()
      return true
    } else {
      return false
    }
  }
}

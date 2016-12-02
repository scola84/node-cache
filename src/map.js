import Cache from './cache';

export default class MapCache extends Cache {
  constructor() {
    super();
    this._storage = new Map();
  }

  _set(key, value, callback) {
    try {
      this._storage.set(key, value);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _get(key, callback) {
    try {
      callback(null, this._storage.get(key));
    } catch (error) {
      callback(error);
    }
  }

  _delete(key, callback) {
    try {
      this._storage.delete(key);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback = () => {}) {
    try {
      this._storage.clear();
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

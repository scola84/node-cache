import Cache from './cache';

export default class StorageCache extends Cache {
  _set(key, value, callback) {
    try {
      this._storage.setItem(key, value);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _get(key, callback) {
    try {
      callback(null, this._storage.getItem(key));
    } catch (error) {
      callback(error);
    }
  }

  _delete(key, callback) {
    try {
      this._storage.removeItem(key);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

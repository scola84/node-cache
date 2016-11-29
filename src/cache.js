import sha1 from 'sha1';

export default class Cache {
  constructor() {
    this._path = null;
    this._storage = null;
    this._timestamp = 0;
  }

  path(value) {
    this._path = value;
    return this;
  }

  storage(value) {
    this._storage = value;
    return this;
  }

  get(key, callback = () => {}) {
    this._get(this._hash(key), (error, object) => {
      if (error) {
        callback(error);
        return;
      }

      object = this._parse(object) || {};
      callback(null, object.value, object.timestamp > this._timestamp);
    });
  }

  set(key, value, callback = () => {}) {
    key = this._hash(key);

    const object = this._stringify({
      timestamp: Date.now(),
      value
    });

    this._set(key, object, (error) => {
      if (error) {
        callback(error);
        return;
      }

      callback();
    });
  }

  delete(key, callback = () => {}) {
    key = this._hash(key);

    this._delete(key, (error) => {
      if (error) {
        callback(error);
        return;
      }

      callback();
    });
  }

  flush(storage = true, callback = () => {}) {
    this._timestamp = Date.now();

    if (storage === true) {
      this._flush(callback);
    } else {
      callback();
    }
  }

  _hash(key) {
    return sha1(key);
  }

  _stringify(value) {
    return typeof value === 'undefined' ? null : JSON.stringify(value);
  }

  _parse(value) {
    return typeof value !== 'string' ? null : JSON.parse(value);
  }

  _set() {
    throw new Error('Not implemented');
  }

  _get() {
    throw new Error('Not implemented');
  }

  _delete() {
    throw new Error('Not implemented');
  }

  _flush() {
    throw new Error('Not implemented');
  }
}

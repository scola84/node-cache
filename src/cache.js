import EventEmitter from 'events';
import sha1 from 'sha1';
import each from 'async/each';

export default class Cache extends EventEmitter {
  constructor() {
    super();

    this._path = null;
    this._storage = null;
    this._keys = new Set();

    this._handlePublish = (rq, rs, n) => this._publish(rq, rs, n);
  }

  destroy(callback = () => {}) {
    this.clear();
    this.subscribe(false);
    this._delete(this._hash(this._id()), callback);
  }

  path(value) {
    this._path = value;
    return this;
  }

  storage(value) {
    this._storage = value;
    return this;
  }

  connection(value) {
    this._connection = value;
    return this;
  }

  router(value) {
    this._router = value;
    return this;
  }

  load(callback = () => {}) {
    this._load(callback);
  }

  subscribe(action) {
    if (action === true) {
      this._subscribe();
    } else if (action === false) {
      this._unsubscribe();
    }

    return this;
  }

  get(key, callback = () => {}) {
    this._get(this._hash(key), (error, value) => {
      callback(null, this._parse(value));
    });
  }

  set(key, value, callback = () => {}) {
    key = this._hash(key);
    value = this._stringify(value);

    this._keys.add(key);

    this._save((saveError) => {
      if (saveError) {
        callback(saveError);
        return;
      }

      this._set(key, value, (setError) => {
        if (setError) {
          callback(setError);
          return;
        }

        this.emit('set', { key, value });
        callback();
      });
    });
  }

  delete(key, callback = () => {}) {
    key = this._hash(key);
    this._keys.delete(key);

    this._save((saveError) => {
      if (saveError) {
        callback(saveError);
        return;
      }

      this._delete(key, (deleteError) => {
        if (deleteError) {
          callback(deleteError);
          return;
        }

        this.emit('delete', { key });
        callback();
      });
    });
  }

  clear(callback = () => {}) {
    each(Array.from(this._keys), (key, eachCallback) => {
      this._clear(key, eachCallback);
    }, (error) => {
      this._handleClear(error, callback);
    });
  }

  _load(callback = () => {}) {
    this._get(this._hash(this._id()), (error, keys) => {
      if (error) {
        callback(error);
        return;
      }

      this._keys = new Set(this._parse(keys) || []);
      callback();
    });
  }

  _save(callback = () => {}) {
    const keys = this._stringify(Array.from(this._keys));
    this._set(this._hash(this._id()), keys, callback);
  }

  _subscribe() {
    this._router.pub(this._path, this._handlePublish);

    this._connection
      .request()
      .method('SUB')
      .path(this._path)
      .header('x-sub', true)
      .end();
  }

  _unsubscribe() {
    this._router.pub(this._path, this._handlePublish, false);

    this._connection
      .request()
      .method('SUB')
      .path(this._path)
      .header('x-sub', false)
      .end();
  }

  _publish(request, response, next) {
    request.once('error', () => {});
    request.once('data', (data) => this.emit('change', data));
    next();
  }

  _clear(key, callback) {
    this._delete(key, (error) => {
      if (error) {
        callback(error);
        return;
      }

      this._keys.delete(key);
      callback();
    });
  }

  _handleClear(error, callback) {
    if (error) {
      callback(error);
      return;
    }

    this._keys.clear();

    this._save((saveError) => {
      if (saveError) {
        callback(saveError);
        return;
      }

      this.emit('clear');
      callback();
    });
  }

  _id() {
    return this._path + '/keys';
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
}

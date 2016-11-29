import MapCache from './src/map';
import StorageCache from './src/storage';

export { MapCache, StorageCache };

const caches = {};

export function storageCache(path) {
  if (!caches[path]) {
    caches[path] = new StorageCache().path(path);
  }

  return caches[path];
}

export function mapCache(path) {
  if (!caches[path]) {
    caches[path] = new MapCache().path(path);
  }

  return caches[path];
}

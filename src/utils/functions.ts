/**
 * Get target type
 * If target is an element, return `element`
 *
 * @param o
 * @returns
 */
export function type(o: any): string {
  const t = Object.prototype.toString.call(o).split(' ')[1].slice(0, -1).toLowerCase();
  return t.match(/element$/) ? 'element' : t;
}

export function forEach<T>(list: ArrayLike<T>, fn: (item: T, index: number) => void): Array<T> {
  return Array.prototype.forEach.call(list, fn)
}

export function map<T, K>(list: ArrayLike<T>, fn: (item: T, index: number) => K): Array<K> {
  return Array.prototype.map.call(list, fn)
}

/**
 * Merge to target object
 *
 * ### Example
 *
 * ```typescript
 * mergeDefaults({a:1, b: {c: 'c'}}, {b: {c: 'c1'}})
 * // {a:1, b: {c: 'c1'}}
 *
 * mergeDefaults({a:1 }, {a: 'a'})
 * // {a:1}
 * ```
 * @param defaults
 * @param o
 */
export function mergeDefaults(defaults: any, o: any) {
  const ret = { ...defaults };
  if (type(o) !== 'object') return ret;
  for (const k in o) {
    const v1 = defaults[k], v2 = o[k], t = type(v1);
    if (v1 === undefined || v1 === null) {
      ret[k] = v2;
      continue;
    }
    if (t !== type(v2)) continue;
    if (t === 'object') ret[k] = mergeDefaults(v1, v2);
    else ret[k] = v2;
  }
  return ret;
}

export function upperFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, a => '-' + a.toLowerCase())
}

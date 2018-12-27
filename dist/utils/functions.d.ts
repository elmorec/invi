/**
 * Get target type
 * If target is an element, return `element`
 *
 * @param o
 * @returns
 */
export declare function type(o: any): string;
export declare function forEach<T>(list: ArrayLike<T>, fn: (item: T, index: number) => void): Array<T>;
export declare function map<T, K>(list: ArrayLike<T>, fn: (item: T, index: number) => K): Array<K>;
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
export declare function mergeDefaults(defaults: any, o: any): any;
export declare function upperFirst(str: string): string;
export declare function kebabCase(str: string): string;

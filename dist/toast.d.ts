interface ToastStyle {
    /**
     * Class name of container element
     */
    host: string;
    /**
     * Class name applied to container when being attached to DOM
     */
    enter: string;
    /**
     * Class name applied to container when being detached from DOM
     */
    leave: string;
}
interface ToastConfig {
    /**
     * Toast content
     */
    content?: string;
    /**
     * Apply animation, require `classes.enter` and `classes.leave`
     * @default true
     */
    animation?: boolean;
    /**
     * Toast duration
     * @default 1000
     */
    duration?: number;
    /**
     * Uses `innerHTML` to apply content instead of `innerText`
     * @default false
     */
    unsafe?: boolean;
    /**
     * Mount element
     * @default document.body
     */
    host?: HTMLElement;
    /**
     * Class names
     */
    classes?: ToastStyle;
}
/**
 * ## Toast
 *
 * ### Example
 *
 * Modify default configuration
 *
 * ```javascript
 * toast.config({
 *   classes: {
 *     host: 'toast',
 *     enter: 'toast-enter',
 *     leave: 'toast-leave',
 *     backdrop: 'toast-backdrop'
 *   },
 * });
 * ```
 *
 * Display a toast
 *
 * ```javascript
 * toast('content').then(() => {});
 * toast('content', {}).then(() => {});
 * toast({content: 'content'}).then(() => {});
 * ```
 *
 * Full configuration
 *
 * ```javascript
 * toast({
 *   content: 'content',
 *   animation: true,
 *   duration: 1000,
 *   backdrop: false,
 *   unsafe: false,
 *   center: false,
 *   host: document.body,
 * });
 * ```
 */
declare function toast(content: string | ToastConfig, config?: ToastConfig): Promise<void>;
declare namespace toast {
    var config: (config: ToastConfig) => void;
}
export default toast;

interface ToastStyle {
    /**
     * Class name of container element
     */
    host: string;
    /**
     * Class name applied to container when it is attached to DOM
     */
    enter: string;
    /**
     * Class name applied to container when it is detached from DOM
     */
    leave: string;
    /**
     * Class name of the backdrop element
     */
    backdrop: string;
}
interface ToastConfig {
    /**
     * Toast content
     */
    content?: string;
    /**
     * Apply animation, require `classes.enter` and `classes.leave`
     */
    animation?: boolean;
    /**
     * Toast duration
     */
    duration?: number;
    /**
     * Create a backdrop, aka modal mode
     */
    backdrop?: boolean;
    /**
     * Uses `innerHTML` to apply content instead of `innerText`
     */
    unsafe?: boolean;
    /**
     * Mount element
     */
    host?: HTMLElement;
    /**
     * Class names
     */
    classes?: ToastStyle;
}
interface Toast {
    /**
     * Modify the default configuration
     */
    config(config: ToastConfig): void;
    /**
     * Create a toast and display it
     */
    (arg: ToastConfig | string): Promise<void>;
}
/**
 * Toast
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
 * ```
 *
 * Custom configuration
 *
 * ```javascript
 * toast({
 *   content: 'content';
 *   animation: true; // by default
 *   duration: 1000; // by default
 *   backdrop: false; // by default
 *   unsafe: false; // by default
 *   center: false; // by default
 *   host: document.body; // by default
 * });
 * ```
 */
declare const toast: Toast;
export { toast };

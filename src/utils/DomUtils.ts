/**
 * Utility functions for DOM manipulation
 */
export const DomUtils = {
    createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        className?: string,
        attributes: Record<string, string> = {}
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    },

    setStyles(
        element: HTMLElement,
        styles: Partial<CSSStyleDeclaration>
    ): void {
        Object.assign(element.style, styles);
    }
};
/**
 * Utility functions for DOM manipulation
 */
export const DomUtils = {
    createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        className?: string,
        attributes: Record<string, string> = {}
    ): HTMLElementTagNameMap[K] {
        try {
            const element = document.createElement(tag);
            if (className) {
                element.className = className;
            }
            Object.entries(attributes).forEach(([key, value]) => {
                if (key && value) {
                    element.setAttribute(key, value);
                }
            });
            return element;
        } catch (error) {
            console.error(`Error creating ${tag} element:`, error);
            throw error;
        }
    },

    setStyles(
        element: HTMLElement,
        styles: Partial<CSSStyleDeclaration>
    ): void {
        try {
            if (!element) {
                throw new Error('Element is null or undefined');
            }
            Object.entries(styles).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    // @ts-ignore - Style keys are always strings
                    element.style[key] = value;
                }
            });
        } catch (error) {
            console.error('Error setting styles:', error);
            throw error;
        }
    },

    querySelector<T extends HTMLElement>(
        parent: HTMLElement | Document,
        selector: string
    ): T | null {
        try {
            return parent.querySelector<T>(selector);
        } catch (error) {
            console.error(`Error querying selector ${selector}:`, error);
            return null;
        }
    }
}
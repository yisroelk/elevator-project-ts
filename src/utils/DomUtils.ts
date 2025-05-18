/**
 * Utility functions for DOM manipulation
 * Provides type-safe wrappers around common DOM operations
 */
export const DomUtils = {
    /**
     * Creates an HTML element with optional class name and attributes
     * Uses generic type parameter to ensure type safety
     */
    createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        className?: string,
        attributes: Record<string, string> = {}
    ): HTMLElementTagNameMap[K] {
        try {
            const element = document.createElement(tag);
            // Add class if provided
            if (className) {
                element.className = className;
            }
            // Set any additional attributes
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

    /**
     * Sets multiple CSS styles on an element
     * Handles null/undefined values gracefully
     */
    setStyles(
        element: HTMLElement,
        styles: Partial<CSSStyleDeclaration>
    ): void {
        try {
            if (!element) {
                throw new Error('Element is null or undefined');
            }
            // Apply each style if value is provided
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

    /**
     * Type-safe wrapper for querySelector
     * Returns null if element not found instead of throwing
     */
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
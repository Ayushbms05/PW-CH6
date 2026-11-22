import '@testing-library/jest-dom/vitest';

// Suppress jsdom canvas getContext warning in a11y testing
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}

import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement these APIs, but Radix UI's Select (and other
// popover-based primitives) call them when opening/positioning their
// content. Without these no-op polyfills, interacting with such components
// in tests throws `TypeError: ... is not a function`.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
}

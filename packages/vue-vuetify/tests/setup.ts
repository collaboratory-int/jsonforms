import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';

// Specs mount into document.body and call clearAllIds() before each mount, so
// unmount after each test: otherwise the previous form stays in the document
// with the same ids as the next one.
enableAutoUnmount(afterEach);

// Mock the visualViewport API for testing purposes
if (!window.visualViewport) {
  window.visualViewport = {
    addEventListener: () => {},
    removeEventListener: () => {},
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    onresize: null,
    onscroll: null,
    dispatchEvent: () => true,
  };
}

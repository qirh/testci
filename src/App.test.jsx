import React from 'react';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import App from './App';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');

globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator
});

const root = createRoot(document.getElementById('root'));

root.render(<App />);

await new Promise((resolve) => setTimeout(resolve, 20));

assert.match(document.body.textContent, /learn react/i);

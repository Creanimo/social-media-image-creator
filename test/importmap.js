const importMap = {
  "imports": {
    "mustache": "/base/node_modules/mustache/mustache.mjs",
    "immer": "/base/node_modules/immer/dist/immer.production.mjs",
    "snapdom": "/base/node_modules/@zumer/snapdom/dist/snapdom.mjs"
  }
};

const script = document.createElement('script');
script.type = 'importmap';
script.textContent = JSON.stringify(importMap);
document.head.appendChild(script);

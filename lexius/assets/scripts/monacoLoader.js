// monacoLoader.js
let isLoaded = false;

export function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (window.monaco && isLoaded) return resolve(window.monaco);

    if (typeof require === "undefined") {
      return reject(new Error("RequireJS (AMD loader) is not loaded. Make sure loader.js is included."));
    }

    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });

    require(['vs/editor/editor.main'], () => {
      isLoaded = true;
      window.monacoReady = true;
      resolve(window.monaco); // ✅ Important: resolve here
    }, reject);
  });
}
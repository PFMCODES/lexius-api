// ===============================
// Imports
// ===============================
import { loadMonaco } from "./lexius/assets/scripts/monacoLoader.js";
import { monaco } from "./lexius/assets/scripts/monaco.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { compile } from "https://esm.sh/neutronium@3.4.0/es2022/sandbox.mjs";

// ===============================
// Neutronium (default engine)
// ===============================
export const neutronium = {
  compile
};

// ===============================
// Lexius API Runtime
// (host framework, not core engine)
// ===============================
export const lexius = {
  supportedLangs: Object.freeze([
    "html",
    "svg",
    "markdown",
    "javascript",
    "typescript",
    "python"
  ]),

  isMonacoLoaded: false,
  min: 0,
  max: 999,
  idList: [],
  currentId: null
};

// ===============================
// Utilities
// ===============================
function generateId() {
  return Math.floor(
    Math.random() * (lexius.max - lexius.min + 1)
  ) + lexius.min;
}

// ===============================
// Editor
// ===============================
lexius.createEditor = async function ( container, lang, theme, code, themeLight, themeDark) {
  let id;
  do {
    id = generateId();
  } while (lexius.idList.includes(id));

  lexius.idList.push(id);
  lexius.currentId = id;

  if (!lexius.isMonacoLoaded && !window.editorInstance) {
    await loadMonaco();
    lexius.isMonacoLoaded = true;
  }

  const editorContainer = document.createElement("div");
  editorContainer.id = `editor-${id}`;
  editorContainer.style.height = "400px";
  editorContainer.style.width = "50%";
  editorContainer.style.overflow = "auto";

  const iframe = document.createElement("iframe");
  iframe.id = `iframe-${id}`;
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.style.width = "50%";
  iframe.style.height = "400px";

  container.appendChild(editorContainer);
  container.appendChild(iframe);

  monaco(editorContainer, lang, code, theme, themeLight, themeDark);
  return id;
};

// ===============================
// Run Normal Code
// ===============================
lexius.runCode = async function (code, lang, outputContainer) {
  if (!lexius.supportedLangs.includes(lang)) return;

  const id = lexius.currentId;

  if (lang === "markdown") {
    const iframe = document.querySelector(`#iframe-${id}`);
    iframe.srcdoc = marked.parse(code);
    return;
  }

  if (lang === "html" || lang === "svg") {
    const iframe = document.querySelector(`#iframe-${id}`);
    iframe.srcdoc = code;
    return;
  }

  try {
    const res = await fetch(
      "https://lexius-transpiler.onrender.com/run",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lang })
      }
    );

    if (!res.ok) {
      throw new Error(`Server error ${res.status}`);
    }

    const data = await res.json();
    const exec = data.result ?? {};

    const output = [
      exec.stdout,
      exec.stderr,
      exec.result
    ].filter(Boolean).join("\n");

    outputContainer.textContent = output;
  } catch (err) {
    outputContainer.textContent = "Error: " + err.message;
  }
};

// ===============================
// Run Neutronium (JSX / framework)
// ===============================
lexius.runNeutronium = function (code, container) {
  const html = neutronium.compile(code);

  let iframe = document.querySelector(
    `#iframe-${lexius.currentId}`
  );

  iframe.remove();

  iframe = document.createElement("iframe");
  iframe.id = `iframe-${lexius.currentId}`;
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.style.width = "50%";
  iframe.style.height = "400px";

  container.appendChild(iframe);
  iframe.srcdoc = html;
};

// ===============================
// Optional: Global exposure
// ===============================
window.lexius = lexius;
window.neutronium = neutronium;

export default lexius;
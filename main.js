import { loadMonaco } from "./lexius/assets/scripts/monacoLoader.js";
import { monaco } from "./lexius/assets/scripts/monaco.js";
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
import { compileAndReturnOutput } from "https://esm.sh/neutronium@3.3.0/es2022/sandbox.mjs";

const neutronium = { compileAndReturnOutput }

let supportedLangs = [
    "html",
    "svg",
    "markdown",
    "javascript",
    "typescript",
    "python"
];
let isMonacoLoaded = false;
let min = 0;
let max = 999;
let idList = [];

function generateId() {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function createEditor(container, lang, theme, code) {
    let id;
    do {
        id = generateId();
    } while (idList.includes(id));

    idList.push(id);
    window.currentId = id;
    if (isMonacoLoaded === false && !window.editorInstance) {
        await loadMonaco();
        isMonacoLoaded = true;
    }
    try {
        const newContainer = document.createElement("div")
        newContainer.id = id;
        const iframe = document.createElement("iframe");
        iframe.id = `iframe-${id}`;
        iframe.setAttribute('sandbox', 'allow-scripts');
        newContainer.style.height = "400px";
        newContainer.style.overflow = "scroll";
        newContainer.style.width = "50%";
        container.appendChild(newContainer);
        container.appendChild(iframe);
        monaco(newContainer, lang, code, theme);
        }
    catch (err) {
        throw err;
    }
    return id;
}

export async function runCode(code, lang, container) {
    let terminalDisplay = container;
    if (!supportedLangs.includes(lang)) return;
    if (!Array.isArray(supportedLangs)) return;
    let id;
    do {
        id = generateId();
    } while (idList.includes(id));
    if (lang !== 'html' && lang !== 'markdown' && lang !== 'svg') {
        try {
            const res = await fetch(
                "https://lexius-transpiler.onrender.com/run",
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, lang }),
                }
            );

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();

            const exec = data.result ?? {};

            const stdout = exec.stdout ?? "";
            const stderr = exec.stderr ?? "";
            const result =
                exec.result !== undefined && exec.result !== null
                ? String(exec.result)
                : "";

            const output = [stdout, stderr, result]
                .filter(Boolean)
                .join("\n");

            terminalDisplay.innerHTML += `lexius ${document.getElementsByClassName("selected")[0].textContent}<p id="run-${id}"></p> $`;
            document.querySelector(`#run-${id}`).textContent = output;
        } catch (err) {
            terminalDisplay.textContent = "Error: " + (err.message || err);
        }
    } 
    else {
        try {
            if (lang === "markdown") {
                code = marked.parse(code)
            }
            const iframe = document.querySelector(`#iframe-${id}`);
            iframe.srcdoc = code;
        }
        catch (err) {
            throw err;
        }
    }
}

export async function runNeutronium(code, container, theme) {
    let newCode = neutronium.compileAndReturnOutput(code);

    let iframe = document.querySelector(`#iframe-${window.currentId}`);
    iframe.remove()
    iframe = document.createElement('iframe');
    iframe.id = `iframe-${window.currentId}`;
    container.appendChild(iframe);
    iframe.srcdoc = newCode;
}
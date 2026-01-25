let editorInstance = null;

async function monaco(container, lang, eValue, theme, themeLight, themeDark) {
  const Monaco = window.monaco;
  if (!Monaco || !window.monacoReady) {
    console.warn("Monaco is not ready yet");
    return;
  }

  // Dispose previous instance (important!)
  if (editorInstance) {
    editorInstance.dispose();
    editorInstance = null;
  }
  if (!theme) {
    if (!themeLight && !themeDark) console.error("no themes found please provide an theme name or a custom theme"); return;
  }

  // Define themes (only once)
  if (!window.__lexiusThemesDefined && !themeDark && !themeLight && theme) {
    Monaco.editor.defineTheme("lexius-dark", {
      base: "vs-dark",
      inherit: true,
      semanticHighlighting: true,
      rules: [
        { token: "string", foreground: "#FF9E64" },
        { token: "number", foreground: "#F78C6C" },
        { token: "comment", foreground: "#546E7A", fontStyle: "italic" },
        { token: "keyword", foreground: "#d67eeeff" },
        { token: "identifier", foreground: "#ffffffff" },
      ],

      colors: {
        "editor.background": "#111039",
        "editorLineNumber.foreground": "#344770",
        "editorCursor.foreground": "rgb(19, 55, 156)",
        "editor.selectionBackground": "#2942fe80",
      }
    });

    Monaco.editor.defineTheme("lexius-light", {
      base: "vs",
      inherit: true,
      semanticHighlighting: true,
      rules: [
        { token: "string", foreground: "#FF9E64" },
        { token: "number", foreground: "#F78C6C" },
        { token: "comment", foreground: "#546E7A", fontStyle: "italic" },
        { token: "keyword", foreground: "rgb(126, 143, 238)" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editorLineNumber.foreground": "#8da1ef",
        "editorCursor.foreground": "#FFCC00",
        "editor.selectionBackground": "#82a1fd"
      }
    });

    window.__lexiusThemesDefined = true;
  }
  else {
    try {      
      Monaco.editor.defineTheme(themeLight);
      Monaco.editor.defineTheme(themeDark);
      window.__lexiusThemesDefined = true;
    } catch (e) {
      console.error("Failed to define custom themes: " + e.message);
      return;
    }
  }

  // Determine theme
  // const monacoTheme = theme === "dark" ? "lexius-dark" : "lexius-light";
  theme = theme === "dark" ? "lexius-dark" : "lexius-light";
  
  // Create editor instance
  editorInstance = Monaco.editor.create(container, {
    value: eValue,
    language: lang,
    theme: theme,
    fontSize: 14,
    automaticLayout: true,
    wordWrap: 'on',
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    'semanticHighlighting.enabled': true,
  });

  // Store reference globally
  window.editorInstance = editorInstance;
  
  // Auto-format on creation if it's JavaScript
  if (lang === 'javascript' && eValue) {
    setTimeout(() => {
      prettifyCode();
    }, 500); // Increased timeout to ensure prettier loads
  }
}

const prettierParsers = {
  javascript: "babel",
  js: "babel",
  html: "html",
  typescript: "typescript",
  ts: "typescript",
  css: "css",
  javascriptreact: "babel"
};

function prettifyCode() {
  if (!editorInstance) return;
  
  const code = editorInstance.getValue();
  const lang = editorInstance.getModel().getLanguageId();

  if (!code.trim()) return;
  if (lang !== 'javascript') return;

  try {
    // Check if prettier is available
    if (typeof prettier === 'undefined') {
      console.warn("Prettier not loaded");
      return;
    }

    // Use prettier with parser directly - no plugins needed for v2.8.8
    const formatted = prettier.format(code, {
      parser: 'babel',
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5'
    });

    editorInstance.setValue(formatted);
  } catch (err) {
    console.warn("Prettier failed:", err.message);
  }
}

// Export prettifyCode function for external use
export { prettifyCode, monaco };
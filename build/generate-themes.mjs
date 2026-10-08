// Generates the MDSL color themes (styles) under ../themes.
//
// Design:
//   * Every theme is a full VS Code color theme (workbench `colors` + `tokenColors`).
//   * `tokenColors` contain generic rules (so the theme is usable for any language)
//     AND MDSL-specific rules that target the `*.mdsl` scopes emitted by the grammar.
//   * Because TextMate scope matching is specificity-based, the MDSL rules
//     (e.g. `storage.type.element-role.mdsl`) win over generic rules (`storage`),
//     giving each "style" its own configurable MDSL keyword colors.
//
// Run:  node build/generate-themes.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "themes");

// slot -> TextMate scopes
const GENERIC_SCOPES = {
  comment: ["comment", "punctuation.definition.comment"],
  string: ["string"],
  number: ["constant.numeric"],
  constant: ["constant.language", "constant.character.escape"],
  keyword: ["keyword", "keyword.control", "keyword.operator.word"],
  storage: ["storage", "storage.type", "storage.modifier"],
  type: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
  func: ["entity.name.function", "support.function", "meta.function-call.generic"],
  variable: ["variable", "variable.other.readwrite"],
  property: ["variable.other.property", "variable.other.object.property", "support.type.property-name"],
  operator: ["keyword.operator"],
  punctuation: ["punctuation", "meta.brace"],
  tag: ["entity.name.tag"],
  attribute: ["entity.other.attribute-name"],
  regexp: ["string.regexp"],
  annotation: ["storage.type.annotation", "meta.declaration.annotation", "punctuation.definition.annotation"],
  invalid: ["invalid.illegal", "invalid.deprecated"],
};

const MDSL_SCOPES = {
  mdslControl: ["keyword.control.mdsl"],
  mdslOther: ["keyword.other.mdsl"],
  mdslDecl: ["storage.type.mdsl"],
  mdslRole: ["support.constant.role.mdsl"],
  mdslResp: ["support.constant.responsibility.mdsl"],
  mdslHttp: ["constant.language.http-method.mdsl"],
  mdslParam: ["constant.language.parameter-location.mdsl"],
  mdslProto: ["constant.language.protocol.mdsl"],
  mdslSec: ["constant.language.security.mdsl"],
  mdslEnum: ["constant.language.enumeration.mdsl"],
  mdslElemRole: ["storage.type.element-role.mdsl"],
  mdslPrim: ["support.type.primitive.mdsl"],
  mdslStereo: ["storage.type.stereotype.mdsl"],
  mdslTypeName: ["entity.name.type.mdsl"],
  mdslTypeRef: ["entity.name.type.reference.mdsl"],
  mdslFuncName: ["entity.name.function.mdsl"],
  mdslProp: ["variable.other.property.mdsl"],
  mdslQuant: ["keyword.operator.quantifier.mdsl"],
  mdslChoice: ["keyword.operator.choice.mdsl"],
};

// Defaults so a theme only has to override what it cares about.
function resolvePalette(p) {
  const g = {
    comment: p.comment,
    string: p.string,
    number: p.number,
    constant: p.constant,
    keyword: p.keyword,
    storage: p.storage,
    type: p.type,
    func: p.func,
    variable: p.variable,
    property: p.property ?? p.variable,
    operator: p.operator,
    punctuation: p.punctuation,
    tag: p.tag ?? p.keyword,
    attribute: p.attribute ?? p.type,
    regexp: p.regexp ?? p.string,
    annotation: p.annotation ?? p.func,
    invalid: p.invalid ?? "#f44747",
  };
  const m = {
    mdslControl: p.mdslControl ?? g.keyword,
    mdslOther: p.mdslOther ?? g.keyword,
    mdslDecl: p.mdslDecl ?? g.storage,
    mdslRole: p.mdslRole ?? g.constant,
    mdslResp: p.mdslResp ?? g.constant,
    mdslHttp: p.mdslHttp ?? g.constant,
    mdslParam: p.mdslParam ?? g.constant,
    mdslProto: p.mdslProto ?? g.type,
    mdslSec: p.mdslSec ?? g.constant,
    mdslEnum: p.mdslEnum ?? g.constant,
    mdslElemRole: p.mdslElemRole ?? g.storage,
    mdslPrim: p.mdslPrim ?? g.type,
    mdslStereo: p.mdslStereo ?? g.annotation,
    mdslTypeName: p.mdslTypeName ?? g.type,
    mdslTypeRef: p.mdslTypeRef ?? g.variable,
    mdslFuncName: p.mdslFuncName ?? g.func,
    mdslProp: p.mdslProp ?? g.property,
    mdslQuant: p.mdslQuant ?? g.operator,
    mdslChoice: p.mdslChoice ?? g.operator,
  };
  return { g, m };
}

function withAlpha(hex, alpha) {
  const h = hex.replace("#", "");
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `#${h}${a}`;
}

function buildColors(ui, kind) {
  const c = {
    focusBorder: ui.accent,
    foreground: ui.fg,
    descriptionForeground: ui.fgMuted,
    errorForeground: ui.error,
    "textLink.foreground": ui.accent,
    "textLink.activeForeground": ui.accentHover,
    "textPreformat.foreground": ui.paletteString,
    "textBlockQuote.background": ui.bgAlt,
    "selection.background": ui.selection,
    "scrollbarSlider.background": withAlpha(ui.fgMuted, 0.28),
    "scrollbarSlider.hoverBackground": withAlpha(ui.fgMuted, 0.4),
    "scrollbarSlider.activeBackground": withAlpha(ui.fgMuted, 0.55),
    "widget.shadow": withAlpha("#000000", kind === "light" ? 0.16 : 0.5),

    "editor.background": ui.bgEditor,
    "editor.foreground": ui.fg,
    "editorLineNumber.foreground": ui.fgMuted,
    "editorLineNumber.activeForeground": ui.fgEmph,
    "editorCursor.foreground": ui.cursor,
    "editor.selectionBackground": ui.selection,
    "editor.inactiveSelectionBackground": ui.selectionInactive,
    "editor.lineHighlightBackground": ui.lineHighlight,
    "editor.lineHighlightBorder": "#00000000",
    "editorWhitespace.foreground": ui.border,
    "editorIndentGuide.background1": ui.border,
    "editorIndentGuide.activeBackground1": ui.fgMuted,
    "editorBracketMatch.background": ui.selectionInactive,
    "editorBracketMatch.border": ui.accent,
    "editorGutter.background": ui.bgEditor,
    "editorError.foreground": ui.error,
    "editorWarning.foreground": ui.warning,
    "editorInfo.foreground": ui.info,
    "editorHoverWidget.background": ui.bgAlt,
    "editorHoverWidget.border": ui.border,
    "editorHoverWidget.foreground": ui.fg,
    "editorSuggestWidget.background": ui.bgAlt,
    "editorSuggestWidget.border": ui.border,
    "editorSuggestWidget.foreground": ui.fg,
    "editorSuggestWidget.selectedBackground": ui.selection,
    "editorSuggestWidget.highlightForeground": ui.accent,
    "editorWidget.background": ui.bgAlt,
    "editorWidget.border": ui.border,
    "editorWidget.foreground": ui.fg,
    "editorGroup.border": ui.border,
    "editorGroupHeader.tabsBackground": ui.bgAlt,
    "editorInlayHint.background": ui.bgAlt,
    "editorInlayHint.foreground": ui.fgMuted,
    "editorMarkerNavigationError.background": ui.error,
    "editorMarkerNavigationWarning.background": ui.warning,

    "tab.activeBackground": ui.bgEditor,
    "tab.inactiveBackground": ui.bgAlt,
    "tab.activeForeground": ui.fgEmph,
    "tab.inactiveForeground": ui.fgMuted,
    "tab.border": ui.border,
    "tab.activeBorderTop": ui.accent,
    "tab.hoverBackground": ui.bgHover,

    "sideBar.background": ui.bgAlt,
    "sideBar.foreground": ui.fg,
    "sideBar.border": ui.border,
    "sideBarTitle.foreground": ui.fg,
    "sideBarSectionHeader.background": ui.bg,
    "sideBarSectionHeader.foreground": ui.fg,

    "activityBar.background": ui.bg,
    "activityBar.foreground": ui.fgEmph,
    "activityBar.inactiveForeground": ui.fgMuted,
    "activityBar.border": ui.border,
    "activityBarBadge.background": ui.accent,
    "activityBarBadge.foreground": ui.accentFg,

    "statusBar.background": ui.accent,
    "statusBar.foreground": ui.accentFg,
    "statusBar.border": ui.border,
    "statusBar.noFolderBackground": ui.bg,
    "statusBar.debuggingBackground": ui.warning,
    "statusBar.debuggingForeground": "#000000",

    "titleBar.activeBackground": ui.bg,
    "titleBar.activeForeground": ui.fg,
    "titleBar.inactiveBackground": ui.bg,
    "titleBar.inactiveForeground": ui.fgMuted,
    "titleBar.border": ui.border,

    "list.activeSelectionBackground": ui.selection,
    "list.activeSelectionForeground": ui.fgEmph,
    "list.inactiveSelectionBackground": ui.selectionInactive,
    "list.hoverBackground": ui.bgHover,
    "list.focusBackground": ui.selection,
    "list.highlightForeground": ui.accent,
    "list.border": ui.border,
    "tree.indentGuidesStroke": ui.border,

    "input.background": ui.bgInput,
    "input.foreground": ui.fg,
    "input.border": ui.border,
    "input.placeholderForeground": ui.fgMuted,
    "inputOption.activeBorder": ui.accent,
    "dropdown.background": ui.bgInput,
    "dropdown.foreground": ui.fg,
    "dropdown.border": ui.border,

    "button.background": ui.accent,
    "button.foreground": ui.accentFg,
    "button.hoverBackground": ui.accentHover,
    "button.secondaryBackground": ui.bgHover,
    "button.secondaryForeground": ui.fg,
    "badge.background": ui.accent,
    "badge.foreground": ui.accentFg,
    "progressBar.background": ui.accent,

    "panel.background": ui.bgEditor,
    "panel.border": ui.border,
    "panelTitle.activeForeground": ui.fgEmph,
    "panelTitle.activeBorder": ui.accent,
    "panelTitle.inactiveForeground": ui.fgMuted,
    "terminal.background": ui.bgEditor,
    "terminal.foreground": ui.fg,

    "breadcrumb.foreground": ui.fgMuted,
    "breadcrumb.focusForeground": ui.fg,
    "breadcrumb.activeSelectionForeground": ui.fgEmph,
    "breadcrumbPicker.background": ui.bgAlt,

    "notifications.background": ui.bgAlt,
    "notifications.foreground": ui.fg,
    "notifications.border": ui.border,
    "notificationCenterHeader.background": ui.bg,
    "quickInput.background": ui.bgAlt,
    "quickInput.foreground": ui.fg,
    "quickInputList.focusBackground": ui.selection,
    "menu.background": ui.bgAlt,
    "menu.foreground": ui.fg,
    "menu.selectionBackground": ui.selection,
    "menu.border": ui.border,
    "menubar.selectionBackground": ui.bgHover,
    "keybindingLabel.background": ui.bgHover,
    "keybindingLabel.foreground": ui.fg,
    "keybindingLabel.border": ui.border,

    "gitDecoration.modifiedResourceForeground": ui.warning,
    "gitDecoration.deletedResourceForeground": ui.error,
    "gitDecoration.untrackedResourceForeground": ui.success,
    "gitDecoration.ignoredResourceForeground": ui.fgMuted,
    "gitDecoration.conflictingResourceForeground": ui.warning,

    "diffEditor.insertedTextBackground": withAlpha(ui.success, 0.18),
    "diffEditor.removedTextBackground": withAlpha(ui.error, 0.18),

    "minimap.background": ui.bgEditor,
    "minimapSlider.background": withAlpha(ui.fgMuted, 0.2),
  };

  if (kind === "hc") {
    c["contrastBorder"] = ui.border;
    c["contrastActiveBorder"] = ui.accent;
    c["editor.lineHighlightBackground"] = "#00000000";
    c["editor.lineHighlightBorder"] = ui.fgMuted;
    c["statusBar.background"] = ui.bg;
    c["statusBar.foreground"] = ui.fg;
    c["titleBar.activeBackground"] = ui.bg;
  }
  return c;
}

function buildTokenColors(theme) {
  const { g, m } = resolvePalette(theme.palette);
  const rules = [];
  const push = (scopes, settings) => rules.push({ scope: scopes, settings });

  // generic rules (any language)
  push(GENERIC_SCOPES.comment, { foreground: g.comment, fontStyle: "italic" });
  push(GENERIC_SCOPES.string, { foreground: g.string });
  push(GENERIC_SCOPES.number, { foreground: g.number });
  push(GENERIC_SCOPES.constant, { foreground: g.constant });
  push(GENERIC_SCOPES.keyword, { foreground: g.keyword });
  push(GENERIC_SCOPES.storage, { foreground: g.storage });
  push(GENERIC_SCOPES.type, { foreground: g.type });
  push(GENERIC_SCOPES.func, { foreground: g.func });
  push(GENERIC_SCOPES.variable, { foreground: g.variable });
  push(GENERIC_SCOPES.property, { foreground: g.property });
  push(GENERIC_SCOPES.operator, { foreground: g.operator });
  push(GENERIC_SCOPES.punctuation, { foreground: g.punctuation });
  push(GENERIC_SCOPES.tag, { foreground: g.tag });
  push(GENERIC_SCOPES.attribute, { foreground: g.attribute });
  push(GENERIC_SCOPES.regexp, { foreground: g.regexp });
  push(GENERIC_SCOPES.annotation, { foreground: g.annotation });
  push(GENERIC_SCOPES.invalid, { foreground: "#ffffff", background: g.invalid });

  // MDSL-specific overrides (more specific scopes -> win over generic)
  const order = [
    "mdslControl", "mdslOther", "mdslDecl", "mdslRole", "mdslResp",
    "mdslHttp", "mdslParam", "mdslProto", "mdslSec", "mdslEnum",
    "mdslElemRole", "mdslPrim", "mdslStereo", "mdslTypeName", "mdslTypeRef",
    "mdslFuncName", "mdslProp", "mdslQuant", "mdslChoice",
  ];
  for (const key of order) {
    const settings = { foreground: m[key] };
    if (key === "mdslControl" || key === "mdslDecl") settings.fontStyle = "bold";
    if (key === "mdslStereo") settings.fontStyle = "italic";
    push(MDSL_SCOPES[key], settings);
  }
  return rules;
}

const THEMES = [
  {
    id: "mdsl-dark",
    name: "MDSL Dark (Default)",
    uiTheme: "vs-dark",
    kind: "dark",
    ui: {
      bg: "#1e1e1e", bgAlt: "#252526", bgEditor: "#1e1e1e", bgInput: "#3c3c3c", bgHover: "#2a2d2e",
      border: "#454545", fg: "#d4d4d4", fgMuted: "#858585", fgEmph: "#ffffff",
      accent: "#007acc", accentFg: "#ffffff", accentHover: "#1c8cd8",
      selection: "#264f78", selectionInactive: "#3a3d41", lineHighlight: "#2a2d2e", cursor: "#aeafad",
      error: "#f48771", warning: "#cca700", success: "#89d185", info: "#75beff", paletteString: "#ce9178",
    },
    palette: {
      comment: "#6a9955", string: "#ce9178", number: "#b5cea8", constant: "#4fc1ff",
      keyword: "#569cd6", storage: "#569cd6", type: "#4ec9b0", func: "#dcdcaa",
      variable: "#9cdcfe", property: "#9cdcfe", operator: "#d4d4d4", punctuation: "#9a9a9a",
      tag: "#569cd6", attribute: "#9cdcfe", regexp: "#d16969", annotation: "#dcdcaa", invalid: "#f44747",
      mdslControl: "#c586c0", mdslOther: "#9cdcfe", mdslDecl: "#569cd6", mdslRole: "#4ec9b0",
      mdslResp: "#dcdcaa", mdslHttp: "#d7ba7d", mdslParam: "#d7ba7d", mdslProto: "#b5cea8",
      mdslSec: "#d16969", mdslEnum: "#4fc1ff", mdslElemRole: "#ce9178", mdslPrim: "#4ec9b0",
      mdslStereo: "#dcdcaa", mdslTypeName: "#4ec9b0", mdslTypeRef: "#9cdcfe", mdslFuncName: "#dcdcaa",
      mdslProp: "#9cdcfe", mdslQuant: "#d4d4d4", mdslChoice: "#d4d4d4",
    },
  },
  {
    id: "mdsl-light",
    name: "MDSL Light (Default)",
    uiTheme: "vs",
    kind: "light",
    ui: {
      bg: "#ffffff", bgAlt: "#f3f3f3", bgEditor: "#ffffff", bgInput: "#ffffff", bgHover: "#e8e8e8",
      border: "#d4d4d4", fg: "#1f1f1f", fgMuted: "#7a7a7a", fgEmph: "#000000",
      accent: "#0066b8", accentFg: "#ffffff", accentHover: "#00519a",
      selection: "#add6ff", selectionInactive: "#e5ebf1", lineHighlight: "#f5f5f5", cursor: "#000000",
      error: "#cd3131", warning: "#895503", success: "#107c10", info: "#1a85ff", paletteString: "#a31515",
    },
    palette: {
      comment: "#008000", string: "#a31515", number: "#098658", constant: "#0070c1",
      keyword: "#0000ff", storage: "#0000ff", type: "#267f99", func: "#795e26",
      variable: "#001080", property: "#001080", operator: "#000000", punctuation: "#383838",
      tag: "#800000", attribute: "#e50000", regexp: "#811f3f", annotation: "#808000", invalid: "#cd3131",
      mdslControl: "#af00db", mdslOther: "#001080", mdslDecl: "#0000ff", mdslRole: "#267f99",
      mdslResp: "#795e26", mdslHttp: "#a31515", mdslParam: "#a31515", mdslProto: "#098658",
      mdslSec: "#cd3131", mdslEnum: "#0070c1", mdslElemRole: "#267f99", mdslPrim: "#0000ff",
      mdslStereo: "#795e26", mdslTypeName: "#267f99", mdslTypeRef: "#001080", mdslFuncName: "#795e26",
      mdslProp: "#001080", mdslQuant: "#000000", mdslChoice: "#000000",
    },
  },
  {
    id: "mdsl-ocean",
    name: "MDSL Ocean",
    uiTheme: "vs-dark",
    kind: "dark",
    ui: {
      bg: "#0e1a24", bgAlt: "#12222e", bgEditor: "#102027", bgInput: "#16303c", bgHover: "#17313c",
      border: "#1e3a46", fg: "#cdd9e5", fgMuted: "#6b8a99", fgEmph: "#eaf4fb",
      accent: "#2fb3c0", accentFg: "#04202a", accentHover: "#3fc9d6",
      selection: "#1b4a5a", selectionInactive: "#17323d", lineHighlight: "#16292f", cursor: "#4fd6e6",
      error: "#ff7a7a", warning: "#f2c97d", success: "#7fd1a0", info: "#6fb3ff", paletteString: "#86d9c8",
    },
    palette: {
      comment: "#5c7f8f", string: "#86d9c8", number: "#f2c97d", constant: "#6fb3ff",
      keyword: "#4fb3d9", storage: "#4fb3d9", type: "#56c9b0", func: "#e6c07b",
      variable: "#9ad1e6", property: "#9ad1e6", operator: "#cdd9e5", punctuation: "#6b8a99",
      tag: "#4fb3d9", attribute: "#56c9b0", regexp: "#e07a9a", annotation: "#e6c07b", invalid: "#ff6b6b",
      mdslControl: "#c792ea", mdslOther: "#9ad1e6", mdslDecl: "#4fb3d9", mdslRole: "#56c9b0",
      mdslResp: "#e6c07b", mdslHttp: "#f2994a", mdslParam: "#f2994a", mdslProto: "#7fd1c1",
      mdslSec: "#e07a9a", mdslEnum: "#6fb3ff", mdslElemRole: "#56c9b0", mdslPrim: "#4fb3d9",
      mdslStereo: "#e6c07b", mdslTypeName: "#56c9b0", mdslTypeRef: "#9ad1e6", mdslFuncName: "#e6c07b",
      mdslProp: "#9ad1e6", mdslQuant: "#cdd9e5", mdslChoice: "#cdd9e5",
    },
  },
  {
    id: "mdsl-monokai",
    name: "MDSL Monokai",
    uiTheme: "vs-dark",
    kind: "dark",
    ui: {
      bg: "#272822", bgAlt: "#1e1f1c", bgEditor: "#272822", bgInput: "#3e3d32", bgHover: "#3e3d32",
      border: "#3b3a32", fg: "#f8f8f2", fgMuted: "#75715e", fgEmph: "#ffffff",
      accent: "#a6e22e", accentFg: "#272822", accentHover: "#b6f23e",
      selection: "#49483e", selectionInactive: "#3e3d32", lineHighlight: "#3e3d32", cursor: "#f8f8f0",
      error: "#f92672", warning: "#e6db74", success: "#a6e22e", info: "#66d9ef", paletteString: "#e6db74",
    },
    palette: {
      comment: "#75715e", string: "#e6db74", number: "#ae81ff", constant: "#ae81ff",
      keyword: "#f92672", storage: "#f92672", type: "#a6e22e", func: "#a6e22e",
      variable: "#f8f8f2", property: "#f8f8f2", operator: "#f92672", punctuation: "#f8f8f2",
      tag: "#f92672", attribute: "#a6e22e", regexp: "#e6db74", annotation: "#a6e22e", invalid: "#f8f8f0",
      mdslControl: "#f92672", mdslOther: "#66d9ef", mdslDecl: "#f92672", mdslRole: "#a6e22e",
      mdslResp: "#e6db74", mdslHttp: "#fd971f", mdslParam: "#fd971f", mdslProto: "#66d9ef",
      mdslSec: "#ae81ff", mdslEnum: "#ae81ff", mdslElemRole: "#66d9ef", mdslPrim: "#a6e22e",
      mdslStereo: "#e6db74", mdslTypeName: "#a6e22e", mdslTypeRef: "#f8f8f2", mdslFuncName: "#a6e22e",
      mdslProp: "#f8f8f2", mdslQuant: "#f92672", mdslChoice: "#f92672",
    },
  },
  {
    id: "mdsl-solarized",
    name: "MDSL Solarized Dark",
    uiTheme: "vs-dark",
    kind: "dark",
    ui: {
      bg: "#002b36", bgAlt: "#073642", bgEditor: "#002b36", bgInput: "#073642", bgHover: "#0e4552",
      border: "#586e75", fg: "#839496", fgMuted: "#586e75", fgEmph: "#93a1a1",
      accent: "#268bd2", accentFg: "#fdf6e3", accentHover: "#2aa198",
      selection: "#0f4d5c", selectionInactive: "#073642", lineHighlight: "#073642", cursor: "#93a1a1",
      error: "#dc322f", warning: "#b58900", success: "#859900", info: "#268bd2", paletteString: "#2aa198",
    },
    palette: {
      comment: "#586e75", string: "#2aa198", number: "#d33682", constant: "#d33682",
      keyword: "#859900", storage: "#859900", type: "#b58900", func: "#268bd2",
      variable: "#839496", property: "#839496", operator: "#839496", punctuation: "#657b83",
      tag: "#268bd2", attribute: "#b58900", regexp: "#dc322f", annotation: "#859900", invalid: "#dc322f",
      mdslControl: "#859900", mdslOther: "#93a1a1", mdslDecl: "#859900", mdslRole: "#268bd2",
      mdslResp: "#b58900", mdslHttp: "#cb4b16", mdslParam: "#cb4b16", mdslProto: "#2aa198",
      mdslSec: "#d33682", mdslEnum: "#6c71c4", mdslElemRole: "#268bd2", mdslPrim: "#b58900",
      mdslStereo: "#859900", mdslTypeName: "#b58900", mdslTypeRef: "#93a1a1", mdslFuncName: "#268bd2",
      mdslProp: "#93a1a1", mdslQuant: "#839496", mdslChoice: "#839496",
    },
  },
  {
    id: "mdsl-high-contrast",
    name: "MDSL High Contrast",
    uiTheme: "hc-black",
    kind: "hc",
    ui: {
      bg: "#000000", bgAlt: "#000000", bgEditor: "#000000", bgInput: "#000000", bgHover: "#0f2b1a",
      border: "#6fc3df", fg: "#ffffff", fgMuted: "#c8c8c8", fgEmph: "#ffffff",
      accent: "#f38518", accentFg: "#000000", accentHover: "#ff9c3f",
      selection: "#008000", selectionInactive: "#1a1a1a", lineHighlight: "#000000", cursor: "#ffff00",
      error: "#ff5555", warning: "#ffff00", success: "#4ec945", info: "#3794ff", paletteString: "#ce9178",
    },
    palette: {
      comment: "#7ca668", string: "#ce9178", number: "#b5cea8", constant: "#4fc1ff",
      keyword: "#3794ff", storage: "#3794ff", type: "#4ec9b0", func: "#dcdcaa",
      variable: "#9cdcfe", property: "#9cdcfe", operator: "#d4d4d4", punctuation: "#ffffff",
      tag: "#569cd6", attribute: "#9cdcfe", regexp: "#d16969", annotation: "#dcdcaa", invalid: "#f44747",
      mdslControl: "#ff8ae2", mdslOther: "#9cdcfe", mdslDecl: "#59a5ff", mdslRole: "#4ec9b0",
      mdslResp: "#ffe27a", mdslHttp: "#ffcf8a", mdslParam: "#ffcf8a", mdslProto: "#b5cea8",
      mdslSec: "#ff8a80", mdslEnum: "#8ad4ff", mdslElemRole: "#ffb37a", mdslPrim: "#4ec9b0",
      mdslStereo: "#ffe27a", mdslTypeName: "#4ec9b0", mdslTypeRef: "#9cdcfe", mdslFuncName: "#dcdcaa",
      mdslProp: "#9cdcfe", mdslQuant: "#ffffff", mdslChoice: "#ffffff",
    },
  },
];

mkdirSync(OUT, { recursive: true });
for (const t of THEMES) {
  const theme = {
    $schema: "vscode://schemas/color-theme",
    name: t.name,
    type: t.kind === "light" ? "light" : t.kind === "hc" ? "hc" : "dark",
    colors: buildColors(t.ui, t.kind),
    tokenColors: buildTokenColors(t),
  };
  const file = join(OUT, `${t.id}.json`);
  writeFileSync(file, JSON.stringify(theme, null, 2) + "\n", "utf8");
  console.log("wrote", file, `(${theme.tokenColors.length} token rules)`);
}
console.log(`\nGenerated ${THEMES.length} MDSL themes.`);

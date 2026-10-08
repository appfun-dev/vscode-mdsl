# MDSL Syntax & Themes

Standalone **syntax highlighting** for **MDSL** (Microservice Domain-Specific Language) in Visual
Studio Code, shipped together with a set of **independent color-theme "styles"** that make every
MDSL keyword category's color **configurable**.

MDSL specifies (micro-)service contracts, data representations and API endpoints. See the language
home page: <https://microservice-api-patterns.github.io/MDSL-Specification/>.

> The grammar is derived from the official MDSL language specification and its published ANTLR
> grammar, so it covers the core language (data types, endpoint types, protocol bindings,
> providers/clients, SLAs) plus the experimental story/flow constructs.

---

## Features

- **Language support** for the `.mdsl` extension with a rich TextMate grammar
  (`source.mdsl`): line & block comments, strings, field names, stereotypes (`<<...>>`),
  cardinalities (`? * + !`), choice (`|`), and full keyword coverage.
- **Semantic token categories** — every MDSL construct gets its own TextMate scope so colors can be
  themed independently:
  declaration keywords, control keywords, MAP endpoint **roles**, operation **responsibilities**,
  **HTTP methods**, **parameter locations**, **protocols**, **security schemes**, **enumerations**,
  **element roles** (`D`/`MD`/`ID`/`L`/`P`), **primitive base types**, **stereotypes**, type names,
  type references, operation names, and field/property names.
- **6 bundled color themes (styles)** — each is a complete, self-contained configuration set
  (workbench colors + token colors) that restyles MDSL keywords in its own palette:
  *MDSL Dark (Default)*, *MDSL Light (Default)*, *MDSL Ocean*, *MDSL Monokai*,
  *MDSL Solarized Dark*, *MDSL High Contrast*.
- **Editor niceties**: bracket rules, auto-closing pairs (`{}` `[]` `()` `""` `<>` `<<>>`),
  keyword-aware indentation (after `exposes`, `expecting`, `delivering`, `{`, …),
  indentation-based (off-side) folding plus `// #region` / `/* */` markers, block-comment
  continuation on Enter, and an MDSL-aware word pattern (selects `JSON-RPC` as one word).
- **Snippets** for the core constructs — type any prefix and press `Tab`:
  `API`, `datatype`, `enum`, `relationtype`, `endpointtype`, `operation`, `provider`,
  `httpbinding`, `client`, `sla`, `protectedby`. Enum choices (roles, responsibilities,
  protocols, HTTP methods, rate plans) are offered as pick-lists inside the snippets.

## Getting started

1. Install the extension (see *Install* below) and reload VS Code.
2. Open any `.mdsl` file (a sample ships at `examples/sample.mdsl`).
3. Open **File ▸ Preferences ▸ Color Theme** (or `⌘K ⌘T`) and pick one of the **MDSL …** themes.
   Each theme is an *independent style*: switching themes re-colors all MDSL keyword categories.

## Configuring keyword colors

Colors are configured **as a set of configurations, each acting as an independent style**:

1. **Pick a style** — every bundled theme is one configuration set. Choose it from the Color Theme
   picker to apply its keyword palette in one step.
2. **Tune a style / build your own** — each theme's keyword colors are generated from a single
   palette in `build/generate-themes.mjs`. Edit the `palette` of any
   theme (the `mdsl*` keys are the MDSL keyword categories) and regenerate:
   ```bash
   node build/generate-themes.mjs
   ```
   This keeps every style consistent while letting you change any keyword color in one place.
3. **Per-user override without switching themes** — keep your current theme and override specific
   MDSL scopes via `settings.json` using `editor.tokenColorCustomizations` + `textMateRules`:
   ```jsonc
   "editor.tokenColorCustomizations": {
     "textMateRules": [
       { "scope": "keyword.control.mdsl",              "settings": { "foreground": "#C586C0", "fontStyle": "bold" } },
       { "scope": "storage.type.mdsl",                 "settings": { "foreground": "#569CD6", "fontStyle": "bold" } },
       { "scope": "support.constant.role.mdsl",        "settings": { "foreground": "#4EC9B0" } },
       { "scope": "support.constant.responsibility.mdsl", "settings": { "foreground": "#DCDCAA" } },
       { "scope": "constant.language.http-method.mdsl","settings": { "foreground": "#D7BA7D" } },
       { "scope": "storage.type.element-role.mdsl",    "settings": { "foreground": "#CE9178" } },
       { "scope": "support.type.primitive.mdsl",       "settings": { "foreground": "#4EC9B0" } },
       { "scope": "entity.name.type.mdsl",             "settings": { "foreground": "#4EC9B0" } }
     ]
   }
   ```

### MDSL scope reference

| Construct | Scope |
|---|---|
| Declaration keywords (`API`, `data`, `type`, `endpoint`, `operation`, `provider`, `client`, `SLA`, …) | `storage.type.mdsl` |
| Control keywords (`serves`, `as`, `exposes`, `expecting`, `delivering`, `offers`, `consumes`, …) | `keyword.control.mdsl` |
| Qualifier keywords (`payload`, `headers`, `status`, `version`, `rate`, `limit`, …) | `keyword.other.mdsl` |
| Endpoint roles (`PROCESSING_RESOURCE`, `INFORMATION_HOLDER_RESOURCE`, …) | `support.constant.role.mdsl` |
| Operation responsibilities (`RETRIEVAL_OPERATION`, `STATE_CREATION_OPERATION`, …) | `support.constant.responsibility.mdsl` |
| HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, …) | `constant.language.http-method.mdsl` |
| Parameter locations (`QUERY`, `PATH`, `HEADER`, `COOKIE`, `BODY`) | `constant.language.parameter-location.mdsl` |
| Protocols (`HTTP`, `gRPC`, `SOAP_HTTP`, `Kafka`, …) | `constant.language.protocol.mdsl` |
| Security schemes (`JWT`, `API_KEY`, `BASIC_AUTHENTICATION`, …) | `constant.language.security.mdsl` |
| Other enumerations (`PUBLIC_API`, `USAGE_BASED`, `TWO_IN_PRODUCTION`, …) | `constant.language.enumeration.mdsl` |
| Element roles (`D`, `MD`, `ID`, `L`, `P`, `Data`, `Metadata`, …) | `storage.type.element-role.mdsl` |
| Primitive base types (`string`, `int`, `bool`, `long`, `double`, `raw`, `void`) | `support.type.primitive.mdsl` |
| Stereotypes (`<<API_Key>>`, …) | `storage.type.stereotype.mdsl` |
| Declared type/endpoint names | `entity.name.type.mdsl` |
| Referenced type/endpoint names | `entity.name.type.reference.mdsl` |
| Operation names | `entity.name.function.mdsl` |
| Field / property names (`"name":`) | `variable.other.property.mdsl` |
| Cardinality (`? * + !`) | `keyword.operator.quantifier.mdsl` |
| Choice (`|`) | `keyword.operator.choice.mdsl` |
| Comments / strings / numbers | `comment.*.mdsl` / `string.quoted.double.mdsl` / `constant.numeric.mdsl` |

All MDSL scopes are built on standard TextMate prefixes (`keyword`, `storage`, `constant`,
`entity`, …), so MDSL still looks reasonable under *other* themes — the bundled themes simply add
finer-grained colors on top.

## Install

**From a packaged `.vsix` (recommended):**
```bash
npx --yes @vscode/vsce package        # produces mdsl-syntax-0.2.0.vsix
code --install-extension mdsl-syntax-0.2.0.vsix
```

**Manual copy:** place the extension folder at
`~/.vscode/extensions/appfun-dev.mdsl-syntax-0.2.0/` and reload VS Code.

## Development

```
syntaxes/mdsl.tmLanguage.json    # the TextMate grammar (source.mdsl)
language-configuration.json      # comments, brackets, folding, indent
snippets/mdsl.json               # code snippets for core MDSL constructs
themes/                          # generated color themes (styles)
build/generate-themes.mjs        # single source of truth for theme palettes
build/generate-icon.cjs          # generates images/icon.png (needs pngjs)
examples/sample.mdsl             # sample document
```

Regenerate themes after editing palettes: `node build/generate-themes.mjs`.

## License

MIT — see the `LICENSE` file.

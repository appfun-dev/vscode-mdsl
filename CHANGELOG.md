# Changelog

All notable changes to the **MDSL Syntax & Themes** extension are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-08

### Added
- Snippets (`snippets/mdsl.json`) for the core MDSL constructs: `API`, `datatype`, `enum`,
  `relationtype`, `endpointtype`, `operation`, `provider`, `httpbinding`, `client`, `sla`,
  `protectedby`, with pick-list choices for endpoint roles, operation responsibilities,
  conversation patterns, protocols, HTTP methods and rate plans.

### Changed
- Language configuration hardened (declarative-only lightweight editing support):
  indentation now increases after block-opening keywords (`exposes`, `expecting`, `delivering`,
  `reporting`, `offers`, `binding`, `payload`, `headers`, `consumes`, `objective`) in addition
  to `{`; folding switched to off-side (indentation-based) with `// #region` / `/* */` markers;
  `<<>>` auto-closing pair; block-comment `*` continuation and `indentOutdent` on-enter rules;
  word pattern covers hyphenated keywords (e.g. `JSON-RPC`).
- Removed the `server/` language-server prototype — the extension is fully declarative
  (syntax highlighting, language configuration and snippets only; no executable code,
  no runtime dependencies).

## [0.1.0] - 2026-10-08

### Added
- TextMate grammar (`source.mdsl`) for MDSL with full keyword coverage derived from the
  authoritative MDSL token set and the official language specification: declaration/control/
  qualifier keywords, MAP endpoint roles, operation responsibilities, HTTP methods, parameter
  locations, protocols, security schemes, enumerations, element roles, primitive base types,
  stereotypes (`<<...>>`), cardinalities, choice operator, field/property names, type names and
  type references, comments, strings and numbers.
- Language configuration for `.mdsl`: line/block comments, brackets, auto-closing pairs,
  folding markers and indentation rules.
- Six independent color-theme styles with configurable MDSL keyword colors:
  MDSL Dark (Default), MDSL Light (Default), MDSL Ocean, MDSL Monokai, MDSL Solarized Dark,
  MDSL High Contrast.
- Theme generator (`build/generate-themes.mjs`) as the single source of truth for palettes.
- Icon generator (`build/generate-icon.cjs`) and extension icon.
- Sample document (`examples/sample.mdsl`).


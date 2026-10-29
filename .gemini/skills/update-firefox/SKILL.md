---
name: update-firefox
description: Guide for AI agents and developers to maintain, rebase, build, and update the Firefox Windows XP (Winstripe) fork (firefox-wxp) against upstream Firefox.
---

# Updating & Maintaining the Firefox WXP Fork (`firefox-wxp`)

This skill provides step-by-step instructions for any AI assistant or developer to maintain, rebase against upstream Firefox, build, test, and release the **Firefox WXP (Windows XP / Firefox 1.0 Winstripe)** fork.

---

## 1. Architecture Overview

The fork transforms modern Firefox into an authentic Windows XP / Firefox 1.0 experience following the **isolated theme architecture**:

- **Toolkit Theme (`toolkit/themes/xp-classic/`)**:
  - `variables.css`: Centralized Luna color tokens (`#ECE9D8`, `#0A246A`, `#B2D1F5`, 3D borders `#D4D0C8`/`#404040`), font metrics (Tahoma, 11px/12px).
  - `widgets.css`: XP 3D push buttons, checkmarks, radios, scrollbars, dialog controls.
  - `dialogs.css`: Classic in-content and modal dialog styling.
- **Browser Theme (`browser/themes/xp-classic/`)**:
  - `xp-classic.css`: Master stylesheet and toolbar ordering (`#toolbar-menubar` > `#nav-bar` > `#PersonalToolbar` > `#TabsToolbar`).
  - `menubar.css`: Classic always-visible menu bar and `#navigator-throbber` bound to tab activity.
  - `navbar.css`: Separated Reload & Stop buttons, Go button, classic search bar (`Search-bar.png`), and 24x24 `Toolbar.png` icons.
  - `bookmarksbar.css`: Bookmarks Toolbar with classic 3D buttons, folder icons, and chevron.
  - `tabs.css`: Tabs docked below toolbars, bold active tab label, `#tabstrip-bottom.png` gradient, and strip close button.
  - `statusbar.css`: Classic bottom status bar (`#xp-status-bar`) with live `#statuspanel` docking, green progress meter, and SSL lock icon (`Secure.png`).
  - `sidebar.css`: Classic Places bookmarks/history sidebar with 25px header and tree icons.
  - `preferences.css`: `about:preferences` categories in white sunken 3D container with 32x32 `Options.png` icons.
  - `newtab.css`: Retro XP `about:newtab` and `about:home` with classic Firefox 1.0 logo, Luna 3D sunken search bar, and retro top-site cards.
  - `icons/`: Authentic Winstripe 1.0 assets extracted from Firefox 1.0.

---

## 2. Minimal Core Touchpoints (Watch These During Rebasing)

Upstream modifications to core files are deliberately kept minimal (10 touchpoints) to ensure effortless merges:

| File | Purpose | Merge Conflict Action |
|---|---|---|
| `toolkit/themes/moz.build` | Adds `DIRS += ["xp-classic"]` | Keep the `xp-classic` addition. |
| `toolkit/themes/shared/in-content/common.css` | Imports `chrome://global/skin/xp-classic/variables.css` | Keep the `@import` at top. |
| `browser/themes/moz.build` | Adds `DIRS += ["xp-classic"]` | Keep the `xp-classic` addition. |
| `browser/themes/shared/preferences/preferences.css` | Imports `chrome://browser/skin/xp-classic/preferences.css` | Keep the `@import` at top. |
| `browser/base/content/browser.xhtml` | 1) `defaultCollapsed="false"` on `#toolbar-menubar`<br>2) `#navigator-throbber`<br>3) `#xp-status-bar` at bottom | Keep throbber inside toolbars and `#xp-status-bar` before `</window>`. |
| `browser/base/content/browser.js` | Padlock update in `onLocationChange` | Keep SSL status icon switcher. |
| `browser/app/profile/firefox.js` | Default preferences (titlebar, bookmarks, search bar, scrollbars) | Retain the customized prefs block. |
| `browser/branding/unofficial/configure.sh` | Sets `MOZ_APP_DISPLAYNAME=Firefox`, `MOZ_APP_REMOTINGNAME=firefox` | Keep `Firefox` and `firefox`. |
| `browser/branding/unofficial/locales/en-US/brand.*` | Renames "Nightly" to "Firefox" in FTL and properties | Keep `Firefox` as short/full name. |
| `browser/extensions/newtab/prerendered/*.html` | Links `chrome://browser/skin/xp-classic/newtab.css` and adds `chrome:` to CSP | Keep stylesheet link & CSP. |

---

## 3. Step-by-Step Upstream Rebase Procedure

When upstream Firefox releases a new commit or version, follow these exact steps:

### Step 3.1: Fetch Upstream
```bash
cd firefox-current
git checkout xp-theme
git status # Ensure clean working tree

# Fetch latest Mozilla upstream
git fetch origin main
```

### Step 3.2: Rebase `xp-theme`
```bash
# Rebase all xp-theme commits on top of new upstream main
git rebase origin/main
```

### Step 3.3: Resolving Rebase Conflicts
If a conflict occurs, inspect which file is conflicted:
- If inside `toolkit/themes/xp-classic/` or `browser/themes/xp-classic/`: accept our version (`--ours` / keep fork changes).
- If inside one of the 10 minimal core files: inspect the diff, preserve our small injection (e.g. `DIRS += ["xp-classic"]` or `#xp-status-bar`), and run `git add <file> && git rebase --continue`.

---

## 4. Compiling & Packaging

### Fast Iteration (UI & Style Changes)
```bash
./mach build faster
```
Takes ~10–15 seconds with artifact builds enabled in `mozconfig`.

### Full Artifact Build
```bash
./mach build
```

### Running the Browser
```bash
./mach run
# Or with a fresh isolated profile:
./mach run -P test-xp --no-remote
```

### Creating Release Distribution (Tarball)
```bash
./mach package
# Output package will be in:
# obj-x86_64-pc-linux-gnu/dist/firefox-*.tar.bz2
```

---

## 5. Verification & Quality Assurance

Before committing or pushing any update, run these checks:

1. **Linting:**
   ```bash
   ./mach lint browser/themes/xp-classic toolkit/themes/xp-classic
   ```
   Must output: `✖ 0 problems (0 errors, 0 warnings, 0 fixed)`.

2. **Automated Mochitests:**
   ```bash
   ./mach test --headless browser/themes/test
   ```

3. **Window Icon & Wayland Integration:**
   - Under Wayland, verify window icon appears as classic Firefox logo (not generic Wayland logo).
   - Ensure `~/.local/share/applications/firefox.desktop` and `firefox-default.desktop` exist with `StartupWMClass=firefox`.
   - Update user icon cache if needed:
     ```bash
     gtk-update-icon-cache -f -t ~/.local/share/icons/hicolor
     ```

---

## 6. Pushing Changes to Remote Repository

To publish changes to the official GitHub repository:
```bash
git push wxp xp-theme
# To update main branch to match xp-theme:
git push wxp xp-theme:main
```

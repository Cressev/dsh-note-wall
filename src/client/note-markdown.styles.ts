/** Generated from note-markdown.module.css; do not edit by hand. */
export const css: Record<string, string | undefined> = {
  "body": "sw-md-body",
  "bullet": "sw-md-bullet",
  "checkbox": "sw-md-checkbox",
  "fmtBar": "sw-md-fmtBar",
  "fmtBtn": "sw-md-fmtBtn",
  "gap": "sw-md-gap",
  "glyphBold": "sw-md-glyphBold",
  "glyphHeading": "sw-md-glyphHeading",
  "glyphItalic": "sw-md-glyphItalic",
  "glyphStrike": "sw-md-glyphStrike",
  "h1": "sw-md-h1",
  "h2": "sw-md-h2",
  "h3": "sw-md-h3",
  "imgStrip": "sw-md-imgStrip",
  "inlineCode": "sw-md-inlineCode",
  "li": "sw-md-li",
  "lightbox": "sw-md-lightbox",
  "p": "sw-md-p",
  "task": "sw-md-task",
  "taskDone": "sw-md-taskDone",
  "thumb": "sw-md-thumb",
  "thumbPending": "sw-md-thumbPending",
}

export const cssText = `
/* Note-Markdown inside candy cards. */

.sw-md-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.sw-md-gap {
  height: 7px;
}

.sw-md-h1 {
  margin: 2px 0 1px;
  font-size: 16.5px;
  font-weight: 800;
  line-height: 1.3;
}

.sw-md-h2 {
  margin: 2px 0 1px;
  font-size: 14.5px;
  font-weight: 800;
  line-height: 1.3;
}

.sw-md-h3 {
  margin: 1px 0;
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 3px;
}

.sw-md-p {
  margin: 0;
  white-space: pre-wrap;
}

.sw-md-li {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-left: 3px;
}

.sw-md-bullet {
  flex: none;
  min-width: 14px;
  font-weight: 700;
  opacity: 0.65;
  text-align: center;
}

.sw-md-task {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 3px;
  margin: 0 -3px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s ease;
}

.sw-md-task:hover {
  background: rgb(255 255 255 / 35%);
}

.sw-md-checkbox {
  position: relative;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border: 1.8px solid currentColor;
  border-radius: 5px;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1;
  opacity: 0.75;
}

.sw-md-checkbox[data-checked='true'] {
  background: currentColor;
  opacity: 0.92;
}

/* The check glyph inverts against the filled box for contrast. */
.sw-md-checkbox[data-checked='true']::after {
  content: '';
  position: absolute;
  left: 3.5px;
  top: 1px;
  width: 4.5px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(42deg);
}

.sw-md-task .sw-md-checkbox[data-checked='true'] {
  color: inherit;
}

.sw-md-taskDone {
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  opacity: 0.55;
}

.sw-md-inlineCode {
  padding: 0.5px 5px;
  border-radius: 6px;
  background: rgb(255 255 255 / 50%);
  font-family: var(--dsw-mono-font, ui-monospace, 'SF Mono', Menlo, Consolas, monospace);
  font-size: 12px;
}

/* ---------- edit toolbar ---------- */

.sw-md-fmtBar {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 0;
}

.sw-md-fmtBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  min-width: 26px;
  padding: 0 6px;
  border: none;
  border-radius: 8px;
  background: rgb(255 255 255 / 40%);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.12s ease;
}

.sw-md-fmtBtn:hover {
  background: rgb(255 255 255 / 85%);
}

/* Letter glyphs for bold/italic/strike/heading — the typographic idiom; the
   previous raw characters (S̶, •, 1., ☑) rendered as mismatched system
   glyphs and emoji. */
.sw-md-glyphBold,
.sw-md-glyphItalic,
.sw-md-glyphStrike,
.sw-md-glyphHeading {
  font-size: 13.5px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  font-family: var(--dsw-ui-font, -apple-system, 'SF Pro Text', 'PingFang SC', sans-serif);
}

.sw-md-glyphBold {
  font-weight: 800;
}

.sw-md-glyphItalic {
  font-style: italic;
  font-weight: 600;
  padding-right: 1px;
}

.sw-md-glyphStrike {
  font-weight: 650;
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

.sw-md-glyphHeading {
  font-weight: 750;
  font-size: 13px;
}

/* ---------- image strip ---------- */

.sw-md-imgStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sw-md-thumb {
  width: 64px;
  height: 64px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: rgb(255 255 255 / 40%);
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.14s ease;
}

.sw-md-thumb:hover {
  transform: scale(1.06);
}

.sw-md-thumbPending {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: rgb(255 255 255 / 40%);
  font-size: 20px;
}

/* ---------- lightbox ---------- */

.sw-md-lightbox {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgb(0 0 0 / 72%);
  cursor: zoom-out;
  animation: fade-in 0.15s ease both;
}

.sw-md-lightbox img {
  max-width: min(92vw, 1100px);
  max-height: 86vh;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgb(0 0 0 / 50%);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

`

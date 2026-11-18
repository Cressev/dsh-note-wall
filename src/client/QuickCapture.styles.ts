/** Generated from QuickCapture.module.css; do not edit by hand. */
export const css: Record<string, string | undefined> = {
  "dot": "sw-capture-dot",
  "dotActive": "sw-capture-dotActive",
  "dots": "sw-capture-dots",
  "pasteStrip": "sw-capture-pasteStrip",
  "pasteThumb": "sw-capture-pasteThumb",
  "pill": "sw-capture-pill",
  "quick": "sw-capture-quick",
  "quickArea": "sw-capture-quickArea",
  "quickClose": "sw-capture-quickClose",
  "quickFoot": "sw-capture-quickFoot",
  "quickHead": "sw-capture-quickHead",
  "quickHint": "sw-capture-quickHint",
  "quickTitle": "sw-capture-quickTitle",
  "root": "sw-capture-root",
  "select": "sw-capture-select",
  "toast": "sw-capture-toast",
}

export const cssText = `
/* Frame-wide capture surfaces: quick bar, selection pill, toast. */

.sw-capture-root {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
}

/* ---------- quick bar ---------- */

.sw-capture-quick {
  position: absolute;
  top: 18px;
  left: 50%;
  width: min(440px, calc(100vw - 48px));
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 10px;
  border-radius: 20px;
  border: 1.5px solid color-mix(in srgb, var(--qc-color, #ffd94d) 75%, transparent);
  background: var(--dsw-alias-bg-elevated, #fff);
  box-shadow: 0 18px 46px rgb(0 0 0 / 22%), 0 0 0 4px color-mix(in srgb, var(--qc-color, #ffd94d) 18%, transparent);
  pointer-events: auto;
  transform: translateX(-50%);
  animation: quick-drop 0.26s cubic-bezier(0.2, 1.3, 0.5, 1) both;
}

.sw-capture-quick[data-color='yellow'] { --qc-color: #ffd94d; }
.sw-capture-quick[data-color='pink'] { --qc-color: #ff9ec4; }
.sw-capture-quick[data-color='mint'] { --qc-color: #7fe6b0; }
.sw-capture-quick[data-color='blue'] { --qc-color: #7dc8ff; }
.sw-capture-quick[data-color='purple'] { --qc-color: #c9a7ff; }
.sw-capture-quick[data-color='orange'] { --qc-color: #ffb366; }

.sw-capture-quickHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sw-capture-quickTitle {
  font-size: 12.5px;
  font-weight: 700;
}

.sw-capture-quickClose {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.5;
}

.sw-capture-quickClose:hover {
  opacity: 1;
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.sw-capture-quickArea {
  border: 1.5px dashed color-mix(in srgb, currentColor 25%, transparent);
  border-radius: 12px;
  padding: 8px 10px;
  background: color-mix(in srgb, var(--qc-color, #ffd94d) 10%, transparent);
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
  resize: none;
  outline: none;
}

.sw-capture-quickArea:focus {
  border-color: color-mix(in srgb, var(--qc-color, #ffd94d) 80%, transparent);
  border-style: solid;
}

.sw-capture-quickFoot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sw-capture-dots {
  display: flex;
  gap: 5px;
}

.sw-capture-dot {
  width: 17px;
  height: 17px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.sw-capture-dot:hover {
  transform: scale(1.25);
}

.sw-capture-dotActive {
  box-shadow:
    0 0 0 2px var(--dsw-alias-bg-elevated, #fff),
    0 0 0 4px color-mix(in srgb, currentColor 70%, transparent);
}

.sw-capture-dot[data-color='yellow'] { background: #ffdb4d; color: #e6a800; }
.sw-capture-dot[data-color='pink'] { background: #ff8fbe; color: #ef4f86; }
.sw-capture-dot[data-color='mint'] { background: #4ee39a; color: #17a06a; }
.sw-capture-dot[data-color='blue'] { background: #66bfff; color: #2f8fdc; }
.sw-capture-dot[data-color='purple'] { background: #b48cff; color: #8349e6; }
.sw-capture-dot[data-color='orange'] { background: #ffab52; color: #dd7a15; }

.sw-capture-select {
  height: 28px;
  max-width: 150px;
  padding: 0 8px;
  border: none;
  border-radius: 9px;
  background: color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.sw-capture-quickHint {
  font-size: 10.5px;
  opacity: 0.45;
  text-align: center;
}

/* ---------- pasted image strip ---------- */

.sw-capture-pasteStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sw-capture-pasteThumb {
  width: 54px;
  height: 54px;
  border-radius: 9px;
  border: 2px solid rgb(255 255 255 / 70%);
  object-fit: cover;
}

/* ---------- selection pill ---------- */

.sw-capture-pill {
  position: absolute;
  transform: translate(-50%, 0);
  height: 30px;
  padding: 0 13px;
  border: none;
  border-radius: 999px;
  background: #ff9ec4;
  color: #4d2436;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 6px 18px rgb(240 96 143 / 40%);
  animation: pill-pop 0.18s ease both;
}

.sw-capture-pill:hover {
  background: #ff8ab8;
  transform: translate(-50%, 0) scale(1.05);
}

/* ---------- toast ---------- */

.sw-capture-toast {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 18px;
  border-radius: 999px;
  background: color-mix(in srgb, #7fe6b0 88%, #fff);
  color: #14442f;
  font-size: 12.5px;
  font-weight: 700;
  box-shadow: 0 8px 22px rgb(47 174 119 / 35%);
  animation: pill-pop 0.2s ease both;
}

/* ---------- animations ---------- */

@keyframes quick-drop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes pill-pop {
  from {
    opacity: 0;
    transform: translate(-50%, 0) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

`

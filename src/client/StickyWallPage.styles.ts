/** Generated from StickyWallPage.module.css; do not edit by hand. */
export const css: Record<string, string | undefined> = {
  "act": "sw-wall-act",
  "actOn": "sw-wall-actOn",
  "card": "sw-wall-card",
  "cardActions": "sw-wall-cardActions",
  "cardMenu": "sw-wall-cardMenu",
  "cardMeta": "sw-wall-cardMeta",
  "count": "sw-wall-count",
  "dot": "sw-wall-dot",
  "dotActive": "sw-wall-dotActive",
  "dots": "sw-wall-dots",
  "editArea": "sw-wall-editArea",
  "editContent": "sw-wall-editContent",
  "editDialog": "sw-wall-editDialog",
  "editHead": "sw-wall-editHead",
  "editMeta": "sw-wall-editMeta",
  "editModal": "sw-wall-editModal",
  "editModalArea": "sw-wall-editModalArea",
  "editPreview": "sw-wall-editPreview",
  "editTab": "sw-wall-editTab",
  "editTabActive": "sw-wall-editTabActive",
  "editTabs": "sw-wall-editTabs",
  "emojiInput": "sw-wall-emojiInput",
  "empty": "sw-wall-empty",
  "errorBanner": "sw-wall-errorBanner",
  "folderChip": "sw-wall-folderChip",
  "folderForm": "sw-wall-folderForm",
  "folderFormRow": "sw-wall-folderFormRow",
  "folderSelect": "sw-wall-folderSelect",
  "formButtons": "sw-wall-formButtons",
  "formError": "sw-wall-formError",
  "grid": "sw-wall-grid",
  "list": "sw-wall-list",
  "loading": "sw-wall-loading",
  "menuDanger": "sw-wall-menuDanger",
  "menuItem": "sw-wall-menuItem",
  "menuMask": "sw-wall-menuMask",
  "moveList": "sw-wall-moveList",
  "moveRow": "sw-wall-moveRow",
  "originLink": "sw-wall-originLink",
  "page": "sw-wall-page",
  "pill": "sw-wall-pill",
  "pillActive": "sw-wall-pillActive",
  "pillAdd": "sw-wall-pillAdd",
  "pillBadge": "sw-wall-pillBadge",
  "pillDanger": "sw-wall-pillDanger",
  "pills": "sw-wall-pills",
  "pin": "sw-wall-pin",
  "pinnedCard": "sw-wall-pinnedCard",
  "previewEmpty": "sw-wall-previewEmpty",
  "recolorRow": "sw-wall-recolorRow",
  "retryBtn": "sw-wall-retryBtn",
  "row": "sw-wall-row",
  "rowActions": "sw-wall-rowActions",
  "rowBar": "sw-wall-rowBar",
  "rowBody": "sw-wall-rowBody",
  "rowEmoji": "sw-wall-rowEmoji",
  "rowPin": "sw-wall-rowPin",
  "rowTags": "sw-wall-rowTags",
  "rowTask": "sw-wall-rowTask",
  "rowText": "sw-wall-rowText",
  "rowTextStruck": "sw-wall-rowTextStruck",
  "rowThumb": "sw-wall-rowThumb",
  "search": "sw-wall-search",
  "searchClear": "sw-wall-searchClear",
  "searchIcon": "sw-wall-searchIcon",
  "searchWrap": "sw-wall-searchWrap",
  "snapKind": "sw-wall-snapKind",
  "snapList": "sw-wall-snapList",
  "snapRow": "sw-wall-snapRow",
  "snapTime": "sw-wall-snapTime",
  "spacer": "sw-wall-spacer",
  "srOnly": "sw-wall-srOnly",
  "stamp": "sw-wall-stamp",
  "struckCard": "sw-wall-struckCard",
  "textBody": "sw-wall-textBody",
  "toolBtn": "sw-wall-toolBtn",
  "toolbar": "sw-wall-toolbar",
  "toolbarButtons": "sw-wall-toolbarButtons",
  "viewBtn": "sw-wall-viewBtn",
  "viewBtnActive": "sw-wall-viewBtnActive",
  "viewToggle": "sw-wall-viewToggle",
}

export const cssText = `
/* Sticky wall: candy-colored, rounded, playful but organized. */

.sw-wall-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding: 18px 20px 24px;
  overflow-y: auto;
}

/* ---------- error banner ---------- */

.sw-wall-errorBanner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, #ffe2e2 82%, #fff);
  border: 1.5px solid color-mix(in srgb, #e05555 45%, transparent);
  color: #a03434;
  font-size: 12.5px;
}

.sw-wall-retryBtn {
  flex: none;
  height: 26px;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: #e05555;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* ---------- toolbar ---------- */

.sw-wall-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sw-wall-searchWrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.sw-wall-searchIcon {
  position: absolute;
  left: 10px;
  width: 15px;
  height: 15px;
  opacity: 0.5;
  pointer-events: none;
}

.sw-wall-search {
  width: 100%;
  padding-left: 32px;
  padding-right: 28px;
  border-radius: 999px;
}

.sw-wall-searchClear {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  opacity: 0.55;
}

.sw-wall-searchClear:hover {
  opacity: 1;
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.sw-wall-toolbarButtons {
  display: flex;
  gap: 6px;
}

/* ---------- view toggle ---------- */

.sw-wall-viewToggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
}

.sw-wall-viewBtn {
  width: 28px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.15s ease;
}

.sw-wall-viewBtn:hover {
  opacity: 0.85;
}

.sw-wall-viewBtnActive {
  background: var(--dsw-alias-bg-elevated, #fff);
  opacity: 1;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
}

.sw-wall-toolBtn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-text-secondary, #888) 30%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-text-secondary, #888);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sw-wall-toolBtn:hover {
  color: var(--dsw-alias-text-primary, inherit);
  border-color: color-mix(in srgb, currentColor 55%, transparent);
  transform: translateY(-1px);
}

/* ---------- folder select ---------- */

.sw-wall-folderSelect {
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 7%, transparent);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

/* ---------- palette dots ---------- */

.sw-wall-dots {
  display: flex;
  gap: 5px;
}

.sw-wall-dot {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.sw-wall-dot:hover {
  transform: scale(1.25);
}

.sw-wall-dotActive {
  box-shadow:
    0 0 0 2px var(--dsw-alias-bg-elevated, #fff),
    0 0 0 4px color-mix(in srgb, currentColor 70%, transparent);
}

.sw-wall-dot[data-color='yellow'] { background: #ffdb4d; color: #e6a800; }
.sw-wall-dot[data-color='pink'] { background: #ff8fbe; color: #ef4f86; }
.sw-wall-dot[data-color='mint'] { background: #4ee39a; color: #17a06a; }
.sw-wall-dot[data-color='blue'] { background: #66bfff; color: #2f8fdc; }
.sw-wall-dot[data-color='purple'] { background: #b48cff; color: #8349e6; }
.sw-wall-dot[data-color='orange'] { background: #ffab52; color: #dd7a15; }

.sw-wall-srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---------- folder pills ---------- */

.sw-wall-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.sw-wall-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  border: 1.5px solid transparent;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
  color: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sw-wall-pill:hover {
  transform: translateY(-1px);
}

.sw-wall-pillActive {
  background: var(--pill-color, color-mix(in srgb, currentColor 16%, transparent));
  border-color: color-mix(in srgb, var(--pill-color, currentColor) 65%, transparent);
  font-weight: 600;
}

.sw-wall-pill[data-color='yellow'] { --pill-color: #ffdb4d; }
.sw-wall-pill[data-color='pink'] { --pill-color: #ff8fbe; }
.sw-wall-pill[data-color='mint'] { --pill-color: #4ee39a; }
.sw-wall-pill[data-color='blue'] { --pill-color: #66bfff; }
.sw-wall-pill[data-color='purple'] { --pill-color: #b48cff; }
.sw-wall-pill[data-color='orange'] { --pill-color: #ffab52; }

.sw-wall-pillActive,
.sw-wall-pill[data-color].sw-wall-pillActive {
  color: #2b2320;
}

.sw-wall-pillAdd {
  padding: 0 9px;
}

.sw-wall-pillBadge {
  box-shadow: 0 0 0 2px color-mix(in srgb, #ff7a7a 55%, transparent);
}

.sw-wall-pillDanger {
  color: #e05555;
  border-color: color-mix(in srgb, #e05555 45%, transparent);
}

/* Count: quiet tabular numeral, no chip background — the old translucent
   dark pill read as a dirty shadow on the light capsules. */
.sw-wall-count {
  min-width: 14px;
  padding: 0 1px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
  opacity: 0.55;
}

.sw-wall-pillActive .sw-wall-count {
  opacity: 0.75;
}

/* ---------- note grid & cards ---------- */

/* Masonry via CSS columns: every card keeps its own content height, so short
   notes read as small stickies beside longer ones instead of stretching to
   match the tallest sibling in a grid row. */
.sw-wall-grid {
  columns: 210px;
  column-gap: 14px;
  align-content: start;
  padding-bottom: 30px;
}

.sw-wall-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  margin: 0 0 14px;
  padding: 14px 13px 10px;
  border-radius: 16px;
  background: var(--card-color, #ffdb4d);
  color: #33291f;
  box-shadow:
    0 6px 16px color-mix(in srgb, var(--card-color, #ffd94d) 45%, rgb(0 0 0 / 14%)),
    0 1px 3px rgb(0 0 0 / 10%);
  transform: rotate(var(--tilt, 0deg));
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  animation: stick-drop 0.32s cubic-bezier(0.2, 1.4, 0.5, 1) both;
  animation-delay: var(--drop, 0ms);
  overflow: visible;
  break-inside: avoid;
}

.sw-wall-card::before {
  /* washi tape strip */
  content: '';
  position: absolute;
  top: -7px;
  left: 50%;
  width: 46px;
  height: 15px;
  background: rgb(255 255 255 / 45%);
  border-radius: 3px;
  transform: translateX(-50%) rotate(calc(var(--tilt, 0deg) * -1.6));
  backdrop-filter: blur(1px);
  box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
}

.sw-wall-card:hover {
  transform: rotate(0deg) translateY(-3px) scale(1.02);
  box-shadow:
    0 12px 26px color-mix(in srgb, var(--card-color, #ffd94d) 55%, rgb(0 0 0 / 18%)),
    0 2px 6px rgb(0 0 0 / 12%);
  z-index: 3;
}

.sw-wall-card[data-color='yellow'] { --card-color: #ffdb4d; }
.sw-wall-card[data-color='pink'] { --card-color: #ff8fbe; }
.sw-wall-card[data-color='mint'] { --card-color: #4ee39a; }
.sw-wall-card[data-color='blue'] { --card-color: #66bfff; }
.sw-wall-card[data-color='purple'] { --card-color: #b48cff; }
.sw-wall-card[data-color='orange'] { --card-color: #ffab52; }

.sw-wall-pinnedCard {
  box-shadow:
    0 6px 16px color-mix(in srgb, var(--card-color, #ffd94d) 45%, rgb(0 0 0 / 14%)),
    0 0 0 2px color-mix(in srgb, var(--card-color, #ffd94d) 80%, #fff);
}

.sw-wall-pin {
  position: absolute;
  top: -10px;
  right: 10px;
  font-size: 17px;
  filter: drop-shadow(0 2px 2px rgb(0 0 0 / 25%));
  transform: rotate(12deg);
  z-index: 2;
}

.sw-wall-struckCard .sw-wall-textBody {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: rgb(0 0 0 / 35%);
  opacity: 0.55;
}

.sw-wall-textBody {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: default;
}

.sw-wall-editArea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  background: rgb(255 255 255 / 45%);
  border-radius: 10px;
  padding: 7px 9px;
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
}

.sw-wall-cardMeta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sw-wall-folderChip {
  padding: 1.5px 8px;
  border-radius: 999px;
  background: rgb(255 255 255 / 55%);
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

.sw-wall-originLink {
  border: none;
  background: rgb(255 255 255 / 40%);
  padding: 1.5px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.sw-wall-originLink:hover {
  background: rgb(255 255 255 / 80%);
}

.sw-wall-stamp {
  margin-left: auto;
  font-size: 10px;
  opacity: 0.55;
}

.sw-wall-cardActions {
  display: flex;
  align-items: center;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sw-wall-card:hover .sw-wall-cardActions,
.sw-wall-card:focus-within .sw-wall-cardActions {
  opacity: 1;
}

.sw-wall-act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 5px;
  border: none;
  border-radius: 8px;
  background: rgb(255 255 255 / 40%);
  font-size: 12px;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.sw-wall-act:hover {
  background: rgb(255 255 255 / 85%);
  transform: scale(1.08);
}

.sw-wall-actOn {
  background: rgb(255 255 255 / 95%);
  box-shadow: inset 0 0 0 1.5px rgb(0 0 0 / 20%);
}

/* ---------- list view ---------- */

.sw-wall-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 30px;
}

.sw-wall-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px 9px 16px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-bg-elevated, #fff) 96%, var(--row-color, #ffd94d));
  border: 1px solid color-mix(in srgb, var(--row-color, #ffd94d) 30%, transparent);
  cursor: pointer;
  transition: transform 0.14s ease, box-shadow 0.14s ease;
  animation: row-in 0.22s ease both;
}

.sw-wall-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px color-mix(in srgb, var(--row-color, #ffd94d) 30%, rgb(0 0 0 / 8%));
}

.sw-wall-row[data-color='yellow'] { --row-color: #ffdb4d; }
.sw-wall-row[data-color='pink'] { --row-color: #ff8fbe; }
.sw-wall-row[data-color='mint'] { --row-color: #4ee39a; }
.sw-wall-row[data-color='blue'] { --row-color: #66bfff; }
.sw-wall-row[data-color='purple'] { --row-color: #b48cff; }
.sw-wall-row[data-color='orange'] { --row-color: #ffab52; }

.sw-wall-rowBar {
  position: absolute;
  left: 5px;
  top: 7px;
  bottom: 7px;
  width: 4px;
  border-radius: 999px;
  background: var(--row-color, #ffd94d);
}

.sw-wall-rowPin {
  font-size: 13px;
  transform: rotate(12deg);
}

.sw-wall-rowEmoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--row-color, #ffd94d) 30%, transparent);
  font-size: 14px;
  flex: none;
}

.sw-wall-rowThumb {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  object-fit: cover;
  flex: none;
}

.sw-wall-rowBody {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.sw-wall-rowText {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-wall-rowTextStruck {
  text-decoration: line-through;
  opacity: 0.55;
}

.sw-wall-rowTags {
  display: inline-flex;
  gap: 6px;
  flex: none;
  font-size: 10.5px;
  opacity: 0.75;
}

.sw-wall-rowTask {
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--row-color, #ffd94d) 22%, transparent);
  white-space: nowrap;
}

.sw-wall-rowActions {
  display: inline-flex;
  gap: 3px;
  flex: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sw-wall-row:hover .sw-wall-rowActions {
  opacity: 1;
}

@keyframes row-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- edit modal ---------- */

/* Applied through Modal's \`className\`: widen the dialog itself (the shipped
   default is 380px) and let the body fill it. */
.sw-wall-editDialog {
  width: min(640px, calc(100vw - 48px));
}

/* Applied through Modal's \`contentClassName\`: the body block's default
   margin-top (20px) plus the header's own bottom padding reads as a hole
   under the title; collapse it so the toolbar sits close under the header. */
.sw-wall-editContent > :last-child {
  margin-top: 0;
}

.sw-wall-editModal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.sw-wall-editHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sw-wall-editTabs {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
}

.sw-wall-editTab {
  height: 24px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.55;
}

.sw-wall-editTabActive {
  background: var(--dsw-alias-bg-elevated, #fff);
  opacity: 1;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
}

.sw-wall-editModalArea {
  min-height: 240px;
  padding: 12px 14px;
  border: 1.5px solid color-mix(in srgb, var(--edit-color, #ffd94d) 45%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--edit-color, #ffd94d) 7%, transparent);
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.sw-wall-editModalArea[data-color='yellow'] { --edit-color: #ffdb4d; }
.sw-wall-editModalArea[data-color='pink'] { --edit-color: #ff8fbe; }
.sw-wall-editModalArea[data-color='mint'] { --edit-color: #4ee39a; }
.sw-wall-editModalArea[data-color='blue'] { --edit-color: #66bfff; }
.sw-wall-editModalArea[data-color='purple'] { --edit-color: #b48cff; }
.sw-wall-editModalArea[data-color='orange'] { --edit-color: #ffab52; }

.sw-wall-editModalArea:focus {
  border-color: var(--edit-color, #ffd94d);
}

.sw-wall-editPreview {
  min-height: 240px;
  max-height: 46vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--edit-color, #ffd94d);
  color: #33291f;
  min-width: 0;
}

.sw-wall-editPreview[data-color='yellow'] { --edit-color: #ffdb4d; }
.sw-wall-editPreview[data-color='pink'] { --edit-color: #ff8fbe; }
.sw-wall-editPreview[data-color='mint'] { --edit-color: #4ee39a; }
.sw-wall-editPreview[data-color='blue'] { --edit-color: #66bfff; }
.sw-wall-editPreview[data-color='purple'] { --edit-color: #b48cff; }
.sw-wall-editPreview[data-color='orange'] { --edit-color: #ffab52; }

.sw-wall-previewEmpty {
  opacity: 0.5;
}

.sw-wall-editMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sw-wall-menuMask {
  position: fixed;
  inset: 0;
  z-index: 40;
}

.sw-wall-cardMenu {
  position: absolute;
  right: 10px;
  bottom: 34px;
  z-index: 41;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
  padding: 8px;
  border-radius: 14px;
  background: var(--dsw-alias-bg-elevated, #fff);
  box-shadow: 0 10px 28px rgb(0 0 0 / 18%);
  animation: menu-pop 0.16s ease both;
}

.sw-wall-recolorRow {
  display: flex;
  gap: 5px;
  padding: 2px 4px 6px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  margin-bottom: 2px;
}

.sw-wall-menuItem {
  border: none;
  background: transparent;
  color: inherit;
  padding: 6px 8px;
  border-radius: 9px;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.sw-wall-menuItem:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.sw-wall-menuDanger {
  color: #e05555;
}

/* ---------- empty / loading / misc ---------- */

.sw-wall-empty {
  grid-column: 1 / -1;
  padding: 44px 0;
  text-align: center;
  font-size: 13.5px;
  opacity: 0.55;
}

.sw-wall-loading {
  padding: 40px;
  text-align: center;
  opacity: 0.5;
}

.sw-wall-moveList {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
}

.sw-wall-moveRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
}

.sw-wall-moveRow:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.sw-wall-snapList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
  max-height: 320px;
  overflow-y: auto;
}

.sw-wall-snapRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: color-mix(in srgb, currentColor 5%, transparent);
}

.sw-wall-snapKind {
  font-size: 12px;
  font-weight: 600;
}

.sw-wall-snapTime {
  flex: 1;
  font-size: 11.5px;
  opacity: 0.6;
}

.sw-wall-folderForm {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 300px;
}

.sw-wall-folderFormRow {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sw-wall-emojiInput {
  width: 52px;
  height: 34px;
  text-align: center;
  font-size: 17px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  background: transparent;
  color: inherit;
}

.sw-wall-formError {
  color: #e05555;
  font-size: 12px;
}

.sw-wall-formButtons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sw-wall-spacer {
  flex: 1;
}

/* ---------- animations ---------- */

@keyframes stick-drop {
  0% {
    opacity: 0;
    transform: rotate(var(--tilt, 0deg)) translateY(-14px) scale(0.92);
  }
  70% {
    opacity: 1;
    transform: rotate(var(--tilt, 0deg)) translateY(3px) scale(1.03);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--tilt, 0deg)) translateY(0) scale(1);
  }
}

@keyframes menu-pop {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ---------- dark mode: keep the candy, lift the ink ---------- */

@media (prefers-color-scheme: dark) {
  .sw-wall-card {
    color: #241d16;
    filter: saturate(1.05) brightness(0.94);
  }

  .sw-wall-pillActive,
  .sw-wall-pill[data-color].sw-wall-pillActive {
    color: #241d16;
  }
}

`

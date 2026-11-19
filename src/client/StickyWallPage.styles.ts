/** Scoped sticky-wall styles, injected by the client plugin. */
export const css: Record<string, string | undefined> = {
  'act': 'sw-stickywallpage-act',
  'actOn': 'sw-stickywallpage-actOn',
  'card': 'sw-stickywallpage-card',
  'cardActions': 'sw-stickywallpage-cardActions',
  'cardMenu': 'sw-stickywallpage-cardMenu',
  'cardMeta': 'sw-stickywallpage-cardMeta',
  'cardSlot': 'sw-stickywallpage-cardSlot',
  'count': 'sw-stickywallpage-count',
  'dot': 'sw-stickywallpage-dot',
  'dotActive': 'sw-stickywallpage-dotActive',
  'dots': 'sw-stickywallpage-dots',
  'editArea': 'sw-stickywallpage-editArea',
  'editContent': 'sw-stickywallpage-editContent',
  'editDialog': 'sw-stickywallpage-editDialog',
  'editHead': 'sw-stickywallpage-editHead',
  'editMeta': 'sw-stickywallpage-editMeta',
  'editModal': 'sw-stickywallpage-editModal',
  'editModalArea': 'sw-stickywallpage-editModalArea',
  'editPreview': 'sw-stickywallpage-editPreview',
  'editTab': 'sw-stickywallpage-editTab',
  'editTabActive': 'sw-stickywallpage-editTabActive',
  'editTabs': 'sw-stickywallpage-editTabs',
  'emojiInput': 'sw-stickywallpage-emojiInput',
  'empty': 'sw-stickywallpage-empty',
  'errorBanner': 'sw-stickywallpage-errorBanner',
  'folderChip': 'sw-stickywallpage-folderChip',
  'folderForm': 'sw-stickywallpage-folderForm',
  'folderFormRow': 'sw-stickywallpage-folderFormRow',
  'folderSelect': 'sw-stickywallpage-folderSelect',
  'formButtons': 'sw-stickywallpage-formButtons',
  'formError': 'sw-stickywallpage-formError',
  'grid': 'sw-stickywallpage-grid',
  'list': 'sw-stickywallpage-list',
  'loading': 'sw-stickywallpage-loading',
  'menuDanger': 'sw-stickywallpage-menuDanger',
  'menuItem': 'sw-stickywallpage-menuItem',
  'menuMask': 'sw-stickywallpage-menuMask',
  'moveList': 'sw-stickywallpage-moveList',
  'moveRow': 'sw-stickywallpage-moveRow',
  'originLink': 'sw-stickywallpage-originLink',
  'page': 'sw-stickywallpage-page',
  'pill': 'sw-stickywallpage-pill',
  'pillActive': 'sw-stickywallpage-pillActive',
  'pillAdd': 'sw-stickywallpage-pillAdd',
  'pillBadge': 'sw-stickywallpage-pillBadge',
  'pillDanger': 'sw-stickywallpage-pillDanger',
  'pills': 'sw-stickywallpage-pills',
  'pin': 'sw-stickywallpage-pin',
  'pinnedCard': 'sw-stickywallpage-pinnedCard',
  'previewEmpty': 'sw-stickywallpage-previewEmpty',
  'recolorRow': 'sw-stickywallpage-recolorRow',
  'retryBtn': 'sw-stickywallpage-retryBtn',
  'row': 'sw-stickywallpage-row',
  'rowActions': 'sw-stickywallpage-rowActions',
  'rowBar': 'sw-stickywallpage-rowBar',
  'rowBody': 'sw-stickywallpage-rowBody',
  'rowEmoji': 'sw-stickywallpage-rowEmoji',
  'rowPin': 'sw-stickywallpage-rowPin',
  'rowTags': 'sw-stickywallpage-rowTags',
  'rowTask': 'sw-stickywallpage-rowTask',
  'rowText': 'sw-stickywallpage-rowText',
  'rowTextStruck': 'sw-stickywallpage-rowTextStruck',
  'rowThumb': 'sw-stickywallpage-rowThumb',
  'search': 'sw-stickywallpage-search',
  'searchClear': 'sw-stickywallpage-searchClear',
  'searchIcon': 'sw-stickywallpage-searchIcon',
  'searchWrap': 'sw-stickywallpage-searchWrap',
  'snapKind': 'sw-stickywallpage-snapKind',
  'snapList': 'sw-stickywallpage-snapList',
  'snapRow': 'sw-stickywallpage-snapRow',
  'snapTime': 'sw-stickywallpage-snapTime',
  'spacer': 'sw-stickywallpage-spacer',
  'srOnly': 'sw-stickywallpage-srOnly',
  'stamp': 'sw-stickywallpage-stamp',
  'struckCard': 'sw-stickywallpage-struckCard',
  'textBody': 'sw-stickywallpage-textBody',
  'toolBtn': 'sw-stickywallpage-toolBtn',
  'toolbar': 'sw-stickywallpage-toolbar',
  'toolbarButtons': 'sw-stickywallpage-toolbarButtons',
  'viewBtn': 'sw-stickywallpage-viewBtn',
  'viewBtnActive': 'sw-stickywallpage-viewBtnActive',
  'viewToggle': 'sw-stickywallpage-viewToggle',
}
export const cssText = `/* Sticky wall: candy-colored, rounded, playful but organized. */

.sw-stickywallpage-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding: 18px 20px 24px;
  overflow-y: auto;
}

/* ---------- error banner ---------- */

.sw-stickywallpage-errorBanner {
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

.sw-stickywallpage-retryBtn {
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

.sw-stickywallpage-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.sw-stickywallpage-searchWrap {
  position: relative;
  flex: 1;
  min-width: 160px;
  display: flex;
  align-items: center;
}

.sw-stickywallpage-searchIcon {
  position: absolute;
  left: 10px;
  width: 15px;
  height: 15px;
  opacity: 0.5;
  pointer-events: none;
}

.sw-stickywallpage-search {
  width: 100%;
  padding-left: 32px;
  padding-right: 28px;
  border-radius: 999px;
  color: inherit;
}

.sw-stickywallpage-search::placeholder {
  color: currentColor;
  opacity: 0.65;
}

.sw-stickywallpage-searchClear {
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

.sw-stickywallpage-searchClear:hover {
  opacity: 1;
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.sw-stickywallpage-toolbarButtons {
  display: flex;
  gap: 6px;
}

/* ---------- view toggle ---------- */

.sw-stickywallpage-viewToggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
}

.sw-stickywallpage-viewBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  opacity: 0.75;
  transition: all 0.15s ease;
}

.sw-stickywallpage-viewBtn:hover {
  opacity: 0.85;
}

.sw-stickywallpage-viewBtnActive {
  background: #f2f2f2;
  color: #26282c;
  opacity: 1;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
}

.sw-stickywallpage-toolBtn {
  height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, currentColor 32%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  color: inherit;
  font-size: 13px;
  opacity: 0.86;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sw-stickywallpage-toolBtn:hover {
  opacity: 1;
  border-color: color-mix(in srgb, currentColor 55%, transparent);
  transform: translateY(-1px);
}

/* ---------- folder select ---------- */

.sw-stickywallpage-folderSelect {
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 7%, transparent);
  color: inherit;
  color-scheme: light;
  font-size: 12px;
  cursor: pointer;
}

/* Native select popups can stay light even when the app uses a dark theme. */
.sw-stickywallpage-folderSelect option {
  color: #202329;
  background: #fff;
}

/* ---------- palette dots ---------- */

.sw-stickywallpage-dots {
  display: flex;
  gap: 5px;
}

.sw-stickywallpage-dot {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.sw-stickywallpage-dot:hover {
  transform: scale(1.25);
}

.sw-stickywallpage-dotActive {
  box-shadow:
    0 0 0 2px var(--dsw-alias-bg-elevated, #fff),
    0 0 0 4px color-mix(in srgb, currentColor 70%, transparent);
}

.sw-stickywallpage-dot[data-color='yellow'] { background: #ffdb4d; color: #e6a800; }
.sw-stickywallpage-dot[data-color='pink'] { background: #ff8fbe; color: #ef4f86; }
.sw-stickywallpage-dot[data-color='mint'] { background: #4ee39a; color: #17a06a; }
.sw-stickywallpage-dot[data-color='blue'] { background: #66bfff; color: #2f8fdc; }
.sw-stickywallpage-dot[data-color='purple'] { background: #b48cff; color: #8349e6; }
.sw-stickywallpage-dot[data-color='orange'] { background: #ffab52; color: #dd7a15; }

.sw-stickywallpage-srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---------- folder pills ---------- */

.sw-stickywallpage-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.sw-stickywallpage-pill {
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

.sw-stickywallpage-pill:hover {
  transform: translateY(-1px);
}

.sw-stickywallpage-pillActive {
  background: var(--pill-color, #e8e9eb);
  border-color: color-mix(in srgb, var(--pill-color, #e8e9eb) 80%, transparent);
  font-weight: 600;
}

.sw-stickywallpage-pill[data-color='yellow'] { --pill-color: #ffdb4d; }
.sw-stickywallpage-pill[data-color='pink'] { --pill-color: #ff8fbe; }
.sw-stickywallpage-pill[data-color='mint'] { --pill-color: #4ee39a; }
.sw-stickywallpage-pill[data-color='blue'] { --pill-color: #66bfff; }
.sw-stickywallpage-pill[data-color='purple'] { --pill-color: #b48cff; }
.sw-stickywallpage-pill[data-color='orange'] { --pill-color: #ffab52; }

.sw-stickywallpage-pillActive,
.sw-stickywallpage-pill[data-color].sw-stickywallpage-pillActive {
  color: #2b2320;
}

.sw-stickywallpage-pillAdd {
  padding: 0 9px;
}

.sw-stickywallpage-pillBadge {
  box-shadow: 0 0 0 2px color-mix(in srgb, #ff7a7a 55%, transparent);
}

.sw-stickywallpage-pillDanger {
  color: #e05555;
  border-color: color-mix(in srgb, #e05555 45%, transparent);
}

/* Count: quiet tabular numeral, no chip background — the old translucent
   dark pill read as a dirty shadow on the light capsules. */
.sw-stickywallpage-count {
  min-width: 14px;
  padding: 0 1px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
  opacity: 0.55;
}

.sw-stickywallpage-pillActive .sw-stickywallpage-count {
  opacity: 0.75;
}

/* ---------- note grid & cards ---------- */

/* Fill the available width before wrapping to another row. */
.sw-stickywallpage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(210px, 100%), 1fr));
  align-items: start;
  gap: 14px;
  padding-bottom: 30px;
}

/* Leave room for the tape above each card without letting it overlap a row. */
.sw-stickywallpage-cardSlot {
  padding-top: 7px;
  min-width: 0;
}

.sw-stickywallpage-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  margin: 0;
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
}

.sw-stickywallpage-card::before {
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

.sw-stickywallpage-card:hover {
  transform: rotate(0deg) translateY(-3px) scale(1.02);
  box-shadow:
    0 12px 26px color-mix(in srgb, var(--card-color, #ffd94d) 55%, rgb(0 0 0 / 18%)),
    0 2px 6px rgb(0 0 0 / 12%);
  z-index: 3;
}

.sw-stickywallpage-card[data-color='yellow'] { --card-color: #ffdb4d; }
.sw-stickywallpage-card[data-color='pink'] { --card-color: #ff8fbe; }
.sw-stickywallpage-card[data-color='mint'] { --card-color: #4ee39a; }
.sw-stickywallpage-card[data-color='blue'] { --card-color: #66bfff; }
.sw-stickywallpage-card[data-color='purple'] { --card-color: #b48cff; }
.sw-stickywallpage-card[data-color='orange'] { --card-color: #ffab52; }

.sw-stickywallpage-pinnedCard {
  box-shadow:
    0 6px 16px color-mix(in srgb, var(--card-color, #ffd94d) 45%, rgb(0 0 0 / 14%)),
    0 0 0 2px color-mix(in srgb, var(--card-color, #ffd94d) 80%, #fff);
}

.sw-stickywallpage-pin {
  position: absolute;
  top: -10px;
  right: 10px;
  font-size: 17px;
  filter: drop-shadow(0 2px 2px rgb(0 0 0 / 25%));
  transform: rotate(12deg);
  z-index: 2;
}

.sw-stickywallpage-struckCard .sw-stickywallpage-textBody {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  text-decoration-color: rgb(0 0 0 / 35%);
  opacity: 0.55;
}

.sw-stickywallpage-textBody {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: default;
}

.sw-stickywallpage-editArea {
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

.sw-stickywallpage-cardMeta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sw-stickywallpage-folderChip {
  padding: 1.5px 8px;
  border-radius: 999px;
  background: rgb(255 255 255 / 55%);
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

.sw-stickywallpage-originLink {
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

.sw-stickywallpage-originLink:hover {
  background: rgb(255 255 255 / 80%);
}

.sw-stickywallpage-stamp {
  margin-left: auto;
  font-size: 10px;
  opacity: 0.55;
}

.sw-stickywallpage-cardActions {
  display: flex;
  align-items: center;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sw-stickywallpage-card:hover .sw-stickywallpage-cardActions,
.sw-stickywallpage-card:focus-within .sw-stickywallpage-cardActions {
  opacity: 1;
}

.sw-stickywallpage-act {
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

.sw-stickywallpage-act:hover {
  background: rgb(255 255 255 / 85%);
  transform: scale(1.08);
}

.sw-stickywallpage-actOn {
  background: rgb(255 255 255 / 95%);
  box-shadow: inset 0 0 0 1.5px rgb(0 0 0 / 20%);
}

/* ---------- list view ---------- */

.sw-stickywallpage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 30px;
}

.sw-stickywallpage-row {
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

.sw-stickywallpage-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 16px color-mix(in srgb, var(--row-color, #ffd94d) 30%, rgb(0 0 0 / 8%));
}

.sw-stickywallpage-row[data-color='yellow'] { --row-color: #ffdb4d; }
.sw-stickywallpage-row[data-color='pink'] { --row-color: #ff8fbe; }
.sw-stickywallpage-row[data-color='mint'] { --row-color: #4ee39a; }
.sw-stickywallpage-row[data-color='blue'] { --row-color: #66bfff; }
.sw-stickywallpage-row[data-color='purple'] { --row-color: #b48cff; }
.sw-stickywallpage-row[data-color='orange'] { --row-color: #ffab52; }

.sw-stickywallpage-rowBar {
  position: absolute;
  left: 5px;
  top: 7px;
  bottom: 7px;
  width: 4px;
  border-radius: 999px;
  background: var(--row-color, #ffd94d);
}

.sw-stickywallpage-rowPin {
  font-size: 13px;
  transform: rotate(12deg);
}

.sw-stickywallpage-rowEmoji {
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

.sw-stickywallpage-rowThumb {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  object-fit: cover;
  flex: none;
}

.sw-stickywallpage-rowBody {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.sw-stickywallpage-rowText {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sw-stickywallpage-rowTextStruck {
  text-decoration: line-through;
  opacity: 0.55;
}

.sw-stickywallpage-rowTags {
  display: inline-flex;
  gap: 6px;
  flex: none;
  font-size: 10.5px;
  opacity: 0.75;
}

.sw-stickywallpage-rowTask {
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--row-color, #ffd94d) 22%, transparent);
  white-space: nowrap;
}

.sw-stickywallpage-rowActions {
  display: inline-flex;
  gap: 3px;
  flex: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sw-stickywallpage-row:hover .sw-stickywallpage-rowActions {
  opacity: 1;
}

@keyframes row-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- edit modal ---------- */

/* Applied through Modal's \`className\`: widen the dialog itself (the shipped
   default is 380px) and let the body fill it. */
.sw-stickywallpage-editDialog {
  width: min(640px, calc(100vw - 48px));
}

/* Applied through Modal's \`contentClassName\`: the body block's default
   margin-top (20px) plus the header's own bottom padding reads as a hole
   under the title; collapse it so the toolbar sits close under the header. */
.sw-stickywallpage-editContent > :last-child {
  margin-top: 0;
}

.sw-stickywallpage-editModal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.sw-stickywallpage-editHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sw-stickywallpage-editTabs {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
}

.sw-stickywallpage-editTab {
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

.sw-stickywallpage-editTabActive {
  background: #f2f2f2;
  color: #26282c;
  opacity: 1;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%);
}

.sw-stickywallpage-viewBtn:focus-visible,
.sw-stickywallpage-toolBtn:focus-visible,
.sw-stickywallpage-pill:focus-visible,
.sw-stickywallpage-editTab:focus-visible,
.sw-stickywallpage-folderSelect:focus-visible {
  outline: 2px solid #668fff;
  outline-offset: 2px;
}

.sw-stickywallpage-editModalArea {
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

.sw-stickywallpage-editModalArea[data-color='yellow'] { --edit-color: #ffdb4d; }
.sw-stickywallpage-editModalArea[data-color='pink'] { --edit-color: #ff8fbe; }
.sw-stickywallpage-editModalArea[data-color='mint'] { --edit-color: #4ee39a; }
.sw-stickywallpage-editModalArea[data-color='blue'] { --edit-color: #66bfff; }
.sw-stickywallpage-editModalArea[data-color='purple'] { --edit-color: #b48cff; }
.sw-stickywallpage-editModalArea[data-color='orange'] { --edit-color: #ffab52; }

.sw-stickywallpage-editModalArea:focus {
  border-color: var(--edit-color, #ffd94d);
}

.sw-stickywallpage-editPreview {
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

.sw-stickywallpage-editPreview[data-color='yellow'] { --edit-color: #ffdb4d; }
.sw-stickywallpage-editPreview[data-color='pink'] { --edit-color: #ff8fbe; }
.sw-stickywallpage-editPreview[data-color='mint'] { --edit-color: #4ee39a; }
.sw-stickywallpage-editPreview[data-color='blue'] { --edit-color: #66bfff; }
.sw-stickywallpage-editPreview[data-color='purple'] { --edit-color: #b48cff; }
.sw-stickywallpage-editPreview[data-color='orange'] { --edit-color: #ffab52; }

.sw-stickywallpage-previewEmpty {
  opacity: 0.5;
}

.sw-stickywallpage-editMeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sw-stickywallpage-menuMask {
  position: fixed;
  inset: 0;
  z-index: 40;
}

.sw-stickywallpage-cardMenu {
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

.sw-stickywallpage-recolorRow {
  display: flex;
  gap: 5px;
  padding: 2px 4px 6px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  margin-bottom: 2px;
}

.sw-stickywallpage-menuItem {
  border: none;
  background: transparent;
  color: inherit;
  padding: 6px 8px;
  border-radius: 9px;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.sw-stickywallpage-menuItem:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.sw-stickywallpage-menuDanger {
  color: #e05555;
}

/* ---------- empty / loading / misc ---------- */

.sw-stickywallpage-empty {
  grid-column: 1 / -1;
  padding: 44px 0;
  text-align: center;
  font-size: 13.5px;
  opacity: 0.55;
}

.sw-stickywallpage-loading {
  padding: 40px;
  text-align: center;
  opacity: 0.5;
}

.sw-stickywallpage-moveList {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
}

.sw-stickywallpage-moveRow {
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

.sw-stickywallpage-moveRow:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.sw-stickywallpage-snapList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
  max-height: 320px;
  overflow-y: auto;
}

.sw-stickywallpage-snapRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: color-mix(in srgb, currentColor 5%, transparent);
}

.sw-stickywallpage-snapKind {
  font-size: 12px;
  font-weight: 600;
}

.sw-stickywallpage-snapTime {
  flex: 1;
  font-size: 11.5px;
  opacity: 0.6;
}

.sw-stickywallpage-folderForm {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 300px;
}

.sw-stickywallpage-folderFormRow {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sw-stickywallpage-emojiInput {
  width: 52px;
  height: 34px;
  text-align: center;
  font-size: 17px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  background: transparent;
  color: inherit;
}

.sw-stickywallpage-formError {
  color: #e05555;
  font-size: 12px;
}

.sw-stickywallpage-formButtons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sw-stickywallpage-spacer {
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
  .sw-stickywallpage-card {
    color: #241d16;
    filter: saturate(1.05) brightness(0.94);
  }

  .sw-stickywallpage-pillActive,
  .sw-stickywallpage-pill[data-color].sw-stickywallpage-pillActive {
    color: #241d16;
  }
}
`

/**
 * Browser entry: re-export the plugin face from the implementation module.
 *
 * @module sticky-wall-plugin/client
 */
export { apply, inject, PANEL_ID } from './main.tsx'
export type { StickyWallInjected } from './StickyWallPage.tsx'
export type { StickyWallApi, WallSnapshot } from './wall-source.ts'
export { WallSource } from './wall-source.ts'

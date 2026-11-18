/**
 * Client plugin for the sticky wall: sidebar entry, the main wall panel, the
 * frame-wide capture overlay (quick bar + selection pill), and the
 * session-tracker anchor that records which conversation is showing.
 *
 * The `stickyWall` remote namespace is hand-written and mounted in a child
 * fiber (the proven temporary-session pattern); the page and the overlay
 * share one WallSource so captures appear on the wall immediately.
 *
 * @module sticky-wall-plugin/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { stickyWallRemote } from '../remote.ts'
import { en, NS, zh, type StickyWallKey } from './locales.ts'
import { QuickCapture, makeJump, setStickySessionId } from './QuickCapture.tsx'
import { StickyPanelIcon } from './StickyPanelIcon.tsx'
import { StickyWallPage } from './StickyWallPage.tsx'
import { SyncController, type SyncApi } from './sync-controller.ts'
import { WallSource, type StickyWallApi } from './wall-source.ts'
import { cssText as pageCss } from './StickyWallPage.styles.ts'
import { cssText as captureCss } from './QuickCapture.styles.ts'
import { cssText as markdownCss } from './note-markdown.styles.ts'

/**
 * Append the wall stylesheets once per page. The bundle ships styles inline
 * instead of importing CSS modules, so this is the only place they reach the DOM.
 */
function injectStyles(): void {
  const marker = 'dsh-sticky-wall-styles'
  if (document.getElementById(marker) !== null) return
  const style = document.createElement('style')
  style.id = marker
  style.textContent = [pageCss, captureCss, markdownCss].join('\n')
  document.head.appendChild(style)
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Sticky wall page and capture copy. */
    stickyWall: StickyWallKey
  }
}

/** Panel id shared by the sidebar entry and the main panel registration. */
export const PANEL_ID = 'stickyWall' as MainPanelId

/** Required services: slots, locale, remote, workspace navigation. */
export const inject = ['slots', 'locale', 'remote', 'uiWorkspace']

/**
 * Client plugin body: dictionaries, the remote mount, and the registrations.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  injectStyles()
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'stickyWall: dictionaries')
  ctx.plugin(async (owner) => {
    await owner.remote.$mount(stickyWallRemote)
    owner.inject(['remote.stickyWall'], (scope) => {
      const source = new WallSource(scope.remote.stickyWall as unknown as StickyWallApi)
      const uiWorkspace = scope.uiWorkspace as UiWorkspace
      const jumpToOrigin = makeJump(sessionId => { uiWorkspace.openSession(sessionId as SessionId) })
      const sync = new SyncController(scope.remote.stickyWall as unknown as SyncApi, () => { source.reload() })
      scope.effect(() => { sync.start(); return () => { sync.stop() } }, 'stickyWall: cloud sync')

      ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        inject: () => ({ source, sync, jumpToOrigin, hooks: { wall: source } }),
      }, StickyWallPage)), 'stickyWall: main panel')

      ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 21,
        locale: NS,
        label: () => t('panel'),
      }, StickyPanelIcon)), 'stickyWall: sidebar entry')

      ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'stickyWall.capture',
        locale: NS,
        inject: () => ({ source, hooks: { wall: source } }),
      }, QuickCapture)), 'stickyWall: capture overlay')

      // Session tracker: a null-rendering dock entry whose per-session mount
      // records which conversation the selection pill should attribute to.
      ctx.effect(() => ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'stickyWall.sessionTracker',
        inject: (sessionId: string) => {
          setStickySessionId(sessionId)
          return {}
        },
      }, SessionTracker)), 'stickyWall: session tracker')
    })
  })
}

/** Renders nothing; exists only for its session-scoped lifecycle. */
function SessionTracker(): null {
  return null
}

/**
 * The sidebar's Sticky wall entry icon: a candy sticky note with a folded
 * corner, drawn inline so it inherits the sidebar's sizing.
 *
 * @module sticky-wall-plugin/client/StickyPanelIcon
 */

import type { ReactNode } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'

/**
 * Render the sticky-note glyph at the size the sidebar asks for.
 * @param props - the sidebar's icon share.
 * @returns the icon element.
 */
export function StickyPanelIcon({ size }: PropsRuntime<'sidebar.panellist'>): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4.5A2.5 2.5 0 0 1 7.5 2h9A2.5 2.5 0 0 1 19 4.5v9.8a2.5 2.5 0 0 1-.733 1.768l-4.2 4.2a2.5 2.5 0 0 1-1.767.732H7.5A2.5 2.5 0 0 1 5 18.5v-14Z"
        fill="currentColor" opacity="0.22"
      />
      <path
        d="M5 4.5A2.5 2.5 0 0 1 7.5 2h9A2.5 2.5 0 0 1 19 4.5v9.8a2.5 2.5 0 0 1-.733 1.768l-4.2 4.2a2.5 2.5 0 0 1-1.767.732H7.5A2.5 2.5 0 0 1 5 18.5v-14Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path d="M13.5 21v-3.5a2 2 0 0 1 2-2H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 7.5h7M8.5 11h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

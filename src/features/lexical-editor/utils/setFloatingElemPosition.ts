/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  applyAnchorRelativeFloatingStyles,
  applyPortalFloatingStyles,
  clampHorizontalViewportPosition,
  getFloatingPlacementViewport,
  resolveVerticalPlacement,
} from './floatingPlacementViewport'

const VERTICAL_GAP = 10
const HORIZONTAL_OFFSET = 5

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  isLink: boolean = false,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET,
  portalRoot?: HTMLElement,
): void {
  if (targetRect === null) {
    floatingElem.style.opacity = '0'
    floatingElem.style.transform = 'translate(-10000px, -10000px)'
    return
  }

  const floatingElemRect = floatingElem.getBoundingClientRect()
  const anchorSnapshot = {
    top: targetRect.top,
    left: targetRect.left,
    right: targetRect.right,
    bottom: targetRect.bottom,
    width: targetRect.width,
    height: targetRect.height,
  }

  const viewport = getFloatingPlacementViewport(anchorElem)
  const { top: viewportTop } = resolveVerticalPlacement({
    anchorRect: anchorSnapshot,
    floatingHeight: floatingElemRect.height,
    offsetPx: verticalGap,
    prefer: 'above',
    viewport,
  })

  let viewportLeft = targetRect.left - horizontalOffset

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const textNode = range.startContainer
    if (textNode.nodeType === Node.ELEMENT_NODE || textNode.parentElement) {
      const textElement =
        textNode.nodeType === Node.ELEMENT_NODE
          ? (textNode as Element)
          : (textNode.parentElement as Element)
      const textAlign = window.getComputedStyle(textElement).textAlign

      if (textAlign === 'right' || textAlign === 'end') {
        viewportLeft = targetRect.right - floatingElemRect.width + horizontalOffset
      }
    }
  }

  if (isLink) {
    const linkExtraGap = verticalGap * 8
    const belowTop = targetRect.bottom + linkExtraGap
    if (belowTop + floatingElemRect.height <= viewport.bottom) {
      const linkLeft = clampHorizontalViewportPosition({
        left: viewportLeft,
        floatingWidth: floatingElemRect.width,
        viewport,
      })
      if (portalRoot) {
        applyPortalFloatingStyles(floatingElem, portalRoot, belowTop, linkLeft)
        return
      }
      applyAnchorRelativeFloatingStyles(floatingElem, anchorElem, belowTop, linkLeft)
      return
    }
  }

  const left = clampHorizontalViewportPosition({
    left: viewportLeft,
    floatingWidth: floatingElemRect.width,
    viewport,
  })

  if (portalRoot) {
    applyPortalFloatingStyles(floatingElem, portalRoot, viewportTop, left)
    return
  }

  applyAnchorRelativeFloatingStyles(floatingElem, anchorElem, viewportTop, left)
}

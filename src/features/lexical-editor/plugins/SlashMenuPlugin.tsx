/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import { TextNode } from 'lexical'
import { useCallback, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom'

import type { LessonBlockTypeRegistryRow } from '@/features/lesson'

import { BlockOptionIcon } from './BlockOptionIcon'
import { BlockOption, getBlockOptions } from './blockOptions'

type SlashMenuPluginProps = {
  registry?: LessonBlockTypeRegistryRow[]
}

export function SlashMenuPlugin({ registry }: SlashMenuPluginProps) {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<string | null>(null)
  const options = useMemo(() => {
    const base = getBlockOptions(editor, registry)
    if (!queryString) {
      return base
    }
    const regex = new RegExp(queryString, 'i')
    return base.filter((o) => regex.test(o.title) || o.keywords.some((k) => regex.test(k)))
  }, [editor, queryString, registry])

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    allowWhitespace: true,
    minLength: 0,
  })

  const onSelectOption = useCallback(
    (selectedOption: BlockOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        if (nodeToRemove !== null) {
          nodeToRemove.remove()
        }
        selectedOption.onSelect()
        closeMenu()
      })
    },
    [editor],
  )

  return (
    <LexicalTypeaheadMenuPlugin<BlockOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(anchorRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
        anchorRef.current
          ? ReactDOM.createPortal(
              <div className="w-[220px] overflow-hidden rounded-2xl border border-solid border-zinc-200/80 bg-white/80 text-[#1c1e21] shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-zinc-700/80 dark:bg-[#232325]/80 dark:text-[#e3e3e3] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <ul className="m-0 max-h-[220px] list-none overflow-y-auto p-1">
                  {options.map((option, i) => (
                    <li
                      key={option.key}
                      ref={option.setRefElement}
                      role="option"
                      aria-selected={selectedIndex === i}
                      className={`flex cursor-pointer items-center gap-2 rounded-2xl px-2 py-1.5 text-sm text-inherit ${selectedIndex === i ? 'bg-zinc-100 dark:bg-[#3a3a3c]' : 'hover:bg-zinc-100 dark:hover:bg-[#3a3a3c]'}`}
                      tabIndex={-1}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      onClick={() => {
                        setHighlightedIndex(i)
                        selectOptionAndCleanUp(option)
                      }}
                    >
                      <BlockOptionIcon option={option} />
                      <span className="flex-1">{option.title}</span>
                    </li>
                  ))}
                </ul>
              </div>,
              anchorRef.current,
            )
          : null
      }
    />
  )
}

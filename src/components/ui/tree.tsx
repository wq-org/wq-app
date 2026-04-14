'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { TreeContext } from './tree-context'
import { treeVariants } from './tree-variants'

export interface TreeProviderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof treeVariants> {
  defaultExpandedIds?: string[]
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onNodeClick?: (nodeId: string, data?: unknown) => void
  onNodeExpand?: (nodeId: string, expanded: boolean) => void
  showLines?: boolean
  showIcons?: boolean
  selectable?: boolean
  multiSelect?: boolean
  animateExpand?: boolean
  indent?: number
}

const TreeProvider = React.forwardRef<HTMLDivElement, TreeProviderProps>(
  (
    {
      className,
      variant,
      size,
      children,
      defaultExpandedIds = [],
      selectedIds = [],
      onSelectionChange,
      onNodeClick,
      onNodeExpand,
      showLines = true,
      showIcons = true,
      selectable = true,
      multiSelect = false,
      animateExpand = true,
      indent = 20,
      ...props
    },
    ref,
  ) => {
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set(defaultExpandedIds))
    const [internalSelectedIds, setInternalSelectedIds] = React.useState<string[]>(selectedIds)
    const isControlled = onSelectionChange !== undefined
    const currentSelectedIds = isControlled ? selectedIds : internalSelectedIds

    const toggleExpanded = React.useCallback(
      (nodeId: string) => {
        setExpandedIds((prev) => {
          const next = new Set(prev)
          const isExpanded = next.has(nodeId)

          if (isExpanded) {
            next.delete(nodeId)
          } else {
            next.add(nodeId)
          }

          onNodeExpand?.(nodeId, !isExpanded)
          return next
        })
      },
      [onNodeExpand],
    )

    const handleSelection = React.useCallback(
      (nodeId: string, ctrlKey = false) => {
        if (!selectable) return

        let nextSelection: string[]

        if (multiSelect && ctrlKey) {
          nextSelection = currentSelectedIds.includes(nodeId)
            ? currentSelectedIds.filter((id) => id !== nodeId)
            : [...currentSelectedIds, nodeId]
        } else {
          nextSelection = currentSelectedIds.includes(nodeId) ? [] : [nodeId]
        }

        if (isControlled) {
          onSelectionChange?.(nextSelection)
        } else {
          setInternalSelectedIds(nextSelection)
        }
      },
      [currentSelectedIds, isControlled, multiSelect, onSelectionChange, selectable],
    )

    const contextValue = React.useMemo(
      () => ({
        expandedIds,
        selectedIds: currentSelectedIds,
        toggleExpanded,
        handleSelection,
        showLines,
        showIcons,
        selectable,
        multiSelect,
        animateExpand,
        indent,
        onNodeClick,
        onNodeExpand,
      }),
      [
        animateExpand,
        currentSelectedIds,
        expandedIds,
        handleSelection,
        indent,
        multiSelect,
        onNodeClick,
        onNodeExpand,
        selectable,
        showIcons,
        showLines,
        toggleExpanded,
      ],
    )

    return (
      <TreeContext.Provider value={contextValue}>
        <div
          className={cn(
            treeVariants({ variant, size, className }),
            'motion-safe:duration-200 motion-reduce:animate-none',
          )}
          ref={ref}
          {...props}
        >
          <div className="p-2">{children}</div>
        </div>
      </TreeContext.Provider>
    )
  },
)
TreeProvider.displayName = 'TreeProvider'

export interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'

    return (
      <Comp
        ref={ref}
        className={cn('flex flex-col gap-1', className)}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)
Tree.displayName = 'Tree'
export { TreeProvider, Tree }

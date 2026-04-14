'use client'

import * as React from 'react'
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useTree } from './tree-context'
import { treeItemVariants } from './tree-variants'

type TreeLevelState = {
  level: number
  parentPath: boolean[]
}

const TreeLevelContext = React.createContext<TreeLevelState>({ level: 0, parentPath: [] })
const TreeSiblingContext = React.createContext<{ isLast: boolean }>({ isLast: true })

function useTreeLevel() {
  return React.useContext(TreeLevelContext)
}

function useTreeSibling() {
  return React.useContext(TreeSiblingContext)
}

export interface TreeItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof treeItemVariants> {
  nodeId: string
  label: string
  icon?: React.ReactNode
  data?: unknown
  hasChildren?: boolean
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(({ children, ...props }, ref) => {
  const levelState = useTreeLevel()

  return (
    <TreeItemInner
      ref={ref}
      level={levelState.level}
      parentPath={levelState.parentPath}
      {...props}
    >
      {children}
    </TreeItemInner>
  )
})
TreeItem.displayName = 'TreeItem'

type TreeItemInnerProps = TreeItemProps & {
  level: number
  parentPath: boolean[]
}

const TreeItemInner = React.forwardRef<HTMLDivElement, TreeItemInnerProps>(
  (
    {
      className,
      variant,
      nodeId,
      label,
      icon,
      data,
      level,
      parentPath,
      hasChildren = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const {
      expandedIds,
      selectedIds,
      toggleExpanded,
      handleSelection,
      showLines,
      showIcons,
      animateExpand,
      indent,
      onNodeClick,
    } = useTree()
    const siblingState = useTreeSibling()
    const isExpanded = expandedIds.has(nodeId)
    const isSelected = selectedIds.includes(nodeId)
    const hasNestedChildren = React.Children.count(children) > 0
    const canExpand = hasChildren || hasNestedChildren
    const currentPath = [...parentPath, siblingState.isLast]

    const getDefaultIcon = () =>
      canExpand ? (
        isExpanded ? (
          <FolderOpen
            aria-hidden="true"
            className="size-4"
          />
        ) : (
          <Folder
            aria-hidden="true"
            className="size-4"
          />
        )
      ) : (
        <File
          aria-hidden="true"
          className="size-4"
        />
      )

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (canExpand) toggleExpanded(nodeId)
      handleSelection(nodeId, event.ctrlKey || event.metaKey)
      onNodeClick?.(nodeId, data)
      onClick?.(event)
    }

    const nextLevelState = React.useMemo(
      () => ({
        level: level + 1,
        parentPath: currentPath,
      }),
      [currentPath, level],
    )

    const childNodes = React.Children.toArray(children)

    return (
      <TreeLevelContext.Provider value={nextLevelState}>
        <div
          className="select-none"
          role="none"
        >
          <div
            aria-expanded={canExpand ? isExpanded : undefined}
            aria-selected={isSelected || undefined}
            className={cn(treeItemVariants({ variant, selected: isSelected, className }))}
            onClick={handleClick}
            ref={ref}
            role="treeitem"
            style={{ paddingLeft: level * indent + 8 }}
            tabIndex={0}
            {...props}
          >
            {showLines && level > 0 && (
              <div className="pointer-events-none absolute inset-y-0 left-0">
                {currentPath.map((isLastInPath, pathIndex) => (
                  <div
                    className="absolute inset-y-0 border-border/40 border-l"
                    key={pathIndex}
                    style={{
                      left: pathIndex * indent + 12,
                      display:
                        pathIndex === currentPath.length - 1 && isLastInPath ? 'none' : 'block',
                    }}
                  />
                ))}
                <div
                  className="absolute top-1/2 border-border/40 border-t"
                  style={{
                    left: (level - 1) * indent + 12,
                    width: indent - 4,
                    transform: 'translateY(-1px)',
                  }}
                />
                {siblingState.isLast && (
                  <div
                    className="absolute top-0 border-border/40 border-l"
                    style={{ left: (level - 1) * indent + 12, height: '50%' }}
                  />
                )}
              </div>
            )}

            <div
              aria-hidden="true"
              className={cn(
                'flex size-4 items-center justify-center text-muted-foreground transition-transform motion-safe:duration-200',
                canExpand && isExpanded ? 'rotate-90' : 'rotate-0',
              )}
            >
              {canExpand && <ChevronRight className="size-3" />}
            </div>

            {showIcons && (
              <div className="mx-2 flex size-4 items-center justify-center text-muted-foreground">
                {icon || getDefaultIcon()}
              </div>
            )}

            <span className="flex-1 truncate text-sm text-foreground">{label}</span>
          </div>

          {canExpand && (
            <div
              aria-hidden={!isExpanded}
              className={cn(
                'overflow-hidden',
                animateExpand ? 'transition-[max-height,opacity] motion-safe:duration-200' : '',
                isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className="translate-y-0 will-change-transform motion-safe:duration-200">
                <TreeSiblingProvider items={childNodes} />
              </div>
            </div>
          )}
        </div>
      </TreeLevelContext.Provider>
    )
  },
)
TreeItemInner.displayName = 'TreeItemInner'

function TreeSiblingProvider({ items }: { items: React.ReactNode[] }) {
  if (items.length === 0) return null

  return (
    <>
      {items.map((child, index) => (
        <TreeSiblingContext.Provider
          key={index}
          value={{ isLast: index === items.length - 1 }}
        >
          {child}
        </TreeSiblingContext.Provider>
      ))}
    </>
  )
}
export { TreeItem }

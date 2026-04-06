'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '@/contexts/user/UserContext'
import { useMemo, useState } from 'react'

type SidebarPrimaryNavSubItem = {
  title: string
  url: string
}

type SidebarPrimaryNavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: readonly SidebarPrimaryNavSubItem[]
}

type SidebarPrimaryNavProps = {
  items: readonly SidebarPrimaryNavItem[]
  routePrefix?: string
}

export function SidebarPrimaryNav({ items, routePrefix }: SidebarPrimaryNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { getRole } = useUser()

  const role = getRole()

  function navigateTo(path: string) {
    if (routePrefix) {
      navigate(`${routePrefix}${path}`)
      return
    }

    if (!role) return
    navigate(`/${role}${path}`)
  }
  function navigateToSubPath(...args: string[]) {
    const concatPath = args.reduce((fullPath: string, currentPath: string) => {
      return fullPath.concat(currentPath)
    }, '')

    navigateTo(concatPath)
  }

  const currentPath = location.pathname

  const activeStatesByTitle = useMemo(() => {
    return Object.fromEntries(
      items.map((item) => {
        const fullItemPath = `${routePrefix ?? `/${role ?? ''}`}${item.url}`
        const hasActiveSubItem =
          item.items?.some((subItem) => currentPath === `${fullItemPath}${subItem.url}`) ?? false
        const isItemPathActive =
          currentPath === fullItemPath || currentPath.startsWith(`${fullItemPath}/`)

        return [item.title, isItemPathActive || hasActiveSubItem]
      }),
    )
  }, [currentPath, items, role, routePrefix])

  const [manualOpenByTitle, setManualOpenByTitle] = useState<Record<string, boolean>>({})

  function handleOpenChange(itemTitle: string, isOpen: boolean) {
    setManualOpenByTitle((prev) => ({ ...prev, [itemTitle]: isOpen }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={
              activeStatesByTitle[item.title] ||
              manualOpenByTitle[item.title] ||
              item.isActive ||
              false
            }
            onOpenChange={(isOpen) => handleOpenChange(item.title, isOpen)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <div className="flex">
                <SidebarMenuButton onClick={() => navigateTo(item.url)}>
                  {item.icon ? <item.icon /> : null}
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {item.items && item.items.length > 0 && (
                  <CollapsibleTrigger asChild>
                    <Button
                      className="cursor-pointer"
                      variant="ghost"
                      size="icon"
                    >
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
              {item.items && item.items.length > 0 ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          className="cursor-pointer"
                          onClick={() => navigateToSubPath(item.url, subItem.url)}
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

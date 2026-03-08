'use client'

import { Search } from 'lucide-react'
import { ChatUserCard } from '@/components/shared/chat/ChatUserCard'
import { Input } from '@/components/ui/input'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import type { Contact } from '@/lib/chat-data'

interface AppSidebarProps {
  contacts: Contact[]
  activeContactId: string | null
  onSelectContact: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function AppSidebar({
  contacts,
  activeContactId,
  onSelectContact,
  searchQuery,
  onSearchChange,
}: AppSidebarProps) {
  const filtered = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      className="rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
    >
      <SidebarHeader className="border-b border-neutral-200/70 px-4 pt-4 pb-3">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-[1rem] font-semibold text-neutral-900">Chats</h1>
          <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[0.6875rem] font-medium text-neutral-600">
            {filtered.length}
          </span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 rounded-2xl border-neutral-200 bg-white pl-9 text-sm text-neutral-700 shadow-none focus-visible:border-neutral-300 focus-visible:ring-0"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup className="px-2.5">
          <SidebarGroupContent className="space-y-1.5">
            {filtered.map((contact) => (
              <ChatUserCard
                key={contact.id}
                contact={contact}
                isActive={activeContactId === contact.id}
                onSelect={onSelectContact}
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

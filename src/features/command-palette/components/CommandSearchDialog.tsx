import * as Dialog from '@radix-ui/react-dialog'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AvatarFallback, AvatarImage, Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchItems, type SearchItem } from '../hooks'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'

const ROLE_LABEL_KEY_MAP: Record<SearchItem['type'], string> = {
  student: 'roles.student',
  teacher: 'roles.teacher',
  institution_admin: 'roles.admin',
  super_admin: 'roles.admin',
}

function SearchAvatar({ avatarPath, title }: { avatarPath?: string | null; title: string }) {
  const { url } = useAvatarUrl(avatarPath)

  return (
    <Avatar size="lg">
      <AvatarImage
        src={url || DEFAULT_INSTITUTION_IMAGE}
        alt={title}
        className="rounded-full"
      />
      <AvatarFallback className="rounded-full bg-muted text-xl text-foreground">
        {title.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export function CommandSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const { items, loading } = useSearchItems()
  const { t } = useTranslation(['common', 'features.commandPalette'])
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const currentSearchQuery = searchQuery.trim().toLowerCase()
    if (!currentSearchQuery) return items

    return items.filter((item) => {
      const emailMatch = item.email?.toLowerCase().includes(currentSearchQuery) || false
      const usernameMatch = item.username?.toLowerCase().includes(currentSearchQuery) || false
      const titleMatch = item.title.toLowerCase().includes(currentSearchQuery)

      return emailMatch || usernameMatch || titleMatch
    })
  }, [searchQuery, items])

  const handleClickItem = (item: SearchItem) => {
    navigate(`/profile/${item.id}`)
  }

  return (
    <>
      <div className="flex items-center border-b border-border px-4 py-3">
        <Search className="mr-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search.placeholder', { ns: 'features.commandPalette' })}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
          autoFocus
        />
        <Dialog.Close asChild>
          <Button
            size={'icon'}
            variant={'ghost'}
            className="rounded-full p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </Dialog.Close>
      </div>

      {/* Results area stretches to fill available height */}
      <div className="flex-1 ">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
            />
          </div>
        ) : filtered.length > 0 ? (
          <div className="p-2 max-h-80 overflow-y-auto">
            {filtered.map((item) => (
              <Dialog.Close
                key={`${item.type}-${item.id}`}
                asChild
              >
                <Card
                  layout="flush"
                  onClick={() => handleClickItem(item)}
                  className="w-full cursor-pointer rounded-2xl border-0 bg-transparent px-3 py-2 text-left shadow-none hover:bg-muted focus:bg-muted focus:outline-none"
                >
                  <div className="flex gap-3">
                    <SearchAvatar
                      avatarPath={item.avatar_url}
                      title={item.title}
                    />
                    <div className="flex flex-col gap-1">
                      <Text
                        as="span"
                        variant="small"
                        className="text-sm font-medium"
                      >
                        {item.title}
                      </Text>
                      <Text
                        as="span"
                        variant="small"
                        className="text-xs text-muted-foreground"
                      >
                        {item.email || 'No email'}
                      </Text>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 w-fit"
                      >
                        {t(ROLE_LABEL_KEY_MAP[item.type])}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Dialog.Close>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t('search.noResults', { ns: 'features.commandPalette' })}
          </div>
        )}
      </div>
      <Dialog.Description className="sr-only">
        Search and execute commands quickly
      </Dialog.Description>
    </>
  )
}

import * as Dialog from '@radix-ui/react-dialog'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AvatarFallback, AvatarImage, Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import { useSearchItems, type SearchItem } from '../hooks'
import { useTranslation } from 'react-i18next'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

export default function CommandSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const { items, loading } = useSearchItems()
  const { t } = useTranslation('common')
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
    // Navigate based on item type - all user profiles use /profile/:id
    if (
      item.type === 'student' ||
      item.type === 'teacher' ||
      item.type === 'institution_admin' ||
      item.type === 'super_admin'
    ) {
      navigate(`/profile/${item.id}`)
    } else if (item.type === 'institution') {
      navigate(`/institution/${item.id}`)
    }
  }

  return (
    <>
      <div className="flex items-center border-b px-4 py-3">
        <Search className="mr-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Type a command or search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-sm"
          autoFocus
        />
        <Dialog.Close asChild>
          <Button
            size={'icon'}
            variant={'ghost'}
            className="p-1 rounded-full hover:bg-gray-100"
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
                  onClick={() => handleClickItem(item)}
                  className="border-0 rounded-2xl shadow-none w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer"
                >
                  <div className="flex gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={item.avatar_url || AVATAR_PLACEHOLDER_SRC}
                        alt={item.title}
                        className="rounded-full w-12 h-12"
                      />
                      <AvatarFallback className="text-xl rounded-full w-12 h-12 flex items-center justify-center bg-gray-200">
                        {item.title.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
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
                        className="text-xs text-gray-400"
                      >
                        {item.email || 'No email'}
                      </Text>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 w-fit"
                      >
                        {t(`roles.${item.type}`)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Dialog.Close>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">No results found</div>
        )}
      </div>
      <Dialog.Description className="sr-only">
        Search and execute commands quickly
      </Dialog.Description>
    </>
  )
}

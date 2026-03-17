import { useEffect, useMemo, useState } from 'react'
import { FileText, Image as ImageIcon, Video, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@/contexts/user'
import { listCloudFiles, type CloudFileItem, type CloudFileKind } from '@/features/files'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const FILE_KIND_ICON = {
  file: FileText,
  image: ImageIcon,
  pdf: FileText,
  video: Video,
} as const satisfies Record<CloudFileKind, typeof FileText>

export type FileTagDrawerProps = {
  allowedKinds: readonly CloudFileKind[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (file: CloudFileItem) => void
  title: string
  description: string
  closeLabel: string
}

export function FileTagDrawer({
  allowedKinds,
  open,
  onOpenChange,
  onSelect,
  title,
  description,
  closeLabel,
}: FileTagDrawerProps) {
  const { t } = useTranslation('features.lesson')
  const { profile } = useUser()
  const [files, setFiles] = useState<CloudFileItem[]>([])
  const [activeKind, setActiveKind] = useState<CloudFileKind | 'all'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const institutionId = profile?.userInstitutionId
    const userId = profile?.user_id
    const role = profile?.role

    if (!institutionId || !userId || !role) {
      setFiles([])
      return
    }

    let cancelled = false
    setLoading(true)

    void listCloudFiles(institutionId, role, userId)
      .then((result) => {
        if (!cancelled) {
          setFiles(result)
        }
      })
      .catch((error) => {
        console.error('Failed to load cloud files for lesson tagging:', error)
        if (!cancelled) {
          setFiles([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, profile?.role, profile?.userInstitutionId, profile?.user_id])

  useEffect(() => {
    if (allowedKinds.length === 1) {
      setActiveKind(allowedKinds[0])
      return
    }

    setActiveKind((current) => {
      if (current === 'all') return 'all'
      return allowedKinds.includes(current) ? current : 'all'
    })
  }, [allowedKinds])

  const filteredFiles = useMemo(() => {
    const kindFiltered = files.filter((file) => allowedKinds.includes(file.kind))
    if (activeKind === 'all') return kindFiltered
    return kindFiltered.filter((file) => file.kind === activeKind)
  }, [activeKind, allowedKinds, files])

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="h-screen w-full border-border bg-background px-0 md:w-[50vw] md:max-w-[50vw]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              aria-label={closeLabel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {allowedKinds.length > 1 ? (
              <Button
                type="button"
                variant={activeKind === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveKind('all')}
              >
                {t('page.fileTag.filters.all')}
              </Button>
            ) : null}
            {allowedKinds.map((kind) => (
              <Button
                key={kind}
                type="button"
                variant={activeKind === kind ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-full"
                onClick={() => setActiveKind(kind)}
              >
                {t(`page.fileTag.filters.${kind}`)}
              </Button>
            ))}
          </div>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-9rem)] px-4 py-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-20 w-full rounded-3xl"
                />
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center rounded-4xl border border-dashed border-border bg-card/60 p-6 text-center">
              <Text
                as="p"
                variant="body"
                className="max-w-sm text-muted-foreground"
              >
                {t('page.fileTag.emptyResults')}
              </Text>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {filteredFiles.map((file) => {
                const Icon = FILE_KIND_ICON[file.kind]

                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => onSelect(file)}
                    className="flex w-full items-center gap-4 rounded-4xl border border-border bg-card/80 px-4 py-4 text-left transition-colors hover:bg-muted"
                  >
                    <span className="rounded-2xl border border-border bg-background p-3 text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <Text
                        as="span"
                        variant="body"
                        className="block truncate font-semibold"
                      >
                        {file.name}
                      </Text>
                      <Text
                        as="span"
                        variant="small"
                        className="block text-muted-foreground"
                      >
                        {t(`page.fileTag.filters.${file.kind}`)}
                      </Text>
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium',
                        'bg-blue-500/10 text-blue-500',
                      )}
                    >
                      {t('page.fileTag.attach')}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

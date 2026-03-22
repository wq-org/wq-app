import { useState, type ReactNode } from 'react'
import { FileText, Folder, Image } from 'lucide-react'
import { Onboarding } from '@/features/onboarding'
import { EmojiRating } from '@/components/ui/emoji-rating'
import { Rating } from '@/components/ui/rating'
import { Tree, TreeProvider } from '@/components/ui/tree'
import { TreeItem } from '@/components/ui/tree-item'

type DemoSectionProps = {
  title: string
  children: ReactNode
}

function DemoSection({ title, children }: DemoSectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function Test() {
  const [emojiRating, setEmojiRating] = useState<number | undefined>(3)
  const [starRating, setStarRating] = useState<number | undefined>(4)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <DemoSection title="Emoji Rating">
          <div className="flex flex-wrap items-start gap-8">
            <EmojiRating
              defaultValue={3}
              showLabel
            />
            <EmojiRating
              value={emojiRating}
              onValueChange={(value) => setEmojiRating(value ?? undefined)}
              showLabel
            />
          </div>
        </DemoSection>

        <DemoSection title="Star Rating">
          <div className="flex flex-wrap items-center gap-8">
            <Rating
              defaultValue={4}
              showValue
            />
            <Rating
              value={starRating}
              onValueChange={setStarRating}
              showValue
              editable
            />
          </div>
        </DemoSection>

        <div className="w-full">
          <TreeProvider
            className="w-full max-w-sm border-0 bg-transparent p-0"
            variant="ghost"
            defaultExpandedIds={['documents', 'projects', 'project1', 'images']}
            showLines
            showIcons
            selectable
            multiSelect={false}
            animateExpand
            indent={16}
          >
            <Tree className="gap-0">
              <TreeItem
                nodeId="documents"
                label="Documents"
                icon={<Folder className="size-4" />}
                hasChildren
              >
                <TreeItem
                  nodeId="projects"
                  label="Projects"
                  icon={<Folder className="size-4" />}
                  hasChildren
                >
                  <TreeItem
                    nodeId="project1"
                    label="Project 1"
                    icon={<Folder className="size-4" />}
                    hasChildren
                  >
                    <TreeItem
                      nodeId="readme"
                      label="README.md"
                      icon={<FileText className="size-4" />}
                    />
                    <TreeItem
                      nodeId="index"
                      label="index.tsx"
                      icon={<FileText className="size-4" />}
                    />
                  </TreeItem>
                </TreeItem>

                <TreeItem
                  nodeId="images"
                  label="Images"
                  icon={<Folder className="size-4" />}
                  hasChildren
                >
                  <TreeItem
                    nodeId="logo"
                    label="logo.png"
                    icon={<Image className="size-4" />}
                  />
                  <TreeItem
                    nodeId="banner"
                    label="banner.jpg"
                    icon={<Image className="size-4" />}
                  />
                </TreeItem>
              </TreeItem>
            </Tree>
          </TreeProvider>
        </div>

        <DemoSection title="Onboarding">
          <Onboarding />
        </DemoSection>
      </div>
    </div>
  )
}

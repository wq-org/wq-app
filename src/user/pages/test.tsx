import { useState, type ReactNode } from 'react'
import { FileText, Folder, Image } from 'lucide-react'

import { DocumentEditor } from '@/components/shared'
import { FieldInput } from '@/components/ui/field-input'
import {
  FieldTextarea,
  type FieldTextareaLengthDetail,
  type FieldTextareaOverLimitDetail,
} from '@/components/ui/field-textarea'
import { EmojiRating } from '@/components/ui/emoji-rating'
import { Tree, TreeProvider } from '@/components/ui/tree'
import { TreeItem } from '@/components/ui/tree-item'
import { Onboarding } from '@/features/onboarding'

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

function Container({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl bg-gray-50 px-10 py-20">{children}</div>
}

const DESCRIPTION_MAX = 500

function handleTestReachMaxLength(detail: FieldTextareaLengthDetail) {
  const { length, maxLength } = detail

  console.info('[FieldTextarea] onReachMaxLength', length, maxLength)
}

function handleTestOverMaxLength(detail: FieldTextareaOverLimitDetail) {
  const { length, maxLength, excess } = detail

  console.warn('[FieldTextarea] onOverMaxLength', length, maxLength, excess)
}

export default function Test() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [emojiRating, setEmojiRating] = useState<number | null>(3)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <Container>
          <DocumentEditor />
        </Container>

        <Container>
          <FieldInput
            label="Name"
            placeholder="Enter your name"
            value={name}
            onValueChange={setName}
          />

          <FieldTextarea
            value={description}
            onValueChange={setDescription}
            label="Description"
            maxLength={DESCRIPTION_MAX}
            onReachMaxLength={handleTestReachMaxLength}
            onOverMaxLength={handleTestOverMaxLength}
          />
        </Container>

        <Container>
          <Onboarding />
        </Container>

        <DemoSection title="Emoji Rating">
          <div className="flex flex-wrap items-start gap-8">
            <EmojiRating
              defaultValue={3}
              showLabel
            />
            <EmojiRating
              value={emojiRating}
              onValueChange={(value) => setEmojiRating(value ?? null)}
              showLabel
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
                  icon={<Image className="size-4" />}
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
      </div>
    </div>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export interface Blog2Post {
  id: string
  category: string
  authorName: string
  authorAvatar?: string
  title: string
  description: string
  imageSrc?: string
  featured?: boolean
}

interface Blog2Props {
  title?: string
  posts?: Blog2Post[]
}

const defaultPosts: Blog2Post[] = [
  {
    id: 'post-1',
    category: 'News',
    authorName: 'John John',
    authorAvatar: '/favicon.ico',
    title: 'Pay supplier invoices',
    description:
      'Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods.',
    featured: true,
  },
  {
    id: 'post-2',
    category: 'News',
    authorName: 'John',
    authorAvatar: '/favicon.ico',
    title: 'Pay supplier invoices',
    description:
      'Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods.',
  },
  {
    id: 'post-3',
    category: 'News',
    authorName: 'John',
    authorAvatar: '/favicon.ico',
    title: 'Pay supplier invoices',
    description:
      'Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods.',
  },
]

export function Blog2({ title = 'Latest articles', posts = defaultPosts }: Blog2Props) {
  const resolvedPosts = posts.length > 0 ? posts : defaultPosts

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto flex flex-col gap-14">
        <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="max-w-xl text-3xl font-regular tracking-tighter md:text-5xl">{title}</h4>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {resolvedPosts.map((post, index) => {
            const isFeatured = post.featured ?? index === 0

            return (
              <div
                key={post.id}
                className={`flex cursor-pointer flex-col gap-4 hover:opacity-75 ${isFeatured ? 'md:col-span-2' : ''}`}
              >
                {post.imageSrc ? (
                  <img
                    src={post.imageSrc}
                    alt={post.title}
                    className="aspect-video rounded-md object-cover"
                  />
                ) : (
                  <div className="aspect-video rounded-md bg-muted" />
                )}
                <div className="flex flex-row items-center gap-4">
                  <Badge>{post.category}</Badge>
                  <p className="flex flex-row items-center gap-2 text-sm">
                    <span className="text-muted-foreground">By</span>
                    <Avatar size="xs">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{post.authorName}</span>
                  </p>
                </div>
                <div className={`flex flex-col ${isFeatured ? 'gap-2' : 'gap-1'}`}>
                  <h3
                    className={`max-w-3xl tracking-tight ${isFeatured ? 'text-4xl' : 'text-2xl'}`}
                  >
                    {post.title}
                  </h3>
                  <p className="max-w-3xl text-base text-muted-foreground">{post.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

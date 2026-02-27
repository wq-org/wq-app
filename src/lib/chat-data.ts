export type Contact = {
  id: string
  name: string
  initials: string
  online: boolean
  time: string
  lastMessage: string
  unread: number
}

export type Message = {
  id: string
  text: string
  time: string
  isMe: boolean
  images?: string[]
}

export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'maria',
    name: 'Maria Brown',
    initials: 'MB',
    online: true,
    time: '2m',
    lastMessage: 'Could you review the latest landing copy?',
    unread: 2,
  },
  {
    id: 'nate',
    name: 'Nate Kim',
    initials: 'NK',
    online: false,
    time: '10m',
    lastMessage: 'Shipping docs are now ready.',
    unread: 0,
  },
  {
    id: 'sara',
    name: 'Sara Stone',
    initials: 'SS',
    online: true,
    time: '1h',
    lastMessage: 'New chat UI looks cleaner now.',
    unread: 1,
  },
]

export const SAMPLE_MESSAGES: Record<string, Message[]> = {
  maria: [
    {
      id: 'maria-1',
      text: 'Morning. I dropped two visual directions.',
      time: '09:12',
      isMe: false,
    },
    {
      id: 'maria-2',
      text: 'Nice. I will use the neutral one for now.',
      time: '09:13',
      isMe: true,
    },
    {
      id: 'maria-3',
      text: 'Could you review the latest landing copy?',
      time: '09:14',
      isMe: false,
      images: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],
  nate: [
    {
      id: 'nate-1',
      text: 'Shipping docs are now ready.',
      time: '08:22',
      isMe: false,
    },
    {
      id: 'nate-2',
      text: 'Perfect, I will merge after lunch.',
      time: '08:25',
      isMe: true,
    },
  ],
  sara: [
    {
      id: 'sara-1',
      text: 'New chat UI looks cleaner now.',
      time: 'Yesterday',
      isMe: false,
    },
  ],
}

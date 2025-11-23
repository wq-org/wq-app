import type { Notification } from '../types/notification.types'

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'join',
    title: 'Anna Srzand joined to 🔥 Final Presentation',
    message: '2h ago • Social Media Plan',
    timestamp: '2h ago',
    isRead: false,
    avatar: {
      src: undefined,
      fallback: 'AS',
      color: 'bg-yellow-500',
    },
  },
  {
    id: '2',
    type: 'mention',
    title: 'Jess Raddon mention you in 😍 Tennis List',
    message: '4h ago • Hobby List',
    timestamp: '4h ago',
    isRead: false,
    avatar: {
      fallback: 'JR',
      color: 'bg-orange-200',
    },
  },
  {
    id: '3',
    type: 'request',
    title: 'Sandra Marx is requesting to upgrade Plan',
    message: '12h ago • Hobby List',
    timestamp: '12h ago',
    isRead: false,
    avatar: {
      src: undefined,
      fallback: 'SM',
      color: 'bg-pink-200',
    },
    actions: {
      accept: () => console.log('Accept upgrade request'),
      decline: () => console.log('Decline upgrade request'),
    },
  },
  {
    id: '4',
    type: 'upload',
    title: 'Adam Smith upload a file',
    message: '1d ago',
    timestamp: '1d ago',
    isRead: false,
    avatar: {
      src: undefined,
      fallback: 'AS',
      color: 'bg-gray-200',
    },
    metadata: {
      fileName: 'landing_page_ver2.fig',
      fileSize: '2mb',
      fileIcon: '🎨',
    },
  },
  {
    id: '5',
    type: 'edit',
    title: 'Ralpg Turner edited 🤙 Celebrate Info',
    message: '4h ago • Hobby List',
    timestamp: '4h ago',
    isRead: false,
    avatar: {
      fallback: 'RT',
      color: 'bg-purple-200',
    },
  },
]

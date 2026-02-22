import type { Notification } from '../types/notification.types'

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'join',
    action: 'join_course',
    title: 'Anna Srzand',
    message: '2h ago • Social Media Plan',
    timestamp: '2h ago',
    isRead: false,
    courseName: 'Final Presentation',
    avatar: {
      src: undefined,
      fallback: 'AS',
      color: 'bg-yellow-500',
    },
    actions: {
      accept: () => console.log('Accept join course'),
      decline: () => console.log('Decline join course'),
    },
  },
  {
    id: '2',
    type: 'mention',
    title: 'Jess Raddon',
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
    type: 'follow',
    action: 'follow',
    title: 'Sandra Marx',
    message: '12h ago • Hobby List',
    timestamp: '12h ago',
    isRead: false,
    avatar: {
      src: undefined,
      fallback: 'SM',
      color: 'bg-pink-200',
    },
    actions: {
      accept: () => console.log('Accept follow request'),
      decline: () => console.log('Decline follow request'),
    },
  },
  {
    id: '4',
    type: 'upload',
    title: 'Adam Smith',
    message: '1d ago',
    timestamp: '1d ago',
    isRead: false,
    avatar: {
      src: undefined,
      fallback: 'AS',
      color: 'bg-gray-200',
    },
  },
  {
    id: '5',
    type: 'join',
    action: 'join_course',
    title: 'Ralpg Turner',
    message: '4h ago • Hobby List',
    timestamp: '4h ago',
    isRead: false,
    courseName: 'Celebrate Info',
    avatar: {
      fallback: 'RT',
      color: 'bg-purple-200',
    },
    actions: {
      accept: () => console.log('Accept join course'),
      decline: () => console.log('Decline join course'),
    },
  },
]

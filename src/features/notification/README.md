# Notification Feature

A complete notification system with panel, badge, and item components built with Radix UI primitives.

## Components

### NotificationPanel

Main notification panel with tabs (All, Following, Archive) and notification list.

```tsx
import { NotificationPanel } from '@/features/notification'
;<NotificationPanel />
```

### NotificationBadge

Bell icon with notification count badge and popover.

```tsx
import { NotificationBadge } from '@/features/notification'
;<NotificationBadge count={8} />
```

### NotificationItem

Individual notification item with avatar, message, timestamp, and optional actions.

```tsx
import { NotificationItem } from '@/features/notification'
;<NotificationItem notification={notification} />
```

## Features

- ✅ **Tab Navigation**: All, Following, Archive tabs
- ✅ **Mark All as Read**: Quickly clear unread notifications
- ✅ **Notification Types**: join, mention, request, upload, edit, general
- ✅ **Action Buttons**: Accept/Decline for requests
- ✅ **File Attachments**: Display uploaded files with icons and sizes
- ✅ **Read/Unread States**: Visual indicators for unread notifications
- ✅ **Bell Icons**: Uses `Bell` and `BellDot` from lucide-react
- ✅ **Responsive Design**: Works on all screen sizes

## Notification Types

```typescript
type NotificationType = 'join' | 'mention' | 'request' | 'upload' | 'edit' | 'general'
```

## Usage Example

```tsx
import { NotificationBadge } from '@/features/notification'

export default function Navigation() {
  return (
    <nav>
      <NotificationBadge count={8} />
    </nav>
  )
}
```

## Folder Structure

```
features/notification/
├── components/
│   ├── NotificationBadge.tsx   # Bell icon with popover
│   ├── NotificationPanel.tsx   # Main panel with tabs
│   └── NotificationItem.tsx    # Individual notification
├── types/
│   └── notification.types.ts   # TypeScript types
├── data/
│   └── mockNotifications.ts    # Mock data
├── index.ts                    # Exports
└── README.md                   # Documentation
```

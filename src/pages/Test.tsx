
import { NotificationPanel, NotificationBadge } from "@/features/notification";

export default function Test() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Notification Badge Demo */}
            <div className="mb-8 flex items-center gap-4">
                <NotificationBadge count={8} />
            </div>

            {/* Notification Panel Demo */}
            <div className="flex justify-center">
                <NotificationPanel />
            </div>
        </div>
    );
}
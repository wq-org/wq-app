import { ChatLayout } from '@/features/chat';
import AppWrapper from '@/components/layout/AppWrapper';

export default function Chat() {
    return (
        <AppWrapper role="student">
            <ChatLayout />
        </AppWrapper>
    );
}

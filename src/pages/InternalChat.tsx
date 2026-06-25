import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ChatApp from '@/components/internal-chat/ChatApp';

export default function InternalChat() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] -m-6 overflow-hidden">
        <ChatApp />
      </div>
    </DashboardLayout>
  );
}
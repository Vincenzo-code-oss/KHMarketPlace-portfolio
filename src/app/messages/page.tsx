import { prisma } from '@/lib/prisma';
import { SendHorizonal } from 'lucide-react';
import { requireAuthenticatedUser } from '@/lib/session';

export default async function MessagesPage() {
  const user = await requireAuthenticatedUser('/messages');
  const latestMessage = await prisma.message.findFirst({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    orderBy: { createdAt: 'desc' },
  });
  const partnerId = latestMessage
    ? latestMessage.senderId === user.id ? latestMessage.receiverId : latestMessage.senderId
    : undefined;
  const partner = partnerId
    ? await prisma.user.findUnique({ where: { id: partnerId }, select: { id: true, name: true } })
    : null;
  const messages = partner
    ? await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: partner.id },
            { senderId: partner.id, receiverId: user.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
      })
    : [];

  return (
    <div className="container-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="mb-4 text-lg font-bold text-slate-900">Conversations</div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="font-semibold text-slate-900">{partner?.name ?? 'No conversation selected'}</div>
            <div className="text-sm text-slate-500">KHMarket messages</div>
          </div>
        </aside>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">{partner?.name ?? 'Your conversations'}</div>
                <div className="text-sm text-slate-500">Messages stay linked to your account</div>
              </div>
              <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Online</div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className={`max-w-[80%] rounded-2xl p-3 text-sm ${message.senderId === user.id ? 'ml-auto bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {message.content}
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">No messages yet. Start the conversation.</div>
            )}
          </div>

          <form className="flex gap-3 border-t border-slate-200 p-4">
            <input className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="Write a message..." />
            <button className="rounded-xl bg-primary px-4 py-3 text-white"><SendHorizonal className="h-4 w-4" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

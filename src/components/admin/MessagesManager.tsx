'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Eye, EyeOff, Mail, MailOpen, User, Phone } from 'lucide-react';
import { useContactMessages, type ContactMessage } from '@/hooks/useContactMessages';

interface MessagesManagerProps {
  // token kept for signature compatibility; messages are stored in localStorage.
  token: string;
}

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

export default function MessagesManager({}: MessagesManagerProps) {
  // Contact messages are persisted in localStorage (no backend).
  const { messages, toggleRead, removeMessage } = useContactMessages();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);

  const handleMarkAsRead = (msg: ContactMessage) => {
    // Instant optimistic toggle (localStorage update is synchronous).
    toggleRead(msg.id);
    if (viewMessage && viewMessage.id === msg.id) {
      setViewMessage({ ...viewMessage, isRead: !viewMessage.isRead });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    removeMessage(deleteId);
    setDeleteId(null);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-charcoal">مدیریت پیام‌ها</h2>
          {unreadCount > 0 && (
            <Badge className="bg-gold text-white">{unreadCount} خوانده‌نشده</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {messages.length} پیام
        </p>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-border/60">
            <Mail className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">پیامی وجود ندارد</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer
                ${!msg.isRead ? 'border-red-300 bg-red-50/30' : 'border-emerald-200 bg-emerald-50/20'}`}
              onClick={() => setViewMessage(msg)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${!msg.isRead ? 'bg-red-100' : 'bg-emerald-100'}`}>
                  {!msg.isRead ? (
                    <Mail className="w-5 h-5 text-red-600" />
                  ) : (
                    <MailOpen className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${!msg.isRead ? 'text-charcoal' : 'text-muted-foreground'}`}>
                      {msg.name}
                    </span>
                    <span className="text-xs text-muted-foreground" dir="ltr">{msg.email}</span>
                    {/* Status dot: Red = Unread, Green = Read */}
                    <span
                      className={`w-2 h-2 rounded-full ${!msg.isRead ? 'bg-red-500' : 'bg-emerald-500'}`}
                      title={!msg.isRead ? 'خوانده‌نشده' : 'خوانده‌شده'}
                    />
                  </div>
                  <p className={`text-sm mt-1 truncate ${!msg.isRead ? 'text-charcoal font-medium' : 'text-muted-foreground'}`}>
                    {msg.subject || 'بدون موضوع'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(msg.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMarkAsRead(msg)}
                    title={msg.isRead ? 'علامت‌گذاری به عنوان خوانده‌نشده' : 'علامت‌گذاری به عنوان خوانده‌شده'}
                  >
                    {msg.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(msg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Message Dialog */}
      <Dialog open={!!viewMessage} onOpenChange={(open) => !open && setViewMessage(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg">{viewMessage?.subject || 'بدون موضوع'}</DialogTitle>
          </DialogHeader>
          {viewMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">{viewMessage.name}</p>
                  <p className="text-muted-foreground" dir="ltr">{viewMessage.email}</p>
                </div>
                <span className="text-xs text-muted-foreground mr-auto">{formatDate(viewMessage.createdAt)}</span>
              </div>
              {/* Phone number row - shown in message details */}
              {viewMessage.phone && (
                <div className="flex items-center gap-3 text-sm bg-muted/30 rounded-lg p-3">
                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">شماره تماس</p>
                    <p className="font-medium text-charcoal" dir="ltr">{viewMessage.phone}</p>
                  </div>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-4 text-sm leading-7 whitespace-pre-wrap">
                {viewMessage.message}
              </div>
              {/* Status badge: Red = Unread, Green = Read */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${viewMessage.isRead ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={viewMessage.isRead ? 'text-emerald-600' : 'text-red-600'}>
                  {viewMessage.isRead ? 'خوانده‌شده' : 'خوانده‌نشده'}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleMarkAsRead(viewMessage)}
                >
                  {viewMessage.isRead ? 'علامت‌گذاری خوانده‌نشده' : 'علامت‌گذاری به عنوان خوانده‌شده'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف پیام</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این پیام اطمینان دارید؟ این عمل غیرقابل بازگشت است.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

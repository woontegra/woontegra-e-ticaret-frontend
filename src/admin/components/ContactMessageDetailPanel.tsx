import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContactMessageDto, ContactMessageStatus } from '@/shared/types/api';
import { ApiError } from '@/shared/api/client';
import {
  CONTACT_MESSAGE_STATUS_LABELS,
  replyContactMessage,
  updateContactMessageNote,
  updateContactMessageStatus,
} from '@/shared/api/contact.api';
import { Badge, Button, Label, Select, Textarea } from '@/shared/ui';

interface ContactMessageDetailPanelProps {
  message: ContactMessageDto;
}

export function ContactMessageDetailPanel({
  message,
}: ContactMessageDetailPanelProps) {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState(message.adminNote ?? '');
  const [replyMessage, setReplyMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setAdminNote(message.adminNote ?? '');
    setReplyMessage('');
  }, [message.id, message.adminNote]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] });
    queryClient.setQueryData(
      ['admin', 'contact-messages', message.id],
      undefined,
    );
  };

  const statusMutation = useMutation({
    mutationFn: (status: ContactMessageStatus) =>
      updateContactMessageStatus(message.id, status),
    onSuccess: invalidate,
  });

  const noteMutation = useMutation({
    mutationFn: () => updateContactMessageNote(message.id, adminNote.trim() || null),
    onSuccess: () => {
      invalidate();
      setFeedback('Not kaydedildi.');
    },
  });

  const replyMutation = useMutation({
    mutationFn: () => replyContactMessage(message.id, replyMessage.trim()),
    onSuccess: (result) => {
      invalidate();
      setReplyMessage('');
      setFeedback(
        result.mail.sent
          ? 'Yanıt gönderildi.'
          : `Yanıt kaydedildi ancak mail gönderilemedi: ${result.mail.error ?? 'bilinmeyen hata'}`,
      );
    },
    onError: (error) => {
      setFeedback(
        error instanceof ApiError ? error.message : 'Yanıt gönderilemedi',
      );
    },
  });

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={message.status === 'NEW' ? 'warning' : 'default'}>
          {CONTACT_MESSAGE_STATUS_LABELS[message.status]}
        </Badge>
        {message.source ? (
          <span className="text-xs text-slate-500">Kaynak: {message.source}</span>
        ) : null}
      </div>

      <section>
        <h3 className="font-semibold text-slate-800">Gönderen</h3>
        <dl className="mt-2 space-y-1">
          <div>
            <dt className="text-slate-500">Ad</dt>
            <dd>{message.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">E-posta</dt>
            <dd>
              <a href={`mailto:${message.email}`} className="hover:underline">
                {message.email}
              </a>
            </dd>
          </div>
          {message.phone ? (
            <div>
              <dt className="text-slate-500">Telefon</dt>
              <dd>{message.phone}</dd>
            </div>
          ) : null}
          {message.subject ? (
            <div>
              <dt className="text-slate-500">Konu</dt>
              <dd>{message.subject}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section>
        <h3 className="font-semibold text-slate-800">Mesaj</h3>
        <p className="mt-2 whitespace-pre-wrap text-slate-700">{message.message}</p>
      </section>

      <section>
        <Label>Durum</Label>
        <Select
          className="mt-1"
          value={message.status}
          disabled={statusMutation.isPending}
          onChange={(e) =>
            statusMutation.mutate(e.target.value as ContactMessageStatus)
          }
        >
          {Object.entries(CONTACT_MESSAGE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </section>

      <section>
        <Label>İç not</Label>
        <Textarea
          className="mt-1"
          rows={3}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />
        <Button
          size="sm"
          className="mt-2"
          disabled={noteMutation.isPending}
          onClick={() => noteMutation.mutate()}
        >
          Notu kaydet
        </Button>
      </section>

      <section>
        <Label>E-posta yanıtı</Label>
        <Textarea
          className="mt-1"
          rows={5}
          value={replyMessage}
          placeholder="Müşteriye gönderilecek yanıt…"
          onChange={(e) => setReplyMessage(e.target.value)}
        />
        <Button
          size="sm"
          className="mt-2"
          disabled={replyMutation.isPending || !replyMessage.trim()}
          onClick={() => replyMutation.mutate()}
        >
          Yanıt gönder
        </Button>
        {message.repliedAt ? (
          <p className="mt-2 text-xs text-slate-500">
            Son yanıt: {new Date(message.repliedAt).toLocaleString('tr-TR')}
          </p>
        ) : null}
      </section>

      {feedback ? <p className="text-slate-600">{feedback}</p> : null}

      <p className="text-xs text-slate-400">
        {new Date(message.createdAt).toLocaleString('tr-TR')}
      </p>
    </div>
  );
}

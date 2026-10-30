import React, { useState, useEffect } from 'react';
import { 
  Mail, MailOpen, Trash2, Reply, RefreshCw, Filter, 
  Search, Clock, User, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { ContactMessage } from '../../types';
import { 
  fetchContactMessages, 
  updateMessageStatus, 
  deleteContactMessage 
} from '../../services/cmsService';

export const AdminMessagesTab: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const data = await fetchContactMessages();
      setMessages(data);
      if (selectedMessage) {
        const updated = data.find(m => m.id === selectedMessage.id);
        if (updated) setSelectedMessage(updated);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleStatusChange = async (msgId: string, status: 'unread' | 'read' | 'replied') => {
    try {
      await updateMessageStatus(msgId, status);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status } : m));
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(prev => prev ? { ...prev, status } : null);
      }
      setActionSuccess(`Message marked as ${status}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update message status');
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteContactMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(null);
      }
      setActionSuccess('Message deleted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              Contact Inquiries & Support Inbox
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time messages sent by users and visitors from the public Contact Us page.
          </p>
        </div>
        <button
          onClick={loadMessages}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Inbox
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {actionError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by sender, email, subject, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          {(['all', 'unread', 'read', 'replied'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Messages List & Message Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List Column */}
        <div className="lg:col-span-5 space-y-2 max-h-[650px] overflow-y-auto pr-1">
          {loading && messages.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/50 rounded-2xl border border-slate-700/50 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/50 rounded-2xl border border-slate-700/50 text-slate-400">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No messages found.
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              const dateStr = msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recent';
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === 'unread') {
                      handleStatusChange(msg.id, 'read');
                    }
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md'
                      : msg.status === 'unread'
                      ? 'bg-slate-800/90 border-slate-600 hover:border-slate-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm font-semibold truncate ${msg.status === 'unread' ? 'text-white' : 'text-slate-300'}`}>
                      {msg.name}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>
                  <p className={`text-xs font-medium truncate mb-1 ${msg.status === 'unread' ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {msg.subject || '(No Subject)'}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {msg.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate max-w-[180px]">{msg.email}</span>
                    <span className={`px-2 py-0.5 rounded-full capitalize font-semibold text-[10px] ${
                      msg.status === 'unread'
                        ? 'bg-rose-500/20 text-rose-300'
                        : msg.status === 'replied'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Message Detail Column */}
        <div className="lg:col-span-7 bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 flex flex-col justify-between min-h-[500px]">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {selectedMessage.subject || 'No Subject Provided'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      {selectedMessage.name}
                    </span>
                    <span>•</span>
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {selectedMessage.email}
                    </a>
                    <span>•</span>
                    <span className="text-slate-500">
                      {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status === 'unread' ? 'read' : 'unread')}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                    title={selectedMessage.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                  >
                    {selectedMessage.status === 'unread' ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[220px]">
                {selectedMessage.message}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>

                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent('Re: ' + (selectedMessage.subject || 'SobTools Support Inquiry'))}`}
                  onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Reply className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-500">
              <Mail className="w-12 h-12 mb-3 opacity-30 text-indigo-400" />
              <h4 className="text-slate-300 font-semibold mb-1">No Message Selected</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Select an inquiry from the inbox on the left to read details, mark status, or reply directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useHistory } from '../context/HistoryContext';
import { formatRelativeTime } from '../lib/format';
import { proxied } from '../lib/proxied';
import { CloseIcon } from './icons';
import { ConfirmDialog } from './ConfirmDialog';
import type { HistoryItem } from '../types';

interface SidebarProps {
  onSelectItem: (item: HistoryItem) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ onSelectItem, mobileOpen, onMobileClose }: SidebarProps) {
  const { items, activeId, remove, clear } = useHistory();
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Tick once a minute so the relative-time labels stay fresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Escape to close on mobile
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  const handleClear = () => {
    if (items.length === 0) return;
    setIsClearConfirmOpen(true);
  };

  const confirmClear = () => {
    clear();
    setIsClearConfirmOpen(false);
  };

  // Closing the drawer after selecting an item feels right on mobile.
  const handleSelect = (item: HistoryItem) => {
    onSelectItem(item);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[min(20rem,85vw)] shrink-0 transform p-3 transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-72 lg:translate-x-0 lg:p-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="glass-dark flex h-full flex-col overflow-hidden rounded-2xl text-white lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold tracking-wide">历史记录</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              className="rounded-lg px-2 py-1 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              清空
            </button>
            <button
              onClick={onMobileClose}
              aria-label="关闭"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-2 pb-4">
          {items.length === 0 ? (
            <EmptyHistory />
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <HistoryItemRow
                  key={item.id}
                  item={item}
                  active={activeId === item.id}
                  onClick={() => handleSelect(item)}
                  onDelete={() => remove(item.id)}
                />
              ))}
            </div>
          )}
        </div>

          <div className="border-t border-white/5 px-5 py-4 text-[11px] text-white/40">
            历史记录保存在本地浏览器
          </div>
        </div>
      </aside>
      <ConfirmDialog
        open={isClearConfirmOpen}
        title="清空历史记录？"
        message="这会删除你本地保存的全部生成记录，此操作无法撤销。"
        confirmLabel="清空"
        tone="danger"
        onConfirm={confirmClear}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </>
  );
}

function EmptyHistory() {
  return (
    <div className="mt-16 flex flex-col items-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <svg
          className="h-6 w-6 text-white/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4 15 4-4a3 3 0 0 1 4 0l5 5M14 14l1-1a3 3 0 0 1 4 0l1 1M4 6h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-medium text-white/70">还没有生成记录</p>
      <p className="mt-1 text-xs text-white/40">你的创作会出现在这里</p>
    </div>
  );
}

interface HistoryItemRowProps {
  item: HistoryItem;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function HistoryItemRow({ item, active, onClick, onDelete }: HistoryItemRowProps) {
  const [broken, setBroken] = useState(false);

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={`flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-white/5 focus:bg-white/10 focus:outline-none ${
          active ? 'bg-white/10' : ''
        }`}
      >
        {broken ? (
          <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-rose-500/30 to-orange-500/30" />
        ) : (
          <img
            src={proxied(item.imageUrl)}
            alt={item.prompt.slice(0, 24)}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-12 w-12 flex-shrink-0 rounded-lg bg-white/5 object-cover"
          />
        )}
        <div className="min-w-0 flex-1 pr-5">
          <p className="line-clamp-2 text-[13px] leading-snug text-white/90">{item.prompt}</p>
          <p className="mt-1 text-[11px] text-white/40">{formatRelativeTime(item.createdAt)}</p>
        </div>
      </button>
      <button
        onClick={handleDeleteClick}
        aria-label="删除"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md text-white/40 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-300 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </button>
    </div>
  );
}

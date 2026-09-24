const ORDER_SEEN_KEY = 'admin_orders_seen_at';
const NOTIFICATION_SEEN_KEY = 'admin_notifications_seen_at';
const MESSAGE_SEEN_KEY = 'admin_messages_seen_at';

const getSeenAt = (key) => {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem(key)) || 0;
};

const markSeen = (key, timestamp = Date.now()) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, String(timestamp));
  window.dispatchEvent(new CustomEvent('admin-seen-state-updated', { detail: { key, timestamp } }));
};

export { ORDER_SEEN_KEY, NOTIFICATION_SEEN_KEY, MESSAGE_SEEN_KEY, getSeenAt, markSeen };

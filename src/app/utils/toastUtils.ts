import { toast } from 'sonner';

// Track recent toasts to avoid duplicates
const recentToasts = new Map<string, number>();
const TOAST_COOLDOWN = 3000; // 3 seconds cooldown for same message
const TOAST_DELAY = 500; // 500ms delay between different toasts

let lastToastTime = 0;

/**
 * Show a toast with deduplication and rate limiting
 */
export function showToast(type: 'success' | 'error' | 'info', message: string) {
  const now = Date.now();
  
  // Check if we recently showed this exact message
  const lastShown = recentToasts.get(message);
  if (lastShown && (now - lastShown) < TOAST_COOLDOWN) {
    console.log('[Toast] Skipping duplicate message:', message);
    return;
  }
  
  // Add delay between different toasts to allow user to read
  const timeSinceLastToast = now - lastToastTime;
  const delay = timeSinceLastToast < TOAST_DELAY ? TOAST_DELAY - timeSinceLastToast : 0;
  
  setTimeout(() => {
    // Show the toast
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
    
    // Track this message
    recentToasts.set(message, Date.now());
    lastToastTime = Date.now();
    
    // Clean up old entries after cooldown
    setTimeout(() => {
      recentToasts.delete(message);
    }, TOAST_COOLDOWN);
  }, delay);
}

/**
 * Clear all tracked toasts (useful for testing)
 */
export function clearToastHistory() {
  recentToasts.clear();
  lastToastTime = 0;
}

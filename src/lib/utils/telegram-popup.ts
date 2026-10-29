export function markManagerTelegramPopupPending(windowRef: Window = window) {
  windowRef.sessionStorage.setItem('affclicker-manager-telegram-popup-pending', 'true')
}

export function consumeManagerTelegramPopupPending(windowRef: Window = window) {
  const pending = windowRef.sessionStorage.getItem('affclicker-manager-telegram-popup-pending') === 'true'

  if (pending) {
    windowRef.sessionStorage.removeItem('affclicker-manager-telegram-popup-pending')
  }

  return pending
}

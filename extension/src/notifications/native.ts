import { DateOnly, addDays, dayOfWeekIndexes, fromDateOnlyKey, getDisplayDate, toDateOnlyKey } from '../types/dates'
import { Notification, Notifications } from '../types/notifications'

const hasGrantedNativeNotificationsPermission = () => {
  return new Promise<boolean>((resolve) =>
    chrome.notifications.getPermissionLevel((level) => resolve(level === 'granted')),
  )
}

export const buildNativeNotificationId = (monday: DateOnly, notification: Notification): string => {
  switch (notification.type) {
    case 'daily':
      return `daily-${toDateOnlyKey(monday)}-${notification.dayOfWeek}`
    case 'end-of-week':
      return `end-of-week-${monday}`
    case 'end-of-month':
      return `end-of-month-${monday}`
  }
}

export const checkIfAnyNotificationsMatchId = (notifications: Notifications, notificationId: string): boolean => {
  for (const [startMondayKey, timeSheetNotifications] of Object.entries(notifications)) {
    for (const timeSheetNotification of timeSheetNotifications) {
      const checkNotificationId = buildNativeNotificationId(fromDateOnlyKey(startMondayKey), timeSheetNotification)

      if (checkNotificationId === notificationId) {
        return true
      }
    }
  }

  return false
}

const buildNativeNotificationOptions = async (
  startMonday: DateOnly,
  notification: Notification,
): Promise<chrome.notifications.NotificationOptions<true>> => {
  let message: string

  if (notification.type === 'daily') {
    const dayOfWeekIndex = dayOfWeekIndexes[notification.dayOfWeek]
    const dateForDailyNotification = addDays(startMonday, dayOfWeekIndex)
    const displayDate = getDisplayDate(dateForDailyNotification)
    message = `Please fill in your timecard for ${displayDate}`
  } else if (notification.type === 'end-of-week') {
    const endDate = addDays(startMonday, 6)
    const startDisplayDate = getDisplayDate(startMonday)
    const endDisplayDate = getDisplayDate(endDate)
    message = `Please submit your timesheet for ${startDisplayDate} - ${endDisplayDate}`
  } else {
    const startDisplayDate = getDisplayDate(startMonday)
    const endDisplayDate = getDisplayDate(notification.endOfMonthDate)
    message = `Please submit your timesheet for ${startDisplayDate} - ${endDisplayDate}`
  }

  return {
    iconUrl: 'images/logo32.png',
    message,
    title: 'Clock Storm',
    type: 'basic',
  }
}

export const createNativeNotification = async (
  notificationId: string,
  startMonday: DateOnly,
  notificationType: Notification,
) => {
  const hasPermission = await hasGrantedNativeNotificationsPermission()
  if (!hasPermission) {
    console.warn('Cannot create native notification because the user has not granted permission')
    return
  }

  chrome.notifications.create(notificationId, await buildNativeNotificationOptions(startMonday, notificationType))
}

export const clearNativeNotification = async (notificationId: string) => {
  const hasPermission = await hasGrantedNativeNotificationsPermission()
  if (!hasPermission) {
    console.warn('Cannot clear native notification because the user has not granted permission')
    return
  }

  chrome.notifications.clear(notificationId)
}

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { loveMessages } from '../data/loveMessages';

const DAILY_NOTIFICATION_MARKER = 'daily-love-message';
const DAILY_NOTIFICATION_HORIZON_DAYS = 30;

export function setNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function scheduleDailyLoveNotification() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-love', {
      name: 'Daily Love',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledDailyNotifications = existing.filter(
    (notification) =>
      typeof notification.content.data?.type === 'string' &&
      notification.content.data.type.startsWith(DAILY_NOTIFICATION_MARKER),
  );

  if (scheduledDailyNotifications.length >= DAILY_NOTIFICATION_HORIZON_DAYS) {
    return true;
  }

  const scheduledDays = new Set(
    scheduledDailyNotifications
      .map((notification) => notification.content.data?.scheduledFor)
      .filter((value): value is string => typeof value === 'string'),
  );

  const today = new Date();

  for (let dayOffset = 0; dayOffset < DAILY_NOTIFICATION_HORIZON_DAYS; dayOffset += 1) {
    const scheduledDate = new Date(today);
    scheduledDate.setHours(21, 0, 0, 0);
    scheduledDate.setDate(today.getDate() + dayOffset);

    if (scheduledDate <= today) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const scheduledKey = scheduledDate.toISOString().slice(0, 10);

    if (scheduledDays.has(scheduledKey)) {
      continue;
    }

    const randomMessage =
      loveMessages[Math.floor(Math.random() * loveMessages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'For Her',
        body: randomMessage,
        data: {
          type: `${DAILY_NOTIFICATION_MARKER}-${scheduledKey}`,
          scheduledFor: scheduledKey,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledDate,
        channelId: Platform.OS === 'android' ? 'daily-love' : undefined,
      },
    });
  }

  return true;
}

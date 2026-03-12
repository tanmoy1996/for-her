import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { loveMessages } from '../data/loveMessages';

const DAILY_NOTIFICATION_MARKER = 'daily-love-message';

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
  const alreadyScheduled = existing.some(
    (notification) => notification.content.data?.type === DAILY_NOTIFICATION_MARKER,
  );

  if (alreadyScheduled) {
    return true;
  }

  const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'For Her',
      body: randomMessage,
      data: { type: DAILY_NOTIFICATION_MARKER },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
      channelId: Platform.OS === 'android' ? 'daily-love' : undefined,
    },
  });

  return true;
}

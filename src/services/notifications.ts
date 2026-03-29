import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';

import { loveMessages } from '../data/loveMessages';

const DAILY_NOTIFICATION_MARKER = 'daily-love-message';
const DAILY_NOTIFICATION_HORIZON_DAYS = 30;
const MEMORY_REMINDER_MARKER = 'memory-anniversary';
const MEMORY_REMINDER_HORIZON_YEARS = 20;

type MemoryReminder = {
  id: string;
  title: string;
  date: string;
  remindEveryYear?: boolean;
};

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
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  await ensureAndroidChannel('daily-love', 'Daily Love');

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

export async function refreshMemoryReminderNotifications(memory: MemoryReminder) {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  await ensureAndroidChannel('memory-reminders', 'Memory Reminders');
  await cancelMemoryReminderNotifications(memory.id);

  if (!memory.remindEveryYear) {
    return true;
  }

  const upcomingNotifications = buildMemoryReminderSchedule(memory);

  for (const reminder of upcomingNotifications) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'For Her',
        body: reminder.body,
        data: {
          type: reminder.type,
          memoryId: memory.id,
          scheduledFor: reminder.scheduledFor,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: Platform.OS === 'android' ? 'memory-reminders' : undefined,
      },
    });
  }

  return true;
}

export async function syncMemoryReminderNotifications(memories: MemoryReminder[]) {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  await ensureAndroidChannel('memory-reminders', 'Memory Reminders');

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const existingMemoryNotifications = existing.filter(
    (notification) =>
      typeof notification.content.data?.type === 'string' &&
      notification.content.data.type.startsWith(MEMORY_REMINDER_MARKER),
  );

  const desiredNotifications = new Map(
    memories
      .filter((memory) => memory.remindEveryYear)
      .flatMap((memory) =>
        buildMemoryReminderSchedule(memory).map((reminder) => [
          reminder.type,
          {
            ...reminder,
            memoryId: memory.id,
          },
        ]),
      ),
  );

  for (const notification of existingMemoryNotifications) {
    const notificationType = notification.content.data?.type;
    if (
      typeof notificationType === 'string' &&
      !desiredNotifications.has(notificationType)
    ) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  }

  const scheduledTypes = new Set(
    existingMemoryNotifications
      .map((notification) => notification.content.data?.type)
      .filter((value): value is string => typeof value === 'string'),
  );

  for (const [notificationType, reminder] of desiredNotifications) {
    if (scheduledTypes.has(notificationType)) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'For Her',
        body: reminder.body,
        data: {
          type: notificationType,
          memoryId: reminder.memoryId,
          scheduledFor: reminder.scheduledFor,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: Platform.OS === 'android' ? 'memory-reminders' : undefined,
      },
    });
  }

  return true;
}

export async function cancelMemoryReminderNotifications(memoryId: string) {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const notificationsToCancel = existing.filter(
    (notification) => notification.content.data?.memoryId === memoryId,
  );

  for (const notification of notificationsToCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

async function ensureNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureAndroidChannel(channelId: string, name: string) {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function buildMemoryReminderSchedule(memory: MemoryReminder) {
  const memoryDate = dayjs(memory.date);
  if (!memoryDate.isValid()) {
    return [];
  }

  const now = dayjs();
  const notifications = [];

  for (
    let yearOffset = 1;
    yearOffset <= MEMORY_REMINDER_HORIZON_YEARS;
    yearOffset += 1
  ) {
    const reminderDate = memoryDate
      .add(yearOffset, 'year')
      .hour(9)
      .minute(0)
      .second(0)
      .millisecond(0);

    if (!reminderDate.isAfter(now)) {
      continue;
    }

    const scheduledFor = reminderDate.format('YYYY-MM-DD');
    notifications.push({
      type: `${MEMORY_REMINDER_MARKER}-${memory.id}-${scheduledFor}`,
      scheduledFor,
      body: buildMemoryReminderBody(memory.title, yearOffset),
      date: reminderDate.toDate(),
    });
  }

  return notifications;
}

function buildMemoryReminderBody(title: string, yearsAgo: number) {
  const normalizedTitle = title.trim();
  const yearLabel = yearsAgo === 1 ? 'year' : 'years';

  return `This day ${yearsAgo} ${yearLabel} ago: ${normalizedTitle}`;
}

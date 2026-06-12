import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const DAILY_REMINDER_ID = 1001;
const WELCOME_ID = 1002;

/**
 * Ask for notification permission and schedule the daily expense reminder.
 * Safe to call on every app start: does nothing on the web, and won't
 * duplicate the reminder if it's already scheduled.
 */
export async function setupNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    let { display } = await LocalNotifications.checkPermissions();
    if (display !== "granted") {
      ({ display } = await LocalNotifications.requestPermissions());
    }
    if (display !== "granted") return;

    // One-time confirmation the first time permission is granted
    if (!localStorage.getItem("notificationsWelcomed")) {
      localStorage.setItem("notificationsWelcomed", "true");
      await LocalNotifications.schedule({
        notifications: [
          {
            id: WELCOME_ID,
            title: "Spendly reminders are on 🎉",
            body: "We'll nudge you each evening to log your expenses.",
            schedule: { at: new Date(Date.now() + 5000) },
          },
        ],
      });
    }

    // Daily reminder at 8pm, skip if already scheduled
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.some((n) => n.id === DAILY_REMINDER_ID)) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_REMINDER_ID,
          title: "Spendly",
          body: "Don't forget to log today's expenses 💸",
          schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true },
        },
      ],
    });
  } catch (error) {
    console.error("Error setting up notifications:", error);
  }
}

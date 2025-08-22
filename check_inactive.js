require('dotenv').config();
const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Config
const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 17 * * *";
const TEST_MODE = process.env.TEST_MODE === "true";

// Init Telegram bot
const bot = new TelegramBot(BOT_TOKEN);

// Logging helper
const log = (...args) => console.log(new Date().toISOString(), ...args);

// Main logic as a reusable function
async function checkInactiveUsers() {
  log("⏰ Checking for inactive users...");

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  try {
    const tgLinksSnapshot = await db
      .collection("telegram_links")
      .where("chat_id", "!=", null)
      .get();

    if (tgLinksSnapshot.empty) {
      log("⚠️ No telegramLinks with chatId found.");
      return;
    }

    let notified = 0;

    // Process in parallel
    await Promise.all(
      tgLinksSnapshot.docs.map(async (doc) => {
        const { firebase_id, chat_id } = doc.data();
        if (!firebase_id || !chat_id) return;

        try {
          const userDoc = await db.collection("users").doc(firebase_id).get();
          if (!userDoc.exists) return;

          const data = userDoc.data();
          if (!data.lastActiveAt) return;

          const lastActiveDate = data.lastActiveAt.toDate();

          if (lastActiveDate < sevenDaysAgo) {
            await bot.sendMessage(
              chat_id,
              "👋 Hey! We've missed you — come back and continue your courses! 🚀",
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "🌐 Visit Platform", url: APP_URL }],
                  ],
                },
              }
            );
            log(`✅ Reminder sent to user firebase_id: ${firebase_id}`);
            notified++;
          }
        } catch (err) {
          log(`❌ Error processing user ${firebase_id}:`, err.message);
        }
      })
    );

    log(`✅ Done! Total inactive users notified: ${notified}`);
  } catch (err) {
    log("❌ Error in checkInactiveUsers:", err.message);
  }
}

// Schedule cron
if (!TEST_MODE) {
  cron.schedule(CRON_SCHEDULE, checkInactiveUsers);
  log(`📅 Cron job scheduled: ${CRON_SCHEDULE}`);
} else {
  // In test mode, run immediately
  log("🧪 TEST_MODE=true → running checkInactiveUsers immediately...");
  checkInactiveUsers();
}

log("🤖 Telegram bot started and ready.");

// ==================================================================================================
// in the future add the following feature after checking if a course is not finished
// ==================================================================================================
{/*// Schedule message every day at 5:00 PM server time
cron.schedule("0 17 * * *", async () => {
  console.log("Running scheduled job: Sending message to active users");

  try {
    // Query users who have chatId stored (means linked to Telegram)
    const usersSnapshot = await db.collection("users").where("chatId", "!=", null).get();

    if (usersSnapshot.empty) {
      console.log("No users with chatId found.");
      return;
    }

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.chatId) {
        bot.sendMessage(
          data.chatId,
          "⏰ Reminder: Check out your courses today! 🚀"
        );
      }
    });
  } catch (err) {
    console.error("Error sending scheduled messages:", err);
  }
});

console.log("Telegram bot started and polling...");
*/}
// Load .env locally (Railway injects env vars automatically)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const appUrl = process.env.APP_URL;

// ===== Safety Checks =====
if (!token) {
  console.error("❌ BOT_TOKEN is missing! Did you set it in Railway Variables?");
  process.exit(1);
}
if (!appUrl) {
  console.warn("⚠️ APP_URL not set. Inline button may not work.");
}

// Start bot in polling mode
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Bot is running...");

// ===== Reply Keyboard (persistent below input) =====
const replyKeyboard = {
  keyboard: [
    [{ text: "/start" }, { text: "/about" }],
    [{ text: "/help" }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

// ===== Inline Button (appears under message) =====
const inlineOpenApp = {
  inline_keyboard: [[{ text: "🚀 Open App", url: appUrl }]],
};

// ===== Helpers =====
function sendWelcome(chatId, text) {
  // Send welcome with reply keyboard
  bot.sendMessage(chatId, text, { reply_markup: replyKeyboard });

  // Then send inline app button separately
  if (appUrl) {
    bot.sendMessage(chatId, "👇 Open the platform:", {
      reply_markup: inlineOpenApp,
    });
  }
}

// ===== Commands =====

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`📥 /start from chatId: ${chatId}`);
  sendWelcome(chatId, "👋 Welcome! Use the commands or open the app below.");
});

// /about
bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`📥 /about from chatId: ${chatId}`);

  bot.sendMessage(
    chatId,
    "📚 This bot connects you to our learning platform. You can take courses, track progress, and more!",
    { reply_markup: replyKeyboard }
  );

  if (appUrl) {
    bot.sendMessage(chatId, "👇 Open the platform:", {
      reply_markup: inlineOpenApp,
    });
  }
});

// /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`📥 /help from chatId: ${chatId}`);

  bot.sendMessage(
    chatId,
    "🛠 Commands available:\n/start - Welcome screen\n/about - About us\n/help - This menu",
    { reply_markup: replyKeyboard }
  );
});

// Fallback for unknown messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip known commands
  if (["/start", "/about", "/help"].includes(text)) return;

  console.log(`🤔 Unknown message from chatId ${chatId}: "${text}"`);

  bot.sendMessage(
    chatId,
    "❓ I didn't recognize that. Use the commands below or tap the app button.",
    { reply_markup: replyKeyboard }
  );

  if (appUrl) {
    bot.sendMessage(chatId, "👇 Open the platform:", {
      reply_markup: inlineOpenApp,
    });
  }
});

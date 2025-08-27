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
  inline_keyboard: [[{ text: "🚀 መተግበሪያውን ክፈት", url: appUrl }]],
};

// ===== Helpers =====
function sendWelcome(chatId, text) {
  // Send welcome with reply keyboard
  bot.sendMessage(chatId, text, { reply_markup: replyKeyboard });

  // Then send inline app button separately
  if (appUrl) {
    bot.sendMessage(chatId, "👇 መተግበሪያውን ክፈት:", {
      reply_markup: inlineOpenApp,
    });
  }
}

// ===== Commands =====

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendWelcome(chatId, "ሰላም!\nበዚህ ቦት በኩል የተለያዩ ርዕሶች ላይ የቀረቡ ትምህርቶችን መማር እንዲሁም ማጠናቀቆን የሚያሳይ ሰርተፍኬት ያገኛሉ!\nመማር ለመጀመር መተግበርያውን ይክፈቱ");
});

// /about
bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "📚 በዚህ ቦት በኩል የተለያዩ ርዕሶች ላይ የቀረቡ ትምህርቶችን መማር እንዲሁም ማጠናቀቆን የሚያሳይ ሰርተፍኬት ያገኛሉ\nመማር ለመጀመር መተግበርያውን ይክፈቱ",
    { reply_markup: replyKeyboard }
  );

  if (appUrl) {
    bot.sendMessage(chatId, "👇 መተግበሪያውን ክፈት:", {
      reply_markup: inlineOpenApp,
    });
  }
});

// /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🛠 ያሉት ትዕዛዞች:\n/about - ስለኛ ለማወቅ\n/help - ያሉትን ትዕዛዞች ለማየት",
    { reply_markup: replyKeyboard }
  );
});

// Fallback for unknown messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip known commands
  if (["/start", "/about", "/help"].includes(text)) return;


  bot.sendMessage(
    chatId,
    "❓ የላኩት ትዕዛዛ/መልክት አይታወቅም\n\nመተግበርያውን በመክፈት ይቀጥሉ\n\nለበለጠ መረጃ /about ብለው ይላኩ",
    { reply_markup: replyKeyboard }
  );

  if (appUrl) {
    bot.sendMessage(chatId, "👇 መተግበሪያውን ክፈት:", {
      reply_markup: inlineOpenApp,
    });
  }
});

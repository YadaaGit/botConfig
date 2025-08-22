require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const appUrl = process.env.APP_URL;

// Start bot in polling mode to listen to commands
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Bot is running...');

// Shared reply keyboard
const replyKeyboard = {
  keyboard: [
    [{ text: "/start" }, { text: "/about" }],
    [{ text: "/help" }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

// Shared inline button
const inlineOpenApp = {
  inline_keyboard: [[{ text: "🚀 Open App", url: appUrl }]],
};

// Helper to send message with both keyboards
function sendMessageWithButtons(chatId, text) {
  return bot.sendMessage(chatId, text, {
    reply_markup: {
      ...replyKeyboard,
      ...inlineOpenApp,
    }
  });
}

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`📥 /start from chatId: ${chatId}`);

  sendMessageWithButtons(
    chatId,
    `👋 Welcome! Click below to open the learning platform.`
  );
});

// /about command
bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`📥 /about from chatId: ${chatId}`);

  sendMessageWithButtons(
    chatId,
    `📚 This bot gives you access to our learning platform where you can take courses, track progress, and more.`
  );
});

// /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`📥 /help from chatId: ${chatId}`);

  bot.sendMessage(chatId,
    `🛠 Available Commands:\n/start - Welcome screen\n/about - Learn more\n/help - List commands`,
    { reply_markup: replyKeyboard }
  );
});

// Fallback for unknown messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore known commands
  if (["/start", "/about", "/help"].includes(text)) return;

  console.log(`🤔 Unknown message from chatId ${chatId}: "${text}"`);

  sendMessageWithButtons(
    chatId,
    "❓ I didn't recognize that. Use the commands below or tap the app button."
  );
});

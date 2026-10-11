// ============================================
// PROTECT.JS — Blokir DevTools & Bookmark
// ============================================
(function () {
  "use strict";

  // === 1. Blokir tombol keyboard ===
  document.addEventListener("keydown", function (e) {
    const k = e.key ? e.key.toLowerCase() : "";
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    // F12
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / J / C  (DevTools)
    if (ctrl && shift && ["i", "j", "c"].includes(k)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U  (view source)
    if (ctrl && k === "u") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S  (save page)
    if (ctrl && k === "s") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+P  (print)
    if (ctrl && k === "p") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+D  (bookmark)
    if (ctrl && k === "d") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+B  (toggle bookmark bar)
    if (ctrl && shift && k === "b") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+O  (bookmark manager Chrome)
    if (ctrl && shift && k === "o") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // === 2. Blokir right-click (context menu) ===
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
  }, true);

  // === 3. Blokir drag (drag link ke bookmark bar) ===
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
    return false;
  }, true);

  // === 4. Blokir drop ===
  document.addEventListener("drop", function (e) {
    e.preventDefault();
    return false;
  }, true);

  // === 5. Blokir copy / cut (opsional — bisa di-comment kalau user perlu copy token) ===
  // document.addEventListener("copy", e => e.preventDefault());
  // document.addEventListener("cut", e => e.preventDefault());

  // === 6. Blokir select all ===
  document.addEventListener("selectstart", function (e) {
    // Hanya blokir kalau yang di-select bukan input
    const tag = e.target && e.target.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
    }
  });

  // === 7. Deteksi DevTools terbuka (via ukuran window) ===
  const threshold = 160;
  let devtoolsOpen = false;

  function checkDevTools() {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        onDevToolsOpen();
      }
    } else {
      devtoolsOpen = false;
    }
  }

  function onDevToolsOpen() {
    // Aksi saat DevTools terdeteksi terbuka
    document.body.innerHTML = `
      <div style="
        display:flex;flex-direction:column;justify-content:center;align-items:center;
        height:100vh;background:#0f172a;color:#f87171;font-family:sans-serif;
        text-align:center;padding:20px;
      ">
        <h1 style="font-size:48px;margin-bottom:16px;">🚫</h1>
        <h2 style="font-size:20px;margin-bottom:8px;">DevTools Terdeteksi</h2>
        <p style="color:#94a3b8;font-size:14px;">Tutup DevTools untuk melanjutkan</p>
      </div>
    `;
  }

  setInterval(checkDevTools, 1000);

  // === 8. Debugger trap (bikin DevTools berat kalau dipaksa buka) ===
  // Aktifkan kalau mau — bikin DevTools freeze terus-terusan
  /*
  setInterval(function () {
    (function () {
      return false;
    }["constructor"]("debugger")());
  }, 100);
  */

  // === 9. Blokir console.log biar gak gampang liat data ===
  // (opsional — bisa ganggu debugging sendiri)
  /*
  const noop = () => {};
  window.console = {
    log: noop, warn: noop, error: noop, info: noop,
    debug: noop, trace: noop, dir: noop
  };
  */

  // === 10. Blokir bookmark via Ctrl+D sudah di atas,
  // tambahan: override window.bookmark via API
  // (tidak ada API resmi, tapi bisa blokir shortcut browser) ===

  // === 11. Blokir middle-click (buka link di tab baru) ===
  document.addEventListener("auxclick", function (e) {
    if (e.button === 1) {
      e.preventDefault();
      return false;
    }
  }, true);

  // === 12. Warning di console (biar orang mikir 2x) ===
  console.log(
    "%c⛔ STOP!",
    "color:#f87171;font-size:32px;font-weight:bold;"
  );
  console.log(
    "%cJangan paste apapun di sini. Kalau kamu diminta paste sesuatu, itu scam.",
    "color:#fbbf24;font-size:14px;"
  );
})();
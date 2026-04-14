/*
 * tools-qr.js
 * QRコード読み取り（jsQRを利用）
 * - クリップボードに画像がある状態で領域をクリック → 読み取り
 * - デコード結果はテキストとして表示。http/httpsのみリンク化。
 */
document.addEventListener("DOMContentLoaded", function () {
  var drop = document.getElementById("qr-drop");
  if (!drop) return;

  var canvas = document.getElementById("qr-canvas");
  var preview = document.getElementById("qr-preview");
  var previewImg = document.getElementById("qr-preview-img");
  var result = document.getElementById("qr-result");
  var errBox = document.getElementById("qr-error");

  function showError(msg) {
    errBox.textContent = msg;
    errBox.style.display = "";
    result.style.display = "none";
  }

  function clearMessages() {
    errBox.style.display = "none";
    result.style.display = "none";
  }

  // http/httpsのみ許可する厳密なURL判定
  function safeHttpUrl(s) {
    try {
      var u = new URL(s.trim());
      if (u.protocol === "http:" || u.protocol === "https:") return u.href;
    } catch (e) { /* not a URL */ }
    return null;
  }

  function showResult(text) {
    // 全てDOM APIで組み立て（innerHTML使用を避けてXSS耐性を確保）
    result.textContent = "";
    var url = safeHttpUrl(text);
    if (url) {
      var a = document.createElement("a");
      a.href = url;
      a.textContent = text;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      result.appendChild(a);
    } else {
      result.appendChild(document.createTextNode(text));
    }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "qr-copy-btn";
    btn.textContent = "コピー";
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(text).then(function () {
        var orig = btn.textContent;
        btn.textContent = "コピーしました";
        setTimeout(function () { btn.textContent = orig; }, 1200);
      });
    });
    result.appendChild(document.createTextNode(" "));
    result.appendChild(btn);

    result.style.display = "";
    errBox.style.display = "none";
  }

  function decodeFromImage(img) {
    if (typeof jsQR === "undefined") {
      showError("jsQR ライブラリの読み込みに失敗しました");
      return;
    }
    previewImg.src = img.src;
    preview.style.display = "";

    // 大きすぎる画像は縮小（最長辺 1024px 程度）
    var maxSide = 1024;
    var scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    var w = Math.max(1, Math.round(img.naturalWidth * scale));
    var h = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    var imgData = ctx.getImageData(0, 0, w, h);

    var code = jsQR(imgData.data, w, h, { inversionAttempts: "attemptBoth" });
    if (code && code.data) {
      showResult(code.data);
    } else {
      showError("QRコードを検出できませんでした");
    }
  }

  function loadBlob(blob) {
    // 画像MIMEのみ許可
    if (!blob || !blob.type || blob.type.indexOf("image/") !== 0) {
      showError("画像データではありません");
      return;
    }
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      try { decodeFromImage(img); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      showError("画像の読み込みに失敗しました");
    };
    img.src = url;
  }

  function readClipboard() {
    clearMessages();
    if (!navigator.clipboard || !navigator.clipboard.read) {
      showError("このブラウザはクリップボード読み取りAPIに対応していません。");
      return;
    }
    navigator.clipboard.read().then(function (items) {
      var allTypes = [];
      for (var i = 0; i < items.length; i++) {
        var types = items[i].types || [];
        allTypes = allTypes.concat(types);
        var imgType = null;
        for (var j = 0; j < types.length; j++) {
          if (types[j].indexOf("image/") === 0) { imgType = types[j]; break; }
        }
        if (imgType) {
          items[i].getType(imgType).then(loadBlob).catch(function (e) {
            showError("画像取得に失敗: " + (e && e.message || e));
          });
          return;
        }
      }
      showError("クリップボードに画像がありません（検出タイプ: " + (allTypes.join(", ") || "なし") + "）");
    }).catch(function (err) {
      if (err && err.name === "NotAllowedError") {
        showError("クリップボードへのアクセスが許可されませんでした");
      } else {
        showError("クリップボード読み取りに失敗しました: " + (err && err.message || err));
      }
    });
  }

  drop.addEventListener("click", readClipboard);
  drop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      readClipboard();
    }
  });
});

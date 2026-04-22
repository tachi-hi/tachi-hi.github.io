// 計算ツール（dB、MIDI/ピアノ、BPS、$/h→￥/月、数値変換、BMI）
document.addEventListener("DOMContentLoaded", function () {

  // ============================================
  // dB and amplitude
  // ============================================
  var amp2dbInput = document.getElementById("amp2db");
  if (amp2dbInput) {
    amp2dbInput.addEventListener("input", function () {
      var amp = parseFloat(this.value);
      var db = 10 * Math.log10(Math.pow(amp, 2));
      document.getElementById("db_result").textContent = db + "[dB]";
    });
  }

  var db2ampInput = document.getElementById("db2amp");
  if (db2ampInput) {
    db2ampInput.addEventListener("input", function () {
      var db = parseFloat(this.value);
      var amp = Math.pow(10, db / 20);
      document.getElementById("amp_result").textContent = amp;
    });
  }

  // ============================================
  // MIDI to Frequency + Piano keyboard
  // ============================================
  function buildPianoSVG(activeMidi) {
    var WW = 14, WH = 60, BW = 9, BH = 38;
    var isWhite = {0:1, 2:1, 4:1, 5:1, 7:1, 9:1, 11:1};
    var whiteKeys = [], blackKeys = [];
    var wi = 0, whiteX = {};
    for (var m = 21; m <= 108; m++) {
      if (isWhite[m % 12]) {
        whiteX[m] = wi * WW;
        whiteKeys.push(m);
        wi++;
      }
    }
    for (var m = 21; m <= 108; m++) {
      if (!isWhite[m % 12] && whiteX[m - 1] !== undefined) {
        blackKeys.push({midi: m, x: whiteX[m - 1] + WW - BW / 2});
      }
    }
    var tw = wi * WW;
    var s = '<svg viewBox="0 0 ' + tw + ' ' + WH + '" class="piano-svg" style="cursor:pointer">';
    for (var i = 0; i < whiteKeys.length; i++) {
      var m = whiteKeys[i];
      var fill = m === activeMidi ? "#0984e3" : "#fff";
      s += '<rect data-midi="' + m + '" x="' + whiteX[m] + '" y="0" width="' + (WW - 1) +
        '" height="' + WH + '" fill="' + fill +
        '" stroke="#aaa" stroke-width="0.5"/>';
    }
    for (var i = 0; i < blackKeys.length; i++) {
      var k = blackKeys[i];
      var fill = k.midi === activeMidi ? "#0984e3" : "#2d3436";
      s += '<rect data-midi="' + k.midi + '" x="' + k.x + '" y="0" width="' + BW +
        '" height="' + BH + '" fill="' + fill + '" rx="1"/>';
    }
    s += '</svg>';
    return s;
  }

  var midi2freqInput = document.getElementById("midi2freq");
  var pianoEl = document.getElementById("piano");
  function updateMidi(midi, shouldPlay) {
    var notenames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    var freq = 440 * Math.pow(2, (midi - 69) / 12);
    var text =
      notenames[midi % 12] + (Math.floor(midi / 12) - 1) + ", " + freq.toFixed(2) + "Hz";
    document.getElementById("notefreq").textContent = text;
    if (pianoEl) pianoEl.innerHTML = buildPianoSVG(midi);
    if (midi2freqInput) midi2freqInput.value = midi;
    if (shouldPlay) PianoSound.play(midi);
  }

  if (pianoEl) {
    pianoEl.addEventListener("click", function (e) {
      var rect = e.target.closest("[data-midi]");
      if (!rect) return;
      var midi = parseInt(rect.getAttribute("data-midi"));
      if (!isNaN(midi)) updateMidi(midi, true);
    });
  }

  var soundToggle = document.getElementById("piano-sound-toggle");
  if (soundToggle) {
    soundToggle.addEventListener("click", function () {
      PianoSound.setEnabled(!PianoSound.isEnabled());
      var icon = this.querySelector("i");
      if (PianoSound.isEnabled()) {
        icon.className = "fa-solid fa-volume-high";
        this.classList.add("active");
      } else {
        icon.className = "fa-solid fa-volume-xmark";
        this.classList.remove("active");
      }
    });
  }

  if (midi2freqInput) {
    updateMidi(parseInt(midi2freqInput.value) || 60, false);
    midi2freqInput.addEventListener("input", function () {
      updateMidi(parseInt(this.value), true);
    });
  }

  // ============================================
  // BPS and Beats to Time
  // ============================================
  var bpsInput = document.getElementById("bps");
  var nBeatsInput = document.getElementById("n_beats");

  function updateBpsTime() {
    var bps = parseFloat(bpsInput ? bpsInput.value : 0);
    var nBeats = parseFloat(nBeatsInput ? nBeatsInput.value : 0);
    if (bps && nBeats) {
      document.getElementById("bps_nbeats_2_time").textContent =
        (60.0 / bps) * nBeats + " 秒";
    }
  }

  if (bpsInput) bpsInput.addEventListener("input", updateBpsTime);
  if (nBeatsInput) nBeatsInput.addEventListener("input", updateBpsTime);

  // ============================================
  // $/h → ￥/mon
  // ============================================
  var costInput = document.getElementById("cost_usd");
  var rateInput = document.getElementById("exchange_rate");
  var rateRefreshBtn = document.getElementById("rate_refresh");
  var rateSource = document.getElementById("rate_source");
  var userEditedRate = false;

  function updateCost() {
    var costUsd = parseFloat(costInput ? costInput.value : 0);
    var rate = parseFloat(rateInput ? rateInput.value : 150);
    if (costUsd && rate) {
      var monthly = costUsd * 24 * 31 * rate;
      document.getElementById("hourly_cost_2_monthly").textContent =
        Math.round(monthly) + " 円/月";
    }
  }

  function fetchRate() {
    if (!rateInput) return;
    if (rateSource) rateSource.textContent = "為替レート取得中…";
    fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY")
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
      .then(function (data) {
        var jpy = data && data.rates && data.rates.JPY;
        if (!jpy) throw new Error("no JPY rate");
        // ユーザーが手動編集していない場合のみ上書き
        if (!userEditedRate) {
          rateInput.value = jpy.toFixed(2);
          updateCost();
        }
        if (rateSource) {
          rateSource.innerHTML = "為替レート: 1 USD = " + jpy.toFixed(2) +
            " JPY (" + data.date + ") — 出典: " +
            '<a href="https://frankfurter.dev" target="_blank" rel="noopener noreferrer">Frankfurter API</a>' +
            " / 欧州中央銀行 (ECB)";
        }
      })
      .catch(function () {
        if (rateSource) rateSource.textContent =
          "為替レート取得失敗（手動入力してください）";
      });
  }

  // LLM 利用料概算
  var llmIds = ["llm_tokens_in", "llm_tokens_out", "llm_price_in", "llm_price_out", "llm_calls"];
  function updateLlmCost() {
    var tokIn = parseFloat(document.getElementById("llm_tokens_in").value) || 0;
    var tokOut = parseFloat(document.getElementById("llm_tokens_out").value) || 0;
    var priceIn = parseFloat(document.getElementById("llm_price_in").value) || 0;
    var priceOut = parseFloat(document.getElementById("llm_price_out").value) || 0;
    var calls = parseFloat(document.getElementById("llm_calls").value) || 0;
    var usd = ((tokIn * priceIn + tokOut * priceOut) / 1e6) * calls;
    var rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
    var jpy = usd * rate;
    var usdEl = document.getElementById("llm_cost_usd");
    var jpyEl = document.getElementById("llm_cost_jpy");
    if (usdEl) usdEl.textContent = "$" + (usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2));
    if (jpyEl) jpyEl.textContent = rate ? "≈ ¥" + Math.round(jpy).toLocaleString() : "";
  }
  llmIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", updateLlmCost);
  });
  updateLlmCost();

  if (costInput) costInput.addEventListener("input", updateCost);
  if (rateInput) {
    rateInput.addEventListener("input", function () {
      userEditedRate = true;
      updateCost();
      updateLlmCost();
    });
  }
  if (rateRefreshBtn) {
    rateRefreshBtn.addEventListener("click", function () {
      userEditedRate = false;
      fetchRate();
    });
  }
  // 初回ロード時に自動取得
  fetchRate();

  // ============================================
  // 英語の数値表記 → 日本語
  // ============================================
  var numEnInput = document.getElementById("num_en");
  if (numEnInput) {
    // 数値を日本語の単位付き文字列に変換
    function numToJa(n) {
      if (n === 0) return "0";
      var negative = n < 0;
      if (negative) n = -n;
      // [閾値, 単位名]（大きい方から）
      var units = [
        [1e16, "京"], [1e12, "兆"], [1e8, "億"], [1e4, "万"]
      ];
      var parts = [];
      for (var i = 0; i < units.length; i++) {
        if (n >= units[i][0]) {
          var count = Math.floor(n / units[i][0]);
          parts.push(count + units[i][1]);
          n = n % units[i][0];
        }
      }
      // 端数が残っている場合
      if (n >= 1) {
        parts.push(Math.floor(n) + "");
      } else if (n > 0 && parts.length > 0) {
        // 小数の端数は無視（切り捨て済み）
      }
      return (negative ? "-" : "") + (parts.length > 0 ? parts.join("") : "0");
    }

    numEnInput.addEventListener("input", function () {
      var raw = this.value.trim().toUpperCase().replace(/,/g, "");
      if (!raw) {
        document.getElementById("num_ja").textContent = "";
        return;
      }
      // 複数の数値表記に対応（スペース区切り）
      var tokens = raw.split(/\s+/);
      var results = [];
      var suffixes = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
      for (var i = 0; i < tokens.length; i++) {
        var match = tokens[i].match(/^(-?[\d.]+)\s*([KMBT])?$/);
        if (match) {
          var num = parseFloat(match[1]);
          var mul = match[2] ? suffixes[match[2]] : 1;
          results.push(numToJa(num * mul));
        } else {
          results.push("?");
        }
      }
      document.getElementById("num_ja").textContent = results.join("  ");
    });
  }

  // ============================================
  // BMI
  // ============================================
  var bmiHeightInput = document.getElementById("bmi_height");
  var bmiWeightInput = document.getElementById("bmi_weight");

  function updateBmi() {
    var h = parseFloat(bmiHeightInput ? bmiHeightInput.value : 0);
    var w = parseFloat(bmiWeightInput ? bmiWeightInput.value : 0);
    if (h && w) {
      var bmi = w / ((h / 100) * (h / 100));
      document.getElementById("bmi").textContent = "BMI = " + bmi.toFixed(1);
    }
  }

  if (bmiHeightInput) bmiHeightInput.addEventListener("input", updateBmi);
  if (bmiWeightInput) bmiWeightInput.addEventListener("input", updateBmi);
});

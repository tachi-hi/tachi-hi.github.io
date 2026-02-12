document.addEventListener("DOMContentLoaded", function () {
  // ============================================
  // Toggle sections
  // ============================================
  document.querySelectorAll(".topic > h2").forEach(function (heading) {
    heading.addEventListener("click", function () {
      var content = this.parentElement.querySelector(".toggle-content");
      content.classList.toggle("hidden");
    });
  });

  // ============================================
  // 改行削除 + 文字数・単語数カウント
  // ============================================
  function guessLang(text) {
    var codes = text.split("").map(function (c) {
      return c.charCodeAt(0);
    });
    var asciiCount = codes.filter(function (c) {
      return c < 128;
    }).length;
    var ratio = (asciiCount + 1) / (codes.length + 1);
    return ratio > 0.7 || codes.length < 20 ? "en" : "ja";
  }

  function removeLinebreaks(text) {
    text = text
      .replace(/\n/g, " ")
      .replace(/[\s]+/g, " ")
      .replace(/-\s/g, "-");
    if (guessLang(text) === "ja") {
      text = text
        .replace(/\s/g, "")
        .replace(/,/g, "、")
        .replace(/，/g, "、")
        .replace(/\./g, "。")
        .replace(/．/g, "。");
    }
    return text;
  }

  var mojiCount = document.getElementById("moji_count");
  if (mojiCount) {
    mojiCount.addEventListener("blur", function () {
      this.value = removeLinebreaks(this.value);

      var len = this.value.length;
      document.getElementById("wcharCount").textContent =
        (len || 0) + "文字";

      var words = this.value.split(/[\s,]+/);
      var wordLen = words.length;
      if (wordLen > 0 && words[wordLen - 1].length === 0) wordLen--;
      document.getElementById("wordCount").textContent =
        (wordLen || 0) + "単語";
    });
  }

  // ============================================
  // 西暦・和暦変換
  // ============================================
  var seirekiInput = document.getElementById("seireki");
  if (seirekiInput) {
    seirekiInput.addEventListener("input", function () {
      var seireki = parseInt(this.value);
      var warekiText = "";
      var wareki = ["", "令和", "平成", "昭和", "大正", "明治"];
      var start = [2100, 2019, 1989, 1926, 1912, 1868];
      for (var i = 0; i < wareki.length; i++) {
        if (seireki >= start[i] && seireki <= start[i - 1]) {
          warekiText +=
            wareki[i] +
            (seireki === start[i] ? "元" : seireki - start[i] + 1) +
            "年 ";
        }
      }
      document.getElementById("wareki").textContent = warekiText;
    });
  }

  // ============================================
  // arXiv URL 変換
  // ============================================
  var arxivInput = document.getElementById("arxivurl");
  if (arxivInput) {
    arxivInput.addEventListener("blur", function () {
      var url = this.value;
      var match = url.match(/\/(\d+\.\d+)/);
      if (!match) return;
      var arxivid = match[1];
      var arxivabs = "https://arxiv.org/abs/" + arxivid;
      var arxivpdf = "https://arxiv.org/pdf/" + arxivid + ".pdf";

      var absEl = document.getElementById("arxivabs");
      absEl.textContent = "";
      var link = document.createElement("a");
      link.href = arxivabs;
      link.textContent = arxivabs;
      absEl.appendChild(link);

      document.getElementById("arxivpdf").textContent = arxivpdf;

      navigator.clipboard.writeText(arxivabs).catch(function (err) {
        console.error("Copy failed:", err);
      });
    });
  }

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
  // MIDI to Frequency
  // ============================================
  var midi2freqInput = document.getElementById("midi2freq");
  if (midi2freqInput) {
    midi2freqInput.addEventListener("input", function () {
      var midi = parseInt(this.value);
      var notenames = [
        "C",
        "Cis",
        "D",
        "Dis",
        "E",
        "F",
        "Fis",
        "G",
        "Gis",
        "A",
        "Ais",
        "B",
      ];
      var freq = 440 * Math.pow(2, (midi - 69) / 12);
      var text =
        notenames[midi % 12] + (Math.floor(midi / 12) - 1) + ", " + freq + "Hz";
      document.getElementById("notefreq").textContent = text;
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

  function updateCost() {
    var costUsd = parseFloat(costInput ? costInput.value : 0);
    var rate = parseFloat(rateInput ? rateInput.value : 150);
    if (costUsd && rate) {
      var monthly = costUsd * 24 * 31 * rate;
      document.getElementById("hourly_cost_2_monthly").textContent =
        Math.round(monthly) + " 円/月";
    }
  }

  if (costInput) costInput.addEventListener("input", updateCost);
  if (rateInput) rateInput.addEventListener("input", updateCost);

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

  // ============================================
  // JST to World Time (duplicate removed)
  // ============================================
  var jstInput = document.getElementById("jst_to_worldtime");
  if (jstInput) {
    jstInput.addEventListener("input", function () {
      var jst = parseInt(this.value);
      var utc = ((jst - 9 + 24) % 24);
      var cet = ((utc + 1 + 24) % 24);
      var cetSummer = ((utc + 2 + 24) % 24);
      var east = ((utc - 5 + 24) % 24);
      var eastSummer = ((utc - 4 + 24) % 24);
      var west = ((utc - 8 + 24) % 24);
      var westSummer = ((utc - 7 + 24) % 24);
      var hawaii = ((utc - 10 + 24) % 24);
      var output =
        "<table>" +
        "<tr><td>中央ヨーロッパ（夏時間）</td><td>" + cetSummer + "時</td></tr>" +
        "<tr><td>中央ヨーロッパ</td><td>" + cet + "時</td></tr>" +
        "<tr><td>世界標準時</td><td>" + utc + "時</td></tr>" +
        "<tr><td>アメリカ東海岸（夏時間）</td><td>" + eastSummer + "時</td></tr>" +
        "<tr><td>アメリカ東海岸</td><td>" + east + "時</td></tr>" +
        "<tr><td>アメリカ西海岸（夏時間）</td><td>" + westSummer + "時</td></tr>" +
        "<tr><td>アメリカ西海岸</td><td>" + west + "時</td></tr>" +
        "<tr><td>ハワイ</td><td>" + hawaii + "時</td></tr>" +
        "</table>";
      document.getElementById("timelist").innerHTML = output;
    });
  }

  // ============================================
  // Countdown timer
  // ============================================
  function getDiffYearDays(endStr) {
    var now = new Date();
    var end = new Date(endStr);
    var yearDiff = end.getFullYear() - now.getFullYear();
    end.setFullYear(now.getFullYear());
    var daysDiff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    var tmp = daysDiff + yearDiff * 365;
    yearDiff = Math.floor(tmp / 365);
    daysDiff = tmp % 365;
    return (yearDiff !== 0 ? yearDiff + "年 " : "") + daysDiff + "日";
  }

  function getRaigetsu() {
    var now = new Date();
    return (now.getMonth() + 2) + "/1/" + now.getFullYear();
  }

  function getNenmatsu() {
    var now = new Date();
    return "12/31/" + now.getFullYear();
  }

  function getNendomatsu() {
    var now = new Date();
    var year = now.getFullYear();
    var endOfFY = new Date(year, 2, 31);
    if (now > endOfFY) {
      year += 1;
    }
    return "3/31/" + year;
  }

  function countDown() {
    var output =
      "<table>" +
      "<tr><td>来月1日まで</td><td>" + getDiffYearDays(getRaigetsu()) + "</td></tr>" +
      "<tr><td>大晦日まで</td><td>" + getDiffYearDays(getNenmatsu()) + "</td></tr>" +
      "<tr><td>年度末まで</td><td>" + getDiffYearDays(getNendomatsu()) + "</td></tr>" +
      "<tr><td>2035年9月21日（皆既日食）まで</td><td>" + getDiffYearDays("9/21/2035") + "</td></tr>" +
      "<tr><td>2038年1月19日（32bit time_tがオーバーフロー）まで</td><td>" + getDiffYearDays("1/19/2038") + "</td></tr>" +
      "<tr><td>2041年10月25日（金環食）まで</td><td>" + getDiffYearDays("10/25/2041") + "</td></tr>" +
      "<tr><td>2061年7月28日（ハレー彗星地球接近）まで</td><td>" + getDiffYearDays("7/28/2061") + "</td></tr>" +
      "</table>";
    var el = document.getElementById("TimeLeft");
    if (el) el.innerHTML = output;
    setTimeout(countDown, 1000);
  }

  countDown();

  // ============================================
  // ひらがな・カタカナ変換
  // ============================================
  function hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
  }

  function katakanaToHiragana(str) {
    return str.replace(/[\u30A1-\u30F6]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
  }

  var kanaInput = document.getElementById("kana_input");
  if (kanaInput) {
    kanaInput.addEventListener("input", function () {
      var input = this.value;
      document.getElementById("kana_to_katakana").textContent =
        hiraganaToKatakana(input);
      document.getElementById("kana_to_hiragana").textContent =
        katakanaToHiragana(input);
    });
  }

  // ============================================
  // Last Update
  // ============================================
  var lastUpdateEl = document.getElementById("lastUpdate");
  if (lastUpdateEl) {
    lastUpdateEl.textContent = "Last Update: " + document.lastModified;
  }
});

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
    mojiCount.addEventListener("input", function () {
      var text = this.value;

      var len = text.length;
      document.getElementById("wcharCount").textContent =
        (len || 0) + "文字";

      var words = text.split(/[\s,]+/);
      var wordLen = words.length;
      if (wordLen > 0 && words[wordLen - 1].length === 0) wordLen--;
      document.getElementById("wordCount").textContent =
        (wordLen || 0) + "単語";
    });

    mojiCount.addEventListener("blur", function () {
      this.value = removeLinebreaks(this.value);
      mojiCount.dispatchEvent(new Event("input"));
    });
  }

  // ============================================
  // 西暦・和暦変換（大化[645]〜令和）
  // ============================================
  // [startYear, "name"] or [startYear, "name", endYear]
  // endYear is used for gap periods and Nanbokucho overlapping eras
  // Array is ordered newest-first
  var eraTable = [
    // 近現代
    [2019, "令和"], [1989, "平成"], [1926, "昭和"], [1912, "大正"], [1868, "明治"],
    // 江戸
    [1865, "慶応"], [1864, "元治"], [1861, "文久"], [1860, "万延"],
    [1854, "安政"], [1848, "嘉永"], [1844, "弘化"], [1830, "天保"],
    [1818, "文政"], [1804, "文化"], [1801, "享和"], [1789, "寛政"],
    [1781, "天明"], [1772, "安永"], [1764, "明和"], [1751, "宝暦"],
    [1748, "寛延"], [1744, "延享"], [1741, "寛保"], [1736, "元文"],
    [1716, "享保"], [1711, "正徳"], [1704, "宝永"], [1688, "元禄"],
    [1684, "貞享"], [1681, "天和"], [1673, "延宝"], [1661, "寛文"],
    [1658, "万治"], [1655, "明暦"], [1652, "承応"], [1648, "慶安"],
    [1644, "正保"], [1624, "寛永"], [1615, "元和"], [1596, "慶長"],
    // 安土桃山・戦国
    [1592, "文禄"], [1573, "天正"], [1570, "元亀"],
    [1558, "永禄"], [1555, "弘治"], [1532, "天文"],
    [1528, "享禄"], [1521, "大永"], [1504, "永正"],
    [1501, "文亀"], [1492, "明応"], [1489, "延徳"],
    [1487, "長享"], [1469, "文明"], [1467, "応仁"],
    [1466, "文正"], [1461, "寛正"], [1457, "長禄"],
    [1455, "康正"], [1452, "享徳"], [1449, "宝徳"],
    [1444, "文安"], [1441, "嘉吉"], [1429, "永享"],
    [1428, "正長"],
    // 室町
    [1394, "応永"], [1390, "明徳"],
    // 南北朝（北朝）
    [1389, "康応", 1390], [1387, "嘉慶", 1389],
    [1384, "至徳", 1387], [1381, "永徳", 1384],
    [1379, "康暦", 1381], [1375, "永和", 1379],
    [1368, "応安", 1375], [1362, "貞治", 1368],
    [1361, "康安", 1362], [1356, "延文", 1361],
    [1352, "文和", 1356], [1350, "観応", 1352],
    [1345, "貞和", 1350], [1342, "康永", 1345],
    [1338, "暦応", 1342], [1332, "正慶", 1333],
    // 南北朝（南朝）
    [1384, "元中", 1392], [1381, "弘和", 1384],
    [1375, "天授", 1381], [1372, "文中", 1375],
    [1370, "建徳", 1372], [1346, "正平", 1370],
    [1340, "興国", 1346], [1336, "延元", 1340],
    // 建武・鎌倉
    [1334, "建武"], [1331, "元弘"],
    [1329, "元徳"], [1326, "嘉暦"], [1324, "正中"],
    [1321, "元亨"], [1319, "元応"], [1317, "文保"],
    [1312, "正和"], [1311, "応長"], [1308, "延慶"],
    [1307, "徳治"], [1303, "嘉元"], [1302, "乾元"],
    [1299, "正安"], [1293, "永仁"], [1288, "正応"],
    [1278, "弘安"], [1275, "建治"], [1264, "文永"],
    [1261, "弘長"], [1260, "文応"], [1259, "正元"],
    [1257, "正嘉"], [1256, "康元"], [1249, "建長"],
    [1247, "宝治"], [1243, "寛元"], [1240, "仁治"],
    [1239, "延応"], [1238, "暦仁"], [1235, "嘉禎"],
    [1234, "文暦"], [1233, "天福"], [1232, "貞永"],
    [1229, "寛喜"], [1228, "安貞"], [1225, "嘉禄"],
    [1224, "元仁"], [1222, "貞応"], [1219, "承久"],
    [1214, "建保"], [1211, "建暦"], [1207, "承元"],
    [1206, "建永"], [1204, "元久"], [1201, "建仁"],
    [1199, "正治"],
    // 平安
    [1190, "建久"], [1185, "文治"], [1184, "元暦"],
    [1182, "寿永"], [1181, "養和"], [1177, "治承"],
    [1175, "安元"], [1171, "承安"], [1169, "嘉応"],
    [1166, "仁安"], [1165, "永万"], [1163, "長寛"],
    [1161, "応保"], [1160, "永暦"], [1159, "平治"],
    [1156, "保元"], [1154, "久寿"], [1151, "仁平"],
    [1145, "久安"], [1144, "天養"], [1142, "康治"],
    [1141, "永治"], [1135, "保延"], [1132, "長承"],
    [1131, "天承"], [1126, "大治"], [1124, "天治"],
    [1120, "保安"], [1118, "元永"], [1113, "永久"],
    [1110, "天永"], [1108, "天仁"], [1106, "嘉承"],
    [1104, "長治"], [1099, "康和"], [1097, "承徳"],
    [1096, "永長"], [1094, "嘉保"], [1087, "寛治"],
    [1084, "応徳"], [1081, "永保"], [1077, "承暦"],
    [1074, "承保"], [1069, "延久"], [1065, "治暦"],
    [1058, "康平"], [1053, "天喜"], [1046, "永承"],
    [1044, "寛徳"], [1040, "長久"], [1037, "長暦"],
    [1028, "長元"], [1024, "万寿"], [1021, "治安"],
    [1017, "寛仁"], [1013, "長和"], [1004, "寛弘"],
    [999, "長保"], [995, "長徳"], [990, "正暦"],
    [989, "永祚"], [987, "永延"], [985, "寛和"],
    [983, "永観"], [978, "天元"], [976, "貞元"],
    [974, "天延"], [970, "天禄"], [968, "安和"],
    [964, "康保"], [961, "応和"], [957, "天徳"],
    [947, "天暦"], [938, "天慶"], [931, "承平"],
    [923, "延長"], [901, "延喜"], [898, "昌泰"],
    [889, "寛平"], [885, "仁和"], [877, "元慶"],
    [859, "貞観"], [857, "天安"], [854, "斉衡"],
    [851, "仁寿"], [848, "嘉祥"], [834, "承和"],
    [824, "天長"], [810, "弘仁"], [806, "大同"],
    // 奈良
    [782, "延暦"], [781, "天応"], [770, "宝亀"],
    [767, "神護景雲"], [765, "天平神護"], [757, "天平宝字"],
    [749, "天平勝宝"], [749, "天平感宝"],
    [729, "天平"], [724, "神亀"], [717, "養老"], [715, "霊亀"],
    // 飛鳥
    [708, "和銅"], [704, "慶雲"], [701, "大宝"],
    [686, "朱鳥", 686],
    [650, "白雉", 654],
    [645, "大化"],
  ];

  var seirekiInput = document.getElementById("seireki");
  if (seirekiInput) {
    seirekiInput.addEventListener("input", function () {
      var seireki = parseInt(this.value);
      var warekiText = "";
      for (var i = 0; i < eraTable.length; i++) {
        var eraStart = eraTable[i][0];
        var eraEnd = eraTable[i][2] || (i === 0 ? 2100 : eraTable[i - 1][0]);
        if (seireki >= eraStart && seireki <= eraEnd) {
          warekiText +=
            eraTable[i][1] +
            (seireki === eraStart ? "元" : seireki - eraStart + 1) +
            "年 ";
        }
      }
      document.getElementById("wareki").textContent = warekiText || "（該当なし）";
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
  // JST to World Time (analog clocks, DST-aware)
  // ============================================
  var timezones = [
    { label: "AOE", tz: "Etc/GMT+12" },
    { label: "Honolulu", tz: "Pacific/Honolulu" },
    { label: "Los Angeles", tz: "America/Los_Angeles" },
    { label: "New York", tz: "America/New_York" },
    { label: "London", tz: "Europe/London" },
    { label: "Paris", tz: "Europe/Paris" },
    { label: "Helsinki", tz: "Europe/Helsinki" },
    { label: "Dubai", tz: "Asia/Dubai" },
    { label: "Singapore", tz: "Asia/Singapore" },
    { label: "Tokyo", tz: "Asia/Tokyo" },
  ];

  function getLocalTime(date, tzName) {
    var s = date.toLocaleString("en-US", {
      timeZone: tzName,
      hour: "numeric", minute: "numeric", hour12: false,
    });
    var parts = s.split(":");
    var h = parseInt(parts[0]) % 24;
    var m = parseInt(parts[1]);
    return { hour: h, min: m };
  }

  function getTimeClass(hour) {
    if (hour >= 7 && hour < 18) return "daytime";
    if ((hour >= 18 && hour < 20) || (hour >= 5 && hour < 7)) return "twilight";
    return "night";
  }

  function buildClockSVG(hour24, min) {
    var h12 = hour24 % 12;
    var hourAngle = (h12 + min / 60) * 30;
    var minAngle = min * 6;
    var isNight = getTimeClass(hour24) === "night";
    var isTwilight = getTimeClass(hour24) === "twilight";
    var faceFill = isNight ? "#1e272e" : isTwilight ? "#4a6fa5" : "#f8f9fa";
    var handColor = isNight ? "#f5f6fa" : "#2d3436";
    var tickColor = isNight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)";
    var borderColor = isNight ? "#485460" : "#dee2e6";
    var ticks = "";
    for (var i = 0; i < 12; i++) {
      var a = i * 30;
      var isMain = (i % 3 === 0);
      var r1 = isMain ? 36 : 38;
      var r2 = 42;
      var rad = a * Math.PI / 180;
      ticks +=
        '<line x1="' + (50 + r1 * Math.sin(rad)) +
        '" y1="' + (50 - r1 * Math.cos(rad)) +
        '" x2="' + (50 + r2 * Math.sin(rad)) +
        '" y2="' + (50 - r2 * Math.cos(rad)) +
        '" stroke="' + tickColor +
        '" stroke-width="' + (isMain ? "2" : "1") + '"/>';
    }
    return (
      '<svg viewBox="0 0 100 100" class="clock-svg">' +
      '<circle cx="50" cy="50" r="46" fill="' + faceFill + '" stroke="' + borderColor + '" stroke-width="1.5"/>' +
      ticks +
      '<line x1="50" y1="50" x2="' + (50 + 26 * Math.sin(hourAngle * Math.PI / 180)) +
      '" y2="' + (50 - 26 * Math.cos(hourAngle * Math.PI / 180)) +
      '" stroke="' + handColor + '" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="50" y1="50" x2="' + (50 + 36 * Math.sin(minAngle * Math.PI / 180)) +
      '" y2="' + (50 - 36 * Math.cos(minAngle * Math.PI / 180)) +
      '" stroke="' + handColor + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="50" cy="50" r="2.5" fill="' + handColor + '"/>' +
      "</svg>"
    );
  }

  function renderWorldClock(date) {
    var container = document.getElementById("timelist");
    if (!container) return;
    var html = "";
    for (var i = 0; i < timezones.length; i++) {
      var tz = timezones[i];
      var t = getLocalTime(date, tz.tz);
      var cls = getTimeClass(t.hour);
      var timeStr = ("0" + t.hour).slice(-2) + ":" + ("0" + t.min).slice(-2);
      html +=
        '<div class="clock-card ' + cls + '">' +
        buildClockSVG(t.hour, t.min) +
        '<div class="clock-time">' + timeStr + "</div>" +
        '<div class="clock-label">' + tz.label + "</div>" +
        "</div>";
    }
    container.innerHTML = html;
  }

  function updateClockFromNow() {
    renderWorldClock(new Date());
  }

  if (document.getElementById("timelist")) {
    updateClockFromNow();
    setInterval(updateClockFromNow, 1000);
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

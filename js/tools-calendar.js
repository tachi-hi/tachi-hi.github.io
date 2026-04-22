// 世界時計、カレンダー、カウントダウン、和暦対照表
document.addEventListener("DOMContentLoaded", function () {

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
      hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
    });
    var parts = s.split(":");
    var h = parseInt(parts[0]) % 24;
    var m = parseInt(parts[1]);
    var sec = parseInt(parts[2]);
    return { hour: h, min: m, sec: sec };
  }

  function getTimeClass(hour) {
    if (hour >= 7 && hour < 18) return "daytime";
    if ((hour >= 18 && hour < 20) || (hour >= 5 && hour < 7)) return "twilight";
    return "night";
  }

  function buildClockSVG(hour24, min, sec) {
    var h12 = hour24 % 12;
    var hourAngle = (h12 + min / 60) * 30;
    var minAngle = (min + sec / 60) * 6;
    var secAngle = sec * 6;
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
    var secRad = secAngle * Math.PI / 180;
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
      '<line x1="' + (50 - 8 * Math.sin(secRad)) + '" y1="' + (50 + 8 * Math.cos(secRad)) +
      '" x2="' + (50 + 38 * Math.sin(secRad)) +
      '" y2="' + (50 - 38 * Math.cos(secRad)) +
      '" stroke="#e74c3c" stroke-width="0.8"/>' +
      '<circle cx="50" cy="50" r="2.5" fill="' + handColor + '"/>' +
      '<circle cx="50" cy="50" r="1.2" fill="#e74c3c"/>' +
      "</svg>"
    );
  }

  function getLocalDateStr(date, tzName) {
    return date.toLocaleDateString("en-US", {
      timeZone: tzName,
      weekday: "short", month: "short", day: "numeric",
    });
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
      var dateStr = getLocalDateStr(date, tz.tz);
      html +=
        '<div class="clock-card ' + cls + '">' +
        '<div class="clock-date">' + dateStr + "</div>" +
        buildClockSVG(t.hour, t.min, t.sec) +
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
  // Yearly Calendar (with Japanese holidays)
  // ============================================
  function buildYearBlockHtml(year, holidayMap, todayKey, extraClass) {
    var dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    var monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    // 和暦を求める（eraTable の先頭が最新の元号）
    var warekiLabel = "";
    if (typeof eraTable !== "undefined" && eraTable.length > 0 && year >= eraTable[0][0]) {
      var nen = year - eraTable[0][0] + 1;
      warekiLabel = eraTable[0][1] + (nen === 1 ? "元" : nen) + "年";
    }
    // 十二支
    var junishi = "子丑寅卯辰巳午未申酉戌亥";
    var etoLabel = junishi[(year - 4) % 12];
    var sub = [warekiLabel, etoLabel].filter(Boolean).join("・");
    var html = '<div class="cal-year-block ' + (extraClass || "") + '">';
    html += '<div class="cal-year-title">' + year + "年" + (sub ? "（" + sub + "）" : "") + '</div><div class="cal-grid">';
    for (var m = 0; m < 12; m++) {
      html += '<div class="cal-month">';
      html += '<div class="cal-month-name">' + monthNames[m] + '</div>';
      html += '<table class="cal-table"><thead><tr>';
      for (var d = 0; d < 7; d++) {
        html += '<th>' + dayLabels[d] + '</th>';
      }
      html += '</tr></thead><tbody>';
      var first = new Date(year, m, 1);
      var startDay = first.getDay();
      var daysInMonth = new Date(year, m + 1, 0).getDate();
      var day = 1;
      for (var row = 0; row < 6; row++) {
        if (day > daysInMonth) break;
        html += '<tr>';
        for (var col = 0; col < 7; col++) {
          if ((row === 0 && col < startDay) || day > daysInMonth) {
            html += '<td></td>';
          } else {
            var key = year + "-" + (m + 1) + "-" + day;
            var cls = "";
            var title = "";
            if (key === todayKey) cls = " cal-today";
            if (holidayMap[key]) {
              cls += " cal-holiday";
              title = ' data-holiday="' + holidayMap[key] + '"';
            }
            if (col === 0) cls += " cal-sun";
            if (col === 6) cls += " cal-sat";
            html += '<td class="' + cls.trim() + '"' + title + '><span>' + day + '</span></td>';
            day++;
          }
        }
        html += '</tr>';
      }
      html += '</tbody></table></div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderYearlyCalendar(holidaysByYear) {
    var container = document.getElementById("yearly-calendar");
    if (!container) return;
    var now = new Date();
    var year = now.getFullYear();
    var todayKey = year + "-" + (now.getMonth() + 1) + "-" + now.getDate();

    var holidayMap = {};
    if (holidaysByYear) {
      Object.keys(holidaysByYear).forEach(function (y) {
        var hs = holidaysByYear[y];
        if (!hs) return;
        Object.keys(hs).forEach(function (key) {
          var parts = key.split("-");
          var normalized = parseInt(parts[0]) + "-" + parseInt(parts[1]) + "-" + parseInt(parts[2]);
          holidayMap[normalized] = hs[key];
        });
      });
    }

    var html = buildYearBlockHtml(year, holidayMap, todayKey, "cal-year-current");
    html += buildYearBlockHtml(year + 1, holidayMap, todayKey, "cal-year-next");
    container.innerHTML = html;
  }

  if (document.getElementById("yearly-calendar")) {
    var now = new Date();
    var year = now.getFullYear();
    // まず祝日なしで描画
    renderYearlyCalendar(null);
    // 今年と来年の祝日を並行取得
    var years = [year, year + 1];
    var results = {};
    Promise.all(years.map(function (y) {
      return fetch("https://holidays-jp.github.io/api/v1/" + y + "/date.json")
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (h) { results[y] = h; })
        .catch(function () { results[y] = null; });
    })).then(function () {
      renderYearlyCalendar(results);
    });
  }

  // ============================================
  // Countdown bar (below calendar)
  // ============================================
  function daysUntil(target) {
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function renderCountdownBar() {
    var bar = document.getElementById("countdown-bar");
    if (!bar) return;
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();

    // 月末
    var endOfMonth = new Date(year, month + 1, 0);
    var daysMonth = daysUntil(endOfMonth);

    // 年末
    var endOfYear = new Date(year, 11, 31);
    var daysYear = daysUntil(endOfYear);

    // 年度末 (3/31)
    var fyYear = (month >= 3) ? year + 1 : year;
    var endOfFY = new Date(fyYear, 2, 31);
    var daysFY = daysUntil(endOfFY);

    var items = [
      { label: "月末まで", days: daysMonth },
      { label: "年度末まで", days: daysFY },
      { label: "年末まで", days: daysYear },
    ];

    var html = "";
    for (var i = 0; i < items.length; i++) {
      html += '<div class="countdown-item">' +
        '<div class="countdown-days">' + items[i].days + '</div>' +
        '<div class="countdown-unit">日</div>' +
        '<div class="countdown-label">' + items[i].label + '</div>' +
        '</div>';
    }
    bar.innerHTML = html;
  }

  renderCountdownBar();

  // ============================================
  // 西暦・和暦対照表 (1970–2049)
  // ============================================
  (function () {
    var container = document.getElementById("wareki-table");
    if (!container) return;
    var startYear = 1970;
    var endYear = 2049;
    var thisYear = new Date().getFullYear();
    // 近現代の元号（開始年, 名前, カラー）
    var eras = [
      { start: 1926, name: "昭和", abbr: "S", color: "#6c5ce7" },
      { start: 1989, name: "平成", abbr: "H", color: "#00b894" },
      { start: 2019, name: "令和", abbr: "R", color: "#e17055" }
    ];
    // 元号内の10年代ごとに濃淡を変える
    function eraRgba(era, y) {
      var n = y - era.start + 1;
      var decade = Math.floor(n / 10);
      var alpha = 0.08 + (decade % 4) * 0.10;
      var hex = era.color;
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      return "rgba(" + r + "," + g + "," + b + "," + alpha.toFixed(2) + ")";
    }
    function getEra(y) {
      for (var i = eras.length - 1; i >= 0; i--) {
        if (y >= eras[i].start) return eras[i];
      }
      return null;
    }
    function warekiNen(y, era) {
      var n = y - era.start + 1;
      return era.abbr + (n === 1 ? "元" : n);
    }
    // 10年ごとにグループ化
    var html = '<div class="wareki-chart">';
    for (var decade = startYear; decade <= endYear; decade += 10) {
      var last = Math.min(decade + 9, endYear);
      html += '<table class="wareki-decade"><tbody>';
      // 上段：西暦
      html += '<tr class="wareki-row-seireki">';
      for (var y = decade; y <= last; y++) {
        var era = getEra(y);
        var isCurrent = (y === thisYear);
        var style = "";
        if (era) style += "border-bottom:2px solid " + era.color + ";";
        if (isCurrent) style += "background:#0984e3;color:#fff;font-weight:700;";
        html += '<td style="' + style + '">' + y + '</td>';
      }
      html += '</tr>';
      // 下段：和暦
      html += '<tr class="wareki-row-wareki">';
      for (var y = decade; y <= last; y++) {
        var era = getEra(y);
        var isCurrent = (y === thisYear);
        var style = "";
        var label = "";
        if (era) {
          style += "background:" + eraRgba(era, y) + ";color:" + era.color + ";";
          label = warekiNen(y, era);
        }
        if (isCurrent) style += "font-weight:700;";
        html += '<td style="' + style + '">' + label + '</td>';
      }
      html += '</tr>';
      html += '</tbody></table>';
    }
    // 凡例
    html += '<div class="wareki-legend">';
    for (var i = 0; i < eras.length; i++) {
      html += '<span class="wareki-legend-item">' +
        '<span class="wareki-legend-dot" style="background:' + eras[i].color + '"></span>' +
        eras[i].name + '</span>';
    }
    html += '</div></div>';
    container.innerHTML = html;
  })();
});

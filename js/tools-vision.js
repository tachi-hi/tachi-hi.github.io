/*
 * tools-vision.js
 * 視野セルフチェック（簡易）
 * - 中央の赤い点を囲むように、同心円上に点を並べて表示する
 * - 片目で中央を見つめ、消えて見える点がないかを確かめる
 * - 「全画面」ボタンで全画面表示。全画面中は図をクリックするか Esc で戻る
 * 医療用の検査ではない。
 */
document.addEventListener("DOMContentLoaded", function () {
  var stage = document.getElementById("vf-stage");
  if (!stage) return;

  var canvas = document.getElementById("vf-canvas");
  var fullBtn = document.getElementById("vf-full");

  var RING_COUNT = 10;  // 同心円の数
  var MARGIN = 12;      // 画面端からこの距離より外の点は描かない

  // 同心円状に点を配置する。盲点（耳側約15°）まで届くよう横幅いっぱいに広げ、
  // 上下ではみ出した点は省く。点の間隔は円の間隔とほぼ同じにそろえる
  function layout(w, h) {
    var maxR = Math.min(w * 0.47, h * 0.8);
    var gap = maxR / RING_COUNT;
    var list = [];
    for (var r = 1; r <= RING_COUNT; r++) {
      var radius = gap * r;
      var n = Math.max(6, Math.round(2 * Math.PI * radius / gap));
      var offset = r % 2 ? Math.PI / n : 0;  // 隣の円と半ステップずらす
      for (var k = 0; k < n; k++) {
        var a = offset + 2 * Math.PI * k / n;
        var x = w / 2 + radius * Math.cos(a), y = h / 2 + radius * Math.sin(a);
        if (x < MARGIN || x > w - MARGIN || y < MARGIN || y > h - MARGIN) continue;
        list.push({ x: x, y: y });
      }
    }
    return list;
  }

  function draw() {
    var w = stage.clientWidth, h = stage.clientHeight;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var c = canvas.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    c.fillStyle = "#111";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#bbb";
    layout(w, h).forEach(function (d) {
      c.beginPath();
      c.arc(d.x, d.y, 4, 0, Math.PI * 2);
      c.fill();
    });
    c.fillStyle = "#e74c3c";
    c.beginPath();
    c.arc(w / 2, h / 2, 5, 0, Math.PI * 2);
    c.fill();
  }

  fullBtn.addEventListener("click", function () {
    if (stage.requestFullscreen) stage.requestFullscreen();
  });

  canvas.addEventListener("click", function () {
    if (document.fullscreenElement) document.exitFullscreen();
  });

  document.addEventListener("fullscreenchange", function () { setTimeout(draw, 100); });
  window.addEventListener("resize", draw);

  draw();
});

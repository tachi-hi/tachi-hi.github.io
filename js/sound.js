// Piano sound synthesis using Web Audio API
var PianoSound = (function () {
  var enabled = false;
  var audioCtx = null;
  var activeNodes = [];

  function play(midi, duration) {
    if (!enabled) return;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Stop previous notes
    for (var i = 0; i < activeNodes.length; i++) {
      try { activeNodes[i].stop(); } catch (e) {}
    }
    activeNodes = [];

    var freq = 440 * Math.pow(2, (midi - 69) / 12);
    var dur = duration || 1.2;
    var now = audioCtx.currentTime;
    // Additive synthesis: fundamental + harmonics with piano-like decay
    var partials = [
      { n: 1, amp: 0.4,  decay: dur },
      { n: 2, amp: 0.15, decay: dur * 0.7 },
      { n: 3, amp: 0.08, decay: dur * 0.5 },
      { n: 4, amp: 0.05, decay: dur * 0.35 },
      { n: 5, amp: 0.03, decay: dur * 0.25 },
      { n: 6, amp: 0.02, decay: dur * 0.2 },
    ];
    var master = audioCtx.createGain();
    master.gain.value = 0.5;
    master.connect(audioCtx.destination);

    for (var i = 0; i < partials.length; i++) {
      var p = partials[i];
      var pFreq = freq * p.n;
      if (pFreq > 20000) break;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = pFreq;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(p.amp, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + p.decay);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + p.decay);
      activeNodes.push(osc);
    }
  }

  function setEnabled(val) { enabled = val; }
  function isEnabled() { return enabled; }

  return { play: play, setEnabled: setEnabled, isEnabled: isEnabled };
})();

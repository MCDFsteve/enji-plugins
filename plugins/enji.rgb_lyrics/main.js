// RGB 桌面歌词: drives transient in-memory desktop lyric colors smoothly via
// Enji's dedicated `desktopLyrics.setColor` + `frame` animation API without
// touching persisted user settings or triggering full UI state snapshots.
(function () {
  if (!enji.supports('desktopLyrics.color') || !enji.supports('animation.frame')) {
    ui.toast('当前 Enji 版本暂不支持 RGB 桌面歌词高性能接口，请升级 Enji');
    return;
  }

  var CYBER = [0x00f5ff, 0x4d7cff, 0xd946ef, 0xff2e93, 0x7c3aed];
  var AURORA = [0x00f5a0, 0x00d9f5, 0xa855f7, 0xff5e7e, 0xffc857];

  var mode = '彩虹循环';
  var speed = 1.0;
  var saturation = 0.85;
  var secondaryColor = true;
  var pauseFreeze = false;

  var phase = 0.0;
  var androidAccum = 0.0;
  var lastPrimary = -1;
  var lastSecondary = -2;
  var lastVisible = false;
  var throttle = enji.platform === 'android' ? 0.05 : 0.0;

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function readSettings() {
    var m = settings.get('mode');
    if (typeof m === 'string' && m) mode = m;
    var sp = settings.get('speed');
    if (typeof sp === 'number' && Number.isFinite(sp)) speed = clamp(sp, 0.2, 3.0);
    var sat = settings.get('saturation');
    if (typeof sat === 'number' && Number.isFinite(sat)) saturation = clamp(sat / 100.0, 0.2, 1.0);
    var sec = settings.get('secondary_color');
    if (typeof sec === 'boolean') secondaryColor = sec;
    var pf = settings.get('pause_freeze');
    if (typeof pf === 'boolean') pauseFreeze = pf;
  }

  function packRgb(r, g, b) {
    var ri = clamp(Math.round(r), 0, 255);
    var gi = clamp(Math.round(g), 0, 255);
    var bi = clamp(Math.round(b), 0, 255);
    return (ri << 16) | (gi << 8) | bi;
  }

  function hsvToRgb(h, s, v) {
    var wrapped = ((h % 1.0) + 1.0) % 1.0;
    var scaled = wrapped * 6.0;
    var sector = Math.floor(scaled);
    var frac = scaled - sector;
    var p = v * (1.0 - s);
    var q = v * (1.0 - frac * s);
    var t = v * (1.0 - (1.0 - frac) * s);
    var r = v, g = t, b = p;
    if (sector === 1) { r = q; g = v; b = p; }
    else if (sector === 2) { r = p; g = v; b = t; }
    else if (sector === 3) { r = p; g = q; b = v; }
    else if (sector === 4) { r = t; g = p; b = v; }
    else if (sector === 5) { r = v; g = p; b = q; }
    return packRgb(r * 255.0, g * 255.0, b * 255.0);
  }

  function sampleStops(stops, t, sat) {
    var wrapped = ((t % 1.0) + 1.0) % 1.0;
    var pos = wrapped * stops.length;
    var i0 = Math.floor(pos) % stops.length;
    var i1 = (i0 + 1) % stops.length;
    var f = pos - Math.floor(pos);
    // Smoothstep easing between palette stops.
    f = f * f * (3.0 - 2.0 * f);
    var c0 = stops[i0];
    var c1 = stops[i1];
    var r = ((c0 >> 16) & 255) * (1.0 - f) + ((c1 >> 16) & 255) * f;
    var g = ((c0 >> 8) & 255) * (1.0 - f) + ((c1 >> 8) & 255) * f;
    var b = (c0 & 255) * (1.0 - f) + (c1 & 255) * f;
    // Blend toward white according to saturation slider so legibility stays high.
    r = 255.0 - (255.0 - r) * sat;
    g = 255.0 - (255.0 - g) * sat;
    b = 255.0 - (255.0 - b) * sat;
    return packRgb(r, g, b);
  }

  function sample(t) {
    if (mode === '赛博霓虹') return sampleStops(CYBER, t, saturation);
    if (mode === '柔和粉彩') return hsvToRgb(t, saturation * 0.52, 1.0);
    if (mode === '烈焰极光') return sampleStops(AURORA, t, saturation);
    return hsvToRgb(t, saturation, 1.0);
  }

  function secondaryOffset() {
    if (mode === '赛博霓虹') return 0.22;
    if (mode === '烈焰极光') return 0.20;
    if (mode === '柔和粉彩') return 0.14;
    return 1.0 / 6.0;
  }

  function apply(force) {
    var primary = sample(phase);
    var secondary = secondaryColor ? sample(phase + secondaryOffset()) : null;
    if (!force && primary === lastPrimary && secondary === lastSecondary) return;
    lastPrimary = primary;
    lastSecondary = secondary;
    desktopLyrics.setColor(primary, secondary);
  }

  readSettings();
  if (desktopLyrics.visible) apply(true);

  enji.on('settingChanged', function () {
    readSettings();
    if (lastVisible || desktopLyrics.visible) apply(true);
  });

  enji.on('frame', function (frame) {
    lastVisible = !!(frame && frame.desktopLyrics);
    if (!lastVisible) return;
    var dt = typeof frame.dt === 'number' && Number.isFinite(frame.dt) ? frame.dt : 0.025;
    if (pauseFreeze && !frame.playing) {
      if (lastPrimary === -1) apply(true);
      return;
    }
    phase = (phase + dt * speed * 0.16) % 1.0;
    if (throttle > 0.0) {
      androidAccum += dt;
      if (androidAccum < throttle) return;
      androidAccum = 0.0;
    }
    apply(false);
  });
})();

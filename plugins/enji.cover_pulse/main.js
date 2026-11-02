// 封面律动: the playing page's cover pulses with the beat. A beat is a
// jump of the music's low end (below about 150 Hz, where the kick drum is)
// well above its recent average, at least a short while after the last.
var average = 0;
var heard = 0;
var last = 0;

// How far above the average a beat stands, and how soon another may come.
var JUMP = 1.35;
var QUIET = 0.012;
var APART = 260;

enji.on('song', function () {
  average = 0;
  heard = 0;
});

enji.on('audio', function (sound) {
  var energy = sound.bass;
  // The first moments of a song only learn how loud it is.
  if (heard < 20) {
    average = heard === 0 ? energy : average * 0.8 + energy * 0.2;
    heard++;
    return;
  }
  var now = Date.now();
  if (energy > average * JUMP && energy > QUIET && now - last > APART) {
    last = now;
    cover.pulse();
  }
  average = average * 0.92 + energy * 0.08;
});

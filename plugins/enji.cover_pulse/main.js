// 封面律动: the playing page's cover pulses on the beat, as hard as the music
// hits. Enji follows the beat and tells it ahead of the sound, for the pulse
// to peak as the beat lands.
enji.on('audio', function (sound) {
  if (sound.beat > 0) cover.pulse(sound.beat);
});

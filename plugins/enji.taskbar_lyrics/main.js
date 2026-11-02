// 任务栏歌词: the sung line and its translation (or the next line) on the
// Windows taskbar, beside the notification area; the song's name until its
// lyrics come.
var shown = null;

function show(first, second) {
  var key = first + '\n' + second;
  if (key === shown) return;
  shown = key;
  if (!first) {
    overlay.hide('taskbar');
    return;
  }
  overlay.show('taskbar', {
    place: 'taskbar',
    locked: true,
    lines: [
      { text: first, size: 13, bold: true, color: '#ffffff' },
      { text: second || '', size: 10, color: '#ffffffcc' },
    ],
  });
}

enji.on('song', function (song) {
  show(song.name, song.artists);
});

enji.on('lyric', function (line) {
  if (line.text) {
    show(line.text, line.translation || line.next);
  } else if (enji.song) {
    show(enji.song.name, enji.song.artists);
  }
});

// 任务栏歌词: the sung line and its translation (or the next line) on the
// Windows taskbar, beside the notification area; the song's name until its
// lyrics come.
var shown = null;
var lastFirst = '';
var lastSecond = '';

function show(first, second) {
  lastFirst = first || '';
  lastSecond = second || '';
  var theme = enji.taskbarTheme === 'light' ? 'light' : 'dark';
  var key = theme + '\n' + lastFirst + '\n' + lastSecond;
  if (key === shown) return;
  shown = key;
  if (!lastFirst) {
    overlay.hide('taskbar');
    return;
  }
  var light = theme === 'light';
  overlay.show('taskbar', {
    place: 'taskbar',
    locked: true,
    effect: 'none',
    lines: [
      { text: lastFirst, size: 13, bold: true, color: light ? '#000000' : '#ffffff' },
      { text: lastSecond, size: 10, color: light ? '#000000cc' : '#ffffffcc' },
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

enji.on('taskbarTheme', function () {
  if (lastFirst) {
    show(lastFirst, lastSecond);
  }
});

# Enji 插件商店

[Enji Music](https://github.com/MCDFsteve/Enji) 的插件仓库。Enji 的「设置 → 插件 → 插件商店」读的就是这里的 [`plugins.json`](plugins.json)。

## 安装插件

- **从商店**：在 Enji 的「设置 → 插件」里点「插件商店」，选一个插件「安装」，再打开它的开关。
- **从文件**：在 [`dist/`](dist/) 下载 `.enj` 文件，在「设置 → 插件」里点「导入插件…」选中它。

## 现有插件

| 插件 | 说明 | 系统 |
| --- | --- | --- |
| [任务栏歌词](plugins/enji.taskbar_lyrics) | 在任务栏上显示歌词 | Windows |
| [封面律动](plugins/enji.cover_pulse) | 封面随鼓点跳动 | 全部 |

## 写一个插件

插件是一个文件夹，名字就是插件的 id：

```text
plugins/your.plugin/
├── pack.json   声明：名字、版本、权限……
├── main.js     脚本
└── icon.png    图标，256 × 256
```

### pack.json

```json
{
  "id": "your.plugin",
  "name": "插件名",
  "version": "1.0.0",
  "minHostVersion": "0.1.0",
  "description": "一句话说明它做什么。",
  "author": "你的名字",
  "category": "lyrics",
  "permissions": ["lyrics", "overlay"],
  "platforms": ["windows"],
  "icon": "icon.png",
  "main": "main.js"
}
```

- `id` 只能用字母、数字、点、下划线和连字符。
- `platforms` 是插件能用的系统：`windows`、`macos`、`linux`、`android`、`ios`。不写就是全部。
- `category` 是 `lyrics`、`appearance`、`player` 或 `tools`。

### 权限

| 权限 | 能做什么 |
| --- | --- |
| `lyrics` | 收到 `lyric` 事件：正在唱的一行、翻译和下一行 |
| `audio` | 每秒约 20 次收到 `audio` 事件：音乐的响度和低频响度 |
| `overlay` | 在所有窗口上方显示文字（桌面歌词、任务栏歌词） |
| `cover` | 让播放页的封面轻推一下 |

没有声明的权限，调用会被忽略。

### 脚本能用的东西

```js
// 事件：song、lyric（需要 lyrics）、playback、audio（需要 audio）
enji.on('song', function (song) {});          // { id, name, artists, album, duration }
enji.on('lyric', function (line) {});         // { text, translation, next, index }
enji.on('playback', function (state) {});     // { playing, position }
enji.on('audio', function (sound) {});        // { level, bass, position }，0 到大约 1

enji.platform;   // 'windows'、'macos'、'linux'、'android' 或 'ios'
enji.song;       // 正在放的歌，或 null
enji.playing;    // 是否在播放

// 需要 overlay：在所有窗口上方显示几行文字。place 是 'free'（用户可拖动的位置）
// 或 'taskbar'（Windows 任务栏上）；locked 时点击穿透。颜色写 #rrggbb 或 #rrggbbaa。
overlay.show('main', {
  place: 'free',
  locked: true,
  lines: [{ text: '第一行', size: 28, bold: true, color: '#ffffff' }],
});
overlay.hide('main');

cover.pulse();               // 需要 cover：封面轻推一下
ui.toast('提示一句话');
storage.set('key', { any: 'value' });   // 下次启动还在
storage.get('key');
console.log('写到 Enji 的日志里');
```

每个插件跑在自己的 JavaScript 环境里，插件之间互不影响。插件关掉时，它显示的文字会一起收起。

### 打包与提交

```sh
python3 tools/pack.py
```

它把 `plugins/` 下的每个插件打成 `dist/<id>-<version>.enj`（插件文件夹的 zip，`pack.json` 在根目录），并重写 `plugins.json`。改好插件后运行一次，连同 `dist/` 和 `plugins.json` 一起提交拉取请求。

在提交前想先在 Enji 里试，可以设置环境变量 `ENJI_PLUGIN_INDEX` 指向本地的 `plugins.json` 再启动 Enji，商店就会列出本地的插件。

## 许可

[MIT](LICENSE)。

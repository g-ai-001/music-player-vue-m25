import { ref, computed } from 'vue';
import type { Music, LyricLine } from '../types/music';

const musicList = ref<Music[]>([
  {
    id: 1,
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    duration: 267,
    src: 'https://music.163.com/song/media/outer/url?id=186995.mp3',
    cover: 'https://p2.music.126.net/8gRfNfT0_7C6C-ffq SheppardA==/109951166952713766.jpg',
    lyrics: `[00:00.00]晴天 - 周杰伦
[00:01.00]词：周杰伦 曲：周杰伦
[00:15.00]故事的小黄花 从出生那年就飘着
[00:22.00]童年的荡秋千 随记忆一直晃到现在
[00:30.00]Re So So Si Do Si La
[00:34.00]So La Si Si Si Si La Si La So
[00:42.00]吹着前奏 望着天空
[00:46.00]我想起花瓣 试着掉落
[00:51.00]为你翘课的那一天
[00:54.00]花落那一天 教室哪一间
[00:57.00]我怎么看不见
[00:59.00]消失的下雨天 我多想再淋一遍
[01:07.00]没想到失去的勇气 我还留着
[01:14.00]再一遍 想看你脸
[01:17.00]你天使的脸孔 我想着
[01:22.00]亲爱的那只是只是Rain
[01:27.00]哭红了眼眶 我室外大江
[01:34.00]枫叶将故事染色 说破
[01:38.00]我拉开窗帘 背后你的转转
[01:42.00]离离的故故故
[01:46.00]我疗怎么大发雷霆
[01:49.00]我拉着同桌给人给给给
[01:53.00]我疗怎么大发雷霆
[01:57.00]仁大人却却得得
[02:02.00]怎么大发雷霆
[02:07.00]怎么大发雷霆
[02:11.00]这可紧TS我那拿拿
[02:15.00]吹着前奏 望着天空
[02:19.00]我想起花瓣 试着掉落
[02:24.00]为你翘课的那一天
[02:27.00]花落那一天 教室哪一间
[02:30.00]我你怎么看不见
[02:33.00]消失的下雨天 我多想再淋一遍
[02:40.00]没想到失去的勇气 我还留着
[02:47.00]再一遍 想看你脸
[02:50.00]你天使的脸孔 我想着
[02:55.00]亲爱的那只是只是Rain
[03:00.00]哭红了眼眶 我室外大江
[03:07.00]枫叶将故事染色 说破
[03:11.00]我拉开窗帘 背后你的转转
[03:15.00]离离的故故故
[03:19.00]我疗怎么大发雷霆
[03:22.00]我拉着同桌给人给给给
[03:26.00]我疗怎么大发雷霆
[03:30.00]仁大人却却得得
[03:35.00]怎么大发雷霆
[03:40.00]怎么大发雷霆
[03:44.00]这可紧TS我那拿拿`
  },
  {
    id: 2,
    title: '夜曲',
    artist: '周杰伦',
    album: '十一月的萧邦',
    duration: 252,
    src: 'https://music.163.com/song/media/outer/url?id=186995.mp3',
    cover: 'https://p2.music.126.net/coT5aJABB-q8R3FBi7YjfA==/109951166952713766.jpg',
    lyrics: `[00:00.00]夜曲 - 周杰伦
[00:15.00]一群嗜血的蚂蚁 被腐肉所吸引
[00:22.00]我面无表情 看孤独的风景
[00:30.00]失去你 爱恨开始分明
[00:34.00]失去你 还有什么事好关心
[00:42.00]当鸽子不再象征和平
[00:46.00]我终于被提醒 广场拖着皮鞋
[00:51.00]我面无表情 在黑暗地听
[00:54.00]用音乐祭奠 伤口青春
[00:57.00]为你弹奏萧邦的夜曲
[00:59.00]纪念我死去的爱情
[01:02.00]跟夜风一样的声音
[01:05.00]心碎的很好听
[01:08.00]我安静地等 雨停
[01:11.00]用音乐祭奠 伤口
[01:14.00]为你弹奏萧邦的夜曲
[01:17.00]纪念我死去的爱情
[01:20.00]而我为你隐姓埋名
[01:23.00]在月光下弹琴
[01:26.00]对你弹的萧邦夜曲
[01:29.00]送走感情
[01:32.00]我安静地等 雨停
[01:35.00]我隐姓埋名
[01:38.00]在月光下弹琴
[01:41.00]送走感情
[01:44.00]一群嗜血的蚂蚁
[01:47.00]被腐肉所吸引
[01:50.00]我面无表情 看孤独的风景
[01:53.00]失去你 爱恨开始分明
[01:56.00]失去你 还有什么事好关心
[01:59.00]当鸽子不再象征和平
[02:02.00]我终于被提醒 广场拖着皮鞋
[02:05.00]我面无表情 在黑暗地听
[02:08.00]用音乐祭奠 伤口青春
[02:11.00]为你弹奏萧邦的夜曲
[02:14.00]纪念我死去的爱情
[02:17.00]跟夜风一样的声音
[02:20.00]心碎的很好听
[02:23.00]我安静地等 雨停
[02:26.00]用音乐祭奠 伤口
[02:29.00]为你弹奏萧邦的夜曲
[02:32.00]纪念我死去的爱情
[02:35.00]而我为你隐姓埋名
[02:38.00]在月光下弹琴
[02:41.00]对你弹的萧邦夜曲
[02:44.00]送走感情
[02:47.00]我安静地等 雨停`
  },
  {
    id: 3,
    title: '稻香',
    artist: '周杰伦',
    album: '魔杰座',
    duration: 218,
    src: 'https://music.163.com/song/media/outer/url?id=186995.mp3',
    cover: 'https://p1.music.126.net/hqV0D-_vlbaot3X3DnBTrg==/109951166952713766.jpg',
    lyrics: `[00:00.00]稻香 - 周杰伦
[00:08.00]词：周杰伦 曲：周杰伦
[00:16.00]对这个世界如果你有太多的抱怨
[00:22.00]跌倒了 就不敢继续往前走
[00:28.00]为什么 人要这么的脆弱 堕落
[00:34.00]记得你所有的理想吗
[00:38.00]我靠的肩膀 遗失的 roses
[00:42.00]我打开 and1tai??? 我会坚强的
[00:46.00]笑一笑 一切都会好的
[00:50.00]乡间的歌谣 永远的依靠
[00:54.00]回家吧 回到最初的美好
[00:58.00]不要这么容易 就想放弃
[01:02.00]就当你是 来看我的
[01:06.00]一盏灯一座城找一人
[01:10.00]一路换一程
[01:14.00]我说 自找的
[01:18.00]笑一笑 一切都会好的
[01:22.00]没有风 找到方向
[01:26.00]没那收成 不去
[01:30.00]去看看他们
[01:34.00]还记得你说家是唯一的城堡
[01:38.00]随着稻香 河流继续奔跑
[01:42.00]微微笑 小时候的梦我知道
[01:46.00]不要哭 让萤火虫带着你逃跑
[01:50.00]乡间的歌谣 永远的依靠
[01:54.00]回家吧 回到最初的美好
[01:58.00]不要这么容易 就想放弃
[02:02.00]就当你是 来看我的
[02:06.00]一盏灯一座城找一人
[02:10.00]一路换一程
[02:14.00]我说 自找的
[02:18.00]笑一笑 一切都会好的
[02:22.00]一盏灯一座城找一人
[02:26.00]一路换一程
[02:30.00]我说 自找的
[02:34.00]笑一笑 一切都会好的`
  },
  {
    id: 4,
    title: '七里香',
    artist: '周杰伦',
    album: '七里香',
    duration: 246,
    src: 'https://music.163.com/song/media/outer/url?id=186995.mp3',
    cover: 'https://p2.music.126.net/QK_jJN4VMAW6V3x-kCePvw==/109951166952713766.jpg',
    lyrics: `[00:00.00]七里香 - 周杰伦
[00:08.00]词：方文山 曲：周杰伦
[00:16.00]窗外的麻雀 在电线杆上站成一行
[00:24.00]它们的意思 是代表要提醒你
[00:30.00]那首歌 将要出炉
[00:36.00]热乎乎的 就是这种感觉
[00:40.00]看你慢慢靠近
[00:44.00]它就放在我的脚边
[00:48.00]诗的边境 再次被你找回
[00:52.00]我此刻在回家的路上
[00:56.00]在有眼泪的 Load
[01:00.00]我手中的 CD
[01:04.00]封面很丑 但是很温柔
[01:08.00]满山遍野 都能听见
[01:12.00]你在唱 七里香
[01:16.00]你是我唯一想要的了解
[01:24.00]那饱满的稻穗 幸福了整个季节
[01:28.00]而你的脸颊 像田地熟透的番茄
[01:32.00]你突然对我说 七里香的名字很美
[01:36.00]我此刻却只想亲吻你倔强的嘴
[01:40.00]你说的话 总是很明白
[01:44.00]干杯吧 朋友
[01:48.00]让你的体温 保持鲜活
[01:52.00]在我的胸口 再度落下
[01:56.00]等待 decision
[02:00.00]满山遍野 都能听见
[02:04.00]你在唱 七里香
[02:08.00]你是我唯一想要的了解
[02:16.00]那饱满的稻穗 幸福了整个季节
[02:20.00]而你的脸颊 像田地熟透的番茄
[02:24.00]你突然对我说 七里香的名字很美
[02:28.00]我此刻却只想亲吻你倔强的嘴`
  },
  {
    id: 5,
    title: '青花瓷',
    artist: '周杰伦',
    album: '我很忙',
    duration: 234,
    src: 'https://music.163.com/song/media/outer/url?id=186995.mp3',
    cover: 'https://p1.music.126.net/AhR3MuSyNn-qXKvIIJvKPg==/109951166952713766.jpg',
    lyrics: `[00:00.00]青花瓷 - 周杰伦
[00:08.00]词：方文山 曲：周杰伦
[00:16.00]素胚勾勒出青花 笔锋浓转淡
[00:24.00]瓶身描绘的牡丹 一如你初妆
[00:32.00]冉冉檀香透过窗 心事我了然
[00:40.00]宣纸上走笔至此搁一半
[00:48.00]釉色渲染仕女图 韵味被私藏
[00:56.00]而你嫣然的一笑 如含苞待放
[01:04.00]你的美一缕飘散
[01:12.00]去到我去不了的地方
[01:20.00]天青色等烟雨 而我在等你
[01:28.00]炊烟袅袅升起 隔江千万里
[01:36.00]在瓶底书刻隶仿前朝的飘逸
[01:44.00]就当我为遇见你伏笔
[01:52.00]天青色等烟雨 而我在等你
[02:00.00]月色被打捞起 晕开了结局
[02:08.00]如传世的青花瓷 自顾自美丽
[02:16.00]你眼带笑意
[02:24.00]色白花青的锦鲤 跃然于碗底
[02:32.00]临摹宋体落款时 惦记着你
[02:40.00]它年若 ENV 就当我没绠过
[02:48.00]如传世的青花瓷 自顾自美丽
[02:56.00]你眼带笑意`
  }
]);

const currentMusicIndex = ref(0);
const isPlaying = ref(false);
const currentTime = ref(0);
const volume = ref(0.8);
const playMode = ref<'loop' | 'single' | 'random'>('loop');

const currentMusic = computed(() => musicList.value[currentMusicIndex.value]);

function parseLyrics(text: string): LyricLine[] {
  const lines = text.split('\n');
  const result: LyricLine[] = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + centiseconds / 100;
      const text = match[4].trim();
      if (text) {
        result.push({ time, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function usePlayer() {
  function play() {
    isPlaying.value = true;
  }

  function pause() {
    isPlaying.value = false;
  }

  function togglePlay() {
    isPlaying.value = !isPlaying.value;
  }

  function playNext() {
    currentMusicIndex.value = (currentMusicIndex.value + 1) % musicList.value.length;
    currentTime.value = 0;
  }

  function playPrev() {
    currentMusicIndex.value = (currentMusicIndex.value - 1 + musicList.value.length) % musicList.value.length;
    currentTime.value = 0;
  }

  function selectMusic(index: number) {
    currentMusicIndex.value = index;
    currentTime.value = 0;
    isPlaying.value = true;
  }

  function setCurrentTime(time: number) {
    currentTime.value = time;
  }

  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(1, v));
  }

  return {
    musicList,
    currentMusicIndex,
    currentMusic,
    isPlaying,
    currentTime,
    volume,
    playMode,
    parseLyrics,
    formatTime,
    play,
    pause,
    togglePlay,
    playNext,
    playPrev,
    selectMusic,
    setCurrentTime,
    setVolume
  };
}
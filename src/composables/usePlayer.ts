import { ref, computed } from 'vue';
import type { Music, LyricLine } from '../types/music';

// 默认歌曲数据（当JSON加载失败时使用）
const defaultMusicList: Music[] = [
];

// 备用封面URL映射
const fallbackCovers: Record<number, string> = {
};

const musicList = ref<Music[]>([]);
const currentMusicIndex = ref(0);
const isPlaying = ref(false);
const currentTime = ref(0);
const volume = ref(0.8);
const playMode = ref<'loop' | 'single' | 'random'>('loop');
const isLoading = ref(true);

// 加载歌曲数据
async function loadSongs() {
  try {
    const response = await fetch('./music/songs.json');
    if (!response.ok) throw new Error('Failed to load songs.json');

    const songs: Music[] = await response.json();

    // 检查并处理封面和歌词路径
    for (const song of songs) {
      // 如果封面路径是相对路径，尝试加载，如果失败则使用备用封面
      if (song.cover && song.cover.startsWith('./')) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = song.cover;
          });
        } catch {
          // 使用备用封面
          song.cover = fallbackCovers[song.id] || fallbackCovers[1];
        }
      }

      // 如果歌词路径是相对路径，尝试加载
      if (song.lyrics && song.lyrics.startsWith('./')) {
        try {
          const response = await fetch(song.lyrics);
          if (response.ok) {
            song.lyrics = await response.text();
          } else {
            throw new Error('Lyrics file not found');
          }
        } catch {
          // 使用内嵌的默认歌词（从defaultMusicList获取）
          const defaultSong = defaultMusicList.find(s => s.id === song.id);
          if (defaultSong) {
            song.lyrics = defaultSong.lyrics;
          }
        }
      }
    }

    musicList.value = songs;
  } catch (error) {
    console.warn('Failed to load songs.json, using default songs:', error);
    musicList.value = defaultMusicList;
  } finally {
    isLoading.value = false;
  }
}

const currentMusic = computed(() => musicList.value[currentMusicIndex.value] || defaultMusicList[0]);

function parseLyrics(text: string): LyricLine[] {
  if (!text) return [];
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
    if (musicList.value.length === 0) return;

    if (playMode.value === 'random') {
      let newIndex: number;
      do {
        newIndex = Math.floor(Math.random() * musicList.value.length);
      } while (newIndex === currentMusicIndex.value && musicList.value.length > 1);
      currentMusicIndex.value = newIndex;
    } else {
      currentMusicIndex.value = (currentMusicIndex.value + 1) % musicList.value.length;
    }
    currentTime.value = 0;
    isPlaying.value = true;
  }

  function playPrev() {
    if (musicList.value.length === 0) return;
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

  function setPlayMode(mode: 'loop' | 'single' | 'random') {
    playMode.value = mode;
  }

  function togglePlayMode() {
    const modes: ('loop' | 'single' | 'random')[] = ['loop', 'single', 'random'];
    const currentIndex = modes.indexOf(playMode.value);
    playMode.value = modes[(currentIndex + 1) % modes.length];
  }

  // 初始化时加载歌曲
  loadSongs();

  return {
    musicList,
    currentMusicIndex,
    currentMusic,
    isPlaying,
    currentTime,
    volume,
    playMode,
    isLoading,
    parseLyrics,
    formatTime,
    play,
    pause,
    togglePlay,
    playNext,
    playPrev,
    selectMusic,
    setCurrentTime,
    setVolume,
    setPlayMode,
    togglePlayMode,
    loadSongs
  };
}

<template>
  <div class="player">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <audio
      ref="audioRef"
      :src="currentMusic.src"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @loadedmetadata="onLoadedMetadata"
    ></audio>

    <div class="player-content">
      <div class="player-left">
        <div class="cover-container">
          <img
            :src="currentMusic.cover"
            :alt="currentMusic.title"
            class="cover-image"
            :class="{ playing: isPlaying }"
          />
        </div>
        <div class="song-info">
          <h2 class="song-title">{{ currentMusic.title }}</h2>
          <p class="song-artist">{{ currentMusic.artist }}</p>
          <p class="song-album">{{ currentMusic.album }}</p>
        </div>

        <PlayerControls
          :is-playing="isPlaying"
          :volume="volume"
          :play-mode="playMode"
          @toggle-play="togglePlay"
          @play-next="playNext"
          @play-prev="playPrev"
          @toggle-play-mode="togglePlayMode"
          @set-volume="onSetVolume"
        />
      </div>

      <div class="player-right">
        <Lyrics :lyrics="currentMusic.lyrics" :current-time="currentTime" />
      </div>
    </div>

    <div class="progress-bar-container">
      <ProgressBar
        :current-time="currentTime"
        :duration="duration"
        @seek="onSeek"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { usePlayer } from '../composables/usePlayer';
import Lyrics from './Lyrics.vue';
import ProgressBar from './ProgressBar.vue';
import PlayerControls from './PlayerControls.vue';

const {
  currentMusic,
  isPlaying,
  currentTime,
  volume,
  playMode,
  isLoading,
  togglePlay,
  playNext,
  playPrev,
  setCurrentTime,
  setVolume,
  togglePlayMode
} = usePlayer();

const audioRef = ref<HTMLAudioElement | null>(null);
const duration = ref(0);
const needsAutoPlay = ref(true); // 是否需要自动播放

// 使用AudioContext解锁音频播放
function unlockAudio() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    // 创建一个短暂的音频来解锁
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (e) {
    console.log('AudioContext unlock failed:', e);
  }
}

// 尝试自动播放
async function attemptAutoPlay() {
  if (!audioRef.value || !needsAutoPlay.value) return;

  try {
    // 先尝试解锁AudioContext
    unlockAudio();
    await audioRef.value.play();
    needsAutoPlay.value = false;
  } catch (error) {
    // 自动播放被阻止，等待用户交互
    console.log('自动播放被阻止，等待用户交互');
  }
}

// 用户首次交互时尝试播放
function handleUserInteraction() {
  if (needsAutoPlay.value) {
    attemptAutoPlay();
  }
}

function onTimeUpdate() {
  if (audioRef.value) {
    setCurrentTime(audioRef.value.currentTime);
  }
}

function onLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
  }
}

function onEnded() {
  if (playMode.value === 'single') {
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      audioRef.value.play();
    }
  } else {
    playNext();
  }
}

function onSeek(time: number) {
  if (audioRef.value) {
    audioRef.value.currentTime = time;
    setCurrentTime(time);
  }
}

function onSetVolume(newVolume: number) {
  setVolume(newVolume);
  if (audioRef.value) {
    audioRef.value.volume = newVolume;
  }
}

watch(isPlaying, (playing) => {
  if (audioRef.value) {
    if (playing) {
      audioRef.value.play().catch(() => {});
    } else {
      audioRef.value.pause();
    }
  }
});

watch(currentMusic, () => {
  if (audioRef.value) {
    audioRef.value.currentTime = 0;
    duration.value = audioRef.value.duration || currentMusic.value.duration;
  }
  // 切换歌曲后也需要自动播放
  needsAutoPlay.value = true;
});

watch(volume, (newVolume) => {
  if (audioRef.value) {
    audioRef.value.volume = newVolume;
  }
});

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
    duration.value = audioRef.value.duration || currentMusic.value.duration;
  }

  // 添加用户交互监听器
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('touchstart', handleUserInteraction);

  // 页面加载完成后尝试自动播放
  attemptAutoPlay();
});

onUnmounted(() => {
  document.removeEventListener('click', handleUserInteraction);
  document.removeEventListener('touchstart', handleUserInteraction);
});
</script>

<style scoped>
.player {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: #fff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.player-content {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  position: relative;
}

.player-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 30px 30px;
  width: 45%;
  min-width: 380px;
  gap: 20px; /* 统一元素间距 */
}

.cover-container {
  width: 240px;
  height: 240px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  flex-shrink: 0;
}

.cover-container::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #1a1a1a;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.cover-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
}

.cover-image.playing {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.song-info {
  text-align: center;
  width: 100%;
}

.song-title {
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
}

.song-artist {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  margin-bottom: 4px;
}

.song-album {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  line-height: 1.3;
}

.player-right {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.progress-bar-container {
  width: 100%;
  padding: 0 30px 25px;
  flex-shrink: 0;
}

/* 平板横屏 - 左右布局 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape) {
  .player-left {
    padding: 30px 20px 25px;
    gap: 16px;
  }

  .cover-container {
    width: 200px;
    height: 200px;
  }

  .cover-container::after {
    width: 18px;
    height: 18px;
  }

  .cover-container::before {
    width: calc(100% + 18px);
    height: calc(100% + 18px);
  }

  .song-title {
    font-size: 20px;
  }

  .progress-bar-container {
    padding: 0 20px 20px;
  }
}

/* 折叠屏和手机 - 无论横竖屏都使用上下布局 */
@media (max-width: 1024px) {
  .player {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .player-content {
    flex: 1;
    flex-direction: column;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .player-left {
    width: 100%;
    min-width: unset;
    padding: 15px 20px 10px;
    flex: none;
    max-height: none; /* 移除最大高度限制，让内容自然展开 */
    gap: 10px;
    overflow: visible; /* 确保按钮不被裁剪 */
  }

  .cover-container {
    width: 120px;
    height: 120px;
  }

  .cover-container::after {
    width: 14px;
    height: 14px;
  }

  .cover-container::before {
    width: calc(100% + 14px);
    height: calc(100% + 14px);
  }

  .song-info {
    margin-bottom: 0;
  }

  .song-title {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .song-artist {
    font-size: 13px;
    margin-bottom: 2px;
  }

  .song-album {
    font-size: 12px;
  }

  .player-right {
    flex: 1;
    min-height: 0;
    max-height: none;
    overflow: hidden;
    position: relative;
  }

  .progress-bar-container {
    flex: none;
    padding: 0 20px 10px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .player-left {
    padding: 12px 16px 6px;
    gap: 10px;
  }

  .cover-container {
    width: 110px;
    height: 110px;
  }

  .song-title {
    font-size: 15px;
    margin-bottom: 3px;
  }

  .song-artist {
    font-size: 12px;
    margin-bottom: 1px;
  }

  .song-album {
    font-size: 11px;
  }

  .progress-bar-container {
    padding: 0 16px 8px;
  }
}
</style>

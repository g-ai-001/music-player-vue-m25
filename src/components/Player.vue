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
import { ref, watch, onMounted } from 'vue';
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
const isAudioLoaded = ref(false);

// 尝试自动播放
async function attemptAutoPlay() {
  if (!audioRef.value || !isAudioLoaded.value) return;

  try {
    await audioRef.value.play();
    // 播放成功，isPlaying 状态会由 watch 自动更新
  } catch (error) {
    console.log('自动播放被阻止，等待用户交互');
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
    isAudioLoaded.value = true;
    // 音频加载完成后尝试自动播放
    attemptAutoPlay();
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
    isAudioLoaded.value = false; // 重置状态，等待新的音频加载
  }
  // 切换歌曲后也需要自动播放
  attemptAutoPlay();
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

/* 手机竖屏 - 上下布局,歌词在下方 */
@media (max-width: 768px) and (orientation: portrait) {
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
    max-height: none;
    gap: 10px;
    overflow: visible;
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
    overflow: hidden;
    position: relative;
  }

  .progress-bar-container {
    flex: none;
    padding: 0 20px 10px;
  }
}

/* 手机横屏 - 左右布局，播放器在左 */
@media (max-width: 768px) and (orientation: landscape) {
  .player {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .player-content {
    flex: 1;
    flex-direction: row;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .player-left {
    width: 50%;
    min-width: 250px;
    padding: 15px 20px 10px;
    flex: none;
    gap: 12px;
    overflow: visible;
    justify-content: center;
  }

  .cover-container {
    width: 140px;
    height: 140px;
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

/* 折叠屏竖屏 - 左右布局，播放器在左 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
  .player {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .player-content {
    flex: 1;
    flex-direction: row;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .player-left {
    width: 50%;
    min-width: 280px;
    padding: 20px;
    flex: none;
    gap: 15px;
    overflow: visible;
    justify-content: center;
  }

  .cover-container {
    width: 160px;
    height: 160px;
  }

  .cover-container::after {
    width: 16px;
    height: 16px;
  }

  .cover-container::before {
    width: calc(100% + 16px);
    height: calc(100% + 16px);
  }

  .song-info {
    margin-bottom: 0;
  }

  .song-title {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .song-artist {
    font-size: 14px;
    margin-bottom: 3px;
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
    padding: 0 20px 15px;
  }
}

/* 折叠屏横屏 - 左右布局，播放器在左 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .player {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .player-content {
    flex: 1;
    flex-direction: row;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .player-left {
    width: 50%;
    min-width: 300px;
    padding: 20px 25px 15px;
    flex: none;
    gap: 15px;
    overflow: visible;
    justify-content: center;
  }

  .cover-container {
    width: 180px;
    height: 180px;
  }

  .cover-container::after {
    width: 16px;
    height: 16px;
  }

  .cover-container::before {
    width: calc(100% + 16px);
    height: calc(100% + 16px);
  }

  .song-info {
    margin-bottom: 0;
  }

  .song-title {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .song-artist {
    font-size: 14px;
    margin-bottom: 3px;
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
    padding: 0 25px 15px;
  }
}

/* 平板竖屏 - 左右布局，播放器在左 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: portrait) {
  .player {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .player-content {
    flex: 1;
    flex-direction: row;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .player-left {
    width: 50%;
    min-width: 320px;
    padding: 25px;
    flex: none;
    gap: 18px;
    overflow: visible;
    justify-content: center;
  }

  .cover-container {
    width: 190px;
    height: 190px;
  }

  .cover-container::after {
    width: 18px;
    height: 18px;
  }

  .cover-container::before {
    width: calc(100% + 18px);
    height: calc(100% + 18px);
  }

  .song-info {
    margin-bottom: 0;
  }

  .song-title {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .song-artist {
    font-size: 15px;
    margin-bottom: 3px;
  }

  .song-album {
    font-size: 13px;
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
    padding: 0 25px 18px;
  }
}

/* 平板横屏和桌面 - 左右布局，播放器在中 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape),
       (min-width: 1367px) {
  .player {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .player-content {
    flex: 1;
    flex-direction: row;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .player-left {
    padding: 30px;
    gap: 20px;
    justify-content: center;
  }

  .cover-container {
    width: 220px;
    height: 220px;
  }

  .song-title {
    font-size: 22px;
  }

  .player-right {
    flex: 1;
    overflow: hidden;
  }

  .progress-bar-container {
    padding: 0 30px 20px;
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

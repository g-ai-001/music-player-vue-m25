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
    ></audio>

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

      <!-- 播放控制区域 -->
      <div class="controls">
        <button class="control-btn" @click="togglePlay">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="32" height="32">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="32" height="32">
            <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <button class="control-btn" @click="playPrev">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        <button class="control-btn" @click="playNext">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      <!-- 音量控制和播放模式 -->
      <div class="extra-controls">
        <div class="volume-control">
          <button class="control-btn-small" @click="toggleMute">
            <svg v-if="volume === 0 || isMuted" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
            <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>
          <div class="volume-slider-container">
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.01"
              :value="isMuted ? 0 : volume"
              @input="onVolumeChange"
            />
            <div class="volume-fill" :style="{ width: `${(isMuted ? 0 : volume) * 100}%` }"></div>
          </div>
          <span class="volume-value">{{ Math.round((isMuted ? 0 : volume) * 100) }}%</span>
        </div>

        <button class="control-btn-small play-mode-btn" @click="togglePlayMode" :title="playModeText">
          <svg v-if="playMode === 'loop'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
          <svg v-else-if="playMode === 'single'" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
          <span class="play-mode-text">{{ playModeText }}</span>
        </button>
      </div>
    </div>

    <div class="player-right">
      <Lyrics :lyrics="currentMusic.lyrics" :currentTime="currentTime" />
    </div>

    <div class="progress-bar-container">
      <ProgressBar
        :currentTime="currentTime"
        :duration="currentMusic.duration"
        @seek="onSeek"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { usePlayer } from '../composables/usePlayer';
import Lyrics from './Lyrics.vue';
import ProgressBar from './ProgressBar.vue';

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
const isMuted = ref(false);

const playModeText = computed(() => {
  switch (playMode.value) {
    case 'loop': return '列表循环';
    case 'single': return '单曲循环';
    case 'random': return '随机播放';
    default: return '列表循环';
  }
});

function onTimeUpdate() {
  if (audioRef.value) {
    setCurrentTime(audioRef.value.currentTime);
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
  }
}

function onVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const newVolume = parseFloat(target.value);
  setVolume(newVolume);
  if (audioRef.value) {
    audioRef.value.volume = newVolume;
  }
  if (newVolume > 0) {
    isMuted.value = false;
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value;
  if (audioRef.value) {
    audioRef.value.volume = isMuted.value ? 0 : volume.value;
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
  }
});

watch(volume, (newVolume) => {
  if (audioRef.value && !isMuted.value) {
    audioRef.value.volume = newVolume;
  }
});

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
});
</script>

<style scoped>
.player {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
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

.player-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  flex: 1;
}

.cover-container {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
}

.cover-container::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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
  margin-top: 30px;
}

.song-title {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.song-artist {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.song-album {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-top: 4px;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.control-btn:first-child {
  width: 72px;
  height: 72px;
  background: #1db954;
}

.control-btn:first-child:hover {
  background: #1ed760;
}

.extra-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-top: 25px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn-small {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s ease;
}

.control-btn-small:hover {
  background: rgba(255, 255, 255, 0.2);
}

.volume-slider-container {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.volume-fill {
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
}

.volume-slider {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

.volume-value {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  min-width: 35px;
  text-align: right;
}

.play-mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 18px;
  padding: 0 12px;
  width: auto;
  height: 36px;
}

.play-mode-text {
  font-size: 12px;
  white-space: nowrap;
}

.player-right {
  flex: 1;
  overflow: hidden;
}

.progress-bar-container {
  width: 100%;
  padding: 0 20px 20px;
}

@media (max-width: 768px) {
  .player {
    flex-direction: column;
  }

  .player-left {
    padding: 20px;
    flex: none;
  }

  .cover-container {
    width: 180px;
    height: 180px;
  }

  .song-title {
    font-size: 20px;
  }

  .player-right {
    flex: none;
    height: 200px;
  }

  .controls {
    gap: 15px;
    margin-top: 20px;
  }

  .control-btn {
    width: 48px;
    height: 48px;
  }

  .control-btn:first-child {
    width: 60px;
    height: 60px;
  }

  .extra-controls {
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }

  .volume-slider-container {
    width: 80px;
  }
}
</style>
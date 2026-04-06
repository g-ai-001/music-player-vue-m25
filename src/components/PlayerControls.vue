<template>
  <div class="controls-wrapper">
    <!-- 播放控制按钮 -->
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  isPlaying: boolean;
  volume: number;
  playMode: 'loop' | 'single' | 'random';
}>();

const emit = defineEmits<{
  (e: 'togglePlay'): void;
  (e: 'playNext'): void;
  (e: 'playPrev'): void;
  (e: 'togglePlayMode'): void;
  (e: 'setVolume', volume: number): void;
}>();

const isMuted = ref(false);

const playModeText = computed(() => {
  switch (props.playMode) {
    case 'loop': return '列表循环';
    case 'single': return '单曲循环';
    case 'random': return '随机播放';
    default: return '列表循环';
  }
});

function togglePlay() {
  emit('togglePlay');
}

function playNext() {
  emit('playNext');
}

function playPrev() {
  emit('playPrev');
}

function togglePlayMode() {
  emit('togglePlayMode');
}

function onVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const newVolume = parseFloat(target.value);
  emit('setVolume', newVolume);
  if (newVolume > 0) {
    isMuted.value = false;
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value;
}
</script>

<style scoped>
.controls-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
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

@media (max-width: 768px) {
  .controls {
    gap: 15px;
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
  }

  .volume-slider-container {
    width: 80px;
  }
}
</style>

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

.player-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.player-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  width: 45%;
  min-width: 380px;
}

.cover-container {
  width: 240px;
  height: 240px;
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
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.song-artist {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
}

.song-album {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin-top: 4px;
}

.player-right {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.progress-bar-container {
  width: 100%;
  padding: 0 20px 20px;
}

@media (max-width: 1024px) {
  .player-left {
    width: 40%;
    min-width: 320px;
    padding: 30px 15px;
  }

  .cover-container {
    width: 200px;
    height: 200px;
  }

  .song-title {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .player-content {
    flex-direction: column;
  }

  .player-left {
    width: 100%;
    min-width: unset;
    padding: 20px;
    flex: none;
  }

  .cover-container {
    width: 160px;
    height: 160px;
  }

  .song-title {
    font-size: 18px;
  }

  .song-info {
    margin-top: 20px;
  }

  .player-right {
    flex: 1;
    min-height: 180px;
  }

  .progress-bar-container {
    padding: 0 15px 15px;
  }
}

@media (max-width: 480px) {
  .player-left {
    padding: 15px;
  }

  .cover-container {
    width: 140px;
    height: 140px;
  }

  .song-title {
    font-size: 16px;
  }

  .song-artist {
    font-size: 13px;
  }

  .song-album {
    font-size: 12px;
  }
}

/* 折叠屏适配 */
@media (min-width: 768px) and (max-width: 1024px) and (min-height: 500px) and (max-height: 700px) {
  .player-left {
    padding: 20px 10px;
  }

  .cover-container {
    width: 160px;
    height: 160px;
  }

  .song-info {
    margin-top: 15px;
  }
}
</style>

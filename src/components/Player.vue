<template>
  <div class="player">
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
import { ref, watch, onMounted } from 'vue';
import { usePlayer } from '../composables/usePlayer';
import Lyrics from './Lyrics.vue';
import ProgressBar from './ProgressBar.vue';

const {
  currentMusic,
  isPlaying,
  currentTime,
  togglePlay,
  playNext,
  playPrev,
  setCurrentTime
} = usePlayer();

const audioRef = ref<HTMLAudioElement | null>(null);

function onTimeUpdate() {
  if (audioRef.value) {
    setCurrentTime(audioRef.value.currentTime);
  }
}

function onEnded() {
  playNext();
}

function onSeek(time: number) {
  if (audioRef.value) {
    audioRef.value.currentTime = time;
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

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = 0.8;
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
}
</style>
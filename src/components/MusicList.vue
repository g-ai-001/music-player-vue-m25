<template>
  <div class="music-list">
    <h2 class="list-title">播放列表</h2>
    <div class="list-container">
      <div
        v-for="(music, index) in musicList"
        :key="music.id"
        class="music-item"
        :class="{ active: index === currentMusicIndex }"
        @click="handleSelect(index)"
      >
        <div class="music-cover">
          <img :src="music.cover" :alt="music.title" />
          <div v-if="index === currentMusicIndex && isPlaying" class="playing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="music-info">
          <div class="music-title">{{ music.title }}</div>
          <div class="music-artist">{{ music.artist }}</div>
        </div>
        <div class="music-duration">{{ formatTime(music.duration) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayer } from '../composables/usePlayer';

const { musicList, currentMusicIndex, isPlaying, formatTime, selectMusic } = usePlayer();

function handleSelect(index: number) {
  selectMusic(index);
}
</script>

<style scoped>
.music-list {
  width: 320px;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.list-title {
  padding: 20px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.list-container::-webkit-scrollbar {
  width: 4px;
}

.list-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.list-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.music-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.music-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.music-item.active {
  background: rgba(255, 255, 255, 0.15);
}

.music-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playing-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.playing-indicator span {
  width: 3px;
  height: 12px;
  background: #1db954;
  border-radius: 1px;
  animation: soundWave 0.5s ease-in-out infinite alternate;
}

.playing-indicator span:nth-child(2) {
  animation-delay: 0.1s;
}

.playing-indicator span:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes soundWave {
  0% {
    height: 4px;
  }
  100% {
    height: 14px;
  }
}

.music-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.music-title {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-item.active .music-title {
  color: #1db954;
}

.music-artist {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-duration {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 10px;
}

@media (max-width: 768px) {
  .music-list {
    width: 100%;
    height: auto;
    max-height: 35vh;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .list-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px;
    gap: 10px;
  }

  .music-item {
    flex-direction: column;
    min-width: 120px;
    padding: 8px;
  }

  .music-cover {
    width: 80px;
    height: 80px;
  }

  .music-info {
    margin-left: 0;
    margin-top: 8px;
    text-align: center;
  }

  .music-duration {
    display: none;
  }
}
</style>
<template>
  <div class="app" :style="backgroundStyle">
    <div class="background-overlay"></div>
    <div class="main-container">
      <MusicList />
      <Player />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlayer } from './composables/usePlayer';
import MusicList from './components/MusicList.vue';
import Player from './components/Player.vue';

const { currentMusic } = usePlayer();

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${currentMusic.value.cover})`
}));
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  transition: background-image 0.5s ease;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  backdrop-filter: blur(50px);
}

.main-container {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
}
</style>
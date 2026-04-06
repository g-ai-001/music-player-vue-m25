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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
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
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.55) 50%,
    rgba(0, 0, 0,  0.75) 100%
  );
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
}

.main-container {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

/* 笔记本电脑适配 */
@media (max-width: 1366px) and (max-height: 900px) {
  .main-container {
    height: 100%;
  }
}

/* 平板设备 */
@media (max-width: 1024px) {
  .background-overlay {
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }
}

/* 手机设备 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .background-overlay {
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .background-overlay {
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
  }
}

/* 折叠屏设备适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  .main-container {
    flex-direction: row;
  }
}

/* 横屏手机适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .main-container {
    flex-direction: row;
  }

  .background-overlay {
    backdrop-filter: blur(35px);
    -webkit-backdrop-filter: blur(35px);
  }
}
</style>

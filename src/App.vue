<template>
  <div class="app" :style="backgroundStyle">
    <div class="background-overlay"></div>
    <div class="main-container">
      <MusicList v-if="showMusicList" />
      <Player />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { usePlayer } from './composables/usePlayer';
import MusicList from './components/MusicList.vue';
import Player from './components/Player.vue';

const { currentMusic } = usePlayer();

const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);
const isPortrait = ref(window.matchMedia('(orientation: portrait)').matches);

const showMusicList = computed(() => {
  // 播放列表在左侧时（横屏且宽度>1024px），始终显示
  if (!isPortrait.value && windowWidth.value > 1024) {
    return true;
  }
  // 播放列表在上方时，高度>=500才显示
  return windowHeight.value >= 500;
});

function handleResize() {
  windowHeight.value = window.innerHeight;
  windowWidth.value = window.innerWidth;
  isPortrait.value = window.matchMedia('(orientation: portrait)').matches;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

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

/* 手机竖屏 (≤768px, portrait): 播放列表在上,播放器在中,歌词在下 */
@media (max-width: 768px) and (orientation: portrait) {
  .main-container {
    flex-direction: column;
  }

  .background-overlay {
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
  }
}

/* 手机横屏 (≤768px, landscape): 播放列表隐藏,播放器在左,歌词在右 */
@media (max-width: 768px) and (orientation: landscape) {
  .background-overlay {
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
  }
}

/* 折叠屏竖屏 (769px-1024px, portrait): 播放列表在上,播放器在左,歌词在右 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
  .main-container {
    flex-direction: column;
  }

  .background-overlay {
    backdrop-filter: blur(35px);
    -webkit-backdrop-filter: blur(35px);
  }
}

/* 折叠屏横屏 (769px-1024px, landscape): 播放列表在上,播放器在左,歌词在右 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .main-container {
    flex-direction: column;
  }

  .background-overlay {
    backdrop-filter: blur(35px);
    -webkit-backdrop-filter: blur(35px);
  }
}

/* 平板竖屏 (1025px-1366px, portrait): 播放列表在上,播放器在左,歌词在右 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: portrait) {
  .main-container {
    flex-direction: column;
  }

  .background-overlay {
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }
}

/* 平板横屏和桌面 (≥1025px landscape 或 >1366px): 播放列表在左,播放器在中,歌词在右 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape),
       (min-width: 1367px) {
  .background-overlay {
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .background-overlay {
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
  }
}
</style>

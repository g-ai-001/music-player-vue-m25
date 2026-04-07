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
          <div class="music-title-wrapper">
            <div 
              class="music-title" 
              :class="{ 'scrolling': shouldScroll(index) }"
              :ref="el => { if (el) titleRefs[index] = el as HTMLElement }"
            >
              <span class="title-text">{{ music.title }}</span>
            </div>
          </div>
          <div class="music-artist">{{ music.artist }}</div>
        </div>
        <div class="music-duration">{{ formatTime(music.duration) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUpdated } from 'vue';
import { usePlayer } from '../composables/usePlayer';

const { musicList, currentMusicIndex, isPlaying, formatTime, selectMusic } = usePlayer();

const titleRefs = ref<HTMLElement[]>([]);
const scrollStates = ref<Map<number, boolean>>(new Map());

function handleSelect(index: number) {
  selectMusic(index);
}

// 检测标题是否溢出
async function checkOverflow(index: number) {
  await nextTick();
  const titleEl = titleRefs.value[index];
  if (!titleEl) return;

  const textEl = titleEl.querySelector('.title-text') as HTMLElement;
  if (!textEl) return;

  const isOverflowing = textEl.scrollWidth > titleEl.clientWidth;
  scrollStates.value.set(index, isOverflowing);
}

// 判断是否应该滚动
function shouldScroll(index: number): boolean {
  return scrollStates.value.get(index) || false;
}

// 组件挂载后检测所有标题
onMounted(async () => {
  await nextTick();
  for (let i = 0; i < musicList.value.length; i++) {
    await checkOverflow(i);
  }
});

// 更新后重新检测
onUpdated(async () => {
  await nextTick();
  for (let i = 0; i < musicList.value.length; i++) {
    await checkOverflow(i);
  }
});
</script>

<style scoped>
.music-list {
  width: 320px;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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

.music-title-wrapper {
  overflow: hidden;
  position: relative;
}

.music-title {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.music-title .title-text {
  display: inline-block;
  white-space: nowrap;
}

/* 滚动动画 */
.music-title.scrolling .title-text {
  animation: scrollText 8s linear infinite;
  padding-right: 50px;
}

@keyframes scrollText {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-50%);
  }
  90% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
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

/* 手机竖屏 - 播放列表在上方 */
@media (max-width: 768px) and (orientation: portrait) {
  .music-list {
    width: 100%;
    height: auto;
    min-height: 180px; /* 确保最小可用高度 */
    max-height: 35vh; /* 增加 max-height 从 30vh 到 35vh */
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .list-title {
    padding: 12px 15px;
    font-size: 15px;
    flex-shrink: 0; /* 防止标题被压缩 */
  }

  .list-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 8px 10px;
    gap: 10px;
    min-height: 0; /* 允许容器正确计算高度 */
  }

  .music-item {
    flex-direction: column;
    min-width: 110px;
    max-width: 110px;
    padding: 6px;
  }

  .music-cover {
    width: 70px;
    height: 70px;
  }

  .music-info {
    margin-left: 0;
    margin-top: 6px;
    text-align: center;
    width: 100%;
    max-width: 90px;
    overflow: hidden;
  }

  .music-title-wrapper {
    width: 100%;
    max-width: 90px;
    overflow: hidden;
  }

  .music-title {
    width: 100%;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-artist {
    width: 100%;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-duration {
    display: none;
  }
}

/* 手机横屏 - 播放列表隐藏（由 App.vue 控制 display: none）*/
@media (max-width: 768px) and (orientation: landscape) {
  .music-list {
    display: none;
  }
}

/* 折叠屏竖屏 - 播放列表在上方 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
  .music-list {
    width: 100%;
    height: auto;
    min-height: 200px; /* 确保最小可用高度 */
    max-height: 30vh; /* 增加 max-height 从 25vh 到 30vh */
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .list-title {
    padding: 14px 18px;
    font-size: 16px;
    flex-shrink: 0; /* 防止标题被压缩 */
  }

  .list-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px 12px;
    gap: 12px;
    min-height: 0; /* 允许容器正确计算高度 */
  }

  .music-item {
    flex-direction: column;
    min-width: 120px;
    max-width: 120px;
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
    width: 100%;
    max-width: 100px;
    overflow: hidden;
  }

  .music-title-wrapper {
    width: 100%;
    max-width: 100px;
    overflow: hidden;
  }

  .music-title {
    width: 100%;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-artist {
    width: 100%;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-duration {
    display: none;
  }
}

/* 折叠屏横屏 - 播放列表在上方 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .music-list {
    width: 100%;
    height: auto;
    min-height: 200px; /* 确保最小可用高度 */
    max-height: 30vh; /* 增加 max-height 从 25vh 到 30vh */
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .list-title {
    padding: 14px 18px;
    font-size: 16px;
    flex-shrink: 0; /* 防止标题被压缩 */
  }

  .list-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px 12px;
    gap: 12px;
    min-height: 0; /* 允许容器正确计算高度 */
  }

  .music-item {
    flex-direction: column;
    min-width: 120px;
    max-width: 120px;
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
    width: 100%;
    max-width: 100px;
    overflow: hidden;
  }

  .music-title-wrapper {
    width: 100%;
    max-width: 100px;
    overflow: hidden;
  }

  .music-title {
    width: 100%;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-artist {
    width: 100%;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-duration {
    display: none;
  }
}

/* 平板竖屏 - 播放列表在上方 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: portrait) {
  .music-list {
    width: 100%;
    height: auto;
    min-height: 200px; /* 确保最小可用高度 */
    max-height: 30vh; /* 增加 max-height 从 25vh 到 30vh */
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .list-title {
    padding: 16px 20px;
    font-size: 17px;
    flex-shrink: 0; /* 防止标题被压缩 */
  }

  .list-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 12px 15px;
    gap: 12px;
    min-height: 0; /* 允许容器正确计算高度 */
  }

  .music-item {
    flex-direction: column;
    min-width: 130px;
    max-width: 130px;
    padding: 8px;
  }

  .music-cover {
    width: 85px;
    height: 85px;
  }

  .music-info {
    margin-left: 0;
    margin-top: 8px;
    text-align: center;
    width: 100%;
    max-width: 110px;
    overflow: hidden;
  }

  .music-title-wrapper {
    width: 100%;
    max-width: 110px;
    overflow: hidden;
  }

  .music-title {
    width: 100%;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-artist {
    width: 100%;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .music-duration {
    display: none;
  }
}

/* 平板横屏 - 播放列表在左侧 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape) {
  .music-list {
    width: 280px;
  }

  .music-cover {
    width: 44px;
    height: 44px;
  }

  .music-title {
    font-size: 13px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) and (orientation: portrait) {
  .music-list {
    min-height: 160px; /* 确保最小可用高度 */
    max-height: 45vh; /* 增加 max-height 从 40vh 到 45vh */
  }

  .music-item {
    min-width: 100px;
    max-width: 100px;
  }

  .music-cover {
    width: 60px;
    height: 60px;
  }

  .music-info {
    max-width: 80px;
  }

  .music-title-wrapper {
    max-width: 80px;
  }

  .music-title {
    max-width: 80px;
    font-size: 12px;
  }

  .music-artist {
    max-width: 80px;
    font-size: 11px;
  }
}
</style>

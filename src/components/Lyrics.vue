<template>
  <div
    class="lyrics-container"
    ref="lyricsRef"
    @wheel.prevent="onWheel"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div 
      class="lyrics-content" 
      :class="{ 'smooth-transition': !isManualScrolling }"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <div
        v-for="(line, index) in parsedLyrics"
        :key="index"
        class="lyric-line"
        :class="{
          active: index === currentLineIndex,
          past: index < currentLineIndex
        }"
        :ref="el => { if (el) lineRefs[index] = el as HTMLElement }"
      >
        {{ line.text }}
      </div>
    </div>
    <div v-if="parsedLyrics.length === 0" class="no-lyrics">
      暂无歌词
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { usePlayer } from '../composables/usePlayer';

const props = defineProps<{
  lyrics: string;
  currentTime: number;
}>();

const { parseLyrics } = usePlayer();
const lyricsRef = ref<HTMLElement | null>(null);
const lineRefs = ref<HTMLElement[]>([]);

// 手动滚动状态
const isManualScrolling = ref(false);
const manualScrollTimeout = ref<number | null>(null);

// 触摸滚动状态
const touchStartY = ref(0);
const lastTouchY = ref(0);
const isTouchScrolling = ref(false);

// 当前手动滚动偏移
const manualOffset = ref(0);

// 容器高度响应式变量
const containerHeight = ref(0);

// 使用 ResizeObserver 监听容器大小变化
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (lyricsRef.value) {
    containerHeight.value = lyricsRef.value.clientHeight;
    
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerHeight.value = entry.contentRect.height;
      }
    });
    
    resizeObserver.observe(lyricsRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const parsedLyrics = computed(() => parseLyrics(props.lyrics));

const currentLineIndex = computed(() => {
  const lyrics = parsedLyrics.value;
  if (lyrics.length === 0) return -1;

  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (props.currentTime >= lyrics[i].time) {
      return i;
    }
  }
  return -1;
});

// 计算最大滚动偏移（正值，表示可以向上滚动的最大距离）
const maxScrollOffset = computed(() => {
  if (containerHeight.value === 0 || parsedLyrics.value.length === 0) return 0;

  const totalLyricsHeight = parsedLyrics.value.length * 55;
  const diff = totalLyricsHeight - containerHeight.value;

  // 如果歌词总高度小于容器高度，不需要滚动
  if (diff <= 0) return 0;

  // 最大向上滚动距离（留出一些底部空间）
  return diff + 55;
});

// 自动滚动偏移 - 高亮歌词始终居中
const autoOffset = computed(() => {
  if (currentLineIndex.value === -1 || containerHeight.value === 0) {
    return 0;
  }

  // 获取当前高亮行的实际DOM元素
  const currentLineEl = lineRefs.value[currentLineIndex.value];
  if (!currentLineEl) return 0;

  // 获取 lyrics-content 容器（应用 transform 的父元素）
  const lyricsContent = currentLineEl.parentElement;
  if (!lyricsContent) return 0;

  // 关键修复：使用 offsetTop 而不是 getBoundingClientRect
  // offsetTop 是元素在未变换状态下相对于 offsetParent 的位置
  // getBoundingClientRect 会受到当前 transform 的影响，导致循环依赖
  const currentLineTop = currentLineEl.offsetTop; // 该行在 lyrics-content 中的原始顶部位置
  const lineHeight = currentLineEl.offsetHeight; // 该行的实际高度
  const currentLineCenter = currentLineTop + lineHeight / 2; // 该行中心位置
  const containerCenter = containerHeight.value / 2; // 容器中心

  // 需要的偏移 = 容器中心 - 当前行中心
  // 这个偏移会应用到 lyrics-content 的 transform 上
  const offset = containerCenter - currentLineCenter;

  // 调试日志
  console.log('Lyrics Centering:', {
    containerHeight: containerHeight.value,
    currentLineIndex: currentLineIndex.value,
    currentLineTop,
    lineHeight,
    currentLineCenter,
    containerCenter,
    offset
  });

  return offset;
});

// 总偏移
const offset = computed(() => {
  // 如果是自动滚动模式，直接使用autoOffset，确保高亮歌词始终在正中间
  if (!isManualScrolling.value) {
    return autoOffset.value;
  }

  // 手动滚动模式：在自动偏移基础上加上手动偏移
  const base = autoOffset.value;
  const manual = manualOffset.value;

  // 限制在合理范围内
  const maxOffset = maxScrollOffset.value;
  const minOffset = -maxOffset;

  return Math.max(minOffset, Math.min(maxOffset, base + manual));
});

// 监听当前行变化，自动滚动到居中位置（如果没有手动滚动）
watch(currentLineIndex, async (newIndex) => {
  if (isManualScrolling.value || isTouchScrolling.value) return;
  if (newIndex === -1) return;

  // 等待DOM更新
  await nextTick();

  // 确保手动偏移为0，让高亮歌词严格居中
  manualOffset.value = 0;
});

// 监听自动偏移变化，确保过渡平滑
watch(autoOffset, async () => {
  if (!isManualScrolling.value) {
    await nextTick();
    // 自动模式下，强制重置手动偏移
    manualOffset.value = 0;
  }
});

// 滚轮事件处理
function onWheel(e: WheelEvent) {
  // 滚轮向下（deltaY > 0）：应该查看更晚的歌词 → offset 减少
  // 滚轮向上（deltaY < 0）：应该查看更早的歌词 → offset 增加

  // 进入手动滚动模式
  if (!isManualScrolling.value) {
    isManualScrolling.value = true;
    manualOffset.value = 0; // 从居中位置开始偏移
  }

  // 累加滚动偏移
  manualOffset.value -= e.deltaY * 0.5;

  // 重置自动滚动计时器
  resetManualScrollTimer();
}

// 触摸开始
function onTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1) return;

  touchStartY.value = e.touches[0].clientY;
  lastTouchY.value = e.touches[0].clientY;
  isTouchScrolling.value = true;
  isManualScrolling.value = true;
}

// 触摸移动
function onTouchMove(e: TouchEvent) {
  if (!isTouchScrolling.value || e.touches.length !== 1) return;

  const currentY = e.touches[0].clientY;
  // 手指向上滑：currentY < lastY → deltaY > 0 → 应该看到更晚的歌词 → offset 减少
  // 手指向下滑：currentY > lastY → deltaY < 0 → 应该看到更早的歌词 → offset 增加
  const deltaY = lastTouchY.value - currentY;

  manualOffset.value -= deltaY;
  lastTouchY.value = currentY;

  // 限制范围
  const maxOffset = maxScrollOffset.value;
  const minOffset = -maxOffset;
  manualOffset.value = Math.max(minOffset, Math.min(maxOffset, manualOffset.value));
}

// 触摸结束
function onTouchEnd() {
  isTouchScrolling.value = false;

  // 如果触摸后停止一段时间，恢复自动滚动
  resetManualScrollTimer();
}

// 重置手动滚动计时器
function resetManualScrollTimer() {
  if (manualScrollTimeout.value) {
    clearTimeout(manualScrollTimeout.value);
  }

  manualScrollTimeout.value = window.setTimeout(() => {
    isManualScrolling.value = false;
    manualOffset.value = 0;
  }, 5000); // 5秒后恢复自动滚动
}
</script>

<style scoped>
.lyrics-container {
  height: 100%;
  min-height: 80px;
  max-height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
  padding-top: 10px; /* 顶部留一点呼吸空间 */
}

.lyrics-container:active {
  cursor: grabbing;
}

.lyrics-content {
  will-change: transform;
  position: relative; /* 确保子元素的 offsetTop 相对于此容器 */
}

.lyrics-content.smooth-transition {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.lyric-line {
  height: 55px;
  line-height: 55px;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
  font-size: 18px;
  transition: color 0.3s ease, font-size 0.3s ease, text-shadow 0.3s ease, transform 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 20px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.lyric-line.past {
  color: rgba(255, 255, 255, 0.5);
}

.lyric-line.active {
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  text-shadow: 
    0 0 20px rgba(29, 185, 84, 0.6),
    0 0 40px rgba(29, 185, 84, 0.3),
    0 2px 10px rgba(0, 0, 0, 0.3);
  transform: scale(1.05) translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  letter-spacing: 0.5px;
}

.no-lyrics {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
}

/* 手机竖屏 - 歌词在下方 */
@media (max-width: 768px) and (orientation: portrait) {
  .lyric-line {
    font-size: 17px;
    height: 50px;
    line-height: 50px;
  }

  .lyric-line.active {
    font-size: 20px;
    text-shadow:
      0 0 18px rgba(29, 185, 84, 0.6),
      0 0 36px rgba(29, 185, 84, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 手机横屏 - 歌词在右侧 */
@media (max-width: 768px) and (orientation: landscape) {
  .lyric-line {
    font-size: 15px;
    height: 45px;
    line-height: 45px;
    padding: 0 15px;
  }

  .lyric-line.active {
    font-size: 18px;
    text-shadow:
      0 0 15px rgba(29, 185, 84, 0.6),
      0 0 30px rgba(29, 185, 84, 0.3),
      0 2px 6px rgba(0, 0, 0, 0.3);
  }
}

/* 折叠屏竖屏 - 歌词在右侧 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: portrait) {
  .lyric-line {
    font-size: 17px;
    height: 50px;
    line-height: 50px;
  }

  .lyric-line.active {
    font-size: 20px;
    text-shadow:
      0 0 18px rgba(29, 185, 84, 0.6),
      0 0 36px rgba(29, 185, 84, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 折叠屏横屏 - 歌词在右侧 */
@media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
  .lyric-line {
    font-size: 17px;
    height: 50px;
    line-height: 50px;
  }

  .lyric-line.active {
    font-size: 20px;
    text-shadow:
      0 0 18px rgba(29, 185, 84, 0.6),
      0 0 36px rgba(29, 185, 84, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 平板竖屏 - 歌词在右侧 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: portrait) {
  .lyric-line {
    font-size: 18px;
    height: 52px;
    line-height: 52px;
  }

  .lyric-line.active {
    font-size: 21px;
    text-shadow:
      0 0 18px rgba(29, 185, 84, 0.6),
      0 0 36px rgba(29, 185, 84, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 平板横屏和桌面 - 歌词在右侧 */
@media (min-width: 1025px) and (max-width: 1366px) and (orientation: landscape),
       (min-width: 1367px) {
  .lyric-line {
    font-size: 18px;
    height: 55px;
    line-height: 55px;
  }

  .lyric-line.active {
    font-size: 22px;
    text-shadow:
      0 0 20px rgba(29, 185, 84, 0.6),
      0 0 40px rgba(29, 185, 84, 0.3),
      0 2px 10px rgba(0, 0, 0, 0.3);
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .lyric-line {
    font-size: 14px;
    height: 40px;
    line-height: 40px;
  }

  .lyric-line.active {
    font-size: 16px;
    text-shadow:
      0 0 12px rgba(29, 185, 84, 0.6),
      0 0 24px rgba(29, 185, 84, 0.3),
      0 2px 5px rgba(0, 0, 0, 0.3);
  }
}
</style>

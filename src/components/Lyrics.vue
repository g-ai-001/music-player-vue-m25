<template>
  <div
    class="lyrics-container"
    ref="lyricsRef"
    @wheel.prevent="onWheel"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="lyrics-content" :style="{ transform: `translateY(${offset}px)` }">
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
import { computed, ref, watch, nextTick } from 'vue';
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
  if (!lyricsRef.value || parsedLyrics.value.length === 0) return 0;

  const containerHeight = lyricsRef.value.clientHeight;
  const totalLyricsHeight = parsedLyrics.value.length * 55;
  const diff = totalLyricsHeight - containerHeight;

  // 如果歌词总高度小于容器高度，不需要滚动
  if (diff <= 0) return 0;

  // 最大向上滚动距离（留出一些底部空间）
  return diff + 55;
});

// 自动滚动偏移 - 高亮歌词居中
const autoOffset = computed(() => {
  if (currentLineIndex.value === -1 || !lyricsRef.value) {
    return 0;
  }

  const lineHeight = 55;
  const containerHeight = lyricsRef.value.clientHeight;

  // 计算将当前行居中需要的偏移
  // 当前行位于 currentLineIndex * lineHeight
  // 容器中心在 containerHeight / 2
  // 所以需要将 currentLineIndex * lineHeight 移动到 containerHeight / 2
  const targetPosition = containerHeight / 2 - lineHeight / 2;
  const currentPosition = currentLineIndex.value * lineHeight;

  return targetPosition - currentPosition;
});

// 总偏移 = 自动偏移 + 手动偏移
const offset = computed(() => {
  const base = autoOffset.value;
  const manual = manualOffset.value;

  // 限制在合理范围内，但需要至少能容纳autoOffset
  const scrollableOffset = maxScrollOffset.value;
  // 确保maxOffset至少能容纳autoOffset，这样歌词才能居中
  const maxOffset = Math.max(scrollableOffset, Math.abs(base));
  const minOffset = -maxOffset; // 允许向下滚动一点

  // 如果是自动滚动模式，重置手动偏移
  if (!isManualScrolling.value) {
    return Math.max(minOffset, Math.min(maxOffset, base));
  }

  // 手动滚动模式
  return Math.max(minOffset, Math.min(maxOffset, base + manual));
});

// 监听当前行变化，自动滚动到居中位置（如果没有手动滚动）
watch(currentLineIndex, async (newIndex) => {
  if (isManualScrolling.value || isTouchScrolling.value) return;
  if (newIndex === -1) return;

  // 等待DOM更新
  await nextTick();

  // 重置手动偏移
  manualOffset.value = 0;
});

// 滚轮事件处理
function onWheel(e: WheelEvent) {
  // deltaY > 0 表示向下滚动（滚轮向下），此时歌词应该向上移动（offset减少，显示更早的歌词）
  // deltaY < 0 表示向上滚动（滚轮向上），此时歌词应该向下移动（offset增加，显示更晚的歌词）
  // 因此需要用 -e.deltaY 来修正滚动方向
  if (isManualScrolling.value) {
    // 手动模式下，累加滚动
    manualOffset.value -= e.deltaY * 0.5;
  } else {
    // 自动模式下，切换到手动模式
    isManualScrolling.value = true;
    manualOffset.value = offset.value - autoOffset.value - e.deltaY * 0.5;
  }

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
  const deltaY = lastTouchY.value - currentY;

  manualOffset.value += deltaY;
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
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

.lyrics-container:active {
  cursor: grabbing;
}

.lyrics-content {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
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
}

.lyric-line.past {
  color: rgba(255, 255, 255, 0.5);
}

.lyric-line.active {
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  text-shadow: 0 0 30px rgba(29, 185, 84, 0.5), 0 0 60px rgba(29, 185, 84, 0.25);
  transform: scale(1.03);
}

.no-lyrics {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
}

@media (max-width: 1024px) {
  .lyric-line {
    font-size: 17px;
    height: 50px;
    line-height: 50px;
  }

  .lyric-line.active {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .lyric-line {
    font-size: 15px;
    height: 45px;
    line-height: 45px;
    padding: 0 15px;
  }

  .lyric-line.active {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .lyric-line {
    font-size: 14px;
    height: 40px;
    line-height: 40px;
  }

  .lyric-line.active {
    font-size: 16px;
  }
}
</style>

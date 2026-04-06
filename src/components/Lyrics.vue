<template>
  <div class="lyrics-container" ref="lyricsRef">
    <div class="lyrics-content" :style="{ transform: `translateY(${offset}px)` }">
      <div
        v-for="(line, index) in parsedLyrics"
        :key="index"
        class="lyric-line"
        :class="{
          active: index === currentLineIndex,
          past: index < currentLineIndex
        }"
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
import { computed, ref } from 'vue';
import { usePlayer } from '../composables/usePlayer';

const props = defineProps<{
  lyrics: string;
  currentTime: number;
}>();

const { parseLyrics } = usePlayer();
const lyricsRef = ref<HTMLElement | null>(null);

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

// 使用 requestAnimationFrame 优化滚动性能
const offset = computed(() => {
  if (currentLineIndex.value === -1) {
    return 0;
  }
  const lineHeight = 55;
  const containerHeight = lyricsRef.value?.clientHeight || 400;
  const targetOffset = containerHeight / 2 - (currentLineIndex.value + 1) * lineHeight;
  return Math.max(0, targetOffset);
});
</script>

<style scoped>
.lyrics-container {
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
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

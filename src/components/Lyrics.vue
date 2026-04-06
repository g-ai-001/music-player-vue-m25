<template>
  <div class="lyrics-container" ref="lyricsRef">
    <div class="lyrics-content" :style="{ transform: `translateY(${offset}px)` }">
      <div
        v-for="(line, index) in parsedLyrics"
        :key="index"
        class="lyric-line"
        :class="{ active: index === currentLineIndex }"
      >
        {{ line.text }}
      </div>
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
  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (props.currentTime >= parsedLyrics.value[i].time) {
      return i;
    }
  }
  return -1;
});

const offset = computed(() => {
  if (currentLineIndex.value === -1) {
    return 0;
  }
  const lineHeight = 50;
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
}

.lyrics-content {
  transition: transform 0.3s ease-out;
}

.lyric-line {
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 20px;
}

.lyric-line.active {
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  text-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

@media (max-width: 768px) {
  .lyric-line {
    font-size: 16px;
    height: 44px;
    line-height: 44px;
  }

  .lyric-line.active {
    font-size: 18px;
  }
}
</style>
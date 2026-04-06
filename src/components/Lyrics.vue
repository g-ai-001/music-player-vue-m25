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
}

.lyrics-content {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.lyric-line {
  height: 55px;
  line-height: 55px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 18px;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 20px;
}

.lyric-line.past {
  color: rgba(255, 255, 255, 0.6);
}

.lyric-line.active {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 30px rgba(29, 185, 84, 0.6), 0 0 60px rgba(29, 185, 84, 0.3);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .lyric-line {
    font-size: 16px;
    height: 48px;
    line-height: 48px;
  }

  .lyric-line.active {
    font-size: 20px;
  }
}
</style>
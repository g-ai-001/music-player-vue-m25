<template>
  <div class="progress-wrapper">
    <span class="time current">{{ formatTime(currentTime) }}</span>
    <div class="progress-track" @click="handleClick" ref="trackRef">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      <div class="progress-thumb" :style="{ left: `${progress}%` }"></div>
    </div>
    <span class="time duration">{{ formatTime(duration) }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlayer } from '../composables/usePlayer';

const props = defineProps<{
  currentTime: number;
  duration: number;
}>();

const emit = defineEmits<{
  (e: 'seek', time: number): void;
}>();

const { formatTime } = usePlayer();
const trackRef = ref<HTMLElement | null>(null);

const progress = computed(() => {
  if (props.duration === 0) return 0;
  return (props.currentTime / props.duration) * 100;
});

function handleClick(event: MouseEvent) {
  if (!trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const time = percent * props.duration;
  emit('seek', Math.max(0, Math.min(time, props.duration)));
}
</script>

<style scoped>
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  min-width: 45px;
  font-variant-numeric: tabular-nums;
}

.time.current {
  text-align: right;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: height 0.2s ease;
}

.progress-track:hover {
  height: 6px;
}

.progress-track:hover .progress-thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.progress-fill {
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  pointer-events: none;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .time {
    font-size: 12px;
    min-width: 40px;
  }

  .progress-track {
    height: 3px;
  }

  .progress-track:hover {
    height: 4px;
  }
}
</style>
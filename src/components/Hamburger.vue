<template>
  <div
    :class="{ 'hamburger': true, 'is-active': isActive }"
    @click="toggleClick"
  >
    <span class="line"></span>
    <span class="line"></span>
    <span class="line"></span>
  </div>
</template>

<script setup>
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-click'])

const toggleClick = () => {
  emit('toggle-click')
}
</script>

<style lang="scss" scoped>
.hamburger {
  width: 24px;
  height: 18px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  .line {
    width: 100%;
    height: 2px;
    background-color: #fff;
    transition: all 0.3s ease;
  }
}

.is-active {
  .line:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }

  .line:nth-child(2) {
    opacity: 0;
  }

  .line:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }
}
</style>

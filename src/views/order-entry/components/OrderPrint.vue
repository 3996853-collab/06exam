<template>
  <div class="order-print">
    <p>订单打印组件</p>
  </div>
</template>

<script setup>
const props = defineProps({
  orderData: {
    type: Object,
    default: () => ({})
  },
  orderNo: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.order-print {
  display: none;
}
</style>

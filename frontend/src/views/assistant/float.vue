<template>
  <div class="float-page">
    <img src="/business.png">
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useSettingStore } from '@/store/setting'
import { useRoute } from 'vue-router'
const settingStore = useSettingStore()
const route = useRoute()
const isAdnvaced = computed(() => {
  return route.path.includes('advanced')
})
const assistantId = computed(() => {
  return isAdnvaced.value ? settingStore.getAdvancedAssistantId : settingStore.getBaseAssistantId
})
const sqlbotDomain = computed(() => {
  return settingStore.getDomain
})
const init = () => {
  const script = document.createElement('script');
  script.defer = true;
  script.async = true;
  script.src = `${sqlbotDomain.value}/assistant.js?id=${assistantId.value}`;
  script.id = `sqlbot-assistant-float-script-${assistantId.value}`;
  document.head.appendChild(script);
}

onMounted(() => {
  init()
})
onUnmounted(() => {
  // remove some dom and reset some js object
  const script = document.getElementById(`sqlbot-assistant-float-script-${assistantId.value}`)
  if (script) {
    document.head.removeChild(script)
  }
})
</script>

<style scoped>
.float-page {
  width: 100%;
  height: 100%;
}

.float-page img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
<template>
  <div class="float-page" :class="dynamicClass">
    <img src="/business.png">
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useSettingStore } from '@/store/setting'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'

const settingStore = useSettingStore()
const route = useRoute()
const userStore = useUserStore()
const isAdvanced = computed(() => {
  return route.path.includes('advanced')
})
const dynamicClass = computed(() => isAdvanced.value ? 'advanced-float-page' : 'base-float-page')
const assistantId = computed(() => {
  return isAdvanced.value ? settingStore.getAdvancedAssistantId : settingStore.getBaseAssistantId
})
const sqlbotDomain = computed(() => {
  return settingStore.getDomain
})
const online = computed(() => userStore.getOnline)
const userFlag = computed(() => {
  if (!online.value) {
    return null
  }
  const uid = userStore.getUid
  return isAdvanced.value ? uid + 1 : uid
})
const init = () => {
  let srcUrl = `${sqlbotDomain.value}/assistant.js?id=${assistantId.value}`;
  if (online.value) {
    srcUrl += `&online=${online.value}&userFlag=${userFlag.value}`
  }
  const script = document.createElement('script');
  script.defer = true;
  script.async = true;
  script.src = srcUrl
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
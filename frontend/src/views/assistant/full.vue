<template>
  <div class="full-page"/>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useSettingStore } from '@/store/setting'
import { useRoute } from 'vue-router'
declare global {
  interface Window {
    sqlbot_embedded_handler?: {
      mounted: (selector: string, config: any) => void;
    };
  }
}
const route = useRoute()
const settingStore = useSettingStore()

const isAdvanced = computed(() => {
  return route.path.includes('advanced')
})
const assistantId = computed(() => {
  return isAdvanced.value ? settingStore.getAdvancedAssistantId : settingStore.getBaseAssistantId
})
const sqlbotDomain = computed(() => {
  return settingStore.getDomain
})
const init = () => {
  (function(){
    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = `${sqlbotDomain.value}/xpack_static/sqlbot-embedded-dynamic.umd.js?t=${Date.now()}`;
    document.head.appendChild(script);
  })()
  let sqlbot_embedded_timer = setInterval(() => {
    if (window.sqlbot_embedded_handler?.mounted) {
      window.sqlbot_embedded_handler.mounted('.full-page', { "embeddedId": assistantId.value })
      clearInterval(sqlbot_embedded_timer)
    }
  }, 1000)
  
}

onMounted(() => {
  init()
})
onUnmounted(() => {
  // remove some dom and reset some js object
  if (window.sqlbot_embedded_handler) {
    delete window.sqlbot_embedded_handler
    const containerArray = document.getElementsByClassName('full-page')
    if (containerArray?.length) {
      const container = containerArray[0]
      container.childNodes?.forEach(child => {
        container.removeChild(child)
      })
    }
  }
})
</script>

<style scoped>
.full-page {
  width: 100%;
  height: 100%;
}
</style>
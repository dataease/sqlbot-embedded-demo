<template>
  <div class="full-page" :class="dynamicClass"/>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useSettingStore } from '@/store/setting'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
declare global {
  interface Window {
    sqlbot_embedded_handler?: {
      mounted: (selector: string, config: any) => void;
    };
  }
}
const route = useRoute()
const settingStore = useSettingStore()
const userStore = useUserStore()

const isAdvanced = computed(() => {
  return route.path.includes('advanced')
})
const dynamicClass = computed(() => isAdvanced.value ? 'advanced-full-page' : 'base-full-page')
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
  const script = document.createElement('script');
  script.defer = true;
  script.async = true;
  script.src = `${sqlbotDomain.value}/xpack_static/sqlbot-embedded-dynamic.umd.js?t=${Date.now()}`;
  document.head.appendChild(script);
  const param = {
    "embeddedId": assistantId.value,
    "online": online.value
  } as any
  if (online.value) {
    param['userFlag'] = userFlag.value
  }
  let sqlbot_embedded_timer = setInterval(() => {
    if (window.sqlbot_embedded_handler?.mounted) {
      window.sqlbot_embedded_handler.mounted(`.${dynamicClass.value}`, param)
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
    const containerArray = document.getElementsByClassName(`.${dynamicClass.value}`)
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
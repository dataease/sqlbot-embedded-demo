<template>
  <div class="full-page advanced-full-page"/>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue';
import { useSettingStore } from '@/store/setting'
import { useUserStore } from '@/store/user'
import { isArray } from 'element-plus/es/utils/types.mjs';

const settingStore = useSettingStore()
const userStore = useUserStore()


const assistantId = computed(() => settingStore.getAdvancedAssistantId)
const sqlbotDomain = computed(() => settingStore.getDomain)
const online = computed(() => userStore.getOnline)
const userFlag = computed(() => {
  if (!online.value) {
    return null
  }
  const uid = userStore.getUid
  return uid + 1
})
const init = () => {
  const js_name_prefix = 'xpack_static/sqlbot-embedded-dynamic.umd.js'
  const existScriptDom = document.querySelector(`script[src*="/${js_name_prefix}"]`)
  if (!existScriptDom) {
    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = `${sqlbotDomain.value}/xpack_static/sqlbot-embedded-dynamic.umd.js?t=${Date.now()}`;
    document.head.appendChild(script);
  }
  const param = {
    "embeddedId": assistantId.value,
    "online": online.value
  } as any
  if (online.value) {
    param['userFlag'] = userFlag.value
  }
  let sqlbot_embedded_timer = setInterval(() => {
    if (window.sqlbot_embedded_handler?.mounted) {
      window.sqlbot_embedded_handler.mounted(`.advanced-full-page`, param)
      clearInterval(sqlbot_embedded_timer)
    }
  }, 1000)
  
}

onMounted(() => {
  init()
})
onBeforeUnmount(() => {
  // remove some dom and reset some js object
  if (window.sqlbot_embedded_handler?.destroy) {
    window.sqlbot_embedded_handler.destroy(assistantId.value, true)
  } else {
    // programe never run here, just test code!
    const dom = document.getElementById(`sqlbot-embedded-chat-iframe-${assistantId.value}`)
    if (dom) {
      dom.parentNode?.removeChild(dom)
    }
    if (window.sqlbot_embedded_handler) {
      delete window.sqlbot_embedded_handler
    }
    const js_name_prefix = 'xpack_static/sqlbot-embedded-dynamic.umd.js'
    const existScriptDom = document.querySelector(`script[src*="/${js_name_prefix}"]`)
    if (existScriptDom) {
      if (isArray(existScriptDom)) {
        existScriptDom.forEach(ele => ele.parentNode?.removeChild(ele))
      } else {
        existScriptDom.parentNode?.removeChild(existScriptDom)
      }
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
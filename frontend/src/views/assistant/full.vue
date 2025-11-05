<template>
  <div class="full-page base-full-page">
    <Inactivate :font-color="inactivateFontColor" @show-history="showHistory" @new-chat="newChat" class="inactivate-container"/>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref } from 'vue';
import { useSettingStore } from '@/store/setting'
import { useUserStore } from '@/store/user'
import { isArray } from 'element-plus/es/utils/types.mjs';
import Inactivate from '@/components/Inactivate.vue'

const inactivateFontColor = ref('#FFFFFF')
const settingStore = useSettingStore()
const userStore = useUserStore()
const historyShow = ref(true)
const assistantId = computed(() => settingStore.getBaseAssistantId)
const sqlbotDomain = computed(() => settingStore.getDomain)
const online = computed(() => userStore.getOnline)
const userFlag = computed(() => {
  if (!online.value) {
    return null
  }
  return userStore.getUid
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
      window.sqlbot_embedded_handler.mounted(`.base-full-page`, param)
      clearInterval(sqlbot_embedded_timer)
    }
  }, 1000)
  
}
const newChat = (param?: any) => {
  const handler = window.sqlbot_embedded_handler
  if (handler) {
    handler.createConversation(assistantId.value, param)
  }
}
const showHistory = () => {
  historyShow.value = !historyShow.value
  const handler = window.sqlbot_embedded_handler
  if (handler) {
    handler.setHistory(assistantId.value, historyShow.value)
  }
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
.inactivate-container {
  background-color: #000;
  opacity: 0.8;
}
@media (max-width: 768px) {
  .inactivate-container {
    display: none;
  }
}
</style>
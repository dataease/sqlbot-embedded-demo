<template>
  <div class="float-page base-float-page">
    <Inactivate :font-color="inactivateFontColor" @show-history="showHistory" @new-chat="newChat" class="inactivate-container" />
    <img src="/business.png">
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useSettingStore } from '@/store/setting'
import { useUserStore } from '@/store/user'
import Inactivate from '@/components/Inactivate.vue'

const historyShow = ref(true)
const settingStore = useSettingStore()
const userStore = useUserStore()
const inactivateFontColor = ref('#000000')

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
const newChat = (param?: any) => {
  const handler = window.sqlbot_assistant_handler
  if (handler && handler[assistantId.value]) {
    handler[assistantId.value].createConversation(param)
  }
}
const showHistory = () => {
  historyShow.value = !historyShow.value
  const handler = window.sqlbot_assistant_handler
  if (handler && handler[assistantId.value]) {
    handler[assistantId.value].setHistory(historyShow.value)
  }
}

onMounted(() => {
  init()
})
onBeforeUnmount(() => {
  const handler = window.sqlbot_assistant_handler
  if (handler && handler[assistantId.value]) {
    handler[assistantId.value].destroy()
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
.inactivate-container {
  background-color: azure;
  opacity: 0.8;
}
@media (max-width: 768px) {
  .inactivate-container {
    display: none;
  }
}
</style>
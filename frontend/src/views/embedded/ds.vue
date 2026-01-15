<template>
  <div v-loading="loading" class="embedded-full-page"/>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref } from 'vue';
import { useSettingStore } from '@/store/setting'
import { isArray } from 'element-plus/es/utils/types.mjs';
import { EmbeddedTokenApi } from '@/api/token'

const settingStore = useSettingStore()

const sqpbotAppId = computed(() => settingStore.getEmbeddedAppId)
const sqlbotDomain = computed(() => settingStore.getDomain)

const loading = ref(true)

const init = async () => {
  const js_name_prefix = 'xpack_static/sqlbot-embedded-dynamic.umd.js'
  const existScriptDom = document.querySelector(`script[src*="/${js_name_prefix}"]`)
  if (!existScriptDom) {
    const script = document.createElement('script');
    script.defer = true;
    script.async = true;
    script.src = `${sqlbotDomain.value}/xpack_static/sqlbot-embedded-dynamic.umd.js?t=${Date.now()}`;
    document.head.appendChild(script);
  }
  
  //仅作 demo 展示，生产环境请务必使用后端 token；固定 admin 因为 sqlbot 中一定有 admin，生产环境中请先同步用户，然后可使用其它账号
  /* const token = await generateJWT({ appId: sqpbotAppId.value, account: 'admin' }, sqpbotAppSecret.value) */

  const res = await EmbeddedTokenApi.generage()
  const token = res.data
  let sqlbot_embedded_timer = setInterval(() => {
    if (window.sqlbot_embedded_handler?.mounted) {
      window.sqlbot_embedded_handler.mounted('.embedded-full-page', { "appId": sqpbotAppId.value, busiFlag: 'ds', token })
      clearInterval(sqlbot_embedded_timer)
      setTimeout(() => {
        loading.value = false
      }, 1000)
    }
  }, 1000)
  
}

onMounted(async () => {
  await init()
})
onBeforeUnmount(() => {
  // remove some dom and reset some js object
  if (window.sqlbot_embedded_handler?.destroy) {
    window.sqlbot_embedded_handler.destroy(sqpbotAppId.value, true)
  } else {
    // programe never run here, just test code!
    const dom = document.getElementById(`sqlbot-embedded-chat-iframe-${sqpbotAppId.value}`)
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
.embedded-full-page {
  width: 100%;
  height: 100%;
}
</style>
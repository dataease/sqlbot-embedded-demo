<template>
  <div class="embedded-full-page"/>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useSettingStore } from '@/store/setting'
declare global {
  interface Window {
    sqlbot_embedded_handler?: {
      mounted: (selector: string, config: any) => void;
    };
  }
}
const settingStore = useSettingStore()

const sqpbotAppId = computed(() => settingStore.getEmbeddedAppId)
const sqpbotAppSecret = computed(() => settingStore.getEmbeddedAppSecret)
const sqlbotDomain = computed(() => {
  return settingStore.getDomain
})

async function generateJWT(payload: object, secret: string, expiresIn?: number): Promise<string> {
  const payloadWithExp = {...payload} as any;
  
  if (expiresIn) {
    payloadWithExp.exp = Math.floor(Date.now() / 1000) + expiresIn;
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  const encodedPayload = btoa(JSON.stringify(payloadWithExp))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

const init = async () => {
  const script = document.createElement('script');
  script.defer = true;
  script.async = true;
  script.src = `${sqlbotDomain.value}/xpack_static/sqlbot-embedded-dynamic.umd.js?t=${Date.now()}`;
  document.head.appendChild(script);
  
  //仅作 demo 展示，生产环境请务必使用后端 token；固定 admin 因为 sqlbot 中一定有 admin，生产环境中请先同步用户，然后可使用其它账号
  const token = await generateJWT({ appId: sqpbotAppId.value, account: 'admin' }, sqpbotAppSecret.value)
  let sqlbot_embedded_timer = setInterval(() => {
    if (window.sqlbot_embedded_handler?.mounted) {
      window.sqlbot_embedded_handler.mounted('.embedded-full-page', { "appId": sqpbotAppId.value, token })
      clearInterval(sqlbot_embedded_timer)
    }
  }, 1000)
  
}

onMounted(async () => {
  await init()
})
onUnmounted(() => {
  // remove some dom and reset some js object
  if (window.sqlbot_embedded_handler) {
    delete window.sqlbot_embedded_handler
    const containerArray = document.getElementsByClassName('embedded-full-page')
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
.embedded-full-page {
  width: 100%;
  height: 100%;
}
</style>
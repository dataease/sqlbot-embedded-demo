import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '../components/Layout.vue'
import Setting from '../views/setting/index.vue'
import FloatPage from '../views/assistant/float.vue'
import FullPage from '../views/assistant/full.vue'
import EmbeddedPage from '../views/embedded/index.vue'
import { useUserStore } from '@/store/user'
import { useSettingStore } from '@/store/setting'
const userStore = useUserStore()
const settingStore = useSettingStore()
// 基础路由
const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/setting'
  },
  {
    path: '/setting',
    component: Layout,
    meta: {
      title: '系统设置',
      icon: 'Setting'
    },
    children: [
      {
        path: '',
        name: 'setting',
        component: Setting
      }
    ]
  }
]

// 动态路由配置
const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/assistant',
    component: Layout,
    meta: {
      title: '基础小助手',
      icon: 'DataLine',
      requireBaseAssistant: true // 需要基础助手ID
    },
    children: [
      {
        path: 'float',
        name: 'assistantFloat',
        meta: {
          title: '浮窗嵌入'
        },
        component: FloatPage
      },
      {
        path: 'full',
        name: 'assistantFull',
        meta: {
          title: '全屏嵌入'
        },
        component: FullPage
      }
    ]
  },
  {
    path: '/advanced',
    component: Layout,
    meta: {
      title: '高级小助手',
      icon: 'DataLine',
      requireAdvancedAssistant: true,
      requireOnline: true
    },
    children: [
      {
        path: 'float',
        name: 'advancedFloat',
        meta: {
          title: '浮窗嵌入'
        },
        component: FloatPage
      },
      {
        path: 'full',
        name: 'advancedFull',
        meta: {
          title: '全屏嵌入'
        },
        component: FullPage
      }
    ]
  },
  {
    path: '/embedded',
    meta: {
      title: '页面嵌入',
      icon: 'House',
      requireEmbedded: true, // 需要嵌入式应用配置
      requireOnline: true
    },
    component: Layout,
    children: [
      {
        path: '',
        name: 'embedded',
        component: EmbeddedPage
      }
    ]
  }
]

// 过滤动态路由的函数
const filterAsyncRoutes = (routes: RouteRecordRaw[]) => {
  return routes.filter(route => {
    if (route.meta?.requireBaseAssistant && !settingStore.getBaseAssistantId) {
      return false
    }
    if (route.meta?.requireAdvancedAssistant && !settingStore.getAdvancedAssistantId) {
      return false
    }
    if (route.meta?.requireOnline && !userStore.getOnline) {
      return false
    }
    if (route.meta?.requireEmbedded && (!settingStore.getEmbeddedAppId || !settingStore.getEmbeddedAppSecret)) {
      return false
    }
    return true
  })
}



const router = createRouter({
  history: createWebHashHistory(),
  routes: baseRoutes
})

// 动态添加路由的函数
const setupRouter = async () => {
  userStore.init()
  if (!settingStore.getLoaded) {
    await settingStore.init()
    const accessRoutes = filterAsyncRoutes(asyncRoutes)
    accessRoutes.forEach(route => {
      router.addRoute(route)
    })
  }
}

const isValidRoute = (path: string) => {
  const routerList = router.getRoutes()
  return routerList.some(item => item.path === path)
}
router.beforeEach(async (to, _from, next) => {
  if (!settingStore.getLoaded) {
    await setupRouter()
    next({ ...to, replace: true })
  } else {
    isValidRoute(to.path) && next() || next('/')
  }
})

export default router
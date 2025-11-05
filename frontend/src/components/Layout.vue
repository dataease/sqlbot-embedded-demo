<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute, type RouteRecordRaw } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import LoginPage from '../views/login/index.vue' 


const isMobile = computed(() => {
  return window.innerWidth <= 768
})
const userStore = useUserStore()

const router = useRouter()
const route = useRoute()
const activeIndex = ref(route.path)

const dialogFormVisible = ref(false)

const online = computed(() => userStore.getOnline)
const userName = computed(() => userStore.getName)
const roleName = computed(() => userStore.getRole)
const menuRoutes = computed(() => {
  const routes = router.getRoutes()
  return routes.filter((route: RouteRecordRaw) => {
    const component = route.components?.default as any
    return route.meta && route.path !== '/' && component?.__name === 'Layout'
  })
})

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      ElMessage.success('已退出登录')
    } catch {
      // 用户取消操作
    }
  }
  if (command === 'login') {
    dialogFormVisible.value = true
  }
}

// 添加移动端菜单滚动处理
const handleMenuScroll = (e: WheelEvent) => {
  if (window.innerWidth <= 768) {
    const menu = e.currentTarget as HTMLElement
    menu.scrollLeft += e.deltaY
    e.preventDefault()
  }
}
</script>

<template>
  <div class="layout-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">
            <img src="/logo.png" alt="Logo" />
            <h1>嵌入式 Demo 系统</h1>
          </div>
          <div class="menu-section">
            <el-menu
              mode="horizontal"
              :default-active="activeIndex"
              class="main-menu"
              background-color="#ffffff"
              text-color="#303133"
              active-text-color="#409EFF"
              router
              @wheel="handleMenuScroll"
            >
               <template v-for="route in menuRoutes" :key="route.path">
                <!-- 有子路由的菜单项 -->
                <el-sub-menu v-if="route.children && route.children.length > 1" :index="route.path">
                  <template #title>
                    <el-icon v-if="route.meta?.icon">
                      <component :is="route.meta.icon" />
                    </el-icon>
                    {{ route.meta?.title }}
                  </template>
                  <el-menu-item 
                    v-for="child in route.children" 
                    :key="route.path + '/' + child.path"
                    :index="route.path + '/' + child.path"
                  >
                    {{ child.meta?.title }}
                  </el-menu-item>
                </el-sub-menu>
                
                <!-- 没有子路由或只有一个子路由的菜单项 -->
                <el-menu-item 
                  v-else 
                  :index="route.path"
                >
                  <el-icon v-if="route.meta?.icon">
                    <component :is="route.meta.icon" />
                  </el-icon>
                  {{ route.meta?.title }}
                </el-menu-item>
              </template>
              
            </el-menu>
          </div>
          <div class="user-section">
            <el-dropdown @command="handleCommand" trigger="click">
              <div class="user-info">
                <el-avatar 
                  :size="36" 
                  src="/user.png"
                  class="user-avatar" 
                />
                <span class="username">{{ userName || '游客' }}</span>
                <el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="online">
                    <el-icon><User /></el-icon>
                    <span>{{ `角色[${roleName}]` }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="online" divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                  <el-dropdown-item v-else command="login">
                    <el-icon><SwitchButton /></el-icon>登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <div class="main-content">
          <router-view :key="$route.fullPath"/>
        </div>
      </el-main>
    </el-container>

    <el-dialog v-model="dialogFormVisible" title="" :width="isMobile ? '90%' : '500px'">
      <login-page v-if="dialogFormVisible" />
    </el-dialog>
  </div>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-container {
  height: 100%;
}

.el-header {
  height: 60px !important;
  padding: 0;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 48px;
}

.logo img {
  height: 32px;
  width: auto;
  margin-right: 12px;
}

.logo h1 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.menu-section {
  flex: 1;
}

.main-menu {
  border-bottom: none !important;
}

.el-menu-item {
  font-size: 14px;
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
}

.el-menu-item .el-icon {
  margin-right: 4px;
  font-size: 16px;
}

.user-section {
  margin-right: 48px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
}

.el-main {
  height: calc(100vh - 60px);
  padding: 24px;
  overflow-y: auto;
}

.main-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
  overflow: hidden;
  /* height: calc(100% - 48px);
  padding: 24px; */
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

/* 菜单激活状态优化 */
.el-menu-item.is-active {
  font-weight: 500;
}

/* 移动端适配样式 */
@media (max-width: 768px) {
  .el-container {
    height: 100vh;
  }
  .header-content {
    padding: 0 16px;
    flex-wrap: wrap; /* 允许内容换行 */
  }
  
  .logo h1 {
    display: none;
  }
  
  .menu-section {
    flex: 1 0 100%; /* 在移动端时菜单占据整行 */
    order: 2; /* 调整显示顺序，使菜单显示在logo和用户信息下方 */
    overflow-x: auto; /* 允许水平滚动 */
    -webkit-overflow-scrolling: touch; /* 增加 iOS 滚动惯性 */
  }
  
  .main-menu {
    white-space: nowrap; /* 防止菜单项换行 */
    overflow-x: auto; /* 允许水平滚动 */
    padding-bottom: 0px; /* 添加底部padding以显示滚动条 */
  }
  
  .user-section {
    margin-right: 2rem;
    margin-left: auto;
  }
  
  .username {
    display: none;
  }
  
  .el-header {
    height: auto !important; /* 允许header高度自适应 */
    min-height: 60px;
  }
  
  /* 隐藏滚动条但保留功能 */
  .main-menu::-webkit-scrollbar {
    display: none;
  }
  
  .main-menu {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* 调整菜单项样式 */
  .el-menu-item {
    padding: 0 12px;
  }
  
  /* 调整子菜单样式 */
  :deep(.el-sub-menu__title) {
    padding: 0 12px;
  }
}

/* 修改主内容区域的样式 */
.el-main {
  height: calc(100vh - 60px);
  padding: 24px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .el-main {
    padding: 16px;
    height: calc(100vh - var(--el-header-height, auto));
  }
  
  .main-content {
    height: 100%;
    padding: 0px;
  }
}
</style>
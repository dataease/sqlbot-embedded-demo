<template>
  <div class="inactivate-div">
    <el-dropdown @command="handleCommand" trigger="click">
      <div class="inactivate-button el-dropdown-link" :style="{ color: fontColor }">
        API 功能
        <img class="api-img" src="/api.png" alt="inactivate"></img>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="showHistory">历史记录(显/隐)</el-dropdown-item>
          <el-dropdown-item command="newChat" divided>新建对话</el-dropdown-item>
          <li class="el-dropdown-menu__item lang-trigger">
            <el-dropdown trigger="click" placement="left-start" @command="handleLangSelect">
              <div class="lang-trigger-content">
                选择语言
                <el-icon class="lang-arrow"><arrow-right /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="lang in langOptions"
                    :key="lang.value"
                    :command="lang.value"
                    :class="{ 'is-active': selectedLang === lang.value }"
                    @click.stop
                  >
                    {{ lang.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

defineProps({
  fontColor: {
    type: String,
    default: '#000000'
  }
})

const emit = defineEmits(['showHistory', 'newChat', 'languageChange'])

const langOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁体中文', value: 'zh-TW' },
  { label: 'English', value: 'en' },
  { label: '한국어', value: 'ko-KR' },
]

const selectedLang = ref('zh-CN')

const handleLangSelect = (lang: string) => {
  selectedLang.value = lang
  emit('languageChange', lang)
}

const handleCommand = (command: string) => {
  if (command === 'showHistory') {
    emit('showHistory')
  } else if (command === 'newChat') {
    emit('newChat')
  }
}
</script>

<style scoped>
.inactivate-div {
  position: absolute;
  right: 32px;
  top: 92px;
  height: auto;
  padding: 8px 16px;
  display: flex;
  border-radius: 4px;
}
.inactivate-button {
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}
.api-img {
  width: 24px;
  height: 24px;
  margin: 0 4px;
}

:deep(.el-dropdown-menu) {
  width: auto;
  min-width: auto;
}

/* 语言触发器 */
.lang-trigger {
  position: relative;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.lang-trigger-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.lang-arrow {
  margin-left: 8px;
  font-size: 12px;
}
</style>

<style>
/* 内层 dropdown 选中态（teleport 后 scoped 无法穿透） */
.el-dropdown-menu .el-dropdown-menu__item.is-active {
  color: var(--el-color-primary, #409eff);
  font-weight: 500;
}
</style>
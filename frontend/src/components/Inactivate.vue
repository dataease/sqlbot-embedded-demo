<template>
  <div
    ref="containerRef"
    class="inactivate-div"
    :class="{ 'is-dragging': isDragging }"
    :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @lostpointercapture="endDrag"
    @click.capture="handleClick"
    @dragstart.prevent
  >
    <el-dropdown ref="dropdownRef" @command="handleCommand" trigger="click">
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

defineProps({
  fontColor: {
    type: String,
    default: '#000000'
  }
})

const emit = defineEmits(['showHistory', 'newChat', 'languageChange'])

const containerRef = ref<HTMLElement>()
const dropdownRef = ref<InstanceType<typeof ElDropdown>>()
const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
let suppressClick = false
let dragState: {
  pointerId: number
  target: Element
  clientX: number
  clientY: number
  x: number
  y: number
  rect: DOMRect
} | undefined

const startDrag = (event: PointerEvent) => {
  if (event.button !== 0 || !event.isPrimary || dragState || !containerRef.value) return
  const target = event.target
  if (!(target instanceof Element)) return
  suppressClick = false
  dragState = {
    pointerId: event.pointerId,
    target,
    clientX: event.clientX,
    clientY: event.clientY,
    x: offset.value.x,
    y: offset.value.y,
    rect: containerRef.value.getBoundingClientRect(),
  }
  // Capture the original target so clicks still reach the dropdown trigger.
  // Capture also keeps receiving pointer events when crossing the embedded iframe.
  target.setPointerCapture(event.pointerId)
}

const moveDrag = (event: PointerEvent) => {
  if (!dragState || event.pointerId !== dragState.pointerId) return
  const dx = event.clientX - dragState.clientX
  const dy = event.clientY - dragState.clientY
  if (!isDragging.value) {
    if (Math.hypot(dx, dy) < 6) return
    isDragging.value = true
    dropdownRef.value?.handleClose()
  }
  event.preventDefault()
  const { rect, x, y } = dragState
  const left = Math.max(0, Math.min(window.innerWidth - rect.width, rect.left + dx))
  const top = Math.max(0, Math.min(window.innerHeight - rect.height, rect.top + dy))
  offset.value = { x: x + left - rect.left, y: y + top - rect.top }
}

const finishDrag = () => {
  if (!dragState) return
  const { target, pointerId } = dragState
  dragState = undefined
  suppressClick = isDragging.value
  isDragging.value = false
  if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
}

const endDrag = (event: PointerEvent) => {
  if (event.pointerId === dragState?.pointerId) finishDrag()
}

const handleClick = (event: MouseEvent) => {
  if (!suppressClick || event.detail === 0) return
  suppressClick = false
  event.preventDefault()
  event.stopPropagation()
}

const clampPosition = () => {
  finishDrag()
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect?.width || !rect.height) return
  offset.value = {
    x: offset.value.x + Math.max(0, Math.min(window.innerWidth - rect.width, rect.left)) - rect.left,
    y: offset.value.y + Math.max(0, Math.min(window.innerHeight - rect.height, rect.top)) - rect.top,
  }
}

onMounted(() => {
  clampPosition()
  window.addEventListener('resize', clampPosition)
  window.addEventListener('blur', finishDrag)
})

onBeforeUnmount(() => {
  finishDrag()
  window.removeEventListener('resize', clampPosition)
  window.removeEventListener('blur', finishDrag)
})

const langOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁体中文', value: 'zh-TW' },
  { label: 'English', value: 'en' },
  { label: '한국어', value: 'ko-KR' },
  { label: 'ภาษาไทย', value: 'th-TH' },
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
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.inactivate-div.is-dragging {
  cursor: grabbing;
}
.inactivate-button {
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: inherit;
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

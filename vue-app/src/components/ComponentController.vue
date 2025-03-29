<!-- ComponentController.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useComponentManager } from '../utils/useComponentManager';

// 使用组件管理器
const componentManager = useComponentManager();
const selectedComponent = ref('');

// 获取所有已注册的组件
const registeredComponents = componentManager.components.list;

// 挂载/卸载组件
function toggleComponent(id) {
    if (componentManager.isActive(id)) {
        componentManager.unmount(id);
    } else {
        componentManager.mount(id);
    }
}

// 设置组件是否自动挂载
function setAutoMount(id, value) {
    componentManager.setAutoMount(id, value);
}

// 刷新组件列表
function refreshComponentList() {
    componentManager.components.refresh();
}

// 组件挂载时刷新列表
onMounted(() => {
    refreshComponentList();
});
</script>

<template>
    <div class="component-controller">
        <h3>组件控制器</h3>
        <div class="component-list">
            <div v-for="component in componentManager.components.list" :key="component.id" class="component-item">
                <div class="component-info">
                    <span class="component-name">{{ component.id }}</span>
                    <span class="component-selector">{{ component.selector }}</span>
                </div>

                <div class="component-actions">
                    <button @click="toggleComponent(component.id)" :class="{ active: component.isActive }">
                        {{ component.isActive ? '卸载' : '挂载' }}
                    </button>

                    <label class="auto-mount">
                        <input type="checkbox" :checked="component.autoMount"
                            @change="setAutoMount(component.id, $event.target.checked)" />
                        自动挂载
                    </label>
                </div>
            </div>
        </div>

        <div class="global-actions">
            <button @click="componentManager.mountAutoComponents()">挂载所有自动组件</button>
            <button @click="componentManager.unmountAll()">卸载所有组件</button>
            <button @click="refreshComponentList()">刷新列表</button>
        </div>
    </div>
</template>

<style scoped>
.component-controller {
    padding: 10px;
    background-color: var(--SmartThemeShadowColor);
    border-radius: 8px;
    margin-bottom: 16px;
}

h3 {
    margin-top: 0;
    color: var(--SmartThemeBodyColor);
}

.component-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

.component-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background-color: var(--SmartThemeInputColor);
    border-radius: 4px;
}

.component-info {
    display: flex;
    flex-direction: column;
}

.component-name {
    font-weight: bold;
    color: var(--SmartThemeInputTextColor);
}

.component-selector {
    font-size: 0.8em;
    color: var(--SmartThemeTextColor);
    opacity: 0.7;
}

.component-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

button {
    background-color: var(--SmartThemeButtonColor);
    color: var(--SmartThemeButtonTextColor);
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
}

button:hover {
    background-color: var(--SmartThemeButtonHoverColor);
}

button.active {
    background-color: var(--SmartThemeAccentColor);
}

.auto-mount {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--SmartThemeTextColor);
    font-size: 0.9em;
}

.global-actions {
    display: flex;
    gap: 8px;
}
</style>
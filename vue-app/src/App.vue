<script setup>
import { onMounted } from 'vue';
import GoogleAPI from './components/api/GoogleAPI.vue';
import ComponentController from './components/ComponentController.vue';
import { useComponentManager } from './utils/useComponentManager';

// 使用组件管理器
const componentManager = useComponentManager();

// 组件挂载时执行
onMounted(() => {
    console.log('App组件已挂载');
});
</script>

<template>
    <div class="plugin-container">
        <h2>Vue插件</h2>

        <!-- 组件控制器 -->
        <ComponentController />

        <!-- 其他组件 -->
        <GoogleAPI />
    </div>
</template>

<style scoped>
/* 样式省略，与之前提供的相同 */
</style>
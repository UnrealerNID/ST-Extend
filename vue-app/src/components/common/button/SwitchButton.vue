<!-- Switch.vue -->
<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isActive = computed({
    get: () => props.modelValue,
    set: (value) => {
        emit('update:modelValue', value);
        emit('change', value);
    }
});

function toggle() {
    if (!props.disabled) {
        isActive.value = !isActive.value;
    }
}
</script>

<template>
    <div class="switch-component" :class="{ disabled }" @click="toggle">
        <div :class="['switch-toggle', 'fa-solid', { 'fa-toggle-on': isActive, 'fa-toggle-off': !isActive }]"
            :title="title"></div>
    </div>
</template>

<style scoped>
.switch-component {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.switch-toggle {
    font-size: 1.2rem;
    transition: color 0.2s ease;
}

.fa-toggle-on {
    color: #4caf50;
}

.fa-toggle-off {
    color: #9e9e9e;
}

.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
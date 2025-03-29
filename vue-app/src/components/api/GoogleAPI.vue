<script setup>
import SwitchButton from '../common/button/SwitchButton.vue';
import GoogleAPI from '../../model/api/GoogleAPI';
const googleAPI = new GoogleAPI();
const apiKeys = googleAPI.apiKeys;
const title = '切换API激活状态';
</script>
<template>
    <div class="google_api_block">
        <div class="google_api_list">
            <div class="google_api_item" v-for="({ key, enable, error, errorInfo }, index) in apiKeys" :key="index">
                <SwitchButton :isActive="enable" @update:isActive="googleAPI.setApiKeyEnable(index, $event)"
                    :title="title" />
                <input type="text" class="text_pole" :value="key"
                    @input="googleAPI.updateApiKey(index, $event.target.value)" placeholder="填写API密钥" />
                <button v-if="apiKeys.length > 1" class="btn_delete" @click="googleAPI.removeApiKey(index)"
                    title="删除此API密钥">
                    <i class="fa-solid fa-trash-alt"></i>
                </button>
            </div>
            <div class="api_controls">
                <button class="menu_button menu_button_icon" @click="googleAPI.addApiKey()" title="添加新的API密钥">
                    <i class="fa-solid fa-plus"></i> 添加API密钥
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.google_api_block {
    width: 100%;
    height: fit-content;
    padding: 10px;
}

.google_api_list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.google_api_item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.api_controls {
    margin-top: 10px;
    display: flex;
    justify-content: flex-start;
}

.btn_add,
.btn_delete {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    background-color: var(--black80a);
    border: 1px solid var(--black50a);
    color: var(--white80a);
    transition: background-color 0.2s;
}

.btn_add:hover {
    background-color: var(--accent);
}

.btn_delete {
    padding: 5px 8px;
    background-color: var(--black70a);
}

.btn_delete:hover {
    background-color: var(--error);
}
</style>
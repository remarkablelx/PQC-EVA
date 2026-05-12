<script setup lang="ts">
import { computed } from 'vue';

export interface DataInfo {
    symbol: string;
    name: string;
    size: number;
    typeConfig?: { color: string; label: string };
}

const props = defineProps<{
    isOpen: boolean;
    dataInfo: DataInfo | null;
}>();

defineEmits(['close']);

const hexData = computed(() => {
    if (!props.dataInfo) return null;
    const size = props.dataInfo.size;
    const arr: string[] = [];
    for (let i = 0; i < Math.min(size, 64); i++) {
        arr.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
    }
    let result = arr.join(' ');
    if (size > 64) {
        result += ' ... (' + (size - 64) + ' more bytes)';
    }
    return result;
});
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" @click="$emit('close')">
            <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-600" @click.stop>
                <div class="p-5 border-b border-slate-700 bg-slate-900 text-white rounded-t-2xl flex justify-between items-center shrink-0">
                    <div>
                        <h2 class="text-xl font-bold">{{ dataInfo?.symbol }}</h2>
                        <p class="text-sm text-slate-300">{{ dataInfo?.name }} ({{ dataInfo?.size }} bytes)</p>
                    </div>
                    <button @click="$emit('close')" class="text-slate-300 hover:text-white text-4xl leading-none">&times;</button>
                </div>
                <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div v-if="hexData" class="font-mono text-sm bg-slate-900 p-4 rounded-xl break-all leading-relaxed border border-slate-700 text-green-400">
                        {{ hexData }}
                    </div>
                    <div v-else class="text-slate-500 text-center py-8">
                        <p class="mb-2">No data available</p>
                        <p class="text-sm">Size: {{ dataInfo?.size }} bytes</p>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

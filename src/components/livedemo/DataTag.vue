<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    type: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, default: 32 }
});

const DATA_TYPES: Record<string, { color: string; label: string }> = {
    SEED: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', label: 'Random bytes/Seeds' },
    MATRIX: { color: 'bg-pink-500/20 text-pink-400 border-pink-500/40', label: 'Matrix' },
    VECTOR: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/40', label: 'Vector' },
    POLY: { color: 'bg-green-500/20 text-green-400 border-green-500/40', label: 'Polynomial' },
    BYTES: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', label: 'Bytes' },
    CALC: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40', label: 'Calculation' },
    GRAPH: { color: 'bg-teal-500/20 text-teal-400 border-teal-500/40', label: 'Show in graph' },
    KEY: { color: 'bg-red-500/20 text-red-400 border-red-500/40', label: 'Shared Key' }
};

const DEFAULT_TYPE: { color: string; label: string } = DATA_TYPES['BYTES']!;

const typeConfig = computed(() => {
    return DATA_TYPES[props.type] || DEFAULT_TYPE;
});

const handleClick = () => {
    const config = typeConfig.value;
    if (config) {
        emit('open-modal', props.symbol, props.name, props.size, config);
    }
};

const emit = defineEmits<{
    (e: 'open-modal', symbol: string, name: string, size: number, typeConfig: { color: string; label: string }): void
}>();
</script>

<template>
    <button @click="handleClick"
            :class="typeConfig?.color"
            class="inline-flex items-center px-1.5 py-0.5 rounded text-sm font-mono border cursor-pointer hover:opacity-80 transition-opacity mx-1 shadow-sm"
            :title="'点击查看 ' + name + ' 的十六进制值'">
        <span class="italic font-serif font-bold">{{ symbol }}</span>
    </button>
</template>

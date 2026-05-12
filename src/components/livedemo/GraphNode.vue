<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps(['id', 'label', 'highlightId', 'customClass', 'type', 'badge']);
defineEmits(['node-click', 'badge-click']);

const isHighlighted = computed(() => {
    if (props.highlightId === 'ALL_FO' && props.badge?.includes('fo')) return true;
    if (props.highlightId === 'ALL_CONTRIB' && props.badge?.includes('contributory')) return true;
    return props.highlightId === props.id;
});

const nodeTypeClass = computed(() => {
    switch(props.type) {
        case 'input': return 'node-input';
        case 'process': return 'node-process';
        case 'data': return 'node-data';
        case 'random': return 'node-random';
        case 'output': return 'node-output';
        case 'hints': return 'node-hints';
        default: return 'bg-slate-700 border-slate-500 text-slate-200';
    }
});
</script>

<template>
    <div :id="'graph-node-' + id"
         @click.stop="$emit('node-click', id)"
         :class="[customClass, nodeTypeClass, isHighlighted ? 'highlight-pulse z-50 border-white shadow-lg shadow-white/30' : 'hover:brightness-110 shadow-sm']"
         class="cursor-pointer transition-all duration-300 flex items-center justify-center font-mono text-[11px] md:text-[12px] leading-tight px-2 py-1 border-[1.5px] relative w-fit mx-auto text-center rounded-md font-bold"
         :title="'Click to view text step: ' + id">
        {{ label }}
        <div v-if="badge" class="badge-container">
            <div v-if="badge.includes('fo')" @click.stop="$emit('badge-click', 'fo', id)" class="badge-fo" title="查看 FO 变换说明"></div>
            <div v-if="badge.includes('contributory')" @click.stop="$emit('badge-click', 'contributory', id)" class="badge-contrib" title="查看贡献型设计说明"></div>
            <div v-if="badge.includes('non-official')" class="badge-nonoff"></div>
            <div v-if="badge.includes('check')" class="badge-check"></div>
        </div>
    </div>
</template>

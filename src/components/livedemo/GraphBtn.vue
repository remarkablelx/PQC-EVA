<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps(['id', 'highlightId']);
defineEmits(['jump']);
const isHighlighted = computed(() => props.highlightId === props.id);
</script>

<template>
    <button :id="'text-btn-' + id"
            @click="$emit('jump', id)"
            :class="[isHighlighted ? 'highlight-pulse bg-white/20 border-white text-white' : 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/30 hover:border-teal-400/60']"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold cursor-pointer transition-all shadow-sm align-middle mx-0.5 border border-teal-500/30"
            title="在流程图中高亮显示">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Graph
    </button>
</template>

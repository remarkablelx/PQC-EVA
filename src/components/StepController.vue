<script setup lang="ts">
import { useAlgoStore } from '../stores/algorithmStore';
import PhaseTimeline from './PhaseTimeline.vue';

const store = useAlgoStore();
</script>

<template>
    <div class="h-full bg-slate-900 border-t border-slate-700 flex flex-col p-6">
        <!-- Top Control Bar -->
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
                <span class="text-2xl font-bold text-blue-400 font-mono">{{ store.currentStepIndex + 1 }}/{{
                    store.steps.length }}</span>
                <h2 class="text-xl text-white font-bold">{{ store.currentStep?.name }}</h2>
            </div>

            <div class="flex gap-2">
                <button @click="store.reset"
                    class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-600 flex items-center">
                    <i class="fa-solid fa-rotate-left mr-2"></i> 重置
                </button>
                <button @click="store.prevStep" :disabled="store.currentStepIndex === 0"
                    class="px-4 py-1.5 rounded bg-blue-900/30 hover:bg-blue-800/30 text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-blue-800 flex items-center">
                    <i class="fa-solid fa-chevron-left mr-2"></i> 上一步
                </button>
                <button @click="store.nextStep" :disabled="store.currentStepIndex === store.steps.length - 1"
                    class="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-900/20 flex items-center">
                    下一步 <i class="fa-solid fa-chevron-right ml-2"></i>
                </button>
                <!-- Auto-Play Controls -->
                <button @click="store.isAutoPlaying ? store.stopAutoPlay() : store.startAutoPlay()"
                    class="px-4 py-1.5 rounded transition-colors flex items-center" :class="store.isAutoPlaying
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'">
                    <i v-if="!store.isAutoPlaying" class="fa-solid fa-play mr-2"></i>
                    <i v-else class="fa-solid fa-pause mr-2"></i>
                    {{ store.isAutoPlaying ? '暂停' : '自动播放' }}
                </button>
            </div>
        </div>

        <!-- Phase Timeline -->
        <PhaseTimeline />

        <!-- Progress Bar -->
        <div class="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div class="h-full bg-blue-500 transition-all duration-300 ease-out"
                :style="{ width: `${((store.currentStepIndex + 1) / store.steps.length) * 100}%` }"></div>
        </div>

        <!-- Step Description -->
        <div class="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-5 overflow-y-auto">
            <p class="text-slate-300 leading-7 text-lg">{{ store.currentStep?.desc }}</p>

            <div class="mt-4 flex gap-2">
                <span class="px-2 py-1 rounded bg-slate-700 text-xs text-slate-400 font-mono flex items-center">
                    <i class="fa-solid fa-user mr-2 text-pink-400" v-if="store.currentStep?.owner === 'Alice'"></i>
                    <i class="fa-solid fa-user-tie mr-2 text-blue-400" v-else></i>
                    {{ store.currentStep?.owner }}
                </span>
                <span class="px-2 py-1 rounded bg-slate-700 text-xs text-slate-400 font-mono flex items-center">
                    <i class="fa-solid fa-layer-group mr-2 text-slate-500"></i> {{ store.currentStep?.phase }}
                </span>
            </div>
        </div>

        <!-- Auto-Play Speed Control -->
        <div v-if="store.isAutoPlaying" class="mt-4 flex items-center gap-3">
            <span class="text-sm text-slate-400">播放速度：</span>
            <div class="flex gap-2">
                <button @click="store.autoPlaySpeed = 'slow'" class="px-2 py-1 rounded text-xs transition-colors"
                    :class="store.autoPlaySpeed === 'slow' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'">
                    慢
                </button>
                <button @click="store.autoPlaySpeed = 'normal'" class="px-2 py-1 rounded text-xs transition-colors"
                    :class="store.autoPlaySpeed === 'normal' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'">
                    中
                </button>
                <button @click="store.autoPlaySpeed = 'fast'" class="px-2 py-1 rounded text-xs transition-colors"
                    :class="store.autoPlaySpeed === 'fast' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'">
                    快
                </button>
            </div>
        </div>
    </div>
</template>

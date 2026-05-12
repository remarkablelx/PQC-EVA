<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import HeaderBar from '../components/HeaderBar.vue';
import KyberGraph from '../components/livedemo/KyberGraph.vue';
import FoGraph from '../components/livedemo/FoGraph.vue';
import DhGraph from '../components/livedemo/DhGraph.vue';
import DataTag from '../components/livedemo/DataTag.vue';
import GraphBtn from '../components/livedemo/GraphBtn.vue';
import HexViewerModal from '../components/livedemo/HexViewerModal.vue';

const mainTabs = [
  { id: 'graph', label: 'Graph (全景图表)' },
  { id: 'livedemo', label: 'Live demo (交互沙盒)' },
  { id: 'explanation', label: 'Explanation (数学原理)' },
  { id: 'guide', label: '❓ Guide (使用指南)' }
];

const guideSections = ref([
  {
    id: 'intro',
    title: 'Introduction (简介)',
    icon: '📝',
    isOpen: true,
    content: `此应用程序解释了 ML-KEM，这是一种密钥封装机制 (KEM)。与 Diffie-Hellman 等密钥交换协议类似，它允许双方安全地建立一个共同的秘密密钥，用于各种其他对称密码方案。此外，ML-KEM，也称为 Kyber，是一种所谓的后量子方案。`
  },
  {
    id: 'start',
    title: 'First steps (从何处开始)',
    icon: '🚀',
    isOpen: false,
    content: `本模块有许多部分，每个部分包含大量信息。建议用户根据需要点击并探索各个部分。然而，这里有一些建议的起点：<br><br>
        <table class="min-w-full bg-slate-800 border border-slate-700 mt-2 shadow-sm rounded">
            <thead class="bg-slate-700 border-b"><tr><th class="p-3 text-left text-slate-200">知识水平</th><th class="p-3 text-left text-slate-200">推荐起点</th></tr></thead>
            <tbody class="divide-y divide-slate-700">
                <tr><td class="p-3 font-bold text-green-400">Beginner (初学者)</td><td class="p-3 text-slate-300">📖 Readme</td></tr>
                <tr><td class="p-3 font-bold text-blue-400">Intermediate (进阶者)</td><td class="p-3 text-slate-300">📊 Graph</td></tr>
                <tr><td class="p-3 font-bold text-purple-400">Advanced (高级专家)</td><td class="p-3 text-slate-300">💻 Live demo / 🧮 Explanations</td></tr>
            </tbody>
        </table>`
  },
  {
    id: 'readme',
    title: 'Readme (自述文件)',
    icon: '📖',
    isOpen: false,
    content: `Readme 解释了 Kyber 建立的许多基础知识。它还提供了各种有用的链接（例如基于此页面的官方 NIST 规范）。对于初次接触 Kyber 的人，我们建议将此作为起点，以熟悉术语并使深入研究此模块变得更加容易。`
  },
  {
    id: 'graph1',
    title: 'Graph: Kyber step-by-step',
    icon: '📊',
    isOpen: false,
    content: `此图表提供了 Kyber 方案中采取的大部分步骤的概述。一些函数被抽象化，因为它们来自不同的标准，在别处描述，或者非常简单，可以从名称中理解其功能。<br><br>
        <ul class="list-disc pl-6 space-y-2 mt-2 text-slate-300">
            <li>图表的左侧提供了各种颜色和形状的图例。</li>
            <li>图表是交互式的。点击节点将使其高亮显示，并链接到 Live Demo 中的相应解释。</li>
            <li><strong>📌 缩放控制:</strong> 可以在图表上方放大或缩小，以适应您的屏幕。</li>
            <li><strong>📌 Pin to Sidebar:</strong> 按下此按钮将在屏幕左侧显示图表，同时将应用程序的其余部分保留在右侧。这对交叉引用极其有用！</li>
        </ul>`
  },
  {
    id: 'graph2',
    title: 'Graph: Kyber vs Diffie-Hellman',
    icon: '⚖️',
    isOpen: false,
    content: `此图表并排展示了 Kyber 协议与 Diffie-Hellman 协议的交互过程。它主要用于解释 KEM（如Kyber）与 KEX（如Diffie-Hellman）在交换性 (commutativity) 方面的核心差异。`
  },
  {
    id: 'graph3',
    title: 'Graph: FO transform',
    icon: '🔄',
    isOpen: false,
    content: `此图表展示了 Fujisaki-Okamoto 变换的一个示例，其灵感直接来源于激发 Kyber 中 FO 变换设计的学术论文。`
  },
  {
    id: 'livedemo',
    title: 'Live demo (交互沙盒)',
    icon: '💻',
    isOpen: false,
    content: `此页面显示了 Kyber 流程的交互演示。<br>
        <ul class="list-disc pl-6 space-y-2 mt-2 text-slate-300">
            <li>可以调整 <strong>Security Level</strong> 选择器以确定 Kyber 方案中的 k 值或"模块"大小 (512 / 768 / 1024)。</li>
            <li>在解释部分，可以点击含有颜色的按钮。颜色指示数据类型，点击它们可以查看底层的 <strong>十六进制值 (Hex)</strong>。</li>
            <li>按下 <span class="bg-teal-900/30 text-teal-400 px-1 border border-teal-500/30 rounded">Graph</span> 按钮会将您发送到与当前步骤相关的 Kyber 图表部分进行高亮。</li>
        </ul>`
  },
  {
    id: 'exp1',
    title: 'Explanation: Calculations',
    icon: '🧮',
    isOpen: false,
    content: `本页列出了使 Kyber 工作底层公钥交换 (PKE) 的主要计算公式，并以简化无 NTT 的方式演示了它们如何共同通信数据以建立共享密钥。`
  },
  {
    id: 'exp2',
    title: 'Explanation: Fujisaki-Okamoto transform',
    icon: '🛡️',
    isOpen: false,
    content: `本页解释了 Fujisaki-Okamoto (FO) 变换的原理以及它如何在 Kyber 中使用。它详细关联了 Graph 选项卡中 Kyber 图表的各个部分。`
  },
  {
    id: 'exp3',
    title: 'Explanation: Design choices',
    icon: '🎨',
    isOpen: false,
    content: `本页强调了在创建 Kyber 期间做出的一些设计选择以及实现它们的原因（例如为什么设计成 Contributory）。它详细关联了 Graph 选项卡中 Kyber 图表的各个部分。`
  }
]);

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: () => Promise<void>;
    };
  }
}

const renderMathJax = async () => {
  await nextTick();
  if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
    try {
      await window.MathJax.typesetPromise();
    } catch (e) {
      console.log('MathJax rendering error:', e);
    }
  }
};

onMounted(() => {
  renderMathJax();
});

const graphTabs = [
  { id: 'complete', label: 'Complete Kyber graph' },
  { id: 'vs', label: 'Kyber vs Diffie-Hellman' },
  { id: 'fo', label: 'FO transform' }
];

const demoTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'keygen', label: '1. Key Gen' },
  { id: 'encap', label: '2. Encap' },
  { id: 'decap', label: '3. Decap' }
];

const expTabs = [
  { id: 'calc', label: '计算说明' },
  { id: 'fo', label: 'FO 变换' },
  { id: 'design', label: 'Kyber 设计选择' }
];

const activeMainTab = ref('graph');
const graphTab = ref('complete');
const demoTab = ref('overview');
const expTab = ref('calc');
const pinnedGraph = ref<string | null>(null);
const kValue = ref(2);
const modalData = ref<any>(null);
const highlightId = ref<string | null>(null);
const showReadme = ref(false);

watch(expTab, () => {
  renderMathJax();
});

watch(activeMainTab, () => {
  if (activeMainTab.value === 'explanation') {
    renderMathJax();
  }
});

const clearHighlight = () => { highlightId.value = null; };

const handleJumpToGraph = (nodeId: string) => {
  activeMainTab.value = 'graph';
  graphTab.value = 'complete';
  highlightId.value = nodeId;

  // 滚动到对应节点
  setTimeout(() => {
    const node = document.getElementById('graph-node-' + nodeId);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      // 给节点添加高亮效果（使用ring避免布局抖动）
      node.classList.add('!ring-2', '!ring-white', '!ring-offset-2', '!ring-offset-slate-900');
      setTimeout(() => {
        node.classList.remove('!ring-2', '!ring-white', '!ring-offset-2', '!ring-offset-slate-900');
      }, 2000);
    }
  }, 300);
};

const handleJumpToGraph_FO = (nodeId: string) => {
  activeMainTab.value = 'graph';
  graphTab.value = 'complete';
  highlightId.value = nodeId;

  // 滚动到对应节点
  setTimeout(() => {
    const node = document.getElementById('graph-node-' + nodeId);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      // 给节点添加高亮效果（使用ring避免布局抖动）
      node.classList.add('!ring-2', '!ring-white', '!ring-offset-2', '!ring-offset-slate-900');
      setTimeout(() => {
        node.classList.remove('!ring-2', '!ring-white', '!ring-offset-2', '!ring-offset-slate-900');
      }, 2000);
    }
  }, 300);
};

const handleJumpToText = (nodeId: string) => {
  activeMainTab.value = 'livedemo';
  if (nodeId.startsWith('kg_')) demoTab.value = 'keygen';
  else if (nodeId.startsWith('ec_')) demoTab.value = 'encap';
  else if (nodeId.startsWith('dc_')) demoTab.value = 'decap';
  highlightId.value = nodeId;

  // 滚动到对应GraphBtn
  setTimeout(() => {
    const btn = document.getElementById('text-btn-' + nodeId);
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      // 给按钮添加高亮效果（使用ring避免布局抖动）
      btn.classList.add('!ring-2', '!ring-white', '!ring-offset-2', '!ring-offset-slate-900');
      setTimeout(() => {
        btn.classList.remove('!ring-2', '!ring-white', '!ring-offset-2', '!ring-offset-slate-900');
      }, 2000);
    }
  }, 300);
};

const handleBadgeJump = (badgeType: string, nodeId?: string) => {
  activeMainTab.value = 'explanation';
  if (badgeType === 'fo') expTab.value = 'fo';
  else if (badgeType === 'contributory') expTab.value = 'design';
  if (nodeId) highlightId.value = nodeId;

  // 滚动到对应GraphBtn
  setTimeout(() => {
    if (nodeId) {
      const btn = document.getElementById('text-btn-' + nodeId);
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        // 给按钮添加高亮边框效果
        btn.classList.add('border-2', 'border-yellow-400', 'shadow-lg', 'shadow-yellow-400/30');
        setTimeout(() => {
          btn.classList.remove('border-2', 'border-yellow-400', 'shadow-lg', 'shadow-yellow-400/30');
        }, 2000);
      }
    }
  }, 300);
};

const openModal = (symbol: string, name: string, size: number, typeConfig: any) => {
  modalData.value = { symbol, name, size, typeConfig };
};

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

const graphTabLabel = computed(() => {
  if (graphTab.value === 'complete') return 'ML-KEM Step-by-Step (9-Graph Structure)';
  if (graphTab.value === 'fo') return 'FO Transform Flowchart';
  return 'Kyber vs Diffie-Hellman';
});
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-200 font-sans">
    <HeaderBar />

    <main class="flex-1 flex flex-col overflow-hidden">

      <div class="bg-slate-900 border-b border-slate-700">
        <div class="max-w-[1800px] mx-auto px-4">
          <div class="flex items-center justify-between py-3 border-t bg-slate-800/50 overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="flex flex-col">
                  <span class="text-xl font-bold text-slate-100 leading-tight">Kyber | ML-KEM Ultimate</span>
                  <span class="text-xs text-slate-400 leading-tight">A lattice-based KEM designed to resist
                    cryptanalytic attacks from future powerful quantum computers.</span>
                </div>
              </div>
              <button @click="showReadme = true"
                class="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2">
                📖 Readme
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button v-for="tab in mainTabs" :key="tab.id" @click="activeMainTab = tab.id; clearHighlight()"
                :class="['px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap rounded-t-lg', activeMainTab === tab.id ? 'border-blue-500 text-blue-400 bg-slate-800' : 'border-transparent text-slate-400 hover:bg-slate-700']">
                {{ tab.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-hidden p-4">

        <div v-if="activeMainTab === 'graph'" class="h-full flex flex-col animate-fade-in overflow-hidden">
          <div class="flex border-b mb-4 shrink-0 overflow-x-auto custom-scrollbar">
            <button v-for="t in graphTabs" :key="t.id" @click="graphTab = t.id; clearHighlight()"
              :class="['px-5 py-2 font-bold border-b-2 transition-colors whitespace-nowrap', graphTab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300']">
              {{ t.label }}
            </button>
          </div>
          <div
            class="flex-1 overflow-hidden border border-slate-700 shadow-inner rounded-xl flex flex-col bg-slate-900/50 relative">
            <div
              class="sticky top-0 bg-slate-800/90 backdrop-blur-sm border-b p-3 flex justify-between items-center z-20 shrink-0">
              <span class="font-bold text-slate-200 ml-2">{{ graphTabLabel }}</span>
              <div class="flex items-center gap-2">
                <button v-if="highlightId && graphTab === 'complete'" @click="clearHighlight"
                  class="px-3 py-1.5 bg-orange-500/20 text-orange-400 text-sm font-bold rounded hover:bg-orange-500/30 transition-colors border border-orange-500/40">清除高亮</button>
                <button @click="pinnedGraph = pinnedGraph === graphTab ? null : graphTab"
                  :class="['px-3 py-1.5 shadow-sm border rounded flex items-center gap-1.5 text-sm font-medium transition-colors', pinnedGraph === graphTab ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white']">
                  📌 Pin to Sidebar
                </button>
              </div>
            </div>
            <div class="p-4 flex justify-start items-start flex-1 overflow-auto custom-scrollbar relative">
              <KyberGraph v-if="graphTab === 'complete'" :highlight-id="highlightId" @node-click="handleJumpToText"
                @badge-click="handleBadgeJump" />
              <FoGraph v-if="graphTab === 'fo'" />
              <DhGraph v-if="graphTab === 'vs'" />
            </div>
          </div>
        </div>

        <div v-if="activeMainTab === 'livedemo'" class="h-full flex flex-col animate-fade-in relative overflow-hidden">
          <div class="flex border-b mb-4 shrink-0 overflow-x-auto custom-scrollbar items-center">
            <button v-for="t in demoTabs" :key="t.id" @click="demoTab = t.id; clearHighlight()"
              :class="['px-5 py-2 font-bold border-b-2 transition-colors whitespace-nowrap', demoTab === t.id ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-500 hover:text-slate-300']">
              {{ t.label }}
            </button>
            <div class="ml-auto flex items-center gap-3">
              <label class="text-sm font-bold text-slate-400">Security Level:</label>
              <select v-model="kValue"
                class="border border-slate-600 rounded px-3 py-1 text-sm font-mono bg-slate-800 text-slate-200 outline-none cursor-pointer shadow-sm">
                <option :value="2">k=2 (ML-KEM-512)</option>
                <option :value="3">k=3 (ML-KEM-768)</option>
                <option :value="4">k=4 (ML-KEM-1024)</option>
              </select>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto pr-4 pb-10 text-slate-300 custom-scrollbar leading-relaxed">
            <div class="max-w-5xl mx-auto">
              <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 shadow-sm text-base">
                <h4 class="font-bold text-slate-200 mb-3">图例和颜色说明 (Legend):</h4>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span v-for="(t, key) in DATA_TYPES" :key="key" :class="[t.color]"
                    class="px-3 py-1 rounded text-sm border font-medium shadow-sm">{{ t.label }}</span>
                </div>
              </div>

              <div v-if="demoTab === 'overview'" class="space-y-8">
                <h2 class="text-3xl font-bold border-b border-slate-700 pb-3 text-slate-100">Kyber Overview Process</h2>

                <div class="bg-slate-800 p-6 border border-slate-700 rounded-xl shadow-sm">
                  <h3 class="font-bold text-xl text-blue-400 mb-3">1. Key generation (Alice)</h3>
                  <ul class="list-disc pl-6 space-y-3 mb-5 text-slate-300">
                    <li>Alice生成密钥对。她保存私钥
                      <DataTag type="BYTES" symbol="dk" name="Secret Key" :size="1632" @open-modal="openModal" />
                      用于解封装，并将公钥
                      <DataTag type="BYTES" symbol="ek" name="Public Key" :size="800" @open-modal="openModal" /> 发送给Bob。
                    </li>
                    <li>注意：Alice在她的私钥 <code class="text-yellow-400">dk</code> 中保留了 <code
                        class="text-yellow-400">ek</code> 的副本，因为这在稍后的解封装过程中需要（这主要用于Fujisaki-Okamoto变换的验证步骤）。</li>
                  </ul>

                  <div
                    class="bg-slate-900 p-5 border border-slate-700 rounded-xl font-mono text-sm overflow-x-auto shadow-inner">
                    <div class="text-slate-200 font-bold mb-3 text-base">私钥组件分解 (dk size: 1632 bytes) :</div>
                    <div class="flex gap-3 min-w-[850px]">
                      <div
                        class="flex-1 bg-slate-800 border border-slate-600 p-4 rounded-lg shadow-sm flex flex-col justify-between items-center text-center">
                        <span class="font-bold text-purple-400 text-base">dk_PKE</span>
                        <span class="text-slate-500 my-3">768 bytes</span>
                        <DataTag type="BYTES" symbol="[示例值]" name="dk_PKE Data" :size="768" @open-modal="openModal" />
                      </div>
                      <div
                        class="flex-[1.5] bg-slate-800 border border-blue-500/40 p-4 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <div class="flex justify-between items-center ml-3 w-full pr-2 mb-3">
                          <span class="font-bold text-blue-400 text-base">ek (800 bytes)</span>
                          <DataTag type="BYTES" symbol="[示例值]" name="ek Data" :size="800" @open-modal="openModal" />
                        </div>
                        <div class="flex gap-3 ml-3">
                          <div
                            class="flex-1 bg-blue-900/20 border border-blue-500/30 p-3 flex flex-col items-center gap-2 rounded-lg">
                            <span class="text-blue-400 font-bold">t̂ (768b)</span>
                            <DataTag type="VECTOR" symbol="[示例值]" name="t_hat" :size="768" @open-modal="openModal" />
                          </div>
                          <div
                            class="flex-1 bg-orange-900/20 border border-orange-500/30 p-3 flex flex-col items-center gap-2 rounded-lg">
                            <span class="text-orange-400 font-bold">ρ (32b)</span>
                            <DataTag type="SEED" symbol="[示例值]" name="rho" :size="32" @open-modal="openModal" />
                          </div>
                        </div>
                      </div>
                      <div
                        class="flex-1 bg-slate-800 border border-slate-600 p-4 rounded-lg shadow-sm flex flex-col justify-between items-center text-center">
                        <span class="font-bold text-green-400 text-base">H(ek)</span>
                        <span class="text-slate-500 my-3">32 bytes</span>
                        <DataTag type="BYTES" symbol="[示例值]" name="H(ek) Hash" :size="32" @open-modal="openModal" />
                      </div>
                      <div
                        class="flex-1 bg-slate-800 border border-slate-600 p-4 rounded-lg shadow-sm flex flex-col justify-between items-center text-center">
                        <span class="font-bold text-orange-400 text-base">z</span>
                        <span class="text-slate-500 my-3">32 bytes</span>
                        <DataTag type="SEED" symbol="[示例值]" name="Seed z" :size="32" @open-modal="openModal" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-slate-800 p-6 border border-slate-700 rounded-xl shadow-sm">
                  <h3 class="font-bold text-xl text-teal-400 mb-3">2. Encapsulate (Bob)</h3>
                  <ul class="list-disc pl-6 space-y-3 text-slate-300">
                    <li>Bob生成一些随机数据 <code class="text-yellow-400">m</code>，并使用Alice的公钥 <code
                        class="text-yellow-400">ek</code> 对其进行封装。</li>
                    <li>这会产生共享密钥
                      <DataTag type="KEY" symbol="K" name="Shared Key" :size="32" @open-modal="openModal" /> (32 bytes)
                      和密文
                      <DataTag type="BYTES" symbol="c" name="Ciphertext" :size="768" @open-modal="openModal" /> (768
                      bytes)，密文 <code class="text-yellow-400">c</code> 被发送回Alice。
                    </li>
                  </ul>
                  <div
                    class="mt-5 bg-red-900/20 text-red-300 p-4 rounded-lg border border-red-500/40 font-mono text-sm flex flex-col gap-3 shadow-inner">
                    <div><strong>共享密钥 K 示例值:</strong> 10 62 fd e0 ac 15 00 24 54 18 dd 77 25 92 01 d0 5f c0 23 3a 37 8a
                      16 e4 06 12 1f e1 bf 0b bc 38</div>
                    <div><strong>密文 c 示例展示:</strong>
                      <DataTag type="BYTES" symbol="[点击查看768字节密文]" name="Ciphertext c" :size="768"
                        @open-modal="openModal" />
                    </div>
                  </div>
                </div>

                <div class="bg-slate-800 p-6 border border-slate-700 rounded-xl shadow-sm">
                  <h3 class="font-bold text-xl text-purple-400 mb-3">3. Decapsulate (Alice)</h3>
                  <ul class="list-disc pl-6 space-y-3 text-slate-300">
                    <li>Alice对 <code class="text-yellow-400">c</code> 进行解封装，很可能得到相同的共享密钥
                      <DataTag type="KEY" symbol="K" name="Shared Key" :size="32" @open-modal="openModal" />。
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="demoTab === 'keygen'" class="space-y-5">
                <h2 class="text-2xl font-bold border-b border-slate-700 pb-3 text-slate-100">1. Key Generation <span
                    class="bg-blue-500/20 text-blue-400 px-3 py-1 text-sm rounded border border-blue-500/40">Alice</span>
                </h2>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-blue-400 text-lg mb-3">1. Setup (KEM)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>发起方生成32字节的随机数据用于
                      <DataTag type="SEED" symbol="z" name="Seed z" :size="32" @open-modal="openModal" />
                      <GraphBtn id="kg_z" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和
                      <DataTag type="SEED" symbol="d" name="Seed d" :size="32" @open-modal="openModal" />
                      <GraphBtn id="kg_d" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>如果 d is NULL
                      <GraphBtn id="kg_d_null" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 或 z is NULL
                      <GraphBtn id="kg_z_null" :highlight-id="highlightId" @jump="handleJumpToGraph" />，则方案 returns a
                      failure symbol <code class="text-red-400">⊥</code>
                      <GraphBtn id="kg_fail" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>成功后，d 和 z 被传递给 <code class="text-yellow-400">ML-KEM.KeyGen_internal</code>
                      <GraphBtn id="kg_internal" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-blue-400 text-lg mb-3">2. Starting the key generation (KEM-internal)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>此步骤接收 d
                      <DataTag type="SEED" symbol="d" name="Seed d" :size="32" @open-modal="openModal" /> 并将其传递给 <code
                        class="text-yellow-400">K-PKE.KeyGen</code>
                      <GraphBtn id="kg_kpke" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-blue-400 text-lg mb-3">3. The seeds (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>d 和 k 被连接并使用 G
                      <GraphBtn id="kg_hash_g" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 进行哈希
                    </li>
                    <li>生成的64字节哈希被分为两个32字节的种子：ρ
                      <DataTag type="SEED" symbol="ρ" name="Rho" :size="32" @open-modal="openModal" />
                      <GraphBtn id="kg_rho" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 σ
                      <DataTag type="SEED" symbol="σ" name="Sigma" :size="32" @open-modal="openModal" />
                      <GraphBtn id="kg_sigma" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-blue-400 text-lg mb-3">4. Sampling the seeds (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>种子 σ 被基于 SHAKE-256 的伪随机函数(PRF)
                      <GraphBtn id="kg_prf" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 使用，由中心二项分布（CBD）
                      <GraphBtn id="kg_cbd" :highlight-id="highlightId" @jump="handleJumpToGraph" />确定两个具有小系数的误差向量 e
                      <DataTag type="VECTOR" symbol="e" name="Error Vector" @open-modal="openModal" /> 和秘密向量 s
                      <DataTag type="VECTOR" symbol="s" name="Secret Vector" @open-modal="openModal" />
                    </li>
                    <li>使用计数器 N 生成唯一数据，每次调用递增
                      <GraphBtn id="kg_n_inc" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>e 和 s 转换为NTT
                      <GraphBtn id="kg_ntt1" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                      <GraphBtn id="kg_ntt2" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 表示：ê
                      <DataTag type="VECTOR" symbol="ê" name="Error NTT" @open-modal="openModal" />
                      <GraphBtn id="kg_ehat" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 ŝ
                      <DataTag type="VECTOR" symbol="ŝ" name="Secret NTT" @open-modal="openModal" />
                      <GraphBtn id="kg_shat" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>种子 ρ 被 <code class="text-yellow-400">SampleNTT</code>
                      <GraphBtn id="kg_samplentt" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 使用，生成 k×k
                      的多项式矩阵 Â
                      <DataTag type="MATRIX" symbol="Â" name="Matrix A" @open-modal="openModal" />
                      <GraphBtn id="kg_ahat" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-blue-400 text-lg mb-3">5. Calculating part of the public key (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>执行计算：
                      <DataTag type="CALC" symbol="t̂ = Â ∘ ŝ + ê" name="Calculation" @open-modal="openModal" />
                      <GraphBtn id="kg_calc" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>其中 Â ∘ ŝ
                      <DataTag type="CALC" symbol="Â ∘ ŝ" name="Matrix Vector Mult" @open-modal="openModal" /> 是矩阵与向量的乘法
                    </li>
                    <li>将错误 ê
                      <DataTag type="VECTOR" symbol="ê" name="Error NTT" @open-modal="openModal" /> 添加到 Â ∘ ŝ ，结果为 t̂
                      <DataTag type="VECTOR" symbol="t̂" name="Public Key NTT" @open-modal="openModal" />
                      <GraphBtn id="kg_that" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-blue-400 text-lg mb-3">6. Encoding the keys (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>向量 t̂ 通过 <code class="text-yellow-400">Encode</code>
                      <GraphBtn id="kg_encode" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 形成字节 t̂_bytes
                      <DataTag type="BYTES" symbol="t̂_bytes" name="Encoded t" @open-modal="openModal" />
                    </li>
                    <li>将 t̂ 与 ρ 合并，生成公钥 ek_PKE
                      <DataTag type="BYTES" symbol="ek_PKE" name="PKE Public Key" :size="800" @open-modal="openModal" />
                      <GraphBtn id="kg_ek_pke" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>私有向量 s 经过组合形成私钥 dk_PKE
                      <DataTag type="BYTES" symbol="dk_PKE" name="PKE Private Key" :size="768"
                        @open-modal="openModal" />
                      <GraphBtn id="kg_dk_pke" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-blue-400 text-lg mb-3">7. Finalizing key generation (KEM-internal, KEM)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li><code class="text-yellow-400">ek_{PKE}</code> 被传递给 <code class="text-yellow-400">H</code> 函数
                      <GraphBtn id="kg_h_ek" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 来确定 <code
                        class="text-yellow-400">H(ek)</code>
                      <DataTag type="BYTES" symbol="H(ek)" name="Hash of ek" :size="32" @open-modal="openModal" />
                    </li>
                    <li>然后 <code class="text-yellow-400">dk_{PKE}</code> 和 <code class="text-yellow-400">z</code> 被连接
                      <GraphBtn id="kg_concat_dk" :highlight-id="highlightId" @jump="handleJumpToGraph" />，形成巨型私钥 <code
                        class="text-yellow-400">dk</code>
                      <DataTag type="BYTES" symbol="dk" name="Private Key" :size="1632" @open-modal="openModal" />
                    </li>
                    <li>最后，<code class="text-yellow-400">dk</code> 和 <code class="text-yellow-400">ek</code> 被返回给
                      ML-KEM.KeyGen，然后直接返回 <code class="text-yellow-400">dk</code>
                      <GraphBtn id="kg_dk_final" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 <code
                        class="text-yellow-400">ek</code>
                      <GraphBtn id="kg_ek_final" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 作为结果。
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="demoTab === 'encap'" class="space-y-5">
                <h2 class="text-2xl font-bold border-b border-slate-700 pb-3 text-slate-100">2. Encapsulation Process
                  <span
                    class="bg-teal-500/20 text-teal-400 px-3 py-1 text-sm rounded border border-teal-500/40">Bob</span>
                </h2>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-teal-400 text-lg mb-3">1. Setup (KEM)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>生成
                      <GraphBtn id="ec_m_gen" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 随机数据 m
                      <DataTag type="BYTES" symbol="m" name="Message" :size="32" @open-modal="openModal" />
                    </li>
                    <li>如果 m is NULL
                      <GraphBtn id="ec_m_null" :highlight-id="highlightId" @jump="handleJumpToGraph" />，返回 <code
                        class="text-red-400">⊥</code>
                      <GraphBtn id="ec_fail" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>接收
                      <GraphBtn id="ec_recv_ek" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 公钥 ek
                      <DataTag type="BYTES" symbol="ek" name="Public Key" :size="800" @open-modal="openModal" />
                    </li>
                    <li>m 和 ek 传递给 <code class="text-yellow-400">ML-KEM.Encaps_internal</code>
                      <GraphBtn id="ec_internal" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-teal-400 text-lg mb-3">2. Hashing (KEM-internal)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>ek
                      <GraphBtn id="ec_ek" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 被 H 哈希
                      <GraphBtn id="ec_h" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 得 H(ek)
                      <DataTag type="BYTES" symbol="H(ek)" name="Hash of ek" :size="32" @open-modal="openModal" />
                      <GraphBtn id="ec_hek" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>m 和 H(ek) 连接
                      <GraphBtn id="ec_concat" :highlight-id="highlightId" @jump="handleJumpToGraph" />，经 G 哈希
                      <GraphBtn id="ec_g" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>结果分为 r
                      <DataTag type="SEED" symbol="r" name="Random coins" :size="32" @open-modal="openModal" />
                      <GraphBtn id="ec_r" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 K
                      <DataTag type="KEY" symbol="K" name="Shared Key" :size="32" @open-modal="openModal" />
                      <GraphBtn id="ec_k" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>传递给 <code class="text-yellow-400">K-PKE.Encrypt</code>
                      <GraphBtn id="ec_encrypt" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-teal-400 text-lg mb-3">3. Decoding and sampling (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>ek 解码
                      <GraphBtn id="ec_decode" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 为 t̂ 和 ρ
                      <DataTag type="SEED" symbol="ρ" name="Rho" :size="32" @open-modal="openModal" />
                      <GraphBtn id="ec_rho" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>使用 SampleNTT 生成矩阵 Â
                      <GraphBtn id="ec_samplentt_enc" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                      <GraphBtn id="ec_ahat_enc" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>r 被PRF
                      <GraphBtn id="ec_prf" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 确定多项式 y
                      <DataTag type="VECTOR" symbol="y" name="y vector" @open-modal="openModal" />
                      <GraphBtn id="ec_y" :highlight-id="highlightId" @jump="handleJumpToGraph" />, 误差 e₁
                      <DataTag type="VECTOR" symbol="e₁" name="Error 1" @open-modal="openModal" />
                      <GraphBtn id="ec_e1" :highlight-id="highlightId" @jump="handleJumpToGraph" />, e₂
                      <DataTag type="POLY" symbol="e₂" name="Error 2" @open-modal="openModal" />
                      <GraphBtn id="ec_e2" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>y 转换
                      <GraphBtn id="ec_ntt" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 为 NTT 表示 ŷ
                      <DataTag type="VECTOR" symbol="ŷ" name="y NTT" @open-modal="openModal" />
                      <GraphBtn id="ec_yhat" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>m 经 <code class="text-yellow-400">Decode</code>
                      <GraphBtn id="ec_decodem" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 <code
                        class="text-yellow-400">Decompress</code>
                      <GraphBtn id="ec_decompress" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 转为 μ
                      <DataTag type="POLY" symbol="μ" name="mu" @open-modal="openModal" />
                      <GraphBtn id="ec_mu" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-teal-400 text-lg mb-3">4. Calculations (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>计算 û = Â^T ∘ ŷ
                      <GraphBtn id="ec_calc_u" :highlight-id="highlightId" @jump="handleJumpToGraph" />，转换
                      <GraphBtn id="ec_invntt_u" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 为 ū
                      <DataTag type="VECTOR" symbol="ū" name="u bar" @open-modal="openModal" />
                      <GraphBtn id="ec_ubar" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>计算 v̂ = t̂^T ∘ ŷ
                      <GraphBtn id="ec_calc_v" :highlight-id="highlightId" @jump="handleJumpToGraph" />，转换
                      <GraphBtn id="ec_invntt_v" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 为 v̄
                      <DataTag type="POLY" symbol="v̄" name="v bar" @open-modal="openModal" />
                      <GraphBtn id="ec_vbar" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-teal-400 text-lg mb-3">5. Adding the errors (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>计算 u = ū + e₁
                      <GraphBtn id="ec_add_u" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 得 u
                      <DataTag type="VECTOR" symbol="u" name="u" @open-modal="openModal" />
                      <GraphBtn id="ec_u" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>计算 v = v̄ + e₂ + μ
                      <GraphBtn id="ec_add_v" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 得 v
                      <DataTag type="POLY" symbol="v" name="v" @open-modal="openModal" />
                      <GraphBtn id="ec_v" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-teal-400 text-lg mb-3">6. Compress and encode (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>最后，u 和 v 通过 <code class="text-yellow-400">Compress</code>
                      <GraphBtn id="ec_compress" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 <code
                        class="text-yellow-400">Encode</code>
                      <GraphBtn id="ec_encode" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                      函数被转换回字节并连接，产生通信密文 c
                      <DataTag type="BYTES" symbol="c" name="Ciphertext" :size="768" @open-modal="openModal" />
                      <GraphBtn id="ec_c" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-teal-400 text-lg mb-3">7. Finalizing encapsulation (KEM-internal, KEM)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>封装结束，输出派生的共享密钥 K
                      <DataTag type="KEY" symbol="K" name="Shared Key" :size="32" @open-modal="openModal" /> 和密文 c
                      <DataTag type="BYTES" symbol="c" name="Ciphertext" :size="768" @open-modal="openModal" />
                      <GraphBtn id="ec_c_final" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 供后续使用。
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="demoTab === 'decap'" class="space-y-5">
                <h2 class="text-2xl font-bold border-b border-slate-700 pb-3 text-slate-100">3. Decapsulation Process
                  <span
                    class="bg-purple-500/20 text-purple-400 px-3 py-1 text-sm rounded border border-purple-500/40">Alice</span>
                </h2>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-purple-400 text-lg mb-3">1. Setup (KEM)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>dk
                      <GraphBtn id="dc_dk" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和密文 c
                      <DataTag type="BYTES" symbol="c" name="Ciphertext" :size="768" @open-modal="openModal" />
                      <GraphBtn id="dc_c" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 传递给 <code
                        class="text-yellow-400">ML-KEM.Decaps_internal</code>
                      <GraphBtn id="dc_internal" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-purple-400 text-lg mb-3">2. Splitting `dk` (KEM-internal)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>输入 dk 分割
                      <GraphBtn id="dc_split" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 为 dk_PKE
                      <DataTag type="BYTES" symbol="dk_PKE" name="PKE Private Key" :size="768"
                        @open-modal="openModal" />
                      <GraphBtn id="dc_dkpke" :highlight-id="highlightId" @jump="handleJumpToGraph" />、ek_PKE
                      <DataTag type="BYTES" symbol="ek_PKE" name="PKE Public Key" :size="800" @open-modal="openModal" />
                      <GraphBtn id="dc_ekpke" :highlight-id="highlightId" @jump="handleJumpToGraph" />、h
                      <DataTag type="BYTES" symbol="h" name="h" :size="32" @open-modal="openModal" />
                      <GraphBtn id="dc_h" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 z
                      <DataTag type="SEED" symbol="z" name="Seed z" :size="32" @open-modal="openModal" />
                      <GraphBtn id="dc_z" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>c
                      <GraphBtn id="dc_c" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 dk_PKE 传递给 <code
                        class="text-yellow-400">K-PKE.Decrypt</code>
                      <GraphBtn id="dc_decrypt" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-purple-400 text-lg mb-3">3. Decoding and decompressing (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>c 被分割
                      <GraphBtn id="dc_csplit" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 回 c1 和 c2，传递给
                      <code class="text-yellow-400">ByteDecode</code>
                      <GraphBtn id="dc_decode" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 <code
                        class="text-yellow-400">Decompress</code>
                      <GraphBtn id="dc_decompress" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>产生多项式向量 u'
                      <DataTag type="VECTOR" symbol="u'" name="u prime" @open-modal="openModal" />
                      <GraphBtn id="dc_up" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和多项式 v'
                      <DataTag type="POLY" symbol="v'" name="v prime" @open-modal="openModal" />
                      <GraphBtn id="dc_vp" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-purple-400 text-lg mb-3">4. Decrypting (K-PKE)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>执行解密：
                      <DataTag type="CALC" symbol="w = v' - s^T ∘ u'" name="Calculation" @open-modal="openModal" />
                      <GraphBtn id="dc_calc" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>变量 w 通过 <code class="text-yellow-400">Inv-NTT</code>
                      <GraphBtn id="dc_inv_ntt" :highlight-id="highlightId" @jump="handleJumpToGraph" />、<code
                        class="text-yellow-400">Compress</code>
                      <GraphBtn id="dc_compress" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 <code
                        class="text-yellow-400">Encode</code>
                      <GraphBtn id="dc_encode" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 映射为比特。得到 m
                      <DataTag type="BYTES" symbol="m" name="Message" :size="32" @open-modal="openModal" />
                      <GraphBtn id="dc_mp" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-purple-400 text-lg mb-3">5. Hashing (KEM-internal)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>K-PKE.Decrypt 返回的 m 被称为 m'，正常应与 Bob 生成的 m 匹配。</li>
                    <li>m'
                      <GraphBtn id="dc_mp" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 h 连接
                      <GraphBtn id="dc_concat" :highlight-id="highlightId" @jump="handleJumpToGraph" />，通过 G
                      <GraphBtn id="dc_g" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 哈希
                    </li>
                    <li>哈希分为 r'
                      <DataTag type="SEED" symbol="r'" name="r prime" :size="32" @open-modal="openModal" />
                      <GraphBtn id="dc_rp" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 和 K'
                      <DataTag type="KEY" symbol="K'" name="K prime" :size="32" @open-modal="openModal" />
                      <GraphBtn id="dc_kp" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-purple-400 text-lg mb-3">6. Encrypting (KEM-internal)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>调用 <code class="text-yellow-400">K-PKE.Encrypt</code>
                      <GraphBtn id="dc_encrypt" :highlight-id="highlightId" @jump="handleJumpToGraph" />，传递 m'、ek_PKE 和
                      r'
                    </li>
                    <li>产生第二个密文 c'
                      <DataTag type="BYTES" symbol="c'" name="c prime" :size="768" @open-modal="openModal" />
                      <GraphBtn id="dc_cp" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 用于稍后的验证对齐。
                    </li>
                  </ul>
                </div>
                <div class="p-5 border-2 border-yellow-500/50 bg-yellow-900/20 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-yellow-400 text-lg mb-3">7. Verification (Implicit rejection)</h3>
                  <p class="text-sm text-yellow-300 font-mono font-bold mb-2">if (c == c') return K' else return J(z, c)
                  </p>
                  <ul class="list-disc pl-6 space-y-3 text-yellow-300 leading-relaxed">
                    <li>比较 c 和 c'
                      <GraphBtn id="dc_cmp" :highlight-id="highlightId" @jump="handleJumpToGraph" />
                    </li>
                    <li>如果一致，安全验证通过；否则利用后备种子 z 返回由 J 生成的假密钥
                      <GraphBtn id="dc_j" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 以实现隐式拒绝。
                    </li>
                  </ul>
                </div>
                <div class="p-5 border border-slate-700 rounded-xl shadow-sm bg-slate-800">
                  <h3 class="font-bold text-purple-400 text-lg mb-3">8. Finalization (KEM)</h3>
                  <ul class="list-disc pl-6 space-y-3 leading-relaxed text-slate-300">
                    <li>解封装流程彻底完成。方案将最终的安全共享密钥 K'
                      <DataTag type="KEY" symbol="K'" name="K prime" :size="32" @open-modal="openModal" />
                      <GraphBtn id="dc_k" :highlight-id="highlightId" @jump="handleJumpToGraph" /> 输出给调用者应用层。
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeMainTab === 'explanation'" class="h-full flex flex-col animate-fade-in overflow-hidden">
          <div class="flex border-b mb-4 shrink-0">
            <button v-for="t in expTabs" :key="t.id" @click="expTab = t.id"
              :class="['px-5 py-2 font-bold border-b-2 transition-colors', expTab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300']">
              {{ t.label }}
            </button>
          </div>
          <div class="flex-1 overflow-y-auto pr-4 pb-10 custom-scrollbar">
            <div class="space-y-8 text-slate-300 pb-10 p-6 leading-relaxed">
              <div v-if="expTab === 'calc'" class="space-y-8">
                <div>
                  <h2 class="text-3xl font-bold mb-3 text-slate-100">计算说明 (Calculations)</h2>
                  <p class="text-slate-400 mb-4">下面你可以一步一步地看到该方案的底层公钥加密（PKE）部分是如何工作的。</p>

                  <h3 class="text-2xl font-bold mb-4 text-slate-200">原始计算</h3>
                  <p class="text-slate-400 mb-4">下面是CPAPKE部分使用的原始计算。关于数学符号，请参考NIST官方规范中的第2.3章 <a
                      href="https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf" target="_blank"
                      class="text-blue-400 font-bold hover:underline">NIST.FIPS.203.pdf</a></p>

                  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div
                      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                      <div
                        class="bg-indigo-900/30 border-b px-4 py-3 font-bold text-indigo-400 text-lg border-indigo-500/30">
                        1. K-PKE.KeyGen</div>
                      <div class="p-4 flex-1 flex flex-col gap-4 justify-center">
                        <div class="flex items-center gap-4">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(\hat{t} = \hat{A}
                            \circ \hat{s} + \hat{e}\)</div>
                          <div class="flex-1 text-slate-400 text-sm">\(\hat{A} \in \text{Mat}(k \times k,
                            T_q)\)<br>\(\hat{s}, \hat{e}, \hat{t} \in T_q^k\)<br>\(k \in \{2, 3, 4\}\)</div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                      <div class="bg-teal-900/30 border-b px-4 py-3 font-bold text-teal-400 text-lg border-teal-500/30">
                        2. K-PKE.Encrypt</div>
                      <div class="p-4 flex-1 flex flex-col gap-4">
                        <div class="flex items-center gap-4 border-b border-slate-700 pb-3">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(\hat{u} = \hat{A}^T
                            \circ \hat{y}\)</div>
                          <div class="flex-1 text-slate-400 text-sm">\(\hat{A} \in \text{Mat}(k \times k,
                            T_q)\)<br>\(\hat{y}, \hat{u} \in T_q^k\)<br>\(k \in \{2, 3, 4\}\)</div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-700 pb-3">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(\hat{v} = \hat{t}^T
                            \circ \hat{y}\)</div>
                          <div class="flex-1 text-slate-400 text-sm">\(\hat{t}, \hat{y} \in T_q^k\)<br>\(\hat{v} \in
                            T_q\)<br>\(k \in \{2, 3, 4\}\)</div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-700 pb-3">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(u = \bar{u} + e_1\)
                          </div>
                          <div class="flex-1 text-slate-400 text-sm">\(\bar{u} = \text{NTT}^{-1}(\hat{u})\)<br>\(u,
                            \bar{u}, e_1 \in R_q^k\)</div>
                        </div>
                        <div class="flex items-center gap-4">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(v = \bar{v} + e_2 +
                            \mu\)</div>
                          <div class="flex-1 text-slate-400 text-sm">\(\bar{v} = \text{NTT}^{-1}(\hat{v})\)<br>\(v,
                            \bar{v}, e_2, \mu \in R_q\)</div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                      <div
                        class="bg-purple-900/30 border-b px-4 py-3 font-bold text-purple-400 text-lg border-purple-500/30">
                        3. K-PKE.Decrypt</div>
                      <div class="p-4 flex-1 flex flex-col gap-4">
                        <div class="flex items-center gap-4 border-b border-slate-700 pb-3">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(\hat{p} = \hat{s}^T
                            \circ \hat{u}'\)</div>
                          <div class="flex-1 text-slate-400 text-sm">\(\hat{s}, \hat{u}' \in T_q^k\)<br>\(\hat{p} \in
                            T_q\)<br>\(k \in \{2, 3, 4\}\)</div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-700 pb-3">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(\hat{w} = \hat{v}' -
                            \hat{p}\)</div>
                          <div class="flex-1 text-slate-400 text-sm">\(\hat{w}, \hat{v}', \hat{p} \in R_q^k\)</div>
                        </div>
                        <div class="flex items-center gap-4 border-b border-slate-700 pb-3">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(p = s^T \circ u'\)
                          </div>
                          <div class="flex-1 text-slate-400 text-sm">\(s, u' \in R_q^k\)<br>\(p \in R_q\)</div>
                        </div>
                        <div class="flex items-center gap-4">
                          <div class="flex-1 font-bold text-cyan-400 border-r-2 pr-4 text-right">\(w = v' - p\)</div>
                          <div class="flex-1 text-slate-400 text-sm">\(w, v', p \in R_q^k\)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 class="text-2xl font-bold mt-8 mb-4 text-slate-200">简化计算 (Simplified calculations)</h3>
                  <p class="text-slate-400 mb-4">首先，我们调整符号以帮助澄清哪些项是等效的，因为我们不会考虑NTT（<button @click="showReadme = true"
                      class="text-blue-400 font-bold hover:underline">参见
                      README</button>）和中间转换函数。原始计算中看到的帽子符号表示变量处于NTT表示形式。简单来说，NTT是一种更高效地进行多项式乘法的方法。该方案也可以在不使用NTT的情况下工作，只是会更慢。因此，我们在下面移除所有帽子符号以简化计算。
                  </p>

                  <div
                    class="bg-red-900/20 text-red-300 p-6 rounded-xl border border-red-500/40 shadow-sm leading-relaxed">
                    <h3 class="text-2xl font-bold text-red-400 mb-5">压缩误差 (Compression Error)</h3>
                    <p class="mb-5">当 K-PKE.Encrypt 中的项 \(u\) 和 \(v\) 从响应者（Bob）发送到发起者（Alice）时，它们由 Bob 编码和压缩。Alice
                      然后将这些项解压缩和解码为 \(u'\) 和 \(v'\)。这个过程可能会在 \(u'\) 和 \(v'\) 中产生小错误 \(e_u\) 和
                      \(e_v\)。为了澄清这一点，我们添加了公式8和9，它们在原始规范中并不严格存在。</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div class="bg-slate-800 p-4 rounded-lg border border-red-500/30 shadow-sm">
                        <p class="text-indigo-400 font-bold border-b border-red-500/30 pb-2 mb-3 text-lg">KeyGen (1
                          equation)</p>
                        <div class="text-center font-bold text-cyan-400 text-lg">\(1.\; t = A \cdot s + e\)</div>
                        <p class="text-sm text-slate-400 mt-2 text-center">\(A \in \text{Mat}(k\times k, R_q)\)<br>\(s,
                          e, t \in R_q^k, k \in \{2, 3, 4\}\)</p>
                      </div>
                      <div class="bg-slate-800 p-4 rounded-lg border border-red-500/30 shadow-sm">
                        <p class="text-teal-400 font-bold border-b border-red-500/30 pb-2 mb-3 text-lg">Encrypt (4
                          equations)</p>
                        <div class="text-center font-bold text-cyan-400">\(2.\; \bar{u} = A^T \cdot y\)</div>
                        <p class="text-sm text-slate-400 mb-2 text-center">\(A \in \text{Mat}(k\times k, R_q), y,
                          \bar{u} \in R_q^k\)</p>
                        <div class="text-center font-bold text-cyan-400">\(3.\; \bar{v} = t^T \cdot y\)</div>
                        <p class="text-sm text-slate-400 mb-2 text-center">\(t, y \in R_q^k, \bar{v} \in R_q\)</p>
                        <div class="text-center font-bold text-cyan-400">\(4.\; u = \bar{u} + e_1\)</div>
                        <p class="text-sm text-slate-400 mb-2 text-center">\(u, \bar{u}, e_1 \in R_q^k\)</p>
                        <div class="text-center font-bold text-cyan-400">\(5.\; v = \bar{v} + e_2 + \mu\)</div>
                        <p class="text-sm text-slate-400 text-center">\(v, \bar{v}, e_2, \mu \in R_q\)</p>
                      </div>
                      <div class="bg-slate-800 p-4 rounded-lg border border-red-500/30 shadow-sm">
                        <p class="text-purple-400 font-bold border-b border-red-500/30 pb-2 mb-3 text-lg">Decrypt (4
                          equations)</p>
                        <div class="text-center font-bold text-cyan-400">\(6.\; p = s^T \cdot u'\)</div>
                        <p class="text-sm text-slate-400 mb-2 text-center">\(s, u' \in R_q^k, p \in R_q\)</p>
                        <div class="text-center font-bold text-cyan-400">\(7.\; w = v' - p\)</div>
                        <p class="text-sm text-slate-400 mb-2 text-center">\(w, v', p \in R_q^k\)</p>
                        <div class="text-center font-bold text-cyan-400">\(8.\; u' = u + e_u\)</div>
                        <div class="text-center font-bold text-cyan-400 mt-2">\(9.\; v' = v + e_v\)</div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-8">
                    <p class="font-bold text-xl mb-3 text-slate-200">解密计算流推导表（如何从密文 \(c\) 中恢复 \(m\)）：</p>
                    <div class="overflow-x-auto shadow-sm rounded-xl border border-slate-700">
                      <table class="min-w-full bg-slate-800 text-left">
                        <thead class="bg-slate-700 border-b border-slate-600">
                          <tr>
                            <th class="py-3 px-5 font-bold text-slate-200 w-16">步骤</th>
                            <th class="py-3 px-5 font-bold text-slate-200">当前计算</th>
                            <th class="py-3 px-5 font-bold text-slate-200 w-48">解释</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-700 text-[15px]">
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">1</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = v' - p \)</td>
                            <td class="py-3 px-5 text-slate-300">Start with 7</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">2</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = v' - s^T \cdot u' \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 6</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">3</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = v + e_v - s^T \cdot u' \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 9</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">4</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = \bar{v} + e_2 + \mu + e_v - s^T \cdot
                              u' \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 5</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">5</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = \bar{v} + e_2 + \mu + e_v - s^T \cdot
                              (u + e_u) \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 8</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">6</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = \bar{v} + e_2 + \mu + e_v - s^T \cdot
                              (\bar{u} + e_1 + e_u) \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 4</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">7</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = \bar{v} + e_2 + \mu + e_v - s^T \cdot
                              (A^T \cdot y + e_1 + e_u) \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 3</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">8</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = t^T \cdot y + e_2 + \mu + e_v - s^T
                              \cdot (A^T \cdot y + e_1 + e_u) \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 2</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">9</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = (A \cdot s + e)^T \cdot y + e_2 + \mu +
                              e_v - s^T \cdot (A^T \cdot y + e_1 + e_u) \)</td>
                            <td class="py-3 px-5 text-slate-300">Substitute 1</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">10</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = (A \cdot s)^T \cdot y + e^T \cdot y +
                              e_2 + \mu + e_v - s^T \cdot (A^T \cdot y + e_1 + e_u) \)</td>
                            <td class="py-3 px-5 text-slate-300">Apply multiplication</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors">
                            <td class="py-3 px-5">11</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = (A \cdot s)^T \cdot y + e^T \cdot y +
                              e_2 + \mu + e_v - s^T \cdot (A^T \cdot y) - s^T \cdot e_1 - s^T \cdot e_u \)</td>
                            <td class="py-3 px-5 text-slate-300">Apply multiplication</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors bg-green-900/20">
                            <td class="py-3 px-5">12</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = e^T \cdot y + e_2 + \mu + e_v - s^T
                              \cdot e_1 - s^T \cdot e_u \)</td>
                            <td class="py-3 px-5 text-slate-300">Cancel out opposing terms</td>
                          </tr>
                          <tr class="hover:bg-slate-700/50 transition-colors bg-green-900/20">
                            <td class="py-3 px-5">13</td>
                            <td class="py-3 px-5 text-cyan-400 font-bold">\( w = \mu + e^T \cdot y - s^T \cdot e_1 - s^T
                              \cdot e_u + e_2 + e_v \)</td>
                            <td class="py-3 px-5 text-slate-300">Reorganize remaining terms</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p class="mt-4 text-slate-400 leading-relaxed">\(m\) 被转换为多项式 \(\mu\)，方法是将每个 0 位映射到系数 0，将每个 1 位映射到系数
                      \(q/2\)。在步骤 12 中，被抵消的项都包含 \(A\)，它具有大系数。步骤 13 中所有剩余的项（除了 \(\mu\)）都是具有小系数的多项式。这些小系数影响很小，使得 \(w
                      \approx \mu\)。这允许从 \(w\) 重建 \(m\)。对于 \(m\) 中的每个系数，确定它是更接近 0（或 \(q\)，因为系数是模 \(q\) 的）还是
                      \(q/2\)。这分别对应于 0 或 1 位。</p>
                  </div>
                </div>
              </div>

              <div v-if="expTab === 'fo'" class="space-y-6">
                <h2 class="text-3xl font-bold text-slate-100">The Fujisaki-Okamoto transform</h2>
                <p class="leading-relaxed text-slate-300">
                  Fujisaki-Okamoto（FO）转换描述了如何使用公钥加密（PKE）方法来构建提供更强安全保证的安全密钥封装方法（KEM）。确切地说，FO转换能够将 <strong
                    class="text-blue-400">IND-CPA PKE</strong> 转换为 <strong class="text-blue-400">IND-CCA2 KEM</strong>。
                </p>

                <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
                  <button @click="activeMainTab = 'graph'; graphTab = 'fo'"
                    class="w-full text-left mb-4 bg-teal-900/30 hover:bg-teal-900/50 text-teal-400 px-4 py-3 rounded-lg border border-teal-500/30 transition-colors flex items-center gap-2 font-bold">
                    🔗 跳转到 FO Transform 图表
                  </button>
                  <h3 class="text-2xl font-bold mt-6 text-slate-200">FO转换是如何工作的？</h3>
                  <p class="text-slate-300 mt-2">有关FO转换如何工作的直观示例，请查看本模块"graph"部分的"FO转换"图。</p>

                  <div class="space-y-6 mt-6">
                    <div>
                      <h4 class="font-bold text-indigo-400 text-xl">Verification</h4>
                      <p class="text-slate-300 mt-2">FO变换包含一个验证步骤，在方案结束时，密文解密后，得到的明文将被重新加密。然后，比较接收到的密文和刚刚生成的密文。</p>
                    </div>
                    <div>
                      <h4 class="font-bold text-red-400 text-xl">Rejection</h4>
                      <p class="text-slate-300 mt-2 mb-3">FO变换在不同实现之间可能变化的一部分是方案在出现问题时如何执行拒绝。主要有两种方式：</p>
                      <div class="pl-5 border-l-4 border-red-500/50 space-y-4">
                        <div><span class="font-bold text-slate-200">Explicit rejection (显式拒绝):</span>
                          <p class="text-slate-400 mt-1">如果出现任何问题，方案返回一个特殊的拒绝符号。<code class="text-red-400">⊥</code>
                            通常用于表示特殊拒绝符号。</p>
                        </div>
                        <div>
                          <span class="font-bold text-slate-200">Implicit rejection (隐式拒绝 - <span
                              class="text-blue-400">Kyber使用</span>):</span>
                          <p class="text-slate-400 mt-1 leading-relaxed">不是返回 <code
                              class="text-red-400">⊥</code>，方案继续正常执行，但不是使用响应方Bob提供的数据生成共享密钥，而是使用一些随机生成的数据。这样做是为了防止滥用方案返回失败符号
                            <code class="text-red-400">⊥</code> 的攻击。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-slate-800 p-6 border border-slate-700 rounded-xl shadow-sm">
                  <h3 class="font-bold text-indigo-400 mb-3 text-xl">FO transform in Kyber</h3>
                  <p class="text-slate-300 mb-4">Kyber中的FO转换由以下部分组成：</p>
                  <div class="space-y-4 leading-relaxed">
                    <div>
                      <strong class="text-slate-200">Key generation:</strong>
                      <span class="text-slate-300"> 发起方（Alice）生成
                        <GraphBtn id="kg_z" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 一些随机字节，这些字节将被传递
                        <GraphBtn id="kg_internal" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 给
                        KeyGen_internal 并存储
                        <GraphBtn id="kg_concat_dk" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        在私钥中，以便在隐式拒绝的情况下在解封装步骤中使用。
                      </span>
                    </div>
                    <div>
                      <strong class="text-slate-200">Encapsulation:</strong>
                      <span class="text-slate-300"> 响应方（Bob）生成
                        <GraphBtn id="ec_g" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 随机硬币 r
                        <GraphBtn id="ec_r" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 和基于消息 m 与公钥哈希
                        H(ek) 的共享密钥 K
                        <GraphBtn id="ec_k" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />。随机硬币 r
                        与公钥结合使用来加密消息。
                      </span>
                    </div>
                    <div>
                      <strong class="text-slate-200">Decapsulation:</strong>
                      <span class="text-slate-300"> 发起方（Alice）使用解密的消息 m' 和公钥的哈希 h 来生成
                        <GraphBtn id="dc_g" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 随机硬币 r'
                        <GraphBtn id="dc_rp" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 和共享密钥 K'
                        <GraphBtn id="dc_kp" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        。如果解密顺利，这些分别与封装中的 r 和 K 相同。
                      </span>
                    </div>
                    <div>
                      <span class="text-slate-300">随机数据 z
                        <GraphBtn id="dc_z" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 从密钥 dk 中提取
                        <GraphBtn id="dc_split" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />，与接收到的密文 c 连接
                        <GraphBtn id="dc_concat_zc" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />，并通过函数 J
                        <GraphBtn id="dc_j" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        传递，生成在方案失败情况下使用的第二个密钥 bar{K}
                        <GraphBtn id="dc_kbar" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />。
                      </span>
                    </div>
                    <div>
                      <span class="text-slate-300">随机硬币 r' 用于加密
                        <GraphBtn id="dc_encrypt" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" /> 解密的消息
                        m'，产生一个新的密文 c'
                        <GraphBtn id="dc_cp" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />，该密文与旧密文 c 进行比较。
                      </span>
                    </div>
                    <div>
                      <span class="text-slate-300">如果它们匹配
                        <GraphBtn id="dc_cmp" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        ，则方案继续正常进行，并返回共享密钥 K'。
                      </span>
                    </div>
                    <div>
                      <span class="text-slate-300">如果它们不匹配，则密钥 bar{K} 覆盖 K'，并返回 bar{K}。</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="expTab === 'design'" class="space-y-6">
                <h2 class="text-3xl font-bold text-slate-100">Kyber设计选择</h2>
                <p class="leading-relaxed text-slate-300">
                  下面我们列出了Kyber开发过程中做出的一些设计选择以及做出这些选择的原因。这些选择不遵循标准的Fujisaki-Okamoto变换，因此需要解释为什么做出这些选择。</p>

                <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
                  <button @click="activeMainTab = 'graph'; graphTab = 'complete'; highlightId = 'ec_h'"
                    class="w-full text-left mb-4 bg-teal-900/30 hover:bg-teal-900/50 text-teal-400 px-4 py-3 rounded-lg border border-teal-500/30 transition-colors flex items-center gap-2 font-bold">
                    🔗 跳转到相关图表部分 (H(ek) 哈希)
                  </button>
                  <h3 class="text-2xl font-bold mt-6 text-slate-200">使Kyber成为"贡献型"（contributory）</h3>
                  <p class="leading-relaxed text-slate-300 mt-2">
                    在这种情况下，"贡献型"指的是在Kyber中，发起者（Alice）和响应者（Bob）都对Kyber创建的共享密钥有影响。这是因为发起者的公钥与响应者计算的消息哈希相结合。</p>

                  <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5 shadow-sm mt-6">
                    <div>
                      <strong
                        class="text-indigo-400 border-b-2 border-indigo-500/30 pb-1 mb-3 block w-max text-lg">密钥生成步骤中的相关部分:</strong>
                      <ul class="list-disc pl-6 mt-2 space-y-3 text-slate-300">
                        <li>公钥被哈希
                          <GraphBtn id="kg_h_ek" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                        <li>哈希存储在密钥中
                          <GraphBtn id="kg_concat_dk" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                      </ul>
                    </div>
                    <div>
                      <strong
                        class="text-teal-400 border-b-2 border-teal-500/30 pb-1 mb-3 block w-max text-lg">封装步骤中的相关部分:</strong>
                      <ul class="list-disc pl-6 mt-2 space-y-3 text-slate-300">
                        <li>公钥被哈希
                          <GraphBtn id="ec_h" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                        <li>公钥哈希
                          <GraphBtn id="ec_hek" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                        <li>公钥哈希与消息哈希结合
                          <GraphBtn id="ec_concat" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                      </ul>
                    </div>
                    <div>
                      <strong
                        class="text-purple-400 border-b-2 border-purple-500/30 pb-1 mb-3 block w-max text-lg">解封装步骤中的相关部分:</strong>
                      <ul class="list-disc pl-6 mt-2 space-y-3 text-slate-300">
                        <li>从密钥中检索公钥哈希
                          <GraphBtn id="dc_split" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                        <li>公钥哈希
                          <GraphBtn id="dc_h" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                        <li>公钥哈希与消息哈希结合
                          <GraphBtn id="dc_concat_mph" :highlight-id="highlightId" @jump="handleJumpToGraph_FO" />
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    class="bg-yellow-900/20 text-yellow-300 p-5 rounded-lg shadow-sm leading-relaxed border border-yellow-500/40 mt-6">
                    <p>
                      如果没有这些步骤，只有响应者（Bob）会对共享密钥产生影响，因为他生成消息。从安全角度来看，这是不可取的，因为无法保证双方都有良好的意图。通过这种修改，双方都可以为共享密钥贡献部分内容。此外，这些相同的步骤还有助于防止
                      <strong class="text-yellow-400 border-b border-dashed border-yellow-400">"多目标解密失败攻击"</strong>。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Guide 面板 -->
        <div v-if="activeMainTab === 'guide'" class="h-full flex flex-col animate-fade-in overflow-hidden">
          <div class="flex-1 overflow-y-auto pr-4 pb-10 custom-scrollbar">
            <div class="space-y-6 text-slate-300 pb-10 p-6">
              <h2 class="text-3xl font-bold border-b border-slate-700 pb-3 mb-6 text-slate-100">使用本模块的指南 (A Guide to
                using this module)</h2>

              <div v-for="section in guideSections" :key="section.id"
                class="border border-slate-700 rounded-xl bg-slate-800 overflow-hidden shadow-sm transition-all duration-300">
                <button @click="section.isOpen = !section.isOpen"
                  class="w-full flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 transition-colors">
                  <h3 class="text-lg font-bold flex items-center gap-3 text-slate-200">
                    <span v-html="section.icon"></span>
                    {{ section.title }}
                  </h3>
                  <span class="text-slate-400 transition-transform duration-300"
                    :class="{ 'rotate-180': section.isOpen }">▼</span>
                </button>
                <div v-if="section.isOpen" class="p-4 bg-slate-800">
                  <div v-html="section.content"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <HexViewerModal :is-open="!!modalData" :data-info="modalData" @close="modalData = null" />

    <!-- Readme Modal -->
    <div v-if="showReadme"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click="showReadme = false">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col"
        @click.stop>
        <div class="p-5 border-b bg-slate-800 text-white rounded-t-2xl flex justify-between items-center shrink-0">
          <h2 class="text-2xl font-bold flex items-center gap-3">📖 Kyber (ML-KEM): Readme</h2>
          <button @click="showReadme = false"
            class="text-gray-400 hover:text-white text-4xl leading-none">&times;</button>
        </div>
        <div class="p-8 overflow-y-auto text-slate-300 space-y-6 custom-scrollbar leading-relaxed">

          <p class="text-lg">本模块展示了 <strong class="text-slate-100">ML-KEM 密钥封装机制 (KEM)</strong> 的工作原理。KEM
            允许双方安全地建立一个共同的秘密密钥，用于各种其他对称加密方案。</p>
          <p><strong class="text-slate-100">ML-KEM（也称为
              Kyber）</strong>是一种所谓的后量子方案。这意味着尽管它在传统计算机上运行，但它应该能够抵抗未来强大的量子计算机的密码分析攻击。"后量子"一词不应与量子密钥派生 (QKD)
            混淆。尽管它们都有建立共享密钥的目标，但 QKD 方案运行在量子计算机上，而不是传统计算机上。</p>
          <p>Kyber 是一种基于格 (lattice-based) 的 KEM，在 NIST 后量子密码学竞赛后以 <strong class="text-slate-100">ML-KEM</strong>
            的名称被标准化。Kyber 在内部使用 IND-CPA 安全的 PKE，通过 Fujisaki-Okamoto (FO) 变换将其转化为 IND-CCA2 安全的 KEM。</p>
          <p class="text-sm text-slate-400 italic">如果您不熟悉这些术语，请继续阅读。</p>

          <h3 class="text-xl font-bold border-b-2 border-slate-700 pb-2 text-indigo-400 mt-8 mb-4">有用链接 (Useful links)
          </h3>
          <ul class="list-disc pl-6 space-y-3">
            <li><a href="#" class="text-blue-400 hover:underline font-bold">Kyber 主页</a></li>
            <li><a href="https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf" target="_blank"
                class="text-blue-400 hover:underline font-bold">NIST FIPS 203 (ML-KEM)</a>，本页面的核心基准规范。</li>
            <li><a href="#" class="text-blue-400 hover:underline font-bold">SHA3 标准</a>，Kyber 中使用的各种底层函数的来源。</li>
          </ul>

          <h3 class="text-xl font-bold border-b-2 border-slate-700 pb-2 text-indigo-400 mt-8 mb-4">FIPS 203 兼容性</h3>
          <p>本学习模块使用 ML-KEM 库为演示部分生成数据。它基于兼容 FIPS 203 的 Kyber TypeScript
            实现。我们对该库进行了少量修改，以暴露中间计算过程供演示之用。原有的测试套件仍然可以毫无问题地通过。我们还通过将种子 $d$、$z$ 和 $m$ 固定为来自 ML-KEM
            已知答案测试的值并验证输出值与预期输出是否匹配，手动测试了其兼容性。</p>

          <h3 class="text-xl font-bold border-b-2 border-slate-700 pb-2 text-indigo-400 mt-8 mb-4">输入校验 (Input checks)
          </h3>
          <p>FIPS 203 描述了 Kyber 实现者应对 <code class="text-yellow-400">ML-KEM.Encaps</code> 和 <code
              class="text-yellow-400">ML-KEM.Decaps</code> 的输入执行的各种检查。这些包括：</p>
          <ul class="list-disc pl-6 space-y-2 mt-2 mb-4">
            <li>密钥对检查 (针对外部获取的密钥对)</li>
            <li>封装密钥检查</li>
            <li>解封装密钥检查</li>
            <li>解封装输入检查</li>
          </ul>
          <p>有关检查的详细信息以及何时应执行这些检查，请参阅官方的 FIPS 203 规范。</p>

          <h3 class="text-xl font-bold border-b-2 border-slate-700 pb-2 text-indigo-400 mt-8 mb-4">常见问题 (FAQ)</h3>
          <div class="space-y-4">
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
              <h4 class="font-bold text-lg text-slate-200 mb-2">Kyber 的漏洞 (Kyber vulnerabilities)</h4>
              <p>Kyber 中曾经发现了多个漏洞，但其中大多数与 Kyber 的<strong
                  class="text-slate-200">特定代码实现</strong>有关。众所周知，正确实现一个密码学方案是非常困难的，即使它在理论上绝对安全。理论上安全的方案在实际编写代码时变得不安全，一个常见原因是所谓的<strong
                  class="text-slate-200">侧信道攻击 (side-channel
                  attacks)</strong>。简而言之，这类攻击利用实现中的错误或物理信息泄漏（如耗时、功耗）来在破解方案时获取优势。</p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
              <h4 class="font-bold text-lg text-slate-200 mb-2">名称混淆 (Name confusion)</h4>
              <p class="mb-3">研究人员为提交给 NIST 后量子竞赛创建了各种方案，这些方案在设计阶段由其创建者命名。在 NIST
                的标准化过程中，方案被赋予了新的官方名称，这有时会让人感到困惑。然而这是有道理的，因为 NIST
                可能会对标准化版本进行微调，或者如果提交的是一系列方案，他们可能只对其中一部分进行标准化。因此，标准化后的每个方案都有两个可互换使用的名称，但在技术细节上确实指代不同的版本。</p>
              <table class="min-w-full bg-slate-900 border border-slate-700 mt-2 shadow-sm rounded text-sm">
                <thead class="bg-slate-800 border-b">
                  <tr>
                    <th class="p-3 text-left">原始名称 (Original Name)</th>
                    <th class="p-3 text-left">NIST 标准化名称</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                  <tr>
                    <td class="p-3">Kyber</td>
                    <td class="p-3 font-bold text-indigo-400">ML-KEM</td>
                  </tr>
                  <tr>
                    <td class="p-3">Dilithium</td>
                    <td class="p-3 font-bold text-blue-400">ML-DSA</td>
                  </tr>
                  <tr>
                    <td class="p-3">SPHINCS+</td>
                    <td class="p-3 font-bold text-green-400">SLH-DSA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 class="text-xl font-bold border-b-2 border-slate-700 pb-2 text-indigo-400 mt-8 mb-4">数学背景信息 (Mathematical
            information)</h3>
          <p>要了解 Kyber 的工作原理，需要了解以下各个数学主题的知识。</p>

          <h4 class="text-lg font-bold text-slate-200 mt-6 mb-2">群 (Groups) & 取模运算 (Modulo)</h4>
          <div class="space-y-4">
            <p><strong class="text-slate-200">群：</strong> 群由一组元素和一个二元运算符组成。在密码学中，计算通常在"有限"群中进行，这意味着集合中的元素数量是有限的。</p>
            <p><strong class="text-slate-200">取模运算：</strong> 对于某些群，集合可以通过模数 (modulus)
              来描述（输入除以该数，其余数是实际结果）。这会导致数值在不断增加时发生"循环"。常见的日常例子是时钟：一旦达到12点，时间就会循环；向后拨动时，数值也会"向上跳跃"而不是变为负数。密码学中的模运算一旦达到模数，结果就会循环回
              0。</p>
            <p><strong class="text-slate-200">模算术：</strong>
              在模群中可以进行算术运算（如加法和乘法）。执行这些操作的方法是：先像平常一样进行加法或乘法，然后应用取模运算符。返回的值始终在 $0 \le x \le \text{modulus}-1$ 的范围内。</p>
          </div>

          <h4 class="text-lg font-bold text-slate-200 mt-6 mb-2">格 (Lattices) 与 SVP/CVP 问题</h4>
          <p>"格"是点的多维无限集合。这些点由这些维度中的一组向量描述。通过以各种整数倍组合将这些所谓的"基"向量加在一起，可以到达网格中的各个点。</p>
          <p>在描述了格之后，存在两个出奇难解的数学难题：</p>
          <ul class="list-disc pl-6 space-y-2 my-2">
            <li><strong class="text-slate-200">最近向量问题 (CVP)：</strong> 对于空间中的任何给定的点，格上哪一个点距离它最接近？</li>
            <li><strong class="text-slate-200">最短向量问题 (SVP)：</strong> 格上除了原点外，哪一个点距离原点最接近？</li>
          </ul>
          <p>有趣的是，一些"带错误学习" (LWE) 问题可归约为上述的格难题。这意味着解决 LWE 问题至少与解决这些底层格问题一样困难。</p>

          <h4 class="text-lg font-bold text-slate-200 mt-6 mb-2">带错误学习问题 (LWE, RLWE, MLWE)</h4>
          <p class="mb-4">以下问题都依赖于预先选择的模数 $q$。</p>

          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm mb-4">
            <strong class="text-slate-200 block border-b border-slate-700 pb-2 mb-3 text-lg">带错误学习
              (Learning-with-errors, LWE)</strong>
            <p class="mb-2">LWE 可用于相对简单地传递数据。Alice 首先构建一个只有她自己知道其唯一解的方程组。然后，她向每个方程添加一些<strong
                class="text-slate-200">小的随机错误值</strong>，使得在不知道解的情况下，方程组变得极难求解。这个被加入错误的系统就成为了公钥。</p>
            <p class="mb-2">为了发送二进制消息，Bob 从 Alice 的方程中随机选择一些并将它们加在一起（所有加法都是 $\pmod q$）。由于 Bob 在方程两侧都进行了求和，Alice
              的解仍然可以解决这个新方程。</p>
            <p class="font-mono text-sm bg-slate-900 p-3 border border-slate-700 rounded my-3">示例 (mod 15)<br>方程 1: $3x
              + 5y = 6$<br>方程 2: $5x + 1y = 13$<br>新方程: $8x + 6y = 4$</p>
            <p>如果 Bob 想发送比特 <code>1</code>，他在新方程右侧加上 $q/2$；如果发送比特 <code>0</code>，则什么也不加。Alice 收到后代入她的唯一解，通过观察结果是接近 $0$
              还是接近 $q/2$，她就能推断出 Bob 发送的比特。LWE 的主要缺点是公钥非常大，且每个方程只能传输 1 位数据。</p>
          </div>

          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm mb-4">
            <strong class="text-slate-200 block border-b border-slate-700 pb-2 mb-3 text-lg">环上带错误学习 (Ring
              Learning-With-Errors, RLWE)</strong>
            <p class="mb-2">在 RLWE 中，单个<strong class="text-slate-200">多项式</strong>取代了 LWE
              中包含方程的大型矩阵，这极大地减小了公钥的大小。多项式的阶数为 $n$，且存在于由 $\mathbb{Z}[X]/(X^n+1)$ 描述的环中。</p>
            <p class="mb-2">计算时，Alice 和 Bob 各自生成具有小随机系数的多项式（私钥 $s$ 和错误 $e$）。他们各自计算公钥：<br>
              Alice: $p_A = A \cdot s_A + 2e_A$<br>
              Bob: $p_B = A \cdot s_B + 2e_B$</p>
            <p>通过互相交换公钥，他们可以计算出相似但因误差项而不完全相同的共享密钥。为了完全匹配，Bob 会额外发送"对账信息"(reconciliation information) 帮助 Alice
              消除误差提取出精确的密钥。</p>
          </div>

          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
            <strong class="text-slate-200 block border-b border-slate-700 pb-2 mb-3 text-lg">模块带错误学习 (Module
              learning-with-errors, MLWE)</strong>
            <p><strong class="text-slate-200">Kyber 就是基于 MLWE 的。</strong>它的工作方式与 RLWE
              类似，但是它使用的不是单个多项式，而是由小多项式组成的矩阵（称为"模块" module）。在 MLWE 中，通过改变模块矩阵的维度大小 ($k$)，就可以在不改变模数 $q$ 或多项式阶数 $n$
              的情况下调整安全性级别。</p>
            <p class="mt-2">对于 Kyber：多项式阶数固定为 $n = 256$，模数为 $q = 3329$。安全参数 $k$ 会被设为 2、3 或 4（分别对应 ML-KEM-512、768、1024）。
            </p>
          </div>

          <h4 class="text-lg font-bold text-slate-200 mt-6 mb-2">数论变换 (NTT) 与多项式乘法</h4>
          <p>通常计算两个多项式乘法的时间复杂度为 $O(n^2)$。**数论变换 (NTT)** 是作用于有限域的离散傅里叶变换 (DFT) 的一种特殊形式。将多项式变换为其 NTT
            表示形式虽然让方案本身变得更复杂，但它允许在 $O(n \log n)$ 时间内完成极快的逐项多项式乘法。在 Kyber 中，由于多项式参数固定，因此只需要实现一个高度优化的特定 NTT 算法即可。</p>

          <h3 class="text-xl font-bold border-b-2 border-slate-700 pb-2 text-indigo-400 mt-8 mb-4">密码学术语 (Terminology)
          </h3>

          <div class="space-y-4">
            <div>
              <strong class="text-slate-200">公钥加密 (Public-key encryption, PKE):</strong>
              <span class="text-slate-300">通过使用公钥和私钥进行通信的方法。用公钥加密一些数据后，只有拥有私钥的接收者才能解密数据。</span>
            </div>
            <div>
              <strong class="text-slate-200">密钥交换 (Key exchange, KEX):</strong>
              <span class="text-slate-300">允许两个用户安全地商定共享密钥的方法（如 Diffie-Hellman）。通常是双边的，双方都生成公私钥对并相互结合。</span>
            </div>
            <div>
              <strong class="text-slate-200">密钥封装机制 (Key encapsulation mechanism, KEM):</strong>
              <span class="text-slate-300">与 KEX 类似但通常是"单边"的。只有一个用户（Alice）生成密钥对并发送公钥。另一方（Bob）使用一个 Encapsulate
                函数通过公钥生成并加密一个随机的共享密钥，然后将密文发回给 Alice 解密。</span>
            </div>
            <div class="bg-blue-900/20 p-4 border border-blue-500/30 rounded-lg text-blue-400">
              <strong class="block mb-1">为什么要使用 KEM？</strong>
              <span>虽然纯粹的 PKE 可以直接用来通信，但 PKE 加密缓慢且有长度限制。通常的做法是使用 PKE/KEM 商定一个极短的共享密钥，然后切换到极快的对称加密（如 AES）来传输大数据。KEM
                提供了安全执行此密钥交换的一整套封装与解封装的标准操作，内置了验证机制以确保双方没有作弊。</span>
            </div>
            <div>
              <strong class="text-slate-200">密文不可区分性 (Ciphertext indistinguishability):</strong> <span
                class="text-slate-300">衡量加密方案安全性的标准。</span>
              <ul class="list-disc pl-6 space-y-1 mt-1 text-slate-300">
                <li><strong class="text-slate-200">IND-CPA (选择明文攻击):</strong> 攻击者无法分辨给定的密文对应于两个已知明文中的哪一个。</li>
                <li><strong class="text-slate-200">IND-CCA / IND-CCA2 (适应性选择密文攻击):</strong>
                  即使攻击者可以无限制地使用"解密预言机"解密其他任何密文，他们仍然无法破解目标密文。</li>
              </ul>
            </div>
            <div>
              <strong class="text-slate-200">Fujisaki-Okamoto (FO) 变换:</strong>
              <span class="text-slate-300">这是 Kyber 用来将其内部只有 IND-CPA 安全级别的 PKE 算法，升级/转化为具备最高 IND-CCA2 安全级别的 KEM
                算法的标准技术。</span>
            </div>
          </div>

          <h3 class="text-xl font-bold border-b-2 border-slate-700 pb-2 text-indigo-400 mt-8 mb-4">SHA3 哈希函数</h3>
          <p>Kyber 中大量使用了 SHA3 联邦标准中的哈希函数大家族：</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div class="bg-slate-800 p-4 border border-slate-700 rounded-lg">
              <strong class="text-indigo-400">SHAKE-128 (XOF)</strong>
              <p class="text-sm mt-1">可扩展输出函数。在 Kyber 中打上 <strong class="text-slate-200">"XOF"</strong> 标签。用于接收简短的种子
                (seed) 并无限扩展生成巨大的矩阵 $\hat{A}$ 的伪随机数据。这极大地压缩了需要通过网络传输的公钥大小。</p>
            </div>
            <div class="bg-slate-800 p-4 border border-slate-700 rounded-lg">
              <strong class="text-indigo-400">SHA3-256 (H)</strong>
              <p class="text-sm mt-1">标准的 32 字节（256位）哈希函数。在 Kyber 中打上 <strong class="text-slate-200">"H"</strong>
                标签。常用于对公钥进行哈希操作以确保证明安全性。</p>
            </div>
            <div class="bg-slate-800 p-4 border border-slate-700 rounded-lg">
              <strong class="text-indigo-400">SHA3-512 (G)</strong>
              <p class="text-sm mt-1">标准的 64 字节（512位）哈希函数。在 Kyber 中打上 <strong class="text-slate-200">"G"</strong>
                标签。它的输出通常被直接从中间切开，分为两个 32 字节的变量使用。</p>
            </div>
            <div class="bg-slate-800 p-4 border border-slate-700 rounded-lg">
              <strong class="text-indigo-400">SHAKE-256 (PRF / KDF)</strong>
              <p class="text-sm mt-1">在 Kyber 中有两个职责：作为 <strong class="text-slate-200">"PRF"</strong> 时，它负责生成带中心二项式分布
                (CBD) 的小噪声/错误多项式；作为 <strong class="text-slate-200">"KDF"</strong> 时，它用于在最后一步派生出最终的共享密钥 $K$。</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

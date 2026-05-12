<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import * as d3 from 'd3';
import type { AlgoStep, Actor } from '../../algorithms/types';

const props = defineProps<{
  step: AlgoStep;
  stepIndex: number;
  actors: Actor;
  width: number;
  height: number;
}>();

const containerRef = ref<HTMLElement | null>(null);
let svg: any = null;

const MARGIN = { top: 40, right: 40, bottom: 140, left: 40 };
const NODE_RADIUS = 14;
const TREE_HEIGHT = 3;
const LEAF_COUNT = Math.pow(2, TREE_HEIGHT);

const CURRENT_IDX = 2;

const COLORS = {
  bg: '#0f172a',
  link: '#334155',
  nodeDefault: '#475569',
  nodeHighlight: '#3b82f6',
  root: '#ec4899',
  leaf: '#06b6d4',
  auth: '#f59e0b',
  path: '#10b981',
  wots: '#8b5cf6',
  error: '#ef4444',
  text: '#e2e8f0'
};

const generateTreeTopology = (w: number, h: number) => {
  const nodes: any[] = [];
  const links: any[] = [];


  const levelHeight = (h - MARGIN.top - MARGIN.bottom) / TREE_HEIGHT;

  for (let level = 0; level <= TREE_HEIGHT; level++) {
    const nodeCount = Math.pow(2, level);
    const y = MARGIN.top + level * levelHeight;

    for (let i = 0; i < nodeCount; i++) {
      const globalIndex = Math.pow(2, level) - 1 + i;

      const sectionWidth = w / nodeCount;
      const x = sectionWidth * i + sectionWidth / 2;

      const nodeType = level === 0 ? 'root' : (level === TREE_HEIGHT ? 'leaf' : 'internal');

      nodes.push({
        id: globalIndex,
        level,
        indexInLevel: i,
        x,
        y,
        type: nodeType,
        value: null
      });


      if (level > 0) {
        const parentId = Math.pow(2, level - 1) - 1 + Math.floor(i / 2);
        links.push({
          source: parentId,
          target: globalIndex,
          id: `${parentId}-${globalIndex}`
        });
      }
    }
  }
  return { nodes, links };
};

const getAuthPathIds = (leafIdx: number) => {
  const ids: number[] = [];
  let currentIdx = Math.pow(2, TREE_HEIGHT) - 1 + leafIdx;

  while (currentIdx > 0) {

    const siblingIdx = currentIdx % 2 === 0 ? currentIdx - 1 : currentIdx + 1;




    const parentIdx = Math.floor((currentIdx - 1) / 2);
    const isLeft = (currentIdx === parentIdx * 2 + 1);
    const siblingId = isLeft ? parentIdx * 2 + 2 : parentIdx * 2 + 1;

    ids.push(siblingId);
    currentIdx = parentIdx;
  }
  return ids;
};

const getComputePathIds = (leafIdx: number) => {
  const ids: number[] = [];
  let currentIdx = Math.pow(2, TREE_HEIGHT) - 1 + leafIdx;
  ids.push(currentIdx);
  while (currentIdx > 0) {
    currentIdx = Math.floor((currentIdx - 1) / 2);
    ids.push(currentIdx);
  }
  return ids;
};

const initSvg = () => {
  if (!containerRef.value) return;
  d3.select(containerRef.value).selectAll('*').remove();

  svg = d3.select(containerRef.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${props.width} ${props.height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');


  const defs = svg.append('defs');


  const filter = defs.append("filter").attr("id", "glow");
  filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");
};

const drawStep = () => {
  if (!svg) initSvg();

  const { step } = props;
  const { nodes, links } = generateTreeTopology(props.width, props.height);


  svg.selectAll('*').remove();
  const defs = svg.append('defs');
  const filter = defs.append("filter").attr("id", "glow");
  filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const g = svg.append('g');
  const detailsG = svg.append('g').attr('class', 'details-panel');


  const isKeyGen = step.phase === 'KeyGen';
  const isSign = step.phase === 'Sign';
  const isVerify = step.phase === 'Verify';


  const activeNodes = new Set<number>();
  const authNodes = new Set<number>();
  const pathNodes = new Set<number>();
  let wotsActive = false;

  const leafGlobalIdx = Math.pow(2, TREE_HEIGHT) - 1 + CURRENT_IDX;

  if (isKeyGen) {
    if (step.id === 'step1') {  }
    if (step.id === 'step2') {

      nodes.filter(n => n.type === 'leaf').forEach(n => activeNodes.add(n.id));
      wotsActive = true;
    }
    if (step.id === 'step3') {

      nodes.forEach(n => activeNodes.add(n.id));
    }
    if (step.id === 'step4') {
      activeNodes.add(0);
    }
  }

  if (isSign) {
    if (step.id === 'step5' || step.id === 'step6') {
      activeNodes.add(leafGlobalIdx);
    }
    if (step.id === 'step7') {
      activeNodes.add(leafGlobalIdx);
      wotsActive = true;
    }
    if (step.id === 'step8' || step.id === 'step10') {
      activeNodes.add(leafGlobalIdx);
      getAuthPathIds(CURRENT_IDX).forEach(id => authNodes.add(id));
      getComputePathIds(CURRENT_IDX).forEach(id => pathNodes.add(id));
    }
    if (step.id === 'step9') {

      activeNodes.add(leafGlobalIdx + 1);
    }
  }

  if (isVerify) {
    if (step.id === 'step12' || step.id === 'step13') {

      activeNodes.add(leafGlobalIdx);
      wotsActive = true;
    }
    if (step.id === 'step14' || step.id === 'step15') {

      getAuthPathIds(CURRENT_IDX).forEach(id => authNodes.add(id));
      getComputePathIds(CURRENT_IDX).forEach(id => pathNodes.add(id));
      activeNodes.add(0);
    }
  }


  g.selectAll('.link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('x1', (d: any) => nodes[d.source].x)
    .attr('y1', (d: any) => nodes[d.source].y)
    .attr('x2', (d: any) => nodes[d.target].x)
    .attr('y2', (d: any) => nodes[d.target].y)
    .attr('stroke', (d: any) => {

      if (pathNodes.has(d.source) && pathNodes.has(d.target)) return COLORS.path;
      return COLORS.link;
    })
    .attr('stroke-width', (d: any) => {
      if (pathNodes.has(d.source) && pathNodes.has(d.target)) return 3;
      return 1;
    })
    .attr('stroke-dasharray', (d: any) => {
      if (pathNodes.has(d.source) && pathNodes.has(d.target) && isVerify) return '5,5';
      return '0';
    });


  const nodeGroups = g.selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

  nodeGroups.append('circle')
    .attr('r', (d: any) => {
      if (d.type === 'root') return NODE_RADIUS + 4;
      return NODE_RADIUS;
    })
    .attr('fill', (d: any) => {
      if (d.type === 'root') return COLORS.root;
      if (authNodes.has(d.id)) return COLORS.auth;
      if (pathNodes.has(d.id)) return COLORS.path;
      if (activeNodes.has(d.id)) return COLORS.nodeHighlight;
      if (d.type === 'leaf') return COLORS.leaf;
      return COLORS.nodeDefault;
    })
    .attr('stroke', (d: any) => {
      if (d.id === 0 && (step.id === 'step15')) return COLORS.path;
      return '#1e293b';
    })
    .attr('stroke-width', 2)
    .style('filter', (d: any) => {
      if (d.id === 0 || activeNodes.has(d.id) || authNodes.has(d.id)) return 'url(#glow)';
      return null;
    });


  nodeGroups.append('text')
    .attr('dy', 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', '10px')
    .attr('fill', '#fff')
    .text((d: any) => {
      if (d.type === 'root') return 'R';
      return '';
    });


  if (wotsActive || step.id === 'step12' || step.id === 'step7') {
    drawWotsDetails(detailsG, step, props.width, props.height);
  }


  drawAnnotations(detailsG, step, nodes, props.width, props.height);
};

const drawWotsDetails = (container: any, step: any, w: number, h: number) => {
  const startY = h - 110;
  const centerX = w / 2;
  const chainLen = 4;
  const boxSize = 22;
  const gap = 8;

  container.append('text')
    .attr('x', 20)
    .attr('y', startY)
    .attr('fill', COLORS.text)
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .text('WOTS+ Chain Visualization (Leaf ' + CURRENT_IDX + ')');


  const numChains = 4;
  const totalW = numChains * (boxSize + gap);

  for (let c = 0; c < numChains; c++) {
    const xOffset = centerX - totalW / 2 + c * (boxSize + gap * 2);


    for (let i = 0; i < chainLen; i++) {
      const yPos = startY + i * (boxSize + 5);


      let fillColor = COLORS.nodeDefault;
      let opacity = 0.3;

      if (step.id === 'step2') {
        fillColor = COLORS.wots;
        opacity = 1;
      } else if (step.id === 'step7') {

        if (i <= 2) {
          fillColor = COLORS.wots;
          opacity = 1;
        }
        if (i === 2) fillColor = COLORS.auth;
      } else if (step.id === 'step12') {

        if (i >= 2) {
          fillColor = COLORS.path;
          opacity = 1;
        }
      }

      container.append('rect')
        .attr('x', xOffset)
        .attr('y', yPos)
        .attr('width', boxSize)
        .attr('height', boxSize)
        .attr('rx', 4)
        .attr('fill', fillColor)
        .attr('opacity', opacity)
        .attr('stroke', '#334155');


      if (i < chainLen - 1) {
        container.append('line')
          .attr('x1', xOffset + boxSize / 2)
          .attr('y1', yPos + boxSize)
          .attr('x2', xOffset + boxSize / 2)
          .attr('y2', yPos + boxSize + 5)
          .attr('stroke', '#475569');
      }
    }
  }


  container.append('text')
    .attr('x', centerX + totalW / 2 + 20)
    .attr('y', startY + boxSize)
    .attr('fill', COLORS.wots)
    .attr('font-size', '10px')
    .text(step.phase === 'Verify' ? 'Recomputing...' : 'Hashing...');
};

const drawAnnotations = (container: any, step: any, nodes: any[], w: number, h: number) => {
  const infoX = 20;
  const infoY = 60;

  const textGroup = container.append('g').attr('transform', `translate(${infoX}, ${infoY})`);

  const addText = (lines: string[], color = COLORS.text) => {
    lines.forEach((line, i) => {
      textGroup.append('text')
        .attr('x', 0)
        .attr('y', i * 16)
        .attr('fill', color)
        .attr('font-size', '12px')
        .attr('font-family', 'monospace')
        .text(line);
    });
  };

  if (step.id === 'step1') {
    addText(['Generating Seeds:', 'SK_seed = [Random]', 'PK_seed = [Random]'], COLORS.leaf);
  } else if (step.id === 'step4') {
    addText(['Public Key:', 'Root + PK_seed', '', 'Secret Key:', 'SK_seed + idx(0)'], COLORS.root);
  } else if (step.id === 'step5') {
    const leafNode = nodes.find(n => n.id === (Math.pow(2, TREE_HEIGHT) - 1 + CURRENT_IDX));
    if (leafNode) {
      container.append('text')
        .attr('x', leafNode.x)
        .attr('y', leafNode.y + 30)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.error)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Check idx < Max');
    }
  } else if (step.id === 'step8') {
    addText(['Auth Path (Siblings):', 'Yellow nodes needed', 'to reach Root'], COLORS.auth);
  } else if (step.id === 'step15') {
    addText(['Final Check:', 'Computed Root == PK.Root', 'Signature VALID'], COLORS.path);


    container.append('text')
      .attr('x', w / 2)
      .attr('y', h / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '60px')
      .attr('fill', COLORS.path)
      .attr('opacity', 0.2)
      .text('✓');
  }
};

onMounted(() => {
  initSvg();
  drawStep();
});

watch(() => props.step, () => {
  drawStep();
}, { deep: true });

</script>

<template>
  <div ref="containerRef"
    class="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative">
    <div class="absolute top-2 right-2 flex flex-col gap-2 pointer-events-none opacity-80">
      <div class="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-1 rounded">
        <span class="w-2 h-2 rounded-full" :style="{ background: COLORS.root }"></span> Root
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-1 rounded">
        <span class="w-2 h-2 rounded-full" :style="{ background: COLORS.auth }"></span> Auth Path
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-1 rounded">
        <span class="w-2 h-2 rounded-full" :style="{ background: COLORS.wots }"></span> WOTS+ Chain
      </div>
    </div>
  </div>
</template>

<style scoped>
.details-panel {
  transition: opacity 0.5s;
}
</style>

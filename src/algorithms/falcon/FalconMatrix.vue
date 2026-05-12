<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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

const N = 256;
const POLY_SIZE = 56;
const GRID_GAP = 12;

const COLORS = {
  // Falcon算法使用冷色调为主的配色方案，与NTRU算法区分开
  alice: '#3b82f6',
  bob: '#ec4899',
  secret: '#60a5fa',
  public: '#06b6d4',
  noise: '#8b5cf6',
  text: '#cbd5e1',
  cipher: '#2563eb',
  msg: '#0ea5e9',
  gridStroke: '#334155',
  // 为不同参数类型添加明确的颜色标识
  polynomial: '#93c5fd',
  matrix: '#a78bfa',
  commitment: '#22d3ee',
  challenge: '#60a5fa',
  response: '#0ea5e9'
};

// Falcon算法使用蓝色系颜色比例尺，与冷色调配色方案匹配
const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([-10, 10]);

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
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8).attr('refY', 0)
    .attr('markerWidth', 6).attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#64748b');
};

const drawPolynomial = (g: any, x: number, y: number, data: number[], animate: boolean = false, animationDuration: number = 0) => {
  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);

  const background = group.append('rect')
    .attr('width', POLY_SIZE)
    .attr('height', POLY_SIZE)
    .attr('fill', '#1e293b')
    .attr('stroke', COLORS.gridStroke)
    .attr('stroke-width', 1);

  if (!data || data.length === 0) return;

  const cellSize = POLY_SIZE / 16;

  for (let i = 0; i < 256; i++) {
    const r = Math.floor(i / 16);
    const c = i % 16;

    const rawVal = data[i % data.length] || 0;
    const val = rawVal;

    // 直接使用固定颜色，不使用动画
    const cell = group.append('rect')
      .attr('x', c * cellSize)
      .attr('y', r * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', colorScale(val))
      .attr('shape-rendering', 'crispEdges');
  }
};

const drawMatrix = (g: any, x: number, y: number, rows: number, cols: number, data: number[], label: string, options: any = {}) => {
  const { transpose = false, color = '#fff', showDims = true, animate = false, animationDuration = 0 } = options;

  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);

  // 计算矩阵内容的总宽度和高度，用于正确居中标签
  const contentWidth = cols * POLY_SIZE + (cols - 1) * GRID_GAP;
  const contentHeight = rows * POLY_SIZE + (rows - 1) * GRID_GAP;

  const matrixLabel = group.append('text')
    .attr('x', contentWidth / 2)
    .attr('y', -8)
    .text(label + (transpose ? 'ᵀ' : ''))
    .attr('fill', color)
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px');

  if (showDims) {
    const dimText = group.append('text')
      .attr('x', contentWidth / 2)
      .attr('y', contentHeight + 12)
      .text(`${rows}x${cols}`)
      .attr('fill', '#64748b')
      .attr('font-size', '9px')
      .attr('text-anchor', 'middle');
  }

  const coeffsPerPoly = Math.floor(data?.length / (rows * cols)) || 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let dataIndex;
      if (transpose) {
        dataIndex = (c * rows + r);
      } else {
        dataIndex = r * cols + c;
      }

      const polyData = data ? data.slice(dataIndex * coeffsPerPoly, (dataIndex + 1) * coeffsPerPoly) : [];

      drawPolynomial(
        group,
        c * (POLY_SIZE + GRID_GAP),
        r * (POLY_SIZE + GRID_GAP),
        polyData,
        animate,
        animationDuration
      );
    }
  }

  return {
    width: cols * (POLY_SIZE + GRID_GAP),
    height: rows * (POLY_SIZE + GRID_GAP)
  };
};

const drawArrow = (g: any, x1: number, y1: number, x2: number, y2: number, label: string = "") => {
  const lg = g.append('g');
  lg.append('line')
    .attr('x1', x1).attr('y1', y1)
    .attr('x2', x2).attr('y2', y2)
    .attr('stroke', '#64748b')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)');

  if (label) {
    lg.append('text')
      .attr('x', (x1 + x2) / 2)
      .attr('y', (y1 + y2) / 2 - 5)
      .text(label)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle');
  }
};

const drawOperation = (g: any, x: number, y: number, symbol: string) => {
  g.append('text')
    .attr('x', x).attr('y', y)
    .text(symbol)
    .attr('fill', '#fff')
    .attr('font-size', '20px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle');
};

const drawScene = () => {
  initSvg();
  if (!svg) return;

  const g = svg.append('g');
  const { step, actors, width, height } = props;
  const centerX = props.width / 2; // 使用centerX作为居中基准
  const contentStartY = 50;

  const alice = actors.alice as any || {};
  const bob = actors.bob as any || {};

  // KeyGen Phase
  if (step.phase === 'KeyGen') {
    if (step.id === 'step1') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Generate Initial Polynomials').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      g.append('rect').attr('x', centerX - 120).attr('y', contentStartY + 20).attr('width', 240).attr('height', 60).attr('fill', COLORS.secret).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX).attr('y', contentStartY + 55).text('32-byte Seed').attr('fill', COLORS.secret).attr('text-anchor', 'middle');
      drawArrow(g, centerX, contentStartY + 80, centerX, contentStartY + 120, 'Generate');
      drawMatrix(g, centerX - 100, contentStartY + 160, 1, 1, alice.f, 'f (Private)', { color: COLORS.secret });
      drawMatrix(g, centerX + 40, contentStartY + 160, 1, 1, alice.g, 'g (Private)', { color: COLORS.secret });
    } else if (step.id === 'step2') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Generate Initial Basis').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 220, contentStartY + 100, 1, 1, alice.f, 'f', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX - 120, contentStartY + 100, 1, 1, alice.g, 'g', { color: COLORS.secret, showDims: false });
      drawArrow(g, centerX - 40, contentStartY + 130, centerX + 40, contentStartY + 130, 'Lattice Transformation'); // 调整箭头位置，从第一个矩阵中心到第二个矩阵中心
      drawMatrix(g, centerX + 60, contentStartY + 100, 1, 1, alice.F, 'F', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX + 160, contentStartY + 100, 1, 1, alice.G, 'G', { color: COLORS.secret, showDims: false });
    } else if (step.id === 'step3') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Basis Reduction').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      g.append('rect').attr('x', centerX - 250).attr('y', contentStartY + 20).attr('width', 500).attr('height', 160).attr('fill', '#1e293b').attr('rx', 8).attr('stroke', COLORS.noise).attr('stroke-dasharray', '4');
      g.append('text').attr('x', centerX).attr('y', contentStartY + 60).text('LLL + BKZ Reduction').attr('fill', COLORS.noise).attr('text-anchor', 'middle');
      drawMatrix(g, centerX - 200, contentStartY + 100, 1, 1, alice.F, 'F', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX + 140, contentStartY + 100, 1, 1, alice.G, 'G', { color: COLORS.secret, showDims: false });
    } else if (step.id === 'step4') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Extract Keys').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 200, contentStartY + 120, 1, 1, alice.F, 'F', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX - 100, contentStartY + 120, 1, 1, alice.G, 'G', { color: COLORS.secret, showDims: false });
      drawArrow(g, centerX - 30, contentStartY + 145, centerX + 80, contentStartY + 145, 'Generate'); // 调整箭头位置，从第一个矩阵中心到第二个矩阵中心
      drawMatrix(g, centerX + 100, contentStartY + 120, 1, 1, alice.h, 'h (Public)', { color: COLORS.public });
      g.append('text').attr('x', centerX + 125).attr('y', contentStartY + 220).text('sk = (F, G)').attr('fill', COLORS.secret).attr('text-anchor', 'middle');
      g.append('text').attr('x', centerX + 125).attr('y', contentStartY + 250).text('pk = h').attr('fill', COLORS.public).attr('text-anchor', 'middle');
    }
  }
  // Sign Phase
  else if (step.phase === 'Sign') {
    if (step.id === 'step5') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Generate Random Number').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      g.append('rect').attr('x', centerX - 120).attr('y', contentStartY + 20).attr('width', 240).attr('height', 60).attr('fill', COLORS.noise).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX).attr('y', contentStartY + 55).text('Random r').attr('fill', COLORS.noise).attr('text-anchor', 'middle');
      drawArrow(g, centerX, contentStartY + 80, centerX, contentStartY + 140, 'Generate'); // 调整箭头位置，向下延伸到矩阵
      drawMatrix(g, centerX - 30, contentStartY + 170, 1, 1, alice.r, 'r (Random)', { color: COLORS.noise });
    } else if (step.id === 'step6') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Compute Commitment').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 250, contentStartY + 140, 1, 1, alice.r, 'r', { color: COLORS.noise, showDims: false });
      drawMatrix(g, centerX - 150, contentStartY + 140, 1, 1, alice.F, 'F', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX - 50, contentStartY + 140, 1, 1, alice.G, 'G', { color: COLORS.secret, showDims: false });
      drawArrow(g, centerX + 20, contentStartY + 170, centerX + 100, contentStartY + 170, 'Commit'); // 调整箭头位置，从矩阵中心到下一个矩阵中心
      drawMatrix(g, centerX + 120, contentStartY + 140, 1, 1, alice.c1, 'c1 (Commitment)', { color: COLORS.public });
    } else if (step.id === 'step7') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Compute Challenge').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 260, contentStartY + 70, 1, 1, alice.m, 'm (Message)', { color: COLORS.text });
      drawMatrix(g, centerX - 140, contentStartY + 70, 1, 1, alice.c1, 'c1 (Commitment)', { color: COLORS.public });
      drawArrow(g, centerX - 70, contentStartY + 100, centerX + 32, contentStartY + 100, 'Hash'); // 调整箭头位置，从矩阵中心到矩形中心
      g.append('rect').attr('x', centerX + 50).attr('y', contentStartY + 40).attr('width', 200).attr('height', 60).attr('fill', COLORS.public).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX + 150).attr('y', contentStartY + 75).text('SHAKE-256').attr('fill', COLORS.public).attr('text-anchor', 'middle');
      drawArrow(g, centerX + 150, contentStartY + 110, centerX + 150, contentStartY + 170, 'Output'); // 调整箭头位置，向下延伸到矩阵
      drawMatrix(g, centerX + 120, contentStartY + 200, 1, 1, alice.c, 'c (Challenge)', { color: COLORS.public });
    } else if (step.id === 'step8') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Generate Signature Response').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 200, contentStartY + 40, 1, 1, alice.r, 'r', { color: COLORS.noise, showDims: false });
      drawMatrix(g, centerX - 100, contentStartY + 40, 1, 1, alice.c, 'c', { color: COLORS.public, showDims: false });
      drawMatrix(g, centerX + 40, contentStartY + 40, 1, 1, alice.F, 'F', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX + 140, contentStartY + 40, 1, 1, alice.G, 'G', { color: COLORS.secret, showDims: false });
      drawArrow(g, centerX + 0, contentStartY + 78, centerX - 0, contentStartY + 170, 'Sign'); // 调整箭头位置，从最后一个矩阵中心指向下方矩阵中心
      drawMatrix(g, centerX - 75, contentStartY + 200, 1, 1, alice.s1, 's1', { color: COLORS.alice, showDims: false });
      drawMatrix(g, centerX + 15, contentStartY + 200, 1, 1, alice.s2, 's2', { color: COLORS.alice, showDims: false });
    } else if (step.id === 'step9') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Output Final Signature').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 120, contentStartY + 60, 1, 1, alice.c1, 'c1', { color: COLORS.public, showDims: false });
      drawMatrix(g, centerX + 0, contentStartY + 60, 1, 1, alice.s1, 's1', { color: COLORS.alice, showDims: false });
      drawMatrix(g, centerX + 70, contentStartY + 60, 1, 1, alice.s2, 's2', { color: COLORS.alice, showDims: false });
      drawArrow(g, centerX - 30, contentStartY + 100, centerX - 30, contentStartY + 150, 'Combine'); // 调整箭头位置，从矩阵中心向下指向矩形
      g.append('rect').attr('x', centerX - 140).attr('y', contentStartY + 160).attr('width', 280).attr('height', 80).attr('fill', COLORS.cipher || '#8b5cf6').attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX).attr('y', contentStartY + 205).text('Final Signature').attr('fill', COLORS.cipher || '#8b5cf6').attr('text-anchor', 'middle');
    }
  }
  // Verify Phase
  else if (step.phase === 'Verify') {
    if (step.id === 'step10') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Parse Signature').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      g.append('rect').attr('x', centerX - 140).attr('y', contentStartY + 20).attr('width', 280).attr('height', 80).attr('fill', COLORS.cipher || '#8b5cf6').attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX).attr('y', contentStartY + 65).text('Signature (c1, s1, s2)').attr('fill', COLORS.cipher || '#8b5cf6').attr('text-anchor', 'middle');
      drawArrow(g, centerX, contentStartY + 120, centerX, contentStartY + 180, 'Parse'); // 调整箭头位置，向下延伸到矩阵
      drawMatrix(g, centerX - 100, contentStartY + 200, 1, 1, bob.c1, 'c1', { color: COLORS.public, showDims: false });
      drawMatrix(g, centerX - 0, contentStartY + 200, 1, 1, bob.s1, 's1', { color: COLORS.alice, showDims: false });
      drawMatrix(g, centerX + 75, contentStartY + 200, 1, 1, bob.s2, 's2', { color: COLORS.alice, showDims: false });
    } else if (step.id === 'step11') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Compute Challenge').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 260, contentStartY + 70, 1, 1, bob.m, 'm (Message)', { color: COLORS.text });
      drawMatrix(g, centerX - 140, contentStartY + 70, 1, 1, bob.c1, 'c1 (Commitment)', { color: COLORS.public });
      drawArrow(g, centerX - 70, contentStartY + 100, centerX + 32, contentStartY + 100, 'Hash'); // 调整箭头位置，从矩阵中心到矩形中心
      g.append('rect').attr('x', centerX + 50).attr('y', contentStartY + 40).attr('width', 200).attr('height', 60).attr('fill', COLORS.public).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX + 150).attr('y', contentStartY + 75).text('SHAKE-256').attr('fill', COLORS.public).attr('text-anchor', 'middle');
      drawArrow(g, centerX + 150, contentStartY + 110, centerX + 150, contentStartY + 170, 'Output'); // 调整箭头位置，向下延伸到矩阵
      drawMatrix(g, centerX + 120, contentStartY + 200, 1, 1, bob.c, 'c (Challenge)', { color: COLORS.public });
    } else if (step.id === 'step12') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Verify Response').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 150, contentStartY + 40, 1, 1, bob.h, 'h (Public)', { color: COLORS.public, showDims: false });
      drawMatrix(g, centerX - 70, contentStartY + 40, 1, 1, bob.c, 'c', { color: COLORS.public, showDims: false });
      drawMatrix(g, centerX + 10, contentStartY + 40, 1, 1, bob.s1, 's1', { color: COLORS.alice, showDims: false });
      drawMatrix(g, centerX + 90, contentStartY + 40, 1, 1, bob.s2, 's2', { color: COLORS.alice, showDims: false });
      drawArrow(g, centerX + 0, contentStartY + 100, centerX, contentStartY + 160, 'Verify'); // 调整箭头位置，从最后一个矩阵中心指向验证结果
      g.append('circle').attr('cx', centerX).attr('cy', contentStartY + 230).attr('r', 60).attr('fill', COLORS.public).attr('opacity', 0.2);
      g.append('text').attr('x', centerX).attr('y', contentStartY + 235).text('✓ Valid').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-weight', 'bold');
    }
  }
};

onMounted(() => {
  drawScene();
});

watch(() => props.step, drawScene, { deep: true });
watch(() => props.width, drawScene);
watch(() => props.height, drawScene);
</script>

<template>
  <div ref="containerRef"
    class="w-full h-full bg-slate-900 relative rounded-xl border border-slate-700/50 shadow-inner overflow-hidden">
    <div class="absolute bottom-4 left-4 bg-slate-950/80 p-2 rounded border border-slate-800 pointer-events-none">
      <div class="text-[10px] text-slate-400 mb-1 font-bold">Heatmap (Coefficients)</div>
      <div class="flex items-center gap-1 mb-2">
        <span class="text-[9px] text-red-400">-10</span>
        <div class="w-16 h-2 bg-gradient-to-r from-red-500 via-white to-blue-500 rounded-sm"></div>
        <span class="text-[9px] text-blue-400">+10</span>
      </div>
      <div class="flex gap-3 text-[9px] text-slate-300">
        <div class="flex items-center gap-1"><span class="w-2 h-2 bg-[#3b82f6] rounded-sm"></span> Alice</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 bg-[#ec4899] rounded-sm"></span> Bob</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 bg-[#f59e0b] rounded-sm"></span> Noise</div>
      </div>
    </div>
  </div>
</template>

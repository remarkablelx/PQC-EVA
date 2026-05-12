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
  // NTRU算法使用暖色调为主的配色方案，与Falcon算法区分开
  alice: '#f97316',
  bob: '#ec4899',
  secret: '#ef4444',
  public: '#15803d',
  noise: '#f59e0b',
  text: '#cbd5e1',
  cipher: '#9d174d',
  msg: '#22c55e',
  gridStroke: '#334155',
  // 为不同参数类型添加明确的颜色标识
  polynomial: '#fb923c',
  matrix: '#fcd34d',
  parameter: '#f97316',
  modulus: '#ea580c',
  inverse: '#db2777',
  intermediate: '#f97316'
};

// NTRU算法使用暖色系颜色比例尺，与暖色调配色方案匹配
const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([-10, 10]);

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
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Select Parameters').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      g.append('rect').attr('x', centerX - 160).attr('y', contentStartY + 70).attr('width', 320).attr('height', 80).attr('fill', COLORS.public).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX - 100).attr('y', contentStartY + 100).text('N = 509').attr('fill', COLORS.public).attr('text-anchor', 'middle');
      g.append('text').attr('x', centerX).attr('y', contentStartY + 100).text('p = 3').attr('fill', COLORS.public).attr('text-anchor', 'middle');
      g.append('text').attr('x', centerX + 100).attr('y', contentStartY + 100).text('q = 2048').attr('fill', COLORS.public).attr('text-anchor', 'middle');
      g.append('text').attr('x', centerX).attr('y', contentStartY + 135).text('NTRU-HPS 2048/509 Parameters').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-size', '12px');
    } else if (step.id === 'step2') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Generate Random Polynomials').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 180, contentStartY + 100, 1, 1, alice.f, 'f (Private)', { color: COLORS.secret });
      drawMatrix(g, centerX + 120, contentStartY + 100, 1, 1, alice.g, 'g (Private)', { color: COLORS.secret });
      g.append('text').attr('x', centerX - 150).attr('y', contentStartY + 200).text('Sparse: d_f = 64').attr('fill', COLORS.secret).attr('text-anchor', 'middle').attr('font-size', '12px');
      g.append('text').attr('x', centerX + 150).attr('y', contentStartY + 200).text('Sparse: d_g = 64').attr('fill', COLORS.secret).attr('text-anchor', 'middle').attr('font-size', '12px');
    } else if (step.id === 'step3') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Compute Inverses').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 150, contentStartY + 140, 1, 1, alice.f, 'f', { color: COLORS.secret, showDims: false });
      drawArrow(g, centerX - 80, contentStartY + 140, centerX + 36, contentStartY + 70, 'mod p'); // 调整箭头位置，从矩阵中心到矩阵中心
      drawArrow(g, centerX - 80, contentStartY + 196, centerX + 36, contentStartY + 250, 'mod q'); // 调整箭头位置，从矩阵中心到矩阵中心
      drawMatrix(g, centerX + 60, contentStartY + 40, 1, 1, alice.f_p, 'f_p = f⁻¹ mod p', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX + 60, contentStartY + 220, 1, 1, alice.f_q, 'f_q = f⁻¹ mod q', { color: COLORS.secret, showDims: false });
    } else if (step.id === 'step4') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Generate Public Key').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 300, contentStartY + 100, 1, 1, alice.f_q, 'f_q', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX - 200, contentStartY + 100, 1, 1, alice.g, 'g', { color: COLORS.secret, showDims: false });
      drawOperation(g, centerX - 220, contentStartY + 130, '·');
      drawArrow(g, centerX - 120, contentStartY + 130, centerX - 10, contentStartY + 130, 'mod q'); // 调整箭头位置，从矩阵中心到矩阵中心
      drawMatrix(g, centerX + 10, contentStartY + 100, 1, 1, alice.temp, 'f_q · g mod q', { color: COLORS.text, showDims: false });
      drawOperation(g, centerX + 100, contentStartY + 130, '× p');
      drawArrow(g, centerX + 128, contentStartY + 130, centerX + 222, contentStartY + 130, 'mod q'); // 调整箭头位置，从矩阵中心到矩阵中心
      drawMatrix(g, centerX + 250, contentStartY + 100, 1, 1, alice.h, 'h (Public)', { color: COLORS.public });
    } else if (step.id === 'step5') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Extract Keys').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 205, contentStartY + 60, 1, 1, alice.f, 'f', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX - 125, contentStartY + 60, 1, 1, alice.f_p, 'f_p', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX + 115, contentStartY + 60, 1, 1, alice.h, 'h (Public)', { color: COLORS.public, showDims: false });
      g.append('rect').attr('x', centerX - 220).attr('y', contentStartY + 140).attr('width', 160).attr('height', 80).attr('fill', COLORS.secret).attr('rx', 8).attr('opacity', 0.2);
      g.append('rect').attr('x', centerX + 60).attr('y', contentStartY + 140).attr('width', 160).attr('height', 80).attr('fill', COLORS.public).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX - 140).attr('y', contentStartY + 185).text('Private Key').attr('fill', COLORS.secret).attr('text-anchor', 'middle');
      g.append('text').attr('x', centerX + 140).attr('y', contentStartY + 185).text('Public Key').attr('fill', COLORS.public).attr('text-anchor', 'middle');
    }
  }
  // Encaps Phase
  else if (step.phase === 'Encaps') {
    if (step.id === 'step6') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Generate Random r').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 30, contentStartY + 100, 1, 1, bob.r, 'r (Random)', { color: COLORS.noise });
      g.append('text').attr('x', centerX - 2).attr('y', contentStartY + 180).text('Sparse: d_r = 64').attr('fill', COLORS.noise).attr('text-anchor', 'middle').attr('font-size', '12px');
    } else if (step.id === 'step7') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Encode Message').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      g.append('rect').attr('x', centerX - 250).attr('y', contentStartY + 70).attr('width', 180).attr('height', 80).attr('fill', COLORS.msg).attr('rx', 8).attr('opacity', 0.2);
      g.append('rect').attr('x', centerX + 70).attr('y', contentStartY + 70).attr('width', 180).attr('height', 80).attr('fill', COLORS.msg).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX - 160).attr('y', contentStartY + 115).text('Plaintext Message').attr('fill', COLORS.msg).attr('text-anchor', 'middle');
      g.append('text').attr('x', centerX + 160).attr('y', contentStartY + 115).text('Encoded Polynomial').attr('fill', COLORS.msg).attr('text-anchor', 'middle');
      g.append('text').attr('x', centerX + 160).attr('y', contentStartY + 140).text('m (Coeffs in [-1, 1])').attr('fill', COLORS.msg).attr('text-anchor', 'middle').attr('font-size', '12px');
      drawArrow(g, centerX - 50, contentStartY + 110, centerX + 50, contentStartY + 110, 'Encode'); // 调整箭头位置，从矩形到编码后的多项式
      drawMatrix(g, centerX + 130, contentStartY + 200, 1, 1, bob.m, 'm (Encoded)', { color: COLORS.msg });
    } else if (step.id === 'step8') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Compute Ciphertext').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 250, contentStartY + 100, 1, 1, alice.h, 'h (Public)', { color: COLORS.public, showDims: false });
      drawMatrix(g, centerX - 125, contentStartY + 100, 1, 1, bob.r, 'r (Random)', { color: COLORS.noise, showDims: false });
      drawMatrix(g, centerX - 0, contentStartY + 100, 1, 1, bob.m, 'm (Message)', { color: COLORS.msg, showDims: false });
      drawOperation(g, centerX - 160, contentStartY + 130, '·');
      drawOperation(g, centerX - 35, contentStartY + 130, '+');
      drawArrow(g, centerX + 78, contentStartY + 130, centerX + 172, contentStartY + 130, 'mod q'); // 调整箭头位置，从矩阵中心到矩阵中心
      drawMatrix(g, centerX + 200, contentStartY + 100, 1, 1, bob.c, 'c (Ciphertext)', { color: COLORS.cipher });
    }
  }
  // Decaps Phase
  else if (step.phase === 'Decaps') {
    if (step.id === 'step9') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Compute Intermediate a').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 180, contentStartY + 100, 1, 1, alice.f, 'f (Private)', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX - 80, contentStartY + 100, 1, 1, bob.c, 'c (Ciphertext)', { color: COLORS.cipher, showDims: false });
      drawOperation(g, centerX - 100, contentStartY + 130, '·');
      drawArrow(g, centerX - 0, contentStartY + 130, centerX + 80, contentStartY + 130, 'mod q'); // 调整箭头位置，从矩阵中心到矩阵中心
      drawMatrix(g, centerX + 120, contentStartY + 100, 1, 1, alice.a, 'a (Intermediate)', { color: COLORS.text, showDims: false });
    } else if (step.id === 'step10') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Center Lift & mod p').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 140, contentStartY + 100, 1, 1, alice.a, 'a', { color: COLORS.text, showDims: false });
      drawArrow(g, centerX - 60, contentStartY + 115, centerX + 60, contentStartY + 115, 'CenterLift'); // 调整箭头位置，从矩阵中心到矩阵中心，向上偏移
      drawArrow(g, centerX - 60, contentStartY + 145, centerX + 60, contentStartY + 145, 'mod p'); // 调整箭头位置，从矩阵中心到矩阵中心，向下偏移
      drawMatrix(g, centerX + 80, contentStartY + 100, 1, 1, alice.b, 'b (Reduced)', { color: COLORS.text, showDims: false });
    } else if (step.id === 'step11') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Recover Message').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 180, contentStartY + 100, 1, 1, alice.f_p, 'f_p', { color: COLORS.secret, showDims: false });
      drawMatrix(g, centerX - 80, contentStartY + 100, 1, 1, alice.b, 'b', { color: COLORS.text, showDims: false });
      drawOperation(g, centerX - 100, contentStartY + 130, '·');
      drawArrow(g, centerX - 15, contentStartY + 130, centerX + 100, contentStartY + 130, 'mod p'); // 调整箭头位置，从矩阵中心到矩阵中心
      drawMatrix(g, centerX + 120, contentStartY + 100, 1, 1, alice.m_decrypted, 'm (Recovered)', { color: COLORS.msg, showDims: false });
    } else if (step.id === 'step12') {
      g.append('text').attr('x', centerX).attr('y', contentStartY).text('Decode Message').attr('fill', '#fff').attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold');
      drawMatrix(g, centerX - 28, contentStartY + 40, 1, 1, alice.m_decrypted, 'm (Polynomial)', { color: COLORS.msg, showDims: false });
      drawArrow(g, centerX, contentStartY + 100, centerX, contentStartY + 180, 'Decode'); // 调整箭头位置，从矩阵中心向下
      g.append('rect').attr('x', centerX - 150).attr('y', contentStartY + 195).attr('width', 300).attr('height', 80).attr('fill', COLORS.msg).attr('rx', 8).attr('opacity', 0.2);
      g.append('text').attr('x', centerX).attr('y', contentStartY + 240).text('Recovered Plaintext Message').attr('fill', COLORS.msg).attr('text-anchor', 'middle'); // 调整文本位置
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

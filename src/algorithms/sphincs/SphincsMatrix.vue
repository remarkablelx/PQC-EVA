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
let mainGroup: any = null;

const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 };
const COLORS = {
  bg: '#0f172a',
  primary: '#3b82f6',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#94a3b8',
  textLight: '#f1f5f9',
  gridOff: '#1e293b',
  gridOn: '#64748b',
  highlight: '#eab308'
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


  const filter = defs.append('filter').attr('id', 'glow');
  filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  mainGroup = svg.append('g').attr('class', 'main-group');
};

const generateMatrixData = (rows: number, cols: number, seed: string | number) => {
  const data = [];
  const s = String(seed);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      const val = (s.charCodeAt((r * cols + c) % s.length) + r + c) % 16;
      data.push({ r, c, val, id: `${r}-${c}` });
    }
  }
  return data;
};

const drawHypertreeStructure = (g: any, x: number, y: number, w: number, h: number, activeParts: string[]) => {
  const group = g.append('g').attr('transform', `translate(${x},${y})`);


  group.append('text').attr('x', w / 2).attr('y', -10).text('SPHINCS+ Structure').attr('fill', COLORS.text).attr('text-anchor', 'middle').attr('font-size', '10px');


  const levels = [
    { id: 'top', label: 'Top Tree', y: 0, color: COLORS.primary },
    { id: 'layer0', label: 'Layer 0', y: h * 0.35, color: COLORS.warning },
    { id: 'fors', label: 'FORS', y: h * 0.65, color: COLORS.accent }
  ];

  levels.forEach(level => {
    const isActive = activeParts.includes(level.id);
    const opacity = isActive ? 1 : 0.3;
    const color = level.color;


    const tw = w * 0.6;
    const th = h * 0.25;

    const treeGroup = group.append('g')
      .attr('transform', `translate(${w / 2}, ${level.y})`)
      .attr('opacity', opacity);


    treeGroup.append('path')
      .attr('d', `M0 0 L${-tw / 2} ${th} L${tw / 2} ${th} Z`)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2);


    treeGroup.append('text')
      .attr('x', 0).attr('y', th / 2 + 5)
      .text(level.label)
      .attr('fill', color)
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle');


    if (isActive) {
      treeGroup.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 4).attr('fill', color);

      [-1, 0, 1].forEach(i => {
        treeGroup.append('circle').attr('cx', i * (tw / 4)).attr('cy', th).attr('r', 2).attr('fill', color);
      });
    }
  });


  if (activeParts.includes('top') && activeParts.includes('layer0')) {

    group.append('line')
      .attr('x1', w / 2).attr('y1', h * 0.25)
      .attr('x2', w / 2).attr('y2', h * 0.35)
      .attr('stroke', COLORS.text).attr('stroke-dasharray', '4 4');
  }
  if (activeParts.includes('layer0') && activeParts.includes('fors')) {

    group.append('line')
      .attr('x1', w / 2).attr('y1', h * 0.55)
      .attr('x2', w / 2).attr('y2', h * 0.65)
      .attr('stroke', COLORS.text).attr('stroke-dasharray', '4 4');
  }
};

const drawMatrixGrid = (g: any, x: number, y: number, w: number, h: number, data: any[], rows: number, cols: number, title: string, colorBase: string, highlightIndices: number[] = []) => {
  const group = g.append('g').attr('transform', `translate(${x},${y})`);


  group.append('text')
    .attr('x', 0).attr('y', -10)
    .text(title)
    .attr('fill', COLORS.textLight)
    .attr('font-size', '12px')
    .attr('font-family', 'monospace');

  const cellSize = Math.min(w / cols, h / rows);
  const offsetX = (w - cols * cellSize) / 2;
  const offsetY = (h - rows * cellSize) / 2;

  const cells = group.selectAll('.cell')
    .data(data, (d: any) => d.id)
    .enter()
    .append('g')
    .attr('transform', (d: any) => `translate(${offsetX + d.c * cellSize}, ${offsetY + d.r * cellSize})`);


  cells.append('rect')
    .attr('width', cellSize - 2)
    .attr('height', cellSize - 2)
    .attr('fill', (d: any, i: number) => {
      const isHighlighted = highlightIndices.includes(i);
      if (isHighlighted) return COLORS.highlight;

      return d3.color(colorBase)?.copy({ opacity: 0.2 + (d.val / 20) }).toString();
    })
    .attr('stroke', (d: any, i: number) => highlightIndices.includes(i) ? COLORS.textLight : 'none')
    .attr('rx', 2);


  if (cellSize > 15) {
    cells.append('text')
      .attr('x', cellSize / 2).attr('y', cellSize / 2 + 4)
      .text((d: any) => d.val.toString(16).toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('fill', (d: any, i: number) => highlightIndices.includes(i) ? '#000' : 'rgba(255,255,255,0.6)')
      .attr('font-size', Math.min(10, cellSize / 2) + 'px')
      .attr('font-family', 'monospace');
  }
};

const renderStep = () => {
  if (!svg || !props.step) return;


  mainGroup.selectAll('*').remove();

  const { width, height, step } = props;
  const cw = width - MARGIN.left - MARGIN.right;
  const ch = height - MARGIN.top - MARGIN.bottom;

  const g = mainGroup.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);


  const structW = cw * 0.35;
  const matrixW = cw * 0.6;
  const gap = cw * 0.05;



  const activeParts = [];
  if (step.phase === 'KeyGen') activeParts.push('top');
  if (step.phase === 'Sign' || step.phase === 'Verify') {
    if (step.id.includes('step4') || step.id.includes('step5')) activeParts.push('fors');
    if (step.id.includes('step6') || step.id.includes('step9')) { activeParts.push('layer0'); activeParts.push('top'); }
    if (step.id.includes('step8')) activeParts.push('fors');
    if (step.id.includes('step10')) activeParts.push('top');
  }

  drawHypertreeStructure(g, 0, 0, structW, ch, activeParts);


  const mx = structW + gap;
  const matrixH = ch;
  const matrixCenterY = matrixH / 2;


  switch (step.id) {
    case 'step1':
      {
        const rows = 4, cols = 8;
        const dataSK = generateMatrixData(rows, cols, 'secret_key_seed');
        const dataPK = generateMatrixData(rows, cols, 'public_key_seed');

        const totalHeight = 100 + 120 + 40;
        const startY = matrixCenterY - totalHeight / 2;

        drawMatrixGrid(g, mx, startY, matrixW, 100, dataSK, rows, cols, 'SK.seed (Matrix)', COLORS.danger);
        drawMatrixGrid(g, mx, startY + 120, matrixW, 100, dataPK, rows, cols, 'PK.seed (Matrix)', COLORS.primary);


        g.append('text').attr('x', mx + matrixW / 2).attr('y', startY + 240).text('Initializing Entropy...')
          .attr('fill', COLORS.text).attr('text-anchor', 'middle')
          .attr('class', 'animate-pulse');
      }
      break;

    case 'step2':
      {

        const leaves = 8;
        const chainLen = 4;
        const data = generateMatrixData(chainLen, leaves, 'top_tree_wots');


        const totalHeight = 150 + 30;
        const startY = matrixCenterY - totalHeight / 2;

        drawMatrixGrid(g, mx, startY, matrixW, 150, data, chainLen, leaves, 'Top Layer WOTS+ Generation', COLORS.warning);

        g.append('text').attr('x', mx).attr('y', startY + 170)
          .text('Calculating WOTS+ Chains for Top Root...')
          .attr('fill', COLORS.warning).attr('font-size', '12px');
      }
      break;

    case 'step3':
      {
        const pkData = generateMatrixData(2, 8, 'final_pk');
        const totalHeight = 60;
        const startY = matrixCenterY - totalHeight / 2;

        drawMatrixGrid(g, mx, startY, matrixW, 60, pkData, 2, 8, 'Public Key [Root || Seed]', COLORS.success, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      }
      break;

    case 'step4':
      {

        const msgData = generateMatrixData(2, 8, 'message_content');
        const rData = generateMatrixData(1, 8, 'random_r');

        const totalHeight = 50 + 30 + 30 + 30;
        const startY = matrixCenterY - totalHeight / 2;

        drawMatrixGrid(g, mx, startY, matrixW, 50, msgData, 2, 8, 'Message (M)', COLORS.text);
        drawMatrixGrid(g, mx, startY + 70, matrixW, 30, rData, 1, 8, 'Random (R)', COLORS.highlight);


        g.append('path').attr('d', `M${mx + matrixW / 2} ${startY + 110} L${mx + matrixW / 2} ${startY + 140}`).attr('stroke', COLORS.text).attr('marker-end', 'url(#arrow)');


        const idxData = generateMatrixData(1, 8, 'digest_output');
        drawMatrixGrid(g, mx, startY + 150, matrixW, 30, idxData, 1, 8, 'Digest & Index', COLORS.accent, [2, 5]);

        g.append('text').attr('x', mx).attr('y', startY + 200).text('Mapping to FORS indices...').attr('fill', COLORS.accent).attr('font-size', '10px');
      }
      break;

    case 'step5':
      {

        const k = 4;
        const t = 4;
        const data = generateMatrixData(k, t, 'fors_secret_values');


        const selectedIndices = [1, 6, 9, 14];

        const totalHeight = 160 + 30;
        const startY = matrixCenterY - totalHeight / 2;

        drawMatrixGrid(g, mx, startY, matrixW, 160, data, k, t, 'FORS Private Key Matrix', COLORS.accent, selectedIndices);


        g.append('text').attr('x', mx).attr('y', startY + 220).text('Revealing secret values at calculated indices').attr('fill', COLORS.text).attr('font-size', '11px');
      }
      break;

    case 'step6':
      {

        const chainLen = 5;
        const data = generateMatrixData(chainLen, 8, 'layer0_wots_sig');

        const totalHeight = 150 + 30;
        const startY = matrixCenterY - totalHeight / 2;

        drawMatrixGrid(g, mx, startY, matrixW, 150, data, chainLen, 8, 'Layer 0: WOTS+ Signature Matrix', COLORS.warning);


        g.append('text').attr('x', mx).attr('y', startY + 210).text('Signing FORS Root with Layer 0 WOTS+').attr('fill', COLORS.warning).attr('font-size', '11px');
      }
      break;

    case 'step7':
      {

        const w = matrixW * 0.8;
        const x = mx + (matrixW - w) / 2;

        const totalHeight = 20 + 25 + 60 + 15 + 80 + 30;
        const startY = matrixCenterY - totalHeight / 2;

        g.append('rect').attr('x', x).attr('y', startY).attr('width', w).attr('height', 20).attr('fill', COLORS.highlight).attr('rx', 2);
        g.append('text').attr('x', x + w / 2).attr('y', startY + 14).text('R').attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', 'black');

        g.append('rect').attr('x', x).attr('y', startY + 45).attr('width', w).attr('height', 60).attr('fill', COLORS.accent).attr('rx', 2);
        g.append('text').attr('x', x + w / 2).attr('y', startY + 80).text('FORS Signatures').attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', 'white');

        g.append('rect').attr('x', x).attr('y', startY + 110).attr('width', w).attr('height', 80).attr('fill', COLORS.warning).attr('rx', 2);
        g.append('text').attr('x', x + w / 2).attr('y', startY + 150).text('Hypertree (WOTS+ & Paths)').attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', 'black');

        g.append('text').attr('x', mx).attr('y', startY + 210).text('Final Signature Bundle').attr('fill', COLORS.textLight).attr('font-family', 'monospace');
      }
      break;

    case 'step8':
      {

        const recovered = generateMatrixData(1, 4, 'fors_roots_recovered');

        const totalHeight = 40 + 40;
        const startY = matrixCenterY - totalHeight / 2;

        g.append('text').attr('x', mx).attr('y', startY + 20).text('Hashing signature values...').attr('fill', COLORS.success).attr('font-size', '12px');
        drawMatrixGrid(g, mx, startY + 40, matrixW, 40, recovered, 1, 4, 'Recomputed FORS Roots', COLORS.success);
      }
      break;

    case 'step9':
      {

        const levels = 3;
        const totalHeight = levels * 50;
        const startY = matrixCenterY - totalHeight / 2;

        for (let i = 0; i < levels; i++) {
          const y = startY + (levels - 1 - i) * 50;
          const opacity = (i + 1) / levels;
          g.append('rect').attr('x', mx + 20).attr('y', y).attr('width', matrixW - 40).attr('height', 30)
            .attr('fill', COLORS.success).attr('opacity', opacity).attr('rx', 4);
          g.append('text').attr('x', mx + matrixW / 2).attr('y', y + 20).text(`Recomputing Layer ${i} Root...`)
            .attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px');
        }
      }
      break;

    case 'step10':
      {
        const computed = generateMatrixData(1, 8, 'computed_root');
        const pubkey = generateMatrixData(1, 8, 'actual_pk_root');

        const totalHeight = 40 + 60 + 40 + 50;
        const startY = matrixCenterY - totalHeight / 2;

        drawMatrixGrid(g, mx, startY, matrixW, 40, computed, 1, 8, 'Computed Root', COLORS.success);
        drawMatrixGrid(g, mx, startY + 100, matrixW, 40, pubkey, 1, 8, 'Public Key Root', COLORS.primary);


        g.append('text').attr('x', mx + matrixW / 2).attr('y', startY + 170).text('=')
          .attr('fill', COLORS.textLight).attr('font-size', '40px').attr('text-anchor', 'middle').attr('font-weight', 'bold');

        g.append('text').attr('x', mx + matrixW / 2).attr('y', startY + 220).text('SIGNATURE VALID')
          .attr('fill', COLORS.success).attr('font-size', '16px').attr('font-weight', 'bold').attr('text-anchor', 'middle')
          .attr('filter', 'url(#glow)');
      }
      break;
  }
};

onMounted(() => {
  initSvg();
  renderStep();
});

watch(() => props.step, renderStep, { deep: true });
</script>

<template>
  <div ref="containerRef"
    class="w-full h-full bg-slate-900 relative rounded-xl border border-slate-700/50 shadow-inner overflow-hidden">
    <!-- Legend Overlay -->
    <div
      class="absolute bottom-2 left-2 flex flex-col gap-1 text-[10px] text-slate-400 pointer-events-none bg-slate-950/80 p-2 rounded backdrop-blur-sm border border-slate-800">
      <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-sm bg-[#ec4899]"></span> Top Tree</div>
      <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-sm bg-[#f59e0b]"></span> WOTS+ / Layer</div>
      <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-sm bg-[#8b5cf6]"></span> FORS Matrix</div>
      <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-sm bg-[#10b981]"></span> Verified Data</div>
    </div>
  </div>
</template>

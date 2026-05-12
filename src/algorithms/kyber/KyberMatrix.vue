{
type: created file
fileName: KyberMatrix.vue
fullContent:
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import { useAlgoStore } from '../../stores/algorithmStore';
import type { AlgoStep, Actor } from '../../algorithms/types';

const props = defineProps<{
  step: AlgoStep;
  stepIndex: number;
  actors: Actor;
  width: number;
  height: number;
}>();

const store = useAlgoStore();
const containerRef = ref<HTMLElement | null>(null);
let svg: any = null;

const N = 256;
const Q = 3329;
const POLY_SIZE = 48;
const GRID_GAP = 4;

const COLORS = {
  alice: '#3b82f6',
  bob: '#ec4899',
  secret: '#ef4444',
  public: '#10b981',
  noise: '#f59e0b',
  text: '#cbd5e1',
  gridStroke: '#334155'
};

const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-Q / 2, Q / 2]);

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

const drawPolynomial = (g: any, x: number, y: number, data: number[], animate: boolean = false, animationDuration: number = 800) => {

  animate = false;

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


    let val = rawVal;
    if (Math.abs(rawVal) <= 1.0) {
      val = rawVal * Q - (Q / 2);
    }

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
  let { transpose = false, color = '#fff', showDims = true, animate = false, animationDuration = 800 } = options;


  animate = false;

  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);


  const matrixLabel = group.append('text')
    .attr('x', (cols * (POLY_SIZE + GRID_GAP)) / 2)
    .attr('y', -8)
    .text(label + (transpose ? 'ᵀ' : ''))
    .attr('fill', color)
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px');


  if (showDims) {
    const dimText = group.append('text')
      .attr('x', (cols * (POLY_SIZE + GRID_GAP)) / 2)
      .attr('y', rows * (POLY_SIZE + GRID_GAP) + 12)
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


      const polyDelay = 0;

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
  const cx = width / 2;
  const cy = height / 2;


  if (step.phase === 'KeyGen') {
    if (step.id === 'step1') {

      g.append('text').attr('x', cx).attr('y', cy - 60).text('Generating Random Seeds').attr('fill', '#fff').attr('text-anchor', 'middle');

      const boxSize = 60;

      g.append('rect').attr('x', cx - 80 - boxSize).attr('y', cy - boxSize / 2).attr('width', boxSize).attr('height', boxSize).attr('fill', COLORS.public).attr('rx', 8);
      g.append('text').attr('x', cx - 80 - boxSize / 2).attr('y', cy).text('ρ').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
      g.append('text').attr('x', cx - 80 - boxSize / 2).attr('y', cy + boxSize / 2 + 20).text('Public Seed').attr('fill', COLORS.public).attr('font-size', '12px').attr('text-anchor', 'middle');


      g.append('rect').attr('x', cx + 80).attr('y', cy - boxSize / 2).attr('width', boxSize).attr('height', boxSize).attr('fill', COLORS.secret).attr('rx', 8);
      g.append('text').attr('x', cx + 80 + boxSize / 2).attr('y', cy).text('σ').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
      g.append('text').attr('x', cx + 80 + boxSize / 2).attr('y', cy + boxSize / 2 + 20).text('Secret Seed').attr('fill', COLORS.secret).attr('font-size', '12px').attr('text-anchor', 'middle');
    }
    else if (step.id === 'step2') {

      drawArrow(g, cx - 120, cy, cx - 60, cy, 'XOF');
      drawMatrix(g, cx - 40, cy - 80, 3, 3, actors.alice.A, 'A (Public Matrix)', { color: COLORS.public });

      g.append('rect').attr('x', cx - 160).attr('y', cy - 20).attr('width', 40).attr('height', 40).attr('fill', COLORS.public).attr('rx', 4);
      g.append('text').attr('x', cx - 140).attr('y', cy).text('ρ').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
    }
    else if (step.id === 'step3') {

      g.append('rect').attr('x', cx - 160).attr('y', cy - 20).attr('width', 40).attr('height', 40).attr('fill', COLORS.secret).attr('rx', 4);
      g.append('text').attr('x', cx - 140).attr('y', cy).text('σ').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

      drawArrow(g, cx - 110, cy, cx - 50, cy - 70, 'CBD');
      drawArrow(g, cx - 110, cy, cx - 50, cy + 70, 'CBD');


      const matrixHeight = 3 * (POLY_SIZE + GRID_GAP) + 20;
      const spacing = 40;

      drawMatrix(g, cx, cy - matrixHeight - spacing / 2, 3, 1, actors.alice.s, 's (Secret)', { color: COLORS.secret });
      drawMatrix(g, cx, cy + spacing / 2, 3, 1, actors.alice.e, 'e (Noise)', { color: COLORS.noise });
    }
    else if (step.id === 'step4' || step.id === 'step5') {

      const startX = cx - 220;
      const matY = cy - 80;

      drawMatrix(g, startX, matY, 3, 3, actors.alice.A, 'A', { color: COLORS.public });
      drawOperation(g, startX + 170, cy, '·');
      drawMatrix(g, startX + 190, matY, 3, 1, actors.alice.s, 's', { color: COLORS.secret });
      drawOperation(g, startX + 260, cy, '+');
      drawMatrix(g, startX + 280, matY, 3, 1, actors.alice.e, 'e', { color: COLORS.noise });
      drawOperation(g, startX + 350, cy, '=');

      const tRes = drawMatrix(g, startX + 370, matY, 3, 1, actors.alice.t, 't', { color: COLORS.public });

      if (step.id === 'step5') {

        g.append('rect')
          .attr('x', startX + 360).attr('y', matY - 30)
          .attr('width', tRes.width + 20).attr('height', tRes.height + 40)
          .attr('fill', 'none').attr('stroke', COLORS.alice).attr('stroke-width', 2).attr('stroke-dasharray', '4');
        g.append('text').attr('x', startX + 370 + tRes.width / 2).attr('y', matY + tRes.height + 30).text('Public Key part').attr('fill', COLORS.alice).attr('font-size', '10px').attr('text-anchor', 'middle');
      }
    }
  }


  else if (step.phase === 'Encaps') {
    if (step.id === 'step6' || step.id === 'step7') {

      drawMatrix(g, cx - 100, cy - 40, 1, 1, actors.bob.m, 'm (Msg)', { color: COLORS.bob });
      if (step.id === 'step7') {
        drawArrow(g, cx - 40, cy, cx + 20, cy, 'Hash');
        drawMatrix(g, cx + 40, cy - 80, 3, 1, actors.bob.r, 'r (Rand)', { color: COLORS.noise });
      }
    }
    else if (step.id === 'step8') {
      g.append('text').attr('x', cx).attr('y', cy - 100).text('Sample Noise Vectors').attr('fill', '#fff').attr('text-anchor', 'middle');

      drawArrow(g, cx - 100, cy - 80, cx - 100, cy - 40, 'CBD');
      drawArrow(g, cx + 100, cy - 80, cx + 100, cy - 40, 'CBD');

      drawMatrix(g, cx - 140, cy - 20, 3, 1, actors.bob.e1, 'e₁', { color: COLORS.noise });
      drawMatrix(g, cx + 60, cy - 20, 1, 1, actors.bob.e2, 'e₂', { color: COLORS.noise });
    }
    else if (step.id === 'step9') {


      const leftX = cx - 240;
      const topY = cy - 180;
      const bottomY = cy + 40;


      g.append('text').attr('x', leftX).attr('y', topY).text('1. Compute Mask Vector u').attr('fill', COLORS.text).attr('font-size', '12px');
      drawMatrix(g, leftX, topY + 20, 3, 3, actors.alice.A, 'A', { transpose: true, color: COLORS.public });
      drawOperation(g, leftX + 170, topY + 100, '·');
      drawMatrix(g, leftX + 190, topY + 20, 3, 1, actors.bob.r, 'r', { color: COLORS.noise });
      drawOperation(g, leftX + 260, topY + 100, '+');
      drawMatrix(g, leftX + 280, topY + 20, 3, 1, actors.bob.e1, 'e₁', { color: COLORS.noise });
      drawOperation(g, leftX + 350, topY + 100, '=');
      drawMatrix(g, leftX + 370, topY + 20, 3, 1, actors.bob.u, 'u', { color: COLORS.bob });


      g.append('text').attr('x', leftX).attr('y', bottomY).text('2. Embed Message into v').attr('fill', COLORS.text).attr('font-size', '12px');
      drawMatrix(g, leftX, bottomY + 20, 3, 1, actors.alice.t, 't', { transpose: true, color: COLORS.public, showDims: false });
      drawOperation(g, leftX + 170, bottomY + 40, '·');
      drawMatrix(g, leftX + 190, bottomY + 20, 3, 1, actors.bob.r, 'r', { color: COLORS.noise, showDims: false });
      drawOperation(g, leftX + 260, bottomY + 40, '+');
      drawMatrix(g, leftX + 280, bottomY + 20, 1, 1, actors.bob.e2, 'e₂', { color: COLORS.noise, showDims: false });
      drawOperation(g, leftX + 350, bottomY + 40, '+');
      drawMatrix(g, leftX + 370, bottomY + 20, 1, 1, actors.bob.m, 'm', { color: COLORS.bob, showDims: false });
      drawOperation(g, leftX + 430, bottomY + 40, '=');
      drawMatrix(g, leftX + 450, bottomY + 20, 1, 1, actors.bob.v, 'v', { color: COLORS.bob });
    }
    else if (step.id === 'step10') {
      g.append('text').attr('x', cx).attr('y', cy - 120).text('Compress & Pack').attr('fill', '#fff').attr('text-anchor', 'middle');


      const uMatrix = drawMatrix(g, cx - 140, cy - 80, 3, 1, actors.bob.u, 'u (Uncompressed)', { color: COLORS.bob });
      const vMatrix = drawMatrix(g, cx + 40, cy - 80, 1, 1, actors.bob.v, 'v (Uncompressed)', { color: COLORS.bob });


      const uCenterX = cx - 140 + uMatrix.width / 2;
      const vCenterX = cx + 40 + vMatrix.width / 2;
      const matrixBottomY = cy - 80 + Math.max(uMatrix.height, vMatrix.height) + 20;


      drawArrow(g, uCenterX, matrixBottomY, uCenterX, matrixBottomY + 30);
      drawArrow(g, vCenterX, matrixBottomY, vCenterX, matrixBottomY + 30);

      g.append('text').attr('x', uCenterX).attr('y', matrixBottomY + 50).text('Compress(u, 10 bits)').attr('fill', '#94a3b8').attr('font-size', '11px').attr('text-anchor', 'middle');
      g.append('text').attr('x', vCenterX).attr('y', matrixBottomY + 50).text('Compress(v, 4 bits)').attr('fill', '#94a3b8').attr('font-size', '11px').attr('text-anchor', 'middle');
    }
    else if (step.id === 'step11') {

      g.append('text').attr('x', cx).attr('y', cy - 100).text('Ciphertext Output').attr('fill', '#fff').attr('text-anchor', 'middle');
      const uBox = drawMatrix(g, cx - 80, cy - 60, 3, 1, actors.bob.u, 'u', { color: COLORS.bob });
      const vBox = drawMatrix(g, cx + 20, cy - 60 + (POLY_SIZE * 2 + GRID_GAP * 2), 1, 1, actors.bob.v, 'v', { color: COLORS.bob });


      g.append('rect')
        .attr('x', cx - 100)
        .attr('y', cy - 80)
        .attr('width', 200)
        .attr('height', 240)
        .attr('fill', 'none')
        .attr('stroke', COLORS.bob)
        .attr('stroke-width', 2)
        .attr('rx', 8);

      g.append('text').attr('x', cx).attr('y', cy + 140).text('Sent to Alice').attr('fill', COLORS.bob).attr('text-anchor', 'middle');
    }
  }


  else if (step.phase === 'Decaps') {
    if (step.id === 'step12') {

      const startX = cx - 150;

      g.append('text').attr('x', cx).attr('y', cy - 100).text('Decrypt: Remove Mask').attr('fill', '#fff').attr('text-anchor', 'middle');


      const vMatrix = drawMatrix(g, startX, cy, 1, 1, actors.bob.v, 'v (Cipher)', { color: COLORS.bob });


      const vRightX = startX + vMatrix.width;
      const vCenterY = cy + (vMatrix.height / 2);
      drawOperation(g, vRightX + 30, vCenterY, '-');



      const matrixHeight = 3 * (POLY_SIZE + GRID_GAP);
      const boxY = cy - 40 - 20;
      const boxHeight = matrixHeight + 40;

      g.append('rect').attr('x', startX + 100).attr('y', boxY).attr('width', 160).attr('height', boxHeight).attr('fill', '#1e293b').attr('stroke', COLORS.gridStroke).attr('rx', 4);
      g.append('text').attr('x', startX + 180).attr('y', boxY + 15).text('(sᵀ · u)').attr('fill', COLORS.secret).attr('text-anchor', 'middle').attr('font-size', '12px');

      drawMatrix(g, startX + 110, boxY + 25, 3, 1, actors.alice.s, '', { transpose: true, color: COLORS.secret, showDims: false });
      drawOperation(g, startX + 175, boxY + 25 + matrixHeight / 2, '·');
      drawMatrix(g, startX + 190, boxY + 25, 3, 1, actors.bob.u, '', { color: COLORS.bob, showDims: false });

      drawOperation(g, startX + 280, boxY + 25 + matrixHeight / 2, '≈');


      drawMatrix(g, startX + 310, boxY + 25 + (matrixHeight - POLY_SIZE) / 2, 1, 1, actors.alice.mn, "m' (Recovered)", { color: COLORS.alice });


      g.append('text').attr('x', cx).attr('y', boxY + boxHeight + 40).text('Noise is removed by rounding (Compress/Decompress)').attr('fill', COLORS.noise).attr('text-anchor', 'middle').attr('font-size', '10px');
    }
    else if (step.id === 'step13') {

      drawMatrix(g, cx - 150, cy - 40, 1, 1, actors.alice.mn, "m'", { color: COLORS.alice });
      drawArrow(g, cx - 80, cy, cx - 20, cy, 'Re-Enc');

      g.append('rect').attr('x', cx).attr('y', cy - 30).attr('width', 60).attr('height', 60).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 4);
      g.append('text').attr('x', cx + 30).attr('y', cy).text("c'").attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

      g.append('text').attr('x', cx + 90).attr('y', cy).text('==').attr('fill', '#fff').attr('font-size', '20px');

      g.append('rect').attr('x', cx + 120).attr('y', cy - 30).attr('width', 60).attr('height', 60).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 4);
      g.append('text').attr('x', cx + 150).attr('y', cy).text("c").attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

      drawArrow(g, cx + 150, cy + 40, cx + 150, cy + 80, 'KDF');
      g.append('text').attr('x', cx + 150).attr('y', cy + 100).text('Shared Key K').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-weight', 'bold');
    }
  }
};

onMounted(() => {
  drawScene();
});

watch(() => props.step, drawScene, { deep: true });
</script>

<template>
  <div ref="containerRef"
    class="w-full h-full bg-slate-900 relative rounded-xl border border-slate-700/50 shadow-inner overflow-hidden">
    <div class="absolute bottom-4 left-4 bg-slate-950/80 p-2 rounded border border-slate-800 pointer-events-none">
      <div class="text-[10px] text-slate-400 mb-1 font-bold">Heatmap (Coefficients)</div>
      <div class="flex items-center gap-1 mb-2">
        <span class="text-[9px] text-red-400">-Q/2</span>
        <div class="w-16 h-2 bg-gradient-to-r from-red-500 via-white to-blue-500 rounded-sm"></div>
        <span class="text-[9px] text-blue-400">+Q/2</span>
      </div>
      <div class="flex gap-3 text-[9px] text-slate-300">
        <div class="flex items-center gap-1"><span class="w-2 h-2 bg-[#3b82f6] rounded-sm"></span> Alice</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 bg-[#ec4899] rounded-sm"></span> Bob</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 bg-[#f59e0b] rounded-sm"></span> Noise</div>
      </div>
    </div>
  </div>
</template>
}

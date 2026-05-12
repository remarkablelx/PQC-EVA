{
type: created file
fileName: DilithiumMatrix.vue
fullContent:
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
const Q = 8380417;
const SQRT_N = 16;

const COLORS = {
  alice: '#3b82f6',
  bob: '#ec4899',
  public: '#10b981',
  secret: '#ef4444',
  noise: '#f59e0b',
  matrix: '#6366f1',
  text: '#cbd5e1',
  grid: '#334155'
};

const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-Q / 2000, Q / 2000]);

const initSvg = () => {
  if (!containerRef.value) return;


  if (!svg) {
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
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#94a3b8');
  } else {

    svg.selectAll('g').remove();
  }
};

interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

const drawPolyMicroGrid = (g: any, data: number[], x: number, y: number, size: number, isHint: boolean = false) => {
  const cellSize = size / SQRT_N;
  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);


  group.append('rect')
    .attr('width', size).attr('height', size)
    .attr('fill', '#1e293b').attr('stroke', '#475569').attr('stroke-width', 0.5);

  if (!data || data.length === 0) return;


  const cells: Cell[] = [];

  for (let i = 0; i < N; i++) {
    const r = Math.floor(i / SQRT_N);
    const c = i % SQRT_N;
    const val = data[i % data.length] || 0;

    let fill = 'none';

    if (isHint) {

      if (val > 0.5) fill = '#ef4444';
    } else {

      let plotVal = val;
      if (val > Q / 2) plotVal = val - Q;
      fill = colorScale(plotVal * 100);
    }

    if (fill !== 'none') {
      cells.push({
        x: c * cellSize,
        y: r * cellSize,
        width: cellSize,
        height: cellSize,
        fill: fill
      });
    }
  }


  const rects = group.selectAll('rect').data(cells);
  rects.enter()
    .append('rect')
    .merge(rects)
    .attr('x', (d: Cell) => d.x)
    .attr('y', (d: Cell) => d.y)
    .attr('width', (d: Cell) => d.width)
    .attr('height', (d: Cell) => d.height)
    .attr('fill', (d: Cell) => d.fill)
    .attr('shape-rendering', 'crispEdges');

  rects.exit().remove();
};

const drawMatrix = (g: any, x: number, y: number, rows: number, cols: number, data: number[], label: string, options: any = {}) => {
  const {
    cellSize = 40,
    padding = 4,
    color = COLORS.text,
    isSecret = false,
    isHint = false,
    showDims = true
  } = options;

  const width = cols * (cellSize + padding);
  const height = rows * (cellSize + padding);

  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);


  group.append('text')
    .attr('x', width / 2 - padding / 2)
    .attr('y', -8)
    .text(label)
    .attr('fill', color)
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle');


  if (showDims) {
    group.append('text')
      .attr('x', width / 2 - padding / 2)
      .attr('y', height + 12)
      .text(`${rows}x${cols}`)
      .attr('fill', '#64748b')
      .attr('font-size', '9px')
      .attr('text-anchor', 'middle');
  }

  const coeffsPerPoly = Math.floor(data?.length / (rows * cols)) || 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const polyData = data ? data.slice(idx * coeffsPerPoly, (idx + 1) * coeffsPerPoly) : [];

      const px = c * (cellSize + padding);
      const py = r * (cellSize + padding);

      drawPolyMicroGrid(group, polyData, px, py, cellSize, isHint);

      if (isSecret) {
        group.append('rect')
          .attr('x', px).attr('y', py)
          .attr('width', cellSize).attr('height', cellSize)
          .attr('fill', 'none')
          .attr('stroke', COLORS.secret)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3,3');
      }
    }
  }

  return { width, height };
};

const drawArrow = (g: any, x1: number, y1: number, x2: number, y2: number, label: string = "") => {
  const lg = g.append('g');
  lg.append('line')
    .attr('x1', x1).attr('y1', y1)
    .attr('x2', x2).attr('y2', y2)
    .attr('stroke', '#94a3b8')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)');

  if (label) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    lg.append('rect')
      .attr('x', midX - (label.length * 3 + 4))
      .attr('y', midY - 9)
      .attr('width', label.length * 6 + 8)
      .attr('height', 18)
      .attr('fill', '#0f172a')
      .attr('rx', 4);

    lg.append('text')
      .attr('x', midX)
      .attr('y', midY + 4)
      .text(label)
      .attr('fill', '#cbd5e1')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle');
  }
};

const drawSymbol = (g: any, x: number, y: number, sym: string) => {
  g.append('text')
    .attr('x', x).attr('y', y)
    .text(sym)
    .attr('fill', '#fff')
    .attr('font-size', '20px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle');
};

let drawTimeout: number | null = null;

const drawScene = () => {

  if (drawTimeout) {
    clearTimeout(drawTimeout);
  }


  drawTimeout = window.setTimeout(() => {
    initSvg();
    if (!svg) return;

    const g = svg.append('g');
    const { step, actors, width, height } = props;
    const cx = width / 2;
    const cy = height / 2;


    if (step.phase === 'KeyGen') {
      if (step.id === 'step1') {
        g.append('text').attr('x', cx).attr('y', cy - 80).text('Entropy Source').attr('fill', '#fff').attr('text-anchor', 'middle');


        g.append('rect').attr('x', cx - 40).attr('y', cy - 40).attr('width', 80).attr('height', 80).attr('fill', COLORS.matrix).attr('rx', 8);
        g.append('text').attr('x', cx).attr('y', cy).text('ρ').attr('fill', '#fff').attr('font-size', '32px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
        g.append('text').attr('x', cx).attr('y', cy + 60).text('32 Bytes Seed').attr('fill', '#94a3b8').attr('font-size', '12px').attr('text-anchor', 'middle');
      }
      else if (step.id === 'step2') {
        drawArrow(g, cx - 120, cy, cx - 60, cy, 'ExpandA');


        g.append('rect').attr('x', cx - 160).attr('y', cy - 20).attr('width', 40).attr('height', 40).attr('fill', COLORS.matrix).attr('rx', 4);
        g.append('text').attr('x', cx - 140).attr('y', cy).text('ρ').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

        drawMatrix(g, cx - 40, cy - 80, 4, 4, actors.alice.A, 'A (Matrix)', { color: COLORS.public });
      }
      else if (step.id === 'step3') {
        g.append('text').attr('x', cx).attr('y', cy - 120).text('Sample Short Vectors').attr('fill', '#fff').attr('text-anchor', 'middle');


        const matrixY = cy - 60;
        const matrix1 = drawMatrix(g, cx - 80, matrixY, 4, 1, actors.alice.s1, 's₁ (Secret)', { isSecret: true, color: COLORS.secret });
        const matrix2 = drawMatrix(g, cx + 20, matrixY, 4, 1, actors.alice.s2, 's₂ (Error)', { isSecret: true, color: COLORS.noise });


        const matrixBottomY = matrixY + Math.max(matrix1.height, matrix2.height) + 10;
        const matrix1CenterX = cx - 80 + matrix1.width / 2;
        const matrix2CenterX = cx + 20 + matrix2.width / 2;


        drawArrow(g, matrix1CenterX, matrixBottomY + 40, matrix1CenterX, matrixBottomY, 'CBD');
        drawArrow(g, matrix2CenterX, matrixBottomY + 40, matrix2CenterX, matrixBottomY, 'CBD');
      }
      else if (step.id === 'step4') {

        const startX = cx - 250;
        const startY = cy - 80;

        drawMatrix(g, startX, startY, 4, 4, actors.alice.A, 'A', { color: COLORS.public });
        drawSymbol(g, startX + 190, cy, '·');
        drawMatrix(g, startX + 210, startY, 4, 1, actors.alice.s1, 's₁', { isSecret: true, color: COLORS.secret });
        drawSymbol(g, startX + 270, cy, '+');
        drawMatrix(g, startX + 290, startY, 4, 1, actors.alice.s2, 's₂', { isSecret: true, color: COLORS.noise });
        drawSymbol(g, startX + 350, cy, '=');
        drawMatrix(g, startX + 370, startY, 4, 1, actors.alice.t, 't', { color: COLORS.public });
      }
      else if (step.id === 'step5') {

        drawMatrix(g, cx - 180, cy - 80, 4, 1, actors.alice.t, 't', { color: COLORS.public });


        drawArrow(g, cx - 120, cy, cx - 60, cy - 60, 'High');
        drawArrow(g, cx - 120, cy, cx - 60, cy + 60, 'Low');


        const t1Y = cy - 180;
        const t0Y = cy + 40;

        drawMatrix(g, cx, t1Y, 4, 1, actors.alice.t1, 't₁ (Public)', { color: COLORS.public });
        drawMatrix(g, cx, t0Y, 4, 1, actors.alice.t0, 't₀ (Secret)', { isSecret: true, color: COLORS.secret });
      }
    }


    else if (step.phase === 'Sign') {
      if (step.id === 'step6') {

        g.append('rect').attr('x', cx - 150).attr('y', cy - 40).attr('width', 80).attr('height', 80).attr('fill', '#1e293b').attr('stroke', COLORS.public);
        g.append('text').attr('x', cx - 110).attr('y', cy).text('M || pk').attr('fill', '#fff').attr('text-anchor', 'middle');

        drawArrow(g, cx - 60, cy, cx, cy, 'CRH');

        g.append('rect').attr('x', cx + 10).attr('y', cy - 30).attr('width', 60).attr('height', 60).attr('fill', '#f59e0b').attr('rx', 4);
        g.append('text').attr('x', cx + 40).attr('y', cy).text('μ').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
      }
      else if (step.id === 'step7') {

        const matrix = drawMatrix(g, cx - 20, cy - 80, 4, 1, actors.alice.y, 'y (Mask)', { color: COLORS.noise });


        const matrixBottomY = cy - 80 + matrix.height;
        const textY = matrixBottomY + 60;

        g.append('text').attr('x', cx).attr('y', textY).text('Randomly Sampled Mask Vector').attr('fill', '#94a3b8').attr('text-anchor', 'middle');
      }
      else if (step.id === 'step8') {

        drawMatrix(g, cx - 200, cy - 80, 4, 4, actors.alice.A, 'A', { color: COLORS.public });
        drawSymbol(g, cx - 10, cy, '·');
        drawMatrix(g, cx + 10, cy - 80, 4, 1, actors.alice.y, 'y', { color: COLORS.noise });
        drawArrow(g, cx + 70, cy, cx + 120, cy, 'HighBits');
        drawMatrix(g, cx + 130, cy - 80, 4, 1, actors.alice.w1, 'w₁', { color: COLORS.alice });
      }
      else if (step.id === 'step9') {

        g.append('rect').attr('x', cx - 160).attr('y', cy - 30).attr('width', 60).attr('height', 60).attr('fill', '#f59e0b').attr('rx', 4);
        g.append('text').attr('x', cx - 130).attr('y', cy).text('μ').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

        g.append('text').attr('x', cx - 80).attr('y', cy).text('+').attr('fill', '#fff').attr('font-size', '20px').attr('text-anchor', 'middle');

        drawMatrix(g, cx - 60, cy - 80, 4, 1, actors.alice.w1, 'w₁', { color: COLORS.alice });

        drawArrow(g, cx, cy, cx + 50, cy, 'H');

        drawPolyMicroGrid(g.append('g'), actors.alice.c, cx + 60, cy - 20, 40, true);
        g.append('text').attr('x', cx + 80).attr('y', cy + 35).text('c (Challenge)').attr('fill', '#fff').attr('font-size', '12px').attr('text-anchor', 'middle');
      }
      else if (step.id === 'step10') {

        drawMatrix(g, cx - 200, cy - 80, 4, 1, actors.alice.y, 'y', { color: COLORS.noise });
        drawSymbol(g, cx - 140, cy, '+');

        g.append('rect').attr('x', cx - 120).attr('y', cy - 20).attr('width', 40).attr('height', 40).attr('fill', '#1e293b').attr('stroke', '#fff');
        g.append('text').attr('x', cx - 100).attr('y', cy).text('c').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

        drawSymbol(g, cx - 70, cy, '·');
        drawMatrix(g, cx - 50, cy - 80, 4, 1, actors.alice.s1, 's₁', { isSecret: true, color: COLORS.secret });

        drawSymbol(g, cx + 10, cy, '=');
        drawMatrix(g, cx + 30, cy - 80, 4, 1, actors.alice.z, 'z', { color: COLORS.alice });
      }
      else if (step.id === 'step11') {

        drawMatrix(g, cx - 40, cy - 80, 4, 1, actors.alice.z, 'z', { color: COLORS.alice });

        g.append('rect')
          .attr('x', cx + 40).attr('y', cy - 40)
          .attr('width', 140).attr('height', 80)
          .attr('fill', 'none').attr('stroke', '#eab308').attr('stroke-width', 2).attr('rx', 8);

        g.append('text').attr('x', cx + 110).attr('y', cy - 10).text('Norm Check').attr('fill', '#eab308').attr('text-anchor', 'middle').attr('font-weight', 'bold');
        g.append('text').attr('x', cx + 110).attr('y', cy + 20).text('||z|| < γ').attr('fill', '#eab308').attr('text-anchor', 'middle');
      }
      else if (step.id === 'step12') {

        g.append('text').attr('x', cx).attr('y', cy - 100).text('Correcting High Bits for Verifier').attr('fill', '#fff').attr('text-anchor', 'middle');
        drawMatrix(g, cx - 20, cy - 60, 4, 1, actors.alice.h, 'h (Hint)', { isHint: true, color: COLORS.matrix });
      }
      else if (step.id === 'step13') {

        g.append('text').attr('x', cx).attr('y', cy - 100).text('Signature σ = (z, h, c)').attr('fill', '#fff').attr('text-anchor', 'middle');

        const boxW = 200, boxH = 100;
        g.append('rect').attr('x', cx - boxW / 2).attr('y', cy - 40).attr('width', boxW).attr('height', boxH).attr('fill', '#1e293b').attr('stroke', COLORS.alice).attr('rx', 8);

        drawPolyMicroGrid(g.append('g'), actors.alice.z, cx - 80, cy - 20, 40);
        drawPolyMicroGrid(g.append('g'), actors.alice.h, cx - 20, cy - 20, 40, true);
        drawPolyMicroGrid(g.append('g'), actors.alice.c, cx + 40, cy - 20, 40);

        g.append('text').attr('x', cx - 60).attr('y', cy + 40).text('z').attr('fill', '#cbd5e1').attr('font-size', '10px');
        g.append('text').attr('x', cx).attr('y', cy + 40).text('h').attr('fill', '#cbd5e1').attr('font-size', '10px');
        g.append('text').attr('x', cx + 60).attr('y', cy + 40).text('c').attr('fill', '#cbd5e1').attr('font-size', '10px');
      }
    }


    else if (step.phase === 'Verify') {
      if (step.id === 'step14') {


        g.append('text').attr('x', cx).attr('y', cy - 100).text('Check Signature Norm').attr('fill', '#fff').attr('text-anchor', 'middle');


        drawMatrix(g, cx - 60, cy - 60, 4, 1, actors.bob.z, 'z (Signature)', { color: COLORS.alice });


        g.append('rect')
          .attr('x', cx + 20).attr('y', cy - 30)
          .attr('width', 140).attr('height', 60)
          .attr('fill', 'none').attr('stroke', COLORS.public)
          .attr('stroke-width', 2).attr('rx', 8);

        g.append('text').attr('x', cx + 90).attr('y', cy - 5).text('Valid Range?').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-weight', 'bold');
        g.append('text').attr('x', cx + 90).attr('y', cy + 15).text('||z|| < Limit').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-size', '12px');


        g.append('text').attr('x', cx + 180).attr('y', cy).text('✓').attr('fill', '#10b981').attr('font-size', '24px').attr('font-weight', 'bold');
      }
      else if (step.id === 'step15') {


        const leftX = cx - 220;
        drawMatrix(g, leftX, cy - 80, 4, 4, actors.bob.A, 'A', { color: COLORS.public });
        drawSymbol(g, leftX + 180, cy, '·');
        drawMatrix(g, leftX + 200, cy - 80, 4, 1, actors.bob.z, 'z', { color: COLORS.alice });
        drawSymbol(g, leftX + 260, cy, '-');


        g.append('rect').attr('x', leftX + 280).attr('y', cy - 20).attr('width', 40).attr('height', 40).attr('fill', '#1e293b').attr('stroke', '#fff');
        g.append('text').attr('x', leftX + 300).attr('y', cy).text('c').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

        drawMatrix(g, leftX + 330, cy - 80, 4, 1, actors.bob.t1, 't₁', { color: COLORS.public });

        drawArrow(g, leftX + 390, cy, leftX + 440, cy, 'UseHint(h)');
        drawMatrix(g, leftX + 450, cy - 80, 4, 1, actors.bob.w1_prime, "w₁'", { color: COLORS.bob });
      }
      else if (step.id === 'step16') {


        g.append('text').attr('x', cx).attr('y', cy - 100).text("Recompute Challenge c'").attr('fill', '#fff').attr('text-anchor', 'middle');


        g.append('rect').attr('x', cx - 180).attr('y', cy - 30).attr('width', 50).attr('height', 50).attr('fill', '#f59e0b').attr('rx', 4);
        g.append('text').attr('x', cx - 155).attr('y', cy).text('μ').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

        g.append('text').attr('x', cx - 110).attr('y', cy).text('+').attr('fill', '#fff').attr('font-size', '20px').attr('text-anchor', 'middle');


        drawMatrix(g, cx - 80, cy - 60, 4, 1, actors.bob.w1_prime, "w₁'", { color: COLORS.bob });


        drawArrow(g, cx - 20, cy, cx + 40, cy, 'H');


        drawPolyMicroGrid(g.append('g'), actors.bob.c_prime, cx + 50, cy - 20, 40);
        g.append('text').attr('x', cx + 70).attr('y', cy + 35).text("c' (Calc)").attr('fill', '#fff').attr('font-size', '12px').attr('text-anchor', 'middle');
      }
      else if (step.id === 'step17') {
        drawPolyMicroGrid(g.append('g'), actors.bob.c, cx - 80, cy - 40, 60);
        g.append('text').attr('x', cx - 50).attr('y', cy + 40).text('c (Sig)').attr('fill', COLORS.alice).attr('text-anchor', 'middle');

        drawSymbol(g, cx, cy, '==');

        drawPolyMicroGrid(g.append('g'), actors.bob.c_prime, cx + 20, cy - 40, 60);
        g.append('text').attr('x', cx + 50).attr('y', cy + 40).text("c' (Calc)").attr('fill', COLORS.bob).attr('text-anchor', 'middle');
      }
    }
  }, 50);
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
      <div class="text-[10px] text-slate-400 mb-1 font-bold">Legend</div>
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-[#ef4444]"></div><span class="text-[10px] text-slate-300">Secret/Hint (Binary)</span>
      </div>
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-[#f59e0b]"></div><span class="text-[10px] text-slate-300">Noise/Mask</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-[#3b82f6]"></div><span class="text-[10px] text-slate-300">Poly Coeffs (Heatmap)</span>
      </div>
    </div>
  </div>
</template>
}

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
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;

const VECTOR_SIZE = 16;
const CELL_SIZE = 10;
const GRID_GAP = 1;

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
    .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#94a3b8');
};

interface BinaryVectorOptions {
  color?: string;
  isSecret?: boolean;
  showWeight?: boolean;
  highlightOnes?: boolean;
  reducedSize?: boolean;
}

const drawBinaryVector = (g: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number, data: number[], label: string, options: BinaryVectorOptions = {}) => {
  const {
    color = COLORS.text,
    isSecret = false,
    showWeight = true,
    highlightOnes = true,
    reducedSize = false
  } = options;

  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);

  const actualVectorSize = reducedSize ? Math.min(VECTOR_SIZE, 8) : VECTOR_SIZE;
  const vectorWidth = actualVectorSize * (CELL_SIZE + GRID_GAP);
  const vectorHeight = CELL_SIZE + GRID_GAP;

  group.append('rect')
    .attr('width', vectorWidth)
    .attr('height', vectorHeight)
    .attr('fill', '#1e293b')
    .attr('stroke', COLORS.grid)
    .attr('stroke-width', 0.5);

  group.append('text')
    .attr('x', vectorWidth / 2)
    .attr('y', -8)
    .text(label)
    .attr('fill', color)
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle');

  if (!data || data.length === 0) return;

  const ones = data.filter((v: number) => v !== 0).length;

  for (let i = 0; i < Math.min(data.length, actualVectorSize); i++) {
    const val = data[i];
    const px = i * (CELL_SIZE + GRID_GAP);

    const cell = group.append('rect')
      .attr('x', px)
      .attr('y', 0)
      .attr('width', CELL_SIZE)
      .attr('height', CELL_SIZE)
      .attr('fill', val !== 0 && highlightOnes ? color : '#1e293b')
      .attr('stroke', COLORS.grid)
      .attr('stroke-width', 0.5);

    if (isSecret) {
      cell.attr('stroke', COLORS.secret).attr('stroke-width', 1.5);
    }
  }

  if (showWeight) {
    group.append('text')
      .attr('x', vectorWidth / 2)
      .attr('y', vectorHeight + 12)
      .text(`wt=${ones}`)
      .attr('fill', '#64748b')
      .attr('font-size', '9px')
      .attr('text-anchor', 'middle');
  }

  return { width: vectorWidth, height: vectorHeight };
};

interface MatrixOptions {
  color?: string;
  isSecret?: boolean;
  showDims?: boolean;
  reducedSize?: boolean;
}

const drawMatrix = (g: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number, rows: number, cols: number, data: number[], label: string, options: MatrixOptions = {}) => {
  const {
    color = COLORS.text,
    isSecret = false,
    showDims = true,
    reducedSize = false
  } = options;

  const actualRows = reducedSize ? Math.min(rows, 3) : rows;
  const actualCols = reducedSize ? Math.min(cols, 3) : cols;

  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);

  const matrixWidth = actualCols * (CELL_SIZE + GRID_GAP);
  const matrixHeight = actualRows * (CELL_SIZE + GRID_GAP);

  group.append('rect')
    .attr('width', matrixWidth)
    .attr('height', matrixHeight)
    .attr('fill', '#1e293b')
    .attr('stroke', COLORS.grid)
    .attr('stroke-width', 0.5);

  group.append('text')
    .attr('x', matrixWidth / 2)
    .attr('y', -8)
    .text(label)
    .attr('fill', color)
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle');

  if (showDims) {
    group.append('text')
      .attr('x', matrixWidth / 2)
      .attr('y', matrixHeight + 12)
      .text(`${rows}x${cols}`)
      .attr('fill', '#64748b')
      .attr('font-size', '8px')
      .attr('text-anchor', 'middle');
  }

  const coeffsPerCell = Math.floor(data?.length / (rows * cols)) || 1;

  for (let r = 0; r < actualRows; r++) {
    for (let c = 0; c < actualCols; c++) {
      const idx = r * cols + c;
      const cellData = data ? data.slice(idx * coeffsPerCell, (idx + 1) * coeffsPerCell) : [];
      const val = cellData[0] || 0;

      const px = c * (CELL_SIZE + GRID_GAP);
      const py = r * (CELL_SIZE + GRID_GAP);

      const cell = group.append('rect')
        .attr('x', px)
        .attr('y', py)
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('fill', val !== 0 ? color : '#1e293b')
        .attr('stroke', COLORS.grid)
        .attr('stroke-width', 0.5);

      if (isSecret) {
        cell.attr('stroke', COLORS.secret).attr('stroke-width', 1.5);
      }
    }
  }

  return { width: matrixWidth, height: matrixHeight };
};

const drawArrow = (g: d3.Selection<SVGGElement, unknown, null, undefined>, x1: number, y1: number, x2: number, y2: number, label: string = "") => {
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

const drawOperation = (g: d3.Selection<SVGGElement, unknown, null, undefined>, x: number, y: number, symbol: string) => {
  g.append('text')
    .attr('x', x).attr('y', y)
    .text(symbol)
    .attr('fill', '#fff')
    .attr('font-size', '18px')
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
      g.append('text').attr('x', cx).attr('y', cy - 60).text('Generating Random Seed').attr('fill', '#fff').attr('text-anchor', 'middle');

      const boxSize = 50;
      g.append('rect').attr('x', cx - boxSize / 2).attr('y', cy - boxSize / 2).attr('width', boxSize).attr('height', boxSize).attr('fill', COLORS.matrix).attr('rx', 8);
      g.append('text').attr('x', cx).attr('y', cy).text('seed').attr('fill', '#fff').attr('font-size', '14px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
      g.append('text').attr('x', cx).attr('y', cy + boxSize / 2 + 20).text('40 Bytes').attr('fill', COLORS.matrix).attr('font-size', '11px').attr('text-anchor', 'middle');
    }
    else if (step.id === 'step2') {
      g.append('text').attr('x', cx).attr('y', cy - 100).text('Generate Secret Vectors').attr('fill', '#fff').attr('text-anchor', 'middle');

      const startX = cx - 120;

      drawBinaryVector(g, startX, cy - 60, actors.alice.x, 'x (Secret)', { isSecret: true, color: COLORS.secret, reducedSize: true });
      drawBinaryVector(g, startX, cy, actors.alice.y, 'y (Secret)', { isSecret: true, color: COLORS.secret, reducedSize: true });
      drawBinaryVector(g, startX, cy + 60, actors.alice.e, 'e (Error)', { isSecret: true, color: COLORS.noise, reducedSize: true });

      g.append('text').attr('x', cx + 80).attr('y', cy).text('Fixed Hamming Weight').attr('fill', COLORS.noise).attr('font-size', '10px').attr('text-anchor', 'middle');
    }
    else if (step.id === 'step3') {
      const startX = cx - 350;
      const matY = cy - 30;

      drawBinaryVector(g, startX - 80, matY + 20, actors.alice.x, 'x (Secret)', { isSecret: true, color: COLORS.secret });
      drawOperation(g, startX + 140, cy, '+');
      drawMatrix(g, startX + 180, matY + 10, 4, 4, actors.alice.G, 'h (Random)', { color: COLORS.public, reducedSize: true });
      drawOperation(g, startX + 250, cy, '·');
      drawBinaryVector(g, startX + 270, matY + 20, actors.alice.y, 'y (Secret)', { isSecret: true, color: COLORS.secret });
      drawOperation(g, startX + 500, cy, '=');
      drawBinaryVector(g, startX + 550, matY + 20, actors.alice.h, 's (Public)', { color: COLORS.public });
    }
    else if (step.id === 'step4') {
      g.append('text').attr('x', cx).attr('y', cy - 100).text('Key Pair').attr('fill', '#fff').attr('text-anchor', 'middle');

      const boxW = 200, boxH = 120;
      g.append('rect').attr('x', cx - boxW / 2).attr('y', cy - 40).attr('width', boxW).attr('height', boxH).attr('fill', '#1e293b').attr('stroke', COLORS.public).attr('rx', 8);

      g.append('text').attr('x', cx).attr('y', cy - 20).text('Public Key: (seed, h)').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-weight', 'bold');
      g.append('text').attr('x', cx).attr('y', cy + 10).text('Secret Key: (seed, x, y, e)').attr('fill', COLORS.secret).attr('text-anchor', 'middle').attr('font-weight', 'bold');

      g.append('text').attr('x', cx).attr('y', cy + 50).text('pk: 2249 bytes | sk: 2289 bytes').attr('fill', '#64748b').attr('font-size', '10px').attr('text-anchor', 'middle');
    }
  }
  else if (step.phase === 'Encaps') {
    if (step.id === 'step5') {
      g.append('text').attr('x', cx).attr('y', cy - 100).text('Generate Message & Noise').attr('fill', '#fff').attr('text-anchor', 'middle');

      g.append('text').attr('x', cx).attr('y', cy - 60).text('公共生成矩阵 G').attr('fill', COLORS.public).attr('text-anchor', 'middle');
      drawMatrix(g, cx - 20, cy - 40, 4, 4, actors.alice.G, 'G', { color: COLORS.public, showDims: true, reducedSize: true });

      g.append('text').attr('x', cx).attr('y', cy + 20).text('生成随机向量').attr('fill', COLORS.text).attr('text-anchor', 'middle');

      const vectorStartX = cx - 390;
      const vectorSpacing = 200;

      drawBinaryVector(g, vectorStartX, cy + 40, actors.bob.m, 'm (Message)', { color: COLORS.bob, showWeight: false });
      drawBinaryVector(g, vectorStartX + vectorSpacing, cy + 40, actors.bob.v, 'r₁ (Noise)', { color: COLORS.noise });
      drawBinaryVector(g, vectorStartX + vectorSpacing * 2, cy + 40, actors.bob.e1, 'r₂ (Noise)', { color: COLORS.noise });
      drawBinaryVector(g, vectorStartX + vectorSpacing * 3, cy + 40, actors.bob.e2, 'e (Error)', { color: COLORS.noise });
    }
    else if (step.id === 'step6') {
      const startX = cx - 350;
      const topY = cy - 150;

      g.append('text').attr('x', cx).attr('y', topY - 20).text('计算密文分量').attr('fill', '#fff').attr('text-anchor', 'middle');

      g.append('text').attr('x', startX).attr('y', topY).text('Compute u = r₁ + r₂·h').attr('fill', COLORS.text).attr('font-size', '10px');

      drawBinaryVector(g, startX - 60, topY + 50, actors.bob.v, 'r₁', { color: COLORS.noise });
      drawOperation(g, startX + 140, topY + 60, '+');
      drawMatrix(g, startX + 180, topY + 40, 4, 4, actors.alice.G, 'h (矩阵)', { color: COLORS.public, reducedSize: true });
      drawOperation(g, startX + 250, topY + 60, '·');
      drawBinaryVector(g, startX + 280, topY + 50, actors.bob.e1, 'r₂', { color: COLORS.noise });
      drawOperation(g, startX + 500, topY + 60, '=');
      drawMatrix(g, startX + 550, topY + 40, 3, 3, actors.alice.G, 'u', { color: COLORS.bob, showDims: true, reducedSize: true });

      g.append('text').attr('x', startX).attr('y', topY + 130).text('Compute v = m.G + s.r₂ + e').attr('fill', COLORS.text).attr('font-size', '10px');
      drawBinaryVector(g, startX - 60, topY + 180, actors.bob.m, 'm', { color: COLORS.bob, showWeight: false });
      drawOperation(g, startX + 140, topY + 190, '·');
      drawMatrix(g, startX + 160, topY + 170, 4, 4, actors.alice.G, 'G (矩阵)', { color: COLORS.public, reducedSize: true });
      drawOperation(g, startX + 220, topY + 190, '+');
      drawMatrix(g, startX + 250, topY + 170, 3, 3, actors.alice.G, 's', { color: COLORS.public, showDims: true, reducedSize: true });
      drawOperation(g, startX + 320, topY + 190, '·');
      drawBinaryVector(g, startX + 350, topY + 180, actors.bob.e1, 'r₂', { color: COLORS.noise });
      drawOperation(g, startX + 550, topY + 190, '+');
      drawBinaryVector(g, startX + 570, topY + 180, actors.bob.e2, 'e', { color: COLORS.noise });
      drawOperation(g, startX + 770, topY + 190, '=');
      drawMatrix(g, startX + 790, topY + 170, 3, 3, actors.alice.G, 'v', { color: COLORS.bob, showDims: true, reducedSize: true });
    }
    else if (step.id === 'step7') {
      g.append('text').attr('x', cx).attr('y', cy - 100).text('Ciphertext c = (u, v, d, salt)').attr('fill', '#fff').attr('text-anchor', 'middle');

      const boxW = 350, boxH = 130;
      g.append('rect').attr('x', cx - boxW / 2).attr('y', cy - 80).attr('width', boxW).attr('height', boxH).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 8);

      drawMatrix(g, cx - 150, cy - 30, 3, 3, actors.alice.G, 'u', { color: COLORS.bob, showDims: true, reducedSize: true });
      drawMatrix(g, cx + 120, cy - 30, 3, 3, actors.alice.G, 'v', { color: COLORS.bob, showDims: true, reducedSize: true });

      g.append('rect').attr('x', cx - 80).attr('y', cy + 30).attr('width', 60).attr('height', 20).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 4);
      g.append('text').attr('x', cx - 50).attr('y', cy + 45).text('d').attr('fill', COLORS.bob).attr('font-size', '12px').attr('text-anchor', 'middle');
      g.append('rect').attr('x', cx + 10).attr('y', cy + 30).attr('width', 60).attr('height', 20).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 4);
      g.append('text').attr('x', cx + 40).attr('y', cy + 45).text('salt').attr('fill', COLORS.bob).attr('font-size', '12px').attr('text-anchor', 'middle');

      g.append('text').attr('x', cx).attr('y', cy + 80).text('ct: 4481 bytes').attr('fill', COLORS.bob).attr('font-size', '10px').attr('text-anchor', 'middle');
    }
    else if (step.id === 'step8') {
      g.append('text').attr('x', cx).attr('y', cy - 80).text('Derive Shared Secret').attr('fill', '#fff').attr('text-anchor', 'middle');

      g.append('text').attr('x', cx).attr('y', cy - 40).text('输入矩阵：m || u || v').attr('fill', COLORS.text).attr('text-anchor', 'middle');
      drawMatrix(g, cx - 100, cy - 20, 4, 4, actors.alice.G, 'Input Matrix', { color: COLORS.public, reducedSize: true });

      g.append('text').attr('x', cx).attr('y', cy + 60).text('K = KDF(m || u || v)').attr('fill', '#fff').attr('font-size', '14px').attr('text-anchor', 'middle');
      drawArrow(g, cx, cy + 20, cx, cy + 50, 'KDF');

      g.append('rect').attr('x', cx - 60).attr('y', cy + 70).attr('width', 120).attr('height', 50).attr('fill', COLORS.public).attr('rx', 8);
      g.append('text').attr('x', cx).attr('y', cy + 100).text('K').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
      g.append('text').attr('x', cx).attr('y', cy + 125).text('64 bytes').attr('fill', COLORS.public).attr('font-size', '10px').attr('text-anchor', 'middle');
    }
  }
  else if (step.phase === 'Decaps') {
    if (step.id === 'step8') {
      g.append('text').attr('x', cx).attr('y', cy - 100).text('Parse Ciphertext').attr('fill', '#fff').attr('text-anchor', 'middle');

      const boxW = 400, boxH = 130;
      g.append('rect').attr('x', cx - boxW / 2).attr('y', cy - 70).attr('width', boxW).attr('height', boxH).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 8);
      g.append('text').attr('x', cx).attr('y', cy - 100).text('c').attr('fill', COLORS.bob).attr('font-size', '14px').attr('text-anchor', 'middle');

      drawBinaryVector(g, cx - 180, cy - 30, actors.bob.u, 'u', { color: COLORS.bob, showWeight: false });
      drawBinaryVector(g, cx + 10, cy - 30, actors.bob.v, 'v', { color: COLORS.bob });
      g.append('rect').attr('x', cx - 90).attr('y', cy + 20).attr('width', 70).attr('height', 25).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 4);
      g.append('text').attr('x', cx - 55).attr('y', cy + 38).text('d').attr('fill', COLORS.bob).attr('font-size', '12px').attr('text-anchor', 'middle');
      g.append('rect').attr('x', cx + 20).attr('y', cy + 20).attr('width', 70).attr('height', 25).attr('fill', '#1e293b').attr('stroke', COLORS.bob).attr('rx', 4);
      g.append('text').attr('x', cx + 55).attr('y', cy + 38).text('salt').attr('fill', COLORS.bob).attr('font-size', '12px').attr('text-anchor', 'middle');
    }
    else if (step.id === 'step9') {
      g.append('text').attr('x', cx).attr('y', cy - 80).text('Decode Message').attr('fill', '#fff').attr('text-anchor', 'middle');

      g.append('text').attr('x', cx - 50).attr('y', cy - 40).text('m\' = Decode(v - u.y)').attr('fill', COLORS.text).attr('font-size', '11px');

      drawBinaryVector(g, cx - 330, cy - 10, actors.bob.v, 'v', { color: COLORS.bob });
      drawOperation(g, cx - 120, cy, '-');
      drawBinaryVector(g, cx - 80, cy - 10, actors.bob.u, 'u', { color: COLORS.bob });
      drawOperation(g, cx + 130, cy, '·');
      drawBinaryVector(g, cx + 160, cy - 10, actors.alice.y, 'y', { isSecret: true, color: COLORS.secret });
      drawArrow(g, cx, cy + 30, cx, cy + 60, 'Decode');
      drawBinaryVector(g, cx - 90, cy + 90, actors.alice.m_prime, "m'", { color: COLORS.alice, showWeight: false });

      g.append('text').attr('x', cx).attr('y', cy + 120).text('Concatenated Codes').attr('fill', COLORS.matrix).attr('font-size', '10px').attr('text-anchor', 'middle');
    }
    else if (step.id === 'step10') {
      g.append('text').attr('x', cx).attr('y', cy - 80).text('Verify Ciphertext').attr('fill', '#fff').attr('text-anchor', 'middle');

      const boxW = 220, boxH = 90;
      g.append('rect').attr('x', cx - boxW / 2).attr('y', cy - 40).attr('width', boxW).attr('height', boxH).attr('fill', '#1e293b').attr('stroke', COLORS.public).attr('rx', 8);

      g.append('text').attr('x', cx).attr('y', cy - 10).text('Fujisaki-Okamoto').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-weight', 'bold');
      g.append('text').attr('x', cx).attr('y', cy + 15).text('Verify(u, v, d, m\', salt)').attr('fill', '#94a3b8').attr('text-anchor', 'middle').attr('font-size', '11px');
      g.append('text').attr('x', cx + 120).attr('y', cy).text('✓').attr('fill', '#10b981').attr('font-size', '24px').attr('font-weight', 'bold');
    }
    else if (step.id === 'step11') {
      g.append('text').attr('x', cx).attr('y', cy - 100).text('Derive Shared Secret').attr('fill', '#fff').attr('text-anchor', 'middle');

      g.append('rect').attr('x', cx - 140).attr('y', cy - 75).attr('width', 280).attr('height', 40).attr('fill', '#1e293b').attr('stroke', COLORS.public).attr('rx', 4);
      g.append('text').attr('x', cx).attr('y', cy - 50).text("K' = KDF(m' || u || v)").attr('fill', '#fff').attr('font-size', '14px').attr('text-anchor', 'middle');

      g.append('rect').attr('x', cx - 70).attr('y', cy - 25).attr('width', 140).attr('height', 30).attr('fill', '#1e293b').attr('stroke', COLORS.public).attr('rx', 4);
      g.append('text').attr('x', cx).attr('y', cy - 5).text("m' || u || v").attr('fill', '#fff').attr('font-size', '12px').attr('text-anchor', 'middle');
      drawArrow(g, cx, cy + 15, cx, cy + 55, 'KDF');
      g.append('rect').attr('x', cx - 60).attr('y', cy + 65).attr('width', 120).attr('height', 45).attr('fill', COLORS.public).attr('rx', 8);
      g.append('text').attr('x', cx).attr('y', cy + 90).text("K'").attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
      g.append('text').attr('x', cx).attr('y', cy + 120).text('64 bytes').attr('fill', COLORS.public).attr('font-size', '10px').attr('text-anchor', 'middle');
      g.append('text').attr('x', cx).attr('y', cy + 145).text("K' == K").attr('fill', '#10b981').attr('text-anchor', 'middle').attr('font-weight', 'bold');
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
      <div class="text-[10px] text-slate-400 mb-1 font-bold">Legend</div>
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-[#ef4444]"></div><span class="text-[10px] text-slate-300">Secret (Binary)</span>
      </div>
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-[#f59e0b]"></div><span class="text-[10px] text-slate-300">Noise/Error</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-[#10b981]"></div><span class="text-[10px] text-slate-300">Public</span>
      </div>
    </div>
  </div>
</template>

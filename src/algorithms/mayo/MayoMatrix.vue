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

const PARAMS = { n: 7, o: 2, m: 4, k: 3 };
const CELL_SIZE = 22;
const GAP = 3;

const COLORS = {
  vinegar: '#3b82f6',
  oil: '#ec4899',
  secret: '#ef4444',
  public: '#10b981',
  target: '#8b5cf6',
  empty: '#1e293b',
  stroke: '#334155',
  highlight: '#fbbf24',
  text: '#cbd5e1'
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

  defs.append('marker')
    .attr('id', 'arrow-active')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8).attr('refY', 0)
    .attr('markerWidth', 6).attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', COLORS.vinegar);
};

const drawMatrix = (
  g: any,
  x: number,
  y: number,
  rows: number,
  cols: number,
  label: string,
  type: 'vinegar' | 'oil' | 'public' | 'target' | 'mixed' | 'secret',
  config: any = {}
) => {
  const group = g.append('g').attr('transform', `translate(${x}, ${y})`);


  if (label) {
    group.append('text')
      .attr('x', (cols * (CELL_SIZE + GAP)) / 2)
      .attr('y', -10)
      .text(label)
      .attr('fill', COLORS.text)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');
  }

  const cells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let fill = COLORS.empty;
      let stroke = COLORS.stroke;
      let opacity = 1;
      let isDashed = false;


      if (type === 'secret') {
        fill = COLORS.secret;

        if (r < rows - PARAMS.o && c === r % PARAMS.o) opacity = 1;
        else opacity = 0.6;
      }
      else if (type === 'public') {
        fill = COLORS.public;
        opacity = (config.isSeed) ? 0.3 : 0.8;
      }
      else if (type === 'target') {
        fill = COLORS.target;
      }
      else if (type === 'mixed') {

        const isVinegar = r < (rows - PARAMS.o);
        if (isVinegar) {
          fill = COLORS.vinegar;
        } else {
          if (config.fillOil) fill = COLORS.oil;
          else {
            fill = 'none';
            stroke = COLORS.oil;
            isDashed = true;
          }
        }
      }


      if (config.highlightRow === r) {
        stroke = COLORS.highlight;
        fill = d3.color(fill)?.brighter(0.5).toString() || fill;
      }

      const rect = group.append('rect')
        .attr('x', c * (CELL_SIZE + GAP))
        .attr('y', r * (CELL_SIZE + GAP))
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('rx', 3)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', 1.5)
        .attr('fill-opacity', opacity);

      if (isDashed) rect.attr('stroke-dasharray', '3,3');

      cells.push(rect);
    }
  }


  if (config.showDims) {

    group.append('text').attr('x', -8).attr('y', (rows * (CELL_SIZE + GAP)) / 2).text(rows).attr('font-size', '10px').attr('fill', '#64748b').attr('text-anchor', 'end').attr('alignment-baseline', 'middle');

    group.append('text').attr('x', (cols * (CELL_SIZE + GAP)) / 2).attr('y', rows * (CELL_SIZE + GAP) + 12).text(cols).attr('font-size', '10px').attr('fill', '#64748b').attr('text-anchor', 'middle');
  }

  return { group, width: cols * (CELL_SIZE + GAP), height: rows * (CELL_SIZE + GAP) };
};

const drawArrow = (g: any, x1: number, y1: number, x2: number, y2: number, label: string = "", active: boolean = false) => {
  const group = g.append('g');
  group.append('path')
    .attr('d', `M ${x1} ${y1} L ${x2} ${y2}`)
    .attr('stroke', active ? COLORS.vinegar : '#94a3b8')
    .attr('stroke-width', 2)
    .attr('marker-end', active ? 'url(#arrow-active)' : 'url(#arrow)');

  if (label) {
    group.append('text')
      .attr('x', (x1 + x2) / 2)
      .attr('y', (y1 + y2) / 2 - 5)
      .text(label)
      .attr('fill', active ? COLORS.vinegar : '#94a3b8')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle');
  }
  return group;
}

const renderKeyGen = (stepId: string) => {
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const g = svg.append('g');

  if (stepId === 'step1') {

    const m = drawMatrix(g, centerX - (PARAMS.o * CELL_SIZE) / 2, centerY - (PARAMS.n * CELL_SIZE) / 2, PARAMS.n, PARAMS.o, "Secret Oil Space (O)", "secret", { showDims: true });
    g.append('text').attr('x', centerX).attr('y', centerY + 150).text('Select random subspace where P(o) = 0').attr('text-anchor', 'middle').attr('fill', COLORS.text);
    return;
  }


  const matSize = 4;
  const startX = centerX - 220;
  const spacing = 140;
  const matrixY = centerY - 70;


  const p1 = drawMatrix(g, startX, matrixY, matSize, matSize, "P1 (Seed)", "public", { isSeed: stepId !== 'step2' });


  const p2 = drawMatrix(g, startX + spacing, matrixY, matSize, matSize, "P2 (Seed)", "public", { isSeed: stepId !== 'step2' });


  const p3 = drawMatrix(g, startX + spacing * 2, matrixY, matSize, matSize, "P3 (Correction)", "public", { isSeed: false });


  const matrixHeight = p1.height;
  const matrixCenterY = matrixY + matrixHeight / 2;

  g.append('text').attr('x', startX + p1.width + 20).attr('y', matrixCenterY).text('+').attr('fill', '#fff').attr('font-size', '20px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
  g.append('text').attr('x', startX + p1.width + spacing + 20).attr('y', matrixCenterY).text('+').attr('fill', '#fff').attr('font-size', '20px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

  if (stepId === 'step2') {

    g.append('text').attr('x', centerX).attr('y', centerY + 80)
      .text('Computing P3 such that P(O) = 0').attr('fill', COLORS.highlight).attr('text-anchor', 'middle');


    p3.group.selectAll('rect').transition().duration(800).attr('stroke', COLORS.highlight);
  }
  else if (stepId === 'step3') {

    g.append('rect')
      .attr('x', startX - 10).attr('y', centerY - 100)
      .attr('width', spacing + p1.width + 20).attr('height', p1.height + 40)
      .attr('fill', 'none').attr('stroke', COLORS.vinegar).attr('stroke-dasharray', '5,5').attr('rx', 8);

    g.append('text').attr('x', startX + (spacing + p1.width) / 2).attr('y', centerY - 110).text('Expand from Seed_PK').attr('fill', COLORS.vinegar).attr('font-size', '10px').attr('text-anchor', 'middle');

    g.append('text').attr('x', centerX).attr('y', centerY + 90)
      .text('Compressing: Only store Seed & P3').attr('fill', COLORS.public).attr('text-anchor', 'middle');
  }
  else if (stepId === 'step4') {

    const totalWidth = spacing * 2 + p3.width;
    g.append('rect')
      .attr('x', startX - 20).attr('y', centerY - 100)
      .attr('width', totalWidth + 40).attr('height', p1.height + 80)
      .attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2).attr('rx', 10);

    g.append('text').attr('x', startX + totalWidth / 2).attr('y', centerY + p1.height + 50).text('Public Key (pk)').attr('fill', '#fff').attr('font-weight', 'bold').attr('text-anchor', 'middle');
  }
};

const renderSign = (stepId: string) => {
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const g = svg.append('g');


  if (stepId === 'step5') {
    g.append('text').attr('x', centerX).attr('y', centerY - 80).text('Message M').attr('fill', '#fff');
    drawArrow(g, centerX, centerY - 70, centerX, centerY - 34, "Hash");
    drawMatrix(g, centerX - 40, centerY - 10, PARAMS.m, PARAMS.k, "Target T", "target");
    return;
  }


  if (stepId === 'step6' || stepId === 'step7') {
    const mat = drawMatrix(g, centerX - 60, centerY - 80, PARAMS.n, PARAMS.k, "Signature Matrix S", "mixed", {
      fillOil: false,
      showDims: true
    });


    const vH = (PARAMS.n - PARAMS.o) * (CELL_SIZE + GAP);
    const oH = PARAMS.o * (CELL_SIZE + GAP);

    g.append('line').attr('x1', centerX + 40).attr('y1', centerY - 80).attr('x2', centerX + 50).attr('y2', centerY - 80).attr('stroke', COLORS.vinegar);
    g.append('line').attr('x1', centerX + 50).attr('y1', centerY - 80).attr('x2', centerX + 50).attr('y2', centerY - 80 + vH).attr('stroke', COLORS.vinegar);
    g.append('line').attr('x1', centerX + 50).attr('y1', centerY - 80 + vH).attr('x2', centerX + 40).attr('y2', centerY - 80 + vH).attr('stroke', COLORS.vinegar);
    g.append('text').attr('x', centerX + 55).attr('y', centerY - 80 + vH / 2).text('Vinegar (Random)').attr('fill', COLORS.vinegar).attr('font-size', '10px').attr('alignment-baseline', 'middle');

    g.append('line').attr('x1', centerX + 40).attr('y1', centerY - 80 + vH).attr('x2', centerX + 50).attr('y2', centerY - 80 + vH).attr('stroke', COLORS.oil);
    g.append('line').attr('x1', centerX + 50).attr('y1', centerY - 80 + vH).attr('x2', centerX + 50).attr('y2', centerY - 80 + vH + oH).attr('stroke', COLORS.oil);
    g.append('line').attr('x1', centerX + 50).attr('y1', centerY - 80 + vH + oH).attr('x2', centerX + 40).attr('y2', centerY - 80 + vH + oH).attr('stroke', COLORS.oil);
    g.append('text').attr('x', centerX + 55).attr('y', centerY - 80 + vH + oH / 2).text('Oil (Unknown)').attr('fill', COLORS.oil).attr('font-size', '10px').attr('alignment-baseline', 'middle');

    if (stepId === 'step7') {
      g.append('text').attr('x', centerX).attr('y', centerY + 120).text('Linearizing: P(V + O) = P(V) + L(O) = T').attr('fill', COLORS.highlight).attr('text-anchor', 'middle');
    }
    return;
  }



  if (stepId === 'step8' || stepId === 'step9' || stepId === 'step10') {
    const isSolved = true;


    const mat = drawMatrix(g, centerX - (PARAMS.k * CELL_SIZE) / 2, centerY - (PARAMS.n * CELL_SIZE) / 2, PARAMS.n, PARAMS.k, "Signature S", "mixed", {
      fillOil: stepId !== 'step8',
      showDims: true
    });


    if (stepId === 'step8') {

      const oilStartRow = PARAMS.n - PARAMS.o;
      const oilCells = mat.group.selectAll('rect').filter((d: any, i: number) => {
        const r = Math.floor(i / PARAMS.k);
        return r >= oilStartRow;
      });

      oilCells.transition()
        .delay((d: any, i: number) => i * 100)
        .duration(500)
        .attr('fill', COLORS.oil)
        .attr('stroke', 'none');

      g.append('text').attr('x', centerX).attr('y', centerY + 120).text('Solving Linear System Ax=b...').attr('fill', COLORS.oil).attr('text-anchor', 'middle');
    }


    if (stepId === 'step9') {
      g.append('text').attr('x', centerX).attr('y', centerY + 120).text('Combined S = Vinegar + Oil').attr('fill', '#fff').attr('text-anchor', 'middle');

      g.append('rect')
        .attr('x', centerX - (PARAMS.k * CELL_SIZE) / 2 - 5)
        .attr('y', centerY - (PARAMS.n * CELL_SIZE) / 2 - 5)
        .attr('width', mat.width + 10).attr('height', mat.height + 10)
        .attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2).attr('rx', 5)
        .attr('opacity', 0)
        .transition().duration(500).attr('opacity', 1);
    }


    if (stepId === 'step10') {

      mat.group.attr('opacity', 0.2);


      const dataW = 200;
      const dataH = 20;
      const dy = centerY + 120;

      g.append('rect')
        .attr('x', centerX - dataW / 2).attr('y', dy)
        .attr('width', dataW).attr('height', dataH)
        .attr('fill', '#334155').attr('rx', 4);


      for (let i = 0; i < 20; i++) {
        g.append('rect')
          .attr('x', centerX - dataW / 2 + i * 10 + 1).attr('y', dy + 2)
          .attr('width', 8).attr('height', 16)
          .attr('fill', i % 2 === 0 ? COLORS.vinegar : COLORS.oil);
      }


      const matrixBottomY = centerY + (PARAMS.n * (CELL_SIZE + GAP)) / 2;
      drawArrow(g, centerX, matrixBottomY + 20, centerX, dy - 5);
      g.append('text').attr('x', centerX).attr('y', dy + 40).text('Serialized Signature σ').attr('fill', '#fff').attr('text-anchor', 'middle');
    }
  }
};

const renderVerify = (stepId: string) => {
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  const g = svg.append('g');


  const startX = centerX - 220;
  const boxY = centerY - 80;


  const sMat = drawMatrix(g, startX, boxY, PARAMS.n, PARAMS.k, "S", "mixed", { fillOil: true });


  const mapX = startX + sMat.width + 50;
  const mapW = 80;
  const mapH = 80;
  const mapY = boxY + (sMat.height - mapH) / 2;


  const resX = mapX + mapW + 50;


  const targetX = resX;
  const targetY = boxY + sMat.height + 50;



  g.append('rect')
    .attr('x', mapX).attr('y', mapY)
    .attr('width', mapW).attr('height', mapH)
    .attr('fill', '#1e293b').attr('stroke', COLORS.public).attr('stroke-width', 2).attr('rx', 8);
  g.append('text').attr('x', mapX + mapW / 2).attr('y', mapY + mapH / 2).text('Map P').attr('fill', COLORS.public).attr('text-anchor', 'middle').attr('font-weight', 'bold').attr('alignment-baseline', 'middle');


  const arrow1 = drawArrow(g, startX + sMat.width + 5, mapY + mapH / 2, mapX - 5, mapY + mapH / 2, "", stepId === 'step13');
  const arrow2 = drawArrow(g, mapX + mapW + 5, mapY + mapH / 2, resX - 5, mapY + mapH / 2, "", stepId === 'step13');


  if (stepId === 'step11') {

    g.append('text').attr('x', startX + sMat.width / 2).attr('y', boxY - 30).text('Parse Signature').attr('fill', COLORS.text).attr('text-anchor', 'middle');
    sMat.group.selectAll('rect').attr('stroke', '#fff');
  }

  if (stepId === 'step12' || stepId === 'step13' || stepId === 'step14') {

    drawMatrix(g, targetX, targetY, PARAMS.m, PARAMS.k, "Target T (Hash)", "target");



  }

  if (stepId === 'step13') {

    g.append('circle').attr('cx', startX + sMat.width + 5).attr('cy', mapY + mapH / 2).attr('r', 4).attr('fill', COLORS.vinegar)
      .transition().duration(1000).attr('cx', mapX + mapW / 2);

    g.append('text').attr('x', centerX).attr('y', centerY - 100).text('Computing T\' = P(S)...').attr('fill', COLORS.highlight).attr('text-anchor', 'middle');
  }

  if (stepId === 'step13' || stepId === 'step14') {

    const tPrimeY = mapY + (mapH - (PARAMS.m * (CELL_SIZE + GAP))) / 2;
    drawMatrix(g, resX, tPrimeY, PARAMS.m, PARAMS.k, "Computed T'", "vinegar");
  }

  if (stepId === 'step14') {

    const tPrimeBottom = mapY + (mapH - (PARAMS.m * (CELL_SIZE + GAP))) / 2 + (PARAMS.m * (CELL_SIZE + GAP));
    const connectorStartY = tPrimeBottom + 20;
    const connectorEndY = targetY - 20;

    g.append('line')
      .attr('x1', resX + (PARAMS.k * (CELL_SIZE + GAP)) / 2)
      .attr('y1', connectorStartY-20)
      .attr('x2', targetX + (PARAMS.k * (CELL_SIZE + GAP)) / 2)
      .attr('y2', connectorEndY)
      .attr('stroke', '#fff')
      .attr('stroke-dasharray', '4');


    const equalsY = connectorStartY + 25;
    g.append('circle')
      .attr('cx', resX + (PARAMS.k * (CELL_SIZE + GAP)) / 2)
      .attr('cy', equalsY - 10)
      .attr('r', 15)
      .attr('fill', '#10b981');

    g.append('text')
      .attr('x', resX + (PARAMS.k * (CELL_SIZE + GAP)) / 2)
      .attr('y', equalsY - 5)
      .text('=')
      .attr('fill', '#fff')
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle');

    g.append('text').attr('x', resX + 100).attr('y', centerY + 120).text('Valid!').attr('fill', '#10b981').attr('font-weight', 'bold').attr('font-size', '16px');
  }
};
const drawScene = () => {
  initSvg();
  if (!svg) return;

  const { step } = props;
  const phase = step.phase;


  if (phase === 'KeyGen') {
    renderKeyGen(step.id);
  } else if (phase === 'Sign') {
    renderSign(step.id);
  } else if (phase === 'Verify') {
    renderVerify(step.id);
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
    <div
      class="absolute bottom-4 left-4 flex flex-col gap-2 text-[10px] text-slate-400 bg-slate-950/80 p-2 rounded pointer-events-none backdrop-blur-sm z-10">
      <div class="flex items-center gap-2"><span class="w-2 h-2 bg-[#3b82f6] rounded-full"></span>Vinegar (Random)</div>
      <div class="flex items-center gap-2"><span class="w-2 h-2 bg-[#ec4899] rounded-full"></span>Oil (Unknown)</div>
      <div class="flex items-center gap-2"><span class="w-2 h-2 bg-[#ef4444] rounded-full"></span>Secret Space O</div>
      <div class="flex items-center gap-2"><span class="w-2 h-2 bg-[#10b981] rounded-full"></span>Public Key</div>
    </div>
  </div>
</template>

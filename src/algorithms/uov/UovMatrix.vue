{
type: created file
fileName: UovMatrix.vue
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

const V_COUNT = 6;
const O_COUNT = 4;
const N_COUNT = V_COUNT + O_COUNT;
const CELL_SIZE = 26;
const GAP = 2;

const REAL_DATA = {
    pk_size: "402 KB",
    sig_size: "96 Bytes",
    sk_size: "340 KB"
};

const COLORS = {
  vinegar: '#3b82f6',
  oil: '#ec4899',
  mixed: '#8b5cf6',
  zero: '#0f172a',
  public: '#10b981',
  text: '#cbd5e1',
  highlight: '#eab308',
  vector: '#f97316'
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

const drawVector = (g: any, x: number, y: number, size: number, label: string, color: string = COLORS.vector) => {
    const group = g.append('g').attr('transform', `translate(${x}, ${y})`);

    group.append('text').attr('x', CELL_SIZE/2).attr('y', -10)
        .text(label).attr('fill', color).attr('font-size', '12px').attr('text-anchor', 'middle');

    for(let i=0; i<size; i++) {
        group.append('rect')
            .attr('x', 0).attr('y', i * (CELL_SIZE + GAP))
            .attr('width', CELL_SIZE).attr('height', CELL_SIZE)
            .attr('fill', color).attr('rx', 3)
            .attr('stroke', '#334155').attr('stroke-width', 1);
    }
    return { width: CELL_SIZE, height: size * (CELL_SIZE + GAP) };
};

const drawMatrixBlock = (g: any, startX: number, startY: number, mode: 'secret' | 'linear' | 'public' | 'transform') => {
    const matrixW = N_COUNT * (CELL_SIZE + GAP);
    const matrixH = N_COUNT * (CELL_SIZE + GAP);
    const group = g.append('g').attr('transform', `translate(${startX}, ${startY})`);


    let title = "";
    if (mode === 'secret') title = "Central Map F (Structure)";
    else if (mode === 'transform') title = "Transformation T (Mixing)";
    else if (mode === 'public') title = "Public Key P (Random)";

    if (title) {
        group.append('text').attr('x', matrixW/2).attr('y', -25)
            .text(title).attr('fill', '#fff').attr('font-weight', 'bold').attr('text-anchor', 'middle');
    }


    for (let i = 0; i < N_COUNT; i++) {
        for (let j = 0; j < N_COUNT; j++) {
            const x = j * (CELL_SIZE + GAP);
            const y = i * (CELL_SIZE + GAP);

            let color = COLORS.zero;
            let opacity = 1;
            let stroke = 'none';

            const isRowV = i < V_COUNT;
            const isColV = j < V_COUNT;

            if (mode === 'public' || mode === 'transform') {

                color = mode === 'public' ? COLORS.public : '#6366f1';
                opacity = 0.6 + Math.random() * 0.4;
            } else {

                if (isRowV && isColV) {
                    color = COLORS.vinegar;
                    if (mode === 'linear') opacity = 0.2;
                } else if (!isRowV && !isColV) {
                    color = COLORS.zero;
                    stroke = '#334155';
                } else {
                    color = COLORS.mixed;
                }
            }

            group.append('rect')
                .attr('x', x).attr('y', y)
                .attr('width', CELL_SIZE).attr('height', CELL_SIZE)
                .attr('fill', color).attr('opacity', opacity)
                .attr('stroke', stroke).attr('rx', 3);
        }
    }


    if (mode === 'secret' || mode === 'linear') {
        const oStartX = V_COUNT * (CELL_SIZE + GAP);
        const oStartY = V_COUNT * (CELL_SIZE + GAP);
        const oW = O_COUNT * (CELL_SIZE + GAP) - GAP;
        const oH = O_COUNT * (CELL_SIZE + GAP) - GAP;

        group.append('rect')
            .attr('x', oStartX - 2).attr('y', oStartY - 2)
            .attr('width', oW + 4).attr('height', oH + 4)
            .attr('fill', 'none').attr('stroke', COLORS.highlight)
            .attr('stroke-width', 2).attr('stroke-dasharray', '4');

        if (mode === 'secret') {
            group.append('text').attr('x', oStartX + oW/2).attr('y', oStartY + oH/2)
                .text('0').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
        }
    }
    return { width: matrixW, height: matrixH };
};

const drawArrow = (g: any, x1: number, y1: number, x2: number, y2: number, label: string = "") => {
    const lg = g.append('g');
    lg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#94a3b8').attr('stroke-width', 2).attr('marker-end', 'url(#arrow)');
    if (label) {
        lg.append('text').attr('x', (x1+x2)/2).attr('y', (y1+y2)/2 - 5)
            .text(label).attr('fill', '#94a3b8').attr('font-size', '10px').attr('text-anchor', 'middle');
    }
};

const drawScene = () => {
  initSvg();
  if (!svg) return;

  const { step, width, height } = props;
  const g = svg.append('g');
  const cx = width / 2;
  const cy = height / 2;
  const matrixSize = N_COUNT * (CELL_SIZE + GAP);


  if (step.phase === 'KeyGen') {
      if (step.id === 'step1') {
          drawMatrixBlock(g, (width - matrixSize)/2, (height - matrixSize)/2 + 20, 'secret');
          g.append('text').attr('x', cx).attr('y', height - 30).text('Trapdoor: No Oil x Oil terms').attr('fill', COLORS.highlight).attr('text-anchor', 'middle');
      }
      else if (step.id === 'step2') {
          drawMatrixBlock(g, (width - matrixSize)/2, (height - matrixSize)/2 + 20, 'transform');
          g.append('text').attr('x', cx).attr('y', height - 30).text('Affine Map T: Mixes Oil & Vinegar').attr('fill', '#6366f1').attr('text-anchor', 'middle');
      }
      else if (step.id === 'step3') {
          drawMatrixBlock(g, (width - matrixSize)/2, (height - matrixSize)/2 + 20, 'public');
          g.append('text').attr('x', cx).attr('y', height - 30).text(`Public Key (${REAL_DATA.pk_size}): Random Structure`).attr('fill', COLORS.public).attr('text-anchor', 'middle');
      }
  }


  else if (step.phase === 'Sign') {
      if (step.id === 'step4') {
          const boxW = 80, boxH = 40;
          g.append('rect').attr('x', cx - 150).attr('y', cy - boxH/2).attr('width', boxW).attr('height', boxH).attr('fill', '#334155').attr('rx', 4);
          g.append('text').attr('x', cx - 110).attr('y', cy).text('Message').attr('fill', '#fff').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

          drawArrow(g, cx - 70, cy, cx - 20, cy, 'Hash');

          drawVector(g, cx, cy - (O_COUNT*(CELL_SIZE+GAP))/2, O_COUNT, 'y (Target)');
      }
      else if (step.id === 'step5') {
          g.append('text').attr('x', cx).attr('y', cy - 80).text('Target y must match F(s\')').attr('fill', '#fff').attr('text-anchor', 'middle');
          const vY = cy - (O_COUNT*(CELL_SIZE+GAP))/2;
          drawVector(g, cx + 60, vY, O_COUNT, 'y', COLORS.vector);

          g.append('text').attr('x', cx).attr('y', cy).text('=').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle');


          g.append('rect').attr('x', cx - 80).attr('y', cy - 30).attr('width', 60).attr('height', 60).attr('fill', '#1e293b').attr('stroke', COLORS.vinegar);
          g.append('text').attr('x', cx - 50).attr('y', cy).text('F(s\')').attr('fill', COLORS.vinegar).attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
      }
      else if (step.id === 'step6') {
          const startX = (width - matrixSize)/2;
          const startY = (height - matrixSize)/2 + 20;

          drawMatrixBlock(g, startX, startY, 'linear');

          g.append('text').attr('x', cx).attr('y', startY - 30).text('Solve Linear System A⋅o = b').attr('fill', '#fff').attr('font-weight', 'bold').attr('text-anchor', 'middle');


          g.append('text').attr('x', startX - 120).attr('y', cy).text('Vinegar Fixed').attr('fill', COLORS.vinegar).attr('font-size', '10px');
          drawArrow(g, startX - 40, cy, startX, cy);

          g.append('text').attr('x', startX + matrixSize + 20).attr('y', cy).text('Solve for Oil').attr('fill', COLORS.oil).attr('font-size', '10px');
      }
      else if (step.id === 'step7') {
          g.append('text').attr('x', cx).attr('y', cy - 100).text('Transform Internal Solution').attr('fill', '#fff').attr('text-anchor', 'middle');

          const startX = cx - 180;
          const vecH = N_COUNT * (CELL_SIZE + GAP);
          const matSize = 120;


          drawVector(g, startX, cy - vecH/2, N_COUNT, 's\' (Internal)', COLORS.mixed);


          drawArrow(g, startX + 40, cy, startX + 80, cy);
          g.append('rect').attr('x', startX + 90).attr('y', cy - matSize/2).attr('width', matSize).attr('height', matSize).attr('fill', '#6366f1').attr('opacity', 0.5);
          g.append('text').attr('x', startX + 90 + matSize/2).attr('y', cy).text('T⁻¹').attr('fill', '#fff').attr('font-size', '20px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');


          drawArrow(g, startX + 90 + matSize + 10, cy, startX + 90 + matSize + 50, cy);
          drawVector(g, startX + 90 + matSize + 60, cy - vecH/2, N_COUNT, 's (Signature)', COLORS.public);

          g.append('text').attr('x', cx).attr('y', height - 20).text(`Final Signature size: ${REAL_DATA.sig_size}`).attr('fill', '#94a3b8').attr('text-anchor', 'middle').attr('font-size', '10px');
      }
  }


  else if (step.phase === 'Verify') {
      if (step.id === 'step8') {
          g.append('text').attr('x', cx).attr('y', cy - 120).text('Evaluate Public Map').attr('fill', '#fff').attr('text-anchor', 'middle');

          const startX = cx - 150;
          const vecH = N_COUNT * (CELL_SIZE + GAP);


          g.append('rect').attr('x', startX).attr('y', cy - 60).attr('width', 120).attr('height', 120).attr('fill', COLORS.public).attr('opacity', 0.8);
          g.append('text').attr('x', startX + 60).attr('y', cy).text('P').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

          g.append('text').attr('x', startX + 140).attr('y', cy).text('( s )  =').attr('fill', '#fff').attr('font-size', '18px').attr('alignment-baseline', 'middle');


          drawVector(g, startX + 200, cy - (O_COUNT*(CELL_SIZE+GAP))/2, O_COUNT, "y' (Computed)");
      }
      else if (step.id === 'step9') {
          const vH = O_COUNT * (CELL_SIZE + GAP);
          const y1 = cy - vH/2;

          drawVector(g, cx - 100, y1, O_COUNT, "y' (Computed)", COLORS.public);

          g.append('text').attr('x', cx).attr('y', cy).text('==').attr('fill', '#fff').attr('font-size', '24px').attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');

          drawVector(g, cx + 60, y1, O_COUNT, 'y (Hash)', COLORS.vector);

          g.append('text').attr('x', cx).attr('y', cy + 100).text('Signature Valid').attr('fill', '#10b981').attr('font-weight', 'bold').attr('text-anchor', 'middle');
      }
  }
};

onMounted(() => {
  drawScene();
});

watch(() => props.step, drawScene, { deep: true });
</script>

<template>
  <div ref="containerRef" class="w-full h-full bg-slate-900 relative rounded-xl border border-slate-700/50 shadow-inner overflow-hidden">
      <div class="absolute bottom-4 left-4 bg-slate-950/80 p-2 rounded border border-slate-800 pointer-events-none">
          <div class="flex items-center gap-2 mb-1"><span class="w-3 h-3 bg-[#3b82f6] rounded"></span> Vinegar</div>
          <div class="flex items-center gap-2 mb-1"><span class="w-3 h-3 bg-[#ec4899] rounded"></span> Oil</div>
          <div class="flex items-center gap-2 mb-1"><span class="w-3 h-3 bg-[#0f172a] border border-slate-600 rounded"></span> Zero (Trapdoor)</div>
          <div class="flex items-center gap-2"><span class="w-3 h-3 bg-[#10b981] rounded"></span> Public</div>
      </div>
  </div>
</template>
}

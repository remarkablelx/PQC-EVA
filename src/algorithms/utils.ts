import * as d3 from 'd3'

export function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

export const generateData = (rows: number, cols: number, type: 'uniform'|'noise'|'msg'|'secret', seedOffset: number) => {
    return Array.from({length: rows * cols}, (_, i) => {
        const rand = seededRandom(seedOffset + i)
        if (type === 'noise') return rand
        if (type === 'msg') return rand > 0.5 ? 1 : 0
        return rand
    })
}

export const COLORS = {
    alice: '#ec4899',
    bob: '#3b82f6',
    matrix: '#10b981',
    secret: '#f43f5e',
    text: '#94a3b8',
    cipher: '#06b6d4',
    msg: '#8b5cf6'
}

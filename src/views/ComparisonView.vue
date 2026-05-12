<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import type { EChartsOption, ECharts } from 'echarts'
import type { AlgoStat, AlgoVersion } from '../data/algoStats'
import { radarDimensions } from '../data/algoStats'
import HeaderBar from '../components/HeaderBar.vue'

use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const chartRef = ref<HTMLElement | null>(null)
const selectedAlgos = ref<string[]>(['kyber', 'hqc', 'dilithium'])
const chartInstance = ref<ECharts | null>(null)
const algoTypeFilter = ref<'all' | 'encryption' | 'signature'>('all')

const selectedVersions = ref<Record<string, string>>({
  kyber: 'Kyber768',
  hqc: 'hqc128',
  dilithium: 'Dilithium3',
})

const algoStats = ref<AlgoStat[]>([])
const filteredAlgos = ref<AlgoStat[]>([])

const algoColors: Record<string, string> = {
  kyber: '#3b82f6',
  hqc: '#10b981',
  dilithium: '#f59e0b',
  mayo: '#ef4444',
  sphincs: '#8b5cf6',
  uov: '#ec4899',
  xmss: '#06b6d4',
  falcon: '#84cc16',
  ntru: '#f97316',
}

const formatSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(3)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(3)} MB`
  }
}

const formatTime = (timeUs: number): string => {
  if (timeUs < 1000) {
    return `${timeUs.toFixed(3)} μs`
  } else if (timeUs < 1000 * 1000) {
    return `${(timeUs / 1000).toFixed(3)} ms`
  } else {
    return `${(timeUs / (1000 * 1000)).toFixed(3)} s`
  }
}

const formatValue = (value: number, type: 'size' | 'time'): string => {
  if (type === 'size') {
    return formatSize(value)
  } else {
    return formatTime(value)
  }
}

interface RawVersionData {
  version: string
  keypair: {
    pk_size: string | number
    sk_size: string | number
    sig_size?: string | number
    keypair_time_us: number
  }
  encapsulation?: {
    enc_ct_size: string | number
    enc_time_us: number
    enc_ss_size?: string | number
  }
  decapsulation?: {
    dec_time_us: number
  }
  signature?: {
    sig_time_us: number
    verify_time_us?: number
  }
}

const calculateStats = (algoData: any[], maxValues: any): AlgoVersion[] => {
  return algoData.map(versionData => {
    const parseSize = (size: string | number): number => {
      if (typeof size === 'number') return size
      return parseInt(size.replace(/B/g, '')) || 0
    }

    const logNormalize = (value: number, maxValue: number): number => {
      if (maxValue <= 0) return 0.5
      const logValue = Math.log1p(value)
      const logMax = Math.log1p(maxValue)
      const normalized = 1 - (logValue / logMax)
      return Math.max(0.01, Math.min(0.99, normalized))
    }

    const parseTime = (time: any, unit: string = 'us'): number => {
      if (typeof time !== 'number') return 0

      switch (unit) {
        case 'sec':
          return time * 1e6
        case 'ms':
          return time * 1e3
        case 'cycles':
          return time * 1e-3
        default:
          return time
      }
    }

    const rawPublicKeySize = parseSize(versionData.keypair.pk_size)
    const rawSecretKeySize = parseSize(versionData.keypair.sk_size)

    const rawProductSize = versionData.encapsulation?.enc_ct_size ?
      parseSize(versionData.encapsulation.enc_ct_size) :
      parseSize(versionData.keypair.sig_size || versionData.signature?.sig_size || 0)

    let rawKeyGenTime = 0
    if (versionData.keypair.keypair_time_us !== undefined) {
      rawKeyGenTime = parseTime(versionData.keypair.keypair_time_us, 'us')
    } else if (versionData.keypair.keygen_time_sec !== undefined) {
      rawKeyGenTime = parseTime(versionData.keypair.keygen_time_sec, 'sec')
    } else if (versionData.keypair.keypair_cycles !== undefined) {
      rawKeyGenTime = parseTime(versionData.keypair.keypair_cycles, 'cycles')
    }

    let rawSignEncapTime = 0
    if (versionData.encapsulation?.enc_time_us !== undefined) {
      rawSignEncapTime = parseTime(versionData.encapsulation.enc_time_us, 'us')
    } else if (versionData.signature?.sig_time_us !== undefined) {
      rawSignEncapTime = parseTime(versionData.signature.sig_time_us, 'us')
    } else if (versionData.signature?.sign_time_us !== undefined) {
      rawSignEncapTime = parseTime(versionData.signature.sign_time_us, 'us')
    } else if (versionData.sign?.sign_time_us !== undefined) {
      rawSignEncapTime = parseTime(versionData.sign.sign_time_us, 'us')
    } else if (versionData.sign?.sign_time_sec !== undefined) {
      rawSignEncapTime = parseTime(versionData.sign.sign_time_sec, 'sec')
    } else if (versionData.sign?.sign_cycles !== undefined) {
      rawSignEncapTime = parseTime(versionData.sign.sign_cycles, 'cycles')
    }

    let rawVerifyDecapTime = 0
    if (versionData.decapsulation?.dec_time_us !== undefined) {
      rawVerifyDecapTime = parseTime(versionData.decapsulation.dec_time_us, 'us')
    } else if (versionData.signature?.verify_time_us !== undefined) {
      rawVerifyDecapTime = parseTime(versionData.signature.verify_time_us, 'us')
    } else if (versionData.open?.open_time_us !== undefined) {
      rawVerifyDecapTime = parseTime(versionData.open.open_time_us, 'us')
    } else if (versionData.open?.open_time_sec !== undefined) {
      rawVerifyDecapTime = parseTime(versionData.open.open_time_sec, 'sec')
    } else if (versionData.open?.verify_cycles !== undefined) {
      rawVerifyDecapTime = parseTime(versionData.open.verify_cycles, 'cycles')
    }

    const publicKeySize = logNormalize(rawPublicKeySize, maxValues.publicKeySize)
    const secretKeySize = logNormalize(rawSecretKeySize, maxValues.secretKeySize)
    const productSize = logNormalize(rawProductSize, maxValues.productSize)
    const keyGenSpeed = logNormalize(rawKeyGenTime, maxValues.keyGenTime)
    const signEncapSpeed = logNormalize(rawSignEncapTime, maxValues.signEncapTime)
    const verifyDecapSpeed = logNormalize(rawVerifyDecapTime, maxValues.verifyDecapTime)

    return {
      version: versionData.version,
      stats: {
        publicKeySize,
        secretKeySize,
        productSize,
        signEncapSpeed,
        verifyDecapSpeed,
        keyGenSpeed
      },
      rawData: {
        publicKeySize: rawPublicKeySize,
        secretKeySize: rawSecretKeySize,
        productSize: rawProductSize,
        keyGenTime: rawKeyGenTime / 1000,
        signEncapTime: rawSignEncapTime / 1000,
        verifyDecapTime: rawVerifyDecapTime / 1000
      }
    }
  })
}

const loadRealData = async () => {
    const algoNames = ['kyber', 'hqc', 'dilithium', 'mayo', 'sphincs', 'uov', 'xmss', 'falcon', 'ntru']
    const loadedAlgos: AlgoStat[] = []
    const allRawData: any[] = []

  const parseSize = (size: string | number): number => {
    if (typeof size === 'number') return size
    return parseInt(size.replace(/B/g, '')) || 0
  }

  for (const algoName of algoNames) {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/ui_${algoName}_output.json`)
      const data = await response.json()

      allRawData.push(...data)

      const type = algoName === 'kyber' || algoName === 'hqc' || algoName === 'ntru' ? 'encryption' : 'signature'

      loadedAlgos.push({
        name: algoName,
        fullName: algoName.charAt(0).toUpperCase() + algoName.slice(1),
        type: type as 'encryption' | 'signature',
        defaultVersion: data[1]?.version || data[0]?.version || '',
        versions: []
      })
    } catch (error) {
      console.error(`Failed to load data for ${algoName}:`, error)
    }
  }

  const parseTime = (time: any, unit: string = 'us'): number => {
    if (typeof time !== 'number') return 0

    switch (unit) {
      case 'sec':
        return time * 1e6
      case 'ms':
        return time * 1e3
      case 'cycles':
        return time * 1e-3
      default:
        return time
    }
  }

  const maxValues = {
    publicKeySize: 0,
    secretKeySize: 0,
    productSize: 0,
    keyGenTime: 0,
    signEncapTime: 0,
    verifyDecapTime: 0
  }

  allRawData.forEach(versionData => {
    const pkSize = parseSize(versionData.keypair.pk_size)
    maxValues.publicKeySize = Math.max(maxValues.publicKeySize, pkSize)

    const skSize = parseSize(versionData.keypair.sk_size)
    maxValues.secretKeySize = Math.max(maxValues.secretKeySize, skSize)

    const productSize = versionData.encapsulation?.enc_ct_size ?
      parseSize(versionData.encapsulation.enc_ct_size) :
      parseSize(versionData.keypair.sig_size || versionData.signature?.sig_size || 0)
    maxValues.productSize = Math.max(maxValues.productSize, productSize)

    let keyGenTime = 0
    if (versionData.keypair.keypair_time_us !== undefined) {
      keyGenTime = parseTime(versionData.keypair.keypair_time_us, 'us')
    } else if (versionData.keypair.keygen_time_sec !== undefined) {
      keyGenTime = parseTime(versionData.keypair.keygen_time_sec, 'sec')
    } else if (versionData.keypair.keypair_cycles !== undefined) {
      keyGenTime = parseTime(versionData.keypair.keypair_cycles, 'cycles')
    }
    maxValues.keyGenTime = Math.max(maxValues.keyGenTime, keyGenTime)

    let signEncapTime = 0
    if (versionData.encapsulation?.enc_time_us !== undefined) {
      signEncapTime = parseTime(versionData.encapsulation.enc_time_us, 'us')
    } else if (versionData.signature?.sig_time_us !== undefined) {
      signEncapTime = parseTime(versionData.signature.sig_time_us, 'us')
    } else if (versionData.signature?.sign_time_us !== undefined) {
      signEncapTime = parseTime(versionData.signature.sign_time_us, 'us')
    } else if (versionData.sign?.sign_time_us !== undefined) {
      signEncapTime = parseTime(versionData.sign.sign_time_us, 'us')
    } else if (versionData.sign?.sign_time_sec !== undefined) {
      signEncapTime = parseTime(versionData.sign.sign_time_sec, 'sec')
    } else if (versionData.sign?.sign_cycles !== undefined) {
      signEncapTime = parseTime(versionData.sign.sign_cycles, 'cycles')
    }
    maxValues.signEncapTime = Math.max(maxValues.signEncapTime, signEncapTime)

    let verifyDecapTime = 0
    if (versionData.decapsulation?.dec_time_us !== undefined) {
      verifyDecapTime = parseTime(versionData.decapsulation.dec_time_us, 'us')
    } else if (versionData.signature?.verify_time_us !== undefined) {
      verifyDecapTime = parseTime(versionData.signature.verify_time_us, 'us')
    } else if (versionData.open?.open_time_us !== undefined) {
      verifyDecapTime = parseTime(versionData.open.open_time_us, 'us')
    } else if (versionData.open?.open_time_sec !== undefined) {
      verifyDecapTime = parseTime(versionData.open.open_time_sec, 'sec')
    } else if (versionData.open?.verify_cycles !== undefined) {
      verifyDecapTime = parseTime(versionData.open.verify_cycles, 'cycles')
    }
    maxValues.verifyDecapTime = Math.max(maxValues.verifyDecapTime, verifyDecapTime)
  })

  for (let i = 0; i < loadedAlgos.length; i++) {
    const algo = loadedAlgos[i]
    if (!algo) continue

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/ui_${algo.name}_output.json`)
      const data = await response.json()

      algo.versions = calculateStats(data, maxValues)
    } catch (error) {
      console.error(`Failed to recalculate stats for ${algo.name}:`, error)
    }
  }

  algoStats.value = loadedAlgos
  filteredAlgos.value = loadedAlgos
}

const getSelectedVersion = (algoName: string): AlgoVersion | undefined => {
  const algo = algoStats.value.find(a => a.name === algoName)
  if (!algo) return undefined

  const versionName = selectedVersions.value[algoName] || algo.defaultVersion
  return algo.versions.find(v => v.version === versionName)
}

// Watch for changes in algoStats and algoTypeFilter to update filteredAlgos
const updateFilteredAlgos = () => {
  if (algoTypeFilter.value === 'all') {
    filteredAlgos.value = algoStats.value
  } else {
    filteredAlgos.value = algoStats.value.filter(algo => algo.type === algoTypeFilter.value)
  }
}

// Update filteredAlgos whenever algoStats changes
watch(
  () => algoStats.value,
  () => updateFilteredAlgos(),
  { deep: true }
)

// Update filteredAlgos whenever algoTypeFilter changes
watch(
  () => algoTypeFilter.value,
  () => updateFilteredAlgos()
)

const updateChart = () => {
  if (!chartInstance.value) return

  const selectedData = selectedAlgos.value.map(algoName => {
    const algo = algoStats.value.find(a => a.name === algoName)
    const version = getSelectedVersion(algoName)
    return { algo, version }
  }).filter(({ algo, version }) => algo && version)

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    title: {
      text: 'PQC算法性能对比雷达图',
      left: 'center',
      textStyle: {
        color: '#e2e8f0',
        fontSize: 28
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#475569',
      textStyle: {
        color: '#e2e8f0'
      }
    },
    legend: {
      bottom: 20,
      data: selectedData.map(({ algo, version }) => `${algo!.fullName} (${version!.version})`),
      textStyle: {
        color: '#94a3b8',
        fontSize: 16
      },
      selected: selectedData.reduce((acc, { algo, version }) => {
        acc[`${algo!.fullName} (${version!.version})`] = true
        return acc
      }, {} as Record<string, boolean>)
    },
    radar: {
      indicator: radarDimensions,
      radius: '70%',
      splitNumber: 5,
      axisName: {
        color: '#cbd5e1',
        fontSize: 16
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(71, 85, 105, 0.5)'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.5)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#475569'
        }
      }
    },
    series: [
      {
        name: '算法性能对比',
        type: 'radar',
        data: selectedData.map(({ algo, version }) => ({
          value: [
            version!.stats.publicKeySize,
            version!.stats.secretKeySize,
            version!.stats.productSize,
            version!.stats.signEncapSpeed,
            version!.stats.verifyDecapSpeed,
            version!.stats.keyGenSpeed
          ],
          name: `${algo!.fullName} (${version!.version})`,
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: algoColors[algo!.name]
          },
          areaStyle: {
            opacity: 0.3,
            color: algoColors[algo!.name]
          },
          itemStyle: {
            color: algoColors[algo!.name]
          }
        }))
      }
    ]
  }

  chartInstance.value.setOption(option)
}

const initChart = async () => {
  if (!chartRef.value) return

  if (algoStats.value.length === 0) {
    await loadRealData()
  }

  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  const echarts = await import('echarts')
  chartInstance.value = echarts.init(chartRef.value)

  updateChart()
}

const toggleAlgo = (algoName: string) => {
  const index = selectedAlgos.value.indexOf(algoName)
  if (index > -1) {

    if (selectedAlgos.value.length > 1) {
      selectedAlgos.value.splice(index, 1)

    }
  } else {
    selectedAlgos.value.push(algoName)

    const algo = algoStats.value.find(a => a.name === algoName)
    if (algo && !selectedVersions.value[algoName]) {
      selectedVersions.value[algoName] = algo.defaultVersion
    }
  }
  updateChart()
}

const changeVersion = (algoName: string, version: string) => {
  selectedVersions.value[algoName] = version
  updateChart()
}

const handleResize = () => {
  chartInstance.value?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-200 font-sans">
    <HeaderBar />
    <main class="flex-1 flex flex-col overflow-hidden p-4">
      <div class="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div
          class="flex-1 min-w-0 bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 overflow-hidden flex flex-col">
          <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 class="text-3xl font-semibold text-white">性能对比雷达图</h2>
            <div class="text-lg text-slate-400">
              已选择 {{ selectedAlgos.length }} 个算法
            </div>
          </div>
          <div ref="chartRef" class="flex-1 w-full min-h-[400px]"></div>
        </div>
        <div
          class="w-full lg:w-[580px] flex-shrink-0 bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-800 overflow-y-auto">
          <div class="flex flex-col gap-4 mb-4">
            <div class="flex items-center justify-between">
              <h2 class="text-3xl font-semibold text-white">算法选择</h2>
              <div class="text-lg text-slate-400">
                点击卡片选择/取消选择
              </div>
            </div>
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-semibold text-white">算法类型筛选</h3>
              <div class="flex gap-2 bg-slate-800 p-1 rounded-lg">
                <button 
                  @click="algoTypeFilter = 'all'" 
                  :class="[
                    'px-4 py-2 rounded-md text-sm transition-all',
                    algoTypeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'
                  ]"
                >
                  全部
                </button>
                <button 
                  @click="algoTypeFilter = 'encryption'" 
                  :class="[
                    'px-4 py-2 rounded-md text-sm transition-all',
                    algoTypeFilter === 'encryption' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'
                  ]"
                >
                  加密算法
                </button>
                <button 
                  @click="algoTypeFilter = 'signature'" 
                  :class="[
                    'px-4 py-2 rounded-md text-sm transition-all',
                    algoTypeFilter === 'signature' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'
                  ]"
                >
                  签名算法
                </button>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div v-for="algo in filteredAlgos" :key="algo.name"
              class="bg-slate-800 rounded-lg p-5 border-2 transition-all duration-300 hover:shadow-md" :class="{
                'border-blue-500 bg-slate-800/80 shadow-blue-900/20': selectedAlgos.includes(algo.name),
                'border-slate-700 hover:border-slate-600': !selectedAlgos.includes(algo.name)
              }" @click="toggleAlgo(algo.name)">
              <div class="flex flex-col mb-4">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="font-semibold text-white text-2xl">{{ algo.fullName }}</h3>
                    <p class="text-base text-slate-400 mt-1">
                      {{ algo.type === 'encryption' ? '密钥交换算法' : '数字签名算法' }}
                    </p>
                  </div>
                  <div @click.stop class="min-w-[120px]">
                    <select :value="selectedVersions[algo.name] || algo.defaultVersion"
                      @change="changeVersion(algo.name, ($event.target as HTMLSelectElement).value)"
                      class="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option v-for="version in algo.versions" :key="version.version" :value="version.version">
                        {{ version.version }}
                      </option>
                    </select>
                  </div>
                </div>
                <div v-if="getSelectedVersion(algo.name)"
                  class="flex items-center justify-between bg-slate-700/30 rounded-md px-3 py-2 text-lg">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-400">密钥生成速度:</span>
                    <span class="font-medium text-blue-400">
                      {{ formatTime(getSelectedVersion(algo.name)!.rawData.keyGenTime) }}
                    </span>
                  </div>
                  <div class="w-px h-3 bg-slate-600 mx-2"></div>
                  <div class="flex items-center gap-2">
                    <span class="text-slate-400">签名/封装速度:</span>
                    <span class="text-slate-300">
                      {{ formatTime(getSelectedVersion(algo.name)!.rawData.signEncapTime) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="getSelectedVersion(algo.name)" class="overflow-x-auto">
                <div class="flex gap-2 min-w-max">
                  <div class="bg-slate-700/50 p-2 rounded-lg flex flex-col items-center text-base w-32">
                    <div class="text-slate-400 text-base mb-2">公钥尺寸</div>
                    <div class="text-white font-mono text-lg">{{
                      formatSize(getSelectedVersion(algo.name)!.rawData.publicKeySize) }}</div>
                  </div>
                  <div class="bg-slate-700/50 p-2 rounded-lg flex flex-col items-center text-base w-32">
                    <div class="text-slate-400 text-base mb-2">私钥尺寸</div>
                    <div class="text-white font-mono text-lg">{{
                      formatSize(getSelectedVersion(algo.name)!.rawData.secretKeySize) }}</div>
                  </div>
                  <div class="bg-slate-700/50 p-2 rounded-lg flex flex-col items-center text-base w-32">
                    <div class="text-slate-400 text-base mb-2">产物尺寸</div>
                    <div class="text-white font-mono text-lg">{{
                      formatSize(getSelectedVersion(algo.name)!.rawData.productSize)
                      }}</div>
                  </div>
                  <div class="bg-slate-700/50 p-2 rounded-lg flex flex-col items-center text-base w-32">
                    <div class="text-slate-400 text-base mb-2">密钥生成速度</div>
                    <div class="text-white font-mono text-lg">
                      {{ formatTime(getSelectedVersion(algo.name)!.rawData.keyGenTime * 1000) }}
                    </div>
                  </div>
                  <div class="bg-slate-700/50 p-2 rounded-lg flex flex-col items-center text-base w-32">
                    <div class="text-slate-400 text-base mb-2">签名/封装速度</div>
                    <div class="text-white font-mono text-lg">
                      {{ formatTime(getSelectedVersion(algo.name)!.rawData.signEncapTime * 1000) }}
                    </div>
                  </div>
                  <div class="bg-slate-700/50 p-2 rounded-lg flex flex-col items-center text-base w-32">
                    <div class="text-slate-400 text-base mb-2">验证/解封速度</div>
                    <div class="text-white font-mono text-lg">
                      {{ formatTime(getSelectedVersion(algo.name)!.rawData.verifyDecapTime * 1000) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <div class="text-base text-slate-500">
                  {{ selectedAlgos.includes(algo.name) ? '已选择 - 显示在雷达图中' : '未选择 - 点击选择' }}
                </div>
                <div class="w-5 h-5 rounded-full flex items-center justify-center" :class="{
                  'bg-blue-500 text-white': selectedAlgos.includes(algo.name),
                  'bg-slate-700 text-slate-400': !selectedAlgos.includes(algo.name)
                }">
                  {{ selectedAlgos.includes(algo.name) ? '✓' : '○' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

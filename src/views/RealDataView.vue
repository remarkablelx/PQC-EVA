<template>
  <div class="min-h-screen bg-slate-900 text-white">
    <!-- 顶部导航栏 -->
    <HeaderBar />

    <!-- 主要内容区域 -->
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-center mb-4 text-blue-400">真实数据流</h1>
        <p class="text-center text-slate-400 max-w-3xl mx-auto">
          展示PQC算法处理"hello, world"消息的完整流程，包括中间矩阵、向量变换过程和安全性分析
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-slate-400">加载数据中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-20">
        <div class="inline-block p-4 bg-red-900/30 rounded-full mb-4">
          <i class="fa-solid fa-exclamation-triangle text-red-400 text-2xl"></i>
        </div>
        <p class="text-red-400 mb-2">{{ error }}</p>
        <button @click="loadData" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
          重试
        </button>
      </div>

      <!-- 数据内容 -->
      <div v-else-if="data" class="space-y-8">
        <!-- 算法信息 -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h2 class="text-xl font-bold mb-4 text-green-400">
            {{ selectedAlgorithm.toUpperCase() }} 算法信息
          </h2>

          <!-- 算法简介 -->
          <div class="mb-6 bg-slate-700/50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-3 text-slate-300">算法简介</h3>
            <p class="text-slate-300 leading-relaxed">
              <span v-if="selectedAlgorithm === 'kyber'">
                <strong class="text-blue-400">CRYSTALS-Kyber</strong>是一种基于格理论中“带误差学习问题”（LWE）的后量子<strong
                  class="text-blue-400">密钥封装机制（KEM）</strong>。该算法由美国国家标准与技术研究院（NIST）通过公开竞赛选定，作为公钥加密组的优胜方案，是唯一被标准化为FIPS
                203的KEM算法。它被设计用于在量子计算机威胁下提供安全的密钥交换，具有高效的加密与解密速度。
              </span>
              <span v-else-if="selectedAlgorithm === 'hqc'">
                <strong class="text-blue-400">HQC（Hamming Quasi-Cyclic）</strong>是一种基于编码的后量子<strong
                  class="text-blue-400">密钥封装机制（KEM）</strong>，在后量子密码学中具有重要地位。它由[MAB+22]团队设计，具有一些理想的性质，如基于结构化码的校验子译码问题，可以证明其IND-CPA安全性。
              </span>
              <span v-else-if="selectedAlgorithm === 'dilithium'">
                <strong class="text-blue-400">CRYSTALS-Dilithium</strong>是一种基于格密码学的后量子<strong
                  class="text-blue-400">数字签名算法</strong>。其安全性依赖于模块格上的困难问题，并采用“带有中止的Fiat-Shamir”方法构建。它由NIST通过公开竞赛选定，是后量子密码学标准化项目的最终候选算法之一，提供抗量子计算攻击的数字签名功能。
              </span>
              <span v-else-if="selectedAlgorithm === 'falcon'">
                <strong class="text-blue-400">Falcon</strong>签名方案是一种由NIST标准化的后量子<strong
                  class="text-blue-400">数字签名方案</strong>，基于格理论构造以抵御量子计算攻击。该方案的关键步骤为快速傅里叶采样算法，其实现通常涉及Falcon树结构，改进算法可降低在线签名阶段的时间复杂度；Falcon签名通过高斯采样生成短向量私钥，可生成紧凑且快速的签名，满足NIST安全级别3，并应用于后量子区块链等场景。
              </span>
              <span v-else-if="selectedAlgorithm === 'mayo'">
                <strong class="text-blue-400">MAYO</strong>是一种基于多变量二次方程（MQ问题）的后量子<strong
                  class="text-blue-400">数字签名算法</strong>，采用Oil-Vinegar签名机制变体，具有小签名尺寸和快速验证的优势。它通过利用多变量多项式方程组的求解难题，提供了一种抗量子计算攻击的高效签名方案。
              </span>
              <span v-else-if="selectedAlgorithm === 'sphincs'">
                <strong class="text-blue-400">SPHINCS+（SLH-DSA）</strong>是一种无状态哈希基<strong
                  class="text-blue-400">数字签名算法</strong>，属于后量子密码学（PQC）标准之一，已被NIST收录为FIPS
                205。它由Bernstein等人在2015年提出，并在2019年更新，旨在抵御量子计算攻击，提供长期的抗量子安全性。
              </span>
              <span v-else-if="selectedAlgorithm === 'uov'">
                <strong class="text-blue-400">UOV（Unbalanced Oil and Vinegar）</strong>算法是一种基于多变量多项式的<strong
                  class="text-blue-400">签名方案</strong>，属于后量子密码学的一部分。它通过利用多变量多项式方程组的求解难题，提供了一种抗量子计算攻击的高效签名方案，由1997年提出，是NIST后量子密码学标准化项目的候选算法。
              </span>
              <span v-else-if="selectedAlgorithm === 'xmss'">
                <strong class="text-blue-400">XMSS（eXtended Merkle Signature Scheme）</strong>是一种基于哈希函数的有状态后量子<strong
                  class="text-blue-400">数字签名方案</strong>，已被IETF RFC 8391和NIST SP
                800-208标准化。它结合Merkle树与改进型WOTS+一次性签名，在保持高安全性的同时，具备抗量子计算攻击能力，被广泛应用于各种安全场景。
              </span>
              <span v-else-if="selectedAlgorithm === 'ntru'">
                <strong class="text-blue-400">NTRU（Number Theory Research Unit）</strong>算法是一种基于格理论的后量子<strong
                  class="text-blue-400">密钥封装机制（KEM）</strong>，由美国布朗大学的三位数学教授于1996年提出。作为典型的后量子密钥封装方案，它凭借高效的加密与解密速度，以及对量子计算攻击的良好抗性，成为现代密码学领域的研究热点，在密钥封装场景中具有显著应用价值。
              </span>
              <span v-else>
                {{ selectedAlgorithm }}是一种抗量子<strong
                  class="text-blue-400">密码算法</strong>，设计用于在量子计算机威胁下提供安全的密码服务，包括密钥交换、数字签名等功能。
              </span>
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">版本</h3>
              <div class="relative">
                <select v-model="selectedVersion" @change="selectedVersion && changeVersion(selectedVersion)"
                  class="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option v-for="version in allVersions" :key="version.version" :value="version.version">
                    {{ version.version }}
                  </option>
                </select>
              </div>
            </div>
            <div v-if="data.keypair" class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">公钥大小</h3>
              <p class="font-mono text-white">{{ data.keypair.pk_size }}</p>
            </div>
            <div v-if="data.keypair" class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">私钥大小</h3>
              <p class="font-mono text-white">{{ data.keypair.sk_size }}</p>
            </div>
          </div>

          <!-- 性能指标 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div v-if="data?.keypair" class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">密钥生成时间</h3>
              <p class="font-mono text-white">{{ data.keypair.keypair_time_us ||
                data.keypair.keygen_time_sec }} {{ data.keypair.keypair_time_us ? 'μs' : 'sec' }}</p>
            </div>
            <div v-if="data?.encapsulation" class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">封装时间</h3>
              <p class="font-mono text-white">{{ data.encapsulation.enc_time_us }} μs</p>
            </div>
            <div v-if="data?.sign" class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">签名时间</h3>
              <p class="font-mono text-white">{{ data.sign.sign_time_us || data.sign.sign_time_sec }} {{
                data.sign.sign_time_us ? 'μs' : 'sec' }}</p>
            </div>
            <div v-if="data?.encapsulation" class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">密文大小</h3>
              <p class="font-mono text-white">{{ data.encapsulation.enc_ct_size }}</p>
            </div>
            <div v-if="data?.sign" class="bg-slate-700/50 p-4 rounded-lg">
              <h3 class="text-sm text-slate-400 mb-2">签名长度</h3>
              <p class="font-mono text-white">{{ data.sign.sign_smlen }} bytes</p>
            </div>
          </div>
        </div>

        <!-- 全局控制区 -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <!-- 颜色图例 -->
          <div class="bg-slate-700/50 p-3 rounded-lg">
            <h3 class="text-sm font-semibold text-slate-300 mb-2">颜色说明</h3>
            <div class="flex flex-wrap gap-3 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-rose-500 rounded-full"></div>
                <span class="text-slate-300"> Secret - 私钥、敏感变量</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-slate-300"> Public - 公钥、密文</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-slate-300"> Random - 随机数、noise</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span class="text-slate-300"> Structure - 矩阵、树结构</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-slate-300"> Message - 明文、共享密钥、结果</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span class="text-slate-300"> Meta - 统计数据、元数据</span>
              </div>
            </div>
          </div>

          <!-- 全局展开/折叠控制 -->
          <div class="flex gap-2">
            <button @click="expandAll"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
              <i class="fa-solid fa-expand mr-1"></i> 全部展开
            </button>
            <button @click="collapseAll"
              class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors">
              <i class="fa-solid fa-compress mr-1"></i> 全部折叠
            </button>
          </div>
        </div>

        <!-- 三列布局：密钥生成、加密/签名、解密/验证过程 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 左侧列：密钥生成过程 (keypair) -->
          <div v-if="data.keypair" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 class="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
              <i class="fa-solid fa-key"></i>
              密钥生成
            </h2>

            <!-- 密钥对手风琴卡片 -->
            <div class="space-y-2">
              <div v-for="(value, key) in data.keypair" :key="key"
                class="group relative bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-700/70 transition-colors">
                <!-- 卡片标题栏（折叠态） -->
                  <div @click="toggleCard(`keypair_${key}`)" class="flex items-center p-3" :title="getKeyDescription(key, selectedAlgorithm)">
                    <!-- 语义彩点 -->
                    <div :class="getSemanticDotClass(key, selectedAlgorithm)" class="w-2 h-2 rounded-full mr-3"></div>
                    <!-- 变量名 -->
                    <span class="text-slate-200 font-medium flex-1">{{ key }}</span>
                    <!-- 数据摘要 -->
                    <span class="text-slate-400 text-xs">{{ getDataSummary(value) }}</span>
                    <!-- 展开/折叠图标 -->
                    <i class="fa-solid fa-chevron-down ml-3 text-slate-400 transition-transform duration-300"
                      :class="{ 'rotate-180': expandedKeys.has(`keypair_${key}`) }"></i>
                  </div>

                <!-- 卡片内容（展开态） -->
                <div v-if="expandedKeys.has(`keypair_${key}`)" class="bg-slate-600/50 p-4 rounded-b-lg">
                  <!-- 复制按钮 -->
                  <button @click="copyToClipboard(value)"
                    class="absolute top-2 right-2 p-1 bg-slate-800/80 hover:bg-slate-700/80 rounded text-slate-300 text-xs transition-colors">
                    <i class="fa-solid fa-copy"></i>
                  </button>

                  <!-- 数字类型 -->
                  <div v-if="typeof value === 'number'" class="p-3 bg-slate-800/50 rounded font-mono text-slate-300">
                    {{ value }}
                  </div>

                  <!-- 字符串类型 -->
                  <div v-else-if="typeof value === 'string'" class="space-y-3">
                    <!-- 直接展示或分块展示 -->
                    <div
                      class="bg-slate-800/50 p-3 rounded font-mono text-slate-300 text-sm break-all leading-relaxed overflow-auto max-h-60 whitespace-pre-wrap">
                      {{ value.length > 256 ? formatLongString(value) : value }}
                    </div>

                    <!-- 查看完整数据按钮 -->
                    <div class="mt-2" v-if="value.length > 256">
                      <button @click="openFullArrayModal(value, key)"
                        class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                        <i class="fa-solid fa-file-text mr-1"></i> 查看完整字符串
                      </button>
                    </div>
                  </div>

                  <!-- 数组类型 -->
                  <div v-else-if="Array.isArray(value)" class="space-y-3">
                    <!-- 数组数据直接显示 -->
                    <div class="bg-slate-800/50 p-3 rounded">
                      <h4 class="text-xs text-slate-400 mb-2">
                        <span>数据预览</span>
                      </h4>
                      <div class="font-mono text-sm text-slate-300 bg-slate-700/50 p-2 rounded break-all">
                        {{ Array.isArray(value) ? `[${value.slice(0, 20).join(', ')}${value.length > 20 ? '...' : ''}]`
                          : JSON.stringify(value) }}
                      </div>
                    </div>

                    <!-- 查看完整数据按钮 -->
                    <div class="mt-2">
                      <button @click="openFullArrayModal(value, key)"
                        class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                        <i class="fa-solid fa-table mr-1"></i> 查看完整数据
                      </button>
                    </div>
                  </div>

                  <!-- 其他类型 -->
                  <div v-else class="font-mono text-sm text-slate-300 bg-slate-800/50 p-3 rounded">
                    {{ JSON.stringify(value, null, 2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无keypair数据时的提示 -->
          <div v-else class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 class="text-xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
              <i class="fa-solid fa-key"></i>
              密钥生成
            </h2>
            <div class="bg-slate-700/50 p-4 rounded-lg text-center">
              <p class="text-slate-400">当前算法没有密钥生成数据</p>
            </div>
          </div>

          <!-- 中间列：加密/签名过程 -->
          <div class="space-y-6">
            <!-- 密钥封装过程 (encapsulation) -->
            <div v-if="data.encapsulation" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
              <h2 class="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                <i class="fa-solid fa-lock"></i>
                密钥封装
              </h2>

              <!-- 封装手风琴卡片 -->
              <div class="space-y-2">
                <div v-for="(value, key) in data.encapsulation" :key="key"
                  class="group relative bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-700/70 transition-colors">
                  <!-- 卡片标题栏（折叠态） -->
                  <div @click="toggleCard(`encaps_${key}`)" class="flex items-center p-3" :title="getKeyDescription(key, selectedAlgorithm)">
                    <!-- 语义彩点 -->
                    <div :class="getSemanticDotClass(key, selectedAlgorithm)" class="w-2 h-2 rounded-full mr-3"></div>
                    <!-- 变量名 -->
                    <span class="text-slate-200 font-medium flex-1">{{ key }}</span>
                    <!-- 数据摘要 -->
                    <span class="text-slate-400 text-xs">{{ getDataSummary(value) }}</span>
                    <!-- 展开/折叠图标 -->
                    <i class="fa-solid fa-chevron-down ml-3 text-slate-400 transition-transform duration-300"
                      :class="{ 'rotate-180': expandedKeys.has(`encaps_${key}`) }"></i>
                  </div>

                  <!-- 卡片内容（展开态） -->
                  <div v-if="expandedKeys.has(`encaps_${key}`)" class="bg-slate-600/50 p-4 rounded-b-lg">
                    <!-- 复制按钮 -->
                    <button @click="copyToClipboard(value)"
                      class="absolute top-2 right-2 p-1 bg-slate-800/80 hover:bg-slate-700/80 rounded text-slate-300 text-xs transition-colors">
                      <i class="fa-solid fa-copy"></i>
                    </button>

                    <!-- 数字类型 -->
                    <div v-if="typeof value === 'number'"
                      class="p-3 bg-slate-800/50 rounded font-mono text-slate-300 text-sm">
                      {{ value }}
                    </div>

                    <!-- 字符串类型 -->
                    <div v-else-if="typeof value === 'string'" class="space-y-3">
                      <!-- 直接展示或分块展示 -->
                      <div
                        class="bg-slate-800/50 p-3 rounded font-mono text-slate-300 text-sm break-all leading-relaxed overflow-auto max-h-60 whitespace-pre-wrap">
                        {{ value.length > 256 ? formatLongString(value) : value }}
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2" v-if="value.length > 256">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-file-text mr-1"></i> 查看完整字符串
                        </button>
                      </div>
                    </div>

                    <!-- 数组类型 -->
                    <div v-else-if="Array.isArray(value)" class="space-y-3">
                      <!-- 数组数据直接显示 -->
                      <div class="bg-slate-800/50 p-3 rounded">
                        <h4 class="text-xs text-slate-400 mb-2">
                          <span>数据预览</span>
                        </h4>
                        <div class="font-mono text-xs text-slate-300 bg-slate-700/50 p-2 rounded break-all">
                          {{ Array.isArray(value) ? `[${value.slice(0, 20).join(', ')}${value.length > 20 ? '...' :
                            ''}]` : JSON.stringify(value) }}
                        </div>
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-table mr-1"></i> 查看完整数据
                        </button>
                      </div>
                    </div>

                    <!-- 其他类型 -->
                    <div v-else class="font-mono text-slate-300 bg-slate-800/50 p-3 rounded text-sm">
                      {{ JSON.stringify(value, null, 2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 签名过程 (sign) -->
            <div v-if="data.sign" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
              <h2 class="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
                <i class="fa-solid fa-pen-to-square"></i>
                数字签名
              </h2>

              <!-- 签名手风琴卡片 -->
              <div class="space-y-2">
                <div v-for="(value, key) in data.sign" :key="key"
                  class="group relative bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-700/70 transition-colors">
                  <!-- 卡片标题栏（折叠态） -->
                  <div @click="toggleCard(`sign_${key}`)" class="flex items-center p-3" :title="getKeyDescription(key, selectedAlgorithm)">
                    <!-- 语义彩点 -->
                    <div :class="getSemanticDotClass(key, selectedAlgorithm)" class="w-2 h-2 rounded-full mr-3"></div>
                    <!-- 变量名 -->
                    <span class="text-slate-200 font-medium flex-1">{{ key }}</span>
                    <!-- 数据摘要 -->
                    <span class="text-slate-400 text-xs">{{ getDataSummary(value) }}</span>
                    <!-- 展开/折叠图标 -->
                    <i class="fa-solid fa-chevron-down ml-3 text-slate-400 transition-transform duration-300"
                      :class="{ 'rotate-180': expandedKeys.has(`sign_${key}`) }"></i>
                  </div>

                  <!-- 卡片内容（展开态） -->
                  <div v-if="expandedKeys.has(`sign_${key}`)" class="bg-slate-600/50 p-4 rounded-b-lg">
                    <!-- 复制按钮 -->
                    <button @click="copyToClipboard(value)"
                      class="absolute top-2 right-2 p-1 bg-slate-800/80 hover:bg-slate-700/80 rounded text-slate-300 text-xs transition-colors">
                      <i class="fa-solid fa-copy"></i>
                    </button>

                    <!-- 数字类型 -->
                    <div v-if="typeof value === 'number'"
                      class="p-3 bg-slate-800/50 rounded font-mono text-slate-300 text-sm">
                      {{ value }}
                    </div>

                    <!-- 字符串类型 -->
                    <div v-else-if="typeof value === 'string'" class="space-y-3">
                      <!-- 首尾高亮展示 -->
                      <div class="bg-slate-800/50 p-3 rounded overflow-auto max-h-60">
                        <div class="font-mono text-slate-300 text-sm whitespace-pre-wrap break-all">
                          {{ value.length > 256 ? formatLongString(value) : value }}
                        </div>
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2" v-if="value.length > 256">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-file-text mr-1"></i> 查看完整数据
                        </button>
                      </div>
                    </div>

                    <!-- 数组类型 -->
                    <div v-else-if="Array.isArray(value)" class="space-y-3">
                      <!-- 数组数据直接显示 -->
                      <div class="bg-slate-800/50 p-3 rounded">
                        <h4 class="text-xs text-slate-400 mb-2">
                          <span>数据预览</span>
                        </h4>
                        <div class="font-mono text-xs text-slate-300 bg-slate-700/50 p-2 rounded break-all">
                          {{ Array.isArray(value) ? `[${value.slice(0, 20).join(', ')}${value.length > 20 ? '...' :
                            ''}]` : JSON.stringify(value) }}
                        </div>
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-table mr-1"></i> 查看完整数据
                        </button>
                      </div>
                    </div>

                    <!-- 其他类型 -->
                    <div v-else class="font-mono text-sm text-slate-300 bg-slate-800/50 p-3 rounded">
                      {{ JSON.stringify(value, null, 2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧列：解密/验证过程 -->
          <div class="space-y-6">
            <!-- 密钥解封装过程 (decapsulation) -->
            <div v-if="data.decapsulation" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
              <h2 class="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                <i class="fa-solid fa-unlock"></i>
                密钥解封
              </h2>

              <!-- 解封手风琴卡片 -->
              <div class="space-y-2">
                <div v-for="(value, key) in data.decapsulation" :key="key"
                  class="group relative bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-700/70 transition-colors">
                  <!-- 卡片标题栏（折叠态） -->
                  <div @click="toggleCard(`decaps_${key}`)" class="flex items-center p-3" :title="getKeyDescription(key, selectedAlgorithm)">
                    <!-- 语义彩点 -->
                    <div :class="getSemanticDotClass(key, selectedAlgorithm)" class="w-2 h-2 rounded-full mr-3"></div>
                    <!-- 变量名 -->
                    <span class="text-slate-200 font-medium flex-1">{{ key }}</span>
                    <!-- 数据摘要 -->
                    <span class="text-slate-400 text-xs">{{ getDataSummary(value) }}</span>
                    <!-- 展开/折叠图标 -->
                    <i class="fa-solid fa-chevron-down ml-3 text-slate-400 transition-transform duration-300"
                      :class="{ 'rotate-180': expandedKeys.has(`decaps_${key}`) }"></i>
                  </div>

                  <!-- 卡片内容（展开态） -->
                  <div v-if="expandedKeys.has(`decaps_${key}`)" class="bg-slate-600/50 p-4 rounded-b-lg">
                    <!-- 复制按钮 -->
                    <button @click="copyToClipboard(value)"
                      class="absolute top-2 right-2 p-1 bg-slate-800/80 hover:bg-slate-700/80 rounded text-slate-300 text-xs transition-colors">
                      <i class="fa-solid fa-copy"></i>
                    </button>

                    <!-- 数字类型 -->
                    <div v-if="typeof value === 'number'"
                      class="p-3 bg-slate-800/50 rounded font-mono text-slate-300 text-sm">
                      {{ value }}
                    </div>

                    <!-- 字符串类型 -->
                    <div v-else-if="typeof value === 'string'" class="space-y-3">
                      <!-- 首尾高亮展示 -->
                      <div class="bg-slate-800/50 p-3 rounded overflow-auto max-h-60">
                        <div class="font-mono text-slate-300 text-sm whitespace-pre-wrap break-all">
                          {{ value.length > 256 ? formatLongString(value) : value }}
                        </div>
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2" v-if="value.length > 256">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-file-text mr-1"></i> 查看完整数据
                        </button>
                      </div>
                    </div>

                    <!-- 数组类型 -->
                    <div v-else-if="Array.isArray(value)" class="space-y-3">
                      <!-- 数组数据直接显示 -->
                      <div class="bg-slate-800/50 p-3 rounded">
                        <h4 class="text-xs text-slate-400 mb-2">
                          <span>数据预览</span>
                        </h4>
                        <div class="font-mono text-xs text-slate-300 bg-slate-700/50 p-2 rounded break-all">
                          {{ Array.isArray(value) ? `[${value.slice(0, 20).join(', ')}${value.length > 20 ? '...' :
                            ''}]` : JSON.stringify(value) }}
                        </div>
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-table mr-1"></i> 查看完整数据
                        </button>
                      </div>
                    </div>

                    <!-- 其他类型 -->
                    <div v-else class="font-mono text-sm text-slate-300 bg-slate-800/50 p-3 rounded">
                      {{ JSON.stringify(value, null, 2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 验证过程 (open) -->
            <div v-if="data.open" class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
              <h2 class="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <i class="fa-solid fa-check-circle"></i>
                签名验证
              </h2>

              <!-- 验证手风琴卡片 -->
              <div class="space-y-2">
                <div v-for="(value, key) in data.open" :key="key"
                  class="group relative bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:bg-slate-700/70 transition-colors">
                  <!-- 卡片标题栏（折叠态） -->
                  <div @click="toggleCard(`open_${key}`)" class="flex items-center p-3" :title="getKeyDescription(key, selectedAlgorithm)">
                    <!-- 语义彩点 -->
                    <div :class="getSemanticDotClass(key, selectedAlgorithm)" class="w-2 h-2 rounded-full mr-3"></div>
                    <!-- 变量名 -->
                    <span class="text-slate-200 font-medium flex-1">{{ key }}</span>
                    <!-- 数据摘要 -->
                    <span class="text-slate-400 text-xs">{{ getDataSummary(value) }}</span>
                    <!-- 展开/折叠图标 -->
                    <i class="fa-solid fa-chevron-down ml-3 text-slate-400 transition-transform duration-300"
                      :class="{ 'rotate-180': expandedKeys.has(`open_${key}`) }"></i>
                  </div>

                  <!-- 卡片内容（展开态） -->
                  <div v-if="expandedKeys.has(`open_${key}`)" class="bg-slate-600/50 p-4 rounded-b-lg">
                    <!-- 复制按钮 -->
                    <button @click="copyToClipboard(value)"
                      class="absolute top-2 right-2 p-1 bg-slate-800/80 hover:bg-slate-700/80 rounded text-slate-300 text-xs transition-colors">
                      <i class="fa-solid fa-copy"></i>
                    </button>

                    <!-- 数字类型 -->
                    <div v-if="typeof value === 'number'"
                      class="p-3 bg-slate-800/50 rounded font-mono text-slate-300 text-sm">
                      {{ value }}
                    </div>

                    <!-- 字符串类型 -->
                    <div v-else-if="typeof value === 'string'" class="space-y-3">
                      <!-- 首尾高亮展示 -->
                      <div class="bg-slate-800/50 p-3 rounded">
                        <div class="font-mono text-slate-300">
                          {{ value.length > 256 ? formatLongString(value) : value }}
                        </div>
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2" v-if="value.length > 256">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-file-text mr-1"></i> 查看完整数据
                        </button>
                      </div>
                    </div>

                    <!-- 数组类型 -->
                    <div v-else-if="Array.isArray(value)" class="space-y-3">
                      <!-- 数组数据直接显示 -->
                      <div class="bg-slate-800/50 p-3 rounded">
                        <h4 class="text-xs text-slate-400 mb-2">
                          <span>数据预览</span>
                        </h4>
                        <div class="font-mono text-xs text-slate-300 bg-slate-700/50 p-2 rounded break-all">
                          {{ Array.isArray(value) ? `[${value.slice(0, 20).join(', ')}${value.length > 20 ? '...' :
                            ''}]` : JSON.stringify(value) }}
                        </div>
                      </div>

                      <!-- 查看完整数据按钮 -->
                      <div class="mt-2">
                        <button @click="openFullArrayModal(value, key)"
                          class="w-full flex justify-center items-center py-2 bg-slate-600/50 hover:bg-slate-600/70 rounded text-slate-300 text-sm transition-colors">
                          <i class="fa-solid fa-table mr-1"></i> 查看完整数据
                        </button>
                      </div>
                    </div>

                    <!-- 其他类型 -->
                    <div v-else class="font-mono text-sm text-slate-300 bg-slate-800/50 p-3 rounded">
                      {{ JSON.stringify(value, null, 2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>

    <!-- 完整数组显示模态框 -->
    <div v-if="fullArrayModal.visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        class="bg-slate-800 rounded-xl border border-slate-600 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <!-- 模态框头部 -->
        <div class="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 class="text-lg font-bold text-slate-200">{{ fullArrayModal.title }} - 完整数组</h3>
          <button @click="closeFullArrayModal" class="text-slate-400 hover:text-white transition-colors">
            <i class="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        <!-- 模态框内容 -->
        <div class="flex-1 overflow-auto p-4">
          <!-- 字符串类型直接展示 -->
          <div v-if="typeof fullArrayModal.data === 'string'"
            class="font-mono text-sm text-slate-300 whitespace-pre-wrap break-all">
            {{ fullArrayModal.data }}
          </div>
          <!-- 数组类型使用网格展示（直接显示原始数据） -->
          <div v-else-if="Array.isArray(fullArrayModal.data)" class="grid grid-cols-8 gap-1">
            <div v-for="(item, index) in fullArrayModal.data" :key="index"
              class="bg-slate-700/50 p-1 rounded text-center text-xs font-mono text-slate-300 min-w-[40px]">
              {{ item }}
            </div>
          </div>
          <!-- 其他类型使用JSON展示 -->
          <div v-else class="font-mono text-sm text-slate-300">
            {{ JSON.stringify(fullArrayModal.data, null, 2) }}
          </div>
        </div>

        <!-- 模态框底部 -->
        <div class="flex justify-end items-center p-4 border-t border-slate-700 gap-2">
          <button @click="copyToClipboard(fullArrayModal.data)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
            <i class="fa-solid fa-copy mr-1"></i> 复制全量数据
          </button>
          <button @click="closeFullArrayModal"
            class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import HeaderBar from '../components/HeaderBar.vue';
import { useAlgoStore } from '../stores/algorithmStore';

// 定义数据类型
interface AlgorithmData {
  version: string;
  keypair?: Record<string, unknown>;
  encapsulation?: Record<string, unknown>;
  decapsulation?: Record<string, unknown>;
  sign?: Record<string, unknown>;
  open?: Record<string, unknown>;
  [key: string]: unknown;
}

const algorithmStore = useAlgoStore();
const currentAlgo = computed(() => algorithmStore.currentAlgo);

const selectedAlgorithm = computed(() => {
  return currentAlgo.value || 'kyber';
});

// 添加类型定义
const data = ref<AlgorithmData | null>(null);
const allVersions = ref<AlgorithmData[]>([]);
const selectedVersion = ref<string | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const keyTypes = ref<Record<string, Record<string, string>>>({});
const colorMap = ref<Record<string, string>>({
  secret: 'bg-rose-500',
  public: 'bg-blue-500',
  random: 'bg-yellow-500',
  structure: 'bg-purple-500',
  message: 'bg-green-500',
  meta: 'bg-slate-500'
});

// 全局展开/折叠状态管理
const expandedKeys = ref<Set<string>>(new Set());

// 完整数组显示状态
const fullArrayModal = ref<{
  visible: boolean;
  data: unknown;
  title: string;
}>({ visible: false, data: [], title: '' });

// 打开完整数组模态框
const openFullArrayModal = (array: unknown, title: string) => {
  fullArrayModal.value = { visible: true, data: array, title };
};

// 关闭完整数组模态框
const closeFullArrayModal = () => {
  fullArrayModal.value.visible = false;
};

// 根据变量名和算法获取语义色彩类
// 获取键的语义类型描述信息
const getKeyDescription = (key: string, algoName: string): string | undefined => {
  if (keyTypes.value[algoName]) {
    // 1. 先尝试精确匹配（完整路径）
    if (keyTypes.value[algoName][key]) {
      const keyTypeData = keyTypes.value[algoName][key];
      // 兼容新旧格式：如果是对象则取description属性
      if (typeof keyTypeData === 'object' && keyTypeData && 'description' in keyTypeData) {
        const keyTypeObj = keyTypeData as { description: string };
        return keyTypeObj.description;
      }
    }

    // 2. 尝试部分匹配（只匹配变量名）
    const matchedKey = Object.keys(keyTypes.value[algoName]).find(fullKey =>
      fullKey.endsWith(`.${key}`) || fullKey === key
    );

    if (matchedKey && keyTypes.value[algoName][matchedKey]) {
      const keyTypeData = keyTypes.value[algoName][matchedKey];
      // 兼容新旧格式：如果是对象则取description属性
      if (typeof keyTypeData === 'object' && keyTypeData && 'description' in keyTypeData) {
        const keyTypeObj = keyTypeData as { description: string };
        return keyTypeObj.description;
      }
    }
  }

  // 如果没有预定义的描述，返回undefined
  return undefined;
};

// 获取语义颜色类名
const getSemanticDotClass = (key: string, algoName: string): string => {
  // 调试日志
  console.log(`Getting color for key: ${key}, algo: ${algoName}`);
  console.log(`Available algos in keyTypes: ${Object.keys(keyTypes.value)}`);
  console.log(`Has algo keyTypes: ${!!keyTypes.value[algoName]}`);

  if (keyTypes.value[algoName]) {
    // 1. 先尝试精确匹配（完整路径）
    if (keyTypes.value[algoName][key]) {
      const keyTypeData = keyTypes.value[algoName][key];
      // 兼容新旧格式：如果是字符串直接使用，如果是对象则取type属性
      let keyType: string;
      if (typeof keyTypeData === 'string') {
        keyType = keyTypeData;
      } else {
        // 明确断言为包含type属性的对象类型
        const keyTypeObj = keyTypeData as { type: string };
        keyType = keyTypeObj.type;
      }
      // 确保keyType是colorMap中有效的键类型
      const validTypes = ['secret', 'public', 'random', 'structure', 'message', 'meta'] as const;
      let color: string;
      // 使用类型守卫来检查keyType是否为validTypes中的值
      if (validTypes.some(type => type === keyType)) {
        const mappedColor = colorMap.value[keyType as typeof validTypes[number]];
        color = mappedColor !== undefined ? mappedColor : 'bg-slate-500';
      } else {
        color = 'bg-slate-500';
      }
      console.log(`Using exact match color: ${color} for key: ${key}`);
      return color;
    }

    // 2. 尝试部分匹配（只匹配变量名）
    const matchedKey = Object.keys(keyTypes.value[algoName]).find(fullKey =>
      fullKey.endsWith(`.${key}`) || fullKey === key
    );

    if (matchedKey && keyTypes.value[algoName][matchedKey]) {
      const keyTypeData = keyTypes.value[algoName][matchedKey];
      // 兼容新旧格式：如果是字符串直接使用，如果是对象则取type属性
      let keyType: string;
      if (typeof keyTypeData === 'string') {
        keyType = keyTypeData;
      } else {
        // 明确断言为包含type属性的对象类型
        const keyTypeObj = keyTypeData as { type: string };
        keyType = keyTypeObj.type;
      }
      // 确保keyType是colorMap中有效的键类型
      const validTypes = ['secret', 'public', 'random', 'structure', 'message', 'meta'] as const;
      let color: string;
      // 使用类型守卫来检查keyType是否为validTypes中的值
      if (validTypes.some(type => type === keyType)) {
        const mappedColor = colorMap.value[keyType as typeof validTypes[number]];
        color = mappedColor !== undefined ? mappedColor : 'bg-slate-500';
      } else {
        color = 'bg-slate-500';
      }
      console.log(`Using partial match color: ${color} for key: ${key} (matched: ${matchedKey})`);
      return color;
    }

    // 3. 尝试根据关键词匹配
    if (key.includes('pk') || key.includes('public')) {
      const color = colorMap.value.public || 'bg-slate-500';
      console.log(`Using pk/public keyword match color: ${color} for key: ${key}`);
      return color;
    } else if (key.includes('sk') || key.includes('secret')) {
      const color = colorMap.value.secret || 'bg-slate-500';
      console.log(`Using sk/secret keyword match color: ${color} for key: ${key}`);
      return color;
    }
  }

  // 如果没有预定义的类型，使用默认颜色
  console.log(`Using default color for key: ${key}`);
  return 'bg-slate-500';
};

// 获取数据摘要
const getDataSummary = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `Array [${value.length}]`;
  } else if (typeof value === 'string') {
    return `String [${value.length}]`;
  } else if (typeof value === 'number') {
    return 'Number';
  } else if (typeof value === 'boolean') {
    return 'Boolean';
  } else {
    return 'Object';
  }
};

// 格式化长字符串，采用首尾高亮法
const formatLongString = (str: string): string => {
  if (str.length <= 16) {
    return str;
  }
  return `${str.substring(0, 8)} •••••••• ${str.substring(str.length - 8)}`;
};

// 分块格式化长字符串
const chunkString = (str: string, chunkSize: number = 8): string => {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks.join('  ');
};

// 计算数组的统计信息，用于微型统计图
const getArrayStats = (array: number[]): {
  min: number;
  max: number;
  avg: number;
  median: number;
  distribution: number[];
} => {
  const sorted = [...array].sort((a, b) => a - b);
  const min = sorted[0] || 0;
  const max = sorted[sorted.length - 1] || 0;
  const avg = array.reduce((sum, val) => sum + val, 0) / array.length;
  const median = sorted[Math.floor(sorted.length / 2)] || 0;

  // 生成10个区间的分布数据
  const distribution: number[] = new Array(10).fill(0);
  const range = max - min;
  if (range === 0) {
    distribution[4] = array.length;
  } else {
    array.forEach(val => {
      const index = Math.min(9, Math.floor((val - min) / range * 10));
      // 使用类型断言确保TypeScript知道distribution[index]是数字
      (distribution[index] as number)++;
    });
  }

  return { min, max, avg, median, distribution };
};

// 单元格颜色映射函数，根据数值生成热力图背景色
const getCellColorClass = (value: unknown, min?: number, max?: number): string => {
  if (typeof value !== 'number') {
    return 'bg-slate-700/50';
  }

  // 特判：如果是PQC常见的小整数（如-10到10之间）
  if (min !== undefined && max !== undefined && min >= -10 && max <= 10) {
    if (value === 0) {
      return 'bg-slate-700';
    } else if (value < 0) {
      return 'bg-blue-900/80'; // 负数偏蓝
    } else {
      return 'bg-rose-900/80'; // 正数偏红
    }
  }

  // 如果没有提供min和max，使用默认范围
  const defaultMin = -3;
  const defaultMax = 3;
  const valMin = min !== undefined ? min : defaultMin;
  const valMax = max !== undefined ? max : defaultMax;

  // 计算数值在范围内的位置（0-1）
  const range = valMax - valMin;
  let normalized: number;

  if (range === 0) {
    normalized = 0.5; // 所有值都相同，居中显示
  } else {
    normalized = (value - valMin) / range;
  }

  // 确保normalized在0-1范围内
  normalized = Math.max(0, Math.min(1, normalized));

  // 根据normalized值返回不同深浅的颜色
  if (normalized < 0.2) {
    return 'bg-blue-900/80';
  } else if (normalized < 0.4) {
    return 'bg-blue-700/80';
  } else if (normalized < 0.6) {
    return 'bg-slate-600/80';
  } else if (normalized < 0.8) {
    return 'bg-red-700/80';
  } else {
    return 'bg-red-900/80';
  }
};

// 切换卡片展开/折叠状态
const toggleCard = (key: string) => {
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key);
  } else {
    expandedKeys.value.add(key);
  }
};

// 全部展开
const expandAll = () => {
  if (data.value) {
    const allKeys: string[] = [];
    if (data.value.keypair) {
      allKeys.push(...Object.keys(data.value.keypair).map(k => `keypair_${k}`));
    }
    if (data.value.encapsulation) {
      allKeys.push(...Object.keys(data.value.encapsulation).map(k => `encaps_${k}`));
    }
    if (data.value.decapsulation) {
      allKeys.push(...Object.keys(data.value.decapsulation).map(k => `decaps_${k}`));
    }
    if (data.value.sign) {
      allKeys.push(...Object.keys(data.value.sign).map(k => `sign_${k}`));
    }
    if (data.value.open) {
      allKeys.push(...Object.keys(data.value.open).map(k => `open_${k}`));
    }
    allKeys.forEach(key => expandedKeys.value.add(key));
  }
};

// 全部折叠
const collapseAll = () => {
  expandedKeys.value.clear();
};

// 复制数据到剪贴板
const copyToClipboard = async (value: unknown) => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(value));
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // 1. Load key types data
    try {
      const keyTypesResponse = await fetch(`/data/key_types.json`);
      console.log('Key types response status:', keyTypesResponse.status);
      if (keyTypesResponse.ok) {
        const keyTypesData = await keyTypesResponse.json();
        console.log('Key types data:', keyTypesData);
        keyTypes.value = keyTypesData.keyTypes || {};
        if (keyTypesData.colorMap) {
          colorMap.value = keyTypesData.colorMap;
        }
        console.log('Key types loaded successfully:', Object.keys(keyTypes.value));
        console.log('Color map:', colorMap.value);
      }
    } catch (keyTypesError) {
      console.warn('Failed to load key types:', keyTypesError);
    }

    // 2. Load algorithm data
    const algoName = selectedAlgorithm.value;
    const fileName = `ui_${algoName}_output.json`;
    console.log('Loading data for:', algoName);
    console.log('Loading file:', fileName);

    const response = await fetch(`/data/${fileName}`);
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }

    const rawData = await response.json() as AlgorithmData | AlgorithmData[];
    console.log('Raw data loaded:', rawData);

    if (Array.isArray(rawData)) {
      allVersions.value = rawData;

      if (rawData.length > 0) {
        // 添加类型断言确保rawData[0]不是undefined
        const firstItem = rawData[0] as AlgorithmData;
        selectedVersion.value = firstItem.version;
        data.value = firstItem;
      } else {
        selectedVersion.value = null;
        data.value = null;
      }
    } else {
      allVersions.value = [rawData];
      selectedVersion.value = rawData.version;
      data.value = rawData;
    }
    console.log('Processed data:', data.value);
    console.log('Available versions:', allVersions.value.map(v => v.version));
  } catch (err) {
    error.value = `加载数据失败: ${err instanceof Error ? err.message : String(err)}`;
    console.error('Error loading data:', err);
  } finally {
    loading.value = false;
  }
};

const changeVersion = (version: string) => {
  selectedVersion.value = version;
  const selectedData = allVersions.value.find(v => v.version === version);
  if (selectedData) {
    data.value = selectedData;
    // 切换版本时重置展开状态
    expandedKeys.value.clear();
    console.log('Switched to version:', version);
  }
};

watch(currentAlgo, () => {
  // 切换算法时重置展开状态
  expandedKeys.value.clear();
  loadData();
}, { immediate: true });

onMounted(() => {
  loadData();
});
</script>

<style scoped></style>

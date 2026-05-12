# PQC-EVA

**Post-Quantum Cryptography Exploratory Visualization Analysis**

交互式后量子计算密码可视分析系统。纯前端 SPA，无需后端服务。

## 覆盖算法

| 类别 | 算法 |
|---|---|
| 格密码 | Kyber (ML-KEM), Dilithium (ML-DSA), Falcon, NTRU |
| 多变量密码 | UOV, Mayo |
| 编码密码 | HQC |
| 安全哈希 | XMSS, SPHINCS+ |

## 功能模块

- **Matrix 可视化** — 基于 D3.js 的算法步骤矩阵动画展示
- **算法对比** — ECharts 雷达图多算法/多维度对比
- **交互式演示** — 逐步演示算法各阶段的密钥/密文数据流
- **真实数据** — 各算法实际运行参数与性能数据
- **推荐向导** — 根据安全需求自动推荐算法
- **知识测验** — 内置算法知识问答

## 技术栈

Vue 3, TypeScript, Vite, Pinia, Vue Router, D3.js, ECharts, GSAP, Tailwind CSS, KaTeX

## 快速开始

```sh
npm install
npm run dev
```

构建生产版本：

```sh
npm run build
```

预览构建结果：

```sh
npm run preview
```

## 格式检查与测试

```sh
npm run lint
npm run test
```

## 许可证

MIT

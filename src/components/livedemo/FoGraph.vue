<template>
    <div class="flex flex-col items-center w-[1200px] min-w-[1200px] shrink-0 bg-slate-800 p-8 rounded-lg font-sans mx-auto border border-slate-700 mt-8">
        <h2 class="text-2xl font-bold mb-4 border-b-2 border-slate-600 w-full text-center pb-3 text-slate-100">Fujisaki-Okamoto transform</h2>
        <div class="text-sm text-slate-400 mb-8 max-w-4xl text-center leading-relaxed">
            上图展示了Fujisaki-Okamoto变换的详细示例。它基于 KEM_m^(⊥) 设计，其中 m 是消息。
        </div>

        <div class="grid grid-cols-3 gap-10 w-full max-w-5xl relative mt-4">
            <div class="flex flex-col items-center p-6 border-2 border-indigo-500/50 bg-slate-900/80 rounded-2xl relative z-10 shadow-sm hover:shadow-md transition-shadow">
                <h3 class="font-bold text-slate-200 mb-6 border-b-2 border-slate-600 pb-2 w-full text-center text-lg">密钥生成 (Gen^⊥)</h3>
                <div class="w-full py-3 bg-slate-700 hover:bg-indigo-900/30 border border-slate-600 text-center text-sm rounded font-mono text-slate-300">PKE.Gen() -> (pk, sk)</div>
                <div class="arrow-down my-3"></div>
                <div class="w-full py-3 bg-slate-700 hover:bg-indigo-900/30 border border-slate-600 text-center text-sm rounded font-mono text-slate-300">s &lt;- M (Random)</div>
                <div class="arrow-down my-3"></div>
                <div class="w-full py-3 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/50 text-center text-sm rounded font-mono font-bold text-indigo-300">sk' = (sk, s)</div>
            </div>

            <div class="flex flex-col items-center p-6 border-2 border-teal-500/50 bg-slate-900/80 rounded-2xl relative z-10 shadow-sm hover:shadow-md transition-shadow">
                <h3 class="font-bold text-slate-200 mb-6 border-b-2 border-slate-600 pb-2 w-full text-center text-lg">密钥封装 Encaps_m(pk)</h3>
                <div class="w-full py-3 bg-slate-700 hover:bg-teal-900/30 border border-slate-600 text-center text-sm rounded font-mono text-slate-300">m &lt;- M (Random)</div>
                <div class="arrow-down my-3"></div>
                <div class="flex gap-3 w-full">
                    <div class="flex-1 py-3 bg-slate-700 hover:bg-teal-900/30 border border-slate-600 text-center text-sm rounded font-mono text-slate-300">G(m) -> r</div>
                    <div class="flex-1 py-3 bg-slate-700 hover:bg-teal-900/30 border border-slate-600 text-center text-sm rounded font-mono text-slate-300">H(m) -> K</div>
                </div>
                <div class="arrow-down my-3"></div>
                <div class="w-full py-4 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/50 text-center text-sm rounded font-mono font-bold text-blue-300">c = PKE.Enc(pk, m, r)</div>
            </div>

            <div class="flex flex-col items-center p-6 border-2 border-purple-500/50 bg-slate-900/80 rounded-2xl relative z-10 shadow-sm hover:shadow-md transition-shadow">
                <h3 class="font-bold text-slate-200 mb-6 border-b-2 border-slate-600 pb-2 w-full text-center text-lg">密钥解封装 Decaps_m^⊥(sk', c)</h3>
                <div class="w-full py-4 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/50 text-center text-sm rounded font-mono font-bold text-purple-300">m' = PKE.Dec(sk, c)</div>
                <div class="arrow-down my-3"></div>
                <div class="flex gap-3 w-full">
                    <div class="flex-1 py-3 bg-slate-700 hover:bg-purple-900/30 border border-slate-600 text-center text-sm rounded font-mono text-slate-300">G(m') -> r'</div>
                    <div class="flex-1 py-3 bg-slate-700 hover:bg-purple-900/30 border border-slate-600 text-center text-sm rounded font-mono text-slate-300">H(m') -> K'</div>
                </div>
                <div class="arrow-down my-3"></div>
                <div class="w-full py-4 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/50 text-center text-sm rounded font-mono font-bold text-indigo-300">c' = PKE.Enc(pk, m', r')</div>
                <div class="arrow-down my-3"></div>
                <div class="w-full border-2 border-yellow-500/50 bg-yellow-900/20 p-3 text-center text-sm font-bold rounded-lg shadow-sm font-mono text-yellow-300">
                    if (c == c') return K'<br/>else return J(s, c)
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

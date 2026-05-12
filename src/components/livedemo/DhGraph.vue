<template>
    <div class="flex flex-col items-center w-[1200px] min-w-[1200px] shrink-0 bg-slate-800 p-8 rounded-lg font-sans mx-auto border border-slate-700 mt-8">
        <h2 class="text-2xl font-bold mb-4 border-b-2 border-slate-600 w-full text-center pb-3 text-slate-100">Kyber vs Diffie-Hellman</h2>
        <div class="text-sm text-slate-400 mb-8 max-w-4xl text-center leading-relaxed">
            <p>这两个协议都旨在允许双方安全地建立共享密钥。</p>
            <p>协议图突出显示了 Kyber 和 Diffie-Hellman 之间在 <strong class="text-slate-200">"交换性 (commutativity)"</strong> 方面的关键差异。</p>
        </div>

        <div class="flex w-full gap-10">
            <div class="flex-1 border-2 border-orange-500/50 bg-orange-900/10 p-8 rounded-2xl flex flex-col items-center shadow-sm">
                <div class="font-bold text-orange-300 mb-8 text-lg border-b-2 border-orange-500/30 pb-2 w-full text-center">Diffie-Hellman Protocol (Commutative)</div>
                <div class="flex justify-between items-center w-full relative h-40 px-6">
                    <div class="flex flex-col items-center z-10">
                        <div class="w-16 h-16 bg-orange-600 rounded-full text-white flex items-center justify-center font-bold mb-2 shadow-md text-xl border-2 border-orange-400">A</div>
                        <div class="text-xs border-2 bg-slate-800 border-orange-500/50 px-2 py-1 rounded shadow-sm font-mono font-bold text-orange-300">K=B^a mod p</div>
                    </div>
                    <div class="flex-1 relative h-full">
                        <div class="absolute top-1/3 w-full h-[3px] bg-orange-500 rotate-[8deg]">
                            <span class="absolute -top-7 left-1/4 text-xs bg-slate-800 px-2 py-0.5 border-2 rounded shadow-sm text-orange-300 font-mono font-bold">A=g^a mod p</span>
                            <div class="absolute right-0 -top-1.5 w-3 h-3 border-r-4 border-b-4 border-orange-500 -rotate-45"></div>
                        </div>
                        <div class="absolute bottom-1/3 w-full h-[3px] bg-orange-500 -rotate-[8deg]">
                            <span class="absolute -bottom-7 right-1/4 text-xs bg-slate-800 px-2 py-0.5 border-2 rounded shadow-sm text-orange-300 font-mono font-bold">B=g^b mod p</span>
                            <div class="absolute left-0 -top-1.5 w-3 h-3 border-l-4 border-t-4 border-orange-500 -rotate-45"></div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center z-10">
                        <div class="w-16 h-16 bg-orange-600 rounded-full text-white flex items-center justify-center font-bold mb-2 shadow-md text-xl border-2 border-orange-400">B</div>
                        <div class="text-xs border-2 bg-slate-800 border-orange-500/50 px-2 py-1 rounded shadow-sm font-mono font-bold text-orange-300">K=A^b mod p</div>
                    </div>
                </div>
                <div class="text-sm text-orange-300 mt-8 bg-slate-800 p-4 rounded-lg border border-orange-500/30 shadow-sm w-full leading-relaxed">
                    <strong>交换性：</strong>谁开始交换或双方以什么顺序发送公钥并不重要。
                </div>
            </div>

            <div class="flex-1 border-2 border-indigo-500/50 bg-indigo-900/10 p-8 rounded-2xl flex flex-col items-center shadow-sm">
                <div class="font-bold text-indigo-300 mb-8 text-lg border-b-2 border-indigo-500/30 pb-2 w-full text-center">Kyber Protocol (Strict Roles)</div>
                <div class="flex justify-between items-center w-full relative h-40 px-6">
                    <div class="flex flex-col items-center z-10">
                        <div class="w-16 h-16 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold mb-2 shadow-md text-xl border-2 border-indigo-400">A</div>
                        <div class="text-sm font-bold text-indigo-300 bg-slate-800 px-3 py-1 rounded border border-indigo-500/50 shadow-sm">Initiator</div>
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                        <div class="flex flex-col gap-4 w-full">
                            <div class="flex items-center gap-2">
                                <div class="flex-1 h-[2px] bg-indigo-500"></div>
                                <div class="text-xs bg-slate-800 px-2 py-1 border rounded shadow-sm font-mono border-indigo-500/50 text-indigo-300">ek</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="flex-1 h-[2px] bg-indigo-500"></div>
                                <div class="text-xs bg-slate-800 px-2 py-1 border rounded shadow-sm font-mono border-indigo-500/50 text-indigo-300">c</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center z-10">
                        <div class="w-16 h-16 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold mb-2 shadow-md text-xl border-2 border-indigo-400">B</div>
                        <div class="text-sm font-bold text-indigo-300 bg-slate-800 px-3 py-1 rounded border border-indigo-500/50 shadow-sm">Responder</div>
                    </div>
                </div>
                <div class="text-sm text-indigo-300 mt-8 bg-slate-800 p-4 rounded-lg border border-indigo-500/30 shadow-sm w-full leading-relaxed">
                    <strong>非交换性：</strong>双方有严格不同的角色。Alice 生成密钥对，Bob 只使用 Alice 的公钥进行封装。
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

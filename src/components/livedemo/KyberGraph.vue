<template>
    <div class="flex flex-col items-center w-full min-w-max bg-slate-900 p-4 rounded-xl font-sans relative mx-auto border border-slate-700">

        <div class="flex justify-between items-center w-full mb-3">
            <h2 class="text-xl font-bold ml-6 text-slate-100">完整的Kyber图 (ML-KEM Step-by-Step)</h2>
            <div class="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full shadow-inner border border-slate-600 mr-6">
                <button @click="zoomLevel = Math.max(0.4, zoomLevel - 0.1)" class="px-2 text-xl hover:text-indigo-400 font-bold leading-none text-slate-300">-</button>
                <span class="text-sm font-mono w-12 text-center font-bold text-slate-300">{{ Math.round(zoomLevel * 100) }}%</span>
                <button @click="zoomLevel = Math.min(1.5, zoomLevel + 0.1)" class="px-2 text-xl hover:text-indigo-400 font-bold leading-none text-slate-300">+</button>
                <div class="w-px h-3 bg-slate-500 mx-1"></div>
                <button @click="zoomLevel = 1.0" class="px-2 text-xs font-bold text-slate-400 hover:text-indigo-400 uppercase tracking-wider">Reset</button>
            </div>
        </div>

        <div class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 mb-4 text-xs flex flex-col justify-center shadow-inner max-w-[1400px]">
            <div class="flex flex-wrap gap-x-4 gap-y-2 justify-center font-medium text-slate-300">
                <div class="flex items-center gap-1"><div class="w-3 h-3 border border-green-400 bg-green-900/50 rounded-sm"></div>Input (输入)</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 border border-purple-400 bg-purple-900/50 rounded-sm"></div>Process (处理过程)</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 border border-blue-400 bg-blue-900/50 rounded-sm"></div>Data (数据)</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 border border-orange-400 bg-orange-900/50 rounded-sm"></div>Random (随机生成)</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 border border-red-400 bg-red-900/50 rounded-sm"></div>Output (输出)</div>
                <div class="flex items-center gap-1"><div class="w-3 h-3 border border-slate-400 bg-slate-700 rounded-sm"></div>Usage hints (指引)</div>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2 pt-2 border-t border-slate-700 font-medium text-slate-400">
                <div class="flex items-center gap-1 cursor-pointer hover:text-indigo-400" @click="$emit('badge-click', 'fo')"><div class="badge-fo" style="position:static;"></div>Fujisaki-Okamoto</div>
                <div class="flex items-center gap-1 cursor-pointer hover:text-indigo-400" @click="$emit('badge-click', 'contributory')"><div class="badge-contrib" style="position:static;"></div>Contributory</div>
                <div class="flex items-center gap-1"><div class="badge-nonoff" style="position:static; transform: rotate(45deg);"></div>Non-official</div>
                <div class="flex items-center gap-1"><div class="badge-check" style="position:static;"></div>Requires input check</div>
            </div>
        </div>

        <div :style="{ transform: 'scale(' + zoomLevel + ')', transformOrigin: 'top center', width: 'fit-content' }" class="transition-transform duration-300 mx-auto px-6 pb-12">
            <div class="flex flex-col items-center w-full relative gap-3">

                <div class="flex flex-col relative border-2 border-indigo-500 rounded-xl px-4 py-5 bg-slate-800 shadow-lg w-fit mt-1">
                    <div class="absolute -top-3 left-4 bg-indigo-600 text-white font-bold py-1 px-3 rounded-full shadow-lg text-[12px] border border-indigo-400">[19] ML-KEM.KeyGen (Alice)</div>

                    <div class="flex items-center gap-2 mt-1 overflow-x-visible custom-scrollbar">

                        <div class="flex flex-col gap-2">
                            <div class="flex items-center gap-1.5">
                                <GraphNode id="kg_z" label="z" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="random" custom-class="min-w-[2rem]" />
                                <div class="arrow-right"></div>
                                <GraphNode id="kg_z_null" label="z=⊥?" badge="check" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="hints" custom-class="text-[10px] px-1.5 py-0.5" />
                            </div>
                            <div class="flex items-center gap-1.5">
                                <GraphNode id="kg_d" label="d" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="random" custom-class="min-w-[2rem]" />
                                <div class="arrow-right"></div>
                                <GraphNode id="kg_d_null" label="d=⊥?" badge="check" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="hints" custom-class="text-[10px] px-1.5 py-0.5" />
                            </div>
                        </div>

                        <div class="arrow-right min-w-[8px]"></div>

                        <div class="flex flex-col items-center gap-1.5 border border-slate-600 p-1.5 rounded-md bg-slate-700/50 shadow-sm shrink-0">
                            <GraphNode id="kg_fail" label="Fail ⊥" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="hints" custom-class="border-dashed text-red-400 bg-red-900/30 border-red-500/50 text-[10px] py-0.5" />
                            <span class="text-[9px] text-slate-400 font-bold">&uarr; YES</span>
                            <div class="w-full h-px bg-slate-500"></div>
                            <span class="text-[9px] text-slate-400 font-bold">NO &darr;</span>
                            <GraphNode id="kg_internal" label="Continue" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="hints" custom-class="bg-indigo-900/50 border-indigo-500/50 py-0.5" />
                        </div>

                        <div class="arrow-right min-w-[8px]"></div>

                        <div class="flex items-center gap-2 border-2 border-indigo-500/50 bg-indigo-900/20 rounded-lg p-3 shadow-inner relative whitespace-nowrap">
                            <div class="absolute -top-2.5 left-3 bg-indigo-700 text-indigo-200 font-bold px-2 text-[10px] rounded-md">[16] ML-KEM.KeyGen_internal</div>

                            <div class="flex items-center gap-2 border-2 border-blue-500/50 bg-slate-800 rounded-lg p-3 relative shadow">
                                <div class="absolute -top-2.5 left-3 bg-blue-700 text-blue-200 font-bold px-2 text-[10px] rounded-md">[13] K-PKE.KeyGen</div>

                                <GraphNode id="kg_kpke" label="Init" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="hints" />
                                <div class="arrow-right"></div>
                                <GraphNode id="kg_hash_g" label="G(d||k)" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" />

                                <div class="w-2 h-[2px] bg-slate-500"></div>

                                <div class="flex flex-col gap-3">
                                    <div class="flex items-center gap-1.5">
                                        <GraphNode id="kg_rho" label="ρ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="kg_samplentt" label="SampleNTT" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="kg_loop" label="Loop i,j" badge="non-official" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="hints" custom-class="text-[10px] px-1.5 py-0.5" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="kg_ahat" label="Â" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                    </div>

                                    <div class="flex items-center gap-1.5">
                                        <GraphNode id="kg_sigma" label="σ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="kg_prf" label="PRF(σ,N)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="kg_n_inc" label="N++" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="kg_cbd" label="CBD" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                        <div class="w-2 h-[2px] bg-slate-500"></div>
                                        <div class="flex flex-col gap-1.5">
                                            <div class="flex items-center gap-1.5">
                                                <GraphNode id="kg_ntt1" label="NTT(s)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                                <div class="arrow-right"></div>
                                                <GraphNode id="kg_shat" label="ŝ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[1.5rem] py-0.5" />
                                            </div>
                                            <div class="flex items-center gap-1.5">
                                                <GraphNode id="kg_ntt2" label="NTT(e)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                                <div class="arrow-right"></div>
                                                <GraphNode id="kg_ehat" label="ê" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[1.5rem] py-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="w-2 h-[2px] bg-slate-500"></div>

                                <div class="flex items-center gap-1.5">
                                    <GraphNode id="kg_calc" label="t̂=Â∘ŝ+ê" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="kg_that" label="t̂ (data)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="kg_encode" label="Encode" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                    <div class="w-2 h-[2px] bg-slate-500"></div>
                                    <div class="flex flex-col gap-1.5">
                                        <GraphNode id="kg_ek_pke" label="ek_PKE" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                        <GraphNode id="kg_dk_pke" label="dk_PKE" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                    </div>
                                </div>
                            </div>

                            <div class="w-2 h-[2px] bg-slate-500"></div>

                            <div class="flex flex-col gap-2">
                                <div class="flex items-center gap-1.5">
                                    <GraphNode id="kg_h_ek" label="H(ek_PKE)" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="kg_concat_dk" label="Concat(dk,ek,H,z)" badge="contributory,fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="kg_dk_final" label="Out dk" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="output" custom-class="shadow-sm" />
                                </div>
                                <GraphNode id="kg_ek_final" label="Out ek" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="output" custom-class="shadow-sm" />
                            </div>
                        </div>

                    </div>
                </div>

                <div class="flex flex-col items-center justify-center py-1">
                    <div class="bg-indigo-900/50 text-indigo-300 font-bold px-3 py-1 text-[11px] rounded shadow-sm border border-indigo-500/50">Network: ek (Public Key)</div>
                    <div class="w-[2px] h-6 bg-slate-500 mt-1 relative rounded-full">
                        <div class="absolute -bottom-1 -left-[4px] border-t-[6px] border-l-[5px] border-r-[5px] border-t-slate-500 border-l-transparent border-r-transparent"></div>
                    </div>
                </div>

                <div class="flex flex-col relative border-2 border-teal-500 rounded-xl px-4 py-5 bg-slate-800 shadow-lg w-fit mt-1">
                    <div class="absolute -top-3 left-4 bg-teal-600 text-white font-bold py-1 px-3 rounded-full shadow-lg text-[12px] border border-teal-400">[20] ML-KEM.Encaps (Bob)</div>

                    <div class="flex items-center gap-2 mt-1 overflow-x-visible custom-scrollbar">

                        <div class="flex items-center gap-1.5">
                            <GraphNode id="ec_m_gen" label="m" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="random" custom-class="min-w-[2rem]" />
                            <div class="arrow-right"></div>
                            <GraphNode id="ec_m_null" label="m=⊥?" badge="check" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="hints" custom-class="text-[10px] px-1.5 py-0.5" />
                        </div>

                        <div class="arrow-right min-w-[8px]"></div>

                        <div class="flex flex-col items-center gap-1.5 border border-slate-600 p-1.5 rounded-md bg-slate-700/50 shadow-sm shrink-0">
                            <GraphNode id="ec_fail" label="Fail ⊥" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="hints" custom-class="border-dashed text-red-400 bg-red-900/30 border-red-500/50 py-0.5 text-[10px]" />
                            <span class="text-[9px] text-slate-400 font-bold">&uarr; YES</span>
                            <div class="w-full h-px bg-slate-500"></div>
                            <span class="text-[9px] text-slate-400 font-bold">NO &darr;</span>
                            <GraphNode id="ec_internal" label="Continue" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="hints" custom-class="bg-teal-900/50 border-teal-500/50 py-0.5 text-[10px]" />
                        </div>

                        <div class="arrow-right min-w-[8px]"></div>

                        <div class="flex items-center gap-2 border-2 border-teal-500/50 bg-teal-900/20 rounded-lg p-3 shadow-inner relative whitespace-nowrap">
                            <div class="absolute -top-2.5 left-3 bg-teal-700 text-teal-200 font-bold px-2 text-[10px] rounded-md">[17] ML-KEM.Encaps_internal</div>

                            <div class="flex flex-col gap-1.5 items-center shrink-0">
                                <GraphNode id="ec_recv_ek" label="Recv ek" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="hints" />
                                <div class="arrow-down"></div>
                                <GraphNode id="ec_ek" label="ek" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="input" />
                            </div>

                            <div class="arrow-right min-w-[8px]"></div>

                            <div class="flex items-center gap-1.5 shrink-0">
                                <GraphNode id="ec_h" label="H(ek)" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" />
                                <div class="arrow-right"></div>
                                <GraphNode id="ec_hek" label="H(ek) data" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" />
                            </div>

                            <div class="arrow-right min-w-[8px]"></div>

                            <GraphNode id="ec_concat" label="Concat(m,H(ek))" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" custom-class="shrink-0" />
                            <div class="arrow-right min-w-[8px]"></div>
                            <GraphNode id="ec_g" label="G(m||H)" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" custom-class="shrink-0" />

                            <div class="w-2 h-[2px] bg-slate-500 shrink-0"></div>

                            <div class="flex flex-col gap-2 shrink-0">
                                <GraphNode id="ec_k" label="Out K" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="output" custom-class="border-blue-400 bg-blue-900/50 shadow-sm" />
                                <GraphNode id="ec_r" label="r" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" />
                            </div>

                            <div class="w-2 h-[2px] bg-slate-500 shrink-0"></div>

                            <div class="flex flex-col gap-2 border-2 border-blue-500/50 bg-slate-800 rounded-lg p-3 relative shadow">
                                <div class="absolute -top-2.5 left-3 bg-blue-700 text-blue-200 font-bold px-2 text-[10px] rounded-md">[14] K-PKE.Encrypt</div>

                                <div class="flex items-center gap-1.5">
                                    <GraphNode id="ec_encrypt" label="Enc Init" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="hints" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_decode" label="Dec(ek)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_rho" label="ρ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_samplentt_enc" label="SampleNTT" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_ahat_enc" label="Â" type="data" />
                                </div>

                                <div class="flex items-center gap-1.5">
                                    <GraphNode id="ec_prf" label="PRF(r,N)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_n_inc" label="N++" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_y" label="y" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_ntt" label="NTT(y)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_yhat" label="ŷ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="bg-purple-900/50 border-purple-400/50" />
                                    <div class="w-2 h-[2px] bg-slate-500"></div>
                                    <div class="flex flex-col gap-1.5">
                                        <GraphNode id="ec_e1" label="e₁" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[1.5rem] py-0.5" />
                                        <GraphNode id="ec_e2" label="e₂" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[1.5rem] py-0.5" />
                                    </div>
                                </div>

                                <div class="flex items-center gap-1.5">
                                    <GraphNode id="ec_decodem" label="Dec(m)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_decompress" label="Decomp" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="ec_mu" label="μ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="bg-yellow-900/50 border-yellow-400/50" />
                                </div>

                                <div class="w-full h-px border-t border-dashed border-slate-600 my-1"></div>

                                <div class="flex items-center gap-1.5">
                                    <div class="flex flex-col gap-2">
                                        <div class="flex items-center gap-1.5">
                                            <GraphNode id="ec_calc_u" label="û=Â^T∘ŷ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_uhat" label="û" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_invntt_u" label="Inv-NTT" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_ubar" label="ū" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_add_u" label="u=ū+e₁" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_u" label="u" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                        </div>
                                        <div class="flex items-center gap-1.5">
                                            <GraphNode id="ec_calc_v" label="v̂=t̂^T∘ŷ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_vhat" label="v̂" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_invntt_v" label="Inv-NTT" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_vbar" label="v̄" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_add_v" label="v=v̄+e₂+μ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="ec_v" label="v" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" />
                                        </div>
                                    </div>

                                    <div class="w-2 h-[2px] bg-slate-500"></div>

                                    <div class="flex items-center gap-1.5">
                                        <GraphNode id="ec_compress" label="Compress" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="ec_encode" label="Encode" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" />
                                        <div class="arrow-right"></div>
                                        <GraphNode id="ec_c" label="c" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="bg-teal-900/50 border-teal-400/50 px-3" />
                                    </div>
                                </div>
                            </div>

                            <div class="arrow-right min-w-[10px]"></div>
                            <GraphNode id="ec_c_final" label="Out c" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="output" custom-class="shadow-sm px-3" />

                        </div>
                    </div>
                </div>

                <div class="flex flex-col items-center justify-center py-1">
                    <div class="bg-teal-900/50 text-teal-300 font-bold px-3 py-1 text-[11px] rounded shadow-sm border border-teal-500/50">Network: c (Ciphertext)</div>
                    <div class="w-[2px] h-6 bg-slate-500 mt-1 relative rounded-full">
                        <div class="absolute -bottom-1 -left-[4px] border-t-[6px] border-l-[5px] border-r-[5px] border-t-slate-500 border-l-transparent border-r-transparent"></div>
                    </div>
                </div>

                <div class="flex flex-col relative border-2 border-purple-500 rounded-xl px-4 py-5 bg-slate-800 shadow-lg w-fit mt-1">
                    <div class="absolute -top-3 left-4 bg-purple-600 text-white font-bold py-1 px-3 rounded-full shadow-lg text-[12px] border border-purple-400">[21] ML-KEM.Decaps (Alice)</div>

                    <div class="flex items-center gap-2 mt-1 overflow-x-visible custom-scrollbar">

                        <div class="flex flex-col gap-2">
                            <GraphNode id="dc_dk" label="Recv dk" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="input" custom-class="border-dashed border-indigo-400/50 py-0.5 text-[10px]" />
                            <GraphNode id="dc_c" label="Recv c" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="input" custom-class="border-dashed border-teal-400/50 py-0.5 text-[10px]" />
                        </div>

                        <div class="arrow-right min-w-[8px]"></div>
                        <GraphNode id="dc_internal" label="Start" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="hints" />
                        <div class="arrow-right min-w-[8px]"></div>

                        <div class="flex flex-col gap-2 border-2 border-purple-500/50 bg-purple-900/20 rounded-lg p-3 shadow-inner relative whitespace-nowrap">
                            <div class="absolute -top-2.5 left-3 bg-purple-700 text-purple-200 font-bold px-2 text-[10px] rounded-md">[18] Decaps_internal</div>

                            <div class="flex items-center gap-2 mt-1">
                                <GraphNode id="dc_split" label="Split(dk)" badge="fo,contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" />
                                <div class="w-2 h-[2px] bg-slate-500"></div>
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex gap-1.5">
                                        <GraphNode id="dc_dkpke" label="dk_PKE" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="px-1.5 py-0.5 text-[10px]" />
                                        <GraphNode id="dc_ekpke" label="ek_PKE" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="px-1.5 py-0.5 text-[10px]" />
                                    </div>
                                    <div class="flex gap-1.5">
                                        <GraphNode id="dc_h" label="h" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="min-w-[1.5rem] py-0.5 text-[10px]" />
                                        <GraphNode id="dc_z" label="z" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="min-w-[1.5rem] py-0.5 text-[10px]" />
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2 border-2 border-blue-500/50 bg-slate-800 rounded-lg p-3 relative shadow mt-1">
                                <div class="absolute -top-2.5 left-3 bg-blue-700 text-blue-200 font-bold px-2 text-[10px] rounded-md">[15] K-PKE.Decrypt</div>

                                <div class="flex items-center gap-1.5 mt-1">
                                    <GraphNode id="dc_dkpke_kpke" label="dk_PKE" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="opacity-60 text-[10px] px-1.5 py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_decode_sk" label="Decode" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_shat" label="ŝ" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="bg-indigo-900/50 border-indigo-400/50 py-0.5" />
                                </div>

                                <div class="flex items-center gap-1.5">
                                    <GraphNode id="dc_c_kpke" label="c" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="opacity-60 text-[10px] px-1.5 py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_csplit" label="Split(c)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                    <div class="w-2 h-[2px] bg-slate-500"></div>
                                    <div class="flex flex-col gap-1.5">
                                        <div class="flex items-center gap-1.5">
                                            <GraphNode id="dc_decode" label="Dec(u)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="dc_decompress_u" label="Decomp" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="dc_up" label="u'" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="py-0.5" />
                                        </div>
                                        <div class="flex items-center gap-1.5">
                                            <GraphNode id="dc_decode_v" label="Dec(v)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="dc_decompress_v" label="Decomp" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                            <div class="arrow-right"></div>
                                            <GraphNode id="dc_vp" label="v'" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="py-0.5" />
                                        </div>
                                    </div>
                                </div>

                                <div class="w-full h-px border-t border-dashed border-slate-600 my-0.5"></div>

                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <GraphNode id="dc_ntt_u" label="NTT(u')" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_uhatp" label="û'" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[1.5rem] py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_calc_phat" label="p̂=ŝ^T∘û'" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_inv_ntt" label="Inv-NTT(p̂)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_p" label="p" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[1.5rem] py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_calc_w" label="w=v'-p (≈μ)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_compress" label="Compress" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_encode" label="Encode" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="process" custom-class="text-[10px] px-1.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_mp" label="m'" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="bg-yellow-900/50 border-yellow-400/50 py-0.5" />
                                </div>
                            </div>

                            <div class="flex items-center gap-1.5 mt-1">
                                <div class="flex flex-col gap-1.5">
                                    <GraphNode id="dc_mp_kem" label="m'" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[2rem] py-0.5" />
                                    <GraphNode id="dc_h_kem" label="h" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="data" custom-class="min-w-[2rem] py-0.5" />
                                </div>
                                <div class="arrow-right"></div>
                                <GraphNode id="dc_concat_mph" label="Concat(m',h)" badge="contributory" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" />
                                <div class="arrow-right"></div>
                                <GraphNode id="dc_g" label="G(m'||h) -> (K',r')" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" />
                                <div class="w-2 h-[2px] bg-slate-500"></div>
                                <div class="flex flex-col gap-1.5">
                                    <GraphNode id="dc_rp" label="r'" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="min-w-[2rem] py-0.5" />
                                    <GraphNode id="dc_kp" label="K'" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="min-w-[2rem] border-blue-400 bg-blue-900/50 py-0.5" />
                                </div>
                            </div>

                            <div class="flex items-stretch gap-3 mt-1">
                                <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-600 rounded-lg p-2.5 shadow-inner flex-1">
                                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16 text-center">Re-encrypt<br>(FO)</span>
                                    <div class="w-px h-full bg-slate-600"></div>
                                    <GraphNode id="dc_encrypt" label="K-PKE.Enc(ek,m',r')" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_cp" label="c'" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="bg-teal-900/50 border-teal-400/50 py-0.5 px-1.5 text-[10px]" />
                                </div>

                                <div class="flex items-center gap-1.5 bg-slate-800 border border-slate-600 rounded-lg p-2.5 shadow-inner flex-1">
                                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 w-16 text-center">Implicit Rej.<br>(FO)</span>
                                    <div class="w-px h-full bg-slate-600"></div>
                                    <div class="flex flex-col gap-1">
                                        <GraphNode id="dc_z_kem" label="z" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="min-w-[1.5rem] py-0.5 text-[10px]" />
                                        <GraphNode id="dc_c_kem" label="c" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="min-w-[1.5rem] py-0.5 text-[10px]" />
                                    </div>
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_concat_zc" label="Concat(z,c)" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_j" label="J(z||c)" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="process" custom-class="text-[10px] px-1.5 py-0.5" />
                                    <div class="arrow-right"></div>
                                    <GraphNode id="dc_kbar" label="K̄" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="data" custom-class="border-red-400 bg-red-900/50 py-0.5 text-[10px]" />
                                </div>
                            </div>

                            <div class="flex items-center gap-3 mt-1 bg-yellow-900/20 p-2.5 rounded-lg border border-yellow-500/50 shadow-sm">
                                <GraphNode id="dc_cmp" label="c == c' ?" badge="fo" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" @badge-click="(t: string, nId: string) => $emit('badge-click', t, nId)" type="hints" custom-class="border-yellow-400 bg-yellow-900/50 py-1.5 px-4 text-[12px]" />

                                <div class="flex flex-col gap-2 justify-center border-l-2 border-yellow-500/50 pl-4 h-full">
                                    <div class="flex items-center gap-2 text-green-400 font-bold text-xs">
                                        <span class="w-8">YES &rarr;</span>
                                        <GraphNode id="dc_k_final" label="Out Final K (K')" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="output" custom-class="shadow-sm py-0.5 text-[11px] px-2" />
                                    </div>
                                    <div class="flex items-center gap-2 text-red-400 font-bold text-xs">
                                        <span class="w-8">NO &rarr;</span>
                                        <GraphNode id="dc_k_final" label="Out Final K (K̄)" :highlight-id="highlightId" @node-click="$emit('node-click', $event)" type="output" custom-class="border-red-400 bg-red-900/50 shadow-sm opacity-80 py-0.5 text-[11px] px-2" />
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GraphNode from './GraphNode.vue';

defineProps(['highlightId']);
defineEmits(['node-click', 'badge-click']);

const zoomLevel = ref(1.0);
</script>

/* ================= app: shell, overview, method ================= */
const T=s=>String(s).replace(/"/g,'&quot;');
const TABS=[['overview','Dashboard'],['types','Customer types'],['eda','Explore the data'],['q1','Q1 Churn'],['q2','Q2 Prime'],['q3','Q3 Value'],['q4','Q4 Cashback'],['q5','Q5 Offers'],['test','Pilot planner'],['play','Playbook'],['method','How we did it']];
let CUR='overview';const REND={};
const HEAVYSEG=i=>D.seg[i]<=1;
function shell(){
 $('nav').innerHTML=TABS.map(t=>`<button data-t="${t[0]}">${t[1]}</button>`).join('');
 $('nav').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.t)};
 const opt=(names,all)=>`<option value="-1">${all}</option>`+names.map((n,i)=>`<option value="${i}">${n}</option>`).join('');
 $('.fbar').innerHTML=`<span class="pill">Focus on</span>
 <label>Prime <select id="f-prime"><option value="-1">All</option><option value="1">Prime members</option><option value="0">Non-Prime</option></select></label>
 <label>City tier <select id="f-tier">${opt(TIERN,'All')}</select></label>
 <label>Gender <select id="f-gender">${opt(GENN,'All')}</select></label>
 <label>Age <select id="f-age">${opt(AGEN,'All')}</select></label>
 <label>Time with us <select id="f-life">${opt(LIFEN,'All')}</select></label>
 <label>Customer type <select id="f-seg">${opt(SEGN,'All')}</select></label>
 <button class="btn alt" id="f-reset">Reset</button><span id="f-view" class="tag" style="background:#2e7d5b">Showing everyone</span><span id="f-count" class="small" style="margin-left:auto"></span>`;
 const map={'f-prime':'prime','f-tier':'tier','f-gender':'gender','f-age':'age','f-life':'life','f-seg':'seg'};
 $('.fbar').onchange=e=>{const k=map[e.target.id];if(k){F[k]=+e.target.value;onChange()}};
 $('#f-reset').onclick=()=>{Object.keys(F).forEach(k=>F[k]=-1);$$('.fbar select').forEach(s=>s.value=-1);onChange()};
 TABS.forEach(t=>{const s=document.createElement('section');s.className='tab';s.id='t-'+t[0];$('main').appendChild(s)});

 let h='';try{h=location.hash.slice(1)}catch(e){}go(h||'overview')}
function viewLabel(){const def=Object.values(F).every(v=>v<0)&&A.rP===A0.rP&&A.rN===A0.rN&&A.rPart===A0.rPart&&A.mAmz===A0.mAmz&&A.mPart===A0.mPart&&A.elig===A0.elig;const e=$('#f-view');if(!e)return;e.textContent=def?'Showing everyone · base assumptions':'Custom view: numbers may differ from the deck';e.style.background=def?'#2e7d5b':'#C45500'}
function go(t){if(!REND[t])t='overview';CUR=t;try{history.replaceState(null,'','#'+t)}catch(e){}$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$$('.tab').forEach(s=>s.classList.toggle('on',s.id==='t-'+t));draw(t);scrollTo({top:0})}
function draw(t){IDX=['q4','q5','test'].includes(t)?idxNoSeg():idxAll();$('#f-count').textContent=`${fmt.n(IDX.length)} of ${fmt.n(N)} customers`;viewLabel();if(IDX.length<60){$('#t-'+t).innerHTML=`<div class="card org" style="margin-top:10px"><h2>Too few customers in this view</h2><p>Only ${IDX.length} customers match these filters, too few for reliable numbers. Widen the Focus on bar or press Reset.</p></div>`;return}REND[t]($('#t-'+t))}
function onChange(){draw(CUR)}
const head=(q,title,lead)=>`<div class="ask">${q?`<div class="q">${q}</div>`:''}<div><h1>${title}</h1><p class="lead">${lead}</p></div></div>`;
const tryit=t=>`<div class="tryit"><b>Try this:</b> ${t}</div>`;
const ins=a=>`<ul class="ins">${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
const kpi=(l,v,d,c,sm)=>`<div class="card kpi" ${c?`style="border-top-color:${c}"`:''}><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d||''}</div></div>`;
const ok=x=>Number.isFinite(x);
/* shared metrics */
function heavyStats(idx){const H=idx.filter(HEAVYSEG);const cH=sum(g(D.cost,H)),cA=sum(g(D.cost,idx)),sH=sum(g(D.spend,H)),eH=sum(g(D.earned,H)),eA=sum(g(D.earned,idx));return{H,n:H.length,cH,cA,sH,eH,eA,share:cA?cH/cA:NaN,shareE:eA?eH/eA:NaN,c:sH?cH/sH*100:NaN}}
function primePremium(idx){const P=idx.filter(i=>D.prime[i]),Nn=idx.filter(i=>!D.prime[i]);if(!P.length||!Nn.length)return{P,Nn,prem:NaN};const a=mean(g(D.cost,P)),b=mean(g(D.cost,Nn));return{P,Nn,a,b,prem:a/b-1}}
const pctOr=(x,d=1)=>ok(x)?fmt.pct(x,d):'n/a';
/* ================= METHOD ================= */
let STEP=0;
function stepData(){const idx=IDX,st=stats(idx),hv=heavyStats(idx),r=rates();
 const tr=TRAITS.map(t=>chiTable(qcut(t[2],idx,5,lf)).p),sig=tr.filter(p=>p<.05).length;
 return[
 {t:'Frame the problem',s:'Five questions, one yardstick',did:'We turned the brief into five clear questions and agreed one yardstick for every answer: profit per customer after cashback is paid.',
  found:[`Cashback costs about <b>₹${(st.cost/st.spendSum*100).toFixed(2)}</b> for every ₹100 customers spend (estimated).`,`Customers who left are <b>${pctOr(st.churn)}</b> of the base.`],
  asm:[['We judge offers by money, not by churn alone','Churn cannot be predicted from this data (Q1), so it is a poor steering wheel.']],chk:['Each question has a clear rule for what would change our recommendation']},
 {t:'Check the data',s:'5,000 customers, 14 facts each',did:'We checked that the file is complete, clean and sensible before trusting a single number.',
  found:[`<b>${fmt.n(N)}</b> customers, none missing, none repeated.`,`The four customer types are almost equal in size (${fmt.n(Math.min(...SEGN.map((_,j)=>idxAll().filter(i=>D.seg[i]===j).length)))} to ${fmt.n(Math.max(...SEGN.map((_,j)=>idxAll().filter(i=>D.seg[i]===j).length)))} customers).`],
  asm:[['Each row is one customer at one point in time','The file has no dates, so we describe differences between customers, not changes over time.'],['Monthly spend = payments per month × average payment size','Spend is not given directly; this is the only way to build it from the data.']],
  chk:['No blank cells in any of the 14 columns','No repeated customer IDs (200000 to 204999)','Every value sits in a sensible range (age 18 to 64, cashback used 0 to 100%)','Churn flag holds only 0 or 1']},
 {t:'Build simple measures',s:'Plain labels for each customer',did:'We turned raw columns into labels a manager can read: customer type (by cashback use and activity), payment style, and a happiness versus activity check.',
  found:[`Real engagers: <b>${fmt.n(idxAll().filter(i=>D.seg[i]===0).length)}</b>; deal-seekers: <b>${fmt.n(idxAll().filter(i=>D.seg[i]===1).length)}</b>.`,`Heavy cashback users number <b>${fmt.n(hv.n)}</b>.`],
  asm:[['Heavy cashback use = at or above the median (49% of earned cashback used)','A median split gives balanced groups that are big enough to compare.'],['Active = the average of how a customer ranks on app activity and on payments, 0.5 or higher','Ranking puts two very different scales on the same footing.']],
  chk:['Every customer falls in exactly one type','Group sizes stay within 1,230 to 1,270']},
 {t:'Test each question',s:'Is it real or just luck?',did:'For every pattern we asked whether luck alone could produce it: ranges of uncertainty, shuffle tests, and two kinds of prediction model.',
  found:[`<b>${sig} of ${TRAITS.length}</b> traits show a pattern in churn (about 1 would appear by luck).`,`None of four prediction models beat a coin flip.`],
  asm:[['Five equal groups per trait','Splitting into fifths shows whether churn rises or falls across the whole range.']],
  chk:['Shuffle test: scramble who left and see if the same pattern appears','Two model families, each tested on customers it had never seen','Size of difference reported with its range, not as a single number']},
 {t:'Model the cashback bill',s:'What each customer costs',did:'We estimated each customer’s cashback cost: spend × reward rate × the share of cashback actually used.',
  found:[`Prime reward rate <b>${fmt.pct(r.P,2)}</b> vs <b>${fmt.pct(r.N,2)}</b> for non-Prime.`,`Heavy users cost <b>₹${hv.c.toFixed(2)}</b> per ₹100 spent.`],
  asm:[['Reward rates: Prime 5%, non-Prime 3% on Amazon.in; 1% elsewhere','The file has no rates, so we follow the Amazon Pay rate guide used in the case.'],['40% of spend on Amazon.in, 30% at partners, 30% elsewhere','The file has no merchant split; this is a neutral starting mix.'],['85% of Amazon.in spend earns the full rate','Not every item qualifies for the headline rate.']],
  chk:['Five scenarios from cautious to generous; Prime costs more in all of them (+28% to +51%)','Rupee values move with assumptions, rankings do not']},
 {t:'Simulate and pilot',s:'How much can we afford to lose?',did:'We worked out how much spending a cashback cut can lose before the saving disappears, then designed a controlled test so real customers give the real answer.',
  found:[`A 25% cut breaks even if heavy users keep at least <b>${pctOr(1-(hv.c*.25)/(2.5-hv.c*.75),0)}</b> of their spending.`,`The pilot needs a money-based yardstick because churn needs about 23,700 customers per group.`],
  asm:[['Amazon Pay earns ₹2.50 on every ₹100 spent','A placeholder; replace with the real margin before decisions.'],['30% of savings could be reinvested in milestone rewards','A starting point for Offer B.']],
  chk:['Every dashboard number was cross-checked against a separate Python calculation','The decision rule includes safety checks on satisfaction and complaints']}]}
REND.method=el=>{const SD=stepData(),s=SD[STEP],idx=IDX,hv=heavyStats(idx),r=rates();
 const cnt=j=>idx.filter(i=>D.seg[i]===j).length;
 const heavyN=cnt(0)+cnt(1),lightN=cnt(2)+cnt(3);
 el.innerHTML=head('','How we did it','From raw data to a recommendation in six steps. Every number on this page is live.')+tryit('click any numbered step to see what we did, what we found, the assumptions we made and why, and the checks we ran.')+
 `<div class="flow">${SD.map((x,i)=>`<div class="step ${i===STEP?'on':''}" data-i="${i}"><div class="t"><span class="n">${i+1}</span>${x.t}</div><div class="s">${x.s}</div></div>`).join('')}</div>
 <div class="grid g4" style="margin-bottom:12px"><div class="card org blk"><h3>What we did</h3><p style="margin:0">${s.did}</p></div><div class="card blk"><h3>What we found</h3>${ins(s.found)}</div><div class="card blk"><h3>Assumptions and why</h3>${s.asm.map(a=>`<p style="margin:0 0 6px"><b>${a[0]}.</b><br><span class="small">${a[1]}</span></p>`).join('')}</div><div class="card blk"><h3>Checks we ran</h3><ul class="chk">${s.chk.map(c=>`<li>${c}</li>`).join('')}</ul></div></div>
 <div class="grid g2"><div class="card"><h2>Flow 1: how every customer gets a type and a plan</h2><p class="small">Counts follow your Focus on bar.</p>
 <div class="fc"><div class="nd"><b>${fmt.n(idx.length)}</b>customers</div><span class="ar">➜</span><div class="nd w"><small>Uses a lot of cashback?</small><b>Yes ${fmt.n(heavyN)} · No ${fmt.n(lightN)}</b></div><span class="ar">➜</span><div class="nd w"><small>Active in app and payments?</small><b>Yes / No</b></div></div>
 <div class="grid g2" style="margin-top:6px">${[[0,'Protect','keep the rate, add perks'],[1,'Test','Offer A and Offer B'],[2,'Recognise','non-cash perks'],[3,'Activate','low-cost nudges']].map(([j,a,d])=>`<div class="nd" style="background:${SEGC[j]};color:${j===0||j===3?'#111':'#fff'};text-align:left"><small style="color:inherit;opacity:.85">${j<2?'Heavy cashback':'Light cashback'} · ${j===0||j===2?'More active':'Less active'}</small><b style="color:inherit">${SEGN[j]} · ${fmt.n(cnt(j))}</b><small style="color:inherit">${a}: ${d}</small></div>`).join('')}</div></div>
 <div class="card"><h2>Flow 2: how we estimate the cashback bill</h2><p class="small">Values per ₹100 of spend, for the customers in view.</p>
 <div class="fc"><div class="nd"><b>₹100</b>spent</div><span class="ar">➜</span><div class="nd w"><small>Share earning rewards</small><b>${fmt.pct(A.mAmz*A.elig+A.mPart+Math.max(0,1-A.mAmz-A.mPart),0)}</b></div><span class="ar">➜</span><div class="nd o"><small>× reward rate</small><b>₹${(sum(g(D.earned,idx))/Math.max(1,sum(g(D.spend,idx)))*100).toFixed(2)}</b>earned</div><span class="ar">➜</span><div class="nd t"><small>× share used</small><b>₹${(sum(g(D.cost,idx))/Math.max(1,sum(g(D.spend,idx)))*100).toFixed(2)}</b>paid out</div></div>
 <p class="small">Prime rate ${fmt.pct(r.P,2)} · non-Prime ${fmt.pct(r.N,2)}. Change the assumptions on the Q2 tab and this chain updates.</p></div></div>
 <div class="grid g2" style="margin-top:12px"><div class="card"><h2>Flow 3: how the pilot test will run</h2>
 <div class="fc"><div class="nd"><b>${fmt.n(hv.n)}</b>heavy users</div><span class="ar">➜</span><div class="nd w"><small>Random split</small><b>3 equal groups</b></div><span class="ar">➜</span><div style="display:grid;gap:4px"><div class="nd w">Control: no change</div><div class="nd o">A: 25% lower rate</div><div class="nd t">B: reward after milestones</div></div><span class="ar">➜</span><div class="nd"><small>8–12 weeks</small><b>Decide</b>roll out, adjust or stop</div></div></div>
 <div class="card"><h2>Try it: how customer types are drawn</h2><p class="small">Move the two cut-offs and watch the groups change. Other tabs keep the standard cut-offs.</p><div class="sl"><span>Cashback use cut-off</span><input type="range" id="m-cb" min="10" max="90" value="${Math.round(MED_CB)}"><b id="m-cbv"></b></div><div class="sl"><span>Activity cut-off</span><input type="range" id="m-en" min="20" max="80" value="50"><b id="m-env"></b></div><div id="m-grid"></div></div></div>
 <div class="card" style="margin-top:12px"><h2>Assumption register</h2><p class="small">Everything we had to assume because the data does not say. The last column tells you where to test it.</p><div class="tw"><table><tr><th>Assumption</th><th class="l">Value used</th><th class="l">Why</th><th class="l">What if it is wrong?</th></tr>
 ${[['Reward rates','Prime 5% / non-Prime 3% on Amazon.in, 1% elsewhere','Case rate guide; not in the file','Rupee figures move; rankings hold. Test on Q2'],['Spend mix','40% Amazon.in, 30% partners, 30% other','No merchant split in the file','Same as above. Test on Q2'],['Eligible share','85% of Amazon.in spend','Not every item earns the full rate','Same as above. Test on Q2'],['Income per ₹100','₹2.50','Placeholder margin','Break-even point shifts. Test on Q5'],['Reinvested savings','30%','Starting point for Offer B','Offer B result shifts. Test on Q5'],['Value stand-in','Monthly spend','No lifetime data in the file','Groups ranked by spend, not by lifetime profit'],['One snapshot','Each customer seen once','File has no dates','We show differences, the pilot shows causes']].map(r=>`<tr><td class="b">${r[0]}</td><td class="l">${r[1]}</td><td class="l">${r[2]}</td><td class="l">${r[3]}</td></tr>`).join('')}</table></div></div>`;
 el.onclick=e=>{const st=e.target.closest('.step');if(st){STEP=+st.dataset.i;REND.method(el)}};
 const upd=()=>{const cb=+$('#m-cb',el).value,en=+$('#m-en',el).value/100;$('#m-cbv',el).textContent=cb+'%';$('#m-env',el).textContent=en.toFixed(2);
  const cells=[[1,1,0],[1,0,1],[0,1,2],[0,0,3]].map(([hc,he,j])=>{const ii=IDX.filter(i=>(D.cb[i]>=cb)===!!hc&&(D.engIdx[i]>=en)===!!he);return{j,n:ii.length,ch:ii.length?mean(g(D.churn,ii)):NaN}});
  const bx=c=>`<div style="background:${SEGC[c.j]};color:${c.j===0||c.j===3?'#111':'#fff'};border-radius:9px;padding:6px 9px"><b style="font-size:12px">${SEGN[c.j]}</b><div style="font-size:18px;font-weight:800">${fmt.n(c.n)}</div><div style="font-size:11px">churn ${pctOr(c.ch)}</div></div>`;
  $('#m-grid',el).innerHTML=`<div style="display:grid;grid-template-columns:62px 1fr 1fr;gap:5px;margin-top:6px;text-align:center"><div></div><b class="small">Less active</b><b class="small">More active</b><b class="small" style="align-self:center">Heavy use</b>${bx(cells[1])}${bx(cells[0])}<b class="small" style="align-self:center">Light use</b>${bx(cells[3])}${bx(cells[2])}</div>`};
 $('#m-cb',el).oninput=upd;$('#m-en',el).oninput=upd;upd()};

'use strict';
/* ---------- tiny helpers ---------- */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const C={nav:'#232F3E',dk:'#131A22',org:'#FF9900',ord:'#C45500',bl:'#146EB4',tl:'#007185',mu:'#565959',red:'#B12704',grn:'#067D62',gry:'#8D99A5'};
const fmt={pct:(x,d=1)=>(x*100).toFixed(d)+'%',n:x=>Math.round(x).toLocaleString('en-IN'),
 inr:x=>'₹'+Math.round(x).toLocaleString('en-IN'),
 cr:x=>{const a=Math.abs(x);return a>=1e7?'₹'+(x/1e7).toFixed(2)+' cr':a>=1e5?'₹'+(x/1e5).toFixed(2)+' lakh':'₹'+Math.round(x).toLocaleString('en-IN')},
 f:(x,d=1)=>Number(x).toFixed(d), sg:(x,d=1)=>(x>=0?'+':'')+x.toFixed(d)};
const sum=a=>{let s=0;for(const v of a)s+=v;return s}, mean=a=>a.length?sum(a)/a.length:NaN;
const sd=a=>{const m=mean(a);let s=0;for(const v of a)s+=(v-m)*(v-m);return Math.sqrt(s/(a.length-1))};
/* normal cdf / inverse, gamma for chi-square */
function ncdf(z){const t=1/(1+.2316419*Math.abs(z)),d=.3989423*Math.exp(-z*z/2);let p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p}
function nppf(p){const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-.007784894002430293,-.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[.007784695709041462,.3224671290700398,2.445134137142996,3.754408661907416];
 const pl=.02425;let q,r;if(p<pl){q=Math.sqrt(-2*Math.log(p));return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
 if(p>1-pl){q=Math.sqrt(-2*Math.log(1-p));return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}
 q=p-.5;r=q*q;return(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)}
function lgam(x){const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,.1208650973866179e-2,-.5395239384953e-5];let y=x,t=x+5.5;t-=(x+.5)*Math.log(t);let s=1.000000000190015;for(const k of c)s+=k/++y;return-t+Math.log(2.5066282746310005*s/x)}
function gammaQ(a,x){if(x<=0)return 1;if(x<a+1){let ap=a,del=1/a,s=del;for(let n=0;n<300;n++){ap++;del*=x/ap;s+=del;if(Math.abs(del)<Math.abs(s)*1e-12)break}return 1-s*Math.exp(-x+a*Math.log(x)-lgam(a))}
 let b=x+1-a,c=1e300,d=1/b,h=d;for(let i=1;i<300;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-12)break}return Math.exp(-x+a*Math.log(x)-lgam(a))*h}
const chiP=(chi,df)=>gammaQ(df/2,chi/2);
function wilson(k,n,z=1.96){if(!n)return[0,0];const p=k/n,d=1+z*z/n,c=p+z*z/(2*n),w=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n));return[(c-w)/d,(c+w)/d]}
function quant(sorted,q){const p=(sorted.length-1)*q,i=Math.floor(p),f=p-i;return i+1<sorted.length?sorted[i]*(1-f)+sorted[i+1]*f:sorted[i]}
function pctRank(a){const n=a.length,o=a.map((v,i)=>i).sort((x,y)=>a[x]-a[y]),r=new Float64Array(n);let i=0;while(i<n){let j=i;while(j+1<n&&a[o[j+1]]===a[o[i]])j++;const avg=(i+j)/2+1;for(let k=i;k<=j;k++)r[o[k]]=avg/n;i=j+1}return r}
/* sample size per arm to detect p1->p2 (two-sided) */
function nPerArm(p1,p2,alpha=.05,power=.8){const za=nppf(1-alpha/2),zb=nppf(power),pb=(p1+p2)/2;return Math.pow(za*Math.sqrt(2*pb*(1-pb))+zb*Math.sqrt(p1*(1-p1)+p2*(1-p2)),2)/Math.pow(p1-p2,2)}
/* ---------- tooltip ---------- */
const tip=document.createElement('div');tip.id='tip';document.body.appendChild(tip);
document.addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('[data-tip]');if(!t){tip.style.display='none';return}tip.innerHTML=t.getAttribute('data-tip');tip.style.display='block';const w=tip.offsetWidth;tip.style.left=Math.min(e.clientX+14,innerWidth-w-8)+'px';tip.style.top=(e.clientY+16)+'px'});
/* ---------- raw data -> typed arrays + derived ---------- */
const ROWS=window.__ROWS__,N=ROWS.length;
const col=i=>Float64Array.from(ROWS,r=>r[i]);
const D={age:col(0),gender:col(1),tier:col(2),income:col(3),tenure:col(4),prime:col(5),txn:col(6),ticket:col(7),cb:col(8),eng:col(9),sup:col(10),nps:col(11),churn:col(12)};
D.spend=Float64Array.from(ROWS,r=>r[6]*r[7]);
D.engIdx=(()=>{const a=pctRank(D.eng),b=pctRank(D.txn);return Float64Array.from(a,(v,i)=>(v+b[i])/2)})();
D.pull=Float64Array.from(ROWS,r=>r[8]/100*r[6]);
const MED=a=>quant(Float64Array.from(a).sort(),.5);
const MED_CB=MED(D.cb),MED_TXN=MED(D.txn),MED_TKT=MED(D.ticket);
const SEGN=['Real engager','Deal-seeker','Organic loyalist','Passive'],STYN=['Frequent big spenders','Frequent small payers','Occasional big-ticket','Light users'],LIFEN=['New (<1y)','Growing (1-3y)','Mature (3y+)'],AGEN=['18-25','26-35','36-50','51-64'],NPSN=['Unlikely to recommend','Neutral','Likely to recommend'],SAYN=['Balanced','Active but unhappy','Happy but idle'],TIERN=['Tier 1','Tier 2','Tier 3'],GENN=['Male','Female','Other'];
D.seg=new Uint8Array(N);D.sty=new Uint8Array(N);D.life=new Uint8Array(N);D.ageb=new Uint8Array(N);D.npsg=new Uint8Array(N);D.say=new Uint8Array(N);
for(let i=0;i<N;i++){const hc=D.cb[i]>=MED_CB,he=D.engIdx[i]>=.5;D.seg[i]=hc&&he?0:hc?1:he?2:3;
 const ft=D.txn[i]>MED_TXN,bt=D.ticket[i]>MED_TKT;D.sty[i]=ft&&bt?0:ft?1:bt?2:3;
 D.life[i]=D.tenure[i]<=12?0:D.tenure[i]<=36?1:2;D.ageb[i]=D.age[i]<=25?0:D.age[i]<=35?1:D.age[i]<=50?2:3;
 D.npsg[i]=D.nps[i]<=-33?0:D.nps[i]<=33?1:2;D.say[i]=D.npsg[i]===0&&he?1:D.npsg[i]===2&&!he?2:0}
/* ---------- assumptions (cost model) ---------- */
const A0={rP:.05,rN:.03,rPart:.01,rOth:.01,mAmz:.40,mPart:.30,elig:.85};
const A={...A0};
function rates(a=A){const mO=Math.max(0,1-a.mAmz-a.mPart);const base=a.mPart*a.rPart+mO*a.rOth;return{P:a.mAmz*a.elig*a.rP+base,N:a.mAmz*a.elig*a.rN+base}}
D.rate=new Float64Array(N);D.earned=new Float64Array(N);D.cost=new Float64Array(N);
function recost(){const r=rates();for(let i=0;i<N;i++){D.rate[i]=D.prime[i]?r.P:r.N;D.earned[i]=D.spend[i]*D.rate[i];D.cost[i]=D.earned[i]*D.cb[i]/100}}
recost();
/* ---------- filters ---------- */
const F={prime:-1,tier:-1,gender:-1,age:-1,life:-1,seg:-1};
let IDX=[];
function refilter(ignorePrime=false,ignoreSeg=false){const o=[];for(let i=0;i<N;i++){if(!ignorePrime&&F.prime>=0&&D.prime[i]!==F.prime)continue;if(F.tier>=0&&D.tier[i]!==F.tier+1)continue;if(F.gender>=0&&D.gender[i]!==F.gender)continue;if(F.age>=0&&D.ageb[i]!==F.age)continue;if(F.life>=0&&D.life[i]!==F.life)continue;if(!ignoreSeg&&F.seg>=0&&D.seg[i]!==F.seg)continue;o.push(i)}return o}
const idxAll=()=>refilter(false), idxNoPrime=()=>refilter(true), idxNoSeg=()=>refilter(false,true);
const g=(arr,idx)=>idx.map(i=>arr[i]);
/* ---------- qcut (pandas-style) ---------- */
function qcut(vals,idx,k=5,labelFmt=x=>fmt.f(x,x%1?1:0)){const s=Float64Array.from(idx,i=>vals[i]).sort();let e=[];for(let j=0;j<=k;j++)e.push(quant(s,j/k));e=e.filter((v,i)=>i===0||v>e[i-1]);const m=e.length-1;
 const bins=Array.from({length:m},(_,j)=>({lo:e[j],hi:e[j+1],n:0,k:0,idx:[],label:(j===0?'':'>')+labelFmt(e[j])+(j===0?'–':'–')+labelFmt(e[j+1])}));
 for(const i of idx){const v=vals[i];let j=0;while(j<m-1&&v>e[j+1])j++;const b=bins[j];b.n++;b.k+=D.churn[i];b.idx.push(i)}
 for(const b of bins){b.p=b.n?b.k/b.n:0;[b.lo95,b.hi95]=wilson(b.k,b.n)}return bins}
function chiTable(bins){const K=sum(bins.map(b=>b.k)),Nn=sum(bins.map(b=>b.n)),p=K/Nn;let chi=0;for(const b of bins){const e1=b.n*p,e0=b.n*(1-p);if(e1>0)chi+=(b.k-e1)**2/e1;if(e0>0)chi+=((b.n-b.k)-e0)**2/e0}return{chi,df:bins.length-1,p:chiP(chi,bins.length-1)}}
/* ---------- grouping / aggregation ---------- */
function groupBy(idx,key,names){const gs=names.map((nm,j)=>({name:nm,j,idx:[]}));for(const i of idx)gs[key[i]-(key===D.tier?1:0)].idx.push(i);return gs.filter(x=>x.idx.length)}
function stats(idx){const n=idx.length;const sp=g(D.spend,idx),m=mean(sp),se=n>1?sd(sp)/Math.sqrt(n):0;let k=0,cs=0,ear=0,nps=0;for(const i of idx){k+=D.churn[i];cs+=D.cost[i];ear+=D.earned[i];nps+=D.nps[i]}return{n,spend:m,se,spendSum:sum(sp),churn:n?k/n:NaN,cost:cs,earned:ear,nps:nps/n}}
/* ---------- SVG chart toolkit ---------- */
function nice(max,t=5){if(max<=0)return{max:1,step:.2};const raw=max/t,mag=Math.pow(10,Math.floor(Math.log10(raw))),r=raw/mag,st=(r<=1?1:r<=2?2:r<=2.5?2.5:r<=5?5:10)*mag;return{max:Math.ceil(max/st)*st,step:st}}
function svgWrap(w,h,inner){return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" style="max-height:${h}px;display:block">${inner}</svg>`}
function barChart(o){const W=o.w||600,H=o.h||240,m={l:46,r:o.ref!=null&&o.refLabel?78:14,t:18,b:o.bot||58},iw=W-m.l-m.r,ih=H-m.t-m.b,items=o.items;
 const hi=Math.max(...items.map(d=>d.hi??d.v),o.ref??0,o.minMax||0);const sc=nice(hi*1.08);const lo=o.min||0;const y=v=>m.t+ih-(v-lo)/(sc.max-lo)*ih;
 let s='';for(let v=lo;v<=sc.max+1e-9;v+=sc.step){s+=`<line class="gr" x1="${m.l}" x2="${W-m.r}" y1="${y(v)}" y2="${y(v)}"/><text class="mu" x="${m.l-6}" y="${y(v)+4}" text-anchor="end" font-size="11">${o.yf?o.yf(v):v}</text>`}
 const bw=iw/items.length;items.forEach((d,i)=>{const x=m.l+i*bw+bw*.17,w=bw*.66,yt=y(d.v),col=d.c||C.org;
  s+=`<rect class="bar" ${d.attr||''} data-tip="${d.tip||''}" x="${x}" y="${yt}" width="${w}" height="${Math.max(1,y(lo)-yt)}" rx="4" fill="${col}"/>`;
  if(d.lo!=null){const cx=x+w/2;s+=`<g stroke="${C.nav}" stroke-width="1.6"><line x1="${cx}" x2="${cx}" y1="${y(d.lo)}" y2="${y(d.hi)}"/><line x1="${cx-5}" x2="${cx+5}" y1="${y(d.lo)}" y2="${y(d.lo)}"/><line x1="${cx-5}" x2="${cx+5}" y1="${y(d.hi)}" y2="${y(d.hi)}"/></g>`}
  s+=`<text x="${x+w/2}" y="${(d.hi!=null?y(d.hi):yt)-5}" text-anchor="middle" font-size="11.5" font-weight="700">${d.vl??''}</text>`;
  const lab=(d.label+'').split('\n');lab.forEach((t,k)=>s+=`<text class="mu" x="${x+w/2}" y="${H-m.b+16+k*13}" text-anchor="middle" font-size="11">${t}</text>`)});
 if(o.ref!=null)s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y(o.ref)}" y2="${y(o.ref)}" stroke="${C.nav}" stroke-width="1.6" stroke-dasharray="6 4"/><text x="${W-m.r+4}" y="${y(o.ref)+4}" text-anchor="start" font-size="11" font-weight="700">${o.refLabel||''}</text>`;
 s+=`<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${y(lo)}" y2="${y(lo)}"/>`;if(o.ylab)s+=`<text class="mu" transform="translate(13 ${m.t+ih/2}) rotate(-90)" text-anchor="middle" font-size="11">${o.ylab}</text>`;return svgWrap(W,H,s)}
function hbarChart(o){const W=o.w||600,rowH=o.rowH||24,items=o.items,m={l:o.ml||150,r:70,t:8,b:22},H=m.t+m.b+rowH*items.length,iw=W-m.l-m.r;const mx=Math.max(...items.map(d=>d.hi??d.v),o.minMax||0)*1.05||1;const x=v=>m.l+v/mx*iw;let s='';
 for(let k=0;k<=4;k++){const v=mx*k/4;s+=`<line class="gr" x1="${x(v)}" x2="${x(v)}" y1="${m.t}" y2="${H-m.b}"/><text class="mu" x="${x(v)}" y="${H-6}" text-anchor="middle" font-size="10.5">${o.xf?o.xf(v):v.toFixed(0)}</text>`}
 items.forEach((d,i)=>{const yy=m.t+i*rowH+4,hh=rowH-9;s+=`<text x="${m.l-8}" y="${yy+hh/2+4}" text-anchor="end" font-size="12">${d.label}</text><rect data-tip="${d.tip||''}" x="${m.l}" y="${yy}" width="${Math.max(2,x(d.v)-m.l)}" height="${hh}" rx="4" fill="${d.c||C.org}"/>`;
  if(d.lo!=null)s+=`<g stroke="${C.nav}" stroke-width="1.5"><line x1="${x(d.lo)}" x2="${x(d.hi)}" y1="${yy+hh/2}" y2="${yy+hh/2}"/><line x1="${x(d.lo)}" x2="${x(d.lo)}" y1="${yy+3}" y2="${yy+hh-3}"/><line x1="${x(d.hi)}" x2="${x(d.hi)}" y1="${yy+3}" y2="${yy+hh-3}"/></g>`;
  s+=`<text x="${x(d.hi??d.v)+6}" y="${yy+hh/2+4}" font-size="11.5" font-weight="700">${d.vl??''}</text>`});
 if(o.ref!=null)s+=`<line x1="${x(o.ref)}" x2="${x(o.ref)}" y1="${m.t}" y2="${H-m.b}" stroke="${C.nav}" stroke-width="1.6" stroke-dasharray="6 4"/>`;return svgWrap(W,H,s)}
function lineChart(o){const W=o.w||600,H=o.h||250,m={l:50,r:16,t:14,b:40},iw=W-m.l-m.r,ih=H-m.t-m.b;const xs=o.series.flatMap(s=>s.pts.map(p=>p[0])),ys=o.series.flatMap(s=>s.pts.map(p=>p[1]));
 const x0=o.x0??Math.min(...xs),x1=o.x1??Math.max(...xs);let ys0=o.y0??Math.min(0,...ys);const ymaxv=o.ymax??Math.max(...ys,o.yTop||0)*1.05;let sc=nice(ymaxv-ys0);if(ys0<0){ys0=Math.floor(ys0/sc.step)*sc.step;sc=nice(ymaxv-ys0)}let y1=ys0+sc.max;if(o.ymax!=null){y1=o.ymax}
 const X=v=>m.l+(v-x0)/(x1-x0)*iw,Y=v=>m.t+ih-(v-ys0)/(y1-ys0)*ih;let s='';
 for(let v=ys0;v<=y1+1e-9;v+=sc.step)s+=`<line class="${Math.abs(v)<1e-9&&ys0<0?'ax':'gr'}" ${Math.abs(v)<1e-9&&ys0<0?'stroke-width="2"':''} x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="mu" x="${m.l-6}" y="${Y(v)+4}" text-anchor="end" font-size="11">${o.yf?o.yf(v):v}</text>`;
 const xt=o.xticks||6;for(let k=0;k<=xt;k++){const v=x0+(x1-x0)*k/xt;s+=`<text class="mu" x="${X(v)}" y="${H-m.b+17}" text-anchor="middle" font-size="11">${o.xf?o.xf(v):v.toFixed(0)}</text>`}
 if(o.band)s+=`<rect x="${X(o.band[0])}" y="${m.t}" width="${X(o.band[1])-X(o.band[0])}" height="${ih}" fill="${C.org}" opacity=".15"/><text x="${X(o.band[0])+6}" y="${m.t+14}" font-size="11" font-weight="700">${o.bandLabel||''}</text>`;
 o.series.forEach(se=>{s+=`<polyline fill="none" stroke="${se.c}" stroke-width="${se.w||2.6}" ${se.dash?'stroke-dasharray="6 4"':''} points="${se.pts.map(p=>X(p[0])+','+Y(p[1])).join(' ')}"/>`;if(se.dots)se.pts.forEach(p=>s+=`<circle data-tip="${se.tip?se.tip(p):''}" cx="${X(p[0])}" cy="${Y(p[1])}" r="5" fill="${se.c}" stroke="#fff" stroke-width="2"/>`)});
 (o.marks||[]).forEach(mk=>{s+=`<circle data-tip="${mk.tip||''}" cx="${X(mk.x)}" cy="${Y(mk.y)}" r="8" fill="${mk.c||C.nav}" stroke="#fff" stroke-width="2.5"/><text x="${X(mk.x)+12}" y="${Y(mk.y)-8}" font-size="11.5" font-weight="700">${mk.label||''}</text>`});
 s+=`<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${Y(ys0)}" y2="${Y(ys0)}"/>`;if(o.xlab)s+=`<text class="mu" x="${m.l+iw/2}" y="${H-6}" text-anchor="middle" font-size="11.5">${o.xlab}</text>`;if(o.ylab)s+=`<text class="mu" transform="translate(13 ${m.t+ih/2}) rotate(-90)" text-anchor="middle" font-size="11.5">${o.ylab}</text>`;
 if(o.legend)s+=o.legend.map((l,i)=>`<rect x="${m.l+10+i*150}" y="${H-m.b-ih+4}" width="12" height="4" fill="${l[1]}"/><text x="${m.l+28+i*150}" y="${H-m.b-ih+10}" font-size="11">${l[0]}</text>`).join('');return svgWrap(W,H,s)}
function scatterChart(o){const W=o.w||600,H=o.h||260,m={l:50,r:20,t:14,b:42},iw=W-m.l-m.r,ih=H-m.t-m.b,P=o.pts;const xmin=o.xmin??Math.min(...P.map(p=>p.x))*.95,xmax=o.xmax??Math.max(...P.map(p=>p.x))*1.05,ymin=o.ymin??0,ymax=o.ymax??Math.max(...P.map(p=>p.y))*1.12;const X=v=>m.l+(v-xmin)/(xmax-xmin)*iw,Y=v=>m.t+ih-(v-ymin)/(ymax-ymin)*ih;let s='';
 for(let k=0;k<=5;k++){const v=ymin+(ymax-ymin)*k/5;s+=`<line class="gr" x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="mu" x="${m.l-6}" y="${Y(v)+4}" text-anchor="end" font-size="11">${o.yf?o.yf(v):v.toFixed(0)}</text>`;const xv=xmin+(xmax-xmin)*k/5;s+=`<text class="mu" x="${X(xv)}" y="${H-m.b+16}" text-anchor="middle" font-size="11">${o.xf?o.xf(xv):xv.toFixed(0)}</text>`}
 if(o.refX!=null)s+=`<line x1="${X(o.refX)}" x2="${X(o.refX)}" y1="${m.t}" y2="${m.t+ih}" stroke="${C.nav}" stroke-dasharray="5 4"/>`;if(o.refY!=null)s+=`<line y1="${Y(o.refY)}" y2="${Y(o.refY)}" x1="${m.l}" x2="${W-m.r}" stroke="${C.nav}" stroke-dasharray="5 4"/>`;
 const rmax=Math.max(...P.map(p=>p.r));const placed=[];const halo='style="paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round"';
 P.forEach((p,pi)=>{const r=5+Math.sqrt(p.r/rmax)*11,cx=X(p.x),cy=Y(p.y);s+=`<circle data-tip="${p.tip||''}" cx="${cx}" cy="${cy}" r="${r}" fill="${p.c||C.org}" fill-opacity=".85" stroke="#fff" stroke-width="2"/>`});
 P.forEach((p,pi)=>{const r=5+Math.sqrt(p.r/rmax)*11,cx=X(p.x),cy=Y(p.y),lab=p.label||'',w=lab.length*6.3+4,h=13;
  const cands=[[cx+r+4,cy+4,'start',cx+r+4,cy-9],[cx-r-4,cy+4,'end',cx-r-4-w,cy-9],[cx,cy-r-6,'middle',cx-w/2,cy-r-17],[cx,cy+r+15,'middle',cx-w/2,cy+r+4],[cx+r+4,cy-r-4,'start',cx+r+4,cy-r-15],[cx-r-4,cy+r+12,'end',cx-r-4-w,cy+r+1]];
  let pick=cands[0];for(const cd of cands){const bx={x:cd[3],y:cd[4],w,h};const out=bx.x<m.l||bx.x+w>W-4||bx.y<m.t-4||bx.y+h>H-m.b+6;const hit=placed.some(q=>bx.x<q.x+q.w&&bx.x+bx.w>q.x&&bx.y<q.y+q.h&&bx.y+bx.h>q.y)||P.some((o,oi)=>{if(oi===pi)return false;const orr=5+Math.sqrt(o.r/rmax)*11;return bx.x<X(o.x)+orr&&bx.x+w>X(o.x)-orr&&bx.y<Y(o.y)+orr&&bx.y+h>Y(o.y)-orr});if(!out&&!hit){pick=cd;break}}
  placed.push({x:pick[3],y:pick[4],w,h});s+=`<text x="${pick[0]}" y="${pick[1]}" text-anchor="${pick[2]}" font-size="11.5" font-weight="700" ${halo}>${lab}</text>`});
 s+=`<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${m.t+ih}" y2="${m.t+ih}"/><text class="mu" x="${m.l+iw/2}" y="${H-5}" text-anchor="middle" font-size="11.5">${o.xlab||''}</text><text class="mu" transform="translate(13 ${m.t+ih/2}) rotate(-90)" text-anchor="middle" font-size="11.5">${o.ylab||''}</text>`;return svgWrap(W,H,s)}
const legendHtml=a=>`<div class="legend">${a.map(l=>`<span><i style="background:${l[1]}"></i>${l[0]}</span>`).join('')}</div>`;
const SEGC=[C.org,C.bl,C.tl,C.gry];

/* mini histogram */
function histChart(vals,o){const B=o.bins||16,lo=o.lo??Math.min(...vals),hi=o.hi??Math.max(...vals),h=new Array(B).fill(0);for(const v of vals){let k=Math.floor((v-lo)/(hi-lo)*B);if(k>=B)k=B-1;if(k<0)k=0;h[k]++}
 const W=300,H=130,m={l:6,r:6,t:8,b:22},iw=W-m.l-m.r,ih=H-m.t-m.b,mx=Math.max(...h);let s='';const bw=iw/B;
 h.forEach((c,i)=>{const a=lo+(hi-lo)*i/B,b=lo+(hi-lo)*(i+1)/B;s+=`<rect class="bar" data-tip="${T(`${o.xf(a)} to ${o.xf(b)}<br>${fmt.n(c)} customers`)}" x="${m.l+i*bw+1}" y="${m.t+ih-c/mx*ih}" width="${bw-2}" height="${c/mx*ih}" rx="2" fill="${o.c||C.org}"/>`});
 const md=o.med;if(md!=null){const x=m.l+(md-lo)/(hi-lo)*iw;s+=`<line x1="${x}" x2="${x}" y1="${m.t}" y2="${m.t+ih}" stroke="${C.nav}" stroke-width="1.6" stroke-dasharray="4 3"/><text x="${x+4}" y="${m.t+9}" font-size="10" font-weight="700">typical ${o.xf(md)}</text>`}
 s+=`<line class="ax" x1="${m.l}" x2="${W-m.r}" y1="${m.t+ih}" y2="${m.t+ih}"/><text class="mu" x="${m.l}" y="${H-6}" font-size="10">${o.xf(lo)}</text><text class="mu" x="${W-m.r}" y="${H-6}" text-anchor="end" font-size="10">${o.xf(hi)}</text>`;return svgWrap(W,H,s)}
/* heat map: rows x cols, value index colour */
function heatmap(rows,cols,cell){const cw=104,rh=38,lw=140;let s=`<div class="tw"><table style="table-layout:fixed"><tr><th style="width:${lw}px"></th>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>`;
 rows.forEach((r,i)=>{s+=`<tr><td class="b">${r}</td>`;cols.forEach((c,j)=>{const x=cell(i,j);if(!x){s+='<td>–</td>';return}const t=Math.max(0,Math.min(1,(x.v-20)/220));const bg=`rgba(255,153,0,${.12+t*.75})`;s+=`<td data-tip="${T(x.tip)}" style="background:${bg};text-align:center;font-weight:700">${Math.round(x.v)}</td>`});s+='</tr>'});return s+'</table></div>'}

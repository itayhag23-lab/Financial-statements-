import React,{useState,useMemo,useCallback,useRef,useEffect,Component} from 'react';
import ReactDOM from 'react-dom';
import{Plus,Trash2,X,ChevronDown,ChevronRight,TrendingUp,TrendingDown,AlertTriangle,Download,Save,Edit3,Percent,Sliders,Check,Info,Target,BarChart3,Sparkles,RefreshCw,Upload,FileSpreadsheet,FileText}from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { C } from './brand/theme';
import { loadProject, saveProject, getLastActive, genId, saveShare } from './lib/persistence';
import { capture } from './lib/analytics';
import { parseModelDraftJSON, validateModelDraft, MODEL_GEN_SYSTEM_PROMPT, WHATIF_PATCH_ADDENDUM } from './lib/schema';
import PerformanceDashboard from './components/charts/PerformanceDashboard';
import HelpTooltip from './components/ui/HelpTooltip';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';

// /api/chat now requires a signed-in Supabase session — attach the access
// token so the AI features (model generation + advisor chat) keep working.
async function authedJSONHeaders(){
const headers={'Content-Type':'application/json'};
if(supabase){
try{const{data:{session}}=await supabase.auth.getSession();if(session?.access_token)headers.Authorization='Bearer '+session.access_token;}catch{}
}
return headers;
}

// Error boundary — prevents a crash from showing a blank page.
class AppErrorBoundary extends Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(err){return{err};}
  render(){
    if(!this.state.err)return this.props.children;
    return(
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#F8FAFC',fontFamily:'Inter,system-ui,sans-serif',padding:24,textAlign:'center'}}>
        <div style={{fontSize:28,marginBottom:16}}>⚠️</div>
        <div style={{fontSize:18,fontWeight:700,color:'#0F172A',marginBottom:8}}>Something went wrong</div>
        <div style={{fontSize:13,color:'#64748B',marginBottom:24,maxWidth:380}}>{String(this.state.err?.message||'Unexpected error')}</div>
        <button onClick={()=>{try{localStorage.clear();}catch{}window.location.reload();}} style={{display:'inline-flex',alignItems:'center',gap:8,background:'#10B981',color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          <RefreshCw size={15}/> Reset &amp; Reload
        </button>
        <div style={{fontSize:11,color:'#94A3B8',marginTop:12}}>This clears local storage and reloads a fresh model.</div>
      </div>
    );
  }
}

const FontStyles=()=>(<style>{`
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&family=Inter:wght@300..700&family=JetBrains+Mono:wght@400..600&display=swap');
.ff-display{font-family:'Plus Jakarta Sans','Inter',system-ui,sans-serif;letter-spacing:-0.02em;font-feature-settings:"ss01";}
.ff-body{font-family:'Inter',system-ui,sans-serif;letter-spacing:-0.006em;}
.ff-num{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;}
.label-eyebrow{letter-spacing:0.16em;text-transform:uppercase;font-size:10px;font-weight:600;}
.label-folio{letter-spacing:0.18em;text-transform:uppercase;font-size:9.5px;font-weight:600;}
input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{-moz-appearance:textfield;}
.row-hover:hover{background-color:#F1F5F9;}
@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.stagger{animation:slideUp 620ms cubic-bezier(0.16,1,0.3,1) backwards;}
.stagger-1{animation-delay:40ms}.stagger-2{animation-delay:140ms}.stagger-3{animation-delay:240ms}.stagger-4{animation-delay:340ms}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.anim-fade-in{animation:fadeIn 200ms ease-out;}
@keyframes flicker{0%{opacity:1}40%{opacity:0.4}100%{opacity:1}}
.flicker{animation:flicker 320ms ease-out;}
.chevron-exp{transform:rotate(0deg);transition:transform 180ms ease-out;}
.chevron-col{transform:rotate(-90deg);transition:transform 180ms ease-out;}
::selection{background:rgba(16,185,129,0.18);color:#0F172A;}
@keyframes scrollReveal{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.scroll-reveal{opacity:0;transform:translateY(22px);}
.scroll-reveal-vis{animation:scrollReveal 640ms cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes tabIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.anim-tab-in{animation:tabIn 220ms ease-out;}
@keyframes rotateHint{0%{transform:rotate(0deg)}35%{transform:rotate(90deg)}65%{transform:rotate(90deg)}100%{transform:rotate(0deg)}}
.rotate-hint{animation:rotateHint 2.4s ease-in-out infinite;display:block;}
@media (max-width:768px){
.koala-toolbar{flex-wrap:nowrap !important;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.koala-toolbar::-webkit-scrollbar{display:none;}
.koala-toolbar>*{flex-shrink:0 !important;}
.koala-masthead-actions{flex-wrap:nowrap !important;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.koala-masthead-actions::-webkit-scrollbar{display:none;}
.koala-masthead-actions>*{flex-shrink:0;}
.koala-fab-ai{bottom:76px !important;right:12px !important;}
.koala-fab-analysis{bottom:16px !important;right:12px !important;}
}
`}</style>);

// Design tokens now live in ./brand/theme (imported as C) — single source of truth.
const MillionsCtx=React.createContext(false);
function fmtM(v){if(v===null||v===undefined||Number.isNaN(v))return'—';const m=v/1000000;if(m===0)return'0';const abs=Math.abs(m);const s=abs>=10?Math.round(abs).toLocaleString('en-US'):abs.toFixed(1);return m<0?'('+s+')':s;}
function ScrollReveal({children,as:Tag='div',delay=0,className='',style={}}){const ref=useRef(null);const[vis,setVis]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});obs.observe(el);return()=>obs.disconnect();},[]);return React.createElement(Tag,{ref,className:`scroll-reveal${vis?' scroll-reveal-vis':''} ${className}`.trim(),style:{animationDelay:`${delay}ms`,...style}},children);}

const SCENARIOS=['base','best','worst'];
const SCENARIO_META={base:{label:'Base',hint:'realistic plan',tone:C.ink,number:'I'},best:{label:'Best',hint:'optimistic upside',tone:C.green,number:'II'},worst:{label:'Worst',hint:'downside stress',tone:C.rust,number:'III'}};

// type: 'leaf'=input, 'parent'=sums children, 'computed'=formula
const TEMPLATES={
income:[
{id:'rev',label:'Revenue',type:'parent',parentId:null,deletable:false},
{id:'rev-ops',label:'Operating Revenue',type:'leaf',parentId:'rev',defaultMode:'flatGrowth',deletable:false},
{id:'cogs',label:'Cost of Revenue',type:'parent',parentId:null,deletable:false},
{id:'cogs-direct',label:'Direct Costs',type:'leaf',parentId:'cogs',defaultMode:'percentOfRevenue',deletable:false},
{id:'gross',label:'Gross Profit',type:'computed',parentId:null,deletable:false,formula:[{rowId:'rev',sign:1},{rowId:'cogs',sign:-1}]},
{id:'opex',label:'Operating Expenses',type:'parent',parentId:null,deletable:false},
{id:'opex-sm',label:'Sales & Marketing',type:'leaf',parentId:'opex',defaultMode:'percentOfRevenue',deletable:false},
{id:'opex-ga',label:'General & Administrative',type:'leaf',parentId:'opex',defaultMode:'flatGrowth',deletable:false},
{id:'opex-rd',label:'Research & Development',type:'leaf',parentId:'opex',defaultMode:'flatGrowth',deletable:true},
{id:'opex-da',label:'Depreciation & Amortization',type:'leaf',parentId:'opex',defaultMode:'manual',deletable:true},
{id:'opex-other',label:'Other Operating Expense',type:'leaf',parentId:'opex',defaultMode:'manual',deletable:true},
{id:'op-inc',label:'Operating Income (EBIT)',type:'computed',parentId:null,deletable:false,formula:[{rowId:'gross',sign:1},{rowId:'opex',sign:-1}]},
{id:'non-op',label:'Non-Operating Items',type:'parent',parentId:null,deletable:false},
{id:'int-inc',label:'Interest Income',type:'leaf',parentId:'non-op',defaultMode:'manual',deletable:true},
{id:'int-exp',label:'Interest Expense (negative)',type:'leaf',parentId:'non-op',defaultMode:'manual',deletable:true},
{id:'other-no',label:'Other Income / (Expense)',type:'leaf',parentId:'non-op',defaultMode:'manual',deletable:true},
{id:'pretax',label:'Pretax Income',type:'computed',parentId:null,deletable:false,formula:[{rowId:'op-inc',sign:1},{rowId:'non-op',sign:1}]},
{id:'tax',label:'Tax Provision',type:'leaf',parentId:null,defaultMode:'percentOfRevenue',deletable:false},
{id:'net-inc',label:'Net Income',type:'computed',parentId:null,deletable:false,formula:[{rowId:'pretax',sign:1},{rowId:'tax',sign:-1}]}
],
balance:[
{id:'assets',label:'Total Assets',type:'parent',parentId:null,deletable:false},
{id:'cash',label:'Cash & Equivalents',type:'leaf',parentId:'assets',defaultMode:'manual',deletable:false},
{id:'ar',label:'Accounts Receivable',type:'leaf',parentId:'assets',defaultMode:'manual',deletable:true},
{id:'inv',label:'Inventory',type:'leaf',parentId:'assets',defaultMode:'manual',deletable:true},
{id:'other-ca',label:'Other Current Assets',type:'leaf',parentId:'assets',defaultMode:'manual',deletable:true},
{id:'ppe',label:'Property, Plant & Equipment',type:'leaf',parentId:'assets',defaultMode:'manual',deletable:true},
{id:'goodwill',label:'Goodwill & Intangibles',type:'leaf',parentId:'assets',defaultMode:'manual',deletable:true},
{id:'liab',label:'Total Liabilities',type:'parent',parentId:null,deletable:false},
{id:'ap',label:'Accounts Payable',type:'leaf',parentId:'liab',defaultMode:'manual',deletable:true},
{id:'st-debt',label:'Short-term Debt',type:'leaf',parentId:'liab',defaultMode:'manual',deletable:true},
{id:'other-cl',label:'Other Current Liabilities',type:'leaf',parentId:'liab',defaultMode:'manual',deletable:true},
{id:'lt-debt',label:'Long-term Debt',type:'leaf',parentId:'liab',defaultMode:'manual',deletable:true},
{id:'equity',label:'Total Equity',type:'parent',parentId:null,deletable:false},
{id:'common',label:'Common Stock',type:'leaf',parentId:'equity',defaultMode:'manual',deletable:false},
{id:'retained',label:'Retained Earnings',type:'leaf',parentId:'equity',defaultMode:'manual',deletable:false},
{id:'apic',label:'Additional Paid-in Capital',type:'leaf',parentId:'equity',defaultMode:'manual',deletable:true},
{id:'total-le',label:'Total Liabilities + Equity',type:'computed',parentId:null,deletable:false,formula:[{rowId:'liab',sign:1},{rowId:'equity',sign:1}]}
],
cashFlow:[
{id:'cfo',label:'Cash from Operations',type:'parent',parentId:null,deletable:false},
{id:'cf-ni',label:'Net Income',type:'leaf',parentId:'cfo',defaultMode:'manual',deletable:false,linked:true,linkLabel:'from Income Statement'},
{id:'cf-da',label:'Depreciation & Amortization',type:'leaf',parentId:'cfo',defaultMode:'manual',deletable:true},
{id:'cf-sbc',label:'Stock-based Compensation',type:'leaf',parentId:'cfo',defaultMode:'manual',deletable:true},
{id:'cf-ar',label:'Change in Accounts Receivable',type:'leaf',parentId:'cfo',defaultMode:'manual',deletable:true,linked:true,linkLabel:'from Balance Sheet'},
{id:'cf-inv',label:'Change in Inventory',type:'leaf',parentId:'cfo',defaultMode:'manual',deletable:true,linked:true,linkLabel:'from Balance Sheet'},
{id:'cf-ap',label:'Change in Accounts Payable',type:'leaf',parentId:'cfo',defaultMode:'manual',deletable:true,linked:true,linkLabel:'from Balance Sheet'},
{id:'cfi',label:'Cash from Investing',type:'parent',parentId:null,deletable:false},
{id:'cf-capex',label:'Capital Expenditures (negative)',type:'leaf',parentId:'cfi',defaultMode:'manual',deletable:true},
{id:'cf-acq',label:'Acquisitions (negative)',type:'leaf',parentId:'cfi',defaultMode:'manual',deletable:true},
{id:'cff',label:'Cash from Financing',type:'parent',parentId:null,deletable:false},
{id:'cf-debt',label:'Debt Issued / (Repaid)',type:'leaf',parentId:'cff',defaultMode:'manual',deletable:true},
{id:'cf-equity',label:'Equity Issued',type:'leaf',parentId:'cff',defaultMode:'manual',deletable:true},
{id:'cf-div',label:'Dividends Paid (negative)',type:'leaf',parentId:'cff',defaultMode:'manual',deletable:true},
{id:'cf-net',label:'Net Change in Cash',type:'computed',parentId:null,deletable:false,formula:[{rowId:'cfo',sign:1},{rowId:'cfi',sign:1},{rowId:'cff',sign:1}]},
{id:'cf-fcf',label:'Free Cash Flow',type:'computed',parentId:null,deletable:false,formula:[{rowId:'cfo',sign:1},{rowId:'cf-capex',sign:1}]}
]};

const ROW_LIBRARY={
income:{
rev:[{label:'Service Revenue',defaultMode:'flatGrowth'},{label:'Subscription Revenue',defaultMode:'flatGrowth'},{label:'Product Revenue',defaultMode:'flatGrowth'},{label:'Licensing & Royalties',defaultMode:'flatGrowth'}],
cogs:[{label:'Direct Materials',defaultMode:'percentOfRevenue'},{label:'Direct Labor',defaultMode:'percentOfRevenue'},{label:'Hosting & Infrastructure',defaultMode:'percentOfRevenue'},{label:'Shipping & Fulfillment',defaultMode:'percentOfRevenue'},{label:'Payment Processing Fees',defaultMode:'percentOfRevenue'}],
opex:[{label:'Salaries & Wages',defaultMode:'flatGrowth'},{label:'Contractor Expenses',defaultMode:'flatGrowth'},{label:'Rent & Utilities',defaultMode:'flatGrowth'},{label:'Software & Tools',defaultMode:'flatGrowth'},{label:'Customer Acquisition (CAC)',defaultMode:'percentOfRevenue'},{label:'Travel & Entertainment',defaultMode:'flatGrowth'},{label:'Professional Services',defaultMode:'flatGrowth'},{label:'Insurance',defaultMode:'flatGrowth'},{label:'Stock-based Compensation',defaultMode:'flatGrowth'}],
'non-op':[{label:'Foreign Exchange Gain/Loss',defaultMode:'manual'},{label:'Restructuring Charges',defaultMode:'manual'}]
},
balance:{
assets:[{label:'Short-term Investments',defaultMode:'manual'},{label:'Prepaid Expenses',defaultMode:'manual'},{label:'Long-term Investments',defaultMode:'manual'},{label:'Right-of-use Assets',defaultMode:'manual'}],
liab:[{label:'Accrued Expenses',defaultMode:'manual'},{label:'Deferred Revenue',defaultMode:'manual'},{label:'Convertible Notes',defaultMode:'manual'},{label:'Lease Obligations',defaultMode:'manual'}],
equity:[{label:'Preferred Equity',defaultMode:'manual'},{label:'Treasury Stock (negative)',defaultMode:'manual'}]
},
cashFlow:{
cfo:[{label:'Change in Deferred Revenue',defaultMode:'manual'},{label:'Change in Accrued Expenses',defaultMode:'manual'}],
cfi:[{label:'Asset Sales',defaultMode:'manual'}],
cff:[{label:'Stock Buybacks',defaultMode:'manual'},{label:'Lease Payments (negative)',defaultMode:'manual'}]
}};

const BB={
coffeeshop:{label:'Coffee Shop',icon:'☕',category:'Food & Beverage',blurb:'Local cafe selling coffee + light food.',benchmarks:{grossMargin:[62,72],opMargin:[4,12],netMargin:[3,8]},seedBase:{revenue:600,revGrowth:8,cogsPct:32,opexBase:320,opexGrowth:5,taxPct:5},extraRows:[{parentId:'opex',label:'Salaries & Wages',defaultMode:'flatGrowth',baseValue:180,flatRate:6},{parentId:'opex',label:'Rent & Utilities',defaultMode:'flatGrowth',baseValue:90,flatRate:4}],peers:[{name:'Starbucks',netMargin:11.5},{name:'Local cafe',netMargin:5}]},
restaurant:{label:'Restaurant',icon:'🍽️',category:'Food & Beverage',blurb:'Full-service or fast-casual dining.',benchmarks:{grossMargin:[60,72],opMargin:[3,10],netMargin:[2,6]},seedBase:{revenue:1200,revGrowth:6,cogsPct:32,opexBase:720,opexGrowth:5,taxPct:4},extraRows:[{parentId:'opex',label:'Salaries & Wages',defaultMode:'flatGrowth',baseValue:380,flatRate:6},{parentId:'opex',label:'Rent & Utilities',defaultMode:'flatGrowth',baseValue:180,flatRate:4}],peers:[{name:'Chipotle',netMargin:13},{name:'Independent bistro',netMargin:4}]},
foodtruck:{label:'Food Truck',icon:'🚚',category:'Food & Beverage',blurb:'Mobile food, low fixed costs.',benchmarks:{grossMargin:[55,70],opMargin:[10,25],netMargin:[7,18]},seedBase:{revenue:280,revGrowth:12,cogsPct:35,opexBase:100,opexGrowth:8,taxPct:5},extraRows:[{parentId:'cogs',label:'Direct Materials',defaultMode:'percentOfRevenue',pctOfRev:30}],peers:[{name:'Successful truck',netMargin:15}]},
ecommerce:{label:'E-commerce',icon:'🛒',category:'Retail',blurb:'Online retail, D2C brand.',benchmarks:{grossMargin:[35,55],opMargin:[3,12],netMargin:[2,8]},seedBase:{revenue:800,revGrowth:25,cogsPct:50,opexBase:280,opexGrowth:20,taxPct:4},extraRows:[{parentId:'cogs',label:'Shipping & Fulfillment',defaultMode:'percentOfRevenue',pctOfRev:8}],peers:[{name:'Warby Parker',netMargin:-3},{name:'Profitable Shopify store',netMargin:8}]},
retail:{label:'Retail Shop',icon:'🏬',category:'Retail',blurb:'Physical store, inventory-heavy.',benchmarks:{grossMargin:[30,50],opMargin:[3,8],netMargin:[1,5]},seedBase:{revenue:1500,revGrowth:6,cogsPct:60,opexBase:480,opexGrowth:5,taxPct:5},extraRows:[{parentId:'opex',label:'Rent & Utilities',defaultMode:'flatGrowth',baseValue:220,flatRate:4}],peers:[{name:'Target',netMargin:4},{name:'Local boutique',netMargin:3}]},
carwash:{label:'Car Wash',icon:'🚗',category:'Services',blurb:'Self-serve or full-service vehicle washing.',benchmarks:{grossMargin:[50,70],opMargin:[15,30],netMargin:[10,22]},seedBase:{revenue:500,revGrowth:8,cogsPct:35,opexBase:200,opexGrowth:5,taxPct:5},extraRows:[{parentId:'opex',label:'Salaries & Wages',defaultMode:'flatGrowth',baseValue:120,flatRate:5}],peers:[{name:'Mister Car Wash',netMargin:8},{name:'Independent station',netMargin:12}]},
vending:{label:'Vending Machines',icon:'🥤',category:'Services',blurb:'Automated machines, high-traffic locations.',benchmarks:{grossMargin:[40,55],opMargin:[15,30],netMargin:[10,22]},seedBase:{revenue:200,revGrowth:15,cogsPct:50,opexBase:60,opexGrowth:10,taxPct:5},extraRows:[{parentId:'cogs',label:'Direct Materials',defaultMode:'percentOfRevenue',pctOfRev:45},{parentId:'opex',label:'Location Commission',defaultMode:'percentOfRevenue',pctOfRev:12}],peers:[{name:'Independent operator',netMargin:18}]},
gym:{label:'Gym / Fitness Studio',icon:'🏋️',category:'Services',blurb:'Membership-based fitness facility.',benchmarks:{grossMargin:[70,85],opMargin:[10,25],netMargin:[7,18]},seedBase:{revenue:800,revGrowth:12,cogsPct:20,opexBase:480,opexGrowth:8,taxPct:5},extraRows:[{parentId:'opex',label:'Salaries & Wages',defaultMode:'flatGrowth',baseValue:220,flatRate:8},{parentId:'opex',label:'Rent & Utilities',defaultMode:'flatGrowth',baseValue:180,flatRate:5}],peers:[{name:'Planet Fitness',netMargin:16},{name:'Boutique studio',netMargin:8}]},
consulting:{label:'Consulting',icon:'💼',category:'Services',blurb:'Solo or small-team advisory work.',benchmarks:{grossMargin:[45,65],opMargin:[15,30],netMargin:[10,22]},seedBase:{revenue:500,revGrowth:20,cogsPct:45,opexBase:120,opexGrowth:15,taxPct:8},extraRows:[{parentId:'cogs',label:'Direct Labor',defaultMode:'percentOfRevenue',pctOfRev:40}],peers:[{name:'Solo consultant',netMargin:35},{name:'Small boutique firm',netMargin:18}]},
saas:{label:'SaaS Product',icon:'💻',category:'Digital',blurb:'Recurring software subscription.',benchmarks:{grossMargin:[70,85],opMargin:[10,25],netMargin:[5,20]},seedBase:{revenue:600,revGrowth:35,cogsPct:20,opexBase:380,opexGrowth:25,taxPct:5},extraRows:[{parentId:'cogs',label:'Hosting & Infrastructure',defaultMode:'percentOfRevenue',pctOfRev:12}],peers:[{name:'Shopify',netMargin:6},{name:'Mature niche SaaS',netMargin:22}]},
mobileapp:{label:'Mobile App',icon:'📱',category:'Digital',blurb:'Consumer app, ads or in-app purchases.',benchmarks:{grossMargin:[60,80],opMargin:[5,20],netMargin:[3,15]},seedBase:{revenue:300,revGrowth:60,cogsPct:30,opexBase:280,opexGrowth:35,taxPct:4},extraRows:[{parentId:'cogs',label:'Hosting & Infrastructure',defaultMode:'percentOfRevenue',pctOfRev:12},{parentId:'opex',label:'Customer Acquisition (CAC)',defaultMode:'percentOfRevenue',pctOfRev:35}],peers:[{name:'Duolingo',netMargin:4},{name:'Indie hit app',netMargin:25}]},
contentcreator:{label:'Content Creator',icon:'🎥',category:'Digital',blurb:'YouTube / podcast / newsletter.',benchmarks:{grossMargin:[70,90],opMargin:[30,60],netMargin:[25,50]},seedBase:{revenue:200,revGrowth:40,cogsPct:15,opexBase:60,opexGrowth:25,taxPct:8},extraRows:[{parentId:'opex',label:'Software & Tools',defaultMode:'flatGrowth',baseValue:24,flatRate:10}],peers:[{name:'Mid-tier YouTuber',netMargin:40},{name:'Newsletter',netMargin:60}]},
agency:{label:'Creative Agency',icon:'🎨',category:'Services',blurb:'Project-based, talent-driven.',benchmarks:{grossMargin:[40,60],opMargin:[10,20],netMargin:[7,15]},seedBase:{revenue:600,revGrowth:15,cogsPct:50,opexBase:150,opexGrowth:10,taxPct:8},extraRows:[{parentId:'cogs',label:'Contractor Expenses',defaultMode:'percentOfRevenue',pctOfRev:40}],peers:[{name:'WPP / Omnicom',netMargin:9},{name:'Boutique agency',netMargin:13}]},
manufacturing:{label:'Small Manufacturing',icon:'🏭',category:'Other',blurb:'Production of physical goods.',benchmarks:{grossMargin:[25,45],opMargin:[5,15],netMargin:[3,10]},seedBase:{revenue:2000,revGrowth:12,cogsPct:65,opexBase:380,opexGrowth:10,taxPct:6},extraRows:[{parentId:'cogs',label:'Direct Materials',defaultMode:'percentOfRevenue',pctOfRev:45},{parentId:'cogs',label:'Direct Labor',defaultMode:'percentOfRevenue',pctOfRev:18}],peers:[{name:'Mid-size manufacturer',netMargin:7}]},
other:{label:'Something Else',icon:'✨',category:'Other',blurb:'Custom — adjust everything as you go.',benchmarks:{grossMargin:[40,60],opMargin:[5,15],netMargin:[3,10]},seedBase:{revenue:1000,revGrowth:20,cogsPct:40,opexBase:350,opexGrowth:15,taxPct:5},extraRows:[],peers:[]}
};
const BUSINESS_BANK=BB;
const SECTORS=BB;
const BUSINESS_CATEGORIES=['Food & Beverage','Retail','Services','Digital','Other'];

const REGIONS={us:{label:'United States',taxRate:21},il:{label:'Israel',taxRate:23},uk:{label:'United Kingdom',taxRate:25},eu:{label:'EU (avg)',taxRate:22},ca:{label:'Canada',taxRate:26},au:{label:'Australia',taxRate:30},sg:{label:'Singapore',taxRate:17},ae:{label:'UAE',taxRate:9},other:{label:'Other / Skip',taxRate:20}};
const CURRENCIES={usd:{label:'USD',symbol:'$',name:'US Dollar'},ils:{label:'ILS',symbol:'₪',name:'Israeli Shekel'},eur:{label:'EUR',symbol:'€',name:'Euro'},gbp:{label:'GBP',symbol:'£',name:'British Pound'},cad:{label:'CAD',symbol:'C$',name:'Canadian Dollar'},aud:{label:'AUD',symbol:'A$',name:'Australian Dollar'}};
const STATEMENT_OPTIONS={incomeOnly:{label:'Income only',blurb:'Just P&L. Fastest to set up.'},incomeAndCF:{label:'Income + Cash Flow',blurb:'For tracking runway.'},full:{label:'All three',blurb:'Income + Balance Sheet + Cash Flow.'}};

const SECTOR_WATCHOUTS={
coffeeshop:['Labor is typically 30-35% of revenue. Below 25% is unrealistic.','Rent should not exceed 8-10% of revenue in a sustainable model.'],
restaurant:['Prime cost (food + labor) typically runs 60-65%. Below 55% is suspicious.','New restaurants take 18-24 months to reach steady-state revenue.'],
foodtruck:['Weather-dependent — 20-30% revenue variance is normal.','Permit costs vary wildly by city. Did you research yours?'],
ecommerce:['CAC paid back in <12 months separates winners from losers.','Shipping costs eat 8-12% of revenue. Make sure that is captured.'],
retail:['Inventory turnover should be 4-6x per year for healthy retail.','First year ramp is typically 60-70% of mature revenue, not 100%.'],
carwash:['Revenue is highly weather-dependent — model rainy days as 40% reduction.','Equipment maintenance reserves should be 5-10% of revenue.'],
vending:['Location commission (15-25% of gross) is the single biggest operating cost.','Machine payback should be 18-24 months at typical sales volumes.'],
gym:['Member churn is typically 30-50% per year. Did you model it?','First-year members convert to long-term at only 40-50%.'],
consulting:['Utilization rate (billable/available) drives profitability. Typical: 60-75%.','Solo consultants spend 30-40% on non-billable sales and admin.'],
agency:['Retainer revenue improves margins. Project-only agencies struggle to scale.','Bench (idle creative time) eats 15-25% of capacity.'],
saas:['Net revenue retention >100% is the single biggest SaaS health metric.','CAC payback should be under 18 months.'],
mobileapp:['LTV/CAC ratio below 3:1 means more spend = more losses.','App store fees take 15-30% of in-app revenue.'],
contentcreator:['80% of creators earn under $20K/year. Did you stress-test your audience size?','Algorithm changes can wipe out 50% of revenue overnight.'],
manufacturing:['Working capital often equals 25-35% of annual revenue.','Capex payback periods of 3-7 years are normal.'],
other:['Without a known business type, sanity-checking is harder — verify assumptions externally.']
};

// HELPERS
function makeRowDataEntry(defaultMode,numPeriods){return{mode:defaultMode||'manual',baseValue:0,flatRate:0,customRates:Array(Math.max(0,numPeriods-1)).fill(0),pctOfRev:0,declineAmount:0,manualValues:Array(numPeriods).fill(0)};}
function resizeRowData(entry,numPeriods){return{...entry,manualValues:Array(numPeriods).fill(0).map((_,i)=>entry.manualValues[i]??0),customRates:Array(Math.max(0,numPeriods-1)).fill(0).map((_,i)=>entry.customRates[i]??0)};}
function fmt(n,{paren=false,abbreviate=false}={}){if(n===null||n===undefined||Number.isNaN(n))return'—';const r=Math.round(n);if(r===0)return'0';if(abbreviate){const abs=Math.abs(r);if(abs>=1e6)return(r>=0?'':'−')+(abs/1e6).toFixed(1)+'M';if(abs>=1000)return(r>=0?'':'−')+(abs/1000).toFixed(1)+'K';}if(paren&&r<0)return`(${Math.abs(r).toLocaleString('en-US')})`;return r.toLocaleString('en-US');}
function computeLeafValues(rd,numPeriods,revVals){const out=Array(numPeriods).fill(0);if(!rd)return out;const{mode,baseValue,flatRate,customRates,pctOfRev,declineAmount,manualValues}=rd;if(mode==='manual')for(let i=0;i<numPeriods;i++)out[i]=+(manualValues[i]||0);else if(mode==='flatGrowth'){const r=(flatRate||0)/100;out[0]=+(baseValue||0);for(let i=1;i<numPeriods;i++)out[i]=out[i-1]*(1+r);}else if(mode==='customGrowth'){out[0]=+(baseValue||0);for(let i=1;i<numPeriods;i++)out[i]=out[i-1]*(1+((customRates[i-1]||0)/100));}else if(mode==='percentOfRevenue'){const p=(pctOfRev||0)/100;for(let i=0;i<numPeriods;i++)out[i]=(revVals?.[i]||0)*p;}else if(mode==='decline'){const d=+(declineAmount||0);out[0]=+(baseValue||0);for(let i=1;i<numPeriods;i++)out[i]=Math.max(0,out[i-1]-d);}return out.map(v=>Math.round(v));}

function computeTree(rows,rowData,numPeriods,totalRevenue){
const byId=Object.fromEntries(rows.map(r=>[r.id,r]));
const cache={};
function get(id){
if(cache[id])return cache[id];
const r=byId[id];
if(!r)return cache[id]=Array(numPeriods).fill(0);
let result;
if(r.type==='leaf'){result=computeLeafValues(rowData[id],numPeriods,totalRevenue);}
else if(r.type==='parent'){result=Array(numPeriods).fill(0);for(const c of rows.filter(x=>x.parentId===id)){const cv=get(c.id);for(let i=0;i<numPeriods;i++)result[i]+=cv[i];}}
else if(r.type==='computed'){result=Array(numPeriods).fill(0);for(const t of(r.formula||[])){const tv=get(t.rowId);for(let i=0;i<numPeriods;i++)result[i]+=t.sign*tv[i];}}
else{result=Array(numPeriods).fill(0);}
cache[id]=result.map(v=>Math.round(v));return cache[id];
}
for(const r of rows)get(r.id);return cache;
}

function getTotalRevenue(incomeRows,rowData,numPeriods){
const out=Array(numPeriods).fill(0);
for(const r of incomeRows.filter(x=>x.type==='leaf'&&x.parentId==='rev')){
const v=computeLeafValues(rowData[r.id],numPeriods,null);
for(let i=0;i<numPeriods;i++)out[i]+=v[i];
}
return out.map(v=>Math.round(v));
}

function computeScenario(rows,rowData,numPeriods){
const totalRevenue=getTotalRevenue(rows.income,rowData,numPeriods);
const isVals=computeTree(rows.income,rowData,numPeriods,totalRevenue);
const bsRows=rows.balance||[];const cfRows=rows.cashFlow||[];
if(!bsRows.length&&!cfRows.length){return{values:{...isVals,revenue:totalRevenue,grossProfit:isVals['gross']||[],operatingIncome:isVals['op-inc']||[],netIncome:isVals['net-inc']||[]},totalRevenue};}
const userBS=bsRows.length?computeTree(bsRows,rowData,numPeriods,totalRevenue):{};
const niArr=isVals['net-inc']||Array(numPeriods).fill(0);
const arArr=userBS['ar']||Array(numPeriods).fill(0);
const invArr=userBS['inv']||Array(numPeriods).fill(0);
const apArr=userBS['ap']||Array(numPeriods).fill(0);
const blank=(vals)=>({mode:'manual',baseValue:0,flatRate:0,customRates:[],pctOfRev:0,declineAmount:0,manualValues:vals});
const delta=(arr,sign)=>arr.map((v,i)=>sign*(v-(i===0?0:arr[i-1])));
const cfOverride={...rowData,'cf-ni':blank(niArr.slice()),'cf-ar':blank(delta(arArr,-1)),'cf-inv':blank(delta(invArr,-1)),'cf-ap':blank(delta(apArr,+1))};
const cfVals=cfRows.length?computeTree(cfRows,cfOverride,numPeriods,totalRevenue):{};
const cfNetArr=cfVals['cf-net']||Array(numPeriods).fill(0);
const userCash=userBS['cash']||Array(numPeriods).fill(0);
const userRet=userBS['retained']||Array(numPeriods).fill(0);
const cashL=Array(numPeriods).fill(0);cashL[0]=userCash[0]||0;for(let i=1;i<numPeriods;i++)cashL[i]=cashL[i-1]+(cfNetArr[i]||0);
const reL=Array(numPeriods).fill(0);reL[0]=userRet[0]||0;for(let i=1;i<numPeriods;i++)reL[i]=reL[i-1]+(niArr[i]||0);
const bsOverride={...rowData,cash:blank(cashL),retained:blank(reL)};
const bsVals=bsRows.length?computeTree(bsRows,bsOverride,numPeriods,totalRevenue):{};
const all={...isVals,...bsVals,...cfVals};
all.revenue=totalRevenue;all.grossProfit=isVals['gross']||[];all.operatingIncome=isVals['op-inc']||[];all.netIncome=isVals['net-inc']||[];
all.totalAssets=bsVals['assets']||[];all.totalLE=bsVals['total-le']||[];all.cfNet=cfVals['cf-net']||[];
return{values:all,totalRevenue};
}

function buildPeriodLabels(granularity,numPeriods,startYear){
if(granularity==='annual')return Array.from({length:numPeriods},(_,i)=>String(startYear+i));
const labels=[];let y=startYear,q=1;
for(let i=0;i<numPeriods;i++){labels.push(`Q${q} '${String(y).slice(-2)}`);q++;if(q>4){q=1;y++;}}
return labels;
}
let _idc=1;const newRowId=(p='r')=>`${p}_${Date.now().toString(36)}_${(_idc++).toString(36)}`;

// Saved projects persist their own rows/rowData snapshot, so rows added or
// re-flagged in TEMPLATES after a project was saved (e.g. the auto-linked CF
// rows, the Free Cash Flow line) would otherwise never appear when reloading
// older projects. Patch the loaded rows up to the current template shape.
function reconcileLoadedRows(loadedRows,loadedRowData,numPeriods){
const rows={};const rowData=loadedRowData?{...loadedRowData}:{};
for(const sc of SCENARIOS)if(!rowData[sc])rowData[sc]={};
for(const stmt of['income','balance','cashFlow']){
const tmpl=TEMPLATES[stmt];
const loaded=(loadedRows&&loadedRows[stmt])||tmpl.map(r=>({...r}));
const byId=new Map(loaded.map(r=>[r.id,r]));
const merged=loaded.map(r=>{
const t=tmpl.find(tr=>tr.id===r.id);
if(!t)return r;
const next={...r};
// Formula/linked flags are model structure, not user input — always track
// the latest template so corrected calcs (e.g. Free Cash Flow) reach older
// saved projects. User-entered values live in rowData and are untouched.
if(t.linked){next.linked=t.linked;next.linkLabel=t.linkLabel;}
if(t.type==='computed'&&t.formula)next.formula=t.formula;
return next;
});
for(const t of tmpl){
if(!byId.has(t.id)){
merged.push({...t});
if(t.type==='leaf')for(const sc of SCENARIOS)if(!rowData[sc][t.id])rowData[sc][t.id]=makeRowDataEntry(t.defaultMode,numPeriods);
}
}
rows[stmt]=merged;
}
return{rows,rowData};
}

function seedProjectForWizard({sectorKey,regionKey,statements,numPeriods}){
const sector=BB[sectorKey]||BB.other;
const region=REGIONS[regionKey]||REGIONS.us;
const stmtMode=statements||'incomeOnly';
const enabledStatements=stmtMode==='full'?{income:true,balance:true,cashFlow:true}:stmtMode==='incomeAndCF'?{income:true,balance:false,cashFlow:true}:{income:true,balance:false,cashFlow:false};
const mult=0.8;
const rows={income:TEMPLATES.income.map(r=>({...r})),balance:TEMPLATES.balance.map(r=>({...r})),cashFlow:TEMPLATES.cashFlow.map(r=>({...r}))};
const extraIds=[];
for(const extra of(sector.extraRows||[])){
const id=newRowId(extra.parentId||'income');
const newRow={id,label:extra.label,type:'leaf',parentId:extra.parentId,defaultMode:extra.defaultMode,deletable:true};
const list=rows.income;let lastIdx=-1;
for(let i=0;i<list.length;i++)if(list[i].parentId===extra.parentId)lastIdx=i;
list.splice(lastIdx>=0?lastIdx+1:list.length,0,newRow);
extraIds.push({id,...extra});
}
const rowData={};const sb=sector.seedBase;
for(const sc of SCENARIOS){
rowData[sc]={};
for(const stmt of['income','balance','cashFlow'])for(const r of rows[stmt])if(r.type==='leaf')rowData[sc][r.id]=makeRowDataEntry(r.defaultMode,numPeriods);
const rM=sc==='best'?1.25:sc==='worst'?0.7:1;const gA=sc==='best'?12:sc==='worst'?-10:0;const cA=sc==='best'?-5:sc==='worst'?8:0;const oM=sc==='best'?0.92:sc==='worst'?1.12:1;
if(rowData[sc]['rev-ops']){rowData[sc]['rev-ops'].baseValue=Math.round(sb.revenue*mult*rM);rowData[sc]['rev-ops'].flatRate=Math.max(0,sb.revGrowth+gA);}
if(rowData[sc]['cogs-direct'])rowData[sc]['cogs-direct'].pctOfRev=Math.max(5,Math.min(85,sb.cogsPct+cA));
if(rowData[sc]['opex-sm'])rowData[sc]['opex-sm'].pctOfRev=sc==='worst'?25:sc==='best'?12:18;
if(rowData[sc]['opex-ga']){rowData[sc]['opex-ga'].baseValue=Math.round(sb.opexBase*mult*oM*0.45);rowData[sc]['opex-ga'].flatRate=Math.max(0,sb.opexGrowth+(sc==='worst'?4:0));}
if(rowData[sc]['opex-rd']){const rd=(sectorKey==='saas'||sectorKey==='mobileapp');rowData[sc]['opex-rd'].baseValue=rd?Math.round(sb.opexBase*mult*0.35):0;rowData[sc]['opex-rd'].flatRate=rd?25:0;}
if(rowData[sc]['tax'])rowData[sc]['tax'].pctOfRev=sc==='base'?region.taxRate:sc==='best'?Math.round(region.taxRate*0.8):Math.round(region.taxRate*0.5);
for(const ent of extraIds){const e=rowData[sc][ent.id];if(!e)continue;if(ent.defaultMode==='percentOfRevenue'&&ent.pctOfRev!=null)e.pctOfRev=Math.max(1,ent.pctOfRev+(sc==='worst'?3:sc==='best'?-2:0));if((ent.defaultMode==='flatGrowth'||ent.defaultMode==='manual')&&ent.baseValue!=null){e.baseValue=Math.round(ent.baseValue*mult*oM);if(ent.flatRate!=null)e.flatRate=Math.max(0,ent.flatRate);}}
if(rowData[sc]['cash']){const sc2=Math.round(sb.opexBase*mult*1.5);rowData[sc]['cash'].manualValues=Array(numPeriods).fill(0).map((_,i)=>Math.round(sc2*Math.pow(sc==='worst'?0.85:sc==='best'?1.4:1.15,i)));}
if(rowData[sc]['common']){const se=Math.round(sb.opexBase*mult*1.2);rowData[sc]['common'].manualValues=Array(numPeriods).fill(se);}
}
return{rows,rowData,enabledStatements};
}

// Calc-engine guardrail: guarantee the BASE scenario turns a profit in the first
// period. AI/wizard assumptions (especially large absolute opex relative to a
// small starting revenue) can otherwise produce an unrealistic steep year-1 loss.
// We solve for it deterministically: scale down the absolute opex lines, and if
// that alone is not enough, lift starting revenue — applying the SAME adjustment
// to every scenario so the Base/Best/Worst spread is preserved.
function ensureBaseProfit(rows,rowData,numPeriods,{targetNetMargin=0.08}={}){
if(!rowData||!rowData.base)return rowData;
// Absolute (non-%-of-revenue) opex leaves are the lever we scale.
const absOpexIds=(rows.income||[]).filter(r=>r.type==='leaf'&&r.parentId==='opex').map(r=>r.id);
const isAbs=e=>e&&(e.mode==='flatGrowth'||e.mode==='manual'||e.mode==='customGrowth');
const scaleAbsOpex=(scData,f)=>{const nd={...scData};for(const id of absOpexIds){const e=nd[id];if(isAbs(e))nd[id]={...e,baseValue:Math.round((e.baseValue||0)*f),manualValues:(e.manualValues||[]).map(v=>Math.round(v*f))};}return nd;};
const base0=computeScenario(rows,rowData.base,numPeriods).values;
const rev0=base0.revenue?.[0]||0;const ni0=base0.netIncome?.[0]||0;
if(rev0<=0)return rowData; // no revenue to anchor against — leave as-is
const target=rev0*targetNetMargin;
if(ni0>=target)return rowData; // already healthy
// How much absolute opex is there in period 0? That caps how much we can cut.
let absTotal=0;for(const id of absOpexIds){const e=rowData.base[id];if(isAbs(e))absTotal+=computeLeafValues(e,numPeriods,base0.revenue)[0];}
const gap=target-ni0;
const f=absTotal>0?Math.max(0.15,Math.min(1,(absTotal-gap)/absTotal)):1;
const nd={};for(const sc of SCENARIOS)nd[sc]=rowData[sc]?scaleAbsOpex(rowData[sc],f):rowData[sc];
// Still short (opex couldn't absorb the whole gap)? Lift starting revenue.
const base1=computeScenario(rows,nd.base,numPeriods).values;
const ni1=base1.netIncome?.[0]||0;
if(ni1<target){
const gm=rev0>0?(base0.grossProfit?.[0]||0)/rev0:0.5; // gross margin proxy
const lift=gm>0.05?Math.ceil((target-ni1)/gm):0;
if(lift>0){for(const sc of SCENARIOS){const e=nd[sc]?.['rev-ops'];if(e)nd[sc]={...nd[sc],'rev-ops':{...e,baseValue:Math.round((e.baseValue||0)+lift)}};}}
}
return nd;
}

function computeFeasibilityScore(computedAll,periods,sectorKey,granularity,enabledStatements){
const sector=BB[sectorKey]||BB.other;const stmts=enabledStatements||{income:true,balance:false,cashFlow:false};
const bV=computedAll.base?.values||{};const wV=computedAll.worst?.values||{};
const rev=bV.revenue||[];const gp=bV.grossProfit||[];const ni=bV.netIncome||[];const cash=bV.cash||[];const niW=wV.netIncome||[];const cashW=wV.cash||[];
if(!rev.length)return{score:0,label:'No data',tone:C.muted,breakdown:[]};
const profScore=Math.min(1,ni.filter(v=>v>0).length/Math.max(1,ni.length*0.6));
const gms=rev.map((r,i)=>r>0?(gp[i]/r)*100:0).filter(v=>v!==0);
const avgGM=gms.length?gms.reduce((a,b)=>a+b,0)/gms.length:0;
const margScore=Math.max(0,Math.min(1,avgGM/Math.max(1,(sector.benchmarks.grossMargin[0]+sector.benchmarks.grossMargin[1])/2)));
let cashScore=null;
if(stmts.balance){const pm=granularity==='annual'?12:3;const negC=cash.filter(c=>c<0).length;const lNI=ni[ni.length-1]||0;const lC=cash[cash.length-1]||0;cashScore=1-(negC/Math.max(1,cash.length));if(lNI<0&&lC>0){const rw=lC/(Math.abs(lNI)/pm);if(rw<6)cashScore*=0.5;else if(rw<12)cashScore*=0.75;}cashScore=Math.max(0,Math.min(1,cashScore));}
const revS=rev[0]||0;const revE=rev[rev.length-1]||0;const growScore=revS>0?Math.max(0,Math.min(1,(revE/revS-1)/2)):0.3;
let robScore=1;if(stmts.balance){const wNC=cashW.filter(c=>c<0).length;robScore=1-(wNC/Math.max(1,cashW.length));}
const wCumNI=niW.reduce((a,b)=>a+b,0);if(wCumNI<0)robScore*=0.6;robScore=Math.max(0,Math.min(1,robScore));
const defs=[{key:'profitability',label:'Profitability',weight:0.25,value:profScore},{key:'margins',label:'Margin quality',weight:0.20,value:margScore},cashScore!==null?{key:'cash',label:'Cash sustainability',weight:0.25,value:cashScore}:null,{key:'growth',label:'Growth trajectory',weight:0.15,value:growScore},{key:'robustness',label:'Downside robustness',weight:0.15,value:robScore}].filter(Boolean);
const tw=defs.reduce((s,c)=>s+c.weight,0);const comps=defs.map(c=>({...c,weight:c.weight/tw}));
const score=Math.round(comps.reduce((s,c)=>s+c.weight*c.value*100,0));
let label,tone;if(score>=75){label='Strong';tone=C.green;}else if(score>=55){label='Promising';tone=C.green;}else if(score>=35){label='Marginal';tone=C.gold;}else{label='Concept';tone=C.rust;}
return{score,label,tone,breakdown:comps};
}

function generateInsights(computedAll,periods,sectorKey,granularity,enabledStatements,rows,rowData){
const insights=[];const sector=BB[sectorKey]||BB.other;const stmts=enabledStatements||{income:true,balance:false,cashFlow:false};
const base=computedAll.base?.values||{};const worst=computedAll.worst?.values||{};
const rev=base.revenue||[];const gp=base.grossProfit||[];const ni=base.netIncome||[];const cashW=worst.cash||[];
if(!rev.length)return insights;
const lastRev=rev[rev.length-1]||0;
if(lastRev>0){const lGM=(gp[gp.length-1]/lastRev)*100;const[bMin,bMax]=sector.benchmarks.grossMargin;if(lGM>bMax+10)insights.push({level:'warn',title:'Gross margin well above sector typical',body:`Your gross margin (${lGM.toFixed(0)}%) is ${(lGM-bMax).toFixed(0)} pts above typical for ${sector.label} (${bMin}–${bMax}%).`});else if(lGM<bMin-5)insights.push({level:'error',title:'Gross margin below sector typical',body:`Your gross margin (${lGM.toFixed(0)}%) is below the ${bMin}% floor for ${sector.label}.`});}
let cumNI=0,lowCum=0;for(const v of ni){cumNI+=v;if(cumNI<lowCum)lowCum=cumNI;}
if(cumNI<0)insights.push({level:'error',title:'Cumulative net income stays negative',body:`The business loses ${fmt(cumNI,{paren:true,abbreviate:true})} cumulatively. The model is not self-sustaining.`});
else if(lowCum<-Math.abs(rev[0])*0.5&&cumNI>0)insights.push({level:'info',title:'Significant capital required before profit',body:`Cumulative losses reach ${fmt(lowCum,{paren:true,abbreviate:true})} before turning positive.`});
if(stmts.balance){const wN=cashW.filter(c=>c<0).length;if(wN>0)insights.push({level:'error',title:'Worst-case runs out of cash',body:`Cash goes negative in ${wN} period${wN>1?'s':''} in the Worst scenario.`});}
let cum=0,beIdx=null;for(let i=0;i<ni.length;i++){cum+=ni[i];if(cum>=0&&beIdx===null)beIdx=i;}
if(beIdx===0)insights.push({level:'info',title:'Profitable from period one',body:'Cumulative income is positive immediately. Either capital-light, or starting expenses are understated.'});
return insights;
}

function computeTornadoSensitivity(rows,rowData,numPeriods){
const base=computeScenario(rows,rowData,numPeriods);const baseCum=(base.values.netIncome||[]).reduce((a,b)=>a+b,0);
const candidates=rows.income.filter(r=>r.type==='leaf');const results=[];
for(const r of candidates){
const entry=rowData[r.id];if(!entry)continue;
const shift=(factor)=>{const s={...rowData};const n={...entry};if(entry.mode==='manual')n.manualValues=entry.manualValues.map(v=>v*factor);else if(entry.mode==='flatGrowth'||entry.mode==='customGrowth'||entry.mode==='decline')n.baseValue=entry.baseValue*factor;else if(entry.mode==='percentOfRevenue')n.pctOfRev=entry.pctOfRev*factor;s[r.id]=n;return s;};
const upC=(computeScenario(rows,shift(1.2),numPeriods).values.netIncome||[]).reduce((a,b)=>a+b,0);
const dnC=(computeScenario(rows,shift(0.8),numPeriods).values.netIncome||[]).reduce((a,b)=>a+b,0);
const uD=upC-baseCum,dD=dnC-baseCum,sw=Math.abs(uD)+Math.abs(dD);
if(sw>1)results.push({rowId:r.id,label:r.label,baseline:baseCum,upDelta:uD,downDelta:dD,totalSwing:sw});
}
results.sort((a,b)=>b.totalSwing-a.totalSwing);return results.slice(0,8);
}

function useTween(value,duration=480){
const[v,setV]=useState(value);const fromRef=useRef(value);const startRef=useRef(performance.now());
useEffect(()=>{fromRef.current=v;startRef.current=performance.now();let raf;const tick=(now)=>{const t=Math.min(1,(now-startRef.current)/duration);const eased=1-Math.pow(1-t,3);setV(fromRef.current+(value-fromRef.current)*eased);if(t<1)raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);},[value,duration]);// eslint-disable-line
return v;
}
function useFlicker(key){const[n,setN]=useState(0);const lk=useRef(key);useEffect(()=>{if(lk.current!==key){lk.current=key;setN(x=>x+1);}},[key]);return n;}

const Eyebrow=({children,color,className='',style={}})=>(<div className={`label-eyebrow ff-body ${className}`} style={{color:color||C.muted,...style}}>{children}</div>);
const Ornament=({style={}})=>(<div className="flex items-center justify-center gap-2" style={style}><div style={{width:28,height:1,background:C.border}}/><div style={{width:4,height:4,transform:'rotate(45deg)',background:C.gold}}/><div style={{width:28,height:1,background:C.border}}/></div>);
const AnimatedNumber=({value,format=(v)=>fmt(v),tweenKey,className='',style={}})=>{const inM=React.useContext(MillionsCtx);const tw=useTween(value);const fk=useFlicker(tweenKey);const f=inM?fmtM:format;return (<span key={fk} className={`flicker ${className}`} style={style}>{f(tw)}</span>);};

// Comma-aware number input: shows formatted on blur, raw on focus
function NumberInput({value,onChange,className='',style={},onFocus,onBlur,placeholder='0'}){
const[focused,setFocused]=useState(false);const[draft,setDraft]=useState('');
const inM=React.useContext(MillionsCtx);
const num=typeof value==='number'&&!Number.isNaN(value)?value:0;
const display=focused?draft:(num===0?'':(inM?fmtM(num):num.toLocaleString('en-US')));
return(<input type="text" inputMode="decimal" value={display} placeholder={placeholder} className={className} style={style}
onFocus={(e)=>{setFocused(true);setDraft(inM?(num===0?'':String(num/1e6)):(num===0?'':String(num)));setTimeout(()=>{try{e.target.select();}catch{}},0);onFocus?.(e);}}
onChange={(e)=>{let raw=e.target.value.replace(/[^0-9.,\-]/g,'');const fd=raw.indexOf('.');if(fd>=0)raw=raw.slice(0,fd+1)+raw.slice(fd+1).replace(/\./g,'');setDraft(raw);const cl=raw.replace(/,/g,'');if(!cl||cl==='-'||cl==='.')return;const p=Number(cl);if(!Number.isNaN(p))onChange(inM?Math.round(p*1e6):p);}}
onBlur={(e)=>{setFocused(false);setDraft('');onBlur?.(e);}}/>);
}

function smoothPath(points){if(points.length<2)return'';let d=`M ${points[0][0]},${points[0][1]}`;for(let i=0;i<points.length-1;i++){const p0=points[i-1]||points[i],p1=points[i],p2=points[i+1],p3=points[i+2]||p2;const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;d+=` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;}return d;}
const Sparkline=({values=[],width=80,height=24,color=C.ink,fillOpacity=0.12,showZero=true,showLastDot=true,smooth=false})=>{
if(!values.length)return null;
const max=Math.max(...values,0),min=Math.min(...values,0),range=max-min||1;
const step=values.length>1?width/(values.length-1):0;
const pts=values.map((v,i)=>[i*step,height-((v-min)/range)*height]);
const pathD=(smooth&&pts.length>2)?smoothPath(pts):'M '+pts.map(p=>p.join(',')).join(' L ');
const areaD=`${pathD} L ${width},${height} L 0,${height} Z`;
const zeroY=(min<0&&max>0)?height-((0-min)/range)*height:null;
const lp=pts[pts.length-1];
return(<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow:'visible',display:'block'}}><path d={areaD} fill={color} fillOpacity={fillOpacity}/>{showZero&&zeroY!==null&&<line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke={C.faint} strokeWidth="0.5" strokeDasharray="2 2"/>}<path d={pathD} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>{showLastDot&&lp&&<circle cx={lp[0]} cy={lp[1]} r="2" fill={color}/>}</svg>);
};

const MODE_META={manual:{label:'Manual values',short:'Manual',icon:Edit3,blurb:'Type each period independently.'},flatGrowth:{label:'Flat % growth',short:'Flat %',icon:TrendingUp,blurb:'Set Y0 base + one growth rate.'},customGrowth:{label:'Custom % per period',short:'Custom %',icon:Sliders,blurb:'Set Y0 base + different rate each period.'},percentOfRevenue:{label:'% of revenue',short:'% of Rev',icon:Percent,blurb:'Value = revenue × this %.'},decline:{label:'Fixed paydown',short:'Paydown',icon:TrendingDown,blurb:'Start at a base, subtract a fixed amount each period (e.g. debt repayment). Floors at 0.'}};

function ModeMenu({currentMode,onChange,allowed}){
const[open,setOpen]=useState(false);
const[menuPos,setMenuPos]=useState({top:0,left:0});
const ref=useRef(null);const btnRef=useRef(null);const portalRef=useRef(null);
// portalRef must also be checked — the portal is in document.body, outside ref,
// so without it every mousedown on a menu item fires the "outside" handler first,
// closing the menu before the item's onClick can register.
useEffect(()=>{const h=(e)=>{if(ref.current&&!ref.current.contains(e.target)&&!(portalRef.current&&portalRef.current.contains(e.target)))setOpen(false);};if(open)document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[open]);
const Icon=MODE_META[currentMode].icon;
const handleOpen=()=>{if(btnRef.current){const r=btnRef.current.getBoundingClientRect();setMenuPos({top:r.bottom+4,left:r.left});}setOpen(o=>!o);};
return(<div className="relative" ref={ref}>
<button ref={btnRef} onClick={handleOpen} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] ff-body" style={{background:open?C.surfaceAlt:'transparent',color:C.ink2,border:`1px solid ${open?C.border:'transparent'}`}}><Icon size={12}/><span>{MODE_META[currentMode].short}</span><ChevronDown size={11} style={{opacity:0.6}}/></button>
{open&&ReactDOM.createPortal(<div ref={portalRef} className="anim-fade-in" style={{position:'fixed',top:menuPos.top,left:menuPos.left,width:252,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,boxShadow:'0 10px 28px -8px rgba(15,23,42,0.18)',zIndex:9999}}>
{allowed.map(m=>{const M=MODE_META[m];const I=M.icon;const active=m===currentMode;return(<button key={m} onClick={()=>{onChange(m);setOpen(false);}} className="w-full text-left px-3 py-2.5 ff-body text-[12px] flex items-start gap-2.5" style={{background:active?C.greenSoft:'transparent',borderBottom:`1px solid ${C.border}55`}}><I size={13} style={{marginTop:2,color:active?C.green:C.ink2}}/><div className="flex-1"><div style={{color:C.ink,fontWeight:500}}>{M.label}</div><div style={{color:C.muted,fontSize:10.5,marginTop:1}}>{M.blurb}</div></div>{active&&<Check size={12} style={{color:C.green,marginTop:3}}/>}</button>);})}
</div>,document.body)}
</div>);
}

function CustomGrowthModal({row,entry,periods,onClose,onChange}){
const[base,setBase]=useState(entry.baseValue||0);const[rates,setRates]=useState(entry.customRates.slice());
const preview=useMemo(()=>{const out=[Math.round(+base||0)];for(let i=0;i<rates.length;i++){const r=(+rates[i]||0)/100;out.push(Math.round(out[out.length-1]*(1+r)));}return out;},[base,rates]);
return(<div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{background:'rgba(15,23,42,0.36)'}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="w-full max-w-2xl mx-4 rounded-lg overflow-hidden shadow-2xl" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="flex items-start justify-between px-6 pt-5 pb-4" style={{borderBottom:`1px solid ${C.border}`}}><div><Eyebrow color={C.gold}>Custom growth · per period</Eyebrow><h3 className="ff-display text-[28px] leading-tight mt-1" style={{color:C.ink}}>{row.label}</h3></div><button onClick={onClose} className="p-1.5 rounded-md mt-1" style={{color:C.ink2}}><X size={18}/></button></div>
<div className="p-6 space-y-5">
<div><Eyebrow className="mb-2">{periods[0]} starting value</Eyebrow><NumberInput value={base} onChange={setBase} className="w-full px-3 py-2 rounded-md ff-num text-[15px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/></div>
<div><Eyebrow className="mb-2">Growth rate per period</Eyebrow><div className="grid gap-2" style={{gridTemplateColumns:`repeat(${Math.min(rates.length||1,4)},minmax(0,1fr))`}}>{rates.map((r,i)=>(<div key={i}><div className="text-[10px] ff-body mb-1 flex items-center gap-1" style={{color:C.muted}}><span className="ff-num">{periods[i]}</span><span>→</span><span className="ff-num">{periods[i+1]}</span></div><div className="relative"><input type="number" value={r} onChange={e=>{const n=rates.slice();n[i]=e.target.value;setRates(n);}} className="w-full pl-2.5 pr-7 py-2 rounded-md ff-num text-[13px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/><span className="absolute right-2.5 top-1/2 -translate-y-1/2 ff-num text-[12px]" style={{color:C.muted}}>%</span></div></div>))}</div></div>
<div className="pt-1"><Eyebrow className="mb-2">Live preview</Eyebrow><div className="rounded-md p-4" style={{background:C.bg,border:`1px solid ${C.border}`}}><div className="flex items-end justify-between mb-3"><Sparkline values={preview} width={Math.min(420,preview.length*38)} height={48} color={C.green} smooth/><div className="ff-num text-[11px] flex flex-col items-end" style={{color:C.muted}}><span>start</span><span style={{color:C.ink}}>{fmt(preview[0])}</span><span className="mt-1">end</span><span style={{color:C.ink}}>{fmt(preview[preview.length-1])}</span></div></div><div className="grid gap-2 pt-3" style={{gridTemplateColumns:`repeat(${Math.min(preview.length,6)},minmax(0,1fr))`,borderTop:`1px solid ${C.border}`}}>{preview.map((v,i)=>(<div key={i}><div className="text-[10px] ff-body mb-0.5" style={{color:C.muted}}>{periods[i]}</div><div className="ff-num text-[14px]" style={{color:C.ink}}>{fmt(v)}</div></div>))}</div></div></div>
</div>
<div className="flex items-center justify-end gap-2 px-6 py-3" style={{borderTop:`1px solid ${C.border}`,background:C.surfaceAlt}}><button onClick={onClose} className="px-3 py-1.5 rounded-md ff-body text-[12px]" style={{color:C.ink2}}>Cancel</button><button onClick={()=>{onChange({baseValue:+base||0,customRates:rates.map(r=>+r||0)});onClose();}} className="px-4 py-1.5 rounded-md ff-body text-[12px]" style={{background:C.ink,color:C.surface}}>Save rates</button></div>
</div></div>);
}

function AddRowMenu({statement,rows,existingLabels,onAdd,onClose}){
const parents=useMemo(()=>rows.filter(r=>r.type==='parent'),[rows]);
const[selParent,setSelParent]=useState(parents[0]?.id||null);const[custom,setCustom]=useState('');const[mode,setMode]=useState('manual');
const lib=(ROW_LIBRARY[statement]||{});const items=(selParent&&lib[selParent])||[];
return(<div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{background:'rgba(15,23,42,0.36)'}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="w-full max-w-2xl mx-4 rounded-lg overflow-hidden shadow-2xl" style={{background:C.surface,border:`1px solid ${C.border}`,maxHeight:'85vh'}}>
<div className="flex items-start justify-between px-6 pt-5 pb-4" style={{borderBottom:`1px solid ${C.border}`}}><div><Eyebrow color={C.gold}>Add to statement</Eyebrow><h3 className="ff-display text-[28px] leading-tight mt-1" style={{color:C.ink}}>Line item library</h3></div><button onClick={onClose} className="p-1.5 rounded-md mt-1" style={{color:C.ink2}}><X size={18}/></button></div>
<div className="p-6 space-y-4 overflow-y-auto" style={{maxHeight:'calc(85vh - 180px)'}}>
<div><Eyebrow className="mb-2">Add under</Eyebrow><div className="flex gap-1.5 flex-wrap">{parents.map(p=>(<button key={p.id} onClick={()=>setSelParent(p.id)} className="px-3 py-1.5 rounded-md ff-body text-[12px]" style={{background:selParent===p.id?C.ink:C.bg,border:`1px solid ${selParent===p.id?C.ink:C.border}`,color:selParent===p.id?C.surface:C.ink2,fontWeight:selParent===p.id?500:400}}>{p.label}</button>))}</div></div>
{items.length>0&&<div><Eyebrow className="mb-2">Suggested</Eyebrow><div className="grid grid-cols-2 gap-1.5">{items.filter(it=>!existingLabels.includes(it.label.toLowerCase())).map((it,i)=>(<button key={i} onClick={()=>onAdd({label:it.label,parentId:selParent,defaultMode:it.defaultMode})} className="text-left px-3 py-2 rounded-md ff-body text-[12.5px] flex items-center justify-between row-hover" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}><span>{it.label}</span><Plus size={13} style={{color:C.muted}}/></button>))}</div></div>}
<div className="pt-3" style={{borderTop:`1px solid ${C.border}`}}><Eyebrow className="mb-2 mt-2">Custom item</Eyebrow><div className="flex gap-2"><input type="text" placeholder="Line item name" value={custom} onChange={e=>setCustom(e.target.value)} className="flex-1 px-3 py-2 rounded-md ff-body text-[13px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/><select value={mode} onChange={e=>setMode(e.target.value)} className="px-2 py-2 rounded-md ff-body text-[12px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}><option value="manual">Manual</option><option value="flatGrowth">Flat %</option><option value="customGrowth">Custom %</option>{statement==='income'&&selParent!=='rev'&&<option value="percentOfRevenue">% of Rev</option>}</select><button onClick={()=>{if(!custom.trim()||!selParent)return;onAdd({label:custom.trim(),parentId:selParent,defaultMode:mode});setCustom('');}} className="px-3 py-2 rounded-md ff-body text-[12px]" style={{background:C.ink,color:C.surface}}>Add</button></div></div>
</div></div></div>);
}

// ── CSV / file import helpers ────────────────────────────────────────────────
// Splits one CSV line into cells, honoring "quoted, fields" and "" escapes.
function splitCSVLine(line){const cells=[];let cur='',inQ=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}else if(ch===','&&!inQ){cells.push(cur);cur='';}else cur+=ch;}cells.push(cur);return cells.map(c=>c.trim());}
function parseCSVGrid(text){return text.replace(/\r\n?/g,'\n').split('\n').filter(l=>l.trim().length).map(splitCSVLine);}
function csvNum(s){if(s==null)return null;const v=parseFloat(String(s).replace(/[$,%\s()]/g,''));if(!isFinite(v))return null;return /^\s*\(/.test(String(s))?-v:v;}
// Line items the engine computes itself — never import them as data rows.
const CSV_COMPUTED=['gross profit','operating income','operating income (ebit)','ebit','pretax income','pre-tax income','pretax','net income','total revenue','revenue','cost of revenue','operating expenses','non-operating items','total liabilities + equity','net change in cash','cash from operations','cash from investing','cash from financing'];
function csvClassify(label){const l=label.toLowerCase();if(/cogs|cost of (revenue|goods|sales)|direct (material|labor|cost)|materials|fulfillment|hosting|shipping|payment processing/.test(l))return 'cogs';if(/tax/.test(l)&&!/before tax/.test(l))return 'tax';if(/revenue|sales|turnover|bookings|fees earned/.test(l)&&!/cost|expense/.test(l))return 'rev';return 'opex';}
// Build a full editable income-statement model from a CSV the user uploads.
// Honest mapping only: real numbers go to manual line items; computed rows recompute.
function buildStateFromCSV(text){
const grid=parseCSVGrid(text);if(!grid.length)throw new Error('The file is empty.');
// Locate the header row (starts with "Line Item"/"Item") and how many period columns it has.
let headerIdx=grid.findIndex(r=>/^(line item|item|name|account)$/i.test((r[0]||'').trim()));
if(headerIdx<0)headerIdx=grid.findIndex(r=>r.length>=2&&r.slice(1).some(c=>csvNum(c)!==null));
if(headerIdx<0)throw new Error('Could not find a table with period columns.');
const header=grid[headerIdx];
let P=0;for(let i=headerIdx+1;i<grid.length;i++){const cnt=grid[i].slice(1).filter(c=>csvNum(c)!==null).length;if(cnt>P)P=cnt;}
P=Math.max(1,Math.min(20,P||header.slice(1).length||5));
// Granularity + start year from the period header labels.
const labels=header.slice(1,P+1);const isQuarterly=labels.some(l=>/q[1-4]/i.test(l));
const yearMatch=labels.join(' ').match(/(19|20)\d{2}/);const startYear=yearMatch?parseInt(yearMatch[0],10):new Date().getFullYear();
// Collect data rows for the income statement only (stop at balance-sheet/cash-flow sections).
const items=[];let stop=false;
for(let i=headerIdx+1;i<grid.length&&!stop;i++){const r=grid[i];const raw=(r[0]||'').replace(/^"|"$/g,'').trim();if(!raw)continue;const low=raw.toLowerCase();
if(/^(balance sheet|cash flow statement)/i.test(raw)){stop=true;break;}
if(/^income statement$/i.test(raw)||/^(line item|item|name|account)$/i.test(low))continue;
if(CSV_COMPUTED.includes(low))continue;
const vals=[];for(let c=1;c<=P;c++)vals.push(csvNum(r[c])||0);
if(vals.every(v=>v===0))continue; // skip blank rows
items.push({label:raw,vals,group:csvClassify(raw)});}
if(!items.length)throw new Error('No numeric line items were found to import.');
// Assemble rows: keep the standard parents + computed rows, drop default seed leaves, append imported leaves.
const keep=new Set(['rev','cogs','gross','opex','op-inc','non-op','pretax','tax','net-inc']);
const income=TEMPLATES.income.filter(r=>r.type!=='leaf'||keep.has(r.id)).map(r=>({...r}));
const scen=['base','best','worst'];const rowData={base:{},best:{},worst:{}};
// tax row is a standard leaf already in the template — seed it blank, fill if found.
for(const sc of scen)rowData[sc]['tax']=makeRowDataEntry('manual',P);
for(const it of items){
if(it.group==='tax'){for(const sc of scen)rowData[sc]['tax']={mode:'manual',baseValue:0,flatRate:0,customRates:[],pctOfRev:0,manualValues:it.vals.slice()};continue;}
const parentId=it.group==='rev'?'rev':it.group==='cogs'?'cogs':'opex';
const id=newRowId(parentId);
income.push({id,label:it.label,type:'leaf',parentId,defaultMode:'manual',deletable:true});
for(const sc of scen)rowData[sc][id]={mode:'manual',baseValue:0,flatRate:0,customRates:[],pctOfRev:0,manualValues:it.vals.slice()};}
return{granularity:isQuarterly?'quarterly':'annual',numPeriods:P,startYear,activeScenario:'base',rows:{income,balance:[],cashFlow:[]},rowData,enabledStatements:{income:true,balance:false,cashFlow:false},__importSummary:{count:items.length,periods:P,rev:items.filter(i=>i.group==='rev').length,cogs:items.filter(i=>i.group==='cogs').length,opex:items.filter(i=>i.group==='opex').length}};
}
// Detect what a pasted/dropped blob is and turn it into loadable state.
function interpretImport(text,filename){
const looksJSON=/\.json$/i.test(filename||'')||/^\s*[{[]/.test(text);
if(looksJSON){const obj=JSON.parse(text);if(!obj||!obj.rows||!obj.rowData)throw new Error('That JSON is not a saved model (missing rows/rowData).');return obj;}
return buildStateFromCSV(text);
}

function SaveLoadModal({state,onLoad,onClose}){
const[text,setText]=useState(JSON.stringify(state,null,2));const[error,setError]=useState(null);const[note,setNote]=useState(null);const[drag,setDrag]=useState(false);const fileRef=useRef(null);
const handleFile=(file)=>{if(!file)return;setError(null);setNote(null);const rd=new FileReader();rd.onload=()=>{const content=String(rd.result||'');setText(content);try{const st=interpretImport(content,file.name);if(st.__importSummary){const s=st.__importSummary;setNote(`Ready to import ${s.count} line items across ${s.periods} periods (${s.rev} revenue · ${s.cogs} cost · ${s.opex} expense). Click "Load file".`);}else setNote('Saved model detected. Click "Load file" to restore.');}catch(e){setError(e.message);}};rd.onerror=()=>setError('Could not read that file.');rd.readAsText(file);};
const doLoad=()=>{try{const st=interpretImport(text,'');const{__importSummary,...clean}=st;onLoad(clean);onClose();}catch(e){setError(e.message||'Could not read the data.');}};
return(<div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{background:'rgba(15,23,42,0.36)'}} onClick={onClose}><div onClick={e=>e.stopPropagation()} className="w-full max-w-3xl mx-4 rounded-lg overflow-hidden shadow-2xl" style={{background:C.surface,border:`1px solid ${C.border}`,maxHeight:'90vh'}}>
<div className="flex items-start justify-between px-6 pt-5 pb-4" style={{borderBottom:`1px solid ${C.border}`}}><div><Eyebrow color={C.gold}>Import &amp; backup</Eyebrow><h3 className="ff-display text-[28px] leading-tight mt-1" style={{color:C.ink}}>Upload a file or paste data</h3></div><button onClick={onClose} className="p-1.5 rounded-md mt-1" style={{color:C.ink2}}><X size={18}/></button></div>
<div className="p-6 space-y-4 overflow-y-auto" style={{maxHeight:'calc(90vh - 170px)'}}>
<input ref={fileRef} type="file" accept=".csv,.json,.txt,text/csv,application/json" style={{display:'none'}} onChange={e=>handleFile(e.target.files&&e.target.files[0])}/>
<div onClick={()=>fileRef.current&&fileRef.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files&&e.dataTransfer.files[0]);}} className="rounded-lg flex flex-col items-center justify-center text-center cursor-pointer" style={{border:`1.5px dashed ${drag?C.gold:C.border}`,background:drag?C.goldSoft:C.bg,padding:'26px 20px',transition:'all .15s'}}>
<Upload size={22} style={{color:drag?C.gold:C.muted}}/>
<div className="ff-body mt-2.5" style={{fontSize:14,fontWeight:600,color:C.ink}}>Drop a file here, or click to browse</div>
<div className="ff-body mt-1" style={{fontSize:12,color:C.muted}}>CSV spreadsheet (line items × periods) or a saved <span className="ff-num">.json</span> model</div>
<div className="flex items-center gap-4 mt-3"><span className="ff-body flex items-center gap-1.5" style={{fontSize:11.5,color:C.muted}}><FileSpreadsheet size={13}/> .csv</span><span className="ff-body flex items-center gap-1.5" style={{fontSize:11.5,color:C.muted}}><FileText size={13}/> .json</span></div>
</div>
{note&&<div className="ff-body rounded-md px-3 py-2.5" style={{fontSize:12.5,color:C.green,background:C.greenSoft,border:`1px solid ${C.green}44`}}>{note}</div>}
{error&&<div className="ff-body rounded-md px-3 py-2.5" style={{fontSize:12.5,color:C.rust,background:C.rustSoft,border:`1px solid ${C.rust}44`}}>{error}</div>}
<div><div className="flex items-center justify-between mb-2"><Eyebrow>Or paste / review data</Eyebrow><span className="ff-body" style={{fontSize:11,color:C.faint}}>CSV or JSON</span></div>
<textarea value={text} onChange={e=>{setText(e.target.value);setError(null);setNote(null);}} spellCheck={false} className="w-full p-3 rounded-md ff-num text-[11px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink,minHeight:200,lineHeight:1.5}}/></div>
<p className="ff-body" style={{fontSize:11.5,color:C.muted}}>CSV format: first column = line item names, following columns = one value per period. Revenue / cost / expense rows are detected automatically; totals like Gross Profit and Net Income are recomputed for you.</p>
</div>
<div className="flex items-center justify-between gap-2 px-6 py-3" style={{borderTop:`1px solid ${C.border}`,background:C.surfaceAlt}}>
<button onClick={()=>{navigator.clipboard?.writeText(JSON.stringify(state,null,2));setNote('Current model copied to clipboard as JSON.');}} className="px-3 py-1.5 rounded-md ff-body text-[12px] flex items-center gap-1.5" style={{color:C.ink2,border:`1px solid ${C.border}`,background:C.surface}}><Download size={12}/> Copy current model</button>
<button onClick={doLoad} className="px-4 py-1.5 rounded-md ff-body text-[12px] flex items-center gap-1.5" style={{background:C.ink,color:C.surface}}><Upload size={13}/> Load file</button></div>
</div></div>);
}

// Hierarchical TableRow
function HRow({row,depth,isExpanded,hasChildren,onToggle,entry,computedValues,revenueValues,periods,onUpdateData,onDelete,onOpenCustom,scenarioKey}){
const indent=8+depth*20;
const isParent=row.type==='parent',isComp=row.type==='computed',isLeaf=row.type==='leaf';
const sColor=(()=>{if(!computedValues||computedValues.length<2)return C.ink2;if(isComp)return C.green;if(isParent)return C.ink;const l=computedValues[computedValues.length-1],f=computedValues[0];if(l<0)return C.rust;if(l<f)return C.gold;return C.green;})();
const isTotal=isComp&&(row.id==='net-inc'||row.id==='cf-net'||row.id==='cf-fcf'||row.id==='total-le');
const grid={gridTemplateColumns:`300px repeat(${periods.length},minmax(78px,1fr)) 84px 56px`};

if(isParent||isComp){
const bg=isTotal?C.greenSoft:isParent&&depth===0?C.bgWarm:C.surface;
const fw=isTotal||isParent&&depth===0?600:500;
return(<div className="grid items-center" style={{...grid,background:bg,borderTop:isTotal?`1px solid ${C.green}66`:`1px solid ${C.border}`,borderBottom:isTotal?`1px solid ${C.green}66`:'none'}}>
<div className="ff-body py-2.5 text-[13px] flex items-center gap-1" style={{color:isComp?C.green:C.ink,fontWeight:fw,paddingLeft:indent}}>
{isParent&&hasChildren?<button onClick={onToggle} className="p-0.5 rounded" style={{color:C.muted,marginLeft:-4}}><ChevronRight size={14} className={isExpanded?'chevron-exp':'chevron-col'}/></button>:<span style={{width:18,display:'inline-block'}}/>}
{isComp&&<span className="ff-display text-[14px] italic" style={{color:C.green,marginRight:2}}>=</span>}
<span className="truncate">{row.label}</span>
<HelpTooltip glossaryKey={row.id} term={row.label}/>
</div>
{periods.map((_,i)=>{const v=computedValues?.[i]??0;return(<div key={i} className="ff-num px-3 py-2.5 text-right text-[13px]" style={{color:isComp?C.green:v<0?C.rust:C.ink,fontWeight:fw}}><AnimatedNumber value={v} tweenKey={`${row.id}-${i}-${scenarioKey}`} format={x=>fmt(x,{paren:true})}/></div>);})}
<div className="flex items-center justify-center px-2"><Sparkline values={computedValues||[]} color={sColor} width={70} height={20} smooth/></div>
<div/>
</div>);
}

// Linked rows (e.g. cash-flow Net Income) pull their value from another
// statement — render read-only so users don't try to overtype a 0.
if(row.linked){
return(<div className="grid items-center" style={{...grid,borderTop:`1px solid ${C.borderSoft}`,background:C.bgWarm}}>
<div className="py-2 flex items-center gap-2 min-w-0" style={{paddingLeft:indent}}>
<span style={{width:18,display:'inline-block'}}/>
<div className="flex-1 min-w-0">
<div className="flex items-center gap-1"><span className="ff-body text-[13px] truncate" style={{color:C.ink}}>{row.label}</span><HelpTooltip glossaryKey={row.id} term={row.label}/></div>
<div className="mt-0.5"><span className="ff-body text-[10px] px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1" style={{color:C.green,background:C.greenSoft,border:`1px solid ${C.green}44`}}><RefreshCw size={9}/>{row.linkLabel||'auto-linked'}</span></div>
</div>
</div>
{periods.map((_,i)=>{const v=computedValues?.[i]??0;return(<div key={i} className="px-2 py-1.5 text-right ff-num text-[13px]" style={{color:v<0?C.rust:C.ink2}}><AnimatedNumber value={v} tweenKey={`${row.id}-${i}-${scenarioKey}`} format={x=>fmt(x,{paren:true})}/></div>);})}
<div className="flex items-center justify-center px-2"><Sparkline values={computedValues||[]} color={sColor} width={70} height={20} smooth/></div>
<div/>
</div>);
}

const mode=entry?.mode||'manual';
const isRevRow=row.parentId==='rev';
const allowed=['manual','flatGrowth','customGrowth','decline',...(isRevRow?[]:['percentOfRevenue'])];
// Switching mode carries the current computed series into the new mode's
// inputs so the numbers never reset to zero.
const changeMode=(m)=>{
  if(m===mode)return;
  const cur=computedValues||[];const patch={mode:m};
  if(m==='manual'){patch.manualValues=periods.map((_,i)=>cur[i]??0);}
  else if(m==='flatGrowth'){patch.baseValue=cur[0]??0;}
  else if(m==='decline'){patch.baseValue=cur[0]??0;if(!entry.declineAmount&&cur.length>1){patch.declineAmount=Math.max(0,Math.round((cur[0]-cur[cur.length-1])/Math.max(1,cur.length-1)));}}
  else if(m==='customGrowth'){patch.baseValue=cur[0]??0;patch.customRates=periods.slice(1).map((_,i)=>{const a=cur[i],b=cur[i+1];return(a&&a!==0)?Math.round(((b-a)/Math.abs(a))*1000)/10:0;});}
  else if(m==='percentOfRevenue'){const r0=revenueValues?.[0]||0;patch.pctOfRev=r0>0?Math.round((cur[0]/r0)*1000)/10:(entry.pctOfRev||0);}
  onUpdateData(patch);
};
const cells=[];
if(mode==='manual'){for(let i=0;i<periods.length;i++)cells.push(<NumberInput key={i} value={entry.manualValues[i]??0} onChange={v=>{const n=entry.manualValues.slice();n[i]=v;onUpdateData({manualValues:n});}} className="w-full px-2 py-1.5 ff-num text-right text-[13px] outline-none" style={{background:'transparent',color:C.ink,border:'1px solid transparent'}} onFocus={e=>{e.target.style.background=C.bg;e.target.style.borderColor=C.gold+'88';}} onBlur={e=>{e.target.style.background='transparent';e.target.style.borderColor='transparent';}}/>);}
else if(mode==='flatGrowth'||mode==='customGrowth'||mode==='decline'){cells.push(<NumberInput key={0} value={entry.baseValue||0} onChange={v=>onUpdateData({baseValue:v})} className="w-full px-2 py-1.5 ff-num text-right text-[13px] outline-none" style={{background:'transparent',color:C.ink,border:'1px solid transparent'}} onFocus={e=>{e.target.style.background=C.bg;e.target.style.borderColor=C.gold+'88';}} onBlur={e=>{e.target.style.background='transparent';e.target.style.borderColor='transparent';}}/>);for(let i=1;i<periods.length;i++)cells.push(<div key={i} className="px-2 py-1.5 text-right ff-num text-[13px]" style={{color:C.ink2}}><AnimatedNumber value={computedValues?.[i]??0} tweenKey={`${row.id}-${i}-${scenarioKey}`}/></div>);}
else if(mode==='percentOfRevenue'){for(let i=0;i<periods.length;i++)cells.push(<div key={i} className="px-2 py-1.5 text-right ff-num text-[13px]" style={{color:C.ink2}}><AnimatedNumber value={computedValues?.[i]??0} tweenKey={`${row.id}-${i}-${scenarioKey}`}/></div>);}

return(<div className="grid items-center row-hover" style={{...grid,borderTop:`1px solid ${C.borderSoft}`}}>
<div className="py-2 flex items-center gap-2 min-w-0" style={{paddingLeft:indent}}>
<span style={{width:18,display:'inline-block'}}/>
<div className="flex-1 min-w-0">
<div className="flex items-center gap-1"><span className="ff-body text-[13px] truncate" style={{color:C.ink}}>{row.label}</span><HelpTooltip glossaryKey={row.id} term={row.label}/></div>
<div className="mt-0.5 flex items-center gap-2 flex-wrap">
<ModeMenu currentMode={mode} onChange={changeMode} allowed={allowed}/>
{mode==='flatGrowth'&&<div className="flex items-center gap-1"><input type="number" value={entry.flatRate||0} onChange={e=>onUpdateData({flatRate:+e.target.value||0})} className="w-12 px-1.5 py-0.5 rounded-sm ff-num text-right text-[11px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/><span className="ff-num text-[10.5px]" style={{color:C.muted}}>%/per</span></div>}
{mode==='decline'&&<div className="flex items-center gap-1"><span className="ff-num text-[10.5px]" style={{color:C.muted}}>−</span><input type="number" value={entry.declineAmount||0} onChange={e=>onUpdateData({declineAmount:+e.target.value||0})} className="w-16 px-1.5 py-0.5 rounded-sm ff-num text-right text-[11px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/><span className="ff-num text-[10.5px]" style={{color:C.muted}}>/per</span></div>}
{mode==='percentOfRevenue'&&<div className="flex items-center gap-1"><input type="number" value={entry.pctOfRev||0} onChange={e=>onUpdateData({pctOfRev:+e.target.value||0})} className="w-12 px-1.5 py-0.5 rounded-sm ff-num text-right text-[11px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/><span className="ff-num text-[10.5px]" style={{color:C.muted}}>% of rev</span></div>}
{mode==='customGrowth'&&<button onClick={onOpenCustom} className="text-[10.5px] ff-body px-1.5 py-0.5 rounded-sm hover:underline" style={{color:C.gold,border:`1px solid ${C.border}`}}>edit rates →</button>}
</div>
</div>
</div>
{cells}
<div className="flex items-center justify-center px-2"><Sparkline values={computedValues||[]} color={sColor} width={70} height={20} smooth/></div>
<div className="flex items-center justify-end pr-3">{row.deletable&&<button onClick={onDelete} className="p-1 rounded opacity-25 hover:opacity-100" style={{color:C.rust}}><Trash2 size={13}/></button>}</div>
</div>);
}

function StatementTable({statementId,rows,rowData,computedValues,periods,expandedIds,onToggleExpand,onExpandAll,onCollapseAll,onUpdateRowData,onDeleteRow,onOpenCustom,onAddRow,scenarioKey}){
const inM=React.useContext(MillionsCtx);
const rowMap=useMemo(()=>Object.fromEntries(rows.map(r=>[r.id,r])),[rows]);
const visible=useMemo(()=>{const res=[];for(const r of rows){let cur=r.parentId,vis=true;while(cur){if(!expandedIds.has(cur)){vis=false;break;}cur=rowMap[cur]?.parentId??null;}if(!vis)continue;let depth=0;cur=r.parentId;while(cur){depth++;cur=rowMap[cur]?.parentId??null;}const hc=rows.some(x=>x.parentId===r.id);res.push({row:r,depth,hasChildren:hc});}return res;},[rows,expandedIds,rowMap]);
const tP=rows.filter(r=>r.type==='parent').length;const eP=rows.filter(r=>r.type==='parent'&&expandedIds.has(r.id)).length;
return(<div className="rounded-lg overflow-hidden" style={{background:C.surface,border:`1px solid ${C.border}`,minWidth:'max-content'}}>
{inM&&<div className="px-4 py-2 ff-body text-[11px] flex items-center gap-1.5" style={{background:C.goldSoft,borderBottom:`1px solid ${C.gold}44`,color:C.gold,fontWeight:500}}>Figures in millions — type <strong>1</strong> to enter $1,000,000</div>}
<div className="flex items-center justify-between px-3 py-2" style={{background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`}}>
<div className="flex items-center gap-2 ff-body text-[10.5px]" style={{color:C.muted}}><span className="label-eyebrow">Tree view</span><span>·</span><span>{eP} of {tP} expanded</span></div>
<div className="flex items-center gap-1"><button onClick={onExpandAll} className="px-2 py-0.5 rounded ff-body text-[10.5px]" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink2}}>Expand all</button><button onClick={onCollapseAll} className="px-2 py-0.5 rounded ff-body text-[10.5px]" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink2}}>Collapse all</button></div>
</div>
<div className="grid items-center" style={{gridTemplateColumns:`300px repeat(${periods.length},minmax(78px,1fr)) 84px 56px`,background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`}}>
<div className="px-4 py-2.5 label-eyebrow ff-body flex items-center gap-1.5" style={{color:C.muted}}>Line Item{inM&&<span className="ff-num" style={{color:C.gold,fontSize:9,fontWeight:700,letterSpacing:'0.12em'}}>$M</span>}</div>
{periods.map((p,i)=>(<div key={i} className="px-3 py-2.5 ff-body text-right" style={{color:C.ink2}}><span className="ff-num text-[11px]">{p}</span></div>))}
<div className="px-3 py-2.5 label-eyebrow ff-body text-center" style={{color:C.muted}}>Trend</div><div/>
</div>
{visible.map(({row,depth,hasChildren})=>(<HRow key={row.id} row={row} depth={depth} hasChildren={hasChildren} isExpanded={expandedIds.has(row.id)} onToggle={()=>onToggleExpand(row.id)} entry={rowData[row.id]} computedValues={computedValues[row.id]} revenueValues={computedValues.revenue} periods={periods} onUpdateData={p=>onUpdateRowData(row.id,p)} onDelete={()=>onDeleteRow(row.id)} onOpenCustom={()=>onOpenCustom(row)} scenarioKey={scenarioKey}/>))}
<div className="px-4 py-3" style={{background:C.surfaceAlt,borderTop:`1px solid ${C.border}`}}><button onClick={onAddRow} className="ff-body text-[12px] flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{color:C.ink2,background:C.surface,border:`1px solid ${C.border}`}}><Plus size={13}/>Add line item</button></div>
</div>);
}


function RatiosPanel({computed,periods,granularity}){
const rev=computed.values.revenue||[];const gp=computed.values.grossProfit||[];const op=computed.values.operatingIncome||[];const ni=computed.values.netIncome||[];const cash=computed.values.cash||[];const pm=granularity==='annual'?12:3;
const gM=rev.map((r,i)=>r>0?(gp[i]/r)*100:0);const oM=rev.map((r,i)=>r>0?(op[i]/r)*100:0);const nM=rev.map((r,i)=>r>0?(ni[i]/r)*100:0);
const rw=ni.map((inc,i)=>{if(inc>=0)return null;const mb=Math.abs(inc)/pm;if(mb===0)return null;return Math.round(cash[i]/mb);});
const Row=({label,vals,suffix='%',toneFn,hint,sparkValues,sparkColor})=>(<div className="grid items-center" style={{gridTemplateColumns:`220px repeat(${periods.length},minmax(70px,1fr)) 90px`,borderTop:`1px solid ${C.borderSoft}`}}><div className="px-5 py-2.5"><div className="ff-body text-[12.5px]" style={{color:C.ink2}}>{label}</div>{hint&&<div className="ff-body text-[10px] mt-0.5" style={{color:C.faint}}>{hint}</div>}</div>{vals.map((v,i)=>{const d=(v===null||Number.isNaN(v))?'—':(Math.round(v*10)/10).toFixed(1);const tone=toneFn?toneFn(v):C.ink;return(<div key={i} className="ff-num text-[12.5px] px-3 py-2.5 text-right" style={{color:tone}}>{d}{d!=='—'&&<span className="ml-0.5" style={{color:C.muted,fontSize:10}}>{suffix}</span>}</div>);})}<div className="flex items-center justify-center px-2"><Sparkline values={sparkValues} color={sparkColor||C.ink2} width={72} height={20} smooth/></div></div>);
return(<div className="space-y-5">
<div className="rounded-lg overflow-hidden" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="px-5 pt-4 pb-3 flex items-baseline justify-between flex-wrap gap-2" style={{borderBottom:`1px solid ${C.border}`}}><div><Eyebrow color={C.gold}>Per-period analysis</Eyebrow><h3 className="ff-display text-[24px] leading-tight mt-0.5" style={{color:C.ink}}>Margin & runway profile</h3></div><span className="ff-body text-[11px]" style={{color:C.muted}}>{granularity==='annual'?'Annual':'Quarterly'} · {periods.length} periods</span></div>
<div className="grid items-center" style={{gridTemplateColumns:`220px repeat(${periods.length},minmax(70px,1fr)) 90px`,background:C.surfaceAlt,borderBottom:`1px solid ${C.border}`}}><div className="px-5 py-2.5 label-eyebrow" style={{color:C.muted}}>Ratio</div>{periods.map((p,i)=>(<div key={i} className="px-3 py-2.5 ff-num text-right text-[11px]" style={{color:C.ink2}}>{p}</div>))}<div className="px-3 py-2.5 label-eyebrow text-center" style={{color:C.muted}}>Trend</div></div>
<Row label="Gross Margin" hint="(Revenue − COGS) / Revenue" vals={gM} sparkValues={gM} sparkColor={C.green} toneFn={v=>v<0?C.rust:C.ink}/>
<Row label="Operating Margin" hint="EBIT as % of revenue" vals={oM} sparkValues={oM} sparkColor={oM[oM.length-1]>0?C.green:C.rust} toneFn={v=>v<0?C.rust:C.ink}/>
<Row label="Net Margin" hint="Bottom line as % of revenue" vals={nM} sparkValues={nM} sparkColor={nM[nM.length-1]>0?C.green:C.rust} toneFn={v=>v<0?C.rust:C.ink}/>
<Row label="Runway (months)" hint="Cash ÷ monthly net loss; ∞ if profitable" vals={rw} suffix="mo" sparkValues={rw.map(v=>v===null?0:Math.max(0,v))} sparkColor={C.gold} toneFn={v=>v===null?C.green:v<12?C.rust:C.ink}/>
</div>
<div className="rounded-lg p-6" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="flex items-baseline justify-between mb-4 flex-wrap gap-2"><div><Eyebrow color={C.gold}>Visualization</Eyebrow><h3 className="ff-display text-[24px] leading-tight mt-0.5" style={{color:C.ink}}>Net income across the horizon</h3></div><div className="ff-body text-[11px]" style={{color:C.muted}}>Line below zero = loss period</div></div>
{(()=>{const W=1000,H=150,padTop=22,padBot=10,gh=H-padTop-padBot;const max=Math.max(...ni,0),min=Math.min(...ni,0),range=(max-min)||1;const x=i=>ni.length>1?(i/(ni.length-1))*W:W/2;const y=v=>padTop+gh-((v-min)/range)*gh;const zeroY=y(0);const pts=ni.map((v,i)=>[x(i),y(v)]);const lineD=pts.length>1?(pts.length>2?smoothPath(pts):'M '+pts.map(p=>p.join(',')).join(' L ')):'';const areaD=lineD?`${lineD} L ${x(ni.length-1)},${zeroY} L ${x(0)},${zeroY} Z`:'';const lastPos=ni[ni.length-1]>=0;const lineColor=lastPos?C.green:C.rust;return(
<svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block',height:160,overflow:'visible'}}>
<defs><linearGradient id="niFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={lineColor} stopOpacity="0.22"/><stop offset="100%" stopColor={lineColor} stopOpacity="0.02"/></linearGradient></defs>
<line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke={C.border} strokeWidth="1" strokeDasharray="4 4"/>
{areaD&&<path d={areaD} fill="url(#niFill)"/>}
{lineD&&<path d={lineD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
{pts.map((p,i)=>{const v=ni[i];const pos=v>=0;return(<g key={i}><circle cx={p[0]} cy={p[1]} r="4" fill={pos?C.green:C.rust} stroke={C.surface} strokeWidth="1.5"/><text x={p[0]} y={pos?p[1]-10:p[1]+18} textAnchor="middle" style={{fontSize:13,fill:pos?C.green:C.rust,fontWeight:600}} className="ff-num">{fmt(v,{abbreviate:true})}</text></g>);})}
</svg>);})()}
<div className="flex pt-2 px-2" style={{borderTop:`1px solid ${C.border}`}}>{periods.map((p,i)=>(<div key={i} className="flex-1 ff-num text-[10.5px] text-center" style={{color:C.muted}}>{p}</div>))}</div>
</div>
</div>);
}

function BreakEvenPanel({computed,periods,granularity}){
const[fc,setFc]=useState(50000);const[vc,setVc]=useState(40);
const beRev=useMemo(()=>{const cm=1-(vc/100);if(cm<=0)return null;return Math.round(fc/cm);},[fc,vc]);
const ni=computed.values.netIncome||[];let cum=0,beP=null;const cumS=ni.map(v=>{cum+=v;return cum;});for(let i=0;i<cumS.length;i++)if(cumS[i]>=0&&beP===null)beP=i;
const pm=granularity==='annual'?12:3;const cm=1-(vc/100);
return(<div className="space-y-5">
<div className="rounded-lg overflow-hidden" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="px-6 pt-5 pb-3" style={{borderBottom:`1px solid ${C.border}`}}><Eyebrow color={C.gold}>Standalone calculator</Eyebrow><h3 className="ff-display text-[28px] leading-tight mt-1" style={{color:C.ink}}>Break-even revenue</h3><p className="ff-body text-[12.5px] mt-1.5" style={{color:C.muted}}>Revenue needed to cover fixed costs after variable costs. Independent of model above.</p></div>
<div className="grid md:grid-cols-3" style={{borderBottom:`1px solid ${C.border}`}}>
<div className="px-6 py-5" style={{borderRight:`1px solid ${C.borderSoft}`}}><Eyebrow className="mb-2">Fixed costs (per period)</Eyebrow><NumberInput value={fc} onChange={setFc} className="w-full px-3 py-2 rounded-md ff-num text-[16px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/></div>
<div className="px-6 py-5" style={{borderRight:`1px solid ${C.borderSoft}`}}><Eyebrow className="mb-2">Variable cost (% of revenue)</Eyebrow><div className="relative"><input type="number" value={vc} onChange={e=>setVc(+e.target.value||0)} className="w-full pl-3 pr-9 py-2 rounded-md ff-num text-[16px] outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/><span className="absolute right-3 top-1/2 -translate-y-1/2 ff-num text-[13px]" style={{color:C.muted}}>%</span></div></div>
<div className="px-6 py-5" style={{background:C.greenSoft}}><Eyebrow color={C.green} className="mb-2">Break-even revenue</Eyebrow><div className="ff-display text-[36px] leading-none" style={{color:C.green}}>{beRev===null?'—':fmt(beRev)}</div><div className="ff-body text-[10.5px] mt-1.5" style={{color:C.ink2}}>Contribution margin: {(cm*100).toFixed(0)}% per dollar of revenue</div></div>
</div>
<div className="px-6 py-3 ff-body text-[11px]" style={{background:C.bgWarm,color:C.ink2}}><span style={{color:C.gold,fontWeight:500}}>Formula —</span>{' '}BE Revenue = Fixed Costs ÷ (1 − Variable Cost %). Each dollar contributes <span className="ff-num">{cm.toFixed(2)}</span> toward fixed costs.</div>
</div>
<div className="rounded-lg overflow-hidden" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="px-6 pt-5 pb-3" style={{borderBottom:`1px solid ${C.border}`}}><Eyebrow color={C.gold}>From current scenario</Eyebrow><h3 className="ff-display text-[28px] leading-tight mt-1" style={{color:C.ink}}>Cumulative break-even</h3><p className="ff-body text-[12.5px] mt-1.5" style={{color:C.muted}}>When does cumulative net income first turn positive?</p></div>
<div className="px-6 py-5"><div className="flex items-end gap-3 mb-3 flex-wrap"><Sparkline values={cumS} width={300} height={60} color={beP!==null?C.green:C.rust} smooth/><div className="ff-num text-[10.5px] flex flex-col" style={{color:C.muted}}><span>start</span><span style={{color:C.ink,fontSize:11}}>{fmt(cumS[0])}</span><span className="mt-1">end</span><span style={{color:cumS[cumS.length-1]>=0?C.green:C.rust,fontSize:11}}>{fmt(cumS[cumS.length-1])}</span></div></div>
{beP===null?(<div className="rounded-md p-4 flex items-start gap-2.5" style={{background:C.rustSoft,border:`1px solid ${C.rust}33`}}><AlertTriangle size={16} style={{color:C.rust,marginTop:2}}/><div><div className="ff-body text-[13px]" style={{color:C.rust,fontWeight:500}}>No break-even within horizon</div><div className="ff-body text-[12px] mt-0.5" style={{color:C.ink2}}>Cumulative net income stays negative across all {periods.length} periods.</div></div></div>):(<div className="rounded-md p-4 flex items-start gap-2.5" style={{background:C.greenSoft,border:`1px solid ${C.green}55`}}><Target size={16} style={{color:C.green,marginTop:2}}/><div><div className="ff-body text-[13px]" style={{color:C.green,fontWeight:500}}>Break-even at <span className="ff-num">{periods[beP]}</span></div><div className="ff-body text-[12px] mt-0.5" style={{color:C.ink2}}>Period {beP+1} of {periods.length} — approximately <span className="ff-num">{(beP+1)*pm}</span> months from start.</div></div></div>)}
</div>
</div>
</div>);
}

function WarningsPanel({computed,periods}){
const warnings=[];const rev=computed.values.revenue||[];const gp=computed.values.grossProfit||[];const op=computed.values.operatingIncome||[];const ni=computed.values.netIncome||[];const cash=computed.values.cash||[];const tA=computed.values.totalAssets||[];const tLE=computed.values.totalLE||[];
rev.forEach((r,i)=>{if(r>0&&(gp[i]/r)>0.9)warnings.push({level:'warn',period:periods[i],title:'Very high gross margin',body:`${((gp[i]/r)*100).toFixed(0)}% gross margin. Realistic for software, suspicious for physical goods.`});});
rev.forEach((r,i)=>{if(r>0&&gp[i]<0)warnings.push({level:'error',period:periods[i],title:'Negative gross margin',body:`In ${periods[i]}, COGS exceeds revenue. The business loses money on every sale.`});});
let ls=0,mls=0;for(let i=0;i<ni.length;i++){if(ni[i]<0){ls++;mls=Math.max(mls,ls);}else ls=0;}if(mls>=4)warnings.push({level:'warn',title:`Sustained losses across ${mls} periods`,body:'Confirm there is funding to bridge the gap, or that unit economics will improve.'});
for(let i=1;i<rev.length;i++)if(rev[i-1]>0&&rev[i]>rev[i-1]*2)warnings.push({level:'warn',period:periods[i],title:'Revenue more than doubling in one period',body:`Jumps from ${fmt(rev[i-1])} to ${fmt(rev[i])}. Hyper-growth assumptions deserve scrutiny.`});
cash.forEach((c,i)=>{if(c<0)warnings.push({level:'error',period:periods[i],title:'Negative cash position',body:`Cash balance in ${periods[i]} is ${fmt(c)}. The model implies running out of cash.`});});
tA.forEach((a,i)=>{const diff=Math.abs(a-tLE[i]);if(diff>1)warnings.push({level:'error',period:periods[i],title:'Balance sheet does not balance',body:`Total Assets (${fmt(a)}) ≠ Liabilities + Equity (${fmt(tLE[i])}). Difference: ${fmt(diff)}.`});});
if(warnings.length===0)return(<div className="rounded-lg p-12 text-center" style={{background:C.surface,border:`1px solid ${C.border}`}}><Ornament style={{marginBottom:16}}/><Eyebrow color={C.green} className="mb-2">Clean</Eyebrow><div className="ff-display text-[36px]" style={{color:C.green}}>No flags raised</div><div className="ff-body text-[12.5px] mt-2 max-w-md mx-auto" style={{color:C.muted}}>The model passes sanity checks. That's not a guarantee of accuracy — only that obvious red flags aren't there.</div><Ornament style={{marginTop:20}}/></div>);
const lm={error:{color:C.rust,bg:C.rustSoft,Icon:AlertTriangle,label:'Error'},warn:{color:C.gold,bg:C.goldSoft,Icon:AlertTriangle,label:'Warning'},info:{color:C.ink2,bg:C.surfaceAlt,Icon:Info,label:'Note'}};
const g={error:[],warn:[],info:[]};warnings.forEach(w=>g[w.level].push(w));
return(<div className="space-y-5">{['error','warn','info'].map(lv=>{if(!g[lv].length)return null;const m=lm[lv];return(<div key={lv} className="rounded-lg overflow-hidden" style={{background:C.surface,border:`1px solid ${C.border}`}}><div className="px-5 pt-4 pb-3 flex items-center" style={{borderBottom:`1px solid ${C.border}`}}><m.Icon size={16} style={{color:m.color}}/><Eyebrow color={m.color} className="ml-2">{m.label} · {g[lv].length}</Eyebrow></div><div>{g[lv].map((w,i)=>(<div key={i} className="px-5 py-3.5 flex items-start gap-3" style={{borderTop:i>0?`1px solid ${C.borderSoft}`:'none'}}><div className="ff-num text-[10.5px] mt-0.5" style={{color:m.color,minWidth:18}}>{String(i+1).padStart(2,'0')}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="ff-body text-[13px]" style={{color:C.ink,fontWeight:500}}>{w.title}</span>{w.period&&<span className="ff-num text-[10.5px]" style={{color:C.muted}}>· {w.period}</span>}</div><div className="ff-body text-[12px] mt-1" style={{color:C.ink2}}>{w.body}</div></div></div>))}</div></div>);})}</div>);
}

function FeasibilityScoreCard({score,label,tone,breakdown}){
const tw=useTween(score);
return(<div className="rounded-lg p-5" style={{background:C.surface,border:`1px solid ${C.border}`,boxShadow:`0 1px 0 ${C.border},0 14px 32px -16px rgba(15,23,42,0.12)`}}>
<div className="flex items-start gap-5 flex-wrap">
<div className="relative" style={{width:132,height:132}}><svg width="132" height="132" viewBox="0 0 132 132" style={{transform:'rotate(-90deg)'}}><circle cx="66" cy="66" r="58" fill="none" stroke={C.border} strokeWidth="6"/><circle cx="66" cy="66" r="58" fill="none" stroke={tone} strokeWidth="6" strokeDasharray={`${(tw/100)*2*Math.PI*58} ${2*Math.PI*58}`} strokeLinecap="round" style={{transition:'stroke 240ms ease-out'}}/></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><div className="ff-display" style={{fontSize:44,color:tone,lineHeight:1,fontWeight:500}}>{Math.round(tw)}</div><div className="ff-body text-[10px]" style={{color:C.muted,letterSpacing:'0.15em',textTransform:'uppercase',marginTop:2}}>of 100</div></div></div>
<div className="flex-1 min-w-[200px]"><div className="label-eyebrow ff-body" style={{color:C.gold}}>Feasibility</div><div className="ff-display text-[28px] mt-0.5" style={{color:tone,fontWeight:500}}>{label}</div><div className="ff-body text-[12px] mt-2" style={{color:C.ink2}}>Composite score across five dimensions. Computed from Base scenario.</div>
<div className="mt-4 space-y-1.5">{breakdown.map(c=>(<div key={c.key} className="flex items-center gap-2.5"><div className="ff-body text-[11px]" style={{color:C.ink2,width:132}}>{c.label}</div><div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:C.surfaceAlt}}><div style={{width:`${Math.round(c.value*100)}%`,height:'100%',background:c.value>0.7?C.green:c.value>0.4?C.gold:C.rust,transition:'width 320ms ease-out'}}/></div><div className="ff-num text-[10.5px] text-right" style={{color:C.muted,width:32}}>{Math.round(c.value*100)}</div></div>))}</div>
</div></div></div>);
}

function WhatIfPanel({rows,rowData,numPeriods,periods,scenarioKey,sectorKey,granularity,enabledStatements}){
const[rM,setRM]=useState(1);const[cM,setCM]=useState(1);const[oM,setOM]=useState(1);const[gM,setGM]=useState(1);
const reset=()=>{setRM(1);setCM(1);setOM(1);setGM(1);};
const perturbed=useMemo(()=>{const res={};for(const id in rowData){const e=rowData[id];const n={...e};const r=[...rows.income,...(rows.balance||[]),...(rows.cashFlow||[])].find(x=>x.id===id);if(!r){res[id]=n;continue;}let mult=1;if(r.parentId==='rev'||r.id==='rev-ops')mult*=rM;if(r.parentId==='cogs'||r.id==='cogs-direct')mult*=cM;if(r.parentId==='opex')mult*=oM;if(mult!==1){if(e.mode==='manual')n.manualValues=e.manualValues.map(v=>v*mult);else if(e.mode==='flatGrowth'||e.mode==='customGrowth')n.baseValue=e.baseValue*mult;else if(e.mode==='percentOfRevenue')n.pctOfRev=e.pctOfRev*mult;}if((r.parentId==='rev'||r.id==='rev-ops')&&gM!==1){if(e.mode==='flatGrowth')n.flatRate=e.flatRate*gM;if(e.mode==='customGrowth')n.customRates=e.customRates.map(x=>x*gM);}res[id]=n;}return res;},[rowData,rows,rM,cM,oM,gM]);
const base=useMemo(()=>computeScenario(rows,rowData,numPeriods),[rows,rowData,numPeriods]);
const wi=useMemo(()=>computeScenario(rows,perturbed,numPeriods),[rows,perturbed,numPeriods]);
const bCum=(base.values.netIncome||[]).reduce((a,b)=>a+b,0);const wCum=(wi.values.netIncome||[]).reduce((a,b)=>a+b,0);const delta=wCum-bCum;const deltaPct=bCum!==0?(delta/Math.abs(bCum))*100:0;
const bF=computeFeasibilityScore({base,best:base,worst:base},periods,sectorKey,granularity,enabledStatements);
const wF=computeFeasibilityScore({base:wi,best:wi,worst:wi},periods,sectorKey,granularity,enabledStatements);
const sDelta=wF.score-bF.score;const mod=rM!==1||cM!==1||oM!==1||gM!==1;
const Slider=({label,value,setValue,color,hint})=>(<div className="py-2"><div className="flex items-baseline justify-between mb-1.5"><div className="ff-body text-[12px]" style={{color:C.ink2,fontWeight:500}}>{label}</div><div className="ff-num text-[13px]" style={{color:value===1?C.muted:color}}>{value===1?'baseline':`${(value*100-100>=0?'+':'')}${(value*100-100).toFixed(0)}%`}</div></div><input type="range" min={0.5} max={1.5} step={0.05} value={value} onChange={e=>setValue(+e.target.value)} className="w-full" style={{accentColor:color}}/><div className="ff-body text-[10px] mt-0.5" style={{color:C.faint}}>{hint}</div></div>);
return(<div className="space-y-4">
<div className="rounded-lg p-5" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="flex items-baseline justify-between mb-1 flex-wrap gap-2"><div><div className="label-eyebrow ff-body" style={{color:C.gold}}>Sandbox</div><h3 className="ff-display text-[22px] leading-tight mt-0.5" style={{color:C.ink,fontWeight:500}}>What-if explorer</h3></div>{mod&&<button onClick={reset} className="ff-body text-[11px] px-2.5 py-1 rounded-md" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink2}}>Reset</button>}</div>
<p className="ff-body text-[11.5px] mt-1 mb-3" style={{color:C.muted}}>Move sliders to see impact. Your saved model does not change.</p>
<Slider label="Revenue level" value={rM} setValue={setRM} color={C.green} hint="Scales all revenue lines"/>
<Slider label="Revenue growth rate" value={gM} setValue={setGM} color={C.green} hint="Multiplies period-over-period growth"/>
<Slider label="COGS" value={cM} setValue={setCM} color={C.gold} hint="Scales cost of goods sold"/>
<Slider label="Operating expenses" value={oM} setValue={setOM} color={C.rust} hint="Scales all OpEx lines"/>
</div>
<div className="rounded-lg p-5" style={{background:mod?(delta>=0?C.greenSoft:C.rustSoft):C.surface,border:`1px solid ${mod?(delta>=0?C.green+'55':C.rust+'55'):C.border}`,transition:'all 320ms ease-out'}}>
<div className="label-eyebrow ff-body" style={{color:delta>=0?C.green:C.rust}}>{mod?'What-if result':'Baseline (move a slider)'}</div>
<div className="grid grid-cols-2 gap-3 mt-3">
<div><div className="ff-body text-[10.5px]" style={{color:C.muted}}>Cumulative Net Income</div><div className="ff-display text-[24px] mt-0.5" style={{color:C.ink,fontWeight:500}}>{fmt(wCum,{abbreviate:true,paren:true})}</div>{mod&&<div className="ff-num text-[11px] mt-0.5" style={{color:delta>=0?C.green:C.rust}}>{delta>=0?'+':''}{fmt(delta,{abbreviate:true,paren:true})} ({deltaPct>=0?'+':''}{deltaPct.toFixed(0)}%)</div>}</div>
<div><div className="ff-body text-[10.5px]" style={{color:C.muted}}>Feasibility Score</div><div className="ff-display text-[24px] mt-0.5" style={{color:wF.tone,fontWeight:500}}>{wF.score}</div>{mod&&<div className="ff-num text-[11px] mt-0.5" style={{color:sDelta>=0?C.green:C.rust}}>{sDelta>=0?'+':''}{sDelta} pts ({wF.label})</div>}</div>
</div></div>
</div>);
}

function TornadoChart({rows,rowData,numPeriods}){
const sensitivity=useMemo(()=>computeTornadoSensitivity(rows,rowData,numPeriods),[rows,rowData,numPeriods]);
if(!sensitivity.length)return(<div className="rounded-lg p-5 text-center" style={{background:C.surface,border:`1px solid ${C.border}`}}><div className="ff-body text-[12px]" style={{color:C.muted}}>Not enough data to compute sensitivity.</div></div>);
const maxS=Math.max(...sensitivity.map(s=>Math.max(Math.abs(s.upDelta),Math.abs(s.downDelta))),1);
return(<div className="rounded-lg p-5" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="mb-3"><div className="label-eyebrow ff-body" style={{color:C.gold}}>Sensitivity</div><h3 className="ff-display text-[22px] leading-tight mt-0.5" style={{color:C.ink,fontWeight:500}}>What moves the needle</h3><p className="ff-body text-[11.5px] mt-1" style={{color:C.muted}}>Impact of ±20% on each assumption to cumulative Net Income.</p></div>
<div className="space-y-1.5">{sensitivity.map((s)=>{const uW=(Math.abs(s.upDelta)/maxS)*50;const dW=(Math.abs(s.downDelta)/maxS)*50;const uP=s.upDelta>=0;const dP=s.downDelta>=0;return(<div key={s.rowId} className="flex items-center gap-2.5"><div className="ff-body text-[11.5px] truncate" style={{width:130,color:C.ink2}}>{s.label}</div><div className="flex-1 h-5 relative"><div className="absolute" style={{left:'50%',top:0,bottom:0,width:1,background:C.border}}/><div className="absolute h-full rounded-sm" style={{left:dP?'50%':`${50-dW}%`,width:`${dW}%`,background:dP?C.green+'88':C.rust+'88',borderRadius:2}}/><div className="absolute h-full rounded-sm" style={{left:uP?'50%':`${50-uW}%`,width:`${uW}%`,background:uP?C.green:C.rust,borderRadius:2,opacity:0.6}}/></div><div className="ff-num text-[10.5px] text-right" style={{width:70,color:C.muted}}>±{fmt(Math.max(Math.abs(s.upDelta),Math.abs(s.downDelta)),{abbreviate:true})}</div></div>);})}</div>
</div>);
}

function InsightsList({insights,sectorKey}){
const wo=SECTOR_WATCHOUTS[sectorKey]||SECTOR_WATCHOUTS.other;
const lm={error:{color:C.rust,bg:C.rustSoft,Icon:AlertTriangle,label:'Issue'},warn:{color:C.gold,bg:C.goldSoft,Icon:AlertTriangle,label:'Caution'},info:{color:C.ink2,bg:C.surfaceAlt,Icon:Info,label:'Note'}};
return(<div className="space-y-4">
<div><div className="label-eyebrow ff-body mb-2" style={{color:C.gold}}>Insights from your numbers</div>
{insights.length===0?(<div className="rounded-lg p-5 text-center" style={{background:C.greenSoft,border:`1px solid ${C.green}55`}}><Check size={22} style={{color:C.green,margin:'0 auto'}}/><div className="ff-body text-[13px] mt-2" style={{color:C.green,fontWeight:500}}>No flags from your model</div></div>):(<div className="space-y-2">{insights.map((ins,i)=>{const m=lm[ins.level];return(<div key={i} className="rounded-md p-3.5 flex items-start gap-2.5" style={{background:m.bg,border:`1px solid ${m.color}33`}}><m.Icon size={14} style={{color:m.color,marginTop:2}}/><div><div className="label-eyebrow ff-body" style={{color:m.color,fontSize:9}}>{m.label}</div><div className="ff-body text-[12.5px] mt-0.5" style={{color:C.ink,fontWeight:500}}>{ins.title}</div><div className="ff-body text-[11.5px] mt-1" style={{color:C.ink2,lineHeight:1.5}}>{ins.body}</div></div></div>);})}</div>)}
</div>
<div><div className="label-eyebrow ff-body mb-2" style={{color:C.gold}}>Sector watch-outs · {(BB[sectorKey]||BB.other).label}</div><div className="rounded-lg p-4 space-y-2.5" style={{background:C.surface,border:`1px solid ${C.border}`}}>{wo.map((w,i)=>(<div key={i} className="flex items-start gap-2.5"><div className="ff-num text-[10px] mt-1" style={{color:C.gold,minWidth:18}}>{String(i+1).padStart(2,'0')}</div><div className="ff-body text-[12px]" style={{color:C.ink2,lineHeight:1.5}}>{w}</div></div>))}</div></div>
</div>);
}

function PeerComparisonPanel({computed,periods,sectorKey}){
const sector=BB[sectorKey]||BB.other;const peers=sector.peers||[];if(!peers.length)return null;
const rev=computed.values.revenue||[];const ni=computed.values.netIncome||[];const li=periods.length-1;const lR=rev[li]||0;const lNM=lR>0?(ni[li]/lR)*100:0;
const items=[...peers.map(p=>({name:p.name,margin:p.netMargin,isYou:false})),{name:'Your model',margin:lNM,isYou:true}].sort((a,b)=>b.margin-a.margin);
const maxAbs=Math.max(...items.map(i=>Math.abs(i.margin)),1);
return(<div className="rounded-lg p-5" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<div className="flex items-baseline justify-between mb-3 flex-wrap gap-2"><div><div className="label-eyebrow ff-body" style={{color:C.gold}}>Peer comparison</div><h3 className="ff-display text-[20px] leading-tight mt-0.5" style={{color:C.ink,fontWeight:500}}>Net margin vs known players</h3></div><span className="ff-body text-[10.5px]" style={{color:C.muted}}>{periods[li]} margins</span></div>
<div className="space-y-2">{items.map((item,i)=>{const pos=item.margin>=0;const bW=Math.abs(item.margin)/maxAbs*50;return(<div key={i} className="flex items-center gap-3"><div className="ff-body text-[12px] flex items-center gap-1.5" style={{width:160,color:item.isYou?C.ink:C.ink2,fontWeight:item.isYou?600:400}}>{item.isYou&&<span style={{color:C.gold}}>★</span>}<span className="truncate">{item.name}</span></div><div className="flex-1 h-5 relative"><div className="absolute" style={{left:'50%',top:0,bottom:0,width:1,background:C.border}}/><div className="absolute h-full rounded-sm" style={{left:pos?'50%':`${50-bW}%`,width:`${bW}%`,background:item.isYou?C.gold:pos?`${C.green}99`:`${C.rust}99`,border:item.isYou?`1px solid ${C.gold}`:'none',borderRadius:2}}/></div><div className="ff-num text-[12px] text-right" style={{width:50,color:item.isYou?C.ink:pos?C.green:C.rust,fontWeight:item.isYou?600:500}}>{item.margin>=0?'+':''}{item.margin.toFixed(1)}%</div></div>);})}
</div></div>);
}

function SectorBenchmarkPanel({computed,periods,sectorKey}){
const sector=BB[sectorKey]||BB.other;const rev=computed.values.revenue||[];const gp=computed.values.grossProfit||[];const op=computed.values.operatingIncome||[];const ni=computed.values.netIncome||[];const li=periods.length-1;const lR=rev[li]||0;
const lGM=lR>0?(gp[li]/lR)*100:0;const lOM=lR>0?(op[li]/lR)*100:0;const lNM=lR>0?(ni[li]/lR)*100:0;
const status=(val,[lo,hi])=>val<lo?{tone:C.rust,label:'below typical',sym:'↓'}:val>hi?{tone:C.green,label:'above typical',sym:'↑'}:{tone:C.green,label:'in range',sym:'✓'};
const Row=({label,value,range,hint,glossaryKey})=>{const s=status(value,range);const mn=Math.min(value,range[0],0),mx=Math.max(value,range[1]);const sp=mx-mn||1;const vP=((value-mn)/sp)*100;const lP=((range[0]-mn)/sp)*100;const hP=((range[1]-mn)/sp)*100;return(<div className="py-3" style={{borderTop:`1px solid ${C.borderSoft}`}}><div className="flex items-baseline justify-between mb-2"><div><div className="flex items-center gap-1"><span className="ff-body text-[12.5px]" style={{color:C.ink2,fontWeight:500}}>{label}</span><HelpTooltip glossaryKey={glossaryKey} term={label}/></div><div className="ff-body text-[10.5px] mt-0.5" style={{color:C.muted}}>{hint}</div></div><div className="text-right"><div className="ff-num text-[16px]" style={{color:s.tone,fontWeight:500}}>{value.toFixed(1)}<span className="text-[11px]" style={{color:C.muted}}>%</span></div><div className="ff-body text-[10px] mt-0.5" style={{color:s.tone}}>{s.sym} {s.label}</div></div></div><div className="relative h-2.5 rounded-full" style={{background:C.surfaceAlt}}><div className="absolute h-full rounded-full" style={{left:`${lP}%`,width:`${hP-lP}%`,background:`${C.green}33`}}/><div className="absolute h-3.5 w-0.5" style={{left:`calc(${Math.max(0,Math.min(100,vP))}% - 1px)`,top:-2,background:s.tone}}/></div><div className="flex justify-between mt-1"><span className="ff-num text-[9.5px]" style={{color:C.muted}}>{range[0]}%</span><span className="ff-body text-[9.5px]" style={{color:C.faint,letterSpacing:'0.1em'}}>SECTOR TYPICAL</span><span className="ff-num text-[9.5px]" style={{color:C.muted}}>{range[1]}%</span></div></div>);};
return(<div className="rounded-lg p-5" style={{background:C.surface,border:`1px solid ${C.border}`}}><div className="flex items-baseline justify-between mb-2 flex-wrap gap-2"><div><div className="label-eyebrow ff-body" style={{color:C.gold}}>Sector check</div><h3 className="ff-display text-[20px] leading-tight mt-0.5" style={{color:C.ink,fontWeight:500}}>How you stack up · {sector.label}</h3></div><span className="ff-body text-[10.5px]" style={{color:C.muted}}>{periods[li]} margins</span></div><Row label="Gross margin" value={lGM} range={sector.benchmarks.grossMargin} hint="What's left after direct costs" glossaryKey="gross-margin"/><Row label="Operating margin" value={lOM} range={sector.benchmarks.opMargin} hint="Profit from core operations, before interest and tax" glossaryKey="op-margin"/><Row label="Net margin" value={lNM} range={sector.benchmarks.netMargin} hint="Bottom line — what stays as profit" glossaryKey="net-margin"/></div>);
}

function CompactKPIGrid({computed,periods,granularity,enabledStatements}){
const stmts=enabledStatements||{income:true,balance:false,cashFlow:false};const rev=computed.values.revenue||[];const ni=computed.values.netIncome||[];const cash=computed.values.cash||[];const li=periods.length-1;const pm=granularity==='annual'?12:3;const lNI=ni[li]||0;const lC=cash[li]||0;
const runway=(stmts.balance&&lNI<0&&Math.abs(lNI)>0)?Math.round(lC/(Math.abs(lNI)/pm)):null;
let cum=0,beI=null;for(let i=0;i<ni.length;i++){cum+=ni[i];if(cum>=0&&beI===null)beI=i;}
const Item=({label,value,suffix,tone,hint})=>(<div className="p-3.5" style={{borderRight:`1px solid ${C.borderSoft}`,borderTop:`1px solid ${C.borderSoft}`}}><div className="label-eyebrow ff-body" style={{color:C.muted,fontSize:9}}>{label}</div><div className="ff-display mt-1 leading-none" style={{color:tone||C.ink,fontSize:22,fontWeight:500}}>{value}{suffix&&<span className="ff-num text-[12px] ml-0.5" style={{color:C.muted}}>{suffix}</span>}</div>{hint&&<div className="ff-body text-[10px] mt-1" style={{color:C.muted}}>{hint}</div>}</div>);
return(<div className="rounded-lg overflow-hidden grid grid-cols-2" style={{background:C.surface,border:`1px solid ${C.border}`}}><Item label={`Revenue · ${periods[li]}`} value={fmt(rev[li]||0,{abbreviate:true})}/><Item label={`Net income · ${periods[li]}`} value={fmt(lNI,{abbreviate:true,paren:true})} tone={lNI>=0?C.ink:C.rust}/>{stmts.balance?<Item label="Runway" value={runway===null?'∞':runway<0?'—':runway} suffix={runway===null||runway<0?'':'mo'} tone={runway===null?C.green:runway<12?C.rust:C.ink} hint={runway===null?'Profitable in latest period':null}/>:<Item label="Runway" value="—" tone={C.faint} hint="Add Balance Sheet to compute"/>}<Item label="Cumulative break-even" value={beI===null?'Never':periods[beI]} tone={beI===null?C.rust:C.green} hint={beI===null?'Within current horizon':`Period ${beI+1}`}/></div>);
}

function AnalysisDrawer({open,onClose,computed,computedAll,periods,granularity,scenarioKey,sectorKey,projectName,enabledStatements,rows,rowData,numPeriods,onOpenCritique}){
const[tab,setTab]=useState('overview');
const sector=BB[sectorKey]||BB.other;const stmts=enabledStatements||{income:true,balance:false,cashFlow:false};
const feasibility=useMemo(()=>computeFeasibilityScore(computedAll,periods,sectorKey,granularity,stmts),[computedAll,periods,sectorKey,granularity,stmts]);
const insights=useMemo(()=>generateInsights(computedAll,periods,sectorKey,granularity,stmts,rows,rowData),[computedAll,periods,sectorKey,granularity,stmts,rows,rowData]);
useEffect(()=>{if(open)document.body.style.overflow='hidden';else document.body.style.overflow='';return()=>{document.body.style.overflow='';};},[ open]);
if(!open)return null;
const TABS=[{id:'overview',label:'Overview'},{id:'insights',label:'Insights'},{id:'whatif',label:'What-if'},{id:'sensitivity',label:'Sensitivity'},{id:'ratios',label:'Ratios'},{id:'breakEven',label:'Break-even'},stmts.balance?{id:'warnings',label:'Warnings'}:null].filter(Boolean);
return(<>
<div className="fixed inset-0 z-40 anim-fade-in" style={{background:'rgba(15,23,42,0.32)'}} onClick={onClose}/>
<div className="fixed top-0 right-0 bottom-0 z-50" style={{width:'min(640px,92vw)',background:C.bg,borderLeft:`1px solid ${C.border}`,boxShadow:'-20px 0 60px -20px rgba(15,23,42,0.18)',display:'flex',flexDirection:'column'}}>
<style>{`@keyframes drawerSlide{from{transform:translateX(100%)}to{transform:translateX(0)}}.anim-drawer-slide{animation:drawerSlide 280ms cubic-bezier(0.16,1,0.3,1);}`}</style>
<div className="px-6 pt-5 pb-4 flex-none anim-drawer-slide" style={{borderBottom:`1px solid ${C.border}`,background:C.surface}}>
<div className="flex items-start justify-between gap-3"><div className="flex-1 min-w-0"><div className="label-eyebrow ff-body" style={{color:C.gold}}>Analysis</div><h3 className="ff-display text-[26px] leading-tight mt-0.5" style={{color:C.ink,fontWeight:500}}>{projectName||'Untitled'}</h3><div className="ff-body text-[11px] mt-1.5 flex items-center gap-2 flex-wrap" style={{color:C.muted}}><span>{sector.label}</span><span style={{width:1,height:10,background:C.border}}/><span>{SCENARIO_META[scenarioKey].label} scenario</span><span style={{width:1,height:10,background:C.border}}/><span>{granularity==='annual'?'Annual':'Quarterly'}</span></div></div><div className="flex items-start gap-2 flex-none"><button onClick={onOpenCritique} className="px-3 py-1.5 rounded-md ff-body text-[11.5px] flex items-center gap-1.5" style={{background:C.ink,color:C.surface,fontWeight:500}}>Critique plan</button><button onClick={onClose} className="p-1.5 rounded-md" style={{color:C.ink2}}><X size={18}/></button></div></div>
<div className="flex gap-0 mt-4 overflow-x-auto" style={{borderBottom:`1px solid ${C.border}`,marginBottom:-1}}>{TABS.map(t=>{const a=tab===t.id;return(<button key={t.id} onClick={()=>setTab(t.id)} className="px-3 py-2 ff-body text-[12px] flex-none whitespace-nowrap" style={{color:a?C.ink:C.muted,borderBottom:`2px solid ${a?C.gold:'transparent'}`,fontWeight:a?500:400}}>{t.label}</button>);})}</div>
</div>
<div className="flex-1 overflow-y-auto px-6 py-5 anim-drawer-slide" style={{minHeight:0}}>
<div key={tab} className="anim-tab-in">
{tab==='overview'&&<div className="space-y-5"><FeasibilityScoreCard {...feasibility}/><PeerComparisonPanel computed={computed} periods={periods} sectorKey={sectorKey}/><SectorBenchmarkPanel computed={computed} periods={periods} sectorKey={sectorKey}/><CompactKPIGrid computed={computed} periods={periods} granularity={granularity} enabledStatements={stmts}/>{!stmts.balance&&<div className="rounded-md p-3 ff-body text-[11.5px]" style={{background:C.bgWarm,border:`1px dashed ${C.border}`,color:C.muted}}><span style={{color:C.gold,fontWeight:500}}>Note —</span>{' '}Without a Balance Sheet, cash-related insights are limited.</div>}</div>}
{tab==='insights'&&<InsightsList insights={insights} sectorKey={sectorKey}/>}
{tab==='whatif'&&<WhatIfPanel rows={rows} rowData={rowData[scenarioKey]} numPeriods={numPeriods} periods={periods} scenarioKey={scenarioKey} sectorKey={sectorKey} granularity={granularity} enabledStatements={stmts}/>}
{tab==='sensitivity'&&<TornadoChart rows={rows} rowData={rowData[scenarioKey]} numPeriods={numPeriods}/>}
{tab==='ratios'&&<RatiosPanel computed={computed} periods={periods} granularity={granularity}/>}
{tab==='breakEven'&&<BreakEvenPanel computed={computed} periods={periods} granularity={granularity}/>}
{tab==='warnings'&&<WarningsPanel computed={computed} periods={periods}/>}
</div>
</div>
</div>
</>);
}

function PlanCritiqueModal({open,onClose,projectName,sectorKey,computed,computedAll,periods,granularity,enabledStatements,rows,rowData,feasibility}){
const insights=useMemo(()=>generateInsights(computedAll,periods,sectorKey,granularity,enabledStatements,rows,rowData),[computedAll,periods,sectorKey,granularity,enabledStatements,rows,rowData]);
if(!open)return null;
const sector=BB[sectorKey]||BB.other;const wo=SECTOR_WATCHOUTS[sectorKey]||SECTOR_WATCHOUTS.other;
const rev=computed.values.revenue||[];const ni=computed.values.netIncome||[];const cumNI=ni.reduce((a,b)=>a+b,0);let cum=0,beI=null;for(let i=0;i<ni.length;i++){cum+=ni[i];if(cum>=0&&beI===null)beI=i;}
const rG=rev[0]>0?((rev[rev.length-1]/rev[0]-1)*100).toFixed(0):0;
const summary=`${projectName} is a ${sector.label.toLowerCase()} business. Under the Base scenario over ${periods.length} ${granularity==='annual'?'years':'quarters'}, revenue ${rev[0]>0?`grows ${rG}% from ${fmt(rev[0],{abbreviate:true})} to ${fmt(rev[rev.length-1],{abbreviate:true})}`:`reaches ${fmt(rev[rev.length-1],{abbreviate:true})}`}. Cumulative net income is ${fmt(cumNI,{paren:true,abbreviate:true})}. ${beI!==null?`Cumulative break-even at ${periods[beI]}.`:'No cumulative break-even within the horizon.'} Feasibility: ${feasibility.score}/100 — ${feasibility.label}.`;
const eC=insights.filter(i=>i.level==='error').length;const wC=insights.filter(i=>i.level==='warn').length;
const verdict=(()=>{if(eC>0)return{label:'Plan needs attention',tone:C.rust,body:`${eC} structural issue${eC>1?'s':''} detected. Review and resolve before relying on this model.`};if(wC>1)return{label:'Plan is workable but watch closely',tone:C.gold,body:`${wC} cautions raised.`};if(feasibility.score>=65)return{label:'Plan looks promising',tone:C.green,body:'The model passes structural checks. Sector watch-outs still apply.'};return{label:'Plan is acceptable',tone:C.ink,body:'No major issues. Treat the result as a starting point, not a forecast.'};})();
return(<div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{background:'rgba(15,23,42,0.5)'}} onClick={onClose}><div onClick={e=>e.stopPropagation()} className="w-full max-w-3xl mx-4 rounded-lg overflow-hidden shadow-2xl" style={{background:C.bg,border:`1px solid ${C.border}`,maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
<div className="px-7 pt-6 pb-5 flex-none" style={{borderBottom:`1px solid ${C.border}`,background:C.surface}}><div className="flex items-start justify-between gap-3"><div className="flex-1"><div className="label-eyebrow ff-body" style={{color:C.gold}}>Plan critique</div><h3 className="ff-display text-[28px] leading-tight mt-1" style={{color:C.ink,fontWeight:500}}>{projectName}</h3><div className="ff-body text-[11.5px] mt-1.5" style={{color:C.muted}}>{sector.label} · {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div></div><button onClick={onClose} className="p-1.5 rounded-md mt-1" style={{color:C.ink2}}><X size={18}/></button></div></div>
<div className="px-7 py-5 overflow-y-auto flex-1 space-y-5" style={{minHeight:0}}>
<div className="rounded-lg p-4 flex items-start gap-3" style={{background:verdict.tone===C.rust?C.rustSoft:verdict.tone===C.gold?C.goldSoft:verdict.tone===C.green?C.greenSoft:C.surface,border:`1px solid ${verdict.tone}55`}}><div className="ff-display text-[28px] leading-none flex-none" style={{color:verdict.tone,fontWeight:500}}>{feasibility.score}</div><div className="flex-1"><div className="ff-body text-[13px]" style={{color:verdict.tone,fontWeight:600}}>{verdict.label}</div><div className="ff-body text-[12px] mt-1" style={{color:C.ink2,lineHeight:1.5}}>{verdict.body}</div></div></div>
<div><div className="label-eyebrow ff-body mb-2" style={{color:C.gold}}>Executive summary</div><div className="rounded-lg p-4 ff-body text-[13px] leading-relaxed" style={{background:C.surface,border:`1px solid ${C.border}`,color:C.ink2}}>{summary}</div></div>
{insights.length>0&&<div><div className="label-eyebrow ff-body mb-2" style={{color:C.gold}}>Findings</div><div className="space-y-2">{insights.map((ins,i)=>{const tone=ins.level==='error'?C.rust:ins.level==='warn'?C.gold:C.ink2;const bg=ins.level==='error'?C.rustSoft:ins.level==='warn'?C.goldSoft:C.surfaceAlt;return(<div key={i} className="rounded-md p-3.5" style={{background:bg,border:`1px solid ${tone}33`}}><div className="flex items-start gap-2"><span className="ff-num text-[10px]" style={{color:tone,marginTop:3}}>{String(i+1).padStart(2,'0')}</span><div className="flex-1"><div className="ff-body text-[12.5px]" style={{color:C.ink,fontWeight:500}}>{ins.title}</div><div className="ff-body text-[11.5px] mt-1" style={{color:C.ink2,lineHeight:1.5}}>{ins.body}</div></div></div></div>);})}</div></div>}
<div><div className="label-eyebrow ff-body mb-2" style={{color:C.gold}}>Sector watch-outs</div><div className="rounded-lg p-4 space-y-2" style={{background:C.surface,border:`1px solid ${C.border}`}}>{wo.map((w,i)=>(<div key={i} className="ff-body text-[12px]" style={{color:C.ink2,lineHeight:1.5}}>· {w}</div>))}</div></div>
</div>
<div className="flex items-center justify-end gap-2 px-7 py-3 flex-none" style={{borderTop:`1px solid ${C.border}`,background:C.surface}}><button onClick={onClose} className="px-4 py-1.5 rounded-md ff-body text-[12.5px]" style={{background:C.ink,color:C.surface}}>Close</button></div>
</div></div>);
}

function buildSystemPrompt({projectName,sectorKey,computed,periods,granularity}){
const sector=BB[sectorKey]||BB.other;
const rev=computed.values.revenue||[];const gp=computed.values.grossProfit||[];const op=computed.values.operatingIncome||[];const ni=computed.values.netIncome||[];
const li=periods.length-1;const lRev=rev[li]||0;const lGP=gp[li]||0;const lOP=op[li]||0;const lNI=ni[li]||0;
const gm=lRev>0?((lGP/lRev)*100).toFixed(1):'n/a';
const om=lRev>0?((lOP/lRev)*100).toFixed(1):'n/a';
const nm=lRev>0?((lNI/lRev)*100).toFixed(1):'n/a';
const revSeries=rev.map((v,i)=>periods[i]+': '+fmt(v,{abbreviate:true})).join(', ');
const niSeries=ni.map((v,i)=>periods[i]+': '+fmt(v,{abbreviate:true,paren:true})).join(', ');
let cumNI=0,beI=null;for(let i=0;i<ni.length;i++){cumNI+=ni[i];if(cumNI>=0&&beI===null)beI=i;}
const benchmarks=Object.entries(BB).map(([k,b])=>b.label+': GM '+b.benchmarks.grossMargin[0]+'-'+b.benchmarks.grossMargin[1]+'%, NM '+b.benchmarks.netMargin[0]+'-'+b.benchmarks.netMargin[1]+'%').join('\n');
return 'You are a sharp financial analyst embedded in a 3-statement financial modeling tool.\n\n'+
'== MODEL ==\n'+
'Project: '+projectName+'\n'+
'Business: '+sector.label+' — '+sector.blurb+'\n'+
'Horizon: '+periods.length+' '+(granularity==='annual'?'years':'quarters')+' ('+periods[0]+'–'+periods[li]+')\n\n'+
'LAST PERIOD ('+periods[li]+'):\n'+
'  Revenue: '+fmt(lRev,{abbreviate:true})+'\n'+
'  Gross Margin: '+gm+'%  [typical: '+sector.benchmarks.grossMargin[0]+'–'+sector.benchmarks.grossMargin[1]+'%]\n'+
'  Operating Margin: '+om+'%  [typical: '+sector.benchmarks.opMargin[0]+'–'+sector.benchmarks.opMargin[1]+'%]\n'+
'  Net Margin: '+nm+'%  [typical: '+sector.benchmarks.netMargin[0]+'–'+sector.benchmarks.netMargin[1]+'%]\n\n'+
'Revenue: '+revSeries+'\n'+
'Net income: '+niSeries+'\n'+
'Break-even: '+(beI!==null?'cumulative at '+periods[beI]:'not reached')+'\n\n'+
'Peers:\n'+(sector.peers.map(p=>'  '+p.name+': '+p.netMargin+'% NM').join('\n')||'  none')+'\n\n'+
'Watch-outs:\n'+(SECTOR_WATCHOUTS[sectorKey]||SECTOR_WATCHOUTS.other).map(w=>'  - '+w).join('\n')+'\n\n'+
'All sector benchmarks:\n'+benchmarks+'\n\n'+
'Instructions: Be concise (max 150 words). Cite actual numbers. Compare to benchmarks with specific %. Suggest specific changes. No fluff.'+WHATIF_PATCH_ADDENDUM;
}

const QUICK_QUESTIONS=['Is my gross margin realistic?','What should I stress-test first?','Why am I not reaching break-even?','How do I compare to peers?','What is a healthy burn rate here?','Are my growth assumptions realistic?'];

// ── AI Generate from description ──────────────────────────────────────────
function AIGenerateModal({open,onClose,onApplyDraft}){
const[desc,setDesc]=useState('');
const[status,setStatus]=useState('idle'); // idle|generating|success|error
const[result,setResult]=useState(null);
const[err,setErr]=useState('');
const taRef=useRef(null);
useEffect(()=>{if(!open){setDesc('');setStatus('idle');setResult(null);setErr('');}else{setTimeout(()=>taRef.current?.focus(),80);}},[open]);
const generate=async()=>{
const t=desc.trim();if(!t||status==='generating')return;
setStatus('generating');setErr('');setResult(null);
try{
const res=await fetch('/api/chat',{method:'POST',headers:await authedJSONHeaders(),body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,system:MODEL_GEN_SYSTEM_PROMPT,messages:[{role:'user',content:t}]})});
const data=await res.json();
if(data.error){setErr('AI error: '+(data.error.message||data.error));setStatus('error');return;}
const text=data?.content?.[0]?.text;
if(!text){setErr('No response from AI.');setStatus('error');return;}
const raw=parseModelDraftJSON(text);
const vr=validateModelDraft(raw);
if(!vr.valid){setErr('AI returned an unexpected format: '+vr.error+'. Please try rephrasing.');setStatus('error');return;}
setResult(vr.draft);setStatus('success');
}catch(e){setErr('Error: '+e.message);setStatus('error');}
};
const apply=()=>{if(result)onApplyDraft(result);};
if(!open)return null;
const BB_LABELS={coffeeshop:'Coffee Shop',restaurant:'Restaurant',foodtruck:'Food Truck',ecommerce:'E-commerce',retail:'Retail Shop',carwash:'Car Wash',vending:'Vending Machines',gym:'Gym / Fitness Studio',consulting:'Consulting',saas:'SaaS Product',mobileapp:'Mobile App',contentcreator:'Content Creator',agency:'Creative Agency',manufacturing:'Small Manufacturing',other:'Other'};
return(
React.createElement('div',{style:{position:'fixed',inset:0,zIndex:51,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.55)'},onClick:onClose},
React.createElement('div',{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:'0 32px 64px -16px rgba(15,23,42,0.4)',width:'min(560px,calc(100vw - 32px))',overflow:'hidden'},onClick:e=>e.stopPropagation()},
// Header
React.createElement('div',{style:{padding:'18px 22px',borderBottom:`1px solid ${C.border}`,background:C.bgWarm,display:'flex',alignItems:'center',justifyContent:'space-between'}},
React.createElement('div',null,
React.createElement('div',{className:'label-eyebrow ff-body',style:{color:C.gold}},'AI Model Builder'),
React.createElement('h3',{className:'ff-display',style:{fontSize:20,fontWeight:500,color:C.ink,marginTop:2}},'Build from description')
),
React.createElement('button',{onClick:onClose,style:{background:'transparent',border:'none',cursor:'pointer',color:C.ink2,padding:4}},React.createElement(X,{size:18}))
),
// Body
React.createElement('div',{style:{padding:'20px 22px'}},
status!=='success'&&React.createElement('div',null,
React.createElement('div',{className:'ff-body',style:{fontSize:13,color:C.ink2,marginBottom:10,lineHeight:1.55}},'Describe your business in plain English. The AI will select a sector, set realistic assumptions, and seed a complete model.'),
React.createElement('textarea',{ref:taRef,value:desc,onChange:e=>setDesc(e.target.value),placeholder:'e.g. "A SaaS startup in Israel with ~$30K MRR targeting B2B clients, 3 employees, pre-Series A"',rows:4,className:'ff-body w-full',style:{width:'100%',padding:'10px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.ink,fontSize:13.5,lineHeight:1.55,resize:'vertical',outline:'none',boxSizing:'border-box'}}),
status==='error'&&React.createElement('div',{style:{marginTop:10,padding:'8px 12px',borderRadius:8,background:C.rustSoft,fontSize:12,color:C.rust,fontFamily:'Inter,system-ui,sans-serif'}},err)
),
status==='success'&&result&&React.createElement('div',null,
React.createElement('div',{style:{padding:'14px 16px',borderRadius:10,background:C.greenSoft,border:`1px solid ${C.green}55`,marginBottom:14}},
React.createElement('div',{className:'ff-body',style:{fontSize:11,fontWeight:700,color:C.green,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:4}},'✓ Model detected — '+BB_LABELS[result.sectorKey]),
React.createElement('div',{className:'ff-body',style:{fontSize:13,color:C.ink2,lineHeight:1.55}},(result.rationale||'Sector-calibrated assumptions seeded.'))
),
result.overrides&&result.overrides.length>0&&React.createElement('div',{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',marginBottom:14}},
React.createElement('div',{className:'label-eyebrow ff-body',style:{color:C.muted,marginBottom:8,fontSize:9}},`${result.overrides.length} OVERRIDE${result.overrides.length!==1?'S':''} APPLIED`),
result.overrides.slice(0,5).map(ov=>React.createElement('div',{key:ov.rowId,className:'ff-body',style:{fontSize:11.5,color:C.ink2,marginBottom:4}},
'→ ',React.createElement('span',{style:{fontWeight:500,color:C.ink}},ov.rowId),': ',
ov.mode==='flatGrowth'?`base ${ov.baseValue?.toLocaleString()} · ${ov.flatRate}% growth`:
ov.mode==='percentOfRevenue'?`${ov.pctOfRev}% of revenue`:'custom values'
))
)
)
),
// Footer
React.createElement('div',{style:{padding:'14px 22px',borderTop:`1px solid ${C.border}`,background:C.surface,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}},
React.createElement('button',{onClick:onClose,className:'ff-body',style:{fontSize:12.5,color:C.muted,background:'transparent',border:'none',cursor:'pointer',padding:'6px 10px'}},status==='success'?'Cancel':'Use wizard instead'),
status==='success'
?React.createElement('button',{onClick:apply,className:'ff-body',style:{fontSize:13,fontWeight:600,color:C.surface,background:C.green,border:'none',cursor:'pointer',padding:'9px 20px',borderRadius:8}},'✓ Apply this model')
:React.createElement('button',{onClick:generate,disabled:!desc.trim()||status==='generating',className:'ff-body',style:{fontSize:13,fontWeight:600,color:C.surface,background:desc.trim()&&status!=='generating'?C.ink:C.surfaceAlt,border:'none',cursor:desc.trim()&&status!=='generating'?'pointer':'not-allowed',padding:'9px 20px',borderRadius:8}},status==='generating'?'Generating…':'Generate model →')
)
)
)
);
}

function AIAdvisorPanel({open,onClose,modelContext,rowLabels,currentRowData,onApplyPatch}){
const[msgs,setMsgs]=useState([]);
const[input,setInput]=useState('');
const[loading,setLoading]=useState(false);
const[error,setError]=useState(null);
const[pendingPatch,setPendingPatch]=useState(null);
const[patchApplied,setPatchApplied]=useState(false);
const bottomRef=useRef(null);
const inputRef=useRef(null);

useEffect(()=>{if(!open){setMsgs([]);setInput('');setLoading(false);setError(null);setPendingPatch(null);setPatchApplied(false);}},[open]);
useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);

const callAI=async(apiHistory)=>{
setLoading(true);setError(null);
try{
const res=await fetch('/api/chat',{
method:'POST',
headers:await authedJSONHeaders(),
body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:buildSystemPrompt(modelContext),messages:apiHistory})
});
const data=await res.json();
if(data.error){setError('API: '+(data.error.message||data.error));setLoading(false);return;}
const reply=data?.content?.[0]?.text;
if(!reply){setError('No response received.');setLoading(false);return;}
// Detect ```patch [...] ``` blocks — strip from displayed text, show as diff card
let displayText=reply;let parsedPatch=null;
const pm=reply.match(/```patch\n([\s\S]*?)\n```/);
if(pm){try{const p=JSON.parse(pm[1]);if(Array.isArray(p)&&p.length>0){parsedPatch=p;displayText=reply.replace(/```patch\n[\s\S]*?\n```/,'').trim();}}catch{}}
setMsgs(prev=>[...prev,{role:'assistant',text:displayText}]);
if(parsedPatch){setPendingPatch(parsedPatch);setPatchApplied(false);}
}catch(e){setError('Error: '+e.message);}
setLoading(false);
setTimeout(()=>inputRef.current?.focus(),80);
};

const send=(textOverride)=>{
const txt=(textOverride||input).trim();
if(!txt||loading)return;
setInput('');
setMsgs(prev=>{
const updated=[...prev,{role:'user',text:txt}];
callAI(updated.map(m=>({role:m.role,content:m.text})));
return updated;
});
};

const handleKey=(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}};

const renderText=(text)=>text.split('\n').map((line,i)=>{
if(!line.trim())return React.createElement('div',{key:i,style:{height:6}});
if(line.startsWith('- ')||line.startsWith('• '))return React.createElement('div',{key:i,className:'flex gap-1.5 mt-1'},React.createElement('span',{style:{color:C.gold}},'·'),React.createElement('span',null,line.slice(2)));
const parts=line.split(/\*\*(.*?)\*\*/g);
return React.createElement('div',{key:i,className:'mt-0.5'},parts.map((p,j)=>j%2===1?React.createElement('strong',{key:j},p):React.createElement('span',{key:j},p)));
});

if(!open)return null;
return React.createElement(React.Fragment,null,
React.createElement('div',{style:{position:'fixed',inset:0,zIndex:49,background:'rgba(15,23,42,0.15)'},onClick:onClose}),
React.createElement('div',{className:'anim-fade-in',style:{position:'fixed',zIndex:50,bottom:80,right:16,width:'min(400px,calc(100vw - 32px))',height:'min(560px,calc(100vh - 100px))',background:C.surface,border:'1px solid '+C.border,borderRadius:16,boxShadow:'0 24px 60px -8px rgba(15,23,42,0.35)',display:'flex',flexDirection:'column',overflow:'hidden'}},
  React.createElement('div',{style:{padding:'12px 16px',borderBottom:'1px solid '+C.border,background:C.bgWarm,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}},
    React.createElement('div',{style:{display:'flex',alignItems:'center',gap:10}},
      React.createElement('div',{style:{width:30,height:30,borderRadius:'50%',background:C.gold,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0}},'AI'),
      React.createElement('div',null,
        React.createElement('div',{className:'ff-body',style:{fontSize:13,color:C.ink,fontWeight:600}},'AI Advisor'),
        React.createElement('div',{className:'ff-body',style:{fontSize:10,color:C.muted}},modelContext.sector?.label+' · sees your full model')
      )
    ),
    React.createElement('button',{onClick:onClose,style:{color:C.ink2,padding:6,background:'transparent',border:'none',cursor:'pointer',borderRadius:8}},React.createElement(X,{size:16}))
  ),
  React.createElement('div',{className:'ff-body',style:{flex:1,overflowY:'auto',padding:'12px 16px',minHeight:0,fontSize:12.5,lineHeight:1.55,display:'flex',flexDirection:'column',gap:12}},
    msgs.length===0&&React.createElement('div',null,
      React.createElement('div',{style:{color:C.ink2,marginBottom:12}},'I can see your ',React.createElement('strong',null,modelContext.projectName),' model. Ask me anything about the numbers, benchmarks, or assumptions.'),
      React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},QUICK_QUESTIONS.map((q,i)=>
        React.createElement('button',{key:i,onClick:()=>send(q),className:'ff-body',style:{fontSize:11.5,padding:'6px 10px',borderRadius:20,background:C.bg,border:'1px solid '+C.border,color:C.ink2,cursor:'pointer',textAlign:'left',lineHeight:1.3}},q)
      ))
    ),
    msgs.map((m,i)=>
      React.createElement('div',{key:i,style:{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}},
        React.createElement('div',{style:{maxWidth:'88%',padding:'8px 12px',background:m.role==='user'?C.ink:C.bg,color:m.role==='user'?C.surface:C.ink,borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px'}},
          m.role==='assistant'?renderText(m.text):React.createElement('span',null,m.text)
        )
      )
    ),
    loading&&React.createElement('div',{style:{display:'flex'}},
      React.createElement('div',{style:{padding:'8px 14px',background:C.bg,borderRadius:'14px 14px 14px 4px',display:'flex',gap:4,alignItems:'center'}},
        [0,1,2].map(i=>React.createElement('span',{key:i,style:{width:6,height:6,borderRadius:'50%',background:C.muted,display:'inline-block',animation:'dot 1.2s '+(i*0.2)+'s infinite'}}))
      )
    ),
    error&&React.createElement('div',{style:{fontSize:11.5,padding:'8px 12px',borderRadius:8,background:C.rustSoft,color:C.rust}},error),
    // What-if patch diff card
    pendingPatch&&!patchApplied&&onApplyPatch&&React.createElement('div',{className:'anim-fade-in',style:{background:C.bgWarm,border:`1px solid ${C.gold}66`,borderRadius:12,padding:'12px 14px',marginTop:4}},
      React.createElement('div',{className:'label-eyebrow ff-body',style:{color:C.gold,marginBottom:8,fontSize:9}},'PROPOSED CHANGES · REVIEW BEFORE APPLYING'),
      React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:6,marginBottom:12}},
        pendingPatch.map((p,i)=>{
          const lbl=rowLabels?.[p.rowId]||p.rowId;
          const cur=currentRowData?.[p.rowId]?.[p.field];
          return React.createElement('div',{key:i,style:{display:'flex',alignItems:'center',gap:8,background:C.surface,borderRadius:7,padding:'7px 10px',border:`1px solid ${C.border}`}},
            React.createElement('span',{className:'ff-body',style:{flex:1,fontSize:11.5,color:C.ink,fontWeight:500}},lbl),
            React.createElement('span',{className:'ff-body',style:{fontSize:10.5,color:C.muted}},p.field),
            cur!==undefined&&React.createElement('span',{className:'ff-num',style:{fontSize:11,color:C.rust}},cur),
            cur!==undefined&&React.createElement('span',{style:{color:C.muted,fontSize:10}},'→'),
            React.createElement('span',{className:'ff-num',style:{fontSize:11,color:C.green,fontWeight:600}},p.newValue)
          );
        })
      ),
      React.createElement('div',{style:{display:'flex',gap:8}},
        React.createElement('button',{onClick:()=>{onApplyPatch(pendingPatch);setPatchApplied(true);setPendingPatch(null);},className:'ff-body',style:{fontSize:12,fontWeight:600,padding:'6px 14px',borderRadius:7,background:C.green,color:'#fff',border:'none',cursor:'pointer'}},'✓ Apply to base'),
        React.createElement('button',{onClick:()=>setPendingPatch(null),className:'ff-body',style:{fontSize:12,padding:'6px 14px',borderRadius:7,background:C.bg,color:C.muted,border:`1px solid ${C.border}`,cursor:'pointer'}},'Discard')
      )
    ),
    patchApplied&&React.createElement('div',{style:{padding:'8px 12px',borderRadius:8,background:C.greenSoft,fontSize:11.5,color:C.green,fontFamily:'Inter,system-ui,sans-serif'}},
      '✓ Changes applied to base scenario. Use Undo (Cmd+Z) to revert.'
    ),
    React.createElement('div',{ref:bottomRef})
  ),
  React.createElement('div',{style:{padding:'8px 12px 12px',borderTop:'1px solid '+C.border,flexShrink:0}},
    React.createElement('div',{style:{display:'flex',gap:8,alignItems:'flex-end',background:C.bg,border:'1px solid '+C.border,borderRadius:12,padding:'6px 6px 6px 12px'}},
      React.createElement('textarea',{ref:inputRef,value:input,onChange:e=>setInput(e.target.value),onKeyDown:handleKey,placeholder:'Ask about your model…',rows:1,className:'ff-body',style:{flex:1,fontSize:13,background:'transparent',color:C.ink,border:'none',outline:'none',resize:'none',lineHeight:1.5,maxHeight:80,overflowY:'auto'},onInput:e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,80)+'px';}}),
      React.createElement('button',{onClick:()=>send(),disabled:!input.trim()||loading,style:{background:input.trim()&&!loading?C.ink:C.surfaceAlt,color:input.trim()&&!loading?C.surface:C.faint,border:'none',borderRadius:8,padding:'6px 14px',fontFamily:'Inter,system-ui,sans-serif',fontSize:12,fontWeight:600,cursor:input.trim()&&!loading?'pointer':'not-allowed',flexShrink:0}},'Send')
    ),
    React.createElement('div',{className:'ff-body',style:{fontSize:10,marginTop:4,textAlign:'center',color:C.faint}},'Enter to send · Shift+Enter for new line')
  )
),
React.createElement('style',null,'@keyframes dot{0%,80%,100%{opacity:0.25;transform:scale(0.75)}40%{opacity:1;transform:scale(1)}}')
);
}


function Masthead({todayLabel,projectName,sectorLabel,regionLabel,onRename,onNewProject,onOpenWizard,onOpenAIGen,onImport}){
const[editing,setEditing]=useState(false);const[draft,setDraft]=useState(projectName||'');
useEffect(()=>{setDraft(projectName||'');},[projectName]);
const commit=()=>{const t=(draft||'').trim();if(t&&t!==projectName)onRename?.(t);setEditing(false);};
return(<div className="px-6 md:px-10 pt-8 pb-5"><div className="max-w-[1400px] mx-auto"><div className="flex items-start justify-between flex-wrap gap-4"><div className="flex-1 min-w-0">
<div className="flex items-center gap-2 flex-wrap mb-2">{sectorLabel&&<span className="ff-body text-[11px] px-2.5 py-1 rounded-full" style={{background:C.goldSoft,color:C.gold,fontWeight:600}}>{sectorLabel}</span>}{regionLabel&&<span className="ff-body text-[11px] px-2.5 py-1 rounded-full" style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.muted}}>{regionLabel}</span>}</div>
{editing?(<input value={draft} autoFocus onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')commit();if(e.key==='Escape'){setDraft(projectName||'');setEditing(false);}}} className="ff-display leading-tight outline-none w-full" style={{color:C.ink,fontSize:'clamp(28px,3.6vw,40px)',fontWeight:700,letterSpacing:'-0.025em',background:'transparent',borderBottom:`2px solid ${C.gold}`}}/>):(<h1 className="ff-display leading-tight cursor-text" onClick={()=>setEditing(true)} style={{color:C.ink,fontSize:'clamp(28px,3.6vw,40px)',fontWeight:700,letterSpacing:'-0.025em'}}>{projectName||'Untitled Project'}</h1>)}
<div className="flex items-center gap-3 mt-3 flex-wrap koala-masthead-actions"><button onClick={()=>setEditing(true)} className="ff-body text-[12px] flex items-center gap-1.5" style={{color:C.muted}}><Edit3 size={12}/> Rename</button><span style={{width:1,height:12,background:C.border}}/><button onClick={onOpenWizard} className="ff-body text-[12px]" style={{color:C.muted}}>Reopen wizard</button><span style={{width:1,height:12,background:C.border}}/><button onClick={onNewProject} className="ff-body text-[12px]" style={{color:C.muted}}>New project</button><span style={{width:1,height:12,background:C.border}}/><button onClick={onOpenAIGen} className="ff-body text-[12px] flex items-center gap-1.5" style={{color:C.gold,fontWeight:600}}><Sparkles size={12}/> Build from description</button><span style={{width:1,height:12,background:C.border}}/><button onClick={onImport} className="ff-body text-[12px] flex items-center gap-1.5" style={{color:C.muted}}><Upload size={12}/> Import file</button></div>
</div><div className="text-right flex-none hidden md:block"><div className="ff-body text-[10px]" style={{color:C.faint,letterSpacing:'0.1em',textTransform:'uppercase'}}>Last updated</div><div className="ff-body text-[14px] mt-1" style={{color:C.ink2,fontWeight:500}}>{todayLabel}</div></div></div>
</div></div>);
}

function ChapterTabs({tabs,active,onChange}){
return(<div className="flex items-end gap-0 flex-wrap" style={{borderBottom:`1px solid ${C.border}`}}>{tabs.map((t,idx)=>{const isA=t.id===active;return(<button key={t.id} onClick={()=>onChange(t.id)} className="group relative px-5 py-3" style={{marginBottom:-1,borderBottom:`2px solid ${isA?C.gold:'transparent'}`,borderRight:idx<tabs.length-1?`1px solid ${C.borderSoft}`:'none'}}><div className="flex flex-col items-start gap-0.5"><span className="label-folio" style={{color:isA?C.gold:C.faint}}>{String(idx+1).padStart(2,'0')}</span><span className="ff-body text-[13.5px]" style={{color:isA?C.ink:C.muted,lineHeight:1,fontWeight:500}}>{t.label}</span></div></button>);})}</div>);
}

function CompactScenarioPicker({activeScenario,onSelect,computedAll,periods}){
return(<div className="flex items-center gap-2 flex-wrap"><span className="label-eyebrow ff-body" style={{color:C.muted}}>Scenario</span><div className="flex rounded-md overflow-hidden" style={{border:`1px solid ${C.border}`}}>{SCENARIOS.map((sc,i)=>{const meta=SCENARIO_META[sc];const active=sc===activeScenario;const ni=computedAll[sc].values.netIncome||[];const lNI=ni[ni.length-1]||0;return(<button key={sc} onClick={()=>onSelect(sc)} className="px-3 py-1.5 ff-body text-[12px] flex items-center gap-2" style={{background:active?meta.tone:'transparent',color:active?C.surface:C.ink2,borderRight:i<SCENARIOS.length-1?`1px solid ${C.border}`:'none',fontWeight:active?500:400}}><span>{meta.label}</span><span className="ff-num text-[10.5px]" style={{color:active?'rgba(255,255,255,0.85)':lNI<0?C.rust:C.muted}}>{fmt(lNI,{abbreviate:true,paren:true})}</span></button>);})}</div></div>);
}

// Wizard
function WizardModal({initialAnswers,onComplete,onClose,onStartManual,allowSkip}){
const[step,setStep]=useState(0);const[name,setName]=useState(initialAnswers?.name||'');const[sK,setSK]=useState(initialAnswers?.sectorKey||null);const[rK,setRK]=useState(initialAnswers?.regionKey||null);const[cK,setCK]=useState(initialAnswers?.currencyKey||'usd');const[stmts,setStmts]=useState(initialAnswers?.statements||'incomeOnly');const[search,setSearch]=useState('');
const STEPS=[{id:'name',ey:'Step 01 of 05',title:'Name your project',sub:'Give this idea a working title.'},{id:'business',ey:'Step 02 of 05',title:'What kind of business?',sub:'Pick the closest match.'},{id:'region',ey:'Step 03 of 05',title:'Where will it operate?',sub:'Sets a default tax rate.'},{id:'currency',ey:'Step 04 of 05',title:'Pick a currency',sub:'Used for display.'},{id:'statements',ey:'Step 05 of 05',title:'Which statements?',sub:'Income is always on.'}];
const canAdv=step===0?name.trim().length>0:step===1?!!sK:step===2?!!rK:step===3?!!cK:!!stmts;
// Apply defaults for any unanswered step so the model is always complete.
const withDefaults=()=>({name:name.trim()||'Untitled Project',sectorKey:sK||'other',regionKey:rK||'us',currencyKey:cK||'usd',incomeType:'main',stage:'early',statements:stmts||'incomeOnly'});
const next=()=>{if(step<STEPS.length-1)setStep(step+1);else onComplete(withDefaults());};
const skipStep=()=>{
  if(step===0&&!name.trim())setName('Untitled Project');
  if(step===1&&!sK)setSK('other');
  if(step===2&&!rK)setRK('us');
  if(step<STEPS.length-1)setStep(s=>s+1);else onComplete(withDefaults());
};
const filtered=useMemo(()=>{if(!search.trim())return BB;const q=search.toLowerCase();const f={};for(const[k,b]of Object.entries(BB))if(b.label.toLowerCase().includes(q)||b.blurb.toLowerCase().includes(q)||b.category.toLowerCase().includes(q))f[k]=b;return f;},[search]);
const surp=()=>{const ks=Object.keys(BB).filter(k=>k!=='other');setSK(ks[Math.floor(Math.random()*ks.length)]);if(!rK)setRK('us');if(!name.trim())setName(BB[ks[0]]?.label+' — Quick Test');};
const Card=({active,onClick,title,blurb,right,icon,eyebrow})=>(<button onClick={onClick} className="text-left p-3.5 rounded-md" style={{background:active?C.surface:C.bg,border:`1px solid ${active?C.gold:C.border}`,boxShadow:active?`0 0 0 1px ${C.gold}`:'none'}}><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-2.5 flex-1 min-w-0">{icon&&<span className="text-[20px] flex-none" style={{lineHeight:1,marginTop:1}}>{icon}</span>}<div className="flex-1 min-w-0">{eyebrow&&<div className="label-eyebrow ff-body" style={{color:active?C.gold:C.muted,fontSize:9}}>{eyebrow}</div>}<div className="ff-display text-[16px] mt-0.5" style={{color:C.ink,fontWeight:500,lineHeight:1.15}}>{title}</div>{blurb&&<div className="ff-body text-[11px] mt-1" style={{color:C.muted,lineHeight:1.4}}>{blurb}</div>}</div></div>{right}</div></button>);
return(<div className="fixed inset-0 z-50 flex items-center justify-center anim-fade-in" style={{background:'rgba(15,23,42,0.5)'}} onClick={allowSkip?onClose:undefined}><div onClick={e=>e.stopPropagation()} className="w-full max-w-3xl mx-4 rounded-lg overflow-hidden shadow-2xl" style={{background:C.bg,border:`1px solid ${C.border}`,maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
<div className="px-7 pt-6 pb-5 flex-none" style={{borderBottom:`1px solid ${C.border}`,background:C.surface}}><div className="flex items-start justify-between gap-3"><div className="flex-1"><div className="label-eyebrow ff-body" style={{color:C.gold}}>{STEPS[step].ey}</div><h3 className="ff-display text-[28px] leading-tight mt-1" style={{color:C.ink,fontWeight:500}}>{STEPS[step].title}</h3><p className="ff-body text-[12px] mt-1.5" style={{color:C.muted}}>{STEPS[step].sub}</p></div>{allowSkip&&<button onClick={onClose} className="p-1.5 rounded-md mt-1" style={{color:C.ink2}}><X size={18}/></button>}</div><div className="flex gap-1.5 mt-4">{STEPS.map((_,i)=>(<div key={i} className="flex-1 h-1 rounded-full" style={{background:i<=step?C.gold:C.border,transition:'background 240ms ease-out'}}/>))}</div></div>
<div className="px-7 py-5 overflow-y-auto flex-1" style={{minHeight:0}}>
{step===0&&(<div><input type="text" value={name} placeholder="e.g. Coffee Shop in Tel Aviv" onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&canAdv)next();}} autoFocus className="w-full px-4 py-3 rounded-md ff-display text-[22px] outline-none" style={{background:C.surface,border:`1px solid ${C.border}`,color:C.ink,fontWeight:500}}/><div className="ff-body text-[11px] mt-2" style={{color:C.muted}}>Press Enter to continue.</div></div>)}
{step===1&&(<div><div className="flex items-center gap-2 mb-4 flex-wrap"><div className="relative flex-1 min-w-[220px]"><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search 'coffee', 'app', 'gym'..." className="w-full pl-3 pr-3 py-2 rounded-md ff-body text-[13px] outline-none" style={{background:C.surface,border:`1px solid ${C.border}`,color:C.ink}}/></div><button onClick={surp} className="px-3.5 py-2 rounded-md ff-body text-[12px] flex items-center gap-1.5" style={{background:C.goldSoft,border:`1px solid ${C.gold}55`,color:C.gold,fontWeight:500}}>Surprise me</button></div><div className="space-y-4">{BUSINESS_CATEGORIES.map(cat=>{const items=Object.entries(filtered).filter(([_,b])=>b.category===cat);if(!items.length)return null;return(<div key={cat}><div className="label-eyebrow ff-body mb-2" style={{color:C.muted,fontSize:9}}>{cat}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{items.map(([key,biz])=>(<Card key={key} active={sK===key} onClick={()=>setSK(key)} icon={biz.icon} title={biz.label} blurb={biz.blurb} right={<div className="text-right ff-num flex-none" style={{minWidth:60}}><div className="text-[8.5px]" style={{color:C.faint,letterSpacing:'0.1em'}}>NET</div><div className="text-[11px]" style={{color:C.ink2}}>{biz.benchmarks.netMargin[0]}–{biz.benchmarks.netMargin[1]}%</div></div>}/>))}</div></div>);})}{Object.keys(filtered).length===0&&<div className="text-center py-8"><div className="ff-body text-[13px]" style={{color:C.muted}}>No matches for "{search}".</div><button onClick={()=>{setSK('other');setSearch('');}} className="ff-body text-[12px] mt-3 px-3 py-1.5 rounded-md" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink2}}>Use "Something Else" instead →</button></div>}</div></div>)}
{step===2&&(<div className="grid grid-cols-2 md:grid-cols-3 gap-2">{Object.entries(REGIONS).map(([key,reg])=>(<Card key={key} active={rK===key} onClick={()=>setRK(key)} title={reg.label} right={<div className="text-right ff-num flex-none" style={{minWidth:50}}><div className="text-[9px]" style={{color:C.faint,letterSpacing:'0.1em'}}>TAX</div><div className="text-[11.5px]" style={{color:C.ink2}}>{reg.taxRate}%</div></div>}/>))}</div>)}
{step===3&&(<div className="grid grid-cols-2 md:grid-cols-3 gap-2">{Object.entries(CURRENCIES).map(([key,c])=>(<Card key={key} active={cK===key} onClick={()=>setCK(key)} title={`${c.symbol}  ${c.label}`} blurb={c.name}/>))}</div>)}
{step===4&&(<div className="grid grid-cols-1 md:grid-cols-3 gap-2">{Object.entries(STATEMENT_OPTIONS).map(([key,s])=>(<Card key={key} active={stmts===key} onClick={()=>setStmts(key)} title={s.label} blurb={s.blurb}/>))}</div>)}
</div>
<div className="flex items-center justify-between px-7 py-4 gap-3 flex-none" style={{borderTop:`1px solid ${C.border}`,background:C.surface}}><div className="flex items-center gap-3"><button onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0} className="px-3 py-1.5 rounded-md ff-body text-[12.5px]" style={{color:step===0?C.faint:C.ink2,opacity:step===0?0.5:1,pointerEvents:step===0?'none':'auto'}}>← Back</button>{onStartManual&&<button onClick={onStartManual} className="px-3 py-1.5 rounded-md ff-body text-[12.5px]" style={{color:C.muted,background:'transparent'}} title="Skip the wizard and start with an empty model (all values 0)">Start blank →</button>}</div><div className="flex items-center gap-3"><span className="ff-body text-[11px]" style={{color:C.muted}}>{step+1} of {STEPS.length}</span>{!canAdv&&<button onClick={skipStep} className="px-3 py-1.5 rounded-md ff-body text-[12.5px]" style={{color:C.ink2,background:'transparent',border:`1px solid ${C.border}`}}>Skip →</button>}<button onClick={next} disabled={!canAdv} className="px-5 py-2 rounded-md ff-body text-[12.5px]" style={{background:canAdv?C.ink:C.surfaceAlt,color:canAdv?C.surface:C.faint,fontWeight:500,cursor:canAdv?'pointer':'not-allowed'}}>{step===STEPS.length-1?'Build my model →':'Continue →'}</button></div></div>
</div></div>);
}

function FinancialModelBuilderInner({projectId}={}){
const user=useAuth();const navigate=useNavigate();const location=useLocation();
const requireAuthForAI=useCallback(()=>{if(!user){
// Remember where they were so PostAuthRedirect returns them to this workspace
// (their in-progress model) after sign-in — not the public landing page.
try{sessionStorage.setItem('koala:postAuthRedirect',window.location.pathname+window.location.search);}catch{}
navigate('/auth');return false;}return true;},[user,navigate]);
const[isPortraitMob,setIsPortraitMob]=useState(()=>typeof window!=='undefined'&&window.innerWidth<640&&window.innerHeight>window.innerWidth);
useEffect(()=>{const chk=()=>setIsPortraitMob(window.innerWidth<640&&window.innerHeight>window.innerWidth);window.addEventListener('resize',chk);window.addEventListener('orientationchange',chk);return()=>{window.removeEventListener('resize',chk);window.removeEventListener('orientationchange',chk);};},[]);
const[granularity,setGranularity]=useState('annual');const[numPeriods,setNumPeriods]=useState(5);const[startYear,setStartYear]=useState(2025);const[activeScenario,setActiveScenario]=useState('base');
const[projectName,setProjectName]=useState('Untitled Project');const[wizardAnswers,setWizardAnswers]=useState(null);const[showWizard,setShowWizard]=useState(true);const[showAnalysisDrawer,setShowAnalysisDrawer]=useState(false);
const[enabledStatements,setEnabledStatements]=useState({income:true,balance:false,cashFlow:false});
const[currencyKey,setCurrencyKey]=useState('usd');const[showCritique,setShowCritique]=useState(false);const[showAI,setShowAI]=useState(false);
const[showAIGen,setShowAIGen]=useState(false);const[shareCopied,setShareCopied]=useState(false);const[inMillions,setInMillions]=useState(false);
// Tracks whether a real model exists yet (loaded / wizard / AI). When false,
// dismissing the wizard means "start in Manual Mode" → a blank, all-zero model.
const[hasModel,setHasModel]=useState(false);
const[buildTab,setBuildTab]=useState('income');
// Expand/collapse per statement
const[expandedIncome,setExpandedIncome]=useState(()=>new Set());
const[expandedBalance,setExpandedBalance]=useState(()=>new Set());
const[expandedCashFlow,setExpandedCashFlow]=useState(()=>new Set());

const[rows,setRows]=useState({income:TEMPLATES.income.map(r=>({...r})),balance:TEMPLATES.balance.map(r=>({...r})),cashFlow:TEMPLATES.cashFlow.map(r=>({...r}))});
const[rowData,setRowData]=useState(()=>{
// Manual Mode default: every P&L numeric field starts at 0. The wizard / AI
// flows explicitly seed realistic numbers on top of this blank baseline.
const all={};
for(const sc of SCENARIOS){all[sc]={};for(const stmt of['income','balance','cashFlow'])for(const r of TEMPLATES[stmt])if(r.type==='leaf')all[sc][r.id]=makeRowDataEntry(r.defaultMode,5);}
return all;
});
const[customGrowthRow,setCustomGrowthRow]=useState(null);const[addRowFor,setAddRowFor]=useState(null);const[showSaveLoad,setShowSaveLoad]=useState(false);
const[history,setHistory]=useState([]);const[histIdx,setHistIdx]=useState(-1);const isRestoring=useRef(false);
useEffect(()=>{if(isRestoring.current){isRestoring.current=false;return;}const snap={rows,rowData,enabledStatements};setHistory(prev=>{const tr=prev.slice(0,histIdx+1);const nx=[...tr,snap];const cp=nx.length>30?nx.slice(nx.length-30):nx;setHistIdx(cp.length-1);return cp;});},[rows,rowData,enabledStatements]); // eslint-disable-line
const canUndo=histIdx>0;const canRedo=histIdx<history.length-1;
const handleUndo=useCallback(()=>{if(!canUndo)return;const t=history[histIdx-1];isRestoring.current=true;setRows(t.rows);setRowData(t.rowData);setEnabledStatements(t.enabledStatements);setHistIdx(histIdx-1);},[canUndo,history,histIdx]);
const handleRedo=useCallback(()=>{if(!canRedo)return;const t=history[histIdx+1];isRestoring.current=true;setRows(t.rows);setRowData(t.rowData);setEnabledStatements(t.enabledStatements);setHistIdx(histIdx+1);},[canRedo,history,histIdx]);
useEffect(()=>{const h=(e)=>{const m=e.metaKey||e.ctrlKey;if(m&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)handleRedo();else handleUndo();}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);},[handleUndo,handleRedo]);
useEffect(()=>{setRowData(prev=>{const nx={};for(const sc of SCENARIOS){nx[sc]={};for(const id in prev[sc])nx[sc][id]=resizeRowData(prev[sc][id],numPeriods);}return nx;});},[numPeriods]);
const periods=useMemo(()=>buildPeriodLabels(granularity,numPeriods,startYear),[granularity,numPeriods,startYear]);
const computed=useMemo(()=>computeScenario(rows,rowData[activeScenario],numPeriods),[rows,rowData,activeScenario,numPeriods]);
const computedAll=useMemo(()=>{const m={};for(const sc of SCENARIOS)m[sc]=computeScenario(rows,rowData[sc],numPeriods);return m;},[rows,rowData,numPeriods]);
const updateRowData=useCallback((rowId,patch)=>{setRowData(prev=>({...prev,[activeScenario]:{...prev[activeScenario],[rowId]:{...prev[activeScenario][rowId],...patch}}}));},[activeScenario]);
const deleteRow=useCallback((rowId)=>{setRows(prev=>{const nx={...prev};for(const s of['income','balance','cashFlow'])nx[s]=nx[s].filter(r=>r.id!==rowId&&r.parentId!==rowId);return nx;});setRowData(prev=>{const nx={};for(const sc of SCENARIOS){nx[sc]={...prev[sc]};delete nx[sc][rowId];}return nx;});},[]);
const addRow=useCallback((statementId,{label,parentId,defaultMode})=>{const id=newRowId(statementId);const nr={id,label,type:'leaf',parentId,defaultMode:defaultMode||'manual',deletable:true};setRows(prev=>{const list=prev[statementId];let lastIdx=-1;for(let i=0;i<list.length;i++)if(list[i].parentId===parentId)lastIdx=i;const nl=list.slice();nl.splice(lastIdx>=0?lastIdx+1:nl.length,0,nr);return{...prev,[statementId]:nl};});setRowData(prev=>{const nx={};for(const sc of SCENARIOS)nx[sc]={...prev[sc],[id]:makeRowDataEntry(defaultMode,numPeriods)};return nx;});},[numPeriods]);
const handleWizardComplete=useCallback((answers)=>{setWizardAnswers(answers);setProjectName(answers.name||'Untitled Project');setCurrencyKey(answers.currencyKey||'usd');const s=seedProjectForWizard({sectorKey:answers.sectorKey,regionKey:answers.regionKey,statements:answers.statements,numPeriods});setRows(s.rows);setRowData(ensureBaseProfit(s.rows,s.rowData,numPeriods));setEnabledStatements(s.enabledStatements);setHasModel(true);if(!s.enabledStatements.balance&&buildTab==='balance')setBuildTab('income');if(!s.enabledStatements.cashFlow&&buildTab==='cashFlow')setBuildTab('income');setShowWizard(false);capture('model_wizard_completed',{sectorKey:answers.sectorKey,regionKey:answers.regionKey,statements:answers.statements});},[numPeriods,buildTab]);
// Reset the in-memory model to a blank, all-zero baseline.
const blankModel=useCallback(()=>{setRows({income:TEMPLATES.income.map(r=>({...r})),balance:TEMPLATES.balance.map(r=>({...r})),cashFlow:TEMPLATES.cashFlow.map(r=>({...r}))});const all={};for(const sc of SCENARIOS){all[sc]={};for(const stmt of['income','balance','cashFlow'])for(const r of TEMPLATES[stmt])if(r.type==='leaf')all[sc][r.id]=makeRowDataEntry(r.defaultMode,numPeriods);}setRowData(all);setWizardAnswers(null);setEnabledStatements({income:true,balance:false,cashFlow:false});setBuildTab('income');},[numPeriods]);
// "New project": fresh id (so we never overwrite or resume the old model) + a
// blank zero canvas, then reopen the wizard. Skipping the wizard keeps the zeros.
const handleNewProject=useCallback(()=>{pidRef.current=genId();blankModel();setProjectName('Untitled Project');setHasModel(false);setShowWizard(true);},[blankModel]);
// Manual mode: start a blank report with every P&L field defaulting to 0.
const handleStartManual=useCallback(()=>{blankModel();setHasModel(true);setShowWizard(false);},[blankModel]);

// AI generation: apply a validated ModelDraft (from AIGenerateModal)
const handleAIGenComplete=useCallback((draft)=>{
const answers={name:draft.name||'AI-Generated Model',sectorKey:draft.sectorKey,regionKey:draft.regionKey,currencyKey:'usd',incomeType:'main',stage:'early',statements:draft.statements};
setWizardAnswers(answers);setProjectName(answers.name);setCurrencyKey('usd');
const s=seedProjectForWizard({sectorKey:draft.sectorKey,regionKey:draft.regionKey,statements:draft.statements,numPeriods});
// Apply overrides to all scenarios
if(draft.overrides&&draft.overrides.length>0){const rd={...s.rowData};for(const sc of SCENARIOS){rd[sc]={...rd[sc]};for(const ov of draft.overrides){if(rd[sc][ov.rowId]){rd[sc][ov.rowId]={...rd[sc][ov.rowId]};if(ov.mode)rd[sc][ov.rowId].mode=ov.mode;if(ov.baseValue!==undefined)rd[sc][ov.rowId].baseValue=ov.baseValue;if(ov.flatRate!==undefined)rd[sc][ov.rowId].flatRate=ov.flatRate;if(ov.pctOfRev!==undefined)rd[sc][ov.rowId].pctOfRev=ov.pctOfRev;}}}s.rowData=rd;}
// Guardrail: keep the Base scenario profitable in year 1 even if the AI overshot opex.
s.rowData=ensureBaseProfit(s.rows,s.rowData,numPeriods);
setRows(s.rows);setRowData(s.rowData);setEnabledStatements(s.enabledStatements);setHasModel(true);
if(!s.enabledStatements.balance&&buildTab==='balance')setBuildTab('income');
if(!s.enabledStatements.cashFlow&&buildTab==='cashFlow')setBuildTab('income');
setShowAIGen(false);},[numPeriods,buildTab]);

// What-if patch: apply AI-proposed numeric changes to base scenario
const handleApplyAIPatch=useCallback((patches)=>{setRowData(prev=>{const nx={...prev,[activeScenario]:{...prev[activeScenario]}};for(const p of patches){if(nx[activeScenario][p.rowId]){nx[activeScenario][p.rowId]={...nx[activeScenario][p.rowId]};if(p.field==='baseValue')nx[activeScenario][p.rowId].baseValue=Number(p.newValue)||0;if(p.field==='flatRate')nx[activeScenario][p.rowId].flatRate=Number(p.newValue)||0;if(p.field==='pctOfRev')nx[activeScenario][p.rowId].pctOfRev=Number(p.newValue)||0;}}return nx;});},[activeScenario]);

// fullState + loadState must be declared before handleShare (dep array evaluated during render)
const fullState={granularity,numPeriods,startYear,activeScenario,rows,rowData};
const loadState=(s)=>{if(!s)return;if(s.granularity)setGranularity(s.granularity);if(s.numPeriods)setNumPeriods(s.numPeriods);if(s.startYear)setStartYear(s.startYear);if(s.activeScenario)setActiveScenario(s.activeScenario);if(s.rows){const np=s.numPeriods||numPeriods;const{rows:mr,rowData:mrd}=reconcileLoadedRows(s.rows,s.rowData,np);setRows(mr);setRowData(mrd);}else if(s.rowData)setRowData(s.rowData);};

// Share: save snapshot + model to localStorage, copy URL to clipboard
const handleShare=useCallback(async ()=>{
const shareId=genId();
const snap={periods,revenue:computed.values.revenue||[],netIncome:computed.values.netIncome||[],grossProfit:computed.values.grossProfit||[],operatingIncome:computed.values.operatingIncome||[],incomeRows:rows.income.map(r=>({id:r.id,label:r.label,type:r.type,parentId:r.parentId})),incomeValues:{}};
for(const r of rows.income)if(computed.values[r.id])snap.incomeValues[r.id]=computed.values[r.id];
const ok=await saveShare(shareId,{meta:{name:projectName,sectorKey:wizardAnswers?.sectorKey,regionKey:wizardAnswers?.regionKey,currencyKey,enabledStatements},model:fullState,wizardAnswers,snapshot:snap});
if(!ok){alert('Could not save share.');return;}
capture('model_shared',{sectorKey:wizardAnswers?.sectorKey});
const url=window.location.origin+'/r/'+shareId;
navigator.clipboard.writeText(url).then(()=>{setShareCopied(true);setTimeout(()=>setShareCopied(false),2500);}).catch(()=>alert('Share URL: '+url));
},[computed,rows,periods,fullState,wizardAnswers,projectName,currencyKey,enabledStatements]);
const handleRemoveStatement=useCallback((stmt)=>{if(stmt==='income')return;setEnabledStatements(s=>({...s,[stmt]:false}));setBuildTab('income');},[]);
const exportExcel=useCallback(()=>{
const stmtNames={income:'Income Statement',balance:'Balance Sheet',cashFlow:'Cash Flow Statement'};
const sym=CURRENCIES[currencyKey]?.symbol||'$';
const activeStmts=['income',...(enabledStatements.balance?['balance']:[]),...(enabledStatements.cashFlow?['cashFlow']:[])];
let html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><style>';
html+='body{font-family:Calibri,Arial,sans-serif;font-size:11pt;}';
html+='table{border-collapse:collapse;margin-bottom:20pt;min-width:400pt;}';
html+='td,th{border:1px solid #CBD5E1;padding:4pt 8pt;white-space:nowrap;}';
html+='.hdr{background:#0F172A;color:#FFFFFF;font-weight:bold;font-size:12pt;padding:8pt 10pt;}';
html+='.period-hdr{background:#F1F5F9;text-align:center;font-weight:bold;color:#334155;}';
html+='.parent-row{background:#F8FAFC;font-weight:600;color:#0F172A;}';
html+='.comp-row{background:#ECFDF5;font-weight:700;color:#059669;}';
html+='.leaf-row{color:#334155;}';
html+='.num{text-align:right;font-family:Calibri,monospace;}';
html+='.neg{color:#DC2626;}';
html+='h3{font-family:Calibri;font-size:10pt;color:#64748B;margin:0 0 6pt;font-weight:400;}';
html+='</style></head><body>';
html+='<h3>'+projectName+' &mdash; '+SCENARIO_META[activeScenario].label+' scenario &mdash; '+(granularity==='annual'?'Annual':'Quarterly')+', '+startYear+' &mdash; '+sym+' (whole numbers)</h3>';
for(const stmt of activeStmts){
html+='<table><tr><th class="hdr" colspan="'+(periods.length+1)+'">'+stmtNames[stmt]+'</th></tr>';
html+='<tr><th style="background:#F1F5F9;color:#64748B;text-align:left;">Line Item</th>';
for(const p of periods)html+='<th class="period-hdr">'+p+'</th>';
html+='</tr>';
for(const r of rows[stmt]){
const v=computed.values[r.id]||[];
const cls=r.type==='computed'?'comp-row':r.type==='parent'?'parent-row':'leaf-row';
const indent=r.type==='leaf'?'padding-left:18pt;':'';
html+='<tr class="'+cls+'"><td style="'+indent+'">'+r.label+'</td>';
for(let i=0;i<periods.length;i++){const n=Math.round(v[i]||0);const neg=n<0;const disp=neg?'('+Math.abs(n).toLocaleString('en-US')+')':n===0?'—':n.toLocaleString('en-US');html+='<td class="num'+(neg?' neg':'')+'">'+disp+'</td>';}
html+='</tr>';
}
html+='</table>';}
html+='</body></html>';
const b=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'});
const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;
a.download=(projectName.replace(/[^a-z0-9]/gi,'-')||'model')+'-'+activeScenario+'-'+Date.now()+'.xls';
a.click();URL.revokeObjectURL(url);
},[rows,computed,periods,activeScenario,granularity,numPeriods,startYear,enabledStatements,currencyKey,projectName]);
// --- Persistence: load saved project on mount, then debounced autosave ---
// "New" deep-links (?new=manual / ?new=ai) must start a FRESH project, never
// resume the last-active one — otherwise a returning user always sees their old
// saved numbers instead of a clean zero model.
const newModeRef=useRef((()=>{try{return new URLSearchParams(window.location.search||'').get('new');}catch{return null;}})());
const pidRef=useRef(projectId||(newModeRef.current?genId():(getLastActive()||genId())));
const didLoadRef=useRef(false);
useEffect(()=>{if(didLoadRef.current)return;didLoadRef.current=true;
if(newModeRef.current){
// Fresh start requested. Keep the blank, all-zero baseline already in state.
// Manual → drop straight into the empty editable model (no wizard, no numbers).
// AI → the deep-link effect below opens the AI Generate modal.
if(newModeRef.current==='manual'){setShowWizard(false);setHasModel(true);}
return;
}
(async()=>{const doc=await loadProject(pidRef.current);if(doc&&doc.model){loadState(doc.model);if(doc.meta){if(doc.meta.name)setProjectName(doc.meta.name);if(doc.meta.currencyKey)setCurrencyKey(doc.meta.currencyKey);if(doc.meta.enabledStatements)setEnabledStatements(doc.meta.enabledStatements);}if(doc.wizardAnswers)setWizardAnswers(doc.wizardAnswers);setHasModel(true);setShowWizard(false);}
// No saved project: leave the blank, all-zero Manual Mode baseline in place.
// The wizard sits on top; dismissing it keeps the zeros (manual start).
})();},[]); // eslint-disable-line
// Deep-link: arriving at /app?new=ai (e.g. the "New with AI" button on the
// dashboard) skips the wizard and opens the AI Generate modal directly, which
// fires the live /api/chat request on submit. Runs once.
const aiDeepLinkRef=useRef(false);
useEffect(()=>{if(aiDeepLinkRef.current)return;const params=new URLSearchParams(location.search||'');if(params.get('new')==='ai'){aiDeepLinkRef.current=true;
// requireAuthForAI redirects to /auth (stashing this URL incl. ?new=ai) when
// signed out — so on return the modal re-opens. Only proceed + clean the param
// when authenticated, otherwise the cleanup would cancel the /auth redirect.
if(requireAuthForAI()){setShowWizard(false);setShowAIGen(true);navigate(location.pathname,{replace:true});}}
else if(params.get('new')==='manual'){navigate(location.pathname,{replace:true});}},[location.search,location.pathname,requireAuthForAI,navigate]);
useEffect(()=>{if(showWizard)return;const t=setTimeout(async()=>{await saveProject(pidRef.current,{meta:{name:projectName,sectorKey:wizardAnswers?.sectorKey,regionKey:wizardAnswers?.regionKey,currencyKey,enabledStatements},model:fullState,wizardAnswers});},800);return()=>clearTimeout(t);},[granularity,numPeriods,startYear,activeScenario,rows,rowData,projectName,currencyKey,enabledStatements,wizardAnswers,showWizard]); // eslint-disable-line
const resetModel=()=>{setRows({income:TEMPLATES.income.map(r=>({...r})),balance:TEMPLATES.balance.map(r=>({...r})),cashFlow:TEMPLATES.cashFlow.map(r=>({...r}))});const all={};for(const sc of SCENARIOS){all[sc]={};for(const stmt of['income','balance','cashFlow'])for(const r of TEMPLATES[stmt])if(r.type==='leaf')all[sc][r.id]=makeRowDataEntry(r.defaultMode,numPeriods);}setRowData(all);};
const rowLabels=useMemo(()=>{const m={};for(const stmt of['income','balance','cashFlow'])for(const r of rows[stmt]||[])m[r.id]=r.label;return m;},[rows]);
const BUILD_TABS=useMemo(()=>{const t=[{id:'income',label:'Income Statement'}];if(enabledStatements.balance)t.push({id:'balance',label:'Balance Sheet'});if(enabledStatements.cashFlow)t.push({id:'cashFlow',label:'Cash Flow'});return t;},[enabledStatements]);
const todayLabel=useMemo(()=>new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),[]);

const toggleExpand=(stmt,id)=>{const setFn={income:setExpandedIncome,balance:setExpandedBalance,cashFlow:setExpandedCashFlow}[stmt];if(!setFn)return;setFn(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});};
const expandAll=(stmt)=>{const setFn={income:setExpandedIncome,balance:setExpandedBalance,cashFlow:setExpandedCashFlow}[stmt];const stmtRows={income:rows.income,balance:rows.balance,cashFlow:rows.cashFlow}[stmt];if(!setFn||!stmtRows)return;setFn(new Set(stmtRows.filter(r=>r.type==='parent').map(r=>r.id)));};
const collapseAll=(stmt)=>{const setFn={income:setExpandedIncome,balance:setExpandedBalance,cashFlow:setExpandedCashFlow}[stmt];if(!setFn)return;setFn(new Set());};
const expandedFor={income:expandedIncome,balance:expandedBalance,cashFlow:expandedCashFlow};

if(isPortraitMob)return(
<div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#070D1A',padding:'40px 28px',textAlign:'center',gap:28,boxSizing:'border-box'}}>
<FontStyles/>
<div style={{width:76,height:76,borderRadius:22,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
<svg className="rotate-hint" width={38} height={38} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
<rect x="7" y="2" width="10" height="19" rx="2"/>
<line x1="11" y1="17" x2="13" y2="17"/>
</svg>
</div>
<div>
<div style={{fontFamily:'Plus Jakarta Sans,Inter,sans-serif',fontSize:24,fontWeight:700,color:'#F8FAFC',letterSpacing:'-0.02em',marginBottom:12}}>Rotate your phone</div>
<div style={{fontFamily:'Inter,sans-serif',fontSize:15,lineHeight:1.65,color:'rgba(248,250,252,0.48)',maxWidth:300,margin:'0 auto'}}>The financial model builder is designed for landscape view. Turn your phone sideways to see the full model.</div>
</div>
<div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:30,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
<span style={{fontFamily:'Inter,sans-serif',fontSize:12,color:'rgba(255,255,255,0.3)'}}>Your model saves automatically</span>
</div>
</div>
);
return(<MillionsCtx.Provider value={inMillions}><div className="min-h-screen ff-body relative" style={{background:C.bg,color:C.ink}}><FontStyles/>
<div className="stagger stagger-1"><Masthead todayLabel={todayLabel} projectName={projectName} sectorLabel={wizardAnswers?BB[wizardAnswers.sectorKey]?.label:null} regionLabel={wizardAnswers?REGIONS[wizardAnswers.regionKey]?.label:null} onRename={n=>setProjectName(n)} onNewProject={handleNewProject} onOpenWizard={()=>setShowWizard(true)} onOpenAIGen={()=>{if(requireAuthForAI())setShowAIGen(true);}} onImport={()=>setShowSaveLoad(true)}/></div>

<button onClick={()=>{if(requireAuthForAI())setShowAI(true);}} className="fixed z-30 right-5 md:right-7 flex items-center gap-2 px-4 py-2.5 rounded-full koala-fab-ai" style={{bottom:72,background:C.gold,color:C.ink,boxShadow:`0 8px 24px -8px rgba(184,137,62,0.55),0 0 0 1px ${C.gold}`,fontFamily:'Inter,system-ui,sans-serif'}}>
<Sparkles size={14}/><span className="text-[12.5px]" style={{fontWeight:600}}>AI Advisor</span>
</button>
<button onClick={()=>setShowAnalysisDrawer(true)} className="fixed z-30 right-5 bottom-5 md:right-7 md:bottom-5 flex items-center gap-2 px-4 py-2.5 rounded-full koala-fab-analysis" style={{background:C.ink,color:C.surface,boxShadow:`0 12px 28px -10px rgba(15,23,42,0.45),0 0 0 1px ${C.gold}55`,fontFamily:'Inter,system-ui,sans-serif'}}>
<BarChart3 size={14}/><span className="text-[12.5px]" style={{fontWeight:500}}>Analysis</span>
<span className="ff-num text-[10px] px-1.5 py-0.5 rounded" style={{background:C.gold,color:C.ink}}>{(()=>{const f=computeFeasibilityScore(computedAll,periods,wizardAnswers?.sectorKey||'other',granularity,enabledStatements);return f.score;})()}</span>
</button>

<div className="px-6 md:px-10 mt-6 stagger stagger-3"><div className="max-w-[1400px] mx-auto space-y-3">
<div className="flex items-baseline justify-between flex-wrap gap-2 mb-1"><Eyebrow color={C.gold}>Editing scenario · {SCENARIO_META[activeScenario].label}</Eyebrow><span className="ff-body text-[10.5px]" style={{color:C.muted}}>All changes apply to the selected scenario only</span></div>
<div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-md koala-toolbar" style={{background:C.surface,border:`1px solid ${C.border}`}}>
<CompactScenarioPicker activeScenario={activeScenario} onSelect={setActiveScenario} computedAll={computedAll} periods={periods}/>
<div style={{width:1,height:24,background:C.border}} className="hidden md:block"/>
<div className="flex items-center gap-2 flex-wrap"><span className="label-eyebrow ff-body" style={{color:C.muted}}>View</span><div className="flex rounded-md overflow-hidden" style={{border:`1px solid ${C.border}`}}>{['annual','quarterly'].map(g=>(<button key={g} onClick={()=>setGranularity(g)} className="px-3 py-1 ff-body text-[11.5px]" style={{background:granularity===g?C.ink:'transparent',color:granularity===g?C.surface:C.ink2,textTransform:'capitalize'}}>{g}</button>))}</div></div>
<div className="flex items-center gap-2"><span className="label-eyebrow ff-body" style={{color:C.muted}}>Periods</span><input type="number" min={2} max={20} value={numPeriods} onChange={e=>setNumPeriods(Math.max(2,Math.min(20,+e.target.value||2)))} className="w-14 px-2 py-1 rounded-md ff-num text-[12px] text-center outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/></div>
<div className="flex items-center gap-2"><span className="label-eyebrow ff-body" style={{color:C.muted}}>Start</span><input type="number" value={startYear} onChange={e=>setStartYear(+e.target.value||2025)} className="w-20 px-2 py-1 rounded-md ff-num text-[12px] text-center outline-none" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink}}/></div>
<div className="flex-1"/>
<div className="flex items-center gap-2">
<button onClick={handleUndo} disabled={!canUndo} className="px-2.5 py-1.5 rounded-md ff-body text-[11.5px]" style={{background:C.bg,border:`1px solid ${C.border}`,color:canUndo?C.ink2:C.faint,opacity:canUndo?1:0.5,cursor:canUndo?'pointer':'not-allowed'}} title="Undo (Cmd+Z)">↶ Undo</button>
<button onClick={handleRedo} disabled={!canRedo} className="px-2.5 py-1.5 rounded-md ff-body text-[11.5px]" style={{background:C.bg,border:`1px solid ${C.border}`,color:canRedo?C.ink2:C.faint,opacity:canRedo?1:0.5,cursor:canRedo?'pointer':'not-allowed'}} title="Redo (Cmd+Shift+Z)">↷ Redo</button>
<button onClick={()=>setShowSaveLoad(true)} className="px-3 py-1.5 rounded-md ff-body text-[11.5px] flex items-center gap-1.5" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink2}}><Upload size={12}/> Import / Save</button>
<button onClick={()=>setInMillions(m=>!m)} title="Show all figures in millions · type 1 = $1,000,000" className="px-3 py-1.5 rounded-md ff-body text-[11.5px]" style={{background:inMillions?C.goldSoft:C.bg,border:`1px solid ${inMillions?C.gold:C.border}`,color:inMillions?C.gold:C.ink2,fontWeight:inMillions?600:400}}>In $M</button>
<button onClick={exportExcel} className="px-3 py-1.5 rounded-md ff-body text-[11.5px] flex items-center gap-1.5" style={{background:C.bg,border:`1px solid ${C.border}`,color:C.ink2}}><Download size={12}/> Excel</button>
<button onClick={handleShare} className="px-3 py-1.5 rounded-md ff-body text-[11.5px] flex items-center gap-1.5" style={{background:shareCopied?C.greenSoft:C.bg,border:`1px solid ${shareCopied?C.green:C.border}`,color:shareCopied?C.green:C.ink2}}>{shareCopied?'✓ Link copied':'↗ Share'}</button>
<button onClick={resetModel} className="px-3 py-1.5 rounded-md ff-body text-[11.5px]" style={{background:'transparent',color:C.muted}}>Reset</button>
</div>
</div>
</div></div>

{!showWizard&&<div className="px-6 md:px-10 mt-6 stagger stagger-4"><div className="max-w-[1400px] mx-auto"><PerformanceDashboard computed={computed} periods={periods} scenarioLabel={SCENARIO_META[activeScenario].label} symbol={CURRENCIES[currencyKey]?.symbol||'$'}/></div></div>}

<div className="px-6 md:px-10 mt-6 stagger stagger-4"><div className="max-w-[1400px] mx-auto">
<div className="flex items-center gap-2 flex-wrap mb-1">
<button onClick={()=>setBuildTab('income')} className="px-3.5 py-1.5 rounded-full ff-body text-[12px]" style={{background:buildTab==='income'?C.ink:C.surface,color:buildTab==='income'?C.surface:C.ink2,border:`1px solid ${buildTab==='income'?C.ink:C.border}`,transition:'all .15s'}}>Income Statement</button>
{enabledStatements.balance
?(<span className="flex items-center gap-1"><button onClick={()=>setBuildTab('balance')} className="px-3.5 py-1.5 rounded-full ff-body text-[12px]" style={{background:buildTab==='balance'?C.ink:C.surface,color:buildTab==='balance'?C.surface:C.ink2,border:`1px solid ${buildTab==='balance'?C.ink:C.border}`,transition:'all .15s'}}>Balance Sheet</button><button onClick={()=>handleRemoveStatement('balance')} title="Remove Balance Sheet" className="flex items-center justify-center rounded-full" style={{width:18,height:18,background:C.bg,border:`1px solid ${C.border}`,color:C.rust,cursor:'pointer',flexShrink:0,padding:0}}><X size={9}/></button></span>)
:(<button onClick={()=>{setEnabledStatements(s=>({...s,balance:true}));setBuildTab('balance');}} className="px-3.5 py-1.5 rounded-full ff-body text-[12px] flex items-center gap-1.5" style={{background:'transparent',color:C.gold,border:`1px dashed ${C.gold}77`,transition:'all .15s'}}><Plus size={11}/>Balance Sheet</button>)}
{enabledStatements.cashFlow
?(<span className="flex items-center gap-1"><button onClick={()=>setBuildTab('cashFlow')} className="px-3.5 py-1.5 rounded-full ff-body text-[12px]" style={{background:buildTab==='cashFlow'?C.ink:C.surface,color:buildTab==='cashFlow'?C.surface:C.ink2,border:`1px solid ${buildTab==='cashFlow'?C.ink:C.border}`,transition:'all .15s'}}>Cash Flow</button><button onClick={()=>handleRemoveStatement('cashFlow')} title="Remove Cash Flow" className="flex items-center justify-center rounded-full" style={{width:18,height:18,background:C.bg,border:`1px solid ${C.border}`,color:C.rust,cursor:'pointer',flexShrink:0,padding:0}}><X size={9}/></button></span>)
:(<button onClick={()=>{setEnabledStatements(s=>({...s,cashFlow:true}));setBuildTab('cashFlow');}} className="px-3.5 py-1.5 rounded-full ff-body text-[12px] flex items-center gap-1.5" style={{background:'transparent',color:C.gold,border:`1px dashed ${C.gold}77`,transition:'all .15s'}}><Plus size={11}/>Cash Flow</button>)}
</div>
<div className="mt-5 overflow-x-auto pb-2" style={{WebkitOverflowScrolling:'touch'}}>
{buildTab==='income'&&<StatementTable statementId="income" rows={rows.income} rowData={rowData[activeScenario]} computedValues={computed.values} periods={periods} expandedIds={expandedFor.income} onToggleExpand={id=>toggleExpand('income',id)} onExpandAll={()=>expandAll('income')} onCollapseAll={()=>collapseAll('income')} onUpdateRowData={updateRowData} onDeleteRow={deleteRow} onOpenCustom={r=>setCustomGrowthRow(r)} onAddRow={()=>setAddRowFor('income')} scenarioKey={activeScenario}/>}
{buildTab==='balance'&&enabledStatements.balance&&<StatementTable statementId="balance" rows={rows.balance} rowData={rowData[activeScenario]} computedValues={computed.values} periods={periods} expandedIds={expandedFor.balance} onToggleExpand={id=>toggleExpand('balance',id)} onExpandAll={()=>expandAll('balance')} onCollapseAll={()=>collapseAll('balance')} onUpdateRowData={updateRowData} onDeleteRow={deleteRow} onOpenCustom={r=>setCustomGrowthRow(r)} onAddRow={()=>setAddRowFor('balance')} scenarioKey={activeScenario}/>}
{buildTab==='cashFlow'&&enabledStatements.cashFlow&&<StatementTable statementId="cashFlow" rows={rows.cashFlow} rowData={rowData[activeScenario]} computedValues={computed.values} periods={periods} expandedIds={expandedFor.cashFlow} onToggleExpand={id=>toggleExpand('cashFlow',id)} onExpandAll={()=>expandAll('cashFlow')} onCollapseAll={()=>collapseAll('cashFlow')} onUpdateRowData={updateRowData} onDeleteRow={deleteRow} onOpenCustom={r=>setCustomGrowthRow(r)} onAddRow={()=>setAddRowFor('cashFlow')} scenarioKey={activeScenario}/>}
</div>
</div></div>

<footer className="px-6 md:px-10 pb-10 pt-12 mt-6"><div className="max-w-[1400px] mx-auto"><Ornament style={{marginBottom:24}}/><div className="flex items-center justify-between flex-wrap gap-3 ff-body text-[11px]" style={{color:C.muted}}><div>Projection tool — not for accounting compliance. Cross-statement linkages (NI → RE → CF) in this build.</div><div className="flex items-center gap-3 flex-wrap"><span>{inMillions?'Figures in $M':'Whole numbers'}</span><span style={{width:1,height:10,background:C.border}}/><span>3 scenarios</span><span style={{width:1,height:10,background:C.border}}/><span>Hierarchical rows · v0.4</span></div></div></div></footer>

{customGrowthRow&&<CustomGrowthModal row={customGrowthRow} entry={rowData[activeScenario][customGrowthRow.id]} periods={periods} onClose={()=>setCustomGrowthRow(null)} onChange={p=>updateRowData(customGrowthRow.id,p)}/>}
{addRowFor&&<AddRowMenu statement={addRowFor} rows={rows[addRowFor]} existingLabels={rows[addRowFor].map(r=>r.label.toLowerCase())} onAdd={({label,parentId,defaultMode})=>{addRow(addRowFor,{label,parentId,defaultMode});}} onClose={()=>setAddRowFor(null)}/>}
{showSaveLoad&&<SaveLoadModal state={fullState} onLoad={(s)=>{loadState(s);if(s.enabledStatements)setEnabledStatements(s.enabledStatements);setBuildTab('income');setShowWizard(false);}} onClose={()=>setShowSaveLoad(false)}/>}
{showWizard&&<WizardModal initialAnswers={wizardAnswers} onComplete={handleWizardComplete} onStartManual={handleStartManual} onClose={()=>{if(hasModel)setShowWizard(false);else handleStartManual();}} allowSkip={true}/>}
{showAIGen&&<AIGenerateModal open={showAIGen} onClose={()=>setShowAIGen(false)} onApplyDraft={handleAIGenComplete}/>}
<AIAdvisorPanel open={showAI} onClose={()=>setShowAI(false)} modelContext={{projectName,sectorKey:wizardAnswers?.sectorKey||'other',sector:BB[wizardAnswers?.sectorKey||'other'],computed,periods,granularity}} rowLabels={rowLabels} currentRowData={rowData[activeScenario]} onApplyPatch={handleApplyAIPatch}/>
<AnalysisDrawer open={showAnalysisDrawer} onClose={()=>setShowAnalysisDrawer(false)} computed={computed} computedAll={computedAll} periods={periods} granularity={granularity} scenarioKey={activeScenario} sectorKey={wizardAnswers?.sectorKey||'other'} projectName={projectName} enabledStatements={enabledStatements} rows={rows} rowData={rowData} numPeriods={numPeriods} onOpenCritique={()=>setShowCritique(true)}/>
<PlanCritiqueModal open={showCritique} onClose={()=>setShowCritique(false)} projectName={projectName} sectorKey={wizardAnswers?.sectorKey||'other'} computed={computed} computedAll={computedAll} periods={periods} granularity={granularity} enabledStatements={enabledStatements} rows={rows} rowData={rowData} feasibility={computeFeasibilityScore(computedAll,periods,wizardAnswers?.sectorKey||'other',granularity,enabledStatements)}/>
</div></MillionsCtx.Provider>);
}

export default function FinancialModelBuilder(props){
  return React.createElement(AppErrorBoundary,null,React.createElement(FinancialModelBuilderInner,props));
}

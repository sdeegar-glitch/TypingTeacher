import{n as e,s as t,t as n}from"./jsx-runtime-CnSBKPes.js";import{t as r}from"./chevron-left-rTHFiEkQ.js";import{t as i}from"./code-BTDW0R3h.js";import{t as a}from"./rotate-ccw-CDcXiqnt.js";import{t as o}from"./zap-DqxKmXzj.js";import{r as s}from"./index-CI8N0iMj.js";import{t as c}from"./proxy-DcuLEP4l.js";import{t as l}from"./AnimatePresence-B2bq29ku.js";var u=t(e(),1),d=n(),f=[{language:`JavaScript`,title:`Async Fetch Function`,icon:`JS`,code:`async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network error");
  }
  const data = await response.json();
  return data;
}`},{language:`Python`,title:`List Comprehension`,icon:`PY`,code:`def get_even_squares(n):
    return [x ** 2 for x in range(n) if x % 2 == 0]

numbers = get_even_squares(10)
print(numbers)`},{language:`TypeScript`,title:`Interface & Generic`,icon:`TS`,code:`interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}`},{language:`SQL`,title:`JOIN Query`,icon:`SQL`,code:`SELECT u.name, COUNT(o.id) AS total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2025-01-01'
GROUP BY u.name
ORDER BY total_orders DESC
LIMIT 10;`},{language:`React JSX`,title:`Custom Hook`,icon:`JSX`,code:`function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}`},{language:`CSS`,title:`Glassmorphism Card`,icon:`CSS`,code:`.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}`}],p={JavaScript:`text-yellow-500 bg-yellow-500/10 border-yellow-500/20`,Python:`text-blue-500 bg-blue-500/10 border-blue-500/20`,TypeScript:`text-sky-500 bg-sky-500/10 border-sky-500/20`,SQL:`text-orange-500 bg-orange-500/10 border-orange-500/20`,"React JSX":`text-cyan-500 bg-cyan-500/10 border-cyan-500/20`,CSS:`text-pink-500 bg-pink-500/10 border-pink-500/20`};function m(){let[e,t]=(0,u.useState)(0),[n,m]=(0,u.useState)(``),[h,g]=(0,u.useState)(!1),[_,v]=(0,u.useState)(!1),[y,b]=(0,u.useState)(0),[x,S]=(0,u.useState)(0),[C,w]=(0,u.useState)(100),T=(0,u.useRef)(null);(0,u.useEffect)(()=>{document.title=`Coding Typing Test | FastTypingLab`},[]);let E=f[e],D=E.code,O=n.split(``).filter((e,t)=>e!==D[t]).length,k=D.length>0?Math.round(n.length/D.length*100):0;(0,u.useEffect)(()=>{if(_||!h||!y)return;let e=(Date.now()-y)/6e4,t=n.length/5;S(e>0?Math.round(t/e):0),w(n.length>0?Math.round((n.length-O)/n.length*100):100),n===D&&v(!0)},[n,_,h,y,O,D]);let A=(0,u.useCallback)(e=>{if(!_){if(h||(g(!0),b(Date.now())),e.key===`Backspace`)m(e=>e.slice(0,-1));else if(e.key.length===1||e.key===`Enter`||e.key===`Tab`){e.preventDefault();let t=e.key===`Enter`?`
`:e.key===`Tab`?`  `:e.key;m(e=>e.length<D.length?e+t:e)}}},[_,h,D]),j=()=>{m(``),g(!1),v(!1),S(0),w(100),b(0),T.current?.focus()},M=e=>{t(e),j()};return(0,d.jsx)(`div`,{className:`min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6`,children:(0,d.jsxs)(`div`,{className:`max-w-4xl mx-auto`,children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-3 mb-8`,children:[(0,d.jsxs)(s,{to:`/tools`,className:`flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group`,children:[(0,d.jsx)(r,{className:`w-4 h-4 group-hover:-translate-x-0.5 transition-transform`}),`Tools`]}),(0,d.jsx)(`div`,{className:`h-4 w-px bg-brand-border`}),(0,d.jsx)(`h1`,{className:`text-xl font-bold`,children:`Coding Typing Test`})]}),(0,d.jsxs)(`div`,{className:`mb-6`,children:[(0,d.jsxs)(`h2`,{className:`text-3xl font-black text-brand-text mb-2 flex items-center gap-2`,children:[(0,d.jsx)(i,{className:`w-8 h-8 text-brand-primary`}),` Coding Typing Test`]}),(0,d.jsx)(`p`,{className:`text-brand-text-muted`,children:`Type real code snippets in JavaScript, Python, TypeScript, SQL, and more.`})]}),(0,d.jsx)(`div`,{className:`flex flex-wrap gap-2 mb-6`,children:f.map((t,n)=>(0,d.jsxs)(`button`,{onClick:()=>M(n),className:`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${e===n?`${p[t.language]} border-current`:`bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text`}`,children:[(0,d.jsx)(`span`,{className:`font-mono font-black`,children:t.icon}),t.title]},n))}),(0,d.jsx)(`div`,{className:`grid grid-cols-3 gap-4 mb-5`,children:[{label:`WPM`,value:x,color:`text-brand-primary`},{label:`Accuracy`,value:`${C}%`,color:C>=95?`text-brand-accent`:`text-rose-500`},{label:`Progress`,value:`${k}%`,color:`text-brand-secondary`}].map(e=>(0,d.jsxs)(`div`,{className:`bg-brand-surface border border-brand-border rounded-xl p-3 text-center`,children:[(0,d.jsx)(`div`,{className:`text-2xl font-black font-mono ${e.color}`,children:e.value}),(0,d.jsx)(`div`,{className:`text-[10px] text-brand-muted mt-0.5 uppercase tracking-wider`,children:e.label})]},e.label))}),(0,d.jsx)(`div`,{className:`h-1.5 bg-brand-surface-2 rounded-full mb-4 overflow-hidden`,children:(0,d.jsx)(c.div,{className:`h-full bg-brand-primary rounded-full`,animate:{width:`${k}%`},transition:{duration:.1}})}),(0,d.jsxs)(`div`,{className:`relative bg-brand-surface border border-brand-border rounded-2xl overflow-hidden cursor-text`,onClick:()=>T.current?.focus(),children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-3 px-5 py-3 border-b border-brand-border bg-brand-surface-2`,children:[(0,d.jsx)(`div`,{className:`px-3 py-1 rounded-md text-xs font-bold border ${p[E.language]}`,children:E.icon}),(0,d.jsx)(`span`,{className:`text-sm font-semibold text-brand-text`,children:E.title}),(0,d.jsx)(`span`,{className:`ml-auto text-xs text-brand-muted`,children:E.language})]}),(0,d.jsx)(`pre`,{className:`px-6 py-5 font-mono text-sm leading-7 overflow-x-auto select-none whitespace-pre`,children:D.split(``).map((e,t)=>{let r=`text-brand-muted`;return t<n.length?r=n[t]===e?`text-brand-accent`:`text-rose-400 bg-rose-500/20 rounded-sm`:t===n.length&&(r=`text-brand-text border-b-2 border-brand-primary animate-pulse`),(0,d.jsx)(`span`,{className:r,children:e===`
`?t<n.length?`
`:(0,d.jsxs)(`span`,{className:`text-brand-border`,children:[`↵`,`
`]}):e},t)})}),(0,d.jsx)(`input`,{ref:T,onKeyDown:A,className:`opacity-0 absolute top-0 left-0 w-0 h-0`,autoFocus:!0,readOnly:!0}),!h&&(0,d.jsx)(`div`,{className:`absolute inset-0 flex items-center justify-center bg-brand-surface/80 backdrop-blur-sm rounded-2xl`,children:(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(o,{className:`w-8 h-8 text-brand-primary mx-auto mb-2`}),(0,d.jsx)(`p`,{className:`font-bold text-brand-text`,children:`Click here and start typing!`}),(0,d.jsx)(`p`,{className:`text-brand-muted text-sm mt-1`,children:`Tab = 2 spaces · Enter = new line`})]})})]}),(0,d.jsx)(l,{children:_&&(0,d.jsxs)(c.div,{initial:{opacity:0,y:16},animate:{opacity:1,y:0},exit:{opacity:0},className:`mt-5 bg-brand-accent/10 border border-brand-accent/30 rounded-2xl p-5 text-center`,children:[(0,d.jsx)(`div`,{className:`text-4xl mb-2`,children:`🎉`}),(0,d.jsx)(`h3`,{className:`text-xl font-black text-brand-text mb-1`,children:`Code Typed!`}),(0,d.jsxs)(`p`,{className:`text-brand-muted text-sm mb-4`,children:[(0,d.jsxs)(`span`,{className:`font-bold text-brand-primary`,children:[x,` WPM`]}),` · `,(0,d.jsxs)(`span`,{className:`font-bold text-brand-accent`,children:[C,`% accuracy`]})]}),(0,d.jsxs)(`div`,{className:`flex justify-center gap-3`,children:[(0,d.jsxs)(`button`,{onClick:j,className:`flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all`,children:[(0,d.jsx)(a,{className:`w-4 h-4`}),` Try Again`]}),(0,d.jsx)(`button`,{onClick:()=>{t((e+1)%f.length),j()},className:`flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-border transition-all`,children:`Next Snippet →`})]})]})}),!_&&h&&(0,d.jsx)(`div`,{className:`mt-4 flex justify-end`,children:(0,d.jsxs)(`button`,{onClick:j,className:`flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm transition-colors`,children:[(0,d.jsx)(a,{className:`w-4 h-4`}),` Reset`]})}),(0,d.jsxs)(`div`,{className:`mt-10 bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted space-y-2`,children:[(0,d.jsx)(`h2`,{className:`text-base font-bold text-brand-text`,children:`About Coding Typing Test`}),(0,d.jsx)(`p`,{children:`Practice typing real programming code in JavaScript, Python, TypeScript, SQL, React JSX, and CSS. Coding typing tests improve your programming speed, muscle memory for special characters, and reduce typos in real development work.`})]})]})})}export{m as default};
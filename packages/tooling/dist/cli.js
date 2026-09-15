#!/usr/bin/env bun
// @bun
var Xo=Object.create;var{getPrototypeOf:es,defineProperty:Ut,getOwnPropertyNames:ts}=Object;var Vt=Object.prototype.hasOwnProperty;function ns(e){return this[e]}var os,ss,yc=(e,t,n)=>{var o=e!=null&&typeof e==="object";if(o){var s=t?os??=new WeakMap:ss??=new WeakMap,i=s.get(e);if(i)return i}n=e!=null?Xo(es(e)):{};let r=t||!e||!e.__esModule||!Vt.call(e,"default")?Ut(n,"default",{value:e,enumerable:!0}):n;if(e&&typeof e==="object"||typeof e==="function"){for(let a of ts(e))if(!Vt.call(r,a))Ut(r,a,{get:ns.bind(e,a),enumerable:!0})}if(o)s.set(e,r);return r};var vc=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var f=(e,t,n)=>()=>{if(e)try{t=e(e=0)}catch(o){n=[o]}if(n)throw n[0];return t};function as(e=""){if(is.test(e))return;return e!==e.toLowerCase()}function Ht(e,t){let n=t??rs,o=[];if(!e||typeof e!=="string")return o;let s="",i,r;for(let a of e){let c=n.includes(a);if(c===!0){o.push(s),s="",i=void 0;continue}let u=as(a);if(r===!1){if(i===!1&&u===!0){o.push(s),s=a,i=u;continue}if(i===!0&&u===!1&&s.length>1){let p=s.at(-1);o.push(s.slice(0,Math.max(0,s.length-1))),s=p+a,i=u;continue}}s+=a,i=u,r=c}return o.push(s),o}function cs(e){return e?e[0].toUpperCase()+e.slice(1):""}function ls(e){return e?e[0].toLowerCase()+e.slice(1):""}function ps(e,t){return e?(Array.isArray(e)?e:Ht(e)).map((n)=>cs(t?.normalize?n.toLowerCase():n)).join(""):""}function ge(e,t){return ls(ps(e||"",t))}function _e(e,t){return e?(Array.isArray(e)?e:Ht(e)).map((n)=>n.toLowerCase()).join(t??"-"):""}function qt(e){return _e(e||"","_")}var is,rs;var Wt=f(()=>{is=/\d/,rs=["-","_","/","."]});import{parseArgs as us}from"util";function fe(e){if(Array.isArray(e))return e;return e===void 0?[]:[e]}function tt(e,t=""){let n=[];for(let o of e)for(let[s,i]of o.entries())n[s]=Math.max(n[s]||0,i.length);return e.map((o)=>o.map((s,i)=>t+s[i===0?"padStart":"padEnd"](n[i])).join("  ")).join(`
`)}function _(e){return typeof e==="function"?e():e}function ms(e=[],t={}){let n=new Set(t.boolean||[]),o=new Set(t.string||[]),s=t.alias||{},i=t.default||{},r=new Map,a=new Map;for(let[d,h]of Object.entries(s)){let A=h;for(let B of A){if(r.set(d,B),!a.has(B))a.set(B,[]);if(a.get(B).push(d),r.set(B,d),!a.has(d))a.set(d,[]);a.get(d).push(B)}}let c={};function u(d){if(n.has(d))return"boolean";let h=a.get(d)||[];for(let A of h)if(n.has(A))return"boolean";return"string"}function p(d){if(o.has(d))return!0;let h=a.get(d)||[];for(let A of h)if(o.has(A))return!0;return!1}let w=new Set([...n,...o,...Object.keys(s),...Object.values(s).flat(),...Object.keys(i)]);for(let d of w)if(!c[d])c[d]={type:u(d),default:i[d]};for(let[d,h]of r.entries())if(d.length===1&&c[h]&&!c[h].short)c[h].short=d;let b=[],m={};for(let d=0;d<e.length;d++){let h=e[d];if(h==="--"){b.push(...e.slice(d));break}if(h.startsWith("--no-")){let A=h.slice(5);m[A]=!0;continue}b.push(h)}let C;try{C=us({args:b,options:Object.keys(c).length>0?c:void 0,allowPositionals:!0,strict:!1})}catch{C={values:{},positionals:b}}let y={_:[]};y._=C.positionals;for(let[d,h]of Object.entries(C.values)){let A=h;if(u(d)==="boolean"&&typeof h==="string")A=h!=="false";else if(p(d)&&typeof h==="boolean")A="";y[d]=A}for(let[d]of Object.entries(m)){y[d]=!1;let h=r.get(d);if(h)y[h]=!1;let A=a.get(d);if(A)for(let B of A)y[B]=!1}for(let[d,h]of r.entries()){if(y[d]!==void 0&&y[h]===void 0)y[h]=y[d];if(y[h]!==void 0&&y[d]===void 0)y[d]=y[h];if(y[d]!==y[h]&&i[h]===y[h])y[h]=y[d]}return y}function gs(e,t){let n={boolean:[],string:[],alias:{},default:{}},o=zt(t);for(let a of o){if(a.type==="positional")continue;if(a.type==="string"||a.type==="enum")n.string.push(a.name);else if(a.type==="boolean")n.boolean.push(a.name);if(a.default!==void 0)n.default[a.name]=a.default;if(a.alias)n.alias[a.name]=a.alias;let c=ge(a.name),u=_e(a.name);if(c!==a.name||u!==a.name){let p=fe(n.alias[a.name]||[]);if(c!==a.name&&!p.includes(c))p.push(c);if(u!==a.name&&!p.includes(u))p.push(u);if(p.length>0)n.alias[a.name]=p}}let s=ms(e,n),[...i]=s._,r=new Proxy(s,{get(a,c){return a[c]??a[ge(c)]??a[_e(c)]}});for(let[,a]of o.entries())if(a.type==="positional"){let c=i.shift();if(c!==void 0)r[a.name]=c;else if(a.default===void 0&&a.required!==!1)throw new F(`Missing required positional argument: ${a.name.toUpperCase()}`,"EARG");else r[a.name]=a.default}else if(a.type==="enum"){let c=r[a.name],u=a.options||[];if(c!==void 0&&u.length>0&&!u.includes(c))throw new F(`Invalid value for argument: ${D(`--${a.name}`)} (${D(c)}). Expected one of: ${u.map((p)=>D(p)).join(", ")}.`,"EARG")}else if(a.required&&r[a.name]===void 0)throw new F(`Missing required argument: --${a.name}`,"EARG");return r}function zt(e){let t=[];for(let[n,o]of Object.entries(e||{}))t.push({...o,name:n,alias:fe(o.alias)});return t}async function fs(e){return Promise.all(e.map((t)=>_(t)))}function l(e){return e}async function H(e,t){let n=await _(e.args||{}),o=gs(t.rawArgs,n),s={rawArgs:t.rawArgs,args:o,data:t.data,cmd:e},i=await fs(e.plugins??[]),r,a;try{for(let p of i)await p.setup?.(s);if(typeof e.setup==="function")await e.setup(s);let u=await _(e.subCommands);if(u&&Object.keys(u).length>0){let p=Yt(t.rawArgs,n),w=t.rawArgs[p];if(w){let b=await st(u,w);if(!b)throw new F(`Unknown command ${D(w)}`,"E_UNKNOWN_COMMAND");await H(b,{rawArgs:t.rawArgs.slice(p+1)})}else{let b=await _(e.default);if(b){if(e.run)throw new F("Cannot specify both 'run' and 'default' on the same command.","E_DEFAULT_CONFLICT");let m=await st(u,b);if(!m)throw new F(`Default sub command ${D(b)} not found in subCommands.`,"E_UNKNOWN_COMMAND");await H(m,{rawArgs:t.rawArgs})}else if(!e.run)throw new F("No command specified.","E_NO_COMMAND")}}if(typeof e.run==="function")r=await e.run(s)}catch(u){a=u}let c=[];if(typeof e.cleanup==="function")try{await e.cleanup(s)}catch(u){c.push(u)}for(let u of[...i].reverse())try{await u.cleanup?.(s)}catch(p){c.push(p)}if(a)throw a;if(c.length===1)throw c[0];if(c.length>1)throw Error("Multiple cleanup errors",{cause:c});return{result:r}}async function ot(e,t,n){let o=await _(e.subCommands);if(o&&Object.keys(o).length>0){let s=Yt(t,await _(e.args||{})),i=t[s],r=await st(o,i);if(r)return ot(r,t.slice(s+1),e)}return[e,n]}async function st(e,t){if(t in e)return _(e[t]);for(let n of Object.values(e)){let o=await _(n),s=await _(o?.meta);if(s?.alias){if(fe(s.alias).includes(t))return o}}}function Yt(e,t){for(let n=0;n<e.length;n++){let o=e[n];if(o==="--")return-1;if(o.startsWith("-")){if(!o.includes("=")&&hs(o,t))n++;continue}return n}return-1}function hs(e,t){let n=e.replace(/^-{1,2}/,""),o=ge(n);for(let[s,i]of Object.entries(t)){if(i.type!=="string"&&i.type!=="enum")continue;if(o===ge(s))return!0;if((Array.isArray(i.alias)?i.alias:i.alias?[i.alias]:[]).includes(n))return!0}return!1}async function Qt(e,t){try{console.log(await Zt(e,t)+`
`)}catch(n){console.error(n)}}async function Zt(e,t){let n=await _(e.meta||{}),o=zt(await _(e.args||{})),s=await _(t?.meta||{}),i=`${s.name?`${s.name} `:""}`+(n.name||process.argv[1]),r=[],a=[],c=[],u=[];for(let m of o)if(m.type==="positional"){let C=m.name.toUpperCase(),y=m.required!==!1&&m.default===void 0;a.push([D(C+nt(m)),Jt(m,y)]),u.push(y?`<${C}>`:`[${C}]`)}else{let C=m.required===!0&&m.default===void 0,y=[...(m.alias||[]).map((d)=>`-${d}`),`--${m.name}`].join(", ")+nt(m);if(r.push([D(y),Jt(m,C)]),m.type==="boolean"&&(m.default===!0||m.negativeDescription)&&!bs.test(m.name)){let d=[...(m.alias||[]).map((h)=>`--no-${h}`),`--no-${m.name}`].join(", ");r.push([D(d),[m.negativeDescription,C?Pe("(Required)"):""].filter(Boolean).join(" ")])}if(C)u.push(`--${m.name}`+nt(m))}if(e.subCommands){let m=[],C=await _(e.subCommands);for(let[y,d]of Object.entries(C)){let h=await _((await _(d))?.meta);if(h?.hidden)continue;let A=fe(h?.alias),B=[y,...A].join(", ");c.push([D(B),h?.description||""]),m.push(y,...A)}u.push(m.join("|"))}let p=[],w=n.version||s.version;p.push(Pe(`${n.description} (${i+(w?` v${w}`:"")})`),"");let b=r.length>0||a.length>0;if(p.push(`${Ie(Oe("USAGE"))} ${D(`${i}${b?" [OPTIONS]":""} ${u.join(" ")}`)}`,""),a.length>0)p.push(Ie(Oe("ARGUMENTS")),""),p.push(tt(a,"  ")),p.push("");if(r.length>0)p.push(Ie(Oe("OPTIONS")),""),p.push(tt(r,"  ")),p.push("");if(c.length>0)p.push(Ie(Oe("COMMANDS")),""),p.push(tt(c,"  ")),p.push("",`Use ${D(`${i} <command> --help`)} for more information about a command.`);return p.filter((m)=>typeof m==="string").join(`
`)}function nt(e){let t=e.valueHint?`=<${e.valueHint}>`:"",n=t||`=<${qt(e.name)}>`;if(!e.type||e.type==="positional"||e.type==="boolean")return t;if(e.type==="enum"&&e.options?.length)return`=<${e.options.join("|")}>`;return n}function Jt(e,t){let n=t?Pe("(Required)"):"",o=e.default===void 0?"":Pe(`(Default: ${e.default})`);return[e.description,n,o].filter(Boolean).join(" ")}async function it(e,t={}){let n=t.rawArgs||process.argv.slice(2),o=t.showUsage||Qt;try{let s=await ys(e);if(s.help.length>0&&n.some((i)=>s.help.includes(i)))await o(...await ot(e,n)),process.exit(0);else if(n.length===1&&s.version.includes(n[0])){let i=typeof e.meta==="function"?await e.meta():await e.meta;if(!i?.version)throw new F("No version specified","E_NO_VERSION");console.log(i.version)}else await H(e,{rawArgs:n})}catch(s){if(s instanceof F)await o(...await ot(e,n)),console.error(s.message);else console.error(s,`
`);process.exit(1)}}async function ys(e){let t=await _(e.args||{}),n=new Set,o=new Set;for(let[s,i]of Object.entries(t)){n.add(s);for(let r of fe(i.alias))o.add(r)}return{help:Kt("help","h",n,o),version:Kt("version","v",n,o)}}function Kt(e,t,n,o){if(n.has(e)||o.has(e))return[];if(n.has(t)||o.has(t))return[`--${e}`];return[`--${e}`,`-${t}`]}var F,ds,Ne=(e,t=39)=>(n)=>ds?n:`\x1B[${e}m${n}\x1B[${t}m`,Oe,D,Pe,Ie,bs;var De=f(()=>{Wt();F=class extends Error{code;constructor(e,t){super(e);this.name="CLIError",this.code=t}};ds=(()=>{let e=globalThis.process?.env??{};return e.NO_COLOR==="1"||e.TERM==="dumb"||e.TEST||e.CI})(),Oe=Ne(1,22),D=Ne(36),Pe=Ne(90),Ie=Ne(4,24);bs=/^no[-A-Z]/});var{spawnSync:vs}=globalThis.Bun;function g(e,t={}){return vs({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}function je(e,t,n){if(!Bun.which(e)){for(let o of n)console.warn(o);return 0}return g(t)}function P(e){return l({meta:{name:e.name,version:e.version??"1.0.0",description:e.description},subCommands:e.subCommands,args:{[e.argsName??"args"]:{type:"positional",description:e.argsDescription??"Extra args passed to underlying tool",required:!1}},run(){let t=v(e.name),n=e.configArgs??[],o=e.passthrough?[e.binPath,...t]:e.configArgsPlacement==="append"?[e.binPath,...t,...n]:[e.binPath,...n,...t];process.exit(g(o))}})}function U(e){let t=e.argsDescription?{args:{args:{type:"positional",description:e.argsDescription,required:!1}}}:{};return l({meta:{name:e.name,description:e.description},...t,run(){let n=v(e.name),o=n.length===0&&e.defaultArgs?e.defaultArgs:n;process.exit(e.spawn([...e.prefixArgs??[],...o]))}})}function v(e){let t=process.argv.slice(2),n=t.lastIndexOf(e);return n===-1?t:t.slice(n+1)}var k=f(()=>{De();De()});import{existsSync as Xt,readFileSync as en}from"fs";import{dirname as tn,join as ae}from"path";function Q(e=import.meta.dir){let t=e;while(!0){let n=ae(t,"package.json");if(Xt(n))try{if(JSON.parse(en(n,"utf8")).name===ws)return t}catch{}let o=tn(t);if(o===t)break;t=o}return e}function Le(e=process.cwd()){let t=e;while(!0){let n=ae(t,"package.json");if(Xt(n))try{if(JSON.parse(en(n,"utf8")).workspaces)return t}catch{}let o=tn(t);if(o===t)return e;t=o}}function Z(){return ae(Q(),"src","configs")}function N(e){return ae(Z(),e)}function Me(...e){return ae(Q(),"src",...e)}function nn(){return ae(Q(),"skills")}var ws="@myorg/tooling",ks="packages/tooling",Ic;var I=f(()=>{Ic=`${ks}/src/configs`});var xs,Cs;var on=f(()=>{I();k();xs=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Cs=P({name:"lint",version:"1.0.0",description:"Lint and format check (Biome, shared config)",binPath:xs,configArgs:["check",`--config-path=${Z()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to check (default: whole repo)"})});var Ss,$s;var sn=f(()=>{I();k();Ss=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),$s=P({name:"lint:fix",version:"1.0.0",description:"Lint and format, applying safe fixes (Biome, shared config)",binPath:Ss,configArgs:["check","--write",`--config-path=${Z()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to fix (default: whole repo)"})});var Rs,As;var rn=f(()=>{I();k();Rs=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),As=P({name:"biome",version:"1.0.0",description:"Biome with baked config path \u2014 lint and format, no root biome.json needed",binPath:Rs,configArgs:[`--config-path=${Z()}`],configArgsPlacement:"append",argsName:"command",argsDescription:"Biome command (check, lint, format, etc.)"})});var Es,Ts;var an=f(()=>{k();Es=Bun.fileURLToPath(import.meta.resolve("typescript/package.json").replace("package.json","bin/tsc")),Ts=P({name:"typecheck",version:"1.0.0",description:"TypeScript wrapper \u2014 tsc owned by @myorg/tooling, use m typecheck not tsc",binPath:"bun",configArgs:[Es],argsName:"args",argsDescription:"tsc args"})});var _s,Os;var cn=f(()=>{I();k();_s=Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));process.env.TURBO_GLOBAL_WARNING_DISABLED="1";Os=P({name:"turbo",version:"1.0.0",description:"Turbo with baked root config \u2014 no root turbo.json needed, uses turbo.base.json",binPath:"bun",configArgs:[_s,`--root-turbo-json=${N("turbo.base.json")}`],argsName:"task",argsDescription:"Turbo task (build, dev, test, typecheck, etc.)"})});import{existsSync as Is,readFileSync as ln}from"fs";var{Glob:Ps}=globalThis.Bun;function Ns(){try{let e=JSON.parse(ln("package.json","utf8")),t=Array.isArray(e.workspaces)?e.workspaces.filter((n)=>typeof n==="string"):[];if(t.length>0)return t}catch{}return["packages/*","apps/*"]}function Ds(){let e=[];for(let t of Ns())for(let n of new Ps(`${t}/package.json`).scanSync("."))try{if(JSON.parse(ln(n,"utf8")).private===!0)continue;let s=n.replace("/package.json","");if(Is(`${s}/package.json`))e.push(s)}catch{}return e.sort()}var rt,js,Ls,Ms;var at=f(()=>{k();rt=l({meta:{name:"health",description:"publint + arethetypeswrong over every publishable package"},run(){let e=Ds();if(e.length===0)console.log("\u2139\uFE0F No publishable packages \u2014 skipping package health checks"),process.exit(0);console.log(`\uD83D\uDD28 Building before health checks (${e.length} package(s))`);let t=g(["bun","run","build"]);if(t!==0)console.error("::error::build failed, cannot run package health checks"),process.exit(t);let n=0;for(let o of e){if(console.log(`
\uD83D\uDCE6 ${o}`),g(["bunx","--yes","publint",o])!==0)console.error(`::error::publint failed for ${o}`),n++;if(g(["bunx","--yes","@arethetypeswrong/cli","--pack",".","--profile","esm-only"],{cwd:o})!==0)console.error(`::error::arethetypeswrong failed for ${o}`),n++}if(n>0)console.error(`
::error::${n} package health check(s) failed`),process.exit(1);console.log(`
\u2705 Package health OK (${e.length} package(s))`),process.exit(0)}}),js=Bun.fileURLToPath(import.meta.resolve("bunup/package.json").replace("package.json","dist/cli/index.js")),Ls=P({name:"build",version:"1.0.0",description:"Bunup wrapper \u2014 bundler owned by @myorg/tooling, use m build not bunup",binPath:"bun",configArgs:[js],argsName:"entry",argsDescription:"Entry files or bunup args",subCommands:{health:rt}}),Ms=Ls});var Bs;var pn=f(()=>{at();Bs=rt});import{existsSync as un,readdirSync as Gs,rmSync as Fs}from"fs";var{which:Us}=globalThis.Bun;async function mn(){if(!Us("bun"))console.error("m bun coverage needs `bun` on PATH."),process.exit(1);console.log(`Running per-package coverage via turbo...
`),process.exit(g([...Vs,"coverage"]))}function dn(){let e=["apps","packages","configs"],t=0;for(let n of e){if(!un(n))continue;for(let o of Gs(n,{withFileTypes:!0})){if(!o.isDirectory())continue;let s=`${n}/${o.name}/node_modules`;if(!un(s))continue;Fs(s,{recursive:!0,force:!0}),t++}}console.log(`\uD83E\uDDF9 Removed ${t} workspace node_modules dir(s) (root node_modules kept)`)}var ct,Vs,X,Hs,qs,Ws,he,Js,Ks,zs,Ys,Qs,Zs;var gn=f(()=>{I();k();ct=N("bunfig.toml"),Vs=["bun",`${Q()}/src/cli.ts`,"turbo"];X=v("bun"),Hs=["coverage","test","clean:modules"],qs=X.includes("--help")||X.includes("-h"),Ws=X.includes("--version")||X.includes("-v"),he=X[0],Js=process.argv.slice(2).includes("bun");if(Js&&he&&!Hs.includes(he)&&!he.startsWith("-")&&!qs&&!Ws){let e=he==="test"?["bun",he,`--config=${ct}`,...X.slice(1)]:["bun",...X];process.exit(g(e))}Ks=l({meta:{name:"coverage",description:"Run per-package coverage via turbo then merge LCOV"},run:async()=>{await mn()}}),zs=l({meta:{name:"clean:modules",description:"Remove workspace node_modules dirs (keeps the root one)"},run(){dn(),process.exit(0)}}),Ys=l({meta:{name:"test",description:"Run bun test with shared bunfig.toml config"},run(){let e=v("test");process.exit(g(["bun","test",`--config=${ct}`,...e]))}}),Qs=l({meta:{name:"bun",version:"1.0.0",description:"Bun wrapper \u2014 injects shared bunfig.toml for test, provides coverage merging"},subCommands:{coverage:Ks,test:Ys,"clean:modules":zs},async run(){let e=v("bun"),t=e[0];if(t==="coverage"){await mn();return}if(t==="clean:modules")dn(),process.exit(0);let n=t==="test"?["bun",t,`--config=${ct}`,...e.slice(1)]:["bun",...e];process.exit(g(n))}}),Zs=Qs});var Xs;var fn=f(()=>{I();k();Xs=l({meta:{name:"test",description:"Run bun test with the shared bunfig.toml config"},args:{args:{type:"positional",description:"Extra args for bun test",required:!1}},run(){let e=process.argv.slice(2),t=e.lastIndexOf("test"),n=t===-1?[]:e.slice(t+1);process.exit(g(["bun","test",`--config=${N("bunfig.toml")}`,...n]))}})});var S="coverage/lcov.info",ce="coverage/rust-lcov.info",q="coverage/html",be=80;var hn=()=>{};import{existsSync as j,mkdirSync as yn,readdirSync as ei,readFileSync as vn,renameSync as lt,writeFileSync as ti}from"fs";import{dirname as ni,join as bn}from"path";var{which:oi}=globalThis.Bun;function W(e){return Boolean(oi(e))}function Be(e=S){if(!j(e))return null;let t=0,n=0;for(let o of vn(e,"utf8").split(`
`))if(o.startsWith("LF:"))n+=Number(o.slice(3));else if(o.startsWith("LH:"))t+=Number(o.slice(3));if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function ii(e){let t=0,n=0;for(let o of e){let s=Be(o);if(!s)continue;t+=s.hit,n+=s.found}if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function kn(){return`{${[...wn].join(",")}}/*/coverage/lcov.info`}function xn(e="."){let t=new Bun.Glob(kn());return Array.from(t.scanSync({cwd:e})).filter(Boolean).map((n)=>e==="."?n:`${e}/${n}`).sort()}function ri(e,t){return e>=t}function ai(e="."){let t=[];for(let n of[...wn]){let o=bn(e,n);if(!j(o))continue;for(let s of ei(o,{withFileTypes:!0})){if(!s.isDirectory())continue;let i=bn(o,s.name,"package.json");if(!j(i))continue;let r;try{r=JSON.parse(vn(i,"utf8"))}catch{continue}if(!r.name||!(r.scripts?.test||r.scripts?.coverage))continue;t.push({name:r.name.replace(/^@[^/]+\//,""),dir:`${n}/${s.name}`})}}return t.sort((n,o)=>n.dir.localeCompare(o.dir))}function ci(e,t){let n=["# Generated by `m coverage sync` (packages/tooling) \u2014 do not edit.","# Refreshed on every `bun install` (prepare) and by `bun run docs:sync`.","codecov:","  require_ci_to_pass: true","  notify:","    wait_for_ci: true","","coverage:","  precision: 2","  round: down",'  range: "70...100"',"  status:","    # Overall monorepo gate \u2014 mirrors COVERAGE_THRESHOLD.","    project:","      default:",`        target: ${t}%`,"        threshold: 1%","    # Patch coverage on PRs.","    patch:","      default:",`        target: ${t}%`,"        threshold: 5%","","flag_management:","  default_rules:","    carryforward: true","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 1%","","component_management:","  default_rules:","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 2%","  individual_components:"];for(let o of e)n.push(`    - component_id: ${o.name}`,`      name: ${o.dir}`,"      paths:",`        - "${o.dir}/**"`);return n.push("","comment:",'  layout: "reach,diff,flags,components,tree"',"  behavior: default","  require_changes: true","  show_carryforward_flags: true",""),n.join(`
`)}function li(e,t){let n=(o)=>o?`${o.percent.toFixed(2)}% (${o.hit}/${o.found})`:"\u2014";return["## \uD83D\uDCCA Coverage Summary","","| Package | Lines |","|---------|-------|",...e.map((o)=>`| \`${o.dir}\` | ${n(o.totals)} |`),...t?[`| **merged** | **${n(t)}** |`]:[],""].join(`
`)}function Cn(){if(W("lcov")&&W("genhtml")){console.log("\u2705 lcov already installed");return}let e=1;if(process.platform==="darwin")e=g(["brew","install","lcov"]);else{let t=W("sudo")?["sudo","apt-get"]:["apt-get"];e=g([...t,"update"])===0?g([...t,"install","-y","lcov"]):1}if(e===0)console.log("\u2705 lcov installed");else console.warn("\u26A0\uFE0F lcov install failed \u2014 HTML reports will be skipped (threshold check still runs)")}function Sn(e=q){if(!j(S)){console.warn(`\u26A0\uFE0F ${S} not found \u2014 skipping HTML report`);return}if(!W("genhtml")){console.warn("\u26A0\uFE0F genhtml not found \u2014 run `m coverage setup` first (HTML report skipped)");return}yn(e,{recursive:!0});let t=g(["genhtml",S,"--output-directory",e,"--title","Coverage Report","--show-details","--highlight","--legend"]);if(t===0)console.log(`
\u2705 HTML report: ${e}/index.html`);process.exit(t)}var si,wn,pi,ui,mi,di,gi,fi,hi,bi,yi,vi;var $n=f(()=>{k();hn();si=`${q}/index.html`;wn=["packages","apps"];pi=l({meta:{name:"setup",description:"Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)"},run(){Cn(),process.exit(0)}}),ui=l({meta:{name:"html",description:"Generate HTML report via genhtml from coverage/lcov.info"},args:{out:{type:"string",description:`Output directory (default: ${q})`,default:q}},run({args:e}){Sn(e.out||q),process.exit(0)}}),mi=l({meta:{name:"check",description:`Check coverage threshold (default ${be}%) against coverage/lcov.info`},args:{threshold:{type:"string",description:"Threshold percent",default:String(be)}},run({args:e}){let t=Be();if(!t){console.warn(`\u26A0\uFE0F ${S} not found or has no line data \u2014 skipping threshold check`);return}let n=Number(e.threshold??be),o=t.percent;if(console.log(`Line coverage: ${o.toFixed(2)}% (${t.hit}/${t.found} lines) \u2014 threshold ${n}%`),!ri(o,n))console.error(`::error::Coverage ${o.toFixed(2)}% is below ${n}% threshold`),process.exit(1);console.log(`\u2705 Coverage ${o.toFixed(2)}% meets threshold`),process.exit(0)}}),di=l({meta:{name:"collect",description:"Collect JS coverage (bun run coverage) + Rust coverage (m native llvm-cov), then merge"},run(){if(g(["bun","run","coverage"]),!j("packages/native/Cargo.toml")||!W("cargo-llvm-cov"))console.warn("\u26A0\uFE0F cargo-llvm-cov not installed \u2014 skipping Rust coverage"),process.exit(0);if(console.log("\uD83E\uDD80 Collecting Rust coverage via m native llvm-cov"),g(["m native","llvm-cov","--lcov","--output-path",`../../${ce}`]),!j(ce))process.exit(0);if(!j(S))lt(ce,S),process.exit(0);if(W("lcov")){if(g(["lcov","--add-tracefile",S,"--add-tracefile",ce,"--output-file","coverage/merged.lcov"])===0)lt("coverage/merged.lcov",S),console.log("\u2705 Merged Rust + JS coverage"),process.exit(0)}console.warn(`\u26A0\uFE0F lcov not available \u2014 Rust coverage kept at ${ce}`)}}),gi=l({meta:{name:"pages",description:"Publish the HTML report into the Pages artifact dir (served at /coverage/)"},async run(){if(!j(S))console.log("\u2139\uFE0F No coverage data \u2014 collecting first"),g(["bun","run","coverage"]);if(!j(S))console.warn("\u26A0\uFE0F Still no coverage/lcov.info \u2014 skipping Pages coverage"),process.exit(0);if(Cn(),Sn(),!j(si))console.warn(`\u26A0\uFE0F No HTML report at ${q} \u2014 skipping Pages coverage`),process.exit(0);console.log(`\u2705 Coverage HTML ready at ${q}/ \u2014 \`m pages build\` folds it into the Pages artifact (served at /coverage/)`),process.exit(0)}}),fi=l({meta:{name:"merge",description:"Merge per-package lcov.info reports into coverage/lcov.info"},args:{output:{type:"string",description:"Merged output file (default: coverage/lcov.info)",default:S},reportOnly:{type:"boolean",description:"Print the merged totals and the delta, write nothing",default:!1}},run({args:e}){let t=xn(".");if(t.length===0)console.warn("No per-package lcov.info found \u2014 nothing to merge"),process.exit(0);let n=e.output||S;if(e.reportOnly){let r=ii(t),a=r?`${r.percent.toFixed(2)}% (${r.hit}/${r.found} lines)`:"no data";console.log("Report-only: the merge would measure"),console.log(`  ${t.length} report(s) \u2192 ${a}`),process.exit(0)}yn(ni(n),{recursive:!0}),console.log(`Merging ${t.length} report(s) \u2192 ${n}`);let o=null;try{o=Bun.fileURLToPath(import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"))}catch{o=null}if(o){if(g(["bun",o,kn(),n,"--prepend-source-files"])===0)console.log(`\u2705 Merged: ${n}`),process.exit(0);console.warn("\u26A0\uFE0F lcov-result-merger failed \u2014 falling back to lcov --add-tracefile")}if(!W("lcov"))console.error("\u274C lcov not found \u2014 run `m coverage setup` first"),process.exit(1);let s="coverage/merged.lcov",i=t.flatMap((r)=>["--add-tracefile",r]).concat(["--output-file",s]);if(g(["lcov",...i])!==0)console.error("\u274C Coverage merge failed"),process.exit(1);lt(s,n),console.log(`\u2705 Merged: ${n}`),process.exit(0)}}),hi=l({meta:{name:"summary",description:"Show coverage summary (--json for scripts, --markdown for step summaries)"},args:{json:{type:"boolean",description:"Print JSON instead of a human-readable line"},markdown:{type:"boolean",description:"Print a per-package markdown table (for $GITHUB_STEP_SUMMARY)"}},run({args:e}){let t=Be();if(e.markdown){let n=xn(".").map((o)=>({dir:o.replace(/\/coverage\/lcov\.info$/,""),totals:Be(o)}));console.log(li(n,t)),process.exit(0)}if(e.json)console.log(JSON.stringify({source:S,available:Boolean(t),lines:{hit:t?.hit??0,found:t?.found??0,percent:t?Number(t.percent.toFixed(2)):0}})),process.exit(0);if(W("lcov")&&j(S))process.exit(g(["lcov","--summary",S]));if(!t)console.warn(`\u26A0\uFE0F ${S} not found`),process.exit(0);console.log(`lines: ${t.percent.toFixed(1)}% (${t.hit}/${t.found})`),process.exit(0)}}),bi=l({meta:{name:"sync",description:"Regenerate the root codecov.yml from the workspace package list"},args:{output:{type:"string",description:"Output file (default: codecov.yml)",default:"codecov.yml"}},run({args:e}){let t=e.output||"codecov.yml",n=ai(".");ti(t,ci(n,be)),console.log(`\u2705 ${t} \u2014 ${n.length} component(s): ${n.map((o)=>o.dir).join(", ")}`),process.exit(0)}}),yi=l({meta:{name:"m coverage",version:"1.0.0",description:"Coverage reporting \u2014 collect, merge, HTML, threshold check, Codecov, Pages publishing"},subCommands:{setup:pi,collect:di,html:ui,check:mi,pages:gi,merge:fi,summary:hi,sync:bi},run(){console.log(`
m coverage \u2014 COVERAGE_LCOV coverage reporting

Usage:
  m coverage <command>

Commands:
  setup              Install lcov/genhtml if missing
  collect            Collect JS + Rust coverage and merge them
  html [--out DIR]   genhtml coverage/lcov.info \u2192 DIR (default coverage/html/)
  check [--threshold 80]  Fail if line coverage is below the threshold
  pages              Publish coverage/html into the Pages artifact dir
  merge              Merge {packages,apps}/*/coverage/lcov.info via lcov
  summary [--json|--markdown]   Print a coverage summary (--json for scripts/docs, --markdown for step summaries)
  sync [--output FILE]   Regenerate the root codecov.yml from the package list

Examples:
  m coverage setup && m coverage check --threshold 90
  m coverage collect && m coverage html
`)}}),vi=yi});import{mkdir as wi}from"fs/promises";var{file:pt,write:ki}=globalThis.Bun;async function mt(e="changeset"){if(e!=="changeset")throw Error(`Unknown init target '${e}' (expected "changeset")`);let t=".changeset/config.json",n=N("changeset.config.json");if(await pt(t).exists()){console.log("Changeset config already exists; skipping.");return}if(!await pt(n).exists())return;await wi(".changeset",{recursive:!0}),await ki(t,await pt(n).text())}var Rn,le,xi,ut,Ci,Si,$i,Ri,Ai,Ei;var dt=f(()=>{I();k();Rn=Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js")),le=v("changeset"),xi=["init"],ut=le[0],Ci=le.includes("--help")||le.includes("-h"),Si=le.includes("--version")||le.includes("-v"),$i=process.argv.slice(2).includes("changeset");if($i&&ut&&!xi.includes(ut)&&!ut.startsWith("-")&&!Ci&&!Si)process.exit(g(["bun",Rn,...le]));Ri=l({meta:{name:"init",description:"Ensure .changeset/config.json exists from shared template"},args:{target:{type:"positional",description:"Init target (default: changeset)",required:!1,default:"changeset"}},async run({args:e}){await mt(e.target??"changeset"),process.exit(0)}}),Ai=l({meta:{name:"changeset",version:"1.0.0",description:"Changesets wrapper \u2014 init config and delegate to @changesets/cli"},subCommands:{init:Ri},run(){process.exit(g(["bun",Rn,...v("changeset")]))}}),Ei=Ai});import{readdir as Ti}from"fs/promises";import{join as _i}from"path";var{$:An,write:Oi}=globalThis.Bun;async function gt(e="lefthook"){if(e!=="lefthook")throw Error(`Unknown setup target '${e}' (expected "lefthook")`);await Oi("lefthook.yml",`extends:
  - ${"node_modules/@myorg/tooling/src/configs/lefthook.base.yml"}
`);let n=await An`bunx lefthook install`.quiet().nothrow();if(n.exitCode!==0){let s=n.stderr.toString().trim();if(console.warn("\u26A0\uFE0F lefthook install failed \u2014 Git hooks are not active."),s)console.warn(`   ${s.split(`
`).join(`
   `)}`);console.warn("   Re-run manually with: m setup lefthook");return}let o=await Ii();if(o.length===0){console.warn("\u26A0\uFE0F lefthook installed no hooks \u2014 is this a Git repository?");return}console.log(`\u2705 lefthook hooks active: ${o.join(", ")}`)}async function Ii(){let e;try{e=await Ti(_i(await Pi(),"hooks"))}catch{return[]}return e.filter((t)=>!t.endsWith(".sample")&&!t.endsWith(".old")).sort()}async function Pi(){let e=await An`git rev-parse --git-dir`.quiet().nothrow();if(e.exitCode!==0)return".git";return e.stdout.toString().trim()||".git"}var Ni,Di,ji,Li;var En=f(()=>{k();Ni=l({meta:{name:"lefthook",description:"Regenerate lefthook.yml wrapper and install Git hooks"},args:{target:{type:"positional",description:"Setup target (default: lefthook)",required:!1,default:"lefthook"}},async run({args:e}){await gt(e.target??"lefthook")}}),Di=l({meta:{name:"bins",description:"Link m-bins into node_modules/.bin (handled by bun install)"},run(){console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.")}}),ji=l({meta:{name:"setup",version:"1.0.0",description:"Setup CLI \u2014 regenerates lefthook.yml, installs hooks, ensures changeset config"},subCommands:{lefthook:Ni,bins:Di},args:{target:{type:"positional",description:"Target (lefthook, bins, or empty for full setup)",required:!1}},async run({args:e}){let t=v("setup"),n=e.target??t[0]??"lefthook";if(n==="lefthook"){await gt("lefthook");return}if(n==="bins")return;await gt("lefthook");await Promise.resolve().then(() => dt());await mt("changeset").catch(()=>{})}}),Li=ji});import{existsSync as Tn}from"fs";import{homedir as Mi}from"os";import{join as _n}from"path";function Fi(){try{let e=Bun.fileURLToPath(import.meta.resolve("github-actionlint/package.json"));return Bun.file(e).json().version??null}catch{return null}}function Ui(){let e=process.env.ACTIONLINT_BIN;if(e&&Tn(e))return e;let t=Bun.which("actionlint");if(t)return t;let n=process.env.ACTIONLINT_CACHE_DIR??_n(Mi(),".github-actionlint","bin"),o=Fi();if(o){let s=_n(n,o,process.platform==="win32"?"actionlint.exe":"actionlint");if(Tn(s))return s}return null}function ft(e){let t=e.includes("--if-installed"),n=e.filter((s)=>s!=="--if-installed"),o=Ui();if(!o){if(t)return console.warn("\u26A0\uFE0F actionlint not available \u2014 skipping local workflow validation."),console.warn("   CI runs actionlint as the authoritative gate."),console.warn("   To lint locally: bun install --force, or brew install actionlint"),0;return console.error(Gi),1}return g([o,`-config-file=${N("actionlint.yaml")}`,...n])}function Ge(e){let t=Bun.which("act");if(!t)return console.error(`
'act' is not installed.

act runs GitHub Actions locally via Docker.

Install:
  brew install act                          # macOS
  sudo apt install act                      # Debian/Ubuntu
  go install github.com/nektos/act@latest   # Go
  scoop install act                         # Windows

Then ensure Docker is running and try again.
`),1;return g([t,...Bi,...e])}var Bi,Gi=`
'actionlint' is not available.

The 'github-actionlint' package does not bundle the binary \u2014 its entry point
downloads a release on first run and caches it under
~/.github-actionlint/bin/<version>/. When that download is blocked (offline,
sandbox, corporate cert interception) the tool is unusable and every run dies
with an opaque TLS error.

Fix one of these:
  bun install --force                                    # retry the download
  brew install actionlint                                # macOS system binary
  go install github.com/rhysd/actionlint/cmd/actionlint@latest
  ACTIONLINT_BIN=/path/to/actionlint m ci:lint           # point at an existing one

Then run: m ci:lint
`,Vi,Hi,qi,Wi;var Fe=f(()=>{I();k();Bi=["-P","ubuntu-latest=catthehacker/ubuntu:act-latest","--container-architecture","linux/amd64"];Vi=U({name:"lint",description:"Validate workflows via actionlint with shared config",argsDescription:"Extra args for actionlint",spawn:ft}),Hi=U({name:"act",description:"Run GitHub Actions locally via act with baked-in flags",argsDescription:"Extra args for act",spawn:Ge}),qi=l({meta:{name:"ci",version:"1.0.0",description:"CI tooling for GitHub Actions \u2014 lint workflows and run locally with act"},subCommands:{lint:Vi,act:Hi},run(){let e=v("ci");if(e.length>0&&e[0]?.startsWith("-"))Ge(e);else console.log(`
m ci \u2014 CI tooling for GitHub Actions

Usage:
  m ci lint [args]   Validate workflows (actionlint)
  m ci act [args]    Run workflows locally (act)
  m ci:lint          Shorthand for: m ci lint
  m ci:local         Shorthand for: m ci act push

Examples:
  m ci lint
  m ci act -l
  m ci act push -n
  m ci act push
`)}}),Wi=qi});var Ji;var On=f(()=>{k();Fe();Ji=l({meta:{name:"ci:lint",description:"Validate workflows via actionlint with shared config"},args:{args:{type:"positional",description:"Extra args for actionlint",required:!1}},run(){process.exit(ft(v("ci:lint")))}})});var Ki;var In=f(()=>{k();Fe();Ki=l({meta:{name:"ci:local",description:"Run the push workflow locally via act"},args:{args:{type:"positional",description:"Extra args for act",required:!1}},run(){process.exit(Ge(["push",...v("ci:local")]))}})});function ht(e){return je("gitleaks",["gitleaks",...e],zi)}var zi,Yi,Qi,Zi,Xi;var Pn=f(()=>{k();zi=["\u26A0\uFE0F gitleaks not found \u2014 skipping (install: brew install gitleaks or https://github.com/gitleaks/gitleaks)","   Docker fallback: docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source /path"];Yi=U({name:"detect",description:"gitleaks detect --source . --no-git (scan repo)",prefixArgs:["detect"],defaultArgs:["--source",".","--no-git","--verbose"],spawn:ht}),Qi=U({name:"protect",description:"gitleaks protect --staged (scan staged changes, pre-commit)",prefixArgs:["protect"],defaultArgs:["--staged","--verbose"],spawn:ht}),Zi=l({meta:{name:"gitleaks",version:"1.0.0",description:"Gitleaks wrapper \u2014 secret scanning, defensive (skips if binary missing)"},subCommands:{detect:Yi,protect:Qi},run(){let e=v("gitleaks");if(e.length===0)console.log(`
m gitleaks \u2014 secret scanning wrapper

Usage:
  m gitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  m gitleaks protect [args]  # scan staged (default: --staged --verbose)

Install:
  brew install gitleaks
  go install github.com/gitleaks/gitleaks/v8@latest
  docker pull zricethezav/gitleaks:latest

If gitleaks is not installed, this wrapper warns and exits 0 (does not block).
`),process.exit(0);process.exit(ht(e))}}),Xi=Zi});import{existsSync as er}from"fs";var{which:tr}=globalThis.Bun;function yt(e){return je("trivy",["trivy",...e],nr)}var bt="apps/example/Dockerfile",Nn="app:trivy-scan",nr,or,sr,ir,rr,ar;var Dn=f(()=>{k();nr=["\u26A0\uFE0F trivy not found \u2014 skipping (install: brew install trivy or https://aquasecurity.github.io/trivy/)"];or=l({meta:{name:"build",description:`docker build -t ${Nn} (image for the trivy image scan)`},run(){if(!er(bt))console.warn(`\u26A0\uFE0F ${bt} not found \u2014 skipping image build`),process.exit(0);if(!tr("docker"))console.warn("\u26A0\uFE0F docker not found \u2014 skipping image build"),process.exit(0);if(g(["docker","build","-t",Nn,"-f",bt,"."])!==0)console.warn("\u26A0\uFE0F image build failed \u2014 skipping the Trivy image scan");process.exit(0)}}),sr=U({name:"fs",description:"trivy fs . --severity HIGH,CRITICAL (filesystem scan)",prefixArgs:["fs"],defaultArgs:[".","--severity","HIGH,CRITICAL"],spawn:yt}),ir=U({name:"image",description:"trivy image <image> --severity HIGH,CRITICAL (container scan)",prefixArgs:["image"],spawn:yt}),rr=l({meta:{name:"trivy",version:"1.0.0",description:"Trivy wrapper \u2014 vuln scanning, defensive (skips if binary missing)"},subCommands:{fs:sr,image:ir,build:or},run(){let e=v("trivy");if(e.length===0)console.log(`
m trivy \u2014 Trivy vulnerability scanner wrapper

Usage:
  m trivy fs [args]       # trivy fs . --severity HIGH,CRITICAL
  m trivy image <image>   # trivy image <image> --severity HIGH,CRITICAL
  m trivy build           # docker build the image the image scan uses

Install:
  brew install trivy
  sudo apt-get install trivy
  https://aquasecurity.github.io/trivy/latest/getting-started/installation/

If trivy is not installed, this wrapper warns and exits 0 (does not block).
`),process.exit(0);process.exit(yt(e))}}),ar=rr});var cr;var jn=f(()=>{k();cr=l({meta:{name:"codeql",version:"1.0.0",description:"CodeQL wrapper \u2014 info and local guidance (CodeQL runs in GitHub Actions)"},run(){console.log(`
m codeql \u2014 CodeQL SAST wrapper

CodeQL runs in GitHub Actions, not locally. This wrapper provides guidance.

GitHub setup:
  1. Enable in Settings \u2192 Code security \u2192 Code scanning \u2192 CodeQL analysis
  2. Or use the generated 'security' job in .github/workflows/ci.yml
  3. Results appear in Security \u2192 Code scanning alerts

Local (optional, heavy):
  brew install codeql
  codeql database create --language=javascript-typescript /tmp/codeql-db --source-root=.
  codeql database analyze /tmp/codeql-db --format=sarif-latest --output=/tmp/results.sarif

Docs: https://codeql.github.com/docs/
`)}})});function E(e,t){let n=t;while(n<e.length&&/\s/.test(e[n]))n++;return n}function Mn(e,t){return e.lastIndexOf(`
`,t)+1}function ye(e,t){let n=/^[ \t]*/.exec(e.slice(Mn(e,t),t));return n?n[0]:""}function Ue(e,t){let n=t+1;while(n<e.length){if(e[n]==="\\"){n+=2;continue}if(e[n]==='"')return n+1;n++}return-1}function ee(e,t){let n=e[t];if(n==='"')return Ue(e,t);if(n==="{"||n==="["){let s=0,i=t;while(i<e.length){let r=e[i];if(r==='"'){i=Ue(e,i);continue}if(r==="{"||r==="[")s++;else if(r==="}"||r==="]"){if(s--,s===0)return i+1}i++}return-1}let o=t;while(o<e.length&&!/[\s,\]}]/.test(e[o]))o++;return o}function Bn(e){let t=E(e,0);return e[t]==="{"?t:-1}function ve(e,t,n){let o=E(e,t+1);while(o<e.length&&e[o]!=="}"){if(e[o]!=='"')return null;let s=Ue(e,o);if(s===-1)return null;let i=E(e,s);if(e[i]!==":")return null;let r=E(e,i+1),a=ee(e,r);if(a===-1)return null;if(e.slice(o,s)===JSON.stringify(n))return{keyStart:o,valueStart:r,valueEnd:a};if(o=E(e,a),e[o]===",")o=E(e,o+1);else return null}return null}function Gn(e,t,n){let o=Mn(e,t);if(e.slice(o,t).trim()!==""){let r=/^[ \t]*,[ \t]*/.exec(e.slice(n));if(r)return e.slice(0,t)+e.slice(n+r[0].length);let a=e.slice(0,t).replace(/[ \t]*,[ \t]*$/,"");return a===e.slice(0,t)?e.slice(0,t)+e.slice(n):`${a}${e.slice(n)}`}let s=/^[ \t]*,[ \t]*\r?\n?/.exec(e.slice(n));if(s)return e.slice(0,o)+e.slice(n+s[0].length);let i=e.slice(0,o).replace(/[ \t]*\n$/,"");if(i.endsWith(","))return`${i.slice(0,-1)}${e.slice(n)}`;return e.slice(0,o)+e.slice(n)}function kt(e){return/\n([ \t]+)\S/.exec(e)?.[1]??"  "}function vt(e,t,n){let o=e.split(`
`);if(o.length===1)return e;let i=o.slice(1,-1).filter((a)=>a.trim()!=="").reduce((a,c)=>Math.min(a,/^[ \t]*/.exec(c)[0].length),Number.POSITIVE_INFINITY),r=Number.isFinite(i)?i:0;return[o[0],...o.slice(1,-1).map((a)=>a.trim()===""?"":t+n+a.slice(r)),`${t}${o.at(-1).trim()}`].join(`
`)}function Ln(e,t,n,o){let s=kt(e),i=ee(e,t)-1,r=ye(e,i),a=E(e,t+1);if(a===i){let b=`${r}${s}`,m=vt(o,b,s);return`${e.slice(0,i)}
${b}${JSON.stringify(n)}: ${m}
${r}${e.slice(i)}`}let c=ye(e,a),u=a,p=a;while(p<i){let b=Ue(e,p),m=E(e,b);if(u=ee(e,E(e,m+1)),p=E(e,u),e[p]===",")p=E(e,p+1);else break}let w=vt(o,c,s);return`${e.slice(0,u)},
${c}${JSON.stringify(n)}: ${w}${e.slice(u)}`}function Fn(e,t){let[n,...o]=e,s=o.length===0?t:Fn(o,t);return`{
  ${JSON.stringify(n)}: ${s}
}`}function lr(e,t,n){let o=vt(n,ye(e,t.valueStart),kt(e));return e.slice(0,t.valueStart)+o+e.slice(t.valueEnd)}function xt(e,t,n){let o=t.at(-1);if(o===void 0)return e;let s=Ve(e,t.slice(0,-1));if(s===-1){let[r,...a]=t,c=Bn(e);if(r===void 0||c===-1)return e;return Ln(e,c,r,Fn(a,n))}let i=ve(e,s,o);return i?lr(e,i,n):Ln(e,s,o,n)}function Ve(e,t){let n=Bn(e);for(let o of t){if(n===-1)return-1;let s=ve(e,n,o);if(!s||e[s.valueStart]!=="{")return-1;n=s.valueStart}return n}function Un(e,t,n){return xt(e,t.split("."),JSON.stringify(n))}function Ql(e,t,n){return xt(e,t.split("."),n.trim())}function Vn(e,t){let n=t.split("."),o=Ve(e,n.slice(0,-1));if(o===-1)return e;let s=ve(e,o,n.at(-1));return s?Gn(e,s.keyStart,s.valueEnd):e}function Hn(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=Ve(e,s.slice(0,-1));if(i===-1)return e;let r=ve(e,i,s.at(-1));if(!r)return xt(e,s,`[${o}]`);if(e[r.valueStart]!=="[")return e;let a=ee(e,r.valueStart)-1,c=E(e,r.valueStart+1);if(c===a){if(!e.slice(r.valueStart,a).includes(`
`))return`${e.slice(0,a)}${o}${e.slice(a)}`;let m=ye(e,a);return`${e.slice(0,a)}${m}${kt(e)}${o}
${m}${e.slice(a)}`}let u=c,p=c;while(c<a)if(u=c,p=ee(e,c),c=E(e,p),e[c]===",")c=E(e,c+1);else break;let b=!e.slice(r.valueStart,a).includes(`
`)?", ":`,
${ye(e,u)}`;return`${e.slice(0,p)}${b}${o}${e.slice(p)}`}function Zl(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=Ve(e,s.slice(0,-1));if(i===-1)return e;let r=ve(e,i,s.at(-1));if(!r||e[r.valueStart]!=="[")return e;let a=ee(e,r.valueStart)-1,c=E(e,r.valueStart+1);while(c<a){let u=ee(e,c);if(e.slice(c,u)===o)return Gn(e,c,u);if(c=E(e,u),e[c]===",")c=E(e,c+1)}return e}function Ct(e){return JSON.parse(e)}async function St(e,t){let n=Bun.file(e);if(!await n.exists())return!1;let o=await n.text(),s=await t(o);if(s===o)return!1;return await Bun.write(e,s),!0}var He="@myorg",R="packages/native",qn="crates",J="npm",we=(e)=>`packages/native/crates/${e}`,V=(e)=>`packages/native/npm/${e}`,ke="wasm32-wasip1-threads",$t,qe;var We=f(()=>{$t=[{target:"aarch64-apple-darwin",runner:"macos-latest"},{target:"x86_64-apple-darwin",runner:"macos-13"},{target:"x86_64-pc-windows-msvc",runner:"windows-latest"},{target:"x86_64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"aarch64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64"},{target:"x86_64-unknown-linux-musl",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-alpine"},{target:"wasm32-wasip1-threads",runner:"ubuntu-latest",wasi:!0}],qe=$t.map((e)=>e.target)});import{existsSync as te,readdirSync as pr,readFileSync as Rt}from"fs";import{dirname as ur,join as K,resolve as Wn}from"path";function Jn(e=process.cwd()){let t=Wn(e);for(let n=0;n<32;n++){if(te(K(t,"packages","native","Cargo.toml")))return t;let o=ur(t);if(o===t)break;t=o}return Wn(e)}function Kn(e){if(!te(e))return[];return pr(e,{withFileTypes:!0}).filter((t)=>t.isDirectory()).map((t)=>t.name).sort()}function xe(e){let t=K(e,"packages","native",qn),n=K(e,"packages","native","Cargo.toml"),o=te(n)?Rt(n,"utf8"):"",s=new Set([...o.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm)].map((r)=>r[1]??"")),i=[];for(let r of Kn(t)){let a=K(t,r,"Cargo.toml");if(!te(a))continue;let c=Rt(a,"utf8"),u=[...c.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm),...c.matchAll(/^\s*([\w-]+)\.workspace\s*=\s*true/gm)].map((p)=>p[1]??"").filter((p)=>s.has(p)||te(K(t,p,"Cargo.toml")));i.push({name:r,dir:we(r),binding:/crate-type\s*=\s*\[[^\]]*cdylib/.test(c),uses:u})}return i}function Je(e){let t=K(e,"packages","native",J),n=[];for(let o of Kn(t)){let s=K(t,o,"package.json");if(!te(s))continue;let i;try{i=JSON.parse(Rt(s,"utf8"))}catch{continue}if(!i.napi)continue;let r=we(o);if(!te(K(e,r,"Cargo.toml")))continue;n.push({name:o,dir:V(o),crateDir:r,binaryName:i.napi.binaryName??o,targets:i.napi.targets?.length?i.napi.targets:[...qe]})}return n}function Ke(e){let t=new Set(xe(e).filter((n)=>n.binding).map((n)=>n.name));return Je(e).filter((n)=>t.has(n.name))}var zn=f(()=>{We()});import{existsSync as mr}from"fs";import{mkdir as ze,writeFile as G}from"fs/promises";import{join as O}from"path";function dr(e){let t=["[package]",`name    = "${e.name}"`,"version.workspace    = true","edition.workspace    = true","license.workspace    = true","repository.workspace = true",""];if(e.binding)t.push("[lib]","# required \u2014 produces the .node binary napi packages",'crate-type = ["cdylib"]',"","[dependencies]","napi.workspace        = true","napi-derive.workspace = true",...(e.uses??[]).map((n)=>`${`${n}.workspace`.padEnd(22)}= true`),"","[build-dependencies]","napi-build.workspace = true","");else t.push("# Pure Rust \u2014 no napi dependency, no cdylib: testable without a Node runtime.","[dependencies]",...(e.uses??[]).map((n)=>`${n}.workspace = true`),"");return t.push("[lints]","workspace = true",""),t.join(`
`)}function fr(e){if(!e.binding)return`//! Pure Rust helpers shared by the binding crates.
//!
//! Nothing here may depend on napi \u2014 that keeps it testable with plain
//! \`cargo test\` and reusable from a future WASM-only crate.

/// Add two numbers.
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Compute the nth Fibonacci number.
///
/// Fibonacci(40) here is ~100x faster than the JS fallback.
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0;
            let mut b = 1;
            for _ in 2..=n {
                let c = a + b;
                a = b;
                b = c;
            }
            b
        }
    }
}

/// Reverse a string by Unicode scalar.
pub fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}

/// All primes up to and including \`n\` \u2014 sieve of Eratosthenes.
pub fn primes_up_to(n: u32) -> Vec<u32> {
    if n < 2 {
        return vec![];
    }
    let mut sieve = vec![true; (n + 1) as usize];
    sieve[0] = false;
    sieve[1] = false;
    let mut i = 2;
    while i * i <= n {
        if sieve[i as usize] {
            let mut j = i * i;
            while j <= n {
                sieve[j as usize] = false;
                j += i;
            }
        }
        i += 1;
    }
    sieve
        .iter()
        .enumerate()
        .filter_map(|(idx, &is_prime)| if is_prime { Some(idx as u32) } else { None })
        .collect()
}

/// Counter \u2014 plain Rust state the napi binding wraps as a JS class.
pub struct Counter {
    count: i32,
}

impl Counter {
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            count: initial.unwrap_or(0),
        }
    }

    pub fn increment(&mut self) -> i32 {
        self.count += 1;
        self.count
    }

    pub fn decrement(&mut self) -> i32 {
        self.count -= 1;
        self.count
    }

    pub fn get(&self) -> i32 {
        self.count
    }

    pub fn reset(&mut self) {
        self.count = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    fn fibonacci_sequence() {
        assert_eq!(fibonacci(0), 0);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(10), 55);
        assert_eq!(fibonacci(20), 6765);
    }

    #[test]
    fn reverses_by_unicode_scalar() {
        assert_eq!(reverse_string("hello"), "olleh");
        assert_eq!(reverse_string("za\u017C\xF3\u0142\u0107"), "\u0107\u0142\xF3\u017Caz");
        assert_eq!(reverse_string(""), "");
    }

    #[test]
    fn primes_edge_cases() {
        assert_eq!(primes_up_to(0), Vec::<u32>::new());
        assert_eq!(primes_up_to(1), Vec::<u32>::new());
        assert_eq!(primes_up_to(2), vec![2]);
        assert_eq!(primes_up_to(10), vec![2, 3, 5, 7]);
        assert_eq!(primes_up_to(30), vec![2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    }

    #[test]
    fn counter_counts() {
        let mut counter = Counter::new(None);
        assert_eq!(counter.get(), 0);
        assert_eq!(counter.increment(), 1);
        assert_eq!(counter.increment(), 2);
        assert_eq!(counter.decrement(), 1);
        assert_eq!(counter.get(), 1);
        counter.reset();
        assert_eq!(counter.get(), 0);
    }

    #[test]
    fn counter_takes_an_initial_value() {
        let mut counter = Counter::new(Some(41));
        assert_eq!(counter.increment(), 42);
    }
}
`;if((e.uses??[]).length>0){let n=(e.uses??[])[0];if(!n)throw Error("A binding crate that declares `uses` must name at least one crate");let o=n.replace(/-/g,"_");return`#![deny(clippy::all)]

use napi_derive::napi;

// Thin napi bindings \u2014 the logic lives in the \`${n}\` crate so it stays
// testable with plain \`cargo test\`, no Node runtime required.

/// Add two numbers \u2014 native Rust speed
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    ${o}::add(a, b)
}

/// Fibonacci \u2014 demonstrates Rust performance vs JS
/// Fibonacci(40) in Rust is ~100x faster than JS
#[napi]
pub fn fibonacci(n: u32) -> u32 {
    ${o}::fibonacci(n)
}

/// Fast string reversal \u2014 native
#[napi]
pub fn reverse_string(s: String) -> String {
    ${o}::reverse_string(&s)
}

/// Counter struct \u2014 becomes JS class
#[napi]
pub struct Counter {
    inner: ${o}::Counter,
}

#[napi]
impl Counter {
    #[napi(constructor)]
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            inner: ${o}::Counter::new(initial),
        }
    }

    #[napi]
    pub fn increment(&mut self) -> i32 {
        self.inner.increment()
    }

    #[napi]
    pub fn decrement(&mut self) -> i32 {
        self.inner.decrement()
    }

    #[napi]
    pub fn get_count(&self) -> i32 {
        self.inner.get()
    }

    #[napi]
    pub fn reset(&mut self) {
        self.inner.reset()
    }
}

/// Async example \u2014 becomes JS Promise
#[napi]
pub async fn fetch_data_simulated(url: String) -> napi::Result<String> {
    // Simulate async work
    Ok(format!("fetched: {}", url))
}

/// All primes up to n \u2014 sieve of Eratosthenes
#[napi]
pub fn primes_up_to(n: u32) -> Vec<u32> {
    ${o}::primes_up_to(n)
}
`}return`#![deny(clippy::all)]

use napi_derive::napi;

/// Add two numbers \u2014 native Rust speed
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Fibonacci \u2014 demonstrates Rust performance vs JS
/// Fibonacci(40) in Rust is ~100x faster than JS
#[napi]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0;
            let mut b = 1;
            for _ in 2..=n {
                let c = a + b;
                a = b;
                b = c;
            }
            b
        }
    }
}

/// Fast string reversal \u2014 native
#[napi]
pub fn reverse_string(s: String) -> String {
    s.chars().rev().collect()
}

/// Counter struct \u2014 becomes JS class
#[napi]
pub struct Counter {
    count: i32,
}

#[napi]
impl Counter {
    #[napi(constructor)]
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            count: initial.unwrap_or(0),
        }
    }

    #[napi]
    pub fn increment(&mut self) -> i32 {
        self.count += 1;
        self.count
    }

    #[napi]
    pub fn decrement(&mut self) -> i32 {
        self.count -= 1;
        self.count
    }

    #[napi]
    pub fn get_count(&self) -> i32 {
        self.count
    }

    #[napi]
    pub fn reset(&mut self) {
        self.count = 0;
    }
}

/// Async example \u2014 becomes JS Promise
#[napi]
pub async fn fetch_data_simulated(url: String) -> napi::Result<String> {
    // Simulate async work
    Ok(format!("fetched: {}", url))
}

/// Compute prime numbers up to n \u2014 CPU intensive, Rust shines
#[napi]
pub fn primes_up_to(n: u32) -> Vec<u32> {
    if n < 2 {
        return vec![];
    }
    let mut sieve = vec![true; (n + 1) as usize];
    sieve[0] = false;
    sieve[1] = false;
    let mut i = 2;
    while i * i <= n {
        if sieve[i as usize] {
            let mut j = i * i;
            while j <= n {
                sieve[j as usize] = false;
                j += i;
            }
        }
        i += 1;
    }
    sieve
        .iter()
        .enumerate()
        .filter_map(|(idx, &is_prime)| if is_prime { Some(idx as u32) } else { None })
        .collect()
}
`}function hr(e,t){let n=Ye(t),o=`${n}/${e.name}`,s=(e.uses??[]).length>0;return{name:o,version:"0.0.0",private:!0,type:"module",main:"index.js",types:"index.d.ts",exports:{".":{types:"./index.d.ts",require:"./index.js",import:"./index.js"},"./wasi":{types:"./index.d.ts",require:`./${e.name}.wasi.cjs`,browser:`./${e.name}.wasi-browser.js`}},files:["index.js","index.d.ts","*.node",`${e.name}.wasi.cjs`,`${e.name}.wasi-browser.js`,`${e.name}.wasm`],napi:{binaryName:e.name,packageName:o,targets:[...qe],wasm:{initialMemory:16,maximumMemory:65536,browser:{fs:!1,asyncInit:!0,errorEvent:!0}}},scripts:{build:`m native napi:build --only ${e.name}`,"build:debug":`m native napi:build:debug --only ${e.name}`,"build:wasm":`m native napi:build:wasm --only ${e.name}`,"create-npm-dirs":`m native create-npm-dirs --only ${e.name}`,artifacts:`m native artifacts --only ${e.name}`,test:"m bun test","test:watch":"m bun test --watch",typecheck:"m typecheck --noEmit","cargo:check":"m native check","cargo:clippy":"m native clippy","cargo:fmt":"m native fmt","cargo:fmt:check":"m native fmt:check","cargo:test":"m native test"},devDependencies:{[`${n}/bun-config`]:"workspace:*",[`${n}/native-config`]:"workspace:*",...s?{[`${n}/native-crates`]:"workspace:*"}:{},[`${n}/ts`]:"workspace:*","@napi-rs/cli":"^3.9.1"}}}function br(e){return`{
  "extends": "${e}/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"]
  },
  "include": ["index.d.ts", "tests/**/*"]
}
`}async function Yn(e,t,n={}){let o=O(e,we(t.name));if(await ze(O(o,"src"),{recursive:!0}),await G(O(o,"Cargo.toml"),dr(t)),await G(O(o,"src","lib.rs"),fr(t)),t.binding)await G(O(o,"build.rs"),gr());if(!t.binding)return{crate:o};let s=O(e,V(t.name));return await ze(s,{recursive:!0}),await G(O(s,"package.json"),`${JSON.stringify(hr(t,n),null,2)}
`),await G(O(s,"tsconfig.json"),br(Ye(n))),await G(O(s,"turbo.json"),yr()),await ze(O(s,"tests"),{recursive:!0}),await G(O(s,"tests",`${t.name}.test.ts`),vr(t,n)),{crate:o,package:s}}function wr(e,t){return e.replace(/members = \[([\s\S]*?)\]/,(n,o)=>{let s=new Set(o.split(`
`).map((i)=>i.trim()).filter((i)=>i.startsWith('"')).map((i)=>i.replace(/,$/,"")));return s.add(`"crates/${t}"`),`members = [
${[...s].sort().map((i)=>`  ${i},`).join(`
`)}
]`})}async function Qn(e,t){let n=O(e,"packages","native","Cargo.toml");if(!mr(n))return;let o=await Bun.file(n).text();if(o.includes(`"crates/${t}"`))return;let s=o.includes("members = [")?wr(o,t):`${o.trimEnd()}

[workspace]
members = [
  "crates/${t}",
]
`;await G(n,s)}function kr(e){return{name:`${Ye(e)}/native-crates`,version:"0.0.0",private:!0,scripts:{build:"m native build --pure",test:"m native test --pure","cargo:check":"m native check --pure","cargo:clippy":"m native clippy --pure","cargo:fmt":"m native fmt --pure","cargo:fmt:check":"m native fmt:check --pure"}}}async function At(e,t={}){let n=O(e,"packages","native","crates");return await ze(n,{recursive:!0}),await G(O(n,"package.json"),`${JSON.stringify(kr(t),null,2)}
`),await G(O(n,"turbo.json"),xr()),n}var Ye=(e)=>e.scope??He,gr=()=>`extern crate napi_build;

fn main() {
    napi_build::setup();
}
`,yr=()=>`{
  "extends": ["//"],
  "tasks": {
    "build": {
      "inputs": [
        "package.json",
        "../../crates/*/src/**/*.rs",
        "../../crates/*/Cargo.toml",
        "../../crates/*/build.rs",
        "../../Cargo.toml",
        "../../Cargo.lock",
        "../../rust-toolchain.toml"
      ],
      "outputs": ["*.node", "index.js", "index.d.ts"],
      "cache": true
    },
    "build:wasm": {
      "outputs": ["*.wasi.cjs", "*.wasi-browser.js", "*.wasm"],
      "cache": false
    },
    "cargo:check": {
      "cache": false
    },
    "cargo:clippy": {
      "cache": false
    }
  }
}
`,vr=(e,t={})=>{let n=e.name,o=Ye(t),s=(e.uses??[])[0]??"shared",i=(e.uses??[]).length>0,r=`${`${s}.workspace`.padEnd(22)}= true`,a=i?`
describe("pure Rust crates", () => {
  it("keep the shared logic in crates/${s}, napi-free", async () => {
    const manifest = await Bun.file("../../crates/${s}/Cargo.toml").text();
    expect(manifest).toContain('name    = "${s}"');
    expect(manifest).not.toMatch(/^crate-type/m);
    expect(manifest).not.toMatch(/^napi/m);

    const lib = await Bun.file("../../crates/${s}/src/lib.rs").text();
    expect(lib).toContain("pub fn add");
    expect(lib).toContain("pub fn fibonacci");
    expect(lib).toContain("pub fn primes_up_to");
    expect(lib).toContain("pub struct Counter");
    expect(lib).not.toContain("#[napi]");
  });

  it("are wired into the binding via a Cargo path dependency", async () => {
    const manifest = await Bun.file(\`\${CRATE}/Cargo.toml\`).text();
    expect(manifest).toContain("${r}");
  });

  it("are listed in the virtual workspace manifest", async () => {
    const manifest = await Bun.file("../../Cargo.toml").text();
    expect(manifest).toContain('"crates/${s}"');
  });

  it("tune the release profile (lto, single codegen unit, stripped)", async () => {
    const manifest = await Bun.file("../../Cargo.toml").text();
    expect(manifest).toContain("[profile.release]");
    expect(manifest).toContain("lto           = true");
    expect(manifest).toContain("codegen-units = 1");
    expect(manifest).toContain("strip         = true");
  });

  it("are one Turbo node \u2014 the bridge package runs m native --pure", async () => {
    const pkg = await Bun.file("../../crates/package.json").json();
    expect(pkg.name).toBe("${o}/native-crates");
    expect(pkg.private).toBe(true);
    expect(pkg.scripts.build).toBe("m native build --pure");
    expect(pkg.scripts.test).toBe("m native test --pure");
  });

  it("never Turbo-cache the bridge tasks (cargo owns target/)", async () => {
    const turbo = await Bun.file("../../crates/turbo.json").json();
    expect(turbo.tasks.build.cache).toBe(false);
    expect(turbo.tasks.test.cache).toBe(false);
  });
});
`:"";return`import { describe, expect, it } from "bun:test";

// Structure tests: the workspace is the source of truth for where things live.
// The Rust code itself is covered by \`cargo test\`, the JS fallback path by
// packages/external.

const CRATE = "../../crates/${n}";

describe("${n} workspace", () => {
  it("has a virtual workspace manifest listing the crate", async () => {
    const content = await Bun.file("../../Cargo.toml").text();
    expect(content).toContain("[workspace]");
    // \`[workspace.package]\` is fine \u2014 a real [package] table is not.
    expect(content).not.toMatch(/^\\[package\\]$/m);
    expect(content).toContain('"crates/${n}"');
  });

  it("has a cdylib binding crate", async () => {
    const content = await Bun.file(\`\${CRATE}/Cargo.toml\`).text();
    expect(content).toContain('name    = "${n}"');
    expect(content).toContain("cdylib");
    expect(content).toContain("napi-derive");
  });

  it("has src/lib.rs with #[napi] macros", async () => {
    const content = await Bun.file(\`\${CRATE}/src/lib.rs\`).text();
    expect(content).toContain("#[napi]");
    expect(content).toContain("pub fn add");
    expect(content).toContain("pub fn fibonacci");
    expect(content).toContain("Counter");
  });

  it("has a build.rs calling napi_build::setup", async () => {
    const content = await Bun.file(\`\${CRATE}/build.rs\`).text();
    expect(content).toContain("napi_build::setup");
  });
});

describe("${n} npm package", () => {
  it("declares the napi config for every target", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.napi).toBeDefined();
    expect(pkg.napi.binaryName).toBe("${n}");
    expect(pkg.napi.targets).toContain("wasm32-wasip1-threads");
    expect(pkg.napi.wasm).toBeDefined();
  });

  it("builds only its own package", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.scripts.build).toBe("m native napi:build --only ${n}");
    expect(pkg.scripts["build:wasm"]).toBe("m native napi:build:wasm --only ${n}");
  });
${i?`
  it("depends on the pure-Rust bridge package", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.devDependencies["${o}/native-crates"]).toBe("workspace:*");
  });
`:""}
  it("caches the napi build with the Cargo graph as inputs", async () => {
    const turbo = await Bun.file("turbo.json").json();
    expect(turbo.tasks.build.cache).toBe(true);
    expect(turbo.tasks.build.outputs).toContain("*.node");
    // The crate sources live OUTSIDE this package \u2014 the inputs must reach them.
    expect(turbo.tasks.build.inputs).toContain("../../crates/*/src/**/*.rs");
    expect(turbo.tasks.build.inputs).toContain("../../Cargo.lock");
    // The wasm build shells out to the wasm32 target toolchain \u2014 never cached.
    expect(turbo.tasks["build:wasm"].cache).toBe(false);
  });
});
${a}`},xr=()=>`{
  "extends": ["//"],
  "tasks": {
    "build": {
      "inputs": [
        "*/src/**/*.rs",
        "*/Cargo.toml",
        "../Cargo.toml",
        "../Cargo.lock",
        "../rust-toolchain.toml"
      ],
      "outputs": [],
      "cache": false
    },
    "test": {
      "inputs": [
        "*/src/**/*.rs",
        "*/Cargo.toml",
        "../Cargo.toml",
        "../Cargo.lock",
        "../rust-toolchain.toml"
      ],
      "outputs": [],
      "cache": false
    },
    "cargo:check": {
      "cache": false
    },
    "cargo:clippy": {
      "cache": false
    }
  }
}
`;var Zn=f(()=>{We()});import{existsSync as Et}from"fs";import{join as ne}from"path";var{which:Cr}=globalThis.Bun;function Sr(){return!!Cr("cargo")}function _t(){if(!Sr())return console.warn("\u26A0\uFE0F cargo not found, skipping (install Rust: https://rustup.rs)"),!1;return!0}function oe(){if(Et(ne(Tt,"Cargo.toml")))return!0;return console.warn(`\u26A0\uFE0F ${R}/Cargo.toml not present, skipping (enable the native config)`),!1}function T(e,t={}){if(!oe()||!_t())return 0;return g(["cargo",...e],{cwd:t.cwd??Tt})}function pe(e){if(!e)return[];let t=xe(x).filter((n)=>n.binding).map((n)=>n.name);if(t.length===0)return[];return console.log(`\u2139\uFE0F pure Rust only \u2014 excluding bindings: ${t.join(", ")}`),t.flatMap((n)=>["--exclude",n])}function Xn(){return Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/scripts/index.js"))}function $r(e){return["--cwd",x,"--manifest-path",`${e.crateDir}/Cargo.toml`,"--package-json-path",`${e.dir}/package.json`,"--output-dir",e.dir]}function Ce(e,t={},n=()=>[]){if(!oe()||!_t())return 0;let o=Ke(x),s=t.only?o.filter((r)=>r.name===t.only):o;if(s.length===0)return console.warn(t.only?`\u26A0\uFE0F No napi package named "${t.only}" in ${R}/${J} \u2014 skipping`:`\u26A0\uFE0F No napi packages in ${R}/${J} \u2014 skipping`),0;let i=0;for(let r of s){console.log(`
\u25B8 ${r.name}: ${r.crateDir} \u2192 ${r.dir}`);let a=g(["bun",Xn(),...e,...$r(r),...n(r),...t.target?["--target",t.target]:[],...t.cross?["--use-napi-cross"]:[],...t.dryRun?["--dry-run"]:[]],{cwd:x});if(a!==0)i=a,console.error(`::error::${e.join(" ")} failed for ${r.name} (exit ${a})`)}return i}function Rr(e,t=Tt){if(!oe()||!_t())return 0;return g(["bun",Xn(),...e],{cwd:t})}function Ar(){if(!process.env.WASI_SDK_PATH)console.warn(`\u26A0\uFE0F WASI_SDK_PATH is not set \u2014 install the WASI SDK if the wasm target fails to link
`+"   (CI does it for you; locally: https://github.com/WebAssembly/wasi-sdk/releases)")}function Hr(e){let t=new Set;for(let o of Ke(e))for(let s of o.targets)t.add(s);return{include:$t.filter((o)=>t.size===0||t.has(o.target)).map((o)=>{let s={target:o.target,runner:o.runner};if(o.container)s.container=o.container;if(o.wasi)s.wasi=!0;return s})}}async function eo(e){if(e)return e;let t=Je(x)[0];if(t)try{let o=(await Bun.file(ne(x,t.dir,"package.json")).json()).name?.split("/")[0];if(o?.startsWith("@"))return o}catch{}return process.env.NATIVE_SCOPE??He}var x,Tt,ue,Se,Er,Tr,_r,Or,Ir,Pr,Nr,Dr,jr,Lr,Mr,Br,Gr,Fr,Ur,Vr,qr,Wr,Jr,Kr,zr,Yr,Qr,Zr,Xr,ea,to,ta;var no=f(()=>{k();zn();We();Zn();x=Jn(),Tt=ne(x,R);ue={pure:{type:"boolean",description:"Only the pure Rust crates (excludes every napi binding)",default:!1}};Se={only:{type:"string",description:"Build a single package (by directory name)"},target:{type:"string",description:"Rust target triple, e.g. aarch64-unknown-linux-gnu"},cross:{type:"boolean",description:"Cross-compile with napi's bundled toolchain",default:!1}},Er=l({meta:{name:"check",description:"cargo check --workspace (fast type-check)"},args:{...ue},run({args:e}){process.exit(T(["check","--workspace",...pe(Boolean(e.pure))]))}}),Tr=l({meta:{name:"clippy",description:"cargo clippy --workspace --all-targets -- -D warnings"},args:{...ue},run({args:e}){process.exit(T(["clippy","--workspace",...pe(Boolean(e.pure)),"--all-targets","--","-D","warnings"]))}}),_r=l({meta:{name:"fmt",description:"cargo fmt --all (format write)"},args:{...ue},run({args:e}){process.exit(T(["fmt","--all",...pe(Boolean(e.pure))]))}}),Or=l({meta:{name:"fmt:check",description:"cargo fmt --all -- --check (format check)"},args:{...ue},run({args:e}){process.exit(T(["fmt","--all",...pe(Boolean(e.pure)),"--","--check"]))}}),Ir=l({meta:{name:"test",description:"cargo test --workspace (run Rust tests)"},args:{...ue},run({args:e}){process.exit(T(["test","--workspace",...pe(Boolean(e.pure))]))}}),Pr=l({meta:{name:"build",description:"cargo build --workspace (debug)"},args:{...ue},run({args:e}){process.exit(T(["build","--workspace",...pe(Boolean(e.pure))]))}}),Nr=l({meta:{name:"build:release",description:"cargo build --workspace --release (lto, strip)"},run(){process.exit(T(["build","--workspace","--release"]))}}),Dr=l({meta:{name:"build:ci",description:"cargo build --workspace --profile ci"},run(){process.exit(T(["build","--workspace","--profile","ci"]))}}),jr=l({meta:{name:"tree",description:"cargo tree (dependency tree)"},run(){process.exit(T(["tree",...v("tree")]))}}),Lr=l({meta:{name:"update",description:"cargo update (update dependencies)"},run(){process.exit(T(["update",...v("update")]))}}),Mr=l({meta:{name:"doc",description:"cargo doc --no-deps (generate docs)"},run(){process.exit(T(["doc","--no-deps"]))}}),Br=l({meta:{name:"nextest",description:"cargo nextest run (faster parallel tests)"},run(){process.exit(T(["nextest","run",...v("nextest")]))}}),Gr=l({meta:{name:"llvm-cov",description:"cargo llvm-cov --lcov (Rust coverage, requires cargo-llvm-cov)"},run(){let e=v("llvm-cov");if(e.length===0)process.exit(T(["llvm-cov","--workspace","--lcov","--output-path","coverage/rust-lcov.info"]));process.exit(T(["llvm-cov",...e]))}}),Fr=l({meta:{name:"audit",description:"cargo audit (security audit)"},run(){process.exit(T(["audit"]))}}),Ur=l({meta:{name:"deny",description:"cargo deny check (license/ban check)"},run(){process.exit(T(["deny",...v("deny")]))}}),Vr=l({meta:{name:"typecheck",description:"Type-check every npm package (skips when absent)"},run(){if(!oe())process.exit(0);let e=Je(x).filter((n)=>Et(ne(x,n.dir,"tsconfig.json")));if(e.length===0)console.warn(`\u26A0\uFE0F No npm packages to type-check in ${R}/${J}`),process.exit(0);let t=0;for(let n of e){console.log(`\u25B8 typecheck ${n.name}`);let o=g(["bun","run","typecheck"],{cwd:ne(x,n.dir)});if(o!==0)t=o}process.exit(t)}});qr=l({meta:{name:"matrix",description:"Print the CI build matrix (supported targets the packages declare)"},args:{json:{type:"boolean",description:"Pretty-print JSON (default)",default:!0},gha:{type:"boolean",description:"Print `key=value` lines ready for $GITHUB_OUTPUT",default:!1}},run({args:e}){let t=Hr(x);if(e.gha)console.log(`targets=${JSON.stringify(t)}`),console.log(`has_targets=${t.include.length>0}`);else console.log(JSON.stringify(t,null,2));process.exit(0)}}),Wr=l({meta:{name:"list",description:"List crates and the npm packages built from them"},args:{json:{type:"boolean",description:"Print JSON",default:!1}},run({args:e}){if(!oe())process.exit(0);let t=xe(x),n=Ke(x),o=new Set(n.map((s)=>s.name));if(e.json)console.log(JSON.stringify({root:x,crates:t,packages:n},null,2)),process.exit(0);console.log(`
\uD83E\uDD80 ${R} (workspace root: ${x})
`),console.log("  crates/");for(let s of t){let i=s.binding?"cdylib \u2192 npm package":"pure Rust",r=s.uses.length?` (uses ${s.uses.join(", ")})`:"",a=s.binding&&!o.has(s.name)?"  \u26A0\uFE0F no npm package":"";console.log(`    ${s.name.padEnd(14)} ${i}${r}${a}`)}if(console.log(`
  npm/`),n.length===0)console.log("    (none \u2014 add a cdylib crate with `m native add <name>`)");for(let s of n)console.log(`    ${s.name.padEnd(14)} ${s.crateDir}  binary: ${s.binaryName}.<platform>.node`),console.log(`    ${" ".repeat(14)} targets: ${s.targets.join(", ")}`);console.log(""),process.exit(0)}});Jr=l({meta:{name:"add",description:"Add a crate (and, for bindings, its npm package) to the workspace"},args:{name:{type:"positional",description:"Crate name \u2014 also the npm package name",required:!0},pure:{type:"boolean",description:"Pure Rust crate: no cdylib, no npm package",default:!1},uses:{type:"string",description:"Comma-separated sibling crates to depend on"},scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!oe())process.exit(1);let t=String(e.name);if(!/^[a-z0-9][a-z0-9-]*$/.test(t))console.error(`\u274C Invalid crate name "${t}" \u2014 use lowercase letters, digits and hyphens`),process.exit(1);let n={name:t,binding:!e.pure,uses:e.uses?String(e.uses).split(",").map((s)=>s.trim()).filter(Boolean):[],sample:"arithmetic"},o=await eo(e.scope);if(await Yn(x,n,{scope:o}),await Qn(x,t),e.pure)await At(x,{scope:o});if(console.log(`
\u2705 Added ${e.pure?"pure Rust crate":"crate + npm package"} "${t}"`),console.log(`   crate:   ${R}/crates/${t}/`),!e.pure)console.log(`   package: ${V(t)}/`);else console.log(`   bridge:  ${R}/crates/package.json (${o}/native-crates)`),console.log(`   Bindings that use "${t}" add it to workspace.dependencies + Cargo.toml,`),console.log(`   and \`${o}/native-crates: workspace:*\` in their package.json.`);console.log(`
   Run: bun install && m native check
`),process.exit(0)}}),Kr=l({meta:{name:"napi:build",description:"napi build --platform --release (one per package)"},args:Se,run({args:e}){process.exit(Ce(["build","--platform","--release"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),zr=l({meta:{name:"napi:build:debug",description:"napi build (debug, one per package)"},args:Se,run({args:e}){process.exit(Ce(["build"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),Yr=l({meta:{name:"napi:build:wasm",description:`napi build --target ${ke} (one per package)`},args:{only:Se.only},run({args:e}){Ar(),process.exit(Ce(["build","--platform","--release","--target",ke],{only:e.only}))}}),Qr=l({meta:{name:"create-npm-dirs",description:"Generate the per-platform npm packages (run in CI, not committed)"},args:{only:Se.only,"dry-run":{type:"boolean",default:!1}},run({args:e}){process.exit(Ce(["create-npm-dirs"],{only:e.only,dryRun:Boolean(e["dry-run"])},()=>["--npm-dir",`${R}/${J}`]))}}),Zr=l({meta:{name:"artifacts",description:"Copy CI artifacts (.node/.wasm) into the npm packages"},args:{only:Se.only,dir:{type:"string",description:"Directory holding the downloaded artifacts",default:"artifacts"}},run({args:e}){process.exit(Ce(["artifacts"],{only:e.only},(t)=>["--npm-dir",`${R}/${J}`,"--output-dir",String(e.dir??"artifacts"),"--build-output-dir",t.dir]))}}),Xr=l({meta:{name:"napi",description:"Run napi-rs CLI (passthrough, cwd = the workspace)"},run(){process.exit(Rr(v("napi")))}}),ea=l({meta:{name:"sync",description:"Re-sync the Turbo bridge node and Cargo\u2192npm dependency edges"},args:{scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!oe())process.exit(1);let t=await eo(e.scope),n=`${t}/native-crates`,o=0;await At(x,{scope:t}),console.log(`  \u2713 ${R}/crates/{package,turbo}.json (bridge node)`);for(let i of xe(x).filter((r)=>r.binding)){let r=ne(x,V(i.name),"package.json");if(!Et(r))continue;let a=(i.uses??[]).length>0;await St(r,(c)=>{let p=Ct(c).devDependencies?.[n];if(a&&p!=="workspace:*")return console.log(`  \u2713 ${V(i.name)}/package.json \u2192 ${n}: workspace:*`),o+=1,Un(c,`devDependencies.${n}`,"workspace:*");if(!a&&p)return console.log(`  \uD83D\uDDD1\uFE0F ${V(i.name)}/package.json \u2190 ${n} (no Cargo path deps)`),o+=1,Vn(c,`devDependencies.${n}`);return c})}let s=ne(x,"package.json");await St(s,(i)=>{if((Ct(i).workspaces??[]).includes(`${R}/crates`))return i;return console.log(`  \u2713 package.json workspaces += ${R}/crates`),o+=1,Hn(i,"workspaces",`${R}/crates`)}),console.log(o===0?`
\u2705 Already in sync
`:`
\u2705 Synced (${o} fix${o===1?"":"es"}) \u2014 run bun install
`),process.exit(0)}}),to=l({meta:{name:"m native",version:"1.0.0",description:"Native Rust bindings via Cargo + napi-rs \u2014 one Cargo workspace in packages/native with a crate per Rust unit and an npm package per napi binding."},subCommands:{list:Wr,matrix:qr,add:Jr,check:Er,clippy:Tr,fmt:_r,"fmt:check":Or,test:Ir,build:Pr,"build:release":Nr,"build:ci":Dr,tree:jr,update:Lr,doc:Mr,nextest:Br,"llvm-cov":Gr,audit:Fr,deny:Ur,typecheck:Vr,"napi:build":Kr,"napi:build:debug":zr,"napi:build:wasm":Yr,"create-npm-dirs":Qr,artifacts:Zr,napi:Xr,sync:ea},run(){let e=v("native");if(e.length===0)console.log(`
m native \u2014 Cargo + napi-rs wrapper (${R})

Usage:
  m native <command> [args]

Workspace:
  list                 crates + npm packages discovered in ${R}
  add <name>           new crate + npm package (--pure for Rust-only, --uses shared)
  sync                 re-sync the bridge node + Cargo\u2192npm dependency edges
  typecheck            tsc --noEmit in every npm package

Cargo (whole workspace, run in ${R}):
  check                cargo check --workspace
  clippy               cargo clippy --workspace --all-targets -- -D warnings
  fmt / fmt:check      cargo fmt --all [-- --check]
  test                 cargo test --workspace
  build                cargo build --workspace
  build:release        cargo build --workspace --release (lto, strip)
  build:ci             cargo build --workspace --profile ci
  tree / update / doc  cargo passthrough
  nextest              cargo nextest run
  llvm-cov             cargo llvm-cov --lcov \u2192 coverage/rust-lcov.info
  audit / deny         cargo audit / cargo deny
  (--pure on build/check/clippy/fmt/fmt:check/test scopes the command to the
   pure Rust crates \u2014 what the @scope/native-crates bridge package runs)

NAPI (once per npm package):
  napi:build           napi build --platform --release
  napi:build:debug     napi build (debug)
  napi:build:wasm      napi build --target ${ke}
  create-npm-dirs      generate the per-platform package dirs (CI)
  artifacts            copy downloaded artifacts into the packages (CI)
  matrix [--gha]       print the CI build matrix
  napi [args]          passthrough to @napi-rs/cli

  --only <pkg>         run for a single package (turbo builds each one)
  --target <triple>    build one target (CI matrix)
  --cross              cross-compile with napi's bundled toolchain

Examples:
  m native list
  m native matrix --gha        # in CI: feeds strategy.matrix
  m native add parser
  m native add shared --pure
  m native sync                # after editing Cargo.toml path deps
  m native napi:build --only native
  m native napi:build --target aarch64-unknown-linux-gnu --cross
`),process.exit(0);let t=e[0]??"";if(!Object.keys(to.subCommands||{}).includes(t)&&!t.startsWith("-"))process.exit(T(e))}}),ta=to});var{file:oo,spawnSync:na}=globalThis.Bun;var oa,sa;var so=f(()=>{I();k();oa=l({meta:{name:"m e2e",version:"1.0.0",description:"Playwright E2E with browser detection \u2014 auto-skips if browsers missing, uses shared config"},args:{args:{type:"positional",description:"Playwright test args",required:!1}},async run(){let{chromium:e,firefox:t,webkit:n}=await import("@playwright/test"),o={chromium:e,firefox:t,webkit:n},s=[];for(let[w,b]of Object.entries(o))try{let m=b.executablePath();if(!await oo(m).exists())s.push(w)}catch{s.push(w)}if(s.length>0)console.log(`
E2E skipped: browser(s) not installed (${s.join(", ")}).`),console.log("Run `bunx playwright install` to download them.\n"),process.exit(0);let i=Le(),r=await oo(`${i}/apps/example/playwright.config.ts`).exists()?`${i}/apps/example/playwright.config.ts`:null,a=v("e2e"),u=["bun",Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js")),"test",...r?["--config",r]:[],...a],p=na({cmd:u,stdout:"inherit",stderr:"inherit",stdin:"inherit"});process.exit(p.exitCode)}}),sa=oa});import{existsSync as ia}from"fs";var{which:ra}=globalThis.Bun;function Ot(){return ia(Qe)}async function ca(){try{let e=Bun.fileURLToPath(import.meta.resolve("@unocss/cli/package.json")),n=(await Bun.file(e).json()).bin?.unocss;if(n)return["bun",e.replace("package.json",n)]}catch{}return ra("unocss")?["unocss"]:null}async function io(){try{return((await import(Qe)).default?.cli?.entry??[]).map((n)=>n.outFile).filter((n)=>!!n)}catch{return[]}}async function ro(e){if(!Ot())return console.warn("\u26A0\uFE0F UnoCSS not enabled (shared uno.config.ts missing) \u2014 skipping"),0;let t=await ca();if(!t)return console.warn("\u26A0\uFE0F unocss CLI not found \u2014 skipping (install: bun add -d @unocss/cli, or use the unocss config package)"),0;return g([...t,"--config",Qe,...e],{cwd:aa})}var Qe,aa,la,pa,ua,ma,da;var ao=f(()=>{I();k();Qe=N("uno.config.ts"),aa=Le();la=l({meta:{name:"build",description:"Generate CSS with the shared UnoCSS config"},async run(){let e=await ro([]);if(e!==0)console.error(`::error::unocss build failed (exit ${e})`),process.exit(e);if(!Ot())process.exit(0);let t=await io();if(t.length>0)console.log(`\u2705 CSS built: ${t.join(", ")}`);process.exit(0)}}),pa=l({meta:{name:"watch",description:"Same as build, in watch mode"},async run(){let e=await ro(["--watch"]);process.exit(e)}}),ua=l({meta:{name:"info",description:"Show whether UnoCSS is enabled and what it writes"},async run(){let e=Ot();if(console.log(`enabled: ${e}`),console.log(`config:  ${Qe}${e?"":" (missing)"}`),!e)process.exit(0);let t=await io();console.log(`outputs: ${t.length>0?t.join(", "):"(none declared)"}`),process.exit(0)}}),ma=l({meta:{name:"m unocss",version:"1.0.0",description:"UnoCSS wrapper \u2014 owns the shared config path, skips cleanly when disabled"},subCommands:{build:la,watch:pa,info:ua},run(){console.log(`
m unocss \u2014 UnoCSS with the shared config

Usage:
  m unocss <command>

Commands:
  build     Generate CSS (no-op when UnoCSS is not enabled)
  watch     Generate CSS in watch mode
  info      Show config path and declared output files

Examples:
  m unocss build          # in an app's "build" script
  m unocss watch          # in an app's "build:css:watch" script
`),process.exit(0)}}),da=ma});import{existsSync as co,readdirSync as ga,readFileSync as fa}from"fs";import{join as Pt}from"path";function ba(e){if(e===void 0||e===!1||e===null)return null;if(e===!0)return It;if(typeof e==="string")return e||It;if(typeof e==="object")return e.dir||It;return null}function ya(e){let t=Pt(e,"package.json");if(!co(t))return null;try{return JSON.parse(fa(t,"utf8"))}catch{return null}}function Ze(e=process.cwd()){let t=[];for(let o of ha){let s=o.split("*")[0]??"",i=Pt(e,s);if(!co(i))continue;for(let r of ga(i,{withFileTypes:!0})){if(!r.isDirectory())continue;let a=`${s}${r.name}`,c=ya(Pt(e,a));if(!c?.name)continue;let u=ba(c.pages);if(!u)continue;t.push({name:c.name,dir:a,outDir:`${a}/${u}`})}}t.sort((o,s)=>o.name.localeCompare(s.name));let n=t.length>1;return t.map((o)=>({...o,subpath:n?o.name.split("/").at(-1)??o.name:""}))}function Dt(e){return e.subpath?`/${e.subpath}/`:"/"}var L=".pages",Nt="coverage",It="public",ha;var lo=f(()=>{ha=["apps/*","packages/*"]});import{existsSync as jt}from"fs";import{cp as po,rm as va}from"fs/promises";import{join as z}from"path";var{Glob:wa,spawnSync:uo}=globalThis.Bun;function ka(){let e=process.env.GITHUB_REPOSITORY?.split("/")[1];if(e)return e;let n=uo({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim();if(!n)return;return n.replace(/\.git$/,"").split("/").at(-1)}function xa(){let e=process.env.GITHUB_REPOSITORY?.split("/")[0];if(e)return e;return uo({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim()?.replace(/\.git$/,"").match(/[:/]([^/:]+)\/[^/]+$/)?.[1]}async function Ca(e,t){await va(z(e,L),{recursive:!0,force:!0});for(let i of t){let r=z(e,i.outDir);if(!jt(r))console.error(`::error::${i.name} declares "${i.outDir}" but it does not exist`),process.exit(1);let a=i.subpath?z(e,L,i.subpath):z(e,L);await po(r,a,{recursive:!0}),console.log(`\uD83D\uDCE6 ${i.name}: ${i.outDir} \u2192 ${L}${Dt(i)}`)}let n="coverage/html",o=z(e,n);if(jt(z(o,"index.html")))await po(o,z(e,L,Nt),{recursive:!0}),console.log(`\uD83D\uDCCA ${n} \u2192 ${L}/${Nt} (served at /coverage/)`);let s=z(e,L,"index.html");if(!jt(s))console.warn(`\u26A0\uFE0F No index.html at the site root (${L}/) \u2014 check the pages config`)}var Sa,$a,Ra,Aa,Ea;var mo=f(()=>{k();lo();Sa=l({meta:{name:"list",description:"Show which packages declare a Pages site"},run(){let e=Ze();if(e.length===0)console.log("No package declares a pages config in its package.json"),process.exit(0);for(let t of e)console.log(`${t.name.padEnd(24)} ${t.outDir.padEnd(28)} \u2192 ${Dt(t)}`);process.exit(0)}}),$a=l({meta:{name:"build",description:"Build the site and assemble the Pages artifact from declared packages"},run(){console.log("\uD83D\uDCC4 Building static site for GitHub Pages");let e=g(["bun","run","build"]);if(e!==0)console.error(`::error::bun run build failed (exit ${e})`),process.exit(e);let t=Ze();if(t.length===0)console.error('::error::Pages is enabled but no package declares "pages" in its package.json (e.g. "pages": { "dir": "public" })'),process.exit(1);Ca(process.cwd(),t).then(()=>{console.log(`\u2705 Pages artifact ready: ${L}/`),process.exit(0)})}}),Ra=l({meta:{name:"base",description:"Report (or inject) the base path for a GitHub Pages project site"},args:{inject:{type:"boolean",description:"Rewrite absolute href/src in the built HTML to include the base path",default:!1},json:{type:"boolean",description:"Print { owner, repo, base, url } as JSON",default:!1}},async run({args:e}){let t=ka(),n=xa()??"unknown",o=t?`https://${n.toLowerCase()}.github.io/${t}`:void 0;if(e.json){console.log(JSON.stringify({owner:t?n:null,repo:t??null,base:t?`/${t}`:null,url:o??null}));return}if(console.log(`\uD83D\uDD27 Repo name: ${t??"(unknown)"}`),console.log(`   Default Pages URL: ${o??"(unknown)"}`),!e.inject)return;if(!t)console.error("::error::cannot determine repo name \u2014 set GITHUB_REPOSITORY or add a git remote"),process.exit(1);if(Ze().filter((a)=>a.subpath==="").length===0){console.log("   No root-level Pages target \u2014 nothing to rewrite");return}let r=0;for(let a of new wa(`${L}/**/*.html`).scanSync(".")){let c=await Bun.file(a).text(),u=c.replaceAll(/(href|src)="\/(?!\/)/g,`$1="/${t}/`);if(u===c)continue;await Bun.write(a,u),r++}console.log(`   Rewrote absolute paths to /${t}/ in ${r} file(s)`)}}),Aa=l({meta:{name:"m pages",version:"1.0.0",description:"GitHub Pages helper \u2014 discovers declared sites, builds and stages the artifact"},subCommands:{build:$a,base:Ra,list:Sa}}),Ea=Aa});import{mkdir as $e,readdir as Xe}from"fs/promises";import{join as se}from"path";var{$:me,file:Lt,write:Re}=globalThis.Bun;function Ta(e){let t=e.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!t)return null;let n=t[1]??"",o=t[2]??"",s={};for(let i of n.split(`
`)){let r=i.indexOf(":");if(r===-1)continue;let a=i.slice(0,r).trim(),c=i.slice(r+1).trim().replace(/^["']|["']$/g,"");if(a)s[a]=c}return{frontmatter:s,body:o}}async function Ee(e){try{let t=await Lt(e).text(),n=Ta(t);if(!n)return console.error(`\u274C ${e}: missing YAML frontmatter (---)`),null;let{frontmatter:o}=n;if(!o.name)return console.error(`\u274C ${e}: missing frontmatter 'name'`),null;if(!o.description)return console.error(`\u274C ${e}: missing frontmatter 'description'`),null;return{name:o.name,description:o.description,path:e}}catch(t){return console.error(`\u274C ${e}: ${t.message}`),null}}async function et(e){let t=[];try{let n=await Xe(e,{withFileTypes:!0});for(let o of n){let s=se(e,o.name);if(o.isDirectory()){let i=await et(s);t.push(...i)}else if(o.name==="SKILL.md"||o.name.endsWith(".md"))t.push(s)}}catch{}return t}var go="@myorg",ie,ho,M,Ae,fo,_a,Oa,Ia,Pa,Na,Da,ja,La,Ma;var bo=f(()=>{De();I();ie=nn(),ho=`${Q()}/src/cli.ts`,M=`${process.cwd()}/.agents/skills`,Ae=`${process.cwd()}/.agents/skills.index.json`;fo=l({meta:{name:"sync",description:"Sync curated skills to .agents/skills/ + validate + index"},run:async()=>{let e=process.env.SKILLS_SCOPE||process.env.SCOPE||go,t=go;await $e(M,{recursive:!0}),console.log(`
\uD83D\uDCE6 Syncing curated skills from ${ie} to ${M}/ (scope: ${e})
`);let n=0;try{let a=await Xe(ie,{withFileTypes:!0});for(let c of a){let u=se(ie,c.name);if(c.isDirectory()){let p=se(M,c.name);if(await $e(p,{recursive:!0}),await me`cp -r ${u}/* ${p}/`.quiet().catch(()=>{}),e!==t){let w=await me`find ${p} -type f -name "*.md"`.text().catch(()=>"");for(let b of w.trim().split(`
`).filter(Boolean))try{let m=await Lt(b).text();if(m.includes(t))await Re(b,m.replaceAll(t,e))}catch{}}n++,console.log(`  \u2713 ${c.name}/`)}else if(c.isFile()&&c.name.endsWith(".md")){let p=c.name.replace(/\.md$/,""),w=se(M,p);await $e(w,{recursive:!0});let b=await Lt(u).text();if(e!==t)b=b.replaceAll(t,e);if(b.startsWith("---"))await Re(se(w,"SKILL.md"),b);else{let C=`---
name: ${p}
description: ${p} skill
---

${b}`;await Re(se(w,"SKILL.md"),C)}n++,console.log(`  \u2713 ${p}/ (from legacy ${c.name})`)}}}catch(a){console.error(`  No curated dir: ${ie}`,a)}console.log(`
\u2705 Synced ${n} curated skills to .agents/skills/
`),console.log(`\uD83D\uDD0D Validating skills in ${M}/...
`);let o=await et(M),s=0,i=0;for(let a of o){let c=await Ee(a);if(c)s++,console.log(`  \u2713 ${c.name} \u2014 ${c.description}`);else i++}console.log(`
${i===0?"\u2705":"\u26A0\uFE0F"}  ${s} valid, ${i} invalid
`);let r=[];for(let a of o){let c=await Ee(a);if(c)r.push({...c,path:a.replace(`${process.cwd()}/`,"")})}if(await $e(`${process.cwd()}/.agents`,{recursive:!0}),await Re(Ae,`${JSON.stringify(r,null,2)}
`),console.log(`\uD83D\uDCC4 Built ${Ae} with ${r.length} skills
`),i>0)process.exit(1)}}),_a=l({meta:{name:"list",description:"List installed skills (curated + vendored + skills.sh)",alias:["ls"]},run:async()=>{console.log(`
\uD83D\uDCDA Skills in ${M}/:
`);try{let e=await Xe(M,{withFileTypes:!0});if(e.length===0)console.log("  (no skills installed \u2014 run `bun run skills:sync` or `bun run skills:add`)\n");else for(let t of e){if(!t.isDirectory())continue;let n=se(M,t.name,"SKILL.md"),o=await Ee(n).catch(()=>null);if(o)console.log(`  - ${o.name} \u2014 ${o.description} (${t.name}/)`);else console.log(`  - ${t.name}/ \u2014 (no SKILL.md)`)}}catch{console.log("  (no .agents/skills/ dir \u2014 run `bun run skills:sync`)\n")}console.log(`
\uD83D\uDCE6 Curated skills in ${ie}/:
`);try{let e=await Xe(ie,{withFileTypes:!0});for(let t of e){let n=t.isDirectory()?t.name:t.name.replace(/\.md$/,"");console.log(`  - ${n}`)}}catch{console.log("  (no curated dir)")}console.log(),console.log(`\uD83D\uDD0D skills.sh installed (project):
`),await me`npx skills list -p`.quiet().then(async(e)=>{let t=e.stdout.toString();console.log(t||"  (none or skills CLI not available)")}).catch(()=>{console.log("  (skills CLI not available or no project skills)")}),console.log()}}),Oa=l({meta:{name:"add",description:"Add skill via skills.sh (e.g. vercel-labs/agent-skills)",alias:["a"]},args:{package:{type:"positional",description:"Skill package (e.g. vercel-labs/agent-skills or https://skills.sh/p/<id>)",required:!0}},run:async({args:e})=>{let t=e.package;console.log(`
\uD83D\uDCE6 Adding skill package via skills.sh: ${t}
`),console.log(`> npx skills add ${t} -p --agent * -y
`);let o=await Bun.spawn({cmd:["npx","skills","add",t,"-p","--agent","*","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(o!==0)console.error(`
\u274C skills add failed with exit ${o}
`),process.exit(o);console.log(`
\u2705 Added ${t}, syncing to .agents/skills/...
`),await me`bun ${ho} skills sync`.quiet().catch(()=>{}),await me`npx skills experimental_sync -p`.quiet().catch(()=>{}),console.log(`
\u2705 Done. Review changes in .agents/skills/ before committing.
`)}}),Ia=l({meta:{name:"update",description:"Update skills via skills.sh",alias:["upgrade"]},args:{skills:{type:"positional",description:"Skills to update (default: all)",required:!1}},run:async({args:e})=>{let t=e.skills??"",n=t?[t]:[];console.log(`
\uD83D\uDD04 Updating skills via skills.sh: ${n.join(" ")||"(all)"}
`);let o=["npx","skills","update",...n,"-p","-y"];console.log(`> ${o.join(" ")}
`);let i=await Bun.spawn({cmd:o,cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(i!==0)console.error(`
\u274C skills update failed with exit ${i}
`),process.exit(i);console.log(`
\u2705 Updated, rebuilding index...
`),await me`bun ${ho} skills sync`.quiet().catch(()=>{})}}),Pa=l({meta:{name:"validate",description:"Validate all SKILL.md frontmatter (name, description)"},run:async()=>{console.log(`
\uD83D\uDD0D Validating all SKILL.md files...
`);let e=[ie,M],t=0,n=0;for(let o of e){console.log(`\uD83D\uDCC1 ${o}:
`);let s=await et(o);if(s.length===0){console.log(`  (no skills found)
`);continue}for(let i of s){let r=await Ee(i);if(r)t++,console.log(`  \u2713 ${r.name} \u2014 ${r.description} (${i.replace(`${process.cwd()}/`,"")})`);else n++}console.log()}if(console.log(`${n===0?"\u2705":"\u274C"} Validation: ${t} valid, ${n} invalid
`),n>0)process.exit(1)}}),Na=l({meta:{name:"index",description:"Build .agents/skills.index.json"},run:async()=>{console.log(`
\uD83D\uDCC4 Building ${Ae}...
`);let e=await et(M),t=[];for(let n of e){let o=await Ee(n);if(o)t.push({...o,path:n.replace(`${process.cwd()}/`,"")})}await $e(`${process.cwd()}/.agents`,{recursive:!0}),await Re(Ae,`${JSON.stringify(t,null,2)}
`),console.log(`\u2705 Built index with ${t.length} skills:
`);for(let n of t)console.log(`  - ${n.name}: ${n.description}`);console.log(`
\uD83D\uDCC4 ${Ae}
`)}}),Da=l({meta:{name:"init",description:"Init new skill via skills.sh"},args:{name:{type:"positional",description:"Skill name",required:!1,default:"my-skill"}},run:async({args:e})=>{let t=e.name??"my-skill";console.log(`
\uD83D\uDCDD Initializing skill: ${t}
`),await Bun.spawn({cmd:["npx","skills","init",t],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),ja=l({meta:{name:"remove",description:"Remove skills via skills.sh",alias:["rm"]},args:{skills:{type:"positional",description:"Skills to remove",required:!0}},run:async({args:e})=>{let n=e.skills.split(",").map((s)=>s.trim());console.log(`
\uD83D\uDDD1\uFE0F Removing skills: ${n.join(", ")}
`),await Bun.spawn({cmd:["npx","skills","remove",...n,"-p","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),La=l({meta:{name:"m skills",version:"1.0.0",description:"AI agent skills management via skills.sh + curated skills \u2014 sync, list, add, update, validate, index"},subCommands:{sync:fo,list:_a,add:Oa,update:Ia,validate:Pa,index:Na,init:Da,remove:ja},run:async({args:e})=>{if(!e._||Array.isArray(e._)&&e._.length===0)await H(fo,{rawArgs:[]})}}),Ma=La});function yo(e,t,n){let o=[];if(e.includes("Archont561/ts-monorepo-template")&&!e.includes(t))o.push("README still contains placeholder owner Archont561/ts-monorepo-template");if(e.includes("@myorg")&&!e.includes(n)){let s=e.split(`
`).filter((i)=>i.includes("shields.io")||i.includes("badge.svg"));for(let i of s)if(i.includes("@myorg"))o.push(`Badge line still contains @myorg: ${i.trim().slice(0,80)}`)}return o}var{file:Ba}=globalThis.Bun;var vo,Ga;var wo=f(()=>{k();vo=l({meta:{name:"check",description:"Check README badges for placeholder owner/scope"},args:{owner:{type:"string",description:"Expected owner/repo",default:"YOUR_ORG/YOUR_REPO"},scope:{type:"string",description:"Expected scope",default:"@your-scope"}},run:async({args:e})=>{let t=e.owner||"YOUR_ORG/YOUR_REPO",n=e.scope||"@your-scope",o=`${process.cwd()}/README.md`,s=await Ba(o).text().catch(()=>"");if(!s)console.error(`No README at ${o}`),process.exit(1);let i=yo(s,t,n);if(i.length===0)console.log("\u2705 Badges look OK (no placeholder owner/scope in badge URLs)"),process.exit(0);console.warn(`\u26A0\uFE0F Badge issues:
${i.map((r)=>`  - ${r}`).join(`
`)}`),process.exit(1)}}),Ga=l({meta:{name:"badges",version:"1.0.0",description:"Badges validation \u2014 check README badges"},subCommands:{check:vo},run:async()=>{await H(vo,{rawArgs:[]})}})});var{file:Fa}=globalThis.Bun;function Mt(e,t){return async({targetDir:n,scope:o})=>{let s=Me(...e.split("/"));if(!await Fa(s).exists())return;console.log(`
\uD83D\uDD27 Running setup for ${t}: ${e}
`);try{let r=await Bun.spawn({cmd:["bun",s],cwd:n,env:{...process.env,SCOPE:o,NATIVE_SCOPE:o,UNOCSS_SCOPE:o,DEVCONTAINER_SCOPE:o,SKILLS_SCOPE:o},stdout:"inherit",stderr:"inherit"}).exited;if(r!==0)console.warn(`\u26A0\uFE0F Setup for ${t} exited with code ${r}`)}catch(i){console.warn(`\u26A0\uFE0F Setup for ${t} failed:`,i)}}}var ko,xo,Co;var So=f(()=>{I();ko=Mt("commands/native-setup.ts","native"),xo=Mt("commands/unocss-setup.ts","unocss"),Co=Mt("commands/devcontainer-setup.ts","devcontainer")});var{file:$o}=globalThis.Bun;async function tu(e){return[...Y]}function qa(e){if(typeof e==="boolean")return!0;if(typeof e!=="string")return!1;return e==="always"||Ha.includes(e)}function Ao(e,t){let n=e.flag?t[e.flag]:void 0;return n===void 0?e.default:n}function Eo(e,t){return e.type==="select"?t===e.default:!t}function Wa(e,t){if(e.default==="always"&&!e.selfDestruct)return!0;let n=Ao(e,t);return!(e.selfDestruct===!0||Eo(e,n))}function To(e,t){let n=new Set;for(let o of e)if(Wa(o.meta,t))n.add(o.dir);return n}function _o(e,t){let n=new Set(["template"]);for(let o of e){let{meta:s}=o;if(s.default==="always")continue;let i=Ao(s,t);if(Eo(s,i)){if(n.add(o.dir),s.flag)n.add(s.flag);if(s.marker)n.add(s.marker);if(s.templateMarker)n.add(s.templateMarker);for(let a of s.markers??[])n.add(a)}for(let a of s.options??[]){if(a.value===i)continue;if(a.marker)n.add(a.marker);if(a.templateMarker)n.add(a.templateMarker);for(let c of a.markers??[])n.add(c)}let r=s.removals?.[String(i)];if(r){if(r.marker)n.add(r.marker);if(r.templateMarker)n.add(r.templateMarker);for(let a of r.markers??[])n.add(a);for(let a of r.markersToRemove??[])n.add(a)}}return n}async function Oo(e){let t=$o(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.features;if(!o||typeof o!=="object"||Array.isArray(o))return null;let s={};for(let[i,r]of Object.entries(o))if(qa(r))s[i]=r;return s}catch{return null}}async function Io(e){let t=$o(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.scope;return typeof o==="string"&&o.length>0?o:null}catch{return null}}var Ua,Ro="@myorg",Va,Y,eu,nu="tooling.features",ou="tooling.scope",Ha;var Po=f(()=>{So();Ua={none:"none",publish:"publish",docker:"docker"},Va={badges:{name:"@myorg/badges",dir:"badges",meta:{default:"always",flag:"badges",prompt:"Include badges for CI, coverage, license in READMEs?"}},biome:{name:"@myorg/biome",ciFiles:["sections/biome.yml"],dir:"biome",meta:{default:"always",flag:"biome",prompt:"Configure Biome (lint + format)?"}},"bun-config":{name:"@myorg/bun-config",ciFiles:["sections/bun-config.yml"],dir:"bun-config",meta:{default:"always",flag:"bun-config",prompt:"Configure Bun (coverage, test settings)?"}},bunup:{name:"@myorg/bunup",ciFiles:["sections/bunup.yml"],dir:"bunup",meta:{default:"always",flag:"bunup",prompt:"Configure Bunup (Bun-based package bundler)?"}},changeset:{name:"@myorg/changeset",ciFiles:["fragments/changeset/release.steps.yml"],dir:"changeset",meta:{default:"always",flag:"changeset",prompt:"Configure Changesets (versioning + releases)?"}},citty:{name:"@myorg/citty",dir:"citty",meta:{default:"always",flag:"citty",prompt:"Configure Citty (elegant CLI builder)?"}},codeql:{name:"@myorg/codeql",ciFiles:["sections/codeql.yml"],dir:"codeql",meta:{default:!0,flag:"codeql",prompt:"Include CodeQL (GitHub SAST for JS/TS)?",type:"confirm"}},commitlint:{name:"@myorg/commitlint",dir:"commitlint",meta:{default:"always",flag:"commitlint",prompt:"Configure Commitlint (Conventional Commits)?"}},community:{name:"@myorg/community",dir:"community",meta:{default:"always",flag:"community",prompt:"Include community health files (CODEOWNERS, PR template, issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING)?"}},coverage:{name:"@myorg/coverage",ciFiles:["fragments/coverage-report/coverage.base.yml","fragments/coverage-report/coverage.steps.yml","fragments/coverage-report/pages.steps.yml","sections/coverage.yml"],dir:"coverage",meta:{default:"always",flag:"coverage",prompt:"Configure coverage reporting (LCOV, HTML, artifact, Pages, threshold)?"}},dependabot:{name:"@myorg/dependabot",ciFiles:["fragments/dependabot/dependabot-auto-merge.base.yml","fragments/dependabot/dependabot-auto-merge.steps.yml","fragments/dependabot/dependabot.base.yml","standalone/dependabot.yml"],dir:"dependabot",meta:{default:"always",flag:"dependabot",prompt:"Configure Dependabot (automated dependency updates)?"}},devcontainer:{name:"@myorg/devcontainer",dir:"devcontainer",setup:Co,meta:{default:!1,flag:"devcontainer",prompt:"Include devcontainer config for Codespaces / Dev Containers?",type:"confirm",removals:{true:{},false:{extraRemovals:[".devcontainer"],filePatternsToRemove:["**/.devcontainer/**",".devcontainer/**","**/devcontainer.json"],fileRegexesToRemove:["devcontainer","\\.devcontainer"]}}}},editorconfig:{name:"@myorg/editorconfig",dir:"editorconfig",meta:{default:"always",flag:"editorconfig",prompt:"Include .editorconfig (consistent editor settings)?"}},"gh-actions":{name:"@myorg/gh-actions",ciFiles:["ci.base.yml","ci.bootstrap.yml","release.base.yml","sections/gh-actions.yml"],dir:"gh-actions",meta:{default:"always",flag:"gh-actions",prompt:"Configure GitHub Actions (CI + release workflows)?"}},gitattributes:{name:"@myorg/gitattributes",dir:"gitattributes",meta:{default:"always",flag:"gitattributes",prompt:"Include .gitattributes (line endings, binary handling)?"}},gitleaks:{name:"@myorg/gitleaks",ciFiles:["sections/gitleaks.yml"],dir:"gitleaks",meta:{default:"always",flag:"gitleaks",prompt:"Include Gitleaks (secret scanning via Lefthook + CI)?"}},lefthook:{name:"@myorg/lefthook",dir:"lefthook",meta:{default:"always",flag:"lefthook",prompt:"Configure Lefthook (Git hooks)?"}},manifest:{name:"@myorg/manifest",dir:"manifest",meta:{default:"always",flag:"manifest",prompt:"Configure the manifest editor (format-preserving package.json edits)?"}},native:{name:"@myorg/native-config",ciFiles:["fragments/native/native.base.yml","fragments/native/native.steps.yml","fragments/native/release.steps.yml","sections/native.yml"],dir:"native",setup:ko,meta:{default:"none",flag:"native",prompt:"Set up native Node-API (NAPI-RS) bindings?",type:"select",options:[{value:"none",label:"None - skip native bindings"},{value:"publish",label:"Publish a native npm package"},{value:"docker",label:"Build native bindings in Docker"}],removals:{none:{extraRemovals:["packages/native","apps/example/src/pages/api/native"],scriptsToRemove:["build:native","build:wasm","test:native","security:audit"],turboTasksToRemove:["build:native","build:wasm"],filePatternsToRemove:["**/*.node","**/*.napi.*","**/*.wasi.cjs","**/rust-toolchain.toml","Cargo.lock",".cargo/**","**/native/**","**/api/native/**"],fileRegexesToRemove:["\\\\.node$","napi","rust-toolchain","api/native"],appDepsToRemove:["@myorg/native"]},publish:{},docker:{}}}},pages:{name:"@myorg/pages",ciFiles:["fragments/pages/pages.base.yml","fragments/pages/pages.steps.yml"],dir:"pages",meta:{default:!1,flag:"pages",prompt:"Set up GitHub Pages deployment (static site via Actions)?",type:"confirm",removals:{true:{},false:{extraRemovals:[".github/workflows/pages.yml"],filePatternsToRemove:["**/pages.yml"],fileRegexesToRemove:["pages\\.yml"]}}}},playwright:{name:"@myorg/playwright",ciFiles:["sections/playwright.yml"],dir:"playwright",meta:{default:!0,flag:"playwright",prompt:"Include E2E testing with Playwright?",removals:{true:{},false:{scriptsToRemove:["test:e2e"],turboTasksToRemove:["test:e2e"],extraRemovals:["apps/example/playwright.config.ts","apps/example/e2e"],filePatternsToRemove:["**/e2e/**","**/*.e2e.ts","**/playwright.config.ts"],fileRegexesToRemove:["playwright",".*\\.spec\\.e2e\\..*"],appDepsToRemove:["@myorg/playwright","@playwright/test"]}}}},skills:{name:"@myorg/skills",dir:"skills",meta:{default:!1,flag:"skills",prompt:"Install AI agent skills? (for Cursor, Claude, Cline)",removals:{false:{extraRemovals:[".agents"],filePatternsToRemove:[".agents/**","**/.claude/**","**/skills/**"],fileRegexesToRemove:["\\.agents","skills"],scriptsToRemove:["skills"]}}}},stale:{name:"@myorg/stale",ciFiles:["fragments/stale/stale.base.yml"],dir:"stale",meta:{default:!1,flag:"stale",prompt:"Include stale action (auto-close inactive issues/PRs)?",type:"confirm"}},template:{name:"@myorg/template",dir:"template",meta:{default:"always",selfDestruct:!0,scriptsToRemove:["docs:sync","docs:site","docs:dev","docs:build","docs:preview"],removals:{always:{extraRemovals:[".github/workflows/template-docs.yml","apps/template-docs","codecov.yml","packages/tooling/tests","packages/tooling/dist"],filePatternsToRemove:["**/template-docs.yml","**/template-docs/**",".changeset/*.md"],fileRegexesToRemove:["template-docs"]}}}},trivy:{name:"@myorg/trivy",ciFiles:["sections/trivy.yml"],dir:"trivy",meta:{default:!1,flag:"trivy",prompt:"Include Trivy (container + filesystem vulnerability scanning)?",type:"confirm",removals:{false:{filePatternsToRemove:["**/trivy*"],scriptsToRemove:["security:trivy","security:check"]}}}},ts:{name:"@myorg/ts",dir:"ts",meta:{default:"always",flag:"ts",prompt:"Configure TypeScript (shared tsconfigs)?"}},turbo:{name:"@myorg/turbo",ciFiles:["sections/turbo.yml"],dir:"turbo",meta:{default:"always",flag:"turbo",prompt:"Configure Turbo (task orchestration)?"}},unocss:{name:"@myorg/unocss",dir:"unocss",setup:xo,meta:{default:!1,flag:"unocss",marker:"unocss",prompt:"Include UnoCSS (atomic CSS engine)?",type:"confirm",removals:{true:{},false:{marker:"unocss",extraRemovals:["apps/example/public/uno.css","apps/example/uno.config.ts"],filePatternsToRemove:["**/uno.css","**/*.unocss.*"],fileRegexesToRemove:[],appDepsToRemove:["@unocss/reset","unocss","@myorg/unocss"]}}}}},Y=Object.values(Va),eu=new Map(Y.map((e)=>[e.dir,e]));Ha=Object.values(Ua)});function No(e,t){if(e.startsWith("!")){let n=e.slice(1).trim();return!t.has(n)&&!t.has(n.toLowerCase())}return t.has(e)||t.has(e.toLowerCase())}function iu(e){return[e,"-type","f","(",...Ja.flatMap((t,n)=>[...n>0?["-o"]:[],"-name",`*${t}`]),")","-not","-path","*/node_modules/*","-not","-path","*/dist/*","-not","-path","*/packages/tooling/*"]}function Do(e,t){let n=e,o=!1;for(let s of Ka)n=n.replace(s,(i,r,a)=>{let c=r.split(",").map((p)=>p.trim());return o=!0,c.every((p)=>No(p,t))?"":a});for(let s of za)n=n.replace(s,(i,r,a)=>{if(r.toUpperCase()==="TEMPLATE-ONLY")return i;return o=!0,No(r,t)?"":a});if(!o)return{content:e,changed:o};return{changed:o,content:n.replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).replace(/\n{2,}$/,`
`)}}var Ja,Ka,za;var jo=f(()=>{Ja=[".yml",".yaml",".ts",".js",".md",".toml",".html"],Ka=[/[ \t]*#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g],za=[/[ \t]*#[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*\1:END[^\n]*\n?/g,/[ \t]*\/\/[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*\1:END[^\n]*\n?/g,/[ \t]*<!--[ \t]*([A-Za-z0-9_!-]+):START[ \t]*-->([\s\S]*?)<!--[ \t]*\1:END[ \t]*-->[ \t]*\n?/g]});var Lo;var Mo=f(()=>{Lo={BUN_VERSION:"latest",NATIVE_DIR:"packages/native",NATIVE_CARGO:"packages/native/Cargo.toml",NATIVE_NPM:"packages/native/npm/*/package.json",NATIVE_WASI_SDK_VERSION:"24",APP_DIR:"apps/example",APP_DOCKERFILE:"apps/example/Dockerfile"}});import{mkdir as Bo}from"fs/promises";var{$:Ya,file:de,write:Qa}=globalThis.Bun;function Uo(e){return Fo.exec(e)?.[1]??null}function Vo(e){return Za.exec(e)?.[1]??null}function ec(e,t){let n=[],o=t,s=[],i=()=>{let r=s.join(`
`).replace(/^(?:[ \t]*\n)+/,"").replace(/\s+$/,"");if(r)n.push({section:o,text:r});s=[]};for(let r of e.split(`
`)){let a=Uo(r);if(a){i(),o=a;continue}s.push(r)}return i(),n}function tc(e){return e.split(`
`).some((t)=>Fo.test(t))}function nc(e,t){let n=new Map;for(let r of t)for(let a of ec(r,Ho)){let c=n.get(a.section)??[];c.push(a.text),n.set(a.section,c)}let o=new Set,s=new Set,i=[];for(let r of e.split(`
`)){let a=Uo(r);if(!a){i.push(r);continue}o.add(a);let c=n.get(a);if(c?.length)s.add(a),i.push(c.join(`

`))}for(let r of n.keys())if(!o.has(r))console.log(`\u26A0\uFE0F No "# SECTION: ${r}" in the CI skeleton \u2014 steps dropped`);return{rendered:i.join(`
`),filled:s}}function oc(e,t){if(t.size===0)return e;let n=[],o=!1;for(let s of e.split(`
`)){let i=Vo(s);if(i)o=t.has(i);else if(/^\S/.test(s))o=!1;if(!o)n.push(s)}return n.join(`
`)}function sc(e,t){let n=e.split(`
`),o=!1;for(let[s,i]of n.entries()){let r=Vo(i);if(r)o=r===Xa;else if(/^\S/.test(i))o=!1;if(o&&/^ {4}needs: \[[^\]]*\]$/.test(i)){n[s]=`    needs: [${t.join(", ")}]`;break}}return n.join(`
`)}function qo(){return new Set(Y.map((e)=>e.dir))}function Bt(e){return Me("ci",...e.split("/"))}function ic(e,t){if(t==="ci.steps.yml")return e.startsWith("sections/");return(e.split("/").pop()??"")===t}async function rc(e,t){let n=[];for(let o of Y){if(!t.has(o.dir))continue;for(let s of o.ciFiles??[]){if(!ic(s,e))continue;n.push((await de(Bt(s)).text()).trimEnd())}}return n}async function ac(e,t){for(let n of Y){if(!t.has(n.dir))continue;for(let o of n.ciFiles??[])if((o.split("/").pop()??"")===e)return Bt(o)}return null}async function cc(){let e=Bt("ci.bootstrap.yml");if(!await de(e).exists())return"";return(await de(e).text()).trimEnd()}async function lc(e,t){if(!t)return;let n=_o(Y,t),o=await Io(e);return(s)=>{let{content:i}=Do(s,n);return o?i.replaceAll(Ro,o):i}}async function pc(e,t,n,o={}){let s=o.enabled??qo(),i=await ac(t,s);if(!i){console.log(`\u26A0\uFE0F Skipping ${t} \u2014 no enabled feature declares it`);return}let r=await de(i).text(),a=await rc(n,s),c=a.join(`

`),u;if(n==="ci.steps.yml"&&tc(r)){let b=nc(r.replaceAll("{{BOOTSTRAP}}",await cc()),a),m=new Set(Go.filter((y)=>!b.filled.has(y))),C=[Ho,...Go.filter((y)=>!m.has(y))];u=sc(oc(b.rendered,m),C)}else u=r.replace("{{STEPS}}",`${c}
`).replace("{{UPDATES}}",`${c}
`);let p=u;for(let[b,m]of Object.entries(Lo))p=p.replaceAll(`{{${b}}}`,m);p=p.replace(/\n{3,}/g,`

`);let w;if(t==="dependabot.base.yml")w=`${e}/.github/dependabot.yml`;else w=`${e}/.github/workflows/${t.replace(".base.yml",".yml")}`;await Qa(w,o.postProcess?o.postProcess(p):p),console.log(`\u2705 generated ${w}`)}async function mc(e,t,n,o){let s=t.outcome(n);if(s==="skip")return;if(s==="generate"){await pc(e,t.base,t.steps,o);return}if(!t.stale)return;let i=`${e}/${t.stale}`;if(!await de(i).exists())return;await Ya`rm -rf ${i}`.quiet();let r=t.reason?.(n);if(r)console.log(`\uD83D\uDDD1\uFE0F Removed ${i} (${r})`)}async function Wo(e,t={}){await Bo(`${e}/.github/workflows`,{recursive:!0}),await Bo(`${e}/.github`,{recursive:!0});let n=await Oo(e),o=t.enabled??(n?To(Y,n):qo()),s=t.postProcess??await lc(e,n),i=o.has("pages"),r=t.templateDocsSite??await de(`${e}/apps/template-docs/.vitepress/config.mts`).exists(),a={pages:i,coverage:o.has("coverage"),native:o.has("native"),dependabot:o.has("dependabot")||o.has("gh-actions"),stale:o.has("stale"),templateDocsSite:r,pagesDeploysToSite:i&&!r};for(let c of uc)await mc(e,c,a,{...t,enabled:o,postProcess:s})}var Fo,Za,Ho="quality",Xa="gate",Go,uc,gu;var Jo=f(async()=>{I();Po();jo();Mo();Fo=/^[ \t]*#[ \t]*SECTION:[ \t]*([A-Za-z0-9_-]+)[ \t]*$/,Za=/^ {2}([A-Za-z0-9_-]+):$/;Go=["coverage","security","native","e2e"];uc=[{base:"ci.base.yml",steps:"ci.steps.yml",outcome:()=>"generate"},{base:"release.base.yml",steps:"release.steps.yml",outcome:()=>"generate"},{base:"pages.base.yml",steps:"pages.steps.yml",outcome:(e)=>e.pagesDeploysToSite?"generate":"remove",stale:".github/workflows/pages.yml",reason:(e)=>e.templateDocsSite?"template docs site deploys Pages":"pages disabled"},{base:"coverage.base.yml",steps:"coverage.steps.yml",outcome:(e)=>{if(!e.coverage)return"skip";return e.pagesDeploysToSite||e.templateDocsSite?"remove":"generate"},stale:".github/workflows/coverage.yml",reason:(e)=>e.templateDocsSite?"coverage published by the docs site":"coverage included in pages.yml"},{base:"native.base.yml",steps:"native.steps.yml",outcome:(e)=>e.native?"generate":"remove",stale:".github/workflows/native.yml",reason:()=>"native disabled"},{base:"dependabot.base.yml",steps:"dependabot.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"dependabot-auto-merge.base.yml",steps:"dependabot-auto-merge.steps.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"stale.base.yml",steps:"stale.steps.yml",outcome:(e)=>e.stale?"generate":"remove",stale:".github/workflows/stale.yml"}];gu=process.argv[2]??"."});import{existsSync as Ko}from"fs";import{cp as zo,rm as Yo}from"fs/promises";var{spawnSync:dc}=globalThis.Bun;function Te(e){return console.log(`
\u25B8 ${e.join(" ")}`),dc({cmd:e,stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}var Gt=".pages",Qo="apps/template-docs",re,Ft="coverage/html",gc,fc;var Zo=f(async()=>{k();await Jo();re=`${Qo}/dist`;gc=l({meta:{name:"m docs",version:"1.0.0",description:"Regenerate workflows from configs/* \u2014 static README/AGENTS with TEMPLATE-ONLY blocks"},args:{dir:{type:"string",description:"Target directory (default: .)",required:!1,default:"."}},subCommands:{site:l({meta:{name:"site",description:"Build one Pages artifact: docs + coverage report + demo app"},args:{"skip-coverage":{type:"boolean",description:"Reuse coverage/lcov.info instead of re-running the test suite",default:!1},"skip-app":{type:"boolean",description:"Skip building and copying the demo app to /example/",default:!1}},async run({args:e}){if(!e["skip-coverage"]){let n=Te(["bun","run","coverage"]);if(n!==0)console.error(`::error::bun run coverage failed (exit ${n})`),process.exit(n)}Te(["bun","run","m coverage","setup"]),Te(["bun","run","m coverage","html"]);let t=Te(["bun","run","docs:build"]);if(t!==0)console.error(`::error::${Qo} build failed (exit ${t})`),process.exit(t);if(Ko(`${Ft}/index.html`))await Yo(`${re}/coverage`,{recursive:!0,force:!0}),await zo(Ft,`${re}/coverage`,{recursive:!0}),console.log(`\u2705 Coverage report copied to ${re}/coverage`);else console.warn(`\u26A0\uFE0F ${Ft}/ not found \u2014 skipping /coverage/`);if(!e["skip-app"]){let n=Te(["bun","run","m pages","build"]);if(n!==0)console.error(`::error::m pages build failed (exit ${n})`),process.exit(n);if(Ko(Gt))await Yo(`${re}/example`,{recursive:!0,force:!0}),await zo(Gt,`${re}/example`,{recursive:!0}),console.log(`\u2705 Pages artifact copied to ${re}/example`);else console.warn(`\u26A0\uFE0F ${Gt}/ not found \u2014 skipping /example/`)}if(console.log(`
\u2705 Site ready: ${re}`),console.log("   /            docs"),console.log("   /status      coverage, CI, versions"),console.log("   /coverage/   HTML coverage report"),!e["skip-app"])console.log("   /example/    demo app");process.exit(0)}})},async run({args:e}){await Wo(e.dir||".")}}),fc=gc});k();var hc={lint:()=>Promise.resolve().then(() => (on(),{})).then((e)=>Cs),"lint:fix":()=>Promise.resolve().then(() => (sn(),{})).then((e)=>$s),biome:()=>Promise.resolve().then(() => (rn(),{})).then((e)=>As),typecheck:()=>Promise.resolve().then(() => (an(),{})).then((e)=>Ts),turbo:()=>Promise.resolve().then(() => (cn(),{})).then((e)=>Os),build:()=>Promise.resolve().then(() => (at(),{})).then((e)=>Ms),health:()=>Promise.resolve().then(() => (pn(),{})).then((e)=>Bs),bun:()=>Promise.resolve().then(() => (gn(),{})).then((e)=>Zs),test:()=>Promise.resolve().then(() => (fn(),{})).then((e)=>Xs),coverage:()=>Promise.resolve().then(() => ($n(),{})).then((e)=>vi),changeset:()=>Promise.resolve().then(() => (dt(),{})).then((e)=>Ei),setup:()=>Promise.resolve().then(() => (En(),{})).then((e)=>Li),ci:()=>Promise.resolve().then(() => (Fe(),{})).then((e)=>Wi),"ci:lint":()=>Promise.resolve().then(() => (On(),{})).then((e)=>Ji),"ci:local":()=>Promise.resolve().then(() => (In(),{})).then((e)=>Ki),gitleaks:()=>Promise.resolve().then(() => (Pn(),{})).then((e)=>Xi),trivy:()=>Promise.resolve().then(() => (Dn(),{})).then((e)=>ar),codeql:()=>Promise.resolve().then(() => (jn(),{})).then((e)=>cr),native:()=>Promise.resolve().then(() => (no(),{})).then((e)=>ta),e2e:()=>Promise.resolve().then(() => (so(),{})).then((e)=>sa),unocss:()=>Promise.resolve().then(() => (ao(),{})).then((e)=>da),pages:()=>Promise.resolve().then(() => (mo(),{})).then((e)=>Ea),skills:()=>Promise.resolve().then(() => (bo(),{})).then((e)=>Ma),badges:()=>Promise.resolve().then(() => (wo(),{})).then((e)=>Ga),docs:()=>Zo().then(() => ({})).then((e)=>fc)},bc=l({meta:{name:"m",version:"0.1.0",description:"Unified monorepo toolchain CLI"},subCommands:hc});it(bc);

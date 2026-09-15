#!/usr/bin/env bun
// @bun
var as=Object.create;var{getPrototypeOf:cs,defineProperty:Vt,getOwnPropertyNames:ls}=Object;var Ut=Object.prototype.hasOwnProperty;function ps(e){return this[e]}var us,ms,bc=(e,t,n)=>{var o=e!=null&&typeof e==="object";if(o){var s=t?us??=new WeakMap:ms??=new WeakMap,i=s.get(e);if(i)return i}n=e!=null?as(cs(e)):{};let r=t||!e||!e.__esModule||!Ut.call(e,"default")?Vt(n,"default",{value:e,enumerable:!0}):n;if(e&&typeof e==="object"||typeof e==="function"){for(let a of ls(e))if(!Ut.call(r,a))Vt(r,a,{get:ps.bind(e,a),enumerable:!0})}if(o)s.set(e,r);return r};var vc=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var f=(e,t,n)=>()=>{if(e)try{t=e(e=0)}catch(o){n=[o]}if(n)throw n[0];return t};function fs(e=""){if(ds.test(e))return;return e!==e.toLowerCase()}function Ht(e,t){let n=t??gs,o=[];if(!e||typeof e!=="string")return o;let s="",i,r;for(let a of e){let c=n.includes(a);if(c===!0){o.push(s),s="",i=void 0;continue}let u=fs(a);if(r===!1){if(i===!1&&u===!0){o.push(s),s=a,i=u;continue}if(i===!0&&u===!1&&s.length>1){let p=s.at(-1);o.push(s.slice(0,Math.max(0,s.length-1))),s=p+a,i=u;continue}}s+=a,i=u,r=c}return o.push(s),o}function hs(e){return e?e[0].toUpperCase()+e.slice(1):""}function bs(e){return e?e[0].toLowerCase()+e.slice(1):""}function vs(e,t){return e?(Array.isArray(e)?e:Ht(e)).map((n)=>hs(t?.normalize?n.toLowerCase():n)).join(""):""}function ye(e,t){return bs(vs(e||"",t))}function Pe(e,t){return e?(Array.isArray(e)?e:Ht(e)).map((n)=>n.toLowerCase()).join(t??"-"):""}function qt(e){return Pe(e||"","_")}var ds,gs;var Wt=f(()=>{ds=/\d/,gs=["-","_","/","."]});import{parseArgs as ys}from"util";function we(e){if(Array.isArray(e))return e;return e===void 0?[]:[e]}function st(e,t=""){let n=[];for(let o of e)for(let[s,i]of o.entries())n[s]=Math.max(n[s]||0,i.length);return e.map((o)=>o.map((s,i)=>t+s[i===0?"padStart":"padEnd"](n[i])).join("  ")).join(`
`)}function _(e){return typeof e==="function"?e():e}function ws(e=[],t={}){let n=new Set(t.boolean||[]),o=new Set(t.string||[]),s=t.alias||{},i=t.default||{},r=new Map,a=new Map;for(let[d,h]of Object.entries(s)){let T=h;for(let B of T){if(r.set(d,B),!a.has(B))a.set(B,[]);if(a.get(B).push(d),r.set(B,d),!a.has(d))a.set(d,[]);a.get(d).push(B)}}let c={};function u(d){if(n.has(d))return"boolean";let h=a.get(d)||[];for(let T of h)if(n.has(T))return"boolean";return"string"}function p(d){if(o.has(d))return!0;let h=a.get(d)||[];for(let T of h)if(o.has(T))return!0;return!1}let w=new Set([...n,...o,...Object.keys(s),...Object.values(s).flat(),...Object.keys(i)]);for(let d of w)if(!c[d])c[d]={type:u(d),default:i[d]};for(let[d,h]of r.entries())if(d.length===1&&c[h]&&!c[h].short)c[h].short=d;let b=[],m={};for(let d=0;d<e.length;d++){let h=e[d];if(h==="--"){b.push(...e.slice(d));break}if(h.startsWith("--no-")){let T=h.slice(5);m[T]=!0;continue}b.push(h)}let C;try{C=ys({args:b,options:Object.keys(c).length>0?c:void 0,allowPositionals:!0,strict:!1})}catch{C={values:{},positionals:b}}let y={_:[]};y._=C.positionals;for(let[d,h]of Object.entries(C.values)){let T=h;if(u(d)==="boolean"&&typeof h==="string")T=h!=="false";else if(p(d)&&typeof h==="boolean")T="";y[d]=T}for(let[d]of Object.entries(m)){y[d]=!1;let h=r.get(d);if(h)y[h]=!1;let T=a.get(d);if(T)for(let B of T)y[B]=!1}for(let[d,h]of r.entries()){if(y[d]!==void 0&&y[h]===void 0)y[h]=y[d];if(y[h]!==void 0&&y[d]===void 0)y[d]=y[h];if(y[d]!==y[h]&&i[h]===y[h])y[h]=y[d]}return y}function xs(e,t){let n={boolean:[],string:[],alias:{},default:{}},o=Yt(t);for(let a of o){if(a.type==="positional")continue;if(a.type==="string"||a.type==="enum")n.string.push(a.name);else if(a.type==="boolean")n.boolean.push(a.name);if(a.default!==void 0)n.default[a.name]=a.default;if(a.alias)n.alias[a.name]=a.alias;let c=ye(a.name),u=Pe(a.name);if(c!==a.name||u!==a.name){let p=we(n.alias[a.name]||[]);if(c!==a.name&&!p.includes(c))p.push(c);if(u!==a.name&&!p.includes(u))p.push(u);if(p.length>0)n.alias[a.name]=p}}let s=ws(e,n),[...i]=s._,r=new Proxy(s,{get(a,c){return a[c]??a[ye(c)]??a[Pe(c)]}});for(let[,a]of o.entries())if(a.type==="positional"){let c=i.shift();if(c!==void 0)r[a.name]=c;else if(a.default===void 0&&a.required!==!1)throw new F(`Missing required positional argument: ${a.name.toUpperCase()}`,"EARG");else r[a.name]=a.default}else if(a.type==="enum"){let c=r[a.name],u=a.options||[];if(c!==void 0&&u.length>0&&!u.includes(c))throw new F(`Invalid value for argument: ${D(`--${a.name}`)} (${D(c)}). Expected one of: ${u.map((p)=>D(p)).join(", ")}.`,"EARG")}else if(a.required&&r[a.name]===void 0)throw new F(`Missing required argument: --${a.name}`,"EARG");return r}function Yt(e){let t=[];for(let[n,o]of Object.entries(e||{}))t.push({...o,name:n,alias:we(o.alias)});return t}async function Cs(e){return Promise.all(e.map((t)=>_(t)))}function l(e){return e}async function q(e,t){let n=await _(e.args||{}),o=xs(t.rawArgs,n),s={rawArgs:t.rawArgs,args:o,data:t.data,cmd:e},i=await Cs(e.plugins??[]),r,a;try{for(let p of i)await p.setup?.(s);if(typeof e.setup==="function")await e.setup(s);let u=await _(e.subCommands);if(u&&Object.keys(u).length>0){let p=zt(t.rawArgs,n),w=t.rawArgs[p];if(w){let b=await at(u,w);if(!b)throw new F(`Unknown command ${D(w)}`,"E_UNKNOWN_COMMAND");await q(b,{rawArgs:t.rawArgs.slice(p+1)})}else{let b=await _(e.default);if(b){if(e.run)throw new F("Cannot specify both 'run' and 'default' on the same command.","E_DEFAULT_CONFLICT");let m=await at(u,b);if(!m)throw new F(`Default sub command ${D(b)} not found in subCommands.`,"E_UNKNOWN_COMMAND");await q(m,{rawArgs:t.rawArgs})}else if(!e.run)throw new F("No command specified.","E_NO_COMMAND")}}if(typeof e.run==="function")r=await e.run(s)}catch(u){a=u}let c=[];if(typeof e.cleanup==="function")try{await e.cleanup(s)}catch(u){c.push(u)}for(let u of[...i].reverse())try{await u.cleanup?.(s)}catch(p){c.push(p)}if(a)throw a;if(c.length===1)throw c[0];if(c.length>1)throw Error("Multiple cleanup errors",{cause:c});return{result:r}}async function rt(e,t,n){let o=await _(e.subCommands);if(o&&Object.keys(o).length>0){let s=zt(t,await _(e.args||{})),i=t[s],r=await at(o,i);if(r)return rt(r,t.slice(s+1),e)}return[e,n]}async function at(e,t){if(t in e)return _(e[t]);for(let n of Object.values(e)){let o=await _(n),s=await _(o?.meta);if(s?.alias){if(we(s.alias).includes(t))return o}}}function zt(e,t){for(let n=0;n<e.length;n++){let o=e[n];if(o==="--")return-1;if(o.startsWith("-")){if(!o.includes("=")&&Ss(o,t))n++;continue}return n}return-1}function Ss(e,t){let n=e.replace(/^-{1,2}/,""),o=ye(n);for(let[s,i]of Object.entries(t)){if(i.type!=="string"&&i.type!=="enum")continue;if(o===ye(s))return!0;if((Array.isArray(i.alias)?i.alias:i.alias?[i.alias]:[]).includes(n))return!0}return!1}async function Qt(e,t){try{console.log(await Zt(e,t)+`
`)}catch(n){console.error(n)}}async function Zt(e,t){let n=await _(e.meta||{}),o=Yt(await _(e.args||{})),s=await _(t?.meta||{}),i=`${s.name?`${s.name} `:""}`+(n.name||process.argv[1]),r=[],a=[],c=[],u=[];for(let m of o)if(m.type==="positional"){let C=m.name.toUpperCase(),y=m.required!==!1&&m.default===void 0;a.push([D(C+it(m)),Jt(m,y)]),u.push(y?`<${C}>`:`[${C}]`)}else{let C=m.required===!0&&m.default===void 0,y=[...(m.alias||[]).map((d)=>`-${d}`),`--${m.name}`].join(", ")+it(m);if(r.push([D(y),Jt(m,C)]),m.type==="boolean"&&(m.default===!0||m.negativeDescription)&&!$s.test(m.name)){let d=[...(m.alias||[]).map((h)=>`--no-${h}`),`--no-${m.name}`].join(", ");r.push([D(d),[m.negativeDescription,C?Le("(Required)"):""].filter(Boolean).join(" ")])}if(C)u.push(`--${m.name}`+it(m))}if(e.subCommands){let m=[],C=await _(e.subCommands);for(let[y,d]of Object.entries(C)){let h=await _((await _(d))?.meta);if(h?.hidden)continue;let T=we(h?.alias),B=[y,...T].join(", ");c.push([D(B),h?.description||""]),m.push(y,...T)}u.push(m.join("|"))}let p=[],w=n.version||s.version;p.push(Le(`${n.description} (${i+(w?` v${w}`:"")})`),"");let b=r.length>0||a.length>0;if(p.push(`${je(De("USAGE"))} ${D(`${i}${b?" [OPTIONS]":""} ${u.join(" ")}`)}`,""),a.length>0)p.push(je(De("ARGUMENTS")),""),p.push(st(a,"  ")),p.push("");if(r.length>0)p.push(je(De("OPTIONS")),""),p.push(st(r,"  ")),p.push("");if(c.length>0)p.push(je(De("COMMANDS")),""),p.push(st(c,"  ")),p.push("",`Use ${D(`${i} <command> --help`)} for more information about a command.`);return p.filter((m)=>typeof m==="string").join(`
`)}function it(e){let t=e.valueHint?`=<${e.valueHint}>`:"",n=t||`=<${qt(e.name)}>`;if(!e.type||e.type==="positional"||e.type==="boolean")return t;if(e.type==="enum"&&e.options?.length)return`=<${e.options.join("|")}>`;return n}function Jt(e,t){let n=t?Le("(Required)"):"",o=e.default===void 0?"":Le(`(Default: ${e.default})`);return[e.description,n,o].filter(Boolean).join(" ")}async function ct(e,t={}){let n=t.rawArgs||process.argv.slice(2),o=t.showUsage||Qt;try{let s=await Rs(e);if(s.help.length>0&&n.some((i)=>s.help.includes(i)))await o(...await rt(e,n)),process.exit(0);else if(n.length===1&&s.version.includes(n[0])){let i=typeof e.meta==="function"?await e.meta():await e.meta;if(!i?.version)throw new F("No version specified","E_NO_VERSION");console.log(i.version)}else await q(e,{rawArgs:n})}catch(s){if(s instanceof F)await o(...await rt(e,n)),console.error(s.message);else console.error(s,`
`);process.exit(1)}}async function Rs(e){let t=await _(e.args||{}),n=new Set,o=new Set;for(let[s,i]of Object.entries(t)){n.add(s);for(let r of we(i.alias))o.add(r)}return{help:Kt("help","h",n,o),version:Kt("version","v",n,o)}}function Kt(e,t,n,o){if(n.has(e)||o.has(e))return[];if(n.has(t)||o.has(t))return[`--${e}`];return[`--${e}`,`-${t}`]}var F,ks,Me=(e,t=39)=>(n)=>ks?n:`\x1B[${e}m${n}\x1B[${t}m`,De,D,Le,je,$s;var Be=f(()=>{Wt();F=class extends Error{code;constructor(e,t){super(e);this.name="CLIError",this.code=t}};ks=(()=>{let e=globalThis.process?.env??{};return e.NO_COLOR==="1"||e.TERM==="dumb"||e.TEST||e.CI})(),De=Me(1,22),D=Me(36),Le=Me(90),je=Me(4,24);$s=/^no[-A-Z]/});var{spawnSync:Xt}=globalThis.Bun;function g(e,t={}){return Xt({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}function en(e,t={}){let n=Xt({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"pipe",stderr:"pipe",stdin:"inherit"});return{exitCode:n.exitCode,output:`${n.stdout.toString()}${n.stderr.toString()}`}}function tn(e,t="",n=15){let o=t.split(`
`).map((i)=>i.trimEnd()).filter((i)=>i.length>0).slice(-n).join(`
`),s=o?`${e}
${o}`:e;if(console.error(`::error::${s.replace(/%/g,"%25").replace(/\n/g,"%0A").replace(/\r/g,"%0D")}`),!process.env.GITHUB_ACTIONS)console.error(s)}function N(e){return l({meta:{name:e.name,version:e.version??"1.0.0",description:e.description},subCommands:e.subCommands,args:{[e.argsName??"args"]:{type:"positional",description:e.argsDescription??"Extra args passed to underlying tool",required:!1}},run(){let t=v(e.name),n=e.configArgs??[],o=e.passthrough?[e.binPath,...t]:e.configArgsPlacement==="append"?[e.binPath,...t,...n]:[e.binPath,...n,...t];process.exit(g(o))}})}function V(e){let t=e.argsDescription?{args:{args:{type:"positional",description:e.argsDescription,required:!1}}}:{};return l({meta:{name:e.name,description:e.description},...t,run(){let n=v(e.name),o=n.length===0&&e.defaultArgs?e.defaultArgs:n;process.exit(e.spawn([...e.prefixArgs??[],...o]))}})}function v(e){let t=process.argv.slice(2),n=t.lastIndexOf(e);return n===-1?t:t.slice(n+1)}var k=f(()=>{Be();Be()});import{existsSync as sn,readFileSync as rn}from"fs";import{dirname as an,join as pe}from"path";function U(e=import.meta.dir){let t=nn.get(e);if(t!==void 0)return t;let n=e;while(!0){let o=pe(n,"package.json");if(sn(o))try{if(JSON.parse(rn(o,"utf8")).name===lt)return nn.set(e,n),n}catch{}let s=an(n);if(s===n)break;n=s}throw Error(`Could not locate the ${lt} package root: walked up from ${e} to the filesystem root without finding a package.json named "${lt}". This module ships inside that package, so either it was copied out of the package or the package was renamed without updating PKG_NAME in src/utils/paths.ts.`)}function cn(e=process.cwd()){let t=on.get(e);if(t!==void 0)return t;let n=e;while(!0){let o=pe(n,"package.json");if(sn(o))try{if(JSON.parse(rn(o,"utf8")).workspaces)return on.set(e,n),n}catch{}let s=an(n);if(s===n)return e;n=s}}function te(){return pe(U(),"src","configs")}function P(e){return pe(te(),e)}function Ge(...e){return pe(U(),"src",...e)}function ln(){return pe(U(),"skills")}var lt="@myorg/tooling",nn,on,Ts="packages/tooling",Oc;var I=f(()=>{nn=new Map;on=new Map;Oc=`${Ts}/src/configs`});var As,Es;var pn=f(()=>{I();k();As=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Es=N({name:"lint",version:"1.0.0",description:"Lint and format check (Biome, shared config)",binPath:As,configArgs:["check",`--config-path=${te()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to check (default: whole repo)"})});var _s,Os;var un=f(()=>{I();k();_s=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Os=N({name:"lint:fix",version:"1.0.0",description:"Lint and format, applying safe fixes (Biome, shared config)",binPath:_s,configArgs:["check","--write",`--config-path=${te()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to fix (default: whole repo)"})});var Is,Ns;var mn=f(()=>{I();k();Is=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Ns=N({name:"biome",version:"1.0.0",description:"Biome with baked config path \u2014 lint and format, no root biome.json needed",binPath:Is,configArgs:[`--config-path=${te()}`],configArgsPlacement:"append",argsName:"command",argsDescription:"Biome command (check, lint, format, etc.)"})});var Ps,Ds;var dn=f(()=>{k();Ps=Bun.fileURLToPath(import.meta.resolve("typescript/package.json").replace("package.json","bin/tsc")),Ds=N({name:"typecheck",version:"1.0.0",description:"TypeScript wrapper \u2014 tsc owned by @myorg/tooling, use m typecheck not tsc",binPath:"bun",configArgs:[Ps],argsName:"args",argsDescription:"tsc args"})});var js,Ls;var gn=f(()=>{I();k();js=Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));process.env.TURBO_GLOBAL_WARNING_DISABLED="1";Ls=N({name:"turbo",version:"1.0.0",description:"Turbo with baked root config \u2014 no root turbo.json needed, uses turbo.base.json",binPath:"bun",configArgs:[js,`--root-turbo-json=${P("turbo.base.json")}`],argsName:"task",argsDescription:"Turbo task (build, dev, test, typecheck, etc.)"})});import{existsSync as Ms,readFileSync as fn}from"fs";var{Glob:Bs}=globalThis.Bun;function Gs(){try{let e=JSON.parse(fn("package.json","utf8")),t=Array.isArray(e.workspaces)?e.workspaces.filter((n)=>typeof n==="string"):[];if(t.length>0)return t}catch{}return["packages/*","apps/*"]}function Fs(){let e=[];for(let t of Gs())for(let n of new Bs(`${t}/package.json`).scanSync("."))try{if(JSON.parse(fn(n,"utf8")).private===!0)continue;let s=n.replace("/package.json","");if(Ms(`${s}/package.json`))e.push(s)}catch{}return e.sort()}var pt,Vs,Us,Hs;var ut=f(()=>{k();pt=l({meta:{name:"health",description:"publint + arethetypeswrong over every publishable package"},run(){let e=Fs();if(e.length===0)console.log("\u2139\uFE0F No publishable packages \u2014 skipping package health checks"),process.exit(0);console.log(`\uD83D\uDD28 Building before health checks (${e.length} package(s))`);let t=g(["bun","run","build"]);if(t!==0)console.error("::error::build failed, cannot run package health checks"),process.exit(t);let n=0;for(let o of e){if(console.log(`
\uD83D\uDCE6 ${o}`),g(["bunx","--yes","publint",o])!==0)console.error(`::error::publint failed for ${o}`),n++;if(g(["bunx","--yes","@arethetypeswrong/cli","--pack",".","--profile","esm-only"],{cwd:o})!==0)console.error(`::error::arethetypeswrong failed for ${o}`),n++}if(n>0)console.error(`
::error::${n} package health check(s) failed`),process.exit(1);console.log(`
\u2705 Package health OK (${e.length} package(s))`),process.exit(0)}}),Vs=Bun.fileURLToPath(import.meta.resolve("bunup/package.json").replace("package.json","dist/cli/index.js")),Us=N({name:"build",version:"1.0.0",description:"Bunup wrapper \u2014 bundler owned by @myorg/tooling, use m build not bunup",binPath:"bun",configArgs:[Vs],argsName:"entry",argsDescription:"Entry files or bunup args",subCommands:{health:pt}}),Hs=Us});var qs;var hn=f(()=>{ut();qs=pt});import{existsSync as bn,readdirSync as Ws,rmSync as Js}from"fs";var{which:Ks}=globalThis.Bun;async function vn(){if(!Ks("bun"))console.error("m bun coverage needs `bun` on PATH."),process.exit(1);console.log(`Running per-package coverage via turbo...
`),process.exit(g([...Ys,"coverage"]))}function yn(){let e=["apps","packages","configs"],t=0;for(let n of e){if(!bn(n))continue;for(let o of Ws(n,{withFileTypes:!0})){if(!o.isDirectory())continue;let s=`${n}/${o.name}/node_modules`;if(!bn(s))continue;Js(s,{recursive:!0,force:!0}),t++}}console.log(`\uD83E\uDDF9 Removed ${t} workspace node_modules dir(s) (root node_modules kept)`)}var mt,Ys,ne,zs,Qs,Zs,ke,Xs,ei,ti,ni,oi,si;var wn=f(()=>{I();k();mt=P("bunfig.toml"),Ys=["bun",`${U()}/src/cli.ts`,"turbo"];ne=v("bun"),zs=["coverage","test","clean:modules"],Qs=ne.includes("--help")||ne.includes("-h"),Zs=ne.includes("--version")||ne.includes("-v"),ke=ne[0],Xs=process.argv.slice(2).includes("bun");if(Xs&&ke&&!zs.includes(ke)&&!ke.startsWith("-")&&!Qs&&!Zs){let e=ke==="test"?["bun",ke,`--config=${mt}`,...ne.slice(1)]:["bun",...ne];process.exit(g(e))}ei=l({meta:{name:"coverage",description:"Run per-package coverage via turbo then merge LCOV"},run:async()=>{await vn()}}),ti=l({meta:{name:"clean:modules",description:"Remove workspace node_modules dirs (keeps the root one)"},run(){yn(),process.exit(0)}}),ni=l({meta:{name:"test",description:"Run bun test with shared bunfig.toml config"},run(){let e=v("test");process.exit(g(["bun","test",`--config=${mt}`,...e]))}}),oi=l({meta:{name:"bun",version:"1.0.0",description:"Bun wrapper \u2014 injects shared bunfig.toml for test, provides coverage merging"},subCommands:{coverage:ei,test:ni,"clean:modules":ti},async run(){let e=v("bun"),t=e[0];if(t==="coverage"){await vn();return}if(t==="clean:modules")yn(),process.exit(0);let n=t==="test"?["bun",t,`--config=${mt}`,...e.slice(1)]:["bun",...e];process.exit(g(n))}}),si=oi});var ii;var kn=f(()=>{I();k();ii=l({meta:{name:"test",description:"Run bun test with the shared bunfig.toml config"},args:{args:{type:"positional",description:"Extra args for bun test",required:!1}},run(){let e=process.argv.slice(2),t=e.lastIndexOf("test"),n=t===-1?[]:e.slice(t+1);process.exit(g(["bun","test",`--config=${P("bunfig.toml")}`,...n]))}})});var S="coverage/lcov.info",ue="coverage/rust-lcov.info",W="coverage/html",xe=80;var xn=()=>{};import{existsSync as j,mkdirSync as Sn,readdirSync as ri,readFileSync as $n,renameSync as dt,writeFileSync as ai}from"fs";import{dirname as ci,join as Cn}from"path";var{which:li}=globalThis.Bun;function J(e){return Boolean(li(e))}function Fe(e=S){if(!j(e))return null;let t=0,n=0;for(let o of $n(e,"utf8").split(`
`))if(o.startsWith("LF:"))n+=Number(o.slice(3));else if(o.startsWith("LH:"))t+=Number(o.slice(3));if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function ui(e){let t=0,n=0;for(let o of e){let s=Fe(o);if(!s)continue;t+=s.hit,n+=s.found}if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function Tn(){return`{${[...Rn].join(",")}}/*/coverage/lcov.info`}function An(e="."){let t=new Bun.Glob(Tn());return Array.from(t.scanSync({cwd:e})).filter(Boolean).map((n)=>e==="."?n:`${e}/${n}`).sort()}function mi(e,t){return e>=t}function di(e="."){let t=[];for(let n of[...Rn]){let o=Cn(e,n);if(!j(o))continue;for(let s of ri(o,{withFileTypes:!0})){if(!s.isDirectory())continue;let i=Cn(o,s.name,"package.json");if(!j(i))continue;let r;try{r=JSON.parse($n(i,"utf8"))}catch{continue}if(!r.name||!(r.scripts?.test||r.scripts?.coverage))continue;t.push({name:r.name.replace(/^@[^/]+\//,""),dir:`${n}/${s.name}`})}}return t.sort((n,o)=>n.dir.localeCompare(o.dir))}function gi(e,t){let n=["# Generated by `m coverage sync` (packages/tooling) \u2014 do not edit.","# Refreshed on every `bun install` (prepare) and by `bun run docs:sync`.","codecov:","  require_ci_to_pass: true","  notify:","    wait_for_ci: true","","coverage:","  precision: 2","  round: down",'  range: "70...100"',"  status:","    # Overall monorepo gate \u2014 mirrors COVERAGE_THRESHOLD.","    project:","      default:",`        target: ${t}%`,"        threshold: 1%","    # Patch coverage on PRs.","    patch:","      default:",`        target: ${t}%`,"        threshold: 5%","","flag_management:","  default_rules:","    carryforward: true","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 1%","","component_management:","  default_rules:","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 2%","  individual_components:"];for(let o of e)n.push(`    - component_id: ${o.name}`,`      name: ${o.dir}`,"      paths:",`        - "${o.dir}/**"`);return n.push("","comment:",'  layout: "reach,diff,flags,components,tree"',"  behavior: default","  require_changes: true","  show_carryforward_flags: true",""),n.join(`
`)}function fi(e,t){let n=(o)=>o?`${o.percent.toFixed(2)}% (${o.hit}/${o.found})`:"\u2014";return["## \uD83D\uDCCA Coverage Summary","","| Package | Lines |","|---------|-------|",...e.map((o)=>`| \`${o.dir}\` | ${n(o.totals)} |`),...t?[`| **merged** | **${n(t)}** |`]:[],""].join(`
`)}function En(){if(J("lcov")&&J("genhtml")){console.log("\u2705 lcov already installed");return}let e=1;if(process.platform==="darwin")e=g(["brew","install","lcov"]);else{let t=J("sudo")?["sudo","apt-get"]:["apt-get"];e=g([...t,"update"])===0?g([...t,"install","-y","lcov"]):1}if(e===0)console.log("\u2705 lcov installed");else console.warn("\u26A0\uFE0F lcov install failed \u2014 HTML reports will be skipped (threshold check still runs)")}function _n(e=W){if(!j(S)){console.warn(`\u26A0\uFE0F ${S} not found \u2014 skipping HTML report`);return}if(!J("genhtml")){console.warn("\u26A0\uFE0F genhtml not found \u2014 run `m coverage setup` first (HTML report skipped)");return}Sn(e,{recursive:!0});let t=g(["genhtml",S,"--output-directory",e,"--title","Coverage Report","--show-details","--highlight","--legend"]);if(t===0)console.log(`
\u2705 HTML report: ${e}/index.html`);process.exit(t)}var pi,Rn,hi,bi,vi,yi,wi,ki,xi,Ci,Si,$i;var On=f(()=>{k();xn();pi=`${W}/index.html`;Rn=["packages","apps"];hi=l({meta:{name:"setup",description:"Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)"},run(){En(),process.exit(0)}}),bi=l({meta:{name:"html",description:"Generate HTML report via genhtml from coverage/lcov.info"},args:{out:{type:"string",description:`Output directory (default: ${W})`,default:W}},run({args:e}){_n(e.out||W),process.exit(0)}}),vi=l({meta:{name:"check",description:`Check coverage threshold (default ${xe}%) against coverage/lcov.info`},args:{threshold:{type:"string",description:"Threshold percent",default:String(xe)}},run({args:e}){let t=Fe();if(!t){console.warn(`\u26A0\uFE0F ${S} not found or has no line data \u2014 skipping threshold check`);return}let n=Number(e.threshold??xe),o=t.percent;if(console.log(`Line coverage: ${o.toFixed(2)}% (${t.hit}/${t.found} lines) \u2014 threshold ${n}%`),!mi(o,n))console.error(`::error::Coverage ${o.toFixed(2)}% is below ${n}% threshold`),process.exit(1);console.log(`\u2705 Coverage ${o.toFixed(2)}% meets threshold`),process.exit(0)}}),yi=l({meta:{name:"collect",description:"Collect JS coverage (bun run coverage) + Rust coverage (m native llvm-cov), then merge"},run(){if(g(["bun","run","coverage"]),!j("packages/native/Cargo.toml")||!J("cargo-llvm-cov"))console.warn("\u26A0\uFE0F cargo-llvm-cov not installed \u2014 skipping Rust coverage"),process.exit(0);if(console.log("\uD83E\uDD80 Collecting Rust coverage via m native llvm-cov"),g(["m native","llvm-cov","--lcov","--output-path",`../../${ue}`]),!j(ue))process.exit(0);if(!j(S))dt(ue,S),process.exit(0);if(J("lcov")){if(g(["lcov","--add-tracefile",S,"--add-tracefile",ue,"--output-file","coverage/merged.lcov"])===0)dt("coverage/merged.lcov",S),console.log("\u2705 Merged Rust + JS coverage"),process.exit(0)}console.warn(`\u26A0\uFE0F lcov not available \u2014 Rust coverage kept at ${ue}`)}}),wi=l({meta:{name:"pages",description:"Publish the HTML report into the Pages artifact dir (served at /coverage/)"},async run(){if(!j(S))console.log("\u2139\uFE0F No coverage data \u2014 collecting first"),g(["bun","run","coverage"]);if(!j(S))console.warn("\u26A0\uFE0F Still no coverage/lcov.info \u2014 skipping Pages coverage"),process.exit(0);if(En(),_n(),!j(pi))console.warn(`\u26A0\uFE0F No HTML report at ${W} \u2014 skipping Pages coverage`),process.exit(0);console.log(`\u2705 Coverage HTML ready at ${W}/ \u2014 \`m pages build\` folds it into the Pages artifact (served at /coverage/)`),process.exit(0)}}),ki=l({meta:{name:"merge",description:"Merge per-package lcov.info reports into coverage/lcov.info"},args:{output:{type:"string",description:"Merged output file (default: coverage/lcov.info)",default:S},reportOnly:{type:"boolean",description:"Print the merged totals and the delta, write nothing",default:!1}},run({args:e}){let t=An(".");if(t.length===0)console.warn("No per-package lcov.info found \u2014 nothing to merge"),process.exit(0);let n=e.output||S;if(e.reportOnly){let r=ui(t),a=r?`${r.percent.toFixed(2)}% (${r.hit}/${r.found} lines)`:"no data";console.log("Report-only: the merge would measure"),console.log(`  ${t.length} report(s) \u2192 ${a}`),process.exit(0)}Sn(ci(n),{recursive:!0}),console.log(`Merging ${t.length} report(s) \u2192 ${n}`);let o=null;try{o=Bun.fileURLToPath(import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"))}catch{o=null}if(o){if(g(["bun",o,Tn(),n,"--prepend-source-files"])===0)console.log(`\u2705 Merged: ${n}`),process.exit(0);console.warn("\u26A0\uFE0F lcov-result-merger failed \u2014 falling back to lcov --add-tracefile")}if(!J("lcov"))console.error("\u274C lcov not found \u2014 run `m coverage setup` first"),process.exit(1);let s="coverage/merged.lcov",i=t.flatMap((r)=>["--add-tracefile",r]).concat(["--output-file",s]);if(g(["lcov",...i])!==0)console.error("\u274C Coverage merge failed"),process.exit(1);dt(s,n),console.log(`\u2705 Merged: ${n}`),process.exit(0)}}),xi=l({meta:{name:"summary",description:"Show coverage summary (--json for scripts, --markdown for step summaries)"},args:{json:{type:"boolean",description:"Print JSON instead of a human-readable line"},markdown:{type:"boolean",description:"Print a per-package markdown table (for $GITHUB_STEP_SUMMARY)"}},run({args:e}){let t=Fe();if(e.markdown){let n=An(".").map((o)=>({dir:o.replace(/\/coverage\/lcov\.info$/,""),totals:Fe(o)}));console.log(fi(n,t)),process.exit(0)}if(e.json)console.log(JSON.stringify({source:S,available:Boolean(t),lines:{hit:t?.hit??0,found:t?.found??0,percent:t?Number(t.percent.toFixed(2)):0}})),process.exit(0);if(J("lcov")&&j(S))process.exit(g(["lcov","--summary",S]));if(!t)console.warn(`\u26A0\uFE0F ${S} not found`),process.exit(0);console.log(`lines: ${t.percent.toFixed(1)}% (${t.hit}/${t.found})`),process.exit(0)}}),Ci=l({meta:{name:"sync",description:"Regenerate the root codecov.yml from the workspace package list"},args:{output:{type:"string",description:"Output file (default: codecov.yml)",default:"codecov.yml"}},run({args:e}){let t=e.output||"codecov.yml",n=di(".");ai(t,gi(n,xe)),console.log(`\u2705 ${t} \u2014 ${n.length} component(s): ${n.map((o)=>o.dir).join(", ")}`),process.exit(0)}}),Si=l({meta:{name:"m coverage",version:"1.0.0",description:"Coverage reporting \u2014 collect, merge, HTML, threshold check, Codecov, Pages publishing"},subCommands:{setup:hi,collect:yi,html:bi,check:vi,pages:wi,merge:ki,summary:xi,sync:Ci},run(){console.log(`
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
`)}}),$i=Si});import{mkdir as Ri}from"fs/promises";var{file:gt,write:Ti}=globalThis.Bun;async function ht(e="changeset"){if(e!=="changeset")throw Error(`Unknown init target '${e}' (expected "changeset")`);let t=".changeset/config.json",n=P("changeset.config.json");if(await gt(t).exists()){console.log("Changeset config already exists; skipping.");return}if(!await gt(n).exists())return;await Ri(".changeset",{recursive:!0}),await Ti(t,await gt(n).text())}var In,me,Ai,ft,Ei,_i,Oi,Ii,Ni,Pi;var bt=f(()=>{I();k();In=Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js")),me=v("changeset"),Ai=["init"],ft=me[0],Ei=me.includes("--help")||me.includes("-h"),_i=me.includes("--version")||me.includes("-v"),Oi=process.argv.slice(2).includes("changeset");if(Oi&&ft&&!Ai.includes(ft)&&!ft.startsWith("-")&&!Ei&&!_i)process.exit(g(["bun",In,...me]));Ii=l({meta:{name:"init",description:"Ensure .changeset/config.json exists from shared template"},args:{target:{type:"positional",description:"Init target (default: changeset)",required:!1,default:"changeset"}},async run({args:e}){await ht(e.target??"changeset"),process.exit(0)}}),Ni=l({meta:{name:"changeset",version:"1.0.0",description:"Changesets wrapper \u2014 init config and delegate to @changesets/cli"},subCommands:{init:Ii},run(){process.exit(g(["bun",In,...v("changeset")]))}}),Pi=Ni});function Ve(e){return Bun.which(e)}function Nn(e){return Ve(K[e].bin)!==null}function oe(e){console.warn(`\u26A0\uFE0F  ${e.label} not found \u2014 skipping ${e.purpose}.`),console.warn("   Install it to enable this step:");for(let t of e.install)console.warn(`     ${t}`);return console.warn("   Continuing: this step is optional locally and CI installs it."),0}function Y(e,t){let n=K[e],o=Ve(n.bin);if(!o)return oe(n);return t(o)}var K;var de=f(()=>{K={actionlint:{bin:"actionlint",label:"actionlint",purpose:"local GitHub Actions workflow validation",install:["brew install actionlint","go install github.com/rhysd/actionlint/cmd/actionlint@latest","bun install --force          # retries the github-actionlint download"]},act:{bin:"act",label:"act",purpose:"running GitHub Actions workflows locally",install:["brew install act","sudo apt install act","go install github.com/nektos/act@latest"]},gitleaks:{bin:"gitleaks",label:"gitleaks",purpose:"secret scanning",install:["brew install gitleaks","https://github.com/gitleaks/gitleaks#installing"]},trivy:{bin:"trivy",label:"trivy",purpose:"vulnerability scanning",install:["brew install trivy","https://trivy.dev/latest/getting-started/installation/"]},cargo:{bin:"cargo",label:"Rust toolchain (cargo)",purpose:"native Rust workspace tasks",install:["rustup \u2014 https://rustup.rs"]},lcov:{bin:"lcov",label:"lcov",purpose:"merging coverage reports",install:["bun run m coverage setup"]},genhtml:{bin:"genhtml",label:"genhtml",purpose:"rendering the HTML coverage report",install:["bun run m coverage setup"]},commitlint:{bin:"commitlint",label:"commitlint",purpose:"Conventional Commits validation",install:["bun install          # @commitlint/cli is a workspace devDependency"]}}});import{existsSync as Dn}from"fs";import{join as Di}from"path";function ji(){let e=Di(U(),"node_modules",".bin","commitlint");if(Dn(e))return e;return Ve("commitlint")}function Li(e){let t=ji();if(!t)return oe(K.commitlint);return g([t,"--config",P("commitlint.config.cjs"),...e])}var Pn=`
m commitlint \u2014 Conventional Commits validation

Usage:
  m commitlint <file>    # validate the message in <file> (what the hook does)
  m commitlint           # validate a message piped on stdin

The commit-msg hook calls this as \`m commitlint {1}\`, where {1} is the path
git handed the hook. It cannot move to pre-commit: git passes pre-commit no
arguments at all and the message does not exist yet, so commit-msg is the
earliest hook that can see it.
`,Mi,Bi;var jn=f(()=>{I();k();de();Mi=l({meta:{name:"commitlint",version:"1.0.0",description:"Conventional Commits validation \u2014 defensive (skips if commitlint is missing)"},args:{file:{type:"positional",description:"Commit message file; omit to read the message from stdin",required:!1}},run(){let e=v("commitlint");if(e.includes("--help")||e.includes("-h"))console.log(Pn),process.exit(0);let t=e[0];if(t!==void 0&&!Dn(t))console.error(`\u274C commit message file not found: ${t}`),process.exit(1);if(!t&&process.stdin.isTTY)console.log(Pn),process.exit(0);process.exit(Li(t?["--edit",t]:[]))}}),Bi=Mi});import{readdir as Gi}from"fs/promises";import{join as Fi}from"path";var{$:Ln,write:Vi}=globalThis.Bun;async function vt(e="lefthook"){if(e!=="lefthook")throw Error(`Unknown setup target '${e}' (expected "lefthook")`);await Vi("lefthook.yml",`extends:
  - ${"node_modules/@myorg/tooling/src/configs/lefthook.base.yml"}
`);let n=await Ln`bunx lefthook install`.quiet().nothrow();if(n.exitCode!==0){let s=n.stderr.toString().trim();if(console.warn("\u26A0\uFE0F lefthook install failed \u2014 Git hooks are not active."),s)console.warn(`   ${s.split(`
`).join(`
   `)}`);console.warn("   Re-run manually with: m setup lefthook");return}let o=await Ui();if(o.length===0){console.warn("\u26A0\uFE0F lefthook installed no hooks \u2014 is this a Git repository?");return}console.log(`\u2705 lefthook hooks active: ${o.join(", ")}`)}async function Ui(){let e;try{e=await Gi(Fi(await Hi(),"hooks"))}catch{return[]}return e.filter((t)=>!t.endsWith(".sample")&&!t.endsWith(".old")).sort()}async function Hi(){let e=await Ln`git rev-parse --git-dir`.quiet().nothrow();if(e.exitCode!==0)return".git";return e.stdout.toString().trim()||".git"}var qi,Wi,Ji,Ki;var Mn=f(()=>{k();qi=l({meta:{name:"lefthook",description:"Regenerate lefthook.yml wrapper and install Git hooks"},args:{target:{type:"positional",description:"Setup target (default: lefthook)",required:!1,default:"lefthook"}},async run({args:e}){await vt(e.target??"lefthook")}}),Wi=l({meta:{name:"bins",description:"Link m-bins into node_modules/.bin (handled by bun install)"},run(){console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.")}}),Ji=l({meta:{name:"setup",version:"1.0.0",description:"Setup CLI \u2014 regenerates lefthook.yml, installs hooks, ensures changeset config"},subCommands:{lefthook:qi,bins:Wi},args:{target:{type:"positional",description:"Target (lefthook, bins, or empty for full setup)",required:!1}},async run({args:e}){let t=v("setup"),n=e.target??t[0]??"lefthook";if(n==="lefthook"){await vt("lefthook");return}if(n==="bins")return;await vt("lefthook");await Promise.resolve().then(() => bt());await ht("changeset").catch(()=>{})}}),Ki=Ji});import{existsSync as Bn}from"fs";import{homedir as Yi}from"os";import{join as Gn}from"path";function Zi(){try{let e=Bun.fileURLToPath(import.meta.resolve("github-actionlint/package.json"));return Bun.file(e).json().version??null}catch{return null}}function Xi(){let e=process.env.ACTIONLINT_BIN;if(e&&Bn(e))return e;let t=Bun.which("actionlint");if(t)return t;let n=process.env.ACTIONLINT_CACHE_DIR??Gn(Yi(),".github-actionlint","bin"),o=Zi();if(o){let s=Gn(n,o,process.platform==="win32"?"actionlint.exe":"actionlint");if(Bn(s))return s}return null}function yt(e){let t=e.includes("--if-installed"),n=e.filter((s)=>s!=="--if-installed"),o=Xi();if(!o){if(t)return oe(K.actionlint);return console.error(Qi),1}return g([o,`-config-file=${P("actionlint.yaml")}`,...n])}function Ue(e){return Y("act",(t)=>g([t,...zi,...e]))}var zi,Qi=`
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
`,er,tr,nr,or;var He=f(()=>{I();k();de();zi=["-P","ubuntu-latest=catthehacker/ubuntu:act-latest","--container-architecture","linux/amd64"];er=V({name:"lint",description:"Validate workflows via actionlint with shared config",argsDescription:"Extra args for actionlint",spawn:yt}),tr=V({name:"act",description:"Run GitHub Actions locally via act with baked-in flags",argsDescription:"Extra args for act",spawn:Ue}),nr=l({meta:{name:"ci",version:"1.0.0",description:"CI tooling for GitHub Actions \u2014 lint workflows and run locally with act"},subCommands:{lint:er,act:tr},run(){let e=v("ci");if(e.length>0&&e[0]?.startsWith("-"))Ue(e);else console.log(`
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
`)}}),or=nr});var sr;var Fn=f(()=>{k();He();sr=l({meta:{name:"ci:lint",description:"Validate workflows via actionlint with shared config"},args:{args:{type:"positional",description:"Extra args for actionlint",required:!1}},run(){process.exit(yt(v("ci:lint")))}})});var ir;var Vn=f(()=>{k();He();ir=l({meta:{name:"ci:local",description:"Run the push workflow locally via act"},args:{args:{type:"positional",description:"Extra args for act",required:!1}},run(){process.exit(Ue(["push",...v("ci:local")]))}})});function wt(e){return Y("gitleaks",(t)=>g([t,...e]))}var rr,ar,cr,lr;var Un=f(()=>{k();de();rr=V({name:"detect",description:"gitleaks detect --source . --no-git (scan repo)",prefixArgs:["detect"],defaultArgs:["--source",".","--no-git","--verbose"],spawn:wt}),ar=V({name:"protect",description:"gitleaks protect --staged (scan staged changes, pre-commit)",prefixArgs:["protect"],defaultArgs:["--staged","--verbose"],spawn:wt}),cr=l({meta:{name:"gitleaks",version:"1.0.0",description:"Gitleaks wrapper \u2014 secret scanning, defensive (skips if binary missing)"},subCommands:{detect:rr,protect:ar},run(){let e=v("gitleaks");if(e.length===0)console.log(`
m gitleaks \u2014 secret scanning wrapper

Usage:
  m gitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  m gitleaks protect [args]  # scan staged (default: --staged --verbose)

Install:
  brew install gitleaks
  go install github.com/gitleaks/gitleaks/v8@latest
  docker pull zricethezav/gitleaks:latest

If gitleaks is not installed, this wrapper warns and exits 0 (does not block).
`),process.exit(0);process.exit(wt(e))}}),lr=cr});import{existsSync as pr}from"fs";var{which:ur}=globalThis.Bun;function xt(e){return Y("trivy",(t)=>g([t,...e]))}var kt="apps/example/Dockerfile",Hn="app:trivy-scan",mr,dr,gr,fr,hr;var qn=f(()=>{k();de();mr=l({meta:{name:"build",description:`docker build -t ${Hn} (image for the trivy image scan)`},run(){if(!pr(kt))console.warn(`\u26A0\uFE0F ${kt} not found \u2014 skipping image build`),process.exit(0);if(!ur("docker"))console.warn("\u26A0\uFE0F docker not found \u2014 skipping image build"),process.exit(0);if(g(["docker","build","-t",Hn,"-f",kt,"."])!==0)console.warn("\u26A0\uFE0F image build failed \u2014 skipping the Trivy image scan");process.exit(0)}}),dr=V({name:"fs",description:"trivy fs . --severity HIGH,CRITICAL (filesystem scan)",prefixArgs:["fs"],defaultArgs:[".","--severity","HIGH,CRITICAL"],spawn:xt}),gr=V({name:"image",description:"trivy image <image> --severity HIGH,CRITICAL (container scan)",prefixArgs:["image"],spawn:xt}),fr=l({meta:{name:"trivy",version:"1.0.0",description:"Trivy wrapper \u2014 vuln scanning, defensive (skips if binary missing)"},subCommands:{fs:dr,image:gr,build:mr},run(){let e=v("trivy");if(e.length===0)console.log(`
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
`),process.exit(0);process.exit(xt(e))}}),hr=fr});var br;var Wn=f(()=>{k();br=l({meta:{name:"codeql",version:"1.0.0",description:"CodeQL wrapper \u2014 info and local guidance (CodeQL runs in GitHub Actions)"},run(){console.log(`
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
`)}})});function A(e,t){let n=t;while(n<e.length&&/\s/.test(e[n]))n++;return n}function Kn(e,t){return e.lastIndexOf(`
`,t)+1}function Ce(e,t){let n=/^[ \t]*/.exec(e.slice(Kn(e,t),t));return n?n[0]:""}function qe(e,t){let n=t+1;while(n<e.length){if(e[n]==="\\"){n+=2;continue}if(e[n]==='"')return n+1;n++}return-1}function se(e,t){let n=e[t];if(n==='"')return qe(e,t);if(n==="{"||n==="["){let s=0,i=t;while(i<e.length){let r=e[i];if(r==='"'){i=qe(e,i);continue}if(r==="{"||r==="[")s++;else if(r==="}"||r==="]"){if(s--,s===0)return i+1}i++}return-1}let o=t;while(o<e.length&&!/[\s,\]}]/.test(e[o]))o++;return o}function Yn(e){let t=A(e,0);return e[t]==="{"?t:-1}function Se(e,t,n){let o=A(e,t+1);while(o<e.length&&e[o]!=="}"){if(e[o]!=='"')return null;let s=qe(e,o);if(s===-1)return null;let i=A(e,s);if(e[i]!==":")return null;let r=A(e,i+1),a=se(e,r);if(a===-1)return null;if(e.slice(o,s)===JSON.stringify(n))return{keyStart:o,valueStart:r,valueEnd:a};if(o=A(e,a),e[o]===",")o=A(e,o+1);else return null}return null}function zn(e,t,n){let o=Kn(e,t);if(e.slice(o,t).trim()!==""){let r=/^[ \t]*,[ \t]*/.exec(e.slice(n));if(r)return e.slice(0,t)+e.slice(n+r[0].length);let a=e.slice(0,t).replace(/[ \t]*,[ \t]*$/,"");return a===e.slice(0,t)?e.slice(0,t)+e.slice(n):`${a}${e.slice(n)}`}let s=/^[ \t]*,[ \t]*\r?\n?/.exec(e.slice(n));if(s)return e.slice(0,o)+e.slice(n+s[0].length);let i=e.slice(0,o).replace(/[ \t]*\n$/,"");if(i.endsWith(","))return`${i.slice(0,-1)}${e.slice(n)}`;return e.slice(0,o)+e.slice(n)}function $t(e){return/\n([ \t]+)\S/.exec(e)?.[1]??"  "}function Ct(e,t,n){let o=e.split(`
`);if(o.length===1)return e;let i=o.slice(1,-1).filter((a)=>a.trim()!=="").reduce((a,c)=>Math.min(a,/^[ \t]*/.exec(c)[0].length),Number.POSITIVE_INFINITY),r=Number.isFinite(i)?i:0;return[o[0],...o.slice(1,-1).map((a)=>a.trim()===""?"":t+n+a.slice(r)),`${t}${o.at(-1).trim()}`].join(`
`)}function Jn(e,t,n,o){let s=$t(e),i=se(e,t)-1,r=Ce(e,i),a=A(e,t+1);if(a===i){let b=`${r}${s}`,m=Ct(o,b,s);return`${e.slice(0,i)}
${b}${JSON.stringify(n)}: ${m}
${r}${e.slice(i)}`}let c=Ce(e,a),u=a,p=a;while(p<i){let b=qe(e,p),m=A(e,b);if(u=se(e,A(e,m+1)),p=A(e,u),e[p]===",")p=A(e,p+1);else break}let w=Ct(o,c,s);return`${e.slice(0,u)},
${c}${JSON.stringify(n)}: ${w}${e.slice(u)}`}function Qn(e,t){let[n,...o]=e,s=o.length===0?t:Qn(o,t);return`{
  ${JSON.stringify(n)}: ${s}
}`}function vr(e,t,n){let o=Ct(n,Ce(e,t.valueStart),$t(e));return e.slice(0,t.valueStart)+o+e.slice(t.valueEnd)}function Rt(e,t,n){let o=t.at(-1);if(o===void 0)return e;let s=We(e,t.slice(0,-1));if(s===-1){let[r,...a]=t,c=Yn(e);if(r===void 0||c===-1)return e;return Jn(e,c,r,Qn(a,n))}let i=Se(e,s,o);return i?vr(e,i,n):Jn(e,s,o,n)}function We(e,t){let n=Yn(e);for(let o of t){if(n===-1)return-1;let s=Se(e,n,o);if(!s||e[s.valueStart]!=="{")return-1;n=s.valueStart}return n}function Zn(e,t,n){return Rt(e,t.split("."),JSON.stringify(n))}function ap(e,t,n){return Rt(e,t.split("."),n.trim())}function Xn(e,t){let n=t.split("."),o=We(e,n.slice(0,-1));if(o===-1)return e;let s=Se(e,o,n.at(-1));return s?zn(e,s.keyStart,s.valueEnd):e}function eo(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=We(e,s.slice(0,-1));if(i===-1)return e;let r=Se(e,i,s.at(-1));if(!r)return Rt(e,s,`[${o}]`);if(e[r.valueStart]!=="[")return e;let a=se(e,r.valueStart)-1,c=A(e,r.valueStart+1);if(c===a){if(!e.slice(r.valueStart,a).includes(`
`))return`${e.slice(0,a)}${o}${e.slice(a)}`;let m=Ce(e,a);return`${e.slice(0,a)}${m}${$t(e)}${o}
${m}${e.slice(a)}`}let u=c,p=c;while(c<a)if(u=c,p=se(e,c),c=A(e,p),e[c]===",")c=A(e,c+1);else break;let b=!e.slice(r.valueStart,a).includes(`
`)?", ":`,
${Ce(e,u)}`;return`${e.slice(0,p)}${b}${o}${e.slice(p)}`}function cp(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=We(e,s.slice(0,-1));if(i===-1)return e;let r=Se(e,i,s.at(-1));if(!r||e[r.valueStart]!=="[")return e;let a=se(e,r.valueStart)-1,c=A(e,r.valueStart+1);while(c<a){let u=se(e,c);if(e.slice(c,u)===o)return zn(e,c,u);if(c=A(e,u),e[c]===",")c=A(e,c+1)}return e}function Tt(e){return JSON.parse(e)}async function At(e,t){let n=Bun.file(e);if(!await n.exists())return!1;let o=await n.text(),s=await t(o);if(s===o)return!1;return await Bun.write(e,s),!0}var Je="@myorg",R="packages/native",to="crates",z="npm",$e=(e)=>`packages/native/crates/${e}`,H=(e)=>`packages/native/npm/${e}`,ge="wasm32-wasip1-threads",Et,Ke;var Ye=f(()=>{Et=[{target:"aarch64-apple-darwin",runner:"macos-latest"},{target:"x86_64-apple-darwin",runner:"macos-13"},{target:"x86_64-pc-windows-msvc",runner:"windows-latest"},{target:"x86_64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"aarch64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64"},{target:"x86_64-unknown-linux-musl",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"wasm32-wasip1-threads",runner:"ubuntu-latest",wasi:!0}],Ke=Et.map((e)=>e.target)});import{existsSync as ie,readdirSync as yr,readFileSync as _t}from"fs";import{dirname as wr,join as Q,resolve as no}from"path";function oo(e=process.cwd()){let t=no(e);for(let n=0;n<32;n++){if(ie(Q(t,"packages","native","Cargo.toml")))return t;let o=wr(t);if(o===t)break;t=o}return no(e)}function so(e){if(!ie(e))return[];return yr(e,{withFileTypes:!0}).filter((t)=>t.isDirectory()).map((t)=>t.name).sort()}function Re(e){let t=Q(e,"packages","native",to),n=Q(e,"packages","native","Cargo.toml"),o=ie(n)?_t(n,"utf8"):"",s=new Set([...o.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm)].map((r)=>r[1]??"")),i=[];for(let r of so(t)){let a=Q(t,r,"Cargo.toml");if(!ie(a))continue;let c=_t(a,"utf8"),u=[...c.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm),...c.matchAll(/^\s*([\w-]+)\.workspace\s*=\s*true/gm)].map((p)=>p[1]??"").filter((p)=>s.has(p)||ie(Q(t,p,"Cargo.toml")));i.push({name:r,dir:$e(r),binding:/crate-type\s*=\s*\[[^\]]*cdylib/.test(c),uses:u})}return i}function ze(e){let t=Q(e,"packages","native",z),n=[];for(let o of so(t)){let s=Q(t,o,"package.json");if(!ie(s))continue;let i;try{i=JSON.parse(_t(s,"utf8"))}catch{continue}if(!i.napi)continue;let r=$e(o);if(!ie(Q(e,r,"Cargo.toml")))continue;n.push({name:o,dir:H(o),crateDir:r,binaryName:i.napi.binaryName??o,targets:i.napi.targets?.length?i.napi.targets:[...Ke]})}return n}function Qe(e){let t=new Set(Re(e).filter((n)=>n.binding).map((n)=>n.name));return ze(e).filter((n)=>t.has(n.name))}var io=f(()=>{Ye()});import{existsSync as kr}from"fs";import{mkdir as Ze,writeFile as G}from"fs/promises";import{join as O}from"path";function xr(e){let t=["[package]",`name    = "${e.name}"`,"version.workspace    = true","edition.workspace    = true","license.workspace    = true","repository.workspace = true",""];if(e.binding)t.push("[lib]","# required \u2014 produces the .node binary napi packages",'crate-type = ["cdylib"]',"","[dependencies]","napi.workspace        = true","napi-derive.workspace = true",...(e.uses??[]).map((n)=>`${`${n}.workspace`.padEnd(22)}= true`),"","[build-dependencies]","napi-build.workspace = true","");else t.push("# Pure Rust \u2014 no napi dependency, no cdylib: testable without a Node runtime.","[dependencies]",...(e.uses??[]).map((n)=>`${n}.workspace = true`),"");return t.push("[lints]","workspace = true",""),t.join(`
`)}function Sr(e){if(!e.binding)return`//! Pure Rust helpers shared by the binding crates.
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
`}function $r(e,t){let n=Xe(t),o=`${n}/${e.name}`,s=(e.uses??[]).length>0;return{name:o,version:"0.0.0",private:!0,type:"module",main:"index.js",types:"index.d.ts",exports:{".":{types:"./index.d.ts",require:"./index.js",import:"./index.js"},"./wasi":{types:"./index.d.ts",require:`./${e.name}.wasi.cjs`,browser:`./${e.name}.wasi-browser.js`}},files:["index.js","index.d.ts","*.node",`${e.name}.wasi.cjs`,`${e.name}.wasi-browser.js`,`${e.name}.wasm`],napi:{binaryName:e.name,packageName:o,targets:[...Ke],wasm:{initialMemory:16,maximumMemory:65536,browser:{fs:!1,asyncInit:!0,errorEvent:!0}}},scripts:{build:`m native napi:build --only ${e.name}`,"build:debug":`m native napi:build:debug --only ${e.name}`,"build:wasm":`m native napi:build:wasm --only ${e.name}`,"create-npm-dirs":`m native create-npm-dirs --only ${e.name}`,artifacts:`m native artifacts --only ${e.name}`,test:"m bun test","test:watch":"m bun test --watch",typecheck:"m typecheck --noEmit","cargo:check":"m native check","cargo:clippy":"m native clippy","cargo:fmt":"m native fmt","cargo:fmt:check":"m native fmt:check","cargo:test":"m native test"},devDependencies:{[`${n}/bun-config`]:"workspace:*",[`${n}/native-config`]:"workspace:*",...s?{[`${n}/native-crates`]:"workspace:*"}:{},[`${n}/ts`]:"workspace:*","@napi-rs/cli":"^3.9.1"}}}function Rr(e){return`{
  "extends": "${e}/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"]
  },
  "include": ["index.d.ts", "tests/**/*"]
}
`}async function ro(e,t,n={}){let o=O(e,$e(t.name));if(await Ze(O(o,"src"),{recursive:!0}),await G(O(o,"Cargo.toml"),xr(t)),await G(O(o,"src","lib.rs"),Sr(t)),t.binding)await G(O(o,"build.rs"),Cr());if(!t.binding)return{crate:o};let s=O(e,H(t.name));return await Ze(s,{recursive:!0}),await G(O(s,"package.json"),`${JSON.stringify($r(t,n),null,2)}
`),await G(O(s,"tsconfig.json"),Rr(Xe(n))),await G(O(s,"turbo.json"),Tr()),await Ze(O(s,"tests"),{recursive:!0}),await G(O(s,"tests",`${t.name}.test.ts`),Ar(t,n)),{crate:o,package:s}}function Er(e,t){return e.replace(/members = \[([\s\S]*?)\]/,(n,o)=>{let s=new Set(o.split(`
`).map((i)=>i.trim()).filter((i)=>i.startsWith('"')).map((i)=>i.replace(/,$/,"")));return s.add(`"crates/${t}"`),`members = [
${[...s].sort().map((i)=>`  ${i},`).join(`
`)}
]`})}async function ao(e,t){let n=O(e,"packages","native","Cargo.toml");if(!kr(n))return;let o=await Bun.file(n).text();if(o.includes(`"crates/${t}"`))return;let s=o.includes("members = [")?Er(o,t):`${o.trimEnd()}

[workspace]
members = [
  "crates/${t}",
]
`;await G(n,s)}function _r(e){return{name:`${Xe(e)}/native-crates`,version:"0.0.0",private:!0,scripts:{build:"m native build --pure",test:"m native test --pure","cargo:check":"m native check --pure","cargo:clippy":"m native clippy --pure","cargo:fmt":"m native fmt --pure","cargo:fmt:check":"m native fmt:check --pure"}}}async function Ot(e,t={}){let n=O(e,"packages","native","crates");return await Ze(n,{recursive:!0}),await G(O(n,"package.json"),`${JSON.stringify(_r(t),null,2)}
`),await G(O(n,"turbo.json"),Or()),n}var Xe=(e)=>e.scope??Je,Cr=()=>`extern crate napi_build;

fn main() {
    napi_build::setup();
}
`,Tr=()=>`{
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
`,Ar=(e,t={})=>{let n=e.name,o=Xe(t),s=(e.uses??[])[0]??"shared",i=(e.uses??[]).length>0,r=`${`${s}.workspace`.padEnd(22)}= true`,a=i?`
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
${a}`},Or=()=>`{
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
`;var co=f(()=>{Ye()});import{existsSync as et}from"fs";import{dirname as Ir,join as Z}from"path";function lo(){if(Nn("cargo"))return!0;return oe(K.cargo),!1}function re(){if(et(Z(It,"Cargo.toml")))return!0;return console.warn(`\u26A0\uFE0F ${R}/Cargo.toml not present, skipping (enable the native config)`),!1}function E(e,t={}){if(!re())return 0;return Y("cargo",()=>{let n=["cargo",...e],{exitCode:o,output:s}=en(n,{cwd:t.cwd??It});if(s)process.stdout.write(s);if(o!==0)tn(`${n.join(" ")} failed (exit ${o})`,s);return o})}function fe(e){if(!e)return[];let t=Re(x).filter((n)=>n.binding).map((n)=>n.name);if(t.length===0)return[];return console.log(`\u2139\uFE0F pure Rust only \u2014 excluding bindings: ${t.join(", ")}`),t.flatMap((n)=>["--exclude",n])}function po(){let e;try{e=Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/package.json"))}catch{console.error("::error::Cannot resolve @napi-rs/cli \u2014 reinstall dependencies "+"(`bun install`), then re-run the native command"),process.exit(1)}let t=Z(Ir(e),"dist","cli.js");if(!et(t))console.error(`::error::@napi-rs/cli is installed but ${t} is missing`),process.exit(1);return t}function Nr(e){return["--cwd",x,"--manifest-path",`${e.crateDir}/Cargo.toml`,"--package-json-path",`${e.dir}/package.json`,"--output-dir",e.dir]}function Te(e,t={},n=()=>[]){if(!re()||!lo())return 0;let o=Qe(x),s=t.only?o.filter((r)=>r.name===t.only):o;if(s.length===0)return console.warn(t.only?`\u26A0\uFE0F No napi package named "${t.only}" in ${R}/${z} \u2014 skipping`:`\u26A0\uFE0F No napi packages in ${R}/${z} \u2014 skipping`),0;let i=0;for(let r of s){console.log(`
\u25B8 ${r.name}: ${r.crateDir} \u2192 ${r.dir}`);let a=g(["bun",po(),...e,...Nr(r),...n(r),...t.target?["--target",t.target]:[],...t.cross?["--use-napi-cross"]:[],...t.dryRun?["--dry-run"]:[]],{cwd:x});if(a!==0)i=a,console.error(`::error::${e.join(" ")} failed for ${r.name} (exit ${a})`)}return i}function Pr(e,t=It){if(!re()||!lo())return 0;return g(["bun",po(),...e],{cwd:t})}function Dr(){if(!process.env.WASI_SDK_PATH)console.warn(`\u26A0\uFE0F WASI_SDK_PATH is not set \u2014 install the WASI SDK if the wasm target fails to link
`+`   (CI does it for you; locally: https://github.com/WebAssembly/wasi-sdk/releases)
   The Rust target is needed too: rustup target add ${ge}`)}function Zr(e){let t=new Set;for(let o of Qe(e))for(let s of o.targets)t.add(s);return{include:Et.filter((o)=>t.size===0||t.has(o.target)).map((o)=>{let s={target:o.target,runner:o.runner};if(o.container)s.container=o.container;if(o.wasi)s.wasi=!0;return s})}}async function uo(e){if(e)return e;let t=ze(x)[0];if(t)try{let o=(await Bun.file(Z(x,t.dir,"package.json")).json()).name?.split("/")[0];if(o?.startsWith("@"))return o}catch{}return process.env.NATIVE_SCOPE??Je}var x,It,he,Ae,jr,Lr,Mr,Br,Gr,Fr,Vr,Ur,Hr,qr,Wr,Jr,Kr,Yr,zr,Qr,Xr,ea,ta,na,oa,sa,ia,ra,aa,ca,mo,la;var go=f(()=>{k();de();io();Ye();co();x=oo(),It=Z(x,R);he={pure:{type:"boolean",description:"Only the pure Rust crates (excludes every napi binding)",default:!1}};Ae={only:{type:"string",description:"Build a single package (by directory name)"},target:{type:"string",description:"Rust target triple, e.g. aarch64-unknown-linux-gnu"},cross:{type:"boolean",description:"Cross-compile with napi's bundled toolchain",default:!1}},jr=l({meta:{name:"check",description:"cargo check --workspace (fast type-check)"},args:{...he},run({args:e}){process.exit(E(["check","--workspace",...fe(Boolean(e.pure))]))}}),Lr=l({meta:{name:"clippy",description:"cargo clippy --workspace --all-targets -- -D warnings"},args:{...he},run({args:e}){process.exit(E(["clippy","--workspace",...fe(Boolean(e.pure)),"--all-targets","--","-D","warnings"]))}}),Mr=l({meta:{name:"fmt",description:"cargo fmt --all (format write)"},args:{...he},run({args:e}){process.exit(E(["fmt","--all",...fe(Boolean(e.pure))]))}}),Br=l({meta:{name:"fmt:check",description:"cargo fmt --all -- --check (format check)"},args:{...he},run({args:e}){process.exit(E(["fmt","--all",...fe(Boolean(e.pure)),"--","--check"]))}}),Gr=l({meta:{name:"test",description:"cargo test --workspace (run Rust tests)"},args:{...he},run({args:e}){process.exit(E(["test","--workspace",...fe(Boolean(e.pure))]))}}),Fr=l({meta:{name:"build",description:"cargo build --workspace (debug)"},args:{...he},run({args:e}){process.exit(E(["build","--workspace",...fe(Boolean(e.pure))]))}}),Vr=l({meta:{name:"build:release",description:"cargo build --workspace --release (lto, strip)"},run(){process.exit(E(["build","--workspace","--release"]))}}),Ur=l({meta:{name:"build:ci",description:"cargo build --workspace --profile ci"},run(){process.exit(E(["build","--workspace","--profile","ci"]))}}),Hr=l({meta:{name:"tree",description:"cargo tree (dependency tree)"},run(){process.exit(E(["tree",...v("tree")]))}}),qr=l({meta:{name:"update",description:"cargo update (update dependencies)"},run(){process.exit(E(["update",...v("update")]))}}),Wr=l({meta:{name:"doc",description:"cargo doc --no-deps (generate docs)"},run(){process.exit(E(["doc","--no-deps"]))}}),Jr=l({meta:{name:"nextest",description:"cargo nextest run (faster parallel tests)"},run(){process.exit(E(["nextest","run",...v("nextest")]))}}),Kr=l({meta:{name:"llvm-cov",description:"cargo llvm-cov --lcov (Rust coverage, requires cargo-llvm-cov)"},run(){let e=v("llvm-cov");if(e.length===0)process.exit(E(["llvm-cov","--workspace","--lcov","--output-path","coverage/rust-lcov.info"]));process.exit(E(["llvm-cov",...e]))}}),Yr=l({meta:{name:"audit",description:"cargo audit (security audit)"},run(){process.exit(E(["audit"]))}}),zr=l({meta:{name:"deny",description:"cargo deny check (license/ban check)"},run(){process.exit(E(["deny",...v("deny")]))}}),Qr=l({meta:{name:"typecheck",description:"Type-check every npm package (skips when absent)"},run(){if(!re())process.exit(0);let e=ze(x).filter((n)=>et(Z(x,n.dir,"tsconfig.json")));if(e.length===0)console.warn(`\u26A0\uFE0F No npm packages to type-check in ${R}/${z}`),process.exit(0);let t=0;for(let n of e){console.log(`\u25B8 typecheck ${n.name}`);let o=g(["bun","run","typecheck"],{cwd:Z(x,n.dir)});if(o!==0)t=o}process.exit(t)}});Xr=l({meta:{name:"matrix",description:"Print the CI build matrix (supported targets the packages declare)"},args:{json:{type:"boolean",description:"Pretty-print JSON (default)",default:!0},gha:{type:"boolean",description:"Print `key=value` lines ready for $GITHUB_OUTPUT",default:!1}},run({args:e}){let t=Zr(x);if(e.gha)console.log(`targets=${JSON.stringify(t)}`),console.log(`has_targets=${t.include.length>0}`);else console.log(JSON.stringify(t,null,2));process.exit(0)}}),ea=l({meta:{name:"list",description:"List crates and the npm packages built from them"},args:{json:{type:"boolean",description:"Print JSON",default:!1}},run({args:e}){if(!re())process.exit(0);let t=Re(x),n=Qe(x),o=new Set(n.map((s)=>s.name));if(e.json)console.log(JSON.stringify({root:x,crates:t,packages:n},null,2)),process.exit(0);console.log(`
\uD83E\uDD80 ${R} (workspace root: ${x})
`),console.log("  crates/");for(let s of t){let i=s.binding?"cdylib \u2192 npm package":"pure Rust",r=s.uses.length?` (uses ${s.uses.join(", ")})`:"",a=s.binding&&!o.has(s.name)?"  \u26A0\uFE0F no npm package":"";console.log(`    ${s.name.padEnd(14)} ${i}${r}${a}`)}if(console.log(`
  npm/`),n.length===0)console.log("    (none \u2014 add a cdylib crate with `m native add <name>`)");for(let s of n)console.log(`    ${s.name.padEnd(14)} ${s.crateDir}  binary: ${s.binaryName}.<platform>.node`),console.log(`    ${" ".repeat(14)} targets: ${s.targets.join(", ")}`);console.log(""),process.exit(0)}});ta=l({meta:{name:"add",description:"Add a crate (and, for bindings, its npm package) to the workspace"},args:{name:{type:"positional",description:"Crate name \u2014 also the npm package name",required:!0},pure:{type:"boolean",description:"Pure Rust crate: no cdylib, no npm package",default:!1},uses:{type:"string",description:"Comma-separated sibling crates to depend on"},scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!re())process.exit(1);let t=String(e.name);if(!/^[a-z0-9][a-z0-9-]*$/.test(t))console.error(`\u274C Invalid crate name "${t}" \u2014 use lowercase letters, digits and hyphens`),process.exit(1);let n={name:t,binding:!e.pure,uses:e.uses?String(e.uses).split(",").map((s)=>s.trim()).filter(Boolean):[],sample:"arithmetic"},o=await uo(e.scope);if(await ro(x,n,{scope:o}),await ao(x,t),e.pure)await Ot(x,{scope:o});if(console.log(`
\u2705 Added ${e.pure?"pure Rust crate":"crate + npm package"} "${t}"`),console.log(`   crate:   ${R}/crates/${t}/`),!e.pure)console.log(`   package: ${H(t)}/`);else console.log(`   bridge:  ${R}/crates/package.json (${o}/native-crates)`),console.log(`   Bindings that use "${t}" add it to workspace.dependencies + Cargo.toml,`),console.log(`   and \`${o}/native-crates: workspace:*\` in their package.json.`);console.log(`
   Run: bun install && m native check
`),process.exit(0)}}),na=l({meta:{name:"napi:build",description:"napi build --platform --release (one per package)"},args:Ae,run({args:e}){process.exit(Te(["build","--platform","--release"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),oa=l({meta:{name:"napi:build:debug",description:"napi build (debug, one per package)"},args:Ae,run({args:e}){process.exit(Te(["build"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),sa=l({meta:{name:"napi:build:wasm",description:`napi build --target ${ge} (one per package)`},args:{only:Ae.only},run({args:e}){Dr(),process.exit(Te(["build","--platform","--release","--target",ge],{only:e.only}))}}),ia=l({meta:{name:"create-npm-dirs",description:"Generate the per-platform npm packages (run in CI, not committed)"},args:{only:Ae.only,"dry-run":{type:"boolean",default:!1}},run({args:e}){process.exit(Te(["create-npm-dirs"],{only:e.only,dryRun:Boolean(e["dry-run"])},()=>["--npm-dir",`${R}/${z}`]))}}),ra=l({meta:{name:"artifacts",description:"Copy CI artifacts (.node/.wasm) into the npm packages"},args:{only:Ae.only,dir:{type:"string",description:"Directory holding the downloaded artifacts",default:"artifacts"}},run({args:e}){process.exit(Te(["artifacts"],{only:e.only},(t)=>["--npm-dir",`${R}/${z}`,"--output-dir",String(e.dir??"artifacts"),"--build-output-dir",t.dir]))}}),aa=l({meta:{name:"napi",description:"Run napi-rs CLI (passthrough, cwd = the workspace)"},run(){process.exit(Pr(v("napi")))}}),ca=l({meta:{name:"sync",description:"Re-sync the Turbo bridge node and Cargo\u2192npm dependency edges"},args:{scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!re())process.exit(1);let t=await uo(e.scope),n=`${t}/native-crates`,o=0;await Ot(x,{scope:t}),console.log(`  \u2713 ${R}/crates/{package,turbo}.json (bridge node)`);for(let i of Re(x).filter((r)=>r.binding)){let r=Z(x,H(i.name),"package.json");if(!et(r))continue;let a=(i.uses??[]).length>0;await At(r,(c)=>{let p=Tt(c).devDependencies?.[n];if(a&&p!=="workspace:*")return console.log(`  \u2713 ${H(i.name)}/package.json \u2192 ${n}: workspace:*`),o+=1,Zn(c,`devDependencies.${n}`,"workspace:*");if(!a&&p)return console.log(`  \uD83D\uDDD1\uFE0F ${H(i.name)}/package.json \u2190 ${n} (no Cargo path deps)`),o+=1,Xn(c,`devDependencies.${n}`);return c})}let s=Z(x,"package.json");await At(s,(i)=>{if((Tt(i).workspaces??[]).includes(`${R}/crates`))return i;return console.log(`  \u2713 package.json workspaces += ${R}/crates`),o+=1,eo(i,"workspaces",`${R}/crates`)}),console.log(o===0?`
\u2705 Already in sync
`:`
\u2705 Synced (${o} fix${o===1?"":"es"}) \u2014 run bun install
`),process.exit(0)}}),mo=l({meta:{name:"m native",version:"1.0.0",description:"Native Rust bindings via Cargo + napi-rs \u2014 one Cargo workspace in packages/native with a crate per Rust unit and an npm package per napi binding."},subCommands:{list:ea,matrix:Xr,add:ta,check:jr,clippy:Lr,fmt:Mr,"fmt:check":Br,test:Gr,build:Fr,"build:release":Vr,"build:ci":Ur,tree:Hr,update:qr,doc:Wr,nextest:Jr,"llvm-cov":Kr,audit:Yr,deny:zr,typecheck:Qr,"napi:build":na,"napi:build:debug":oa,"napi:build:wasm":sa,"create-npm-dirs":ia,artifacts:ra,napi:aa,sync:ca},run(){let e=v("native");if(e.length===0)console.log(`
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
  napi:build:wasm      napi build --target ${ge}
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
`),process.exit(0);let t=e[0]??"";if(!Object.keys(mo.subCommands||{}).includes(t)&&!t.startsWith("-"))process.exit(E(e))}}),la=mo});var{file:fo,spawnSync:pa}=globalThis.Bun;var ua,ma;var ho=f(()=>{I();k();ua=l({meta:{name:"m e2e",version:"1.0.0",description:"Playwright E2E with browser detection \u2014 auto-skips if browsers missing, uses shared config"},args:{args:{type:"positional",description:"Playwright test args",required:!1}},async run(){let{chromium:e,firefox:t,webkit:n}=await import("@playwright/test"),o={chromium:e,firefox:t,webkit:n},s=[];for(let[w,b]of Object.entries(o))try{let m=b.executablePath();if(!await fo(m).exists())s.push(w)}catch{s.push(w)}if(s.length>0)console.log(`
E2E skipped: browser(s) not installed (${s.join(", ")}).`),console.log("Run `bunx playwright install` to download them.\n"),process.exit(0);let i=cn(),r=await fo(`${i}/apps/example/playwright.config.ts`).exists()?`${i}/apps/example/playwright.config.ts`:null,a=v("e2e"),u=["bun",Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js")),"test",...r?["--config",r]:[],...a],p=pa({cmd:u,stdout:"inherit",stderr:"inherit",stdin:"inherit"});process.exit(p.exitCode)}}),ma=ua});import{existsSync as bo,readdirSync as da,readFileSync as ga}from"fs";import{join as Pt}from"path";function ha(e){if(e===void 0||e===!1||e===null)return null;if(e===!0)return Nt;if(typeof e==="string")return e||Nt;if(typeof e==="object")return e.dir||Nt;return null}function ba(e){let t=Pt(e,"package.json");if(!bo(t))return null;try{return JSON.parse(ga(t,"utf8"))}catch{return null}}function tt(e=process.cwd()){let t=[];for(let o of fa){let s=o.split("*")[0]??"",i=Pt(e,s);if(!bo(i))continue;for(let r of da(i,{withFileTypes:!0})){if(!r.isDirectory())continue;let a=`${s}${r.name}`,c=ba(Pt(e,a));if(!c?.name)continue;let u=ha(c.pages);if(!u)continue;t.push({name:c.name,dir:a,outDir:`${a}/${u}`})}}t.sort((o,s)=>o.name.localeCompare(s.name));let n=t.length>1;return t.map((o)=>({...o,subpath:n?o.name.split("/").at(-1)??o.name:""}))}function jt(e){return e.subpath?`/${e.subpath}/`:"/"}var L=".pages",Dt="coverage",Nt="public",fa;var vo=f(()=>{fa=["apps/*","packages/*"]});import{existsSync as Lt}from"fs";import{cp as yo,rm as va}from"fs/promises";import{join as X}from"path";var{Glob:ya,spawnSync:wo}=globalThis.Bun;function wa(){let e=process.env.GITHUB_REPOSITORY?.split("/")[1];if(e)return e;let n=wo({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim();if(!n)return;return n.replace(/\.git$/,"").split("/").at(-1)}function ka(){let e=process.env.GITHUB_REPOSITORY?.split("/")[0];if(e)return e;return wo({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim()?.replace(/\.git$/,"").match(/[:/]([^/:]+)\/[^/]+$/)?.[1]}async function xa(e,t){await va(X(e,L),{recursive:!0,force:!0});for(let i of t){let r=X(e,i.outDir);if(!Lt(r))console.error(`::error::${i.name} declares "${i.outDir}" but it does not exist`),process.exit(1);let a=i.subpath?X(e,L,i.subpath):X(e,L);await yo(r,a,{recursive:!0}),console.log(`\uD83D\uDCE6 ${i.name}: ${i.outDir} \u2192 ${L}${jt(i)}`)}let n="coverage/html",o=X(e,n);if(Lt(X(o,"index.html")))await yo(o,X(e,L,Dt),{recursive:!0}),console.log(`\uD83D\uDCCA ${n} \u2192 ${L}/${Dt} (served at /coverage/)`);let s=X(e,L,"index.html");if(!Lt(s))console.warn(`\u26A0\uFE0F No index.html at the site root (${L}/) \u2014 check the pages config`)}var Ca,Sa,$a,Ra,Ta;var ko=f(()=>{k();vo();Ca=l({meta:{name:"list",description:"Show which packages declare a Pages site"},run(){let e=tt();if(e.length===0)console.log("No package declares a pages config in its package.json"),process.exit(0);for(let t of e)console.log(`${t.name.padEnd(24)} ${t.outDir.padEnd(28)} \u2192 ${jt(t)}`);process.exit(0)}}),Sa=l({meta:{name:"build",description:"Build the site and assemble the Pages artifact from declared packages"},run(){console.log("\uD83D\uDCC4 Building static site for GitHub Pages");let e=g(["bun","run","build"]);if(e!==0)console.error(`::error::bun run build failed (exit ${e})`),process.exit(e);let t=tt();if(t.length===0)console.error('::error::Pages is enabled but no package declares "pages" in its package.json (e.g. "pages": { "dir": "public" })'),process.exit(1);xa(process.cwd(),t).then(()=>{console.log(`\u2705 Pages artifact ready: ${L}/`),process.exit(0)})}}),$a=l({meta:{name:"base",description:"Report (or inject) the base path for a GitHub Pages project site"},args:{inject:{type:"boolean",description:"Rewrite absolute href/src in the built HTML to include the base path",default:!1},json:{type:"boolean",description:"Print { owner, repo, base, url } as JSON",default:!1}},async run({args:e}){let t=wa(),n=ka()??"unknown",o=t?`https://${n.toLowerCase()}.github.io/${t}`:void 0;if(e.json){console.log(JSON.stringify({owner:t?n:null,repo:t??null,base:t?`/${t}`:null,url:o??null}));return}if(console.log(`\uD83D\uDD27 Repo name: ${t??"(unknown)"}`),console.log(`   Default Pages URL: ${o??"(unknown)"}`),!e.inject)return;if(!t)console.error("::error::cannot determine repo name \u2014 set GITHUB_REPOSITORY or add a git remote"),process.exit(1);if(tt().filter((a)=>a.subpath==="").length===0){console.log("   No root-level Pages target \u2014 nothing to rewrite");return}let r=0;for(let a of new ya(`${L}/**/*.html`).scanSync(".")){let c=await Bun.file(a).text(),u=c.replaceAll(/(href|src)="\/(?!\/)/g,`$1="/${t}/`);if(u===c)continue;await Bun.write(a,u),r++}console.log(`   Rewrote absolute paths to /${t}/ in ${r} file(s)`)}}),Ra=l({meta:{name:"m pages",version:"1.0.0",description:"GitHub Pages helper \u2014 discovers declared sites, builds and stages the artifact"},subCommands:{build:Sa,base:$a,list:Ca}}),Ta=Ra});import{mkdir as Ee,readdir as nt}from"fs/promises";import{join as ae}from"path";var{$:be,file:Mt,write:_e}=globalThis.Bun;function Aa(e){let t=e.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!t)return null;let n=t[1]??"",o=t[2]??"",s={};for(let i of n.split(`
`)){let r=i.indexOf(":");if(r===-1)continue;let a=i.slice(0,r).trim(),c=i.slice(r+1).trim().replace(/^["']|["']$/g,"");if(a)s[a]=c}return{frontmatter:s,body:o}}async function Ie(e){try{let t=await Mt(e).text(),n=Aa(t);if(!n)return console.error(`\u274C ${e}: missing YAML frontmatter (---)`),null;let{frontmatter:o}=n;if(!o.name)return console.error(`\u274C ${e}: missing frontmatter 'name'`),null;if(!o.description)return console.error(`\u274C ${e}: missing frontmatter 'description'`),null;return{name:o.name,description:o.description,path:e}}catch(t){return console.error(`\u274C ${e}: ${t.message}`),null}}async function ot(e){let t=[];try{let n=await nt(e,{withFileTypes:!0});for(let o of n){let s=ae(e,o.name);if(o.isDirectory()){let i=await ot(s);t.push(...i)}else if(o.name==="SKILL.md"||o.name.endsWith(".md"))t.push(s)}}catch{}return t}var xo="@myorg",ce,So,M,Oe,Co,Ea,_a,Oa,Ia,Na,Pa,Da,ja,La;var $o=f(()=>{Be();I();ce=ln(),So=`${U()}/src/cli.ts`,M=`${process.cwd()}/.agents/skills`,Oe=`${process.cwd()}/.agents/skills.index.json`;Co=l({meta:{name:"sync",description:"Sync curated skills to .agents/skills/ + validate + index"},run:async()=>{let e=process.env.SKILLS_SCOPE||process.env.SCOPE||xo,t=xo;await Ee(M,{recursive:!0}),console.log(`
\uD83D\uDCE6 Syncing curated skills from ${ce} to ${M}/ (scope: ${e})
`);let n=0;try{let a=await nt(ce,{withFileTypes:!0});for(let c of a){let u=ae(ce,c.name);if(c.isDirectory()){let p=ae(M,c.name);if(await Ee(p,{recursive:!0}),await be`cp -r ${u}/* ${p}/`.quiet().catch(()=>{}),e!==t){let w=await be`find ${p} -type f -name "*.md"`.text().catch(()=>"");for(let b of w.trim().split(`
`).filter(Boolean))try{let m=await Mt(b).text();if(m.includes(t))await _e(b,m.replaceAll(t,e))}catch{}}n++,console.log(`  \u2713 ${c.name}/`)}else if(c.isFile()&&c.name.endsWith(".md")){let p=c.name.replace(/\.md$/,""),w=ae(M,p);await Ee(w,{recursive:!0});let b=await Mt(u).text();if(e!==t)b=b.replaceAll(t,e);if(b.startsWith("---"))await _e(ae(w,"SKILL.md"),b);else{let C=`---
name: ${p}
description: ${p} skill
---

${b}`;await _e(ae(w,"SKILL.md"),C)}n++,console.log(`  \u2713 ${p}/ (from legacy ${c.name})`)}}}catch(a){console.error(`  No curated dir: ${ce}`,a)}console.log(`
\u2705 Synced ${n} curated skills to .agents/skills/
`),console.log(`\uD83D\uDD0D Validating skills in ${M}/...
`);let o=await ot(M),s=0,i=0;for(let a of o){let c=await Ie(a);if(c)s++,console.log(`  \u2713 ${c.name} \u2014 ${c.description}`);else i++}console.log(`
${i===0?"\u2705":"\u26A0\uFE0F"}  ${s} valid, ${i} invalid
`);let r=[];for(let a of o){let c=await Ie(a);if(c)r.push({...c,path:a.replace(`${process.cwd()}/`,"")})}if(await Ee(`${process.cwd()}/.agents`,{recursive:!0}),await _e(Oe,`${JSON.stringify(r,null,2)}
`),console.log(`\uD83D\uDCC4 Built ${Oe} with ${r.length} skills
`),i>0)process.exit(1)}}),Ea=l({meta:{name:"list",description:"List installed skills (curated + vendored + skills.sh)",alias:["ls"]},run:async()=>{console.log(`
\uD83D\uDCDA Skills in ${M}/:
`);try{let e=await nt(M,{withFileTypes:!0});if(e.length===0)console.log("  (no skills installed \u2014 run `bun run skills:sync` or `bun run skills:add`)\n");else for(let t of e){if(!t.isDirectory())continue;let n=ae(M,t.name,"SKILL.md"),o=await Ie(n).catch(()=>null);if(o)console.log(`  - ${o.name} \u2014 ${o.description} (${t.name}/)`);else console.log(`  - ${t.name}/ \u2014 (no SKILL.md)`)}}catch{console.log("  (no .agents/skills/ dir \u2014 run `bun run skills:sync`)\n")}console.log(`
\uD83D\uDCE6 Curated skills in ${ce}/:
`);try{let e=await nt(ce,{withFileTypes:!0});for(let t of e){let n=t.isDirectory()?t.name:t.name.replace(/\.md$/,"");console.log(`  - ${n}`)}}catch{console.log("  (no curated dir)")}console.log(),console.log(`\uD83D\uDD0D skills.sh installed (project):
`),await be`npx skills list -p`.quiet().then(async(e)=>{let t=e.stdout.toString();console.log(t||"  (none or skills CLI not available)")}).catch(()=>{console.log("  (skills CLI not available or no project skills)")}),console.log()}}),_a=l({meta:{name:"add",description:"Add skill via skills.sh (e.g. vercel-labs/agent-skills)",alias:["a"]},args:{package:{type:"positional",description:"Skill package (e.g. vercel-labs/agent-skills or https://skills.sh/p/<id>)",required:!0}},run:async({args:e})=>{let t=e.package;console.log(`
\uD83D\uDCE6 Adding skill package via skills.sh: ${t}
`),console.log(`> npx skills add ${t} -p --agent * -y
`);let o=await Bun.spawn({cmd:["npx","skills","add",t,"-p","--agent","*","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(o!==0)console.error(`
\u274C skills add failed with exit ${o}
`),process.exit(o);console.log(`
\u2705 Added ${t}, syncing to .agents/skills/...
`),await be`bun ${So} skills sync`.quiet().catch(()=>{}),await be`npx skills experimental_sync -p`.quiet().catch(()=>{}),console.log(`
\u2705 Done. Review changes in .agents/skills/ before committing.
`)}}),Oa=l({meta:{name:"update",description:"Update skills via skills.sh",alias:["upgrade"]},args:{skills:{type:"positional",description:"Skills to update (default: all)",required:!1}},run:async({args:e})=>{let t=e.skills??"",n=t?[t]:[];console.log(`
\uD83D\uDD04 Updating skills via skills.sh: ${n.join(" ")||"(all)"}
`);let o=["npx","skills","update",...n,"-p","-y"];console.log(`> ${o.join(" ")}
`);let i=await Bun.spawn({cmd:o,cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(i!==0)console.error(`
\u274C skills update failed with exit ${i}
`),process.exit(i);console.log(`
\u2705 Updated, rebuilding index...
`),await be`bun ${So} skills sync`.quiet().catch(()=>{})}}),Ia=l({meta:{name:"validate",description:"Validate all SKILL.md frontmatter (name, description)"},run:async()=>{console.log(`
\uD83D\uDD0D Validating all SKILL.md files...
`);let e=[ce,M],t=0,n=0;for(let o of e){console.log(`\uD83D\uDCC1 ${o}:
`);let s=await ot(o);if(s.length===0){console.log(`  (no skills found)
`);continue}for(let i of s){let r=await Ie(i);if(r)t++,console.log(`  \u2713 ${r.name} \u2014 ${r.description} (${i.replace(`${process.cwd()}/`,"")})`);else n++}console.log()}if(console.log(`${n===0?"\u2705":"\u274C"} Validation: ${t} valid, ${n} invalid
`),n>0)process.exit(1)}}),Na=l({meta:{name:"index",description:"Build .agents/skills.index.json"},run:async()=>{console.log(`
\uD83D\uDCC4 Building ${Oe}...
`);let e=await ot(M),t=[];for(let n of e){let o=await Ie(n);if(o)t.push({...o,path:n.replace(`${process.cwd()}/`,"")})}await Ee(`${process.cwd()}/.agents`,{recursive:!0}),await _e(Oe,`${JSON.stringify(t,null,2)}
`),console.log(`\u2705 Built index with ${t.length} skills:
`);for(let n of t)console.log(`  - ${n.name}: ${n.description}`);console.log(`
\uD83D\uDCC4 ${Oe}
`)}}),Pa=l({meta:{name:"init",description:"Init new skill via skills.sh"},args:{name:{type:"positional",description:"Skill name",required:!1,default:"my-skill"}},run:async({args:e})=>{let t=e.name??"my-skill";console.log(`
\uD83D\uDCDD Initializing skill: ${t}
`),await Bun.spawn({cmd:["npx","skills","init",t],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),Da=l({meta:{name:"remove",description:"Remove skills via skills.sh",alias:["rm"]},args:{skills:{type:"positional",description:"Skills to remove",required:!0}},run:async({args:e})=>{let n=e.skills.split(",").map((s)=>s.trim());console.log(`
\uD83D\uDDD1\uFE0F Removing skills: ${n.join(", ")}
`),await Bun.spawn({cmd:["npx","skills","remove",...n,"-p","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),ja=l({meta:{name:"m skills",version:"1.0.0",description:"AI agent skills management via skills.sh + curated skills \u2014 sync, list, add, update, validate, index"},subCommands:{sync:Co,list:Ea,add:_a,update:Oa,validate:Ia,index:Na,init:Pa,remove:Da},run:async({args:e})=>{if(!e._||Array.isArray(e._)&&e._.length===0)await q(Co,{rawArgs:[]})}}),La=ja});function Ro(e,t,n){let o=[];if(e.includes("Archont561/ts-monorepo-template")&&!e.includes(t))o.push("README still contains placeholder owner Archont561/ts-monorepo-template");if(e.includes("@myorg")&&!e.includes(n)){let s=e.split(`
`).filter((i)=>i.includes("shields.io")||i.includes("badge.svg"));for(let i of s)if(i.includes("@myorg"))o.push(`Badge line still contains @myorg: ${i.trim().slice(0,80)}`)}return o}var{file:Ma}=globalThis.Bun;var To,Ba;var Ao=f(()=>{k();To=l({meta:{name:"check",description:"Check README badges for placeholder owner/scope"},args:{owner:{type:"string",description:"Expected owner/repo",default:"YOUR_ORG/YOUR_REPO"},scope:{type:"string",description:"Expected scope",default:"@your-scope"}},run:async({args:e})=>{let t=e.owner||"YOUR_ORG/YOUR_REPO",n=e.scope||"@your-scope",o=`${process.cwd()}/README.md`,s=await Ma(o).text().catch(()=>"");if(!s)console.error(`No README at ${o}`),process.exit(1);let i=Ro(s,t,n);if(i.length===0)console.log("\u2705 Badges look OK (no placeholder owner/scope in badge URLs)"),process.exit(0);console.warn(`\u26A0\uFE0F Badge issues:
${i.map((r)=>`  - ${r}`).join(`
`)}`),process.exit(1)}}),Ba=l({meta:{name:"badges",version:"1.0.0",description:"Badges validation \u2014 check README badges"},subCommands:{check:To},run:async()=>{await q(To,{rawArgs:[]})}})});var{file:Ga}=globalThis.Bun;function Eo(e,t){return async({targetDir:n,scope:o})=>{let s=Ge(...e.split("/"));if(!await Ga(s).exists())return;console.log(`
\uD83D\uDD27 Running setup for ${t}: ${e}
`);try{let r=await Bun.spawn({cmd:["bun",s],cwd:n,env:{...process.env,SCOPE:o,NATIVE_SCOPE:o,UNOCSS_SCOPE:o,DEVCONTAINER_SCOPE:o,SKILLS_SCOPE:o},stdout:"inherit",stderr:"inherit"}).exited;if(r!==0)console.warn(`\u26A0\uFE0F Setup for ${t} exited with code ${r}`)}catch(i){console.warn(`\u26A0\uFE0F Setup for ${t} failed:`,i)}}}var _o,Oo;var Io=f(()=>{I();_o=Eo("commands/native-setup.ts","native"),Oo=Eo("commands/devcontainer-setup.ts","devcontainer")});var{file:No}=globalThis.Bun;async function ru(e){return[...ee]}function Ha(e){if(typeof e==="boolean")return!0;if(typeof e!=="string")return!1;return e==="always"||Ua.includes(e)}function Do(e,t){let n=e.flag?t[e.flag]:void 0;return n===void 0?e.default:n}function jo(e,t){return e.type==="select"?t===e.default:!t}function qa(e,t){if(e.default==="always"&&!e.selfDestruct)return!0;let n=Do(e,t);return!(e.selfDestruct===!0||jo(e,n))}function Lo(e,t){let n=new Set;for(let o of e)if(qa(o.meta,t))n.add(o.dir);return n}function Mo(e,t){let n=new Set(["template"]);for(let o of e){let{meta:s}=o;if(s.default==="always")continue;let i=Do(s,t);if(jo(s,i)){if(n.add(o.dir),s.flag)n.add(s.flag);if(s.marker)n.add(s.marker);if(s.templateMarker)n.add(s.templateMarker);for(let a of s.markers??[])n.add(a)}for(let a of s.options??[]){if(a.value===i)continue;if(a.marker)n.add(a.marker);if(a.templateMarker)n.add(a.templateMarker);for(let c of a.markers??[])n.add(c)}let r=s.removals?.[String(i)];if(r){if(r.marker)n.add(r.marker);if(r.templateMarker)n.add(r.templateMarker);for(let a of r.markers??[])n.add(a);for(let a of r.markersToRemove??[])n.add(a)}}return n}async function Bo(e){let t=No(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.features;if(!o||typeof o!=="object"||Array.isArray(o))return null;let s={};for(let[i,r]of Object.entries(o))if(Ha(r))s[i]=r;return s}catch{return null}}async function Go(e){let t=No(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.scope;return typeof o==="string"&&o.length>0?o:null}catch{return null}}var Fa,Po="@myorg",Va,ee,iu,au="tooling.features",cu="tooling.scope",Ua;var Fo=f(()=>{Io();Fa={none:"none",publish:"publish",docker:"docker"},Va={badges:{name:"@myorg/badges",dir:"badges",meta:{default:"always",flag:"badges",prompt:"Include badges for CI, coverage, license in READMEs?"}},biome:{name:"@myorg/biome",ciFiles:["sections/biome.yml"],dir:"biome",meta:{default:"always",flag:"biome",prompt:"Configure Biome (lint + format)?"}},"bun-config":{name:"@myorg/bun-config",ciFiles:["sections/bun-config.yml"],dir:"bun-config",meta:{default:"always",flag:"bun-config",prompt:"Configure Bun (coverage, test settings)?"}},bunup:{name:"@myorg/bunup",ciFiles:["sections/bunup.yml"],dir:"bunup",meta:{default:"always",flag:"bunup",prompt:"Configure Bunup (Bun-based package bundler)?"}},changeset:{name:"@myorg/changeset",ciFiles:["fragments/changeset/release.steps.yml"],dir:"changeset",meta:{default:"always",flag:"changeset",prompt:"Configure Changesets (versioning + releases)?"}},citty:{name:"@myorg/citty",dir:"citty",meta:{default:"always",flag:"citty",prompt:"Configure Citty (elegant CLI builder)?"}},codeql:{name:"@myorg/codeql",ciFiles:["sections/codeql.yml"],dir:"codeql",meta:{default:!0,flag:"codeql",prompt:"Include CodeQL (GitHub SAST for JS/TS)?",type:"confirm"}},commitlint:{name:"@myorg/commitlint",dir:"commitlint",meta:{default:"always",flag:"commitlint",prompt:"Configure Commitlint (Conventional Commits)?"}},community:{name:"@myorg/community",dir:"community",meta:{default:"always",flag:"community",prompt:"Include community health files (CODEOWNERS, PR template, issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING)?"}},coverage:{name:"@myorg/coverage",ciFiles:["fragments/coverage-report/coverage.base.yml","fragments/coverage-report/coverage.steps.yml","fragments/coverage-report/pages.steps.yml","sections/coverage.yml"],dir:"coverage",meta:{default:"always",flag:"coverage",prompt:"Configure coverage reporting (LCOV, HTML, artifact, Pages, threshold)?"}},dependabot:{name:"@myorg/dependabot",ciFiles:["fragments/dependabot/dependabot-auto-merge.base.yml","fragments/dependabot/dependabot-auto-merge.steps.yml","fragments/dependabot/dependabot.base.yml","standalone/dependabot.yml"],dir:"dependabot",meta:{default:"always",flag:"dependabot",prompt:"Configure Dependabot (automated dependency updates)?"}},devcontainer:{name:"@myorg/devcontainer",dir:"devcontainer",setup:Oo,meta:{default:!1,flag:"devcontainer",prompt:"Include devcontainer config for Codespaces / Dev Containers?",type:"confirm",removals:{true:{},false:{extraRemovals:[".devcontainer"],filePatternsToRemove:["**/.devcontainer/**",".devcontainer/**","**/devcontainer.json"],fileRegexesToRemove:["devcontainer","\\.devcontainer"]}}}},editorconfig:{name:"@myorg/editorconfig",dir:"editorconfig",meta:{default:"always",flag:"editorconfig",prompt:"Include .editorconfig (consistent editor settings)?"}},"gh-actions":{name:"@myorg/gh-actions",ciFiles:["ci.base.yml","ci.bootstrap.yml","release.base.yml","sections/gh-actions.yml"],dir:"gh-actions",meta:{default:"always",flag:"gh-actions",prompt:"Configure GitHub Actions (CI + release workflows)?"}},gitattributes:{name:"@myorg/gitattributes",dir:"gitattributes",meta:{default:"always",flag:"gitattributes",prompt:"Include .gitattributes (line endings, binary handling)?"}},gitleaks:{name:"@myorg/gitleaks",ciFiles:["sections/gitleaks.yml"],dir:"gitleaks",meta:{default:"always",flag:"gitleaks",prompt:"Include Gitleaks (secret scanning via Lefthook + CI)?"}},lefthook:{name:"@myorg/lefthook",dir:"lefthook",meta:{default:"always",flag:"lefthook",prompt:"Configure Lefthook (Git hooks)?"}},manifest:{name:"@myorg/manifest",dir:"manifest",meta:{default:"always",flag:"manifest",prompt:"Configure the manifest editor (format-preserving package.json edits)?"}},native:{name:"@myorg/native-config",ciFiles:["fragments/native/native.base.yml","fragments/native/native.steps.yml","fragments/native/release.steps.yml","sections/native.yml"],dir:"native",setup:_o,meta:{default:"none",flag:"native",prompt:"Set up native Node-API (NAPI-RS) bindings?",type:"select",options:[{value:"none",label:"None - skip native bindings"},{value:"publish",label:"Publish a native npm package"},{value:"docker",label:"Build native bindings in Docker"}],removals:{none:{extraRemovals:["packages/native","apps/example/src/pages/api/native"],scriptsToRemove:["build:native","build:wasm","test:native","security:audit"],turboTasksToRemove:["build:native","build:wasm"],filePatternsToRemove:["**/*.node","**/*.napi.*","**/*.wasi.cjs","**/rust-toolchain.toml","Cargo.lock",".cargo/**","**/native/**","**/api/native/**"],fileRegexesToRemove:["\\\\.node$","napi","rust-toolchain","api/native"],appDepsToRemove:["@myorg/native"]},publish:{},docker:{}}}},pages:{name:"@myorg/pages",ciFiles:["fragments/pages/pages.base.yml","fragments/pages/pages.steps.yml"],dir:"pages",meta:{default:!1,flag:"pages",prompt:"Set up GitHub Pages deployment (static site via Actions)?",type:"confirm",removals:{true:{},false:{extraRemovals:[".github/workflows/pages.yml"],filePatternsToRemove:["**/pages.yml"],fileRegexesToRemove:["pages\\.yml"]}}}},playwright:{name:"@myorg/playwright",ciFiles:["sections/playwright.yml"],dir:"playwright",meta:{default:!0,flag:"playwright",prompt:"Include E2E testing with Playwright?",removals:{true:{},false:{scriptsToRemove:["test:e2e"],turboTasksToRemove:["test:e2e"],extraRemovals:["apps/example/playwright.config.ts","apps/example/e2e"],filePatternsToRemove:["**/e2e/**","**/*.e2e.ts","**/playwright.config.ts"],fileRegexesToRemove:["playwright",".*\\.spec\\.e2e\\..*"],appDepsToRemove:["@myorg/playwright","@playwright/test"]}}}},skills:{name:"@myorg/skills",dir:"skills",meta:{default:!1,flag:"skills",prompt:"Install AI agent skills? (for Cursor, Claude, Cline)",removals:{false:{extraRemovals:[".agents"],filePatternsToRemove:[".agents/**","**/.claude/**","**/skills/**"],fileRegexesToRemove:["\\.agents","skills"],scriptsToRemove:["skills"]}}}},stale:{name:"@myorg/stale",ciFiles:["fragments/stale/stale.base.yml"],dir:"stale",meta:{default:!1,flag:"stale",prompt:"Include stale action (auto-close inactive issues/PRs)?",type:"confirm"}},template:{name:"@myorg/template",dir:"template",meta:{default:"always",selfDestruct:!0,scriptsToRemove:["docs:sync","docs:site","docs:dev","docs:build","docs:preview"],removals:{always:{extraRemovals:[".github/workflows/template-docs.yml","apps/template-docs","codecov.yml","packages/tooling/tests","packages/tooling/dist"],filePatternsToRemove:["**/template-docs.yml","**/template-docs/**",".changeset/*.md"],fileRegexesToRemove:["template-docs"]}}}},trivy:{name:"@myorg/trivy",ciFiles:["sections/trivy.yml"],dir:"trivy",meta:{default:!1,flag:"trivy",prompt:"Include Trivy (container + filesystem vulnerability scanning)?",type:"confirm",removals:{false:{filePatternsToRemove:["**/trivy*"],scriptsToRemove:["security:trivy","security:check"]}}}},ts:{name:"@myorg/ts",dir:"ts",meta:{default:"always",flag:"ts",prompt:"Configure TypeScript (shared tsconfigs)?"}},turbo:{name:"@myorg/turbo",ciFiles:["sections/turbo.yml"],dir:"turbo",meta:{default:"always",flag:"turbo",prompt:"Configure Turbo (task orchestration)?"}}},ee=Object.values(Va),iu=new Map(ee.map((e)=>[e.dir,e]));Ua=Object.values(Fa)});function Vo(e,t){if(e.startsWith("!")){let n=e.slice(1).trim();return!t.has(n)&&!t.has(n.toLowerCase())}return t.has(e)||t.has(e.toLowerCase())}function pu(e){return[e,"-type","f","(",...Wa.flatMap((t,n)=>[...n>0?["-o"]:[],"-name",`*${t}`]),")","-not","-path","*/node_modules/*","-not","-path","*/dist/*","-not","-path","*/packages/tooling/*"]}function Uo(e,t){let n=e,o=!1;for(let s of Ja)n=n.replace(s,(i,r,a)=>{let c=r.split(",").map((p)=>p.trim());return o=!0,c.every((p)=>Vo(p,t))?"":a});for(let s of Ka)n=n.replace(s,(i,r,a)=>{if(r.toUpperCase()==="TEMPLATE-ONLY")return i;return o=!0,Vo(r,t)?"":a});if(!o)return{content:e,changed:o};return{changed:o,content:n.replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).replace(/\n{2,}$/,`
`)}}var Wa,Ja,Ka;var Ho=f(()=>{Wa=[".yml",".yaml",".ts",".js",".md",".toml",".html"],Ja=[/[ \t]*#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g],Ka=[/[ \t]*#[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*\1:END[^\n]*\n?/g,/[ \t]*\/\/[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*\1:END[^\n]*\n?/g,/[ \t]*<!--[ \t]*([A-Za-z0-9_!-]+):START[ \t]*-->([\s\S]*?)<!--[ \t]*\1:END[ \t]*-->[ \t]*\n?/g]});var qo;var Wo=f(()=>{qo={BUN_VERSION:"latest",NATIVE_DIR:"packages/native",NATIVE_CARGO:"packages/native/Cargo.toml",NATIVE_NPM:"packages/native/npm/*/package.json",NATIVE_WASI_SDK_VERSION:"24",APP_DIR:"apps/example",APP_DOCKERFILE:"apps/example/Dockerfile"}});import{mkdir as Jo}from"fs/promises";var{$:Ya,file:ve,write:za}=globalThis.Bun;function zo(e){return Yo.exec(e)?.[1]??null}function Qo(e){return Qa.exec(e)?.[1]??null}function Xa(e,t){let n=[],o=t,s=[],i=()=>{let r=s.join(`
`).replace(/^(?:[ \t]*\n)+/,"").replace(/\s+$/,"");if(r)n.push({section:o,text:r});s=[]};for(let r of e.split(`
`)){let a=zo(r);if(a){i(),o=a;continue}s.push(r)}return i(),n}function ec(e){return e.split(`
`).some((t)=>Yo.test(t))}function tc(e,t){let n=new Map;for(let r of t)for(let a of Xa(r,Zo)){let c=n.get(a.section)??[];c.push(a.text),n.set(a.section,c)}let o=new Set,s=new Set,i=[];for(let r of e.split(`
`)){let a=zo(r);if(!a){i.push(r);continue}o.add(a);let c=n.get(a);if(c?.length)s.add(a),i.push(c.join(`

`))}for(let r of n.keys())if(!o.has(r))console.log(`\u26A0\uFE0F No "# SECTION: ${r}" in the CI skeleton \u2014 steps dropped`);return{rendered:i.join(`
`),filled:s}}function nc(e,t){if(t.size===0)return e;let n=[],o=!1;for(let s of e.split(`
`)){let i=Qo(s);if(i)o=t.has(i);else if(/^\S/.test(s))o=!1;if(!o)n.push(s)}return n.join(`
`)}function oc(e,t){let n=e.split(`
`),o=!1;for(let[s,i]of n.entries()){let r=Qo(i);if(r)o=r===Za;else if(/^\S/.test(i))o=!1;if(o&&/^ {4}needs: \[[^\]]*\]$/.test(i)){n[s]=`    needs: [${t.join(", ")}]`;break}}return n.join(`
`)}function Xo(){return new Set(ee.map((e)=>e.dir))}function Bt(e){return Ge("ci",...e.split("/"))}function sc(e,t){if(t==="ci.steps.yml")return e.startsWith("sections/");return(e.split("/").pop()??"")===t}async function ic(e,t){let n=[];for(let o of ee){if(!t.has(o.dir))continue;for(let s of o.ciFiles??[]){if(!sc(s,e))continue;n.push((await ve(Bt(s)).text()).trimEnd())}}return n}async function rc(e,t){for(let n of ee){if(!t.has(n.dir))continue;for(let o of n.ciFiles??[])if((o.split("/").pop()??"")===e)return Bt(o)}return null}async function ac(){let e=Bt("ci.bootstrap.yml");if(!await ve(e).exists())return"";return(await ve(e).text()).trimEnd()}async function cc(e,t){if(!t)return;let n=Mo(ee,t),o=await Go(e);return(s)=>{let{content:i}=Uo(s,n);return o?i.replaceAll(Po,o):i}}async function lc(e,t,n,o={}){let s=o.enabled??Xo(),i=await rc(t,s);if(!i){console.log(`\u26A0\uFE0F Skipping ${t} \u2014 no enabled feature declares it`);return}let r=await ve(i).text(),a=await ic(n,s),c=a.join(`

`),u;if(n==="ci.steps.yml"&&ec(r)){let b=tc(r.replaceAll("{{BOOTSTRAP}}",await ac()),a),m=new Set(Ko.filter((y)=>!b.filled.has(y))),C=[Zo,...Ko.filter((y)=>!m.has(y))];u=oc(nc(b.rendered,m),C)}else u=r.replace("{{STEPS}}",`${c}
`).replace("{{UPDATES}}",`${c}
`);let p=u;for(let[b,m]of Object.entries(qo))p=p.replaceAll(`{{${b}}}`,m);p=p.replace(/\n{3,}/g,`

`);let w;if(t==="dependabot.base.yml")w=`${e}/.github/dependabot.yml`;else w=`${e}/.github/workflows/${t.replace(".base.yml",".yml")}`;await za(w,o.postProcess?o.postProcess(p):p),console.log(`\u2705 generated ${w}`)}async function uc(e,t,n,o){let s=t.outcome(n);if(s==="skip")return;if(s==="generate"){await lc(e,t.base,t.steps,o);return}if(!t.stale)return;let i=`${e}/${t.stale}`;if(!await ve(i).exists())return;await Ya`rm -rf ${i}`.quiet();let r=t.reason?.(n);if(r)console.log(`\uD83D\uDDD1\uFE0F Removed ${i} (${r})`)}async function es(e,t={}){await Jo(`${e}/.github/workflows`,{recursive:!0}),await Jo(`${e}/.github`,{recursive:!0});let n=await Bo(e),o=t.enabled??(n?Lo(ee,n):Xo()),s=t.postProcess??await cc(e,n),i=o.has("pages"),r=t.templateDocsSite??await ve(`${e}/apps/template-docs/.vitepress/config.mts`).exists(),a={pages:i,coverage:o.has("coverage"),native:o.has("native"),dependabot:o.has("dependabot")||o.has("gh-actions"),stale:o.has("stale"),templateDocsSite:r,pagesDeploysToSite:i&&!r};for(let c of pc)await uc(e,c,a,{...t,enabled:o,postProcess:s})}var Yo,Qa,Zo="quality",Za="gate",Ko,pc,yu;var ts=f(async()=>{I();Fo();Ho();Wo();Yo=/^[ \t]*#[ \t]*SECTION:[ \t]*([A-Za-z0-9_-]+)[ \t]*$/,Qa=/^ {2}([A-Za-z0-9_-]+):$/;Ko=["coverage","security","native","e2e"];pc=[{base:"ci.base.yml",steps:"ci.steps.yml",outcome:()=>"generate"},{base:"release.base.yml",steps:"release.steps.yml",outcome:()=>"generate"},{base:"pages.base.yml",steps:"pages.steps.yml",outcome:(e)=>e.pagesDeploysToSite?"generate":"remove",stale:".github/workflows/pages.yml",reason:(e)=>e.templateDocsSite?"template docs site deploys Pages":"pages disabled"},{base:"coverage.base.yml",steps:"coverage.steps.yml",outcome:(e)=>{if(!e.coverage)return"skip";return e.pagesDeploysToSite||e.templateDocsSite?"remove":"generate"},stale:".github/workflows/coverage.yml",reason:(e)=>e.templateDocsSite?"coverage published by the docs site":"coverage included in pages.yml"},{base:"native.base.yml",steps:"native.steps.yml",outcome:(e)=>e.native?"generate":"remove",stale:".github/workflows/native.yml",reason:()=>"native disabled"},{base:"dependabot.base.yml",steps:"dependabot.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"dependabot-auto-merge.base.yml",steps:"dependabot-auto-merge.steps.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"stale.base.yml",steps:"stale.steps.yml",outcome:(e)=>e.stale?"generate":"remove",stale:".github/workflows/stale.yml"}];yu=process.argv[2]??"."});import{existsSync as ns}from"fs";import{cp as os,rm as ss}from"fs/promises";var{spawnSync:mc}=globalThis.Bun;function Ne(e){return console.log(`
\u25B8 ${e.join(" ")}`),mc({cmd:e,stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}var Gt=".pages",is="apps/template-docs",le,Ft="coverage/html",dc,gc;var rs=f(async()=>{k();await ts();le=`${is}/dist`;dc=l({meta:{name:"m docs",version:"1.0.0",description:"Regenerate workflows from configs/* \u2014 static README/AGENTS with TEMPLATE-ONLY blocks"},args:{dir:{type:"string",description:"Target directory (default: .)",required:!1,default:"."}},subCommands:{site:l({meta:{name:"site",description:"Build one Pages artifact: docs + coverage report + demo app"},args:{"skip-coverage":{type:"boolean",description:"Reuse coverage/lcov.info instead of re-running the test suite",default:!1},"skip-app":{type:"boolean",description:"Skip building and copying the demo app to /example/",default:!1}},async run({args:e}){if(!e["skip-coverage"]){let n=Ne(["bun","run","coverage"]);if(n!==0)console.error(`::error::bun run coverage failed (exit ${n})`),process.exit(n)}Ne(["bun","run","m coverage","setup"]),Ne(["bun","run","m coverage","html"]);let t=Ne(["bun","run","docs:build"]);if(t!==0)console.error(`::error::${is} build failed (exit ${t})`),process.exit(t);if(ns(`${Ft}/index.html`))await ss(`${le}/coverage`,{recursive:!0,force:!0}),await os(Ft,`${le}/coverage`,{recursive:!0}),console.log(`\u2705 Coverage report copied to ${le}/coverage`);else console.warn(`\u26A0\uFE0F ${Ft}/ not found \u2014 skipping /coverage/`);if(!e["skip-app"]){let n=Ne(["bun","run","m pages","build"]);if(n!==0)console.error(`::error::m pages build failed (exit ${n})`),process.exit(n);if(ns(Gt))await ss(`${le}/example`,{recursive:!0,force:!0}),await os(Gt,`${le}/example`,{recursive:!0}),console.log(`\u2705 Pages artifact copied to ${le}/example`);else console.warn(`\u26A0\uFE0F ${Gt}/ not found \u2014 skipping /example/`)}if(console.log(`
\u2705 Site ready: ${le}`),console.log("   /            docs"),console.log("   /status      coverage, CI, versions"),console.log("   /coverage/   HTML coverage report"),!e["skip-app"])console.log("   /example/    demo app");process.exit(0)}})},async run({args:e}){await es(e.dir||".")}}),gc=dc});k();var fc={lint:()=>Promise.resolve().then(() => (pn(),{})).then((e)=>Es),"lint:fix":()=>Promise.resolve().then(() => (un(),{})).then((e)=>Os),biome:()=>Promise.resolve().then(() => (mn(),{})).then((e)=>Ns),typecheck:()=>Promise.resolve().then(() => (dn(),{})).then((e)=>Ds),turbo:()=>Promise.resolve().then(() => (gn(),{})).then((e)=>Ls),build:()=>Promise.resolve().then(() => (ut(),{})).then((e)=>Hs),health:()=>Promise.resolve().then(() => (hn(),{})).then((e)=>qs),bun:()=>Promise.resolve().then(() => (wn(),{})).then((e)=>si),test:()=>Promise.resolve().then(() => (kn(),{})).then((e)=>ii),coverage:()=>Promise.resolve().then(() => (On(),{})).then((e)=>$i),changeset:()=>Promise.resolve().then(() => (bt(),{})).then((e)=>Pi),commitlint:()=>Promise.resolve().then(() => (jn(),{})).then((e)=>Bi),setup:()=>Promise.resolve().then(() => (Mn(),{})).then((e)=>Ki),ci:()=>Promise.resolve().then(() => (He(),{})).then((e)=>or),"ci:lint":()=>Promise.resolve().then(() => (Fn(),{})).then((e)=>sr),"ci:local":()=>Promise.resolve().then(() => (Vn(),{})).then((e)=>ir),gitleaks:()=>Promise.resolve().then(() => (Un(),{})).then((e)=>lr),trivy:()=>Promise.resolve().then(() => (qn(),{})).then((e)=>hr),codeql:()=>Promise.resolve().then(() => (Wn(),{})).then((e)=>br),native:()=>Promise.resolve().then(() => (go(),{})).then((e)=>la),e2e:()=>Promise.resolve().then(() => (ho(),{})).then((e)=>ma),pages:()=>Promise.resolve().then(() => (ko(),{})).then((e)=>Ta),skills:()=>Promise.resolve().then(() => ($o(),{})).then((e)=>La),badges:()=>Promise.resolve().then(() => (Ao(),{})).then((e)=>Ba),docs:()=>rs().then(() => ({})).then((e)=>gc)},hc=l({meta:{name:"m",version:"0.1.0",description:"Unified monorepo toolchain CLI"},subCommands:fc});ct(hc);

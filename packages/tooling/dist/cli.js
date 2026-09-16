#!/usr/bin/env bun
// @bun
var ys=Object.create;var{getPrototypeOf:ws,defineProperty:Zt,getOwnPropertyNames:ks}=Object;var en=Object.prototype.hasOwnProperty;function xs(e){return this[e]}var Cs,Ss,Wc=(e,t,n)=>{var o=e!=null&&typeof e==="object";if(o){var s=t?Cs??=new WeakMap:Ss??=new WeakMap,i=s.get(e);if(i)return i}n=e!=null?ys(ws(e)):{};let r=t||!e||!e.__esModule||!en.call(e,"default")?Zt(n,"default",{value:e,enumerable:!0}):n;if(e&&typeof e==="object"||typeof e==="function"){for(let a of ks(e))if(!en.call(r,a))Zt(r,a,{get:xs.bind(e,a),enumerable:!0})}if(o)s.set(e,r);return r};var Jc=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var f=(e,t,n)=>()=>{if(e)try{t=e(e=0)}catch(o){n=[o]}if(n)throw n[0];return t};function As(e=""){if($s.test(e))return;return e!==e.toLowerCase()}function tn(e,t){let n=t??Rs,o=[];if(!e||typeof e!=="string")return o;let s="",i,r;for(let a of e){let c=n.includes(a);if(c===!0){o.push(s),s="",i=void 0;continue}let u=As(a);if(r===!1){if(i===!1&&u===!0){o.push(s),s=a,i=u;continue}if(i===!0&&u===!1&&s.length>1){let p=s.at(-1);o.push(s.slice(0,Math.max(0,s.length-1))),s=p+a,i=u;continue}}s+=a,i=u,r=c}return o.push(s),o}function Ts(e){return e?e[0].toUpperCase()+e.slice(1):""}function Es(e){return e?e[0].toLowerCase()+e.slice(1):""}function _s(e,t){return e?(Array.isArray(e)?e:tn(e)).map((n)=>Ts(t?.normalize?n.toLowerCase():n)).join(""):""}function Ce(e,t){return Es(_s(e||"",t))}function Be(e,t){return e?(Array.isArray(e)?e:tn(e)).map((n)=>n.toLowerCase()).join(t??"-"):""}function nn(e){return Be(e||"","_")}var $s,Rs;var on=f(()=>{$s=/\d/,Rs=["-","_","/","."]});import{parseArgs as Os}from"util";function Se(e){if(Array.isArray(e))return e;return e===void 0?[]:[e]}function ut(e,t=""){let n=[];for(let o of e)for(let[s,i]of o.entries())n[s]=Math.max(n[s]||0,i.length);return e.map((o)=>o.map((s,i)=>t+s[i===0?"padStart":"padEnd"](n[i])).join("  ")).join(`
`)}function E(e){return typeof e==="function"?e():e}function Is(e=[],t={}){let n=new Set(t.boolean||[]),o=new Set(t.string||[]),s=t.alias||{},i=t.default||{},r=new Map,a=new Map;for(let[d,h]of Object.entries(s)){let R=h;for(let B of R){if(r.set(d,B),!a.has(B))a.set(B,[]);if(a.get(B).push(d),r.set(B,d),!a.has(d))a.set(d,[]);a.get(d).push(B)}}let c={};function u(d){if(n.has(d))return"boolean";let h=a.get(d)||[];for(let R of h)if(n.has(R))return"boolean";return"string"}function p(d){if(o.has(d))return!0;let h=a.get(d)||[];for(let R of h)if(o.has(R))return!0;return!1}let k=new Set([...n,...o,...Object.keys(s),...Object.values(s).flat(),...Object.keys(i)]);for(let d of k)if(!c[d])c[d]={type:u(d),default:i[d]};for(let[d,h]of r.entries())if(d.length===1&&c[h]&&!c[h].short)c[h].short=d;let b=[],m={};for(let d=0;d<e.length;d++){let h=e[d];if(h==="--"){b.push(...e.slice(d));break}if(h.startsWith("--no-")){let R=h.slice(5);m[R]=!0;continue}b.push(h)}let C;try{C=Os({args:b,options:Object.keys(c).length>0?c:void 0,allowPositionals:!0,strict:!1})}catch{C={values:{},positionals:b}}let y={_:[]};y._=C.positionals;for(let[d,h]of Object.entries(C.values)){let R=h;if(u(d)==="boolean"&&typeof h==="string")R=h!=="false";else if(p(d)&&typeof h==="boolean")R="";y[d]=R}for(let[d]of Object.entries(m)){y[d]=!1;let h=r.get(d);if(h)y[h]=!1;let R=a.get(d);if(R)for(let B of R)y[B]=!1}for(let[d,h]of r.entries()){if(y[d]!==void 0&&y[h]===void 0)y[h]=y[d];if(y[h]!==void 0&&y[d]===void 0)y[d]=y[h];if(y[d]!==y[h]&&i[h]===y[h])y[h]=y[d]}return y}function Ns(e,t){let n={boolean:[],string:[],alias:{},default:{}},o=an(t);for(let a of o){if(a.type==="positional")continue;if(a.type==="string"||a.type==="enum")n.string.push(a.name);else if(a.type==="boolean")n.boolean.push(a.name);if(a.default!==void 0)n.default[a.name]=a.default;if(a.alias)n.alias[a.name]=a.alias;let c=Ce(a.name),u=Be(a.name);if(c!==a.name||u!==a.name){let p=Se(n.alias[a.name]||[]);if(c!==a.name&&!p.includes(c))p.push(c);if(u!==a.name&&!p.includes(u))p.push(u);if(p.length>0)n.alias[a.name]=p}}let s=Is(e,n),[...i]=s._,r=new Proxy(s,{get(a,c){return a[c]??a[Ce(c)]??a[Be(c)]}});for(let[,a]of o.entries())if(a.type==="positional"){let c=i.shift();if(c!==void 0)r[a.name]=c;else if(a.default===void 0&&a.required!==!1)throw new G(`Missing required positional argument: ${a.name.toUpperCase()}`,"EARG");else r[a.name]=a.default}else if(a.type==="enum"){let c=r[a.name],u=a.options||[];if(c!==void 0&&u.length>0&&!u.includes(c))throw new G(`Invalid value for argument: ${D(`--${a.name}`)} (${D(c)}). Expected one of: ${u.map((p)=>D(p)).join(", ")}.`,"EARG")}else if(a.required&&r[a.name]===void 0)throw new G(`Missing required argument: --${a.name}`,"EARG");return r}function an(e){let t=[];for(let[n,o]of Object.entries(e||{}))t.push({...o,name:n,alias:Se(o.alias)});return t}async function Ds(e){return Promise.all(e.map((t)=>E(t)))}function l(e){return e}async function q(e,t){let n=await E(e.args||{}),o=Ns(t.rawArgs,n),s={rawArgs:t.rawArgs,args:o,data:t.data,cmd:e},i=await Ds(e.plugins??[]),r,a;try{for(let p of i)await p.setup?.(s);if(typeof e.setup==="function")await e.setup(s);let u=await E(e.subCommands);if(u&&Object.keys(u).length>0){let p=cn(t.rawArgs,n),k=t.rawArgs[p];if(k){let b=await gt(u,k);if(!b)throw new G(`Unknown command ${D(k)}`,"E_UNKNOWN_COMMAND");await q(b,{rawArgs:t.rawArgs.slice(p+1)})}else{let b=await E(e.default);if(b){if(e.run)throw new G("Cannot specify both 'run' and 'default' on the same command.","E_DEFAULT_CONFLICT");let m=await gt(u,b);if(!m)throw new G(`Default sub command ${D(b)} not found in subCommands.`,"E_UNKNOWN_COMMAND");await q(m,{rawArgs:t.rawArgs})}else if(!e.run)throw new G("No command specified.","E_NO_COMMAND")}}if(typeof e.run==="function")r=await e.run(s)}catch(u){a=u}let c=[];if(typeof e.cleanup==="function")try{await e.cleanup(s)}catch(u){c.push(u)}for(let u of[...i].reverse())try{await u.cleanup?.(s)}catch(p){c.push(p)}if(a)throw a;if(c.length===1)throw c[0];if(c.length>1)throw Error("Multiple cleanup errors",{cause:c});return{result:r}}async function dt(e,t,n){let o=await E(e.subCommands);if(o&&Object.keys(o).length>0){let s=cn(t,await E(e.args||{})),i=t[s],r=await gt(o,i);if(r)return dt(r,t.slice(s+1),e)}return[e,n]}async function gt(e,t){if(t in e)return E(e[t]);for(let n of Object.values(e)){let o=await E(n),s=await E(o?.meta);if(s?.alias){if(Se(s.alias).includes(t))return o}}}function cn(e,t){for(let n=0;n<e.length;n++){let o=e[n];if(o==="--")return-1;if(o.startsWith("-")){if(!o.includes("=")&&js(o,t))n++;continue}return n}return-1}function js(e,t){let n=e.replace(/^-{1,2}/,""),o=Ce(n);for(let[s,i]of Object.entries(t)){if(i.type!=="string"&&i.type!=="enum")continue;if(o===Ce(s))return!0;if((Array.isArray(i.alias)?i.alias:i.alias?[i.alias]:[]).includes(n))return!0}return!1}async function ln(e,t){try{console.log(await pn(e,t)+`
`)}catch(n){console.error(n)}}async function pn(e,t){let n=await E(e.meta||{}),o=an(await E(e.args||{})),s=await E(t?.meta||{}),i=`${s.name?`${s.name} `:""}`+(n.name||process.argv[1]),r=[],a=[],c=[],u=[];for(let m of o)if(m.type==="positional"){let C=m.name.toUpperCase(),y=m.required!==!1&&m.default===void 0;a.push([D(C+mt(m)),sn(m,y)]),u.push(y?`<${C}>`:`[${C}]`)}else{let C=m.required===!0&&m.default===void 0,y=[...(m.alias||[]).map((d)=>`-${d}`),`--${m.name}`].join(", ")+mt(m);if(r.push([D(y),sn(m,C)]),m.type==="boolean"&&(m.default===!0||m.negativeDescription)&&!Ls.test(m.name)){let d=[...(m.alias||[]).map((h)=>`--no-${h}`),`--no-${m.name}`].join(", ");r.push([D(d),[m.negativeDescription,C?Ue("(Required)"):""].filter(Boolean).join(" ")])}if(C)u.push(`--${m.name}`+mt(m))}if(e.subCommands){let m=[],C=await E(e.subCommands);for(let[y,d]of Object.entries(C)){let h=await E((await E(d))?.meta);if(h?.hidden)continue;let R=Se(h?.alias),B=[y,...R].join(", ");c.push([D(B),h?.description||""]),m.push(y,...R)}u.push(m.join("|"))}let p=[],k=n.version||s.version;p.push(Ue(`${n.description} (${i+(k?` v${k}`:"")})`),"");let b=r.length>0||a.length>0;if(p.push(`${Ge(Ve("USAGE"))} ${D(`${i}${b?" [OPTIONS]":""} ${u.join(" ")}`)}`,""),a.length>0)p.push(Ge(Ve("ARGUMENTS")),""),p.push(ut(a,"  ")),p.push("");if(r.length>0)p.push(Ge(Ve("OPTIONS")),""),p.push(ut(r,"  ")),p.push("");if(c.length>0)p.push(Ge(Ve("COMMANDS")),""),p.push(ut(c,"  ")),p.push("",`Use ${D(`${i} <command> --help`)} for more information about a command.`);return p.filter((m)=>typeof m==="string").join(`
`)}function mt(e){let t=e.valueHint?`=<${e.valueHint}>`:"",n=t||`=<${nn(e.name)}>`;if(!e.type||e.type==="positional"||e.type==="boolean")return t;if(e.type==="enum"&&e.options?.length)return`=<${e.options.join("|")}>`;return n}function sn(e,t){let n=t?Ue("(Required)"):"",o=e.default===void 0?"":Ue(`(Default: ${e.default})`);return[e.description,n,o].filter(Boolean).join(" ")}async function ft(e,t={}){let n=t.rawArgs||process.argv.slice(2),o=t.showUsage||ln;try{let s=await Ms(e);if(s.help.length>0&&n.some((i)=>s.help.includes(i)))await o(...await dt(e,n)),process.exit(0);else if(n.length===1&&s.version.includes(n[0])){let i=typeof e.meta==="function"?await e.meta():await e.meta;if(!i?.version)throw new G("No version specified","E_NO_VERSION");console.log(i.version)}else await q(e,{rawArgs:n})}catch(s){if(s instanceof G)await o(...await dt(e,n)),console.error(s.message);else console.error(s,`
`);process.exit(1)}}async function Ms(e){let t=await E(e.args||{}),n=new Set,o=new Set;for(let[s,i]of Object.entries(t)){n.add(s);for(let r of Se(i.alias))o.add(r)}return{help:rn("help","h",n,o),version:rn("version","v",n,o)}}function rn(e,t,n,o){if(n.has(e)||o.has(e))return[];if(n.has(t)||o.has(t))return[`--${e}`];return[`--${e}`,`-${t}`]}var G,Ps,Fe=(e,t=39)=>(n)=>Ps?n:`\x1B[${e}m${n}\x1B[${t}m`,Ve,D,Ue,Ge,Ls;var He=f(()=>{on();G=class extends Error{code;constructor(e,t){super(e);this.name="CLIError",this.code=t}};Ps=(()=>{let e=globalThis.process?.env??{};return e.NO_COLOR==="1"||e.TERM==="dumb"||e.TEST||e.CI})(),Ve=Fe(1,22),D=Fe(36),Ue=Fe(90),Ge=Fe(4,24);Ls=/^no[-A-Z]/});var{spawnSync:un}=globalThis.Bun;function g(e,t={}){return un({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}function ht(e,t={}){let n=un({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"pipe",stderr:"pipe",stdin:"inherit"});return{exitCode:n.exitCode,output:`${n.stdout.toString()}${n.stderr.toString()}`}}function bt(e,t="",n=15){let o=t.split(`
`).map((i)=>i.trimEnd()).filter((i)=>i.length>0).slice(-n).join(`
`),s=o?`${e}
${o}`:e;if(console.error(`::error::${s.replace(/%/g,"%25").replace(/\n/g,"%0A").replace(/\r/g,"%0D")}`),!process.env.GITHUB_ACTIONS)console.error(s)}function P(e){return l({meta:{name:e.name,version:e.version??"1.0.0",description:e.description},subCommands:e.subCommands,args:{[e.argsName??"args"]:{type:"positional",description:e.argsDescription??"Extra args passed to underlying tool",required:!1}},run(){let t=v(e.name),n=e.configArgs??[],o=e.passthrough?[e.binPath,...t]:e.configArgsPlacement==="append"?[e.binPath,...t,...n]:[e.binPath,...n,...t];process.exit(g(o))}})}function U(e){let t=e.argsDescription?{args:{args:{type:"positional",description:e.argsDescription,required:!1}}}:{};return l({meta:{name:e.name,description:e.description},...t,run(){let n=v(e.name),o=n.length===0&&e.defaultArgs?e.defaultArgs:n;process.exit(e.spawn([...e.prefixArgs??[],...o]))}})}function v(e){let t=process.argv.slice(2),n=t.lastIndexOf(e);return n===-1?t:t.slice(n+1)}var w=f(()=>{He();He()});import{existsSync as gn,readFileSync as fn}from"fs";import{dirname as hn,join as fe}from"path";function F(e=import.meta.dir){let t=mn.get(e);if(t!==void 0)return t;let n=e;while(!0){let o=fe(n,"package.json");if(gn(o))try{if(JSON.parse(fn(o,"utf8")).name===vt)return mn.set(e,n),n}catch{}let s=hn(n);if(s===n)break;n=s}throw Error(`Could not locate the ${vt} package root: walked up from ${e} to the filesystem root without finding a package.json named "${vt}". This module ships inside that package, so either it was copied out of the package or the package was renamed without updating PKG_NAME in src/utils/paths.ts.`)}function ee(e=process.cwd()){let t=dn.get(e);if(t!==void 0)return t;let n=e;while(!0){let o=fe(n,"package.json");if(gn(o))try{if(JSON.parse(fn(o,"utf8")).workspaces)return dn.set(e,n),n}catch{}let s=hn(n);if(s===n)return e;n=s}}function te(){return fe(F(),"src","configs")}function N(e){return fe(te(),e)}function qe(...e){return fe(F(),"src",...e)}function bn(){return fe(F(),"skills")}var vt="@myorg/tooling",mn,dn,Bs="packages/tooling",rl;var _=f(()=>{mn=new Map;dn=new Map;rl=`${Bs}/src/configs`});var Vs,Gs;var vn=f(()=>{_();w();Vs=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Gs=P({name:"lint",version:"1.0.0",description:"Lint and format check (Biome, shared config)",binPath:Vs,configArgs:["check",`--config-path=${te()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to check (default: whole repo)"})});var Us,Fs;var yn=f(()=>{_();w();Us=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Fs=P({name:"lint:fix",version:"1.0.0",description:"Lint and format, applying safe fixes (Biome, shared config)",binPath:Us,configArgs:["check","--write",`--config-path=${te()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to fix (default: whole repo)"})});var Hs,qs;var wn=f(()=>{_();w();Hs=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),qs=P({name:"biome",version:"1.0.0",description:"Biome with baked config path \u2014 lint and format, no root biome.json needed",binPath:Hs,configArgs:[`--config-path=${te()}`],configArgsPlacement:"append",argsName:"command",argsDescription:"Biome command (check, lint, format, etc.)"})});var Ws,Js;var kn=f(()=>{w();Ws=Bun.fileURLToPath(import.meta.resolve("typescript/package.json").replace("package.json","bin/tsc")),Js=P({name:"typecheck",version:"1.0.0",description:"TypeScript wrapper \u2014 tsc owned by @myorg/tooling, use m typecheck not tsc",binPath:"bun",configArgs:[Ws],argsName:"args",argsDescription:"tsc args"})});var Ks,Ys;var xn=f(()=>{_();w();Ks=Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));process.env.TURBO_GLOBAL_WARNING_DISABLED="1";Ys=P({name:"turbo",version:"1.0.0",description:"Turbo with baked root config \u2014 no root turbo.json needed, uses turbo.base.json",binPath:"bun",configArgs:[Ks,`--root-turbo-json=${N("turbo.base.json")}`],argsName:"task",argsDescription:"Turbo task (build, dev, test, typecheck, etc.)"})});import{existsSync as zs,readFileSync as Cn}from"fs";var{Glob:Xs}=globalThis.Bun;function Qs(){try{let e=JSON.parse(Cn("package.json","utf8")),t=Array.isArray(e.workspaces)?e.workspaces.filter((n)=>typeof n==="string"):[];if(t.length>0)return t}catch{}return["packages/*","apps/*"]}function Zs(){let e=[];for(let t of Qs())for(let n of new Xs(`${t}/package.json`).scanSync("."))try{if(JSON.parse(Cn(n,"utf8")).private===!0)continue;let s=n.replace("/package.json","");if(zs(`${s}/package.json`))e.push(s)}catch{}return e.sort()}var yt,ei,ti,ni;var wt=f(()=>{w();yt=l({meta:{name:"health",description:"publint + arethetypeswrong over every publishable package"},run(){let e=Zs();if(e.length===0)console.log("\u2139\uFE0F No publishable packages \u2014 skipping package health checks"),process.exit(0);console.log(`\uD83D\uDD28 Building before health checks (${e.length} package(s))`);let t=g(["bun","run","build"]);if(t!==0)console.error("::error::build failed, cannot run package health checks"),process.exit(t);let n=0;for(let o of e){if(console.log(`
\uD83D\uDCE6 ${o}`),g(["bunx","--yes","publint",o])!==0)console.error(`::error::publint failed for ${o}`),n++;if(g(["bunx","--yes","@arethetypeswrong/cli","--pack",".","--profile","esm-only"],{cwd:o})!==0)console.error(`::error::arethetypeswrong failed for ${o}`),n++}if(n>0)console.error(`
::error::${n} package health check(s) failed`),process.exit(1);console.log(`
\u2705 Package health OK (${e.length} package(s))`),process.exit(0)}}),ei=Bun.fileURLToPath(import.meta.resolve("bunup/package.json").replace("package.json","dist/cli/index.js")),ti=P({name:"build",version:"1.0.0",description:"Bunup wrapper \u2014 bundler owned by @myorg/tooling, use m build not bunup",binPath:"bun",configArgs:[ei],argsName:"entry",argsDescription:"Entry files or bunup args",subCommands:{health:yt}}),ni=ti});var oi;var Sn=f(()=>{wt();oi=yt});import{existsSync as $n,readdirSync as si,rmSync as ii}from"fs";var{which:ri}=globalThis.Bun;async function Rn(){if(!ri("bun"))console.error("m bun coverage needs `bun` on PATH."),process.exit(1);console.log(`Running per-package coverage via turbo...
`),process.exit(g([...ai,"coverage"]))}function An(){let e=["apps","packages","configs"],t=0;for(let n of e){if(!$n(n))continue;for(let o of si(n,{withFileTypes:!0})){if(!o.isDirectory())continue;let s=`${n}/${o.name}/node_modules`;if(!$n(s))continue;ii(s,{recursive:!0,force:!0}),t++}}console.log(`\uD83E\uDDF9 Removed ${t} workspace node_modules dir(s) (root node_modules kept)`)}var kt,ai,ne,ci,li,pi,$e,ui,mi,di,gi,fi,hi;var Tn=f(()=>{_();w();kt=N("bunfig.toml"),ai=["bun",`${F()}/src/cli.ts`,"turbo"];ne=v("bun"),ci=["coverage","test","clean:modules"],li=ne.includes("--help")||ne.includes("-h"),pi=ne.includes("--version")||ne.includes("-v"),$e=ne[0],ui=process.argv.slice(2).includes("bun");if(ui&&$e&&!ci.includes($e)&&!$e.startsWith("-")&&!li&&!pi){let e=$e==="test"?["bun",$e,`--config=${kt}`,...ne.slice(1)]:["bun",...ne];process.exit(g(e))}mi=l({meta:{name:"coverage",description:"Run per-package coverage via turbo then merge LCOV"},run:async()=>{await Rn()}}),di=l({meta:{name:"clean:modules",description:"Remove workspace node_modules dirs (keeps the root one)"},run(){An(),process.exit(0)}}),gi=l({meta:{name:"test",description:"Run bun test with shared bunfig.toml config"},run(){let e=v("test");process.exit(g(["bun","test",`--config=${kt}`,...e]))}}),fi=l({meta:{name:"bun",version:"1.0.0",description:"Bun wrapper \u2014 injects shared bunfig.toml for test, provides coverage merging"},subCommands:{coverage:mi,test:gi,"clean:modules":di},async run(){let e=v("bun"),t=e[0];if(t==="coverage"){await Rn();return}if(t==="clean:modules")An(),process.exit(0);let n=t==="test"?["bun",t,`--config=${kt}`,...e.slice(1)]:["bun",...e];process.exit(g(n))}}),hi=fi});var bi;var En=f(()=>{_();w();bi=l({meta:{name:"test",description:"Run bun test with the shared bunfig.toml config"},args:{args:{type:"positional",description:"Extra args for bun test",required:!1}},run(){let e=process.argv.slice(2),t=e.lastIndexOf("test"),n=t===-1?[]:e.slice(t+1);process.exit(g(["bun","test",`--config=${N("bunfig.toml")}`,...n]))}})});var S="coverage/lcov.info",he="coverage/rust-lcov.info",W="coverage/html",Re=80;var _n=()=>{};import{existsSync as j,mkdirSync as In,readdirSync as vi,readFileSync as Pn,renameSync as xt,writeFileSync as yi}from"fs";import{dirname as wi,join as On}from"path";var{which:ki}=globalThis.Bun;function J(e){return Boolean(ki(e))}function We(e=S){if(!j(e))return null;let t=0,n=0;for(let o of Pn(e,"utf8").split(`
`))if(o.startsWith("LF:"))n+=Number(o.slice(3));else if(o.startsWith("LH:"))t+=Number(o.slice(3));if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function Ci(e){let t=0,n=0;for(let o of e){let s=We(o);if(!s)continue;t+=s.hit,n+=s.found}if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function Dn(){return`{${[...Nn].join(",")}}/*/coverage/lcov.info`}function jn(e="."){let t=new Bun.Glob(Dn());return Array.from(t.scanSync({cwd:e})).filter(Boolean).map((n)=>e==="."?n:`${e}/${n}`).sort()}function Si(e,t){return e>=t}function $i(e="."){let t=[];for(let n of[...Nn]){let o=On(e,n);if(!j(o))continue;for(let s of vi(o,{withFileTypes:!0})){if(!s.isDirectory())continue;let i=On(o,s.name,"package.json");if(!j(i))continue;let r;try{r=JSON.parse(Pn(i,"utf8"))}catch{continue}if(!r.name||!(r.scripts?.test||r.scripts?.coverage))continue;t.push({name:r.name.replace(/^@[^/]+\//,""),dir:`${n}/${s.name}`})}}return t.sort((n,o)=>n.dir.localeCompare(o.dir))}function Ri(e,t){let n=["# Generated by `m coverage sync` (packages/tooling) \u2014 do not edit.","# Refreshed on every `bun install` (prepare) and by `bun run docs:sync`.","codecov:","  require_ci_to_pass: true","  notify:","    wait_for_ci: true","","coverage:","  precision: 2","  round: down",'  range: "70...100"',"  status:","    # Overall monorepo gate \u2014 mirrors COVERAGE_THRESHOLD.","    project:","      default:",`        target: ${t}%`,"        threshold: 1%","    # Patch coverage on PRs.","    patch:","      default:",`        target: ${t}%`,"        threshold: 5%","","flag_management:","  default_rules:","    carryforward: true","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 1%","","component_management:","  default_rules:","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 2%","  individual_components:"];for(let o of e)n.push(`    - component_id: ${o.name}`,`      name: ${o.dir}`,"      paths:",`        - "${o.dir}/**"`);return n.push("","comment:",'  layout: "reach,diff,flags,components,tree"',"  behavior: default","  require_changes: true","  show_carryforward_flags: true",""),n.join(`
`)}function Ai(e,t){let n=(o)=>o?`${o.percent.toFixed(2)}% (${o.hit}/${o.found})`:"\u2014";return["## \uD83D\uDCCA Coverage Summary","","| Package | Lines |","|---------|-------|",...e.map((o)=>`| \`${o.dir}\` | ${n(o.totals)} |`),...t?[`| **merged** | **${n(t)}** |`]:[],""].join(`
`)}function Ln(){if(J("lcov")&&J("genhtml")){console.log("\u2705 lcov already installed");return}let e=1;if(process.platform==="darwin")e=g(["brew","install","lcov"]);else{let t=J("sudo")?["sudo","apt-get"]:["apt-get"];e=g([...t,"update"])===0?g([...t,"install","-y","lcov"]):1}if(e===0)console.log("\u2705 lcov installed");else console.warn("\u26A0\uFE0F lcov install failed \u2014 HTML reports will be skipped (threshold check still runs)")}function Mn(e=W){if(!j(S)){console.warn(`\u26A0\uFE0F ${S} not found \u2014 skipping HTML report`);return}if(!J("genhtml")){console.warn("\u26A0\uFE0F genhtml not found \u2014 run `m coverage setup` first (HTML report skipped)");return}In(e,{recursive:!0});let t=g(["genhtml",S,"--output-directory",e,"--title","Coverage Report","--show-details","--highlight","--legend"]);if(t===0)console.log(`
\u2705 HTML report: ${e}/index.html`);process.exit(t)}var xi,Nn,Ti,Ei,_i,Oi,Ii,Pi,Ni,Di,ji,Li;var Bn=f(()=>{w();_n();xi=`${W}/index.html`;Nn=["packages","apps"];Ti=l({meta:{name:"setup",description:"Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)"},run(){Ln(),process.exit(0)}}),Ei=l({meta:{name:"html",description:"Generate HTML report via genhtml from coverage/lcov.info"},args:{out:{type:"string",description:`Output directory (default: ${W})`,default:W}},run({args:e}){Mn(e.out||W),process.exit(0)}}),_i=l({meta:{name:"check",description:`Check coverage threshold (default ${Re}%) against coverage/lcov.info`},args:{threshold:{type:"string",description:"Threshold percent",default:String(Re)}},run({args:e}){let t=We();if(!t){console.warn(`\u26A0\uFE0F ${S} not found or has no line data \u2014 skipping threshold check`);return}let n=Number(e.threshold??Re),o=t.percent;if(console.log(`Line coverage: ${o.toFixed(2)}% (${t.hit}/${t.found} lines) \u2014 threshold ${n}%`),!Si(o,n))console.error(`::error::Coverage ${o.toFixed(2)}% is below ${n}% threshold`),process.exit(1);console.log(`\u2705 Coverage ${o.toFixed(2)}% meets threshold`),process.exit(0)}}),Oi=l({meta:{name:"collect",description:"Collect JS coverage (bun run coverage) + Rust coverage (m native llvm-cov), then merge"},run(){if(g(["bun","run","coverage"]),!j("Cargo.toml")||!J("cargo-llvm-cov"))console.warn("\u26A0\uFE0F cargo-llvm-cov not installed \u2014 skipping Rust coverage"),process.exit(0);if(console.log("\uD83E\uDD80 Collecting Rust coverage via m native llvm-cov"),g(["m native","llvm-cov","--lcov","--output-path",he]),!j(he))process.exit(0);if(!j(S))xt(he,S),process.exit(0);if(J("lcov")){if(g(["lcov","--add-tracefile",S,"--add-tracefile",he,"--output-file","coverage/merged.lcov"])===0)xt("coverage/merged.lcov",S),console.log("\u2705 Merged Rust + JS coverage"),process.exit(0)}console.warn(`\u26A0\uFE0F lcov not available \u2014 Rust coverage kept at ${he}`)}}),Ii=l({meta:{name:"pages",description:"Publish the HTML report into the Pages artifact dir (served at /coverage/)"},async run(){if(!j(S))console.log("\u2139\uFE0F No coverage data \u2014 collecting first"),g(["bun","run","coverage"]);if(!j(S))console.warn("\u26A0\uFE0F Still no coverage/lcov.info \u2014 skipping Pages coverage"),process.exit(0);if(Ln(),Mn(),!j(xi))console.warn(`\u26A0\uFE0F No HTML report at ${W} \u2014 skipping Pages coverage`),process.exit(0);console.log(`\u2705 Coverage HTML ready at ${W}/ \u2014 \`m pages build\` folds it into the Pages artifact (served at /coverage/)`),process.exit(0)}}),Pi=l({meta:{name:"merge",description:"Merge per-package lcov.info reports into coverage/lcov.info"},args:{output:{type:"string",description:"Merged output file (default: coverage/lcov.info)",default:S},reportOnly:{type:"boolean",description:"Print the merged totals and the delta, write nothing",default:!1}},run({args:e}){let t=jn(".");if(t.length===0)console.warn("No per-package lcov.info found \u2014 nothing to merge"),process.exit(0);let n=e.output||S;if(e.reportOnly){let r=Ci(t),a=r?`${r.percent.toFixed(2)}% (${r.hit}/${r.found} lines)`:"no data";console.log("Report-only: the merge would measure"),console.log(`  ${t.length} report(s) \u2192 ${a}`),process.exit(0)}In(wi(n),{recursive:!0}),console.log(`Merging ${t.length} report(s) \u2192 ${n}`);let o=null;try{o=Bun.fileURLToPath(import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"))}catch{o=null}if(o){if(g(["bun",o,Dn(),n,"--prepend-source-files"])===0)console.log(`\u2705 Merged: ${n}`),process.exit(0);console.warn("\u26A0\uFE0F lcov-result-merger failed \u2014 falling back to lcov --add-tracefile")}if(!J("lcov"))console.error("\u274C lcov not found \u2014 run `m coverage setup` first"),process.exit(1);let s="coverage/merged.lcov",i=t.flatMap((r)=>["--add-tracefile",r]).concat(["--output-file",s]);if(g(["lcov",...i])!==0)console.error("\u274C Coverage merge failed"),process.exit(1);xt(s,n),console.log(`\u2705 Merged: ${n}`),process.exit(0)}}),Ni=l({meta:{name:"summary",description:"Show coverage summary (--json for scripts, --markdown for step summaries)"},args:{json:{type:"boolean",description:"Print JSON instead of a human-readable line"},markdown:{type:"boolean",description:"Print a per-package markdown table (for $GITHUB_STEP_SUMMARY)"}},run({args:e}){let t=We();if(e.markdown){let n=jn(".").map((o)=>({dir:o.replace(/\/coverage\/lcov\.info$/,""),totals:We(o)}));console.log(Ai(n,t)),process.exit(0)}if(e.json)console.log(JSON.stringify({source:S,available:Boolean(t),lines:{hit:t?.hit??0,found:t?.found??0,percent:t?Number(t.percent.toFixed(2)):0}})),process.exit(0);if(J("lcov")&&j(S))process.exit(g(["lcov","--summary",S]));if(!t)console.warn(`\u26A0\uFE0F ${S} not found`),process.exit(0);console.log(`lines: ${t.percent.toFixed(1)}% (${t.hit}/${t.found})`),process.exit(0)}}),Di=l({meta:{name:"sync",description:"Regenerate the root codecov.yml from the workspace package list"},args:{output:{type:"string",description:"Output file (default: codecov.yml)",default:"codecov.yml"}},run({args:e}){let t=e.output||"codecov.yml",n=$i(".");yi(t,Ri(n,Re)),console.log(`\u2705 ${t} \u2014 ${n.length} component(s): ${n.map((o)=>o.dir).join(", ")}`),process.exit(0)}}),ji=l({meta:{name:"m coverage",version:"1.0.0",description:"Coverage reporting \u2014 collect, merge, HTML, threshold check, Codecov, Pages publishing"},subCommands:{setup:Ti,collect:Oi,html:Ei,check:_i,pages:Ii,merge:Pi,summary:Ni,sync:Di},run(){console.log(`
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
`)}}),Li=ji});import{mkdir as Mi}from"fs/promises";var{file:Ct,write:Bi}=globalThis.Bun;async function $t(e="changeset"){if(e!=="changeset")throw Error(`Unknown init target '${e}' (expected "changeset")`);let t=".changeset/config.json",n=N("changeset.config.json");if(await Ct(t).exists()){console.log("Changeset config already exists; skipping.");return}if(!await Ct(n).exists())return;await Mi(".changeset",{recursive:!0}),await Bi(t,await Ct(n).text())}var Vn,be,Vi,St,Gi,Ui,Fi,Hi,qi,Wi;var Rt=f(()=>{_();w();Vn=Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js")),be=v("changeset"),Vi=["init"],St=be[0],Gi=be.includes("--help")||be.includes("-h"),Ui=be.includes("--version")||be.includes("-v"),Fi=process.argv.slice(2).includes("changeset");if(Fi&&St&&!Vi.includes(St)&&!St.startsWith("-")&&!Gi&&!Ui)process.exit(g(["bun",Vn,...be]));Hi=l({meta:{name:"init",description:"Ensure .changeset/config.json exists from shared template"},args:{target:{type:"positional",description:"Init target (default: changeset)",required:!1,default:"changeset"}},async run({args:e}){await $t(e.target??"changeset"),process.exit(0)}}),qi=l({meta:{name:"changeset",version:"1.0.0",description:"Changesets wrapper \u2014 init config and delegate to @changesets/cli"},subCommands:{init:Hi},run(){process.exit(g(["bun",Vn,...v("changeset")]))}}),Wi=qi});function oe(e){return Bun.which(e)}function Gn(e){return oe(K[e].bin)!==null}function se(e){console.warn(`\u26A0\uFE0F  ${e.label} not found \u2014 skipping ${e.purpose}.`),console.warn("   Install it to enable this step:");for(let t of e.install)console.warn(`     ${t}`);return console.warn("   Continuing: this step is optional locally and CI installs it."),0}function Y(e,t){let n=K[e],o=oe(n.bin);if(!o)return se(n);return t(o)}var K;var ie=f(()=>{K={actionlint:{bin:"actionlint",label:"actionlint",purpose:"local GitHub Actions workflow validation",install:["brew install actionlint","go install github.com/rhysd/actionlint/cmd/actionlint@latest","bun install --force          # retries the github-actionlint download"]},act:{bin:"act",label:"act",purpose:"running GitHub Actions workflows locally",install:["brew install act","sudo apt install act","go install github.com/nektos/act@latest"]},gitleaks:{bin:"gitleaks",label:"gitleaks",purpose:"secret scanning",install:["brew install gitleaks","https://github.com/gitleaks/gitleaks#installing"]},trivy:{bin:"trivy",label:"trivy",purpose:"vulnerability scanning",install:["brew install trivy","https://trivy.dev/latest/getting-started/installation/"]},cargo:{bin:"cargo",label:"Rust toolchain (cargo)",purpose:"native Rust workspace tasks",install:["rustup \u2014 https://rustup.rs"]},lcov:{bin:"lcov",label:"lcov",purpose:"merging coverage reports",install:["bun run m coverage setup"]},genhtml:{bin:"genhtml",label:"genhtml",purpose:"rendering the HTML coverage report",install:["bun run m coverage setup"]},commitlint:{bin:"commitlint",label:"commitlint",purpose:"Conventional Commits validation",install:["bun install          # @commitlint/cli is a workspace devDependency"]}}});import{existsSync as Fn}from"fs";import{join as Ji}from"path";function Ki(){let e=Ji(F(),"node_modules",".bin","commitlint");if(Fn(e))return e;return oe("commitlint")}function Yi(e){let t=Ki();if(!t)return se(K.commitlint);return g([t,"--config",N("commitlint.config.cjs"),...e])}var Un=`
m commitlint \u2014 Conventional Commits validation

Usage:
  m commitlint <file>    # validate the message in <file> (what the hook does)
  m commitlint           # validate a message piped on stdin

The commit-msg hook calls this as \`m commitlint {1}\`, where {1} is the path
git handed the hook. It cannot move to pre-commit: git passes pre-commit no
arguments at all and the message does not exist yet, so commit-msg is the
earliest hook that can see it.
`,zi,Xi;var Hn=f(()=>{_();w();ie();zi=l({meta:{name:"commitlint",version:"1.0.0",description:"Conventional Commits validation \u2014 defensive (skips if commitlint is missing)"},args:{file:{type:"positional",description:"Commit message file; omit to read the message from stdin",required:!1}},run(){let e=v("commitlint");if(e.includes("--help")||e.includes("-h"))console.log(Un),process.exit(0);let t=e[0];if(t!==void 0&&!Fn(t))console.error(`\u274C commit message file not found: ${t}`),process.exit(1);if(!t&&process.stdin.isTTY)console.log(Un),process.exit(0);process.exit(Yi(t?["--edit",t]:[]))}}),Xi=zi});import{readdir as Qi}from"fs/promises";import{join as Zi}from"path";var{$:qn,write:er}=globalThis.Bun;async function At(e="lefthook"){if(e!=="lefthook")throw Error(`Unknown setup target '${e}' (expected "lefthook")`);await er("lefthook.yml",`extends:
  - ${"node_modules/@myorg/tooling/src/configs/lefthook.base.yml"}
`);let n=await qn`bunx lefthook install`.quiet().nothrow();if(n.exitCode!==0){let s=n.stderr.toString().trim();if(console.warn("\u26A0\uFE0F lefthook install failed \u2014 Git hooks are not active."),s)console.warn(`   ${s.split(`
`).join(`
   `)}`);console.warn("   Re-run manually with: m setup lefthook");return}let o=await tr();if(o.length===0){console.warn("\u26A0\uFE0F lefthook installed no hooks \u2014 is this a Git repository?");return}console.log(`\u2705 lefthook hooks active: ${o.join(", ")}`)}async function tr(){let e;try{e=await Qi(Zi(await nr(),"hooks"))}catch{return[]}return e.filter((t)=>!t.endsWith(".sample")&&!t.endsWith(".old")).sort()}async function nr(){let e=await qn`git rev-parse --git-dir`.quiet().nothrow();if(e.exitCode!==0)return".git";return e.stdout.toString().trim()||".git"}var or,sr,ir,rr;var Wn=f(()=>{w();or=l({meta:{name:"lefthook",description:"Regenerate lefthook.yml wrapper and install Git hooks"},args:{target:{type:"positional",description:"Setup target (default: lefthook)",required:!1,default:"lefthook"}},async run({args:e}){await At(e.target??"lefthook")}}),sr=l({meta:{name:"bins",description:"Link m-bins into node_modules/.bin (handled by bun install)"},run(){console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.")}}),ir=l({meta:{name:"setup",version:"1.0.0",description:"Setup CLI \u2014 regenerates lefthook.yml, installs hooks, ensures changeset config"},subCommands:{lefthook:or,bins:sr},args:{target:{type:"positional",description:"Target (lefthook, bins, or empty for full setup)",required:!1}},async run({args:e}){let t=v("setup"),n=e.target??t[0]??"lefthook";if(n==="lefthook"){await At("lefthook");return}if(n==="bins")return;await At("lefthook");await Promise.resolve().then(() => Rt());await $t("changeset").catch(()=>{})}}),rr=ir});import{existsSync as Jn}from"fs";import{homedir as ar}from"os";import{join as Kn}from"path";function pr(){try{let e=Bun.fileURLToPath(import.meta.resolve("github-actionlint/package.json"));return Bun.file(e).json().version??null}catch{return null}}function ur(){let e=process.env.ACTIONLINT_BIN;if(e&&Jn(e))return e;let t=Bun.which("actionlint");if(t)return t;let n=process.env.ACTIONLINT_CACHE_DIR??Kn(ar(),".github-actionlint","bin"),o=pr();if(o){let s=Kn(n,o,process.platform==="win32"?"actionlint.exe":"actionlint");if(Jn(s))return s}return null}function Tt(e){let t=e.includes("--if-installed"),n=e.filter((s)=>s!=="--if-installed"),o=ur();if(!o){if(t)return se(K.actionlint);return console.error(lr),1}return g([o,`-config-file=${N("actionlint.yaml")}`,...n])}function Je(e){return Y("act",(t)=>g([t,...cr,...e]))}var cr,lr=`
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
`,mr,dr,gr,fr;var Ke=f(()=>{_();w();ie();cr=["-P","ubuntu-latest=catthehacker/ubuntu:act-latest","--container-architecture","linux/amd64"];mr=U({name:"lint",description:"Validate workflows via actionlint with shared config",argsDescription:"Extra args for actionlint",spawn:Tt}),dr=U({name:"act",description:"Run GitHub Actions locally via act with baked-in flags",argsDescription:"Extra args for act",spawn:Je}),gr=l({meta:{name:"ci",version:"1.0.0",description:"CI tooling for GitHub Actions \u2014 lint workflows and run locally with act"},subCommands:{lint:mr,act:dr},run(){let e=v("ci");if(e.length>0&&e[0]?.startsWith("-"))Je(e);else console.log(`
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
`)}}),fr=gr});var hr;var Yn=f(()=>{w();Ke();hr=l({meta:{name:"ci:lint",description:"Validate workflows via actionlint with shared config"},args:{args:{type:"positional",description:"Extra args for actionlint",required:!1}},run(){process.exit(Tt(v("ci:lint")))}})});var br;var zn=f(()=>{w();Ke();br=l({meta:{name:"ci:local",description:"Run the push workflow locally via act"},args:{args:{type:"positional",description:"Extra args for act",required:!1}},run(){process.exit(Je(["push",...v("ci:local")]))}})});function Et(e){return Y("gitleaks",(t)=>g([t,...e]))}var vr,yr,wr,kr;var Xn=f(()=>{w();ie();vr=U({name:"detect",description:"gitleaks detect --source . --no-git (scan repo)",prefixArgs:["detect"],defaultArgs:["--source",".","--no-git","--verbose"],spawn:Et}),yr=U({name:"protect",description:"gitleaks protect --staged (scan staged changes, pre-commit)",prefixArgs:["protect"],defaultArgs:["--staged","--verbose"],spawn:Et}),wr=l({meta:{name:"gitleaks",version:"1.0.0",description:"Gitleaks wrapper \u2014 secret scanning, defensive (skips if binary missing)"},subCommands:{detect:vr,protect:yr},run(){let e=v("gitleaks");if(e.length===0)console.log(`
m gitleaks \u2014 secret scanning wrapper

Usage:
  m gitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  m gitleaks protect [args]  # scan staged (default: --staged --verbose)

Install:
  brew install gitleaks
  go install github.com/gitleaks/gitleaks/v8@latest
  docker pull zricethezav/gitleaks:latest

If gitleaks is not installed, this wrapper warns and exits 0 (does not block).
`),process.exit(0);process.exit(Et(e))}}),kr=wr});import{existsSync as xr}from"fs";var{which:Cr}=globalThis.Bun;function Ot(e){return Y("trivy",(t)=>g([t,...e]))}var _t="apps/example/Dockerfile",Qn="app:trivy-scan",Sr,$r,Rr,Ar,Tr;var Zn=f(()=>{w();ie();Sr=l({meta:{name:"build",description:`docker build -t ${Qn} (image for the trivy image scan)`},run(){if(!xr(_t))console.warn(`\u26A0\uFE0F ${_t} not found \u2014 skipping image build`),process.exit(0);if(!Cr("docker"))console.warn("\u26A0\uFE0F docker not found \u2014 skipping image build"),process.exit(0);if(g(["docker","build","-t",Qn,"-f",_t,"."])!==0)console.warn("\u26A0\uFE0F image build failed \u2014 skipping the Trivy image scan");process.exit(0)}}),$r=U({name:"fs",description:"trivy fs . --severity HIGH,CRITICAL (filesystem scan)",prefixArgs:["fs"],defaultArgs:[".","--severity","HIGH,CRITICAL"],spawn:Ot}),Rr=U({name:"image",description:"trivy image <image> --severity HIGH,CRITICAL (container scan)",prefixArgs:["image"],spawn:Ot}),Ar=l({meta:{name:"trivy",version:"1.0.0",description:"Trivy wrapper \u2014 vuln scanning, defensive (skips if binary missing)"},subCommands:{fs:$r,image:Rr,build:Sr},run(){let e=v("trivy");if(e.length===0)console.log(`
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
`),process.exit(0);process.exit(Ot(e))}}),Tr=Ar});var Er;var eo=f(()=>{w();Er=l({meta:{name:"codeql",version:"1.0.0",description:"CodeQL wrapper \u2014 info and local guidance (CodeQL runs in GitHub Actions)"},run(){console.log(`
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
`)}})});function A(e,t){let n=t;while(n<e.length&&/\s/.test(e[n]))n++;return n}function no(e,t){return e.lastIndexOf(`
`,t)+1}function Ae(e,t){let n=/^[ \t]*/.exec(e.slice(no(e,t),t));return n?n[0]:""}function Ye(e,t){let n=t+1;while(n<e.length){if(e[n]==="\\"){n+=2;continue}if(e[n]==='"')return n+1;n++}return-1}function re(e,t){let n=e[t];if(n==='"')return Ye(e,t);if(n==="{"||n==="["){let s=0,i=t;while(i<e.length){let r=e[i];if(r==='"'){i=Ye(e,i);continue}if(r==="{"||r==="[")s++;else if(r==="}"||r==="]"){if(s--,s===0)return i+1}i++}return-1}let o=t;while(o<e.length&&!/[\s,\]}]/.test(e[o]))o++;return o}function oo(e){let t=A(e,0);return e[t]==="{"?t:-1}function Te(e,t,n){let o=A(e,t+1);while(o<e.length&&e[o]!=="}"){if(e[o]!=='"')return null;let s=Ye(e,o);if(s===-1)return null;let i=A(e,s);if(e[i]!==":")return null;let r=A(e,i+1),a=re(e,r);if(a===-1)return null;if(e.slice(o,s)===JSON.stringify(n))return{keyStart:o,valueStart:r,valueEnd:a};if(o=A(e,a),e[o]===",")o=A(e,o+1);else return null}return null}function so(e,t,n){let o=no(e,t);if(e.slice(o,t).trim()!==""){let r=/^[ \t]*,[ \t]*/.exec(e.slice(n));if(r)return e.slice(0,t)+e.slice(n+r[0].length);let a=e.slice(0,t).replace(/[ \t]*,[ \t]*$/,"");return a===e.slice(0,t)?e.slice(0,t)+e.slice(n):`${a}${e.slice(n)}`}let s=/^[ \t]*,[ \t]*\r?\n?/.exec(e.slice(n));if(s)return e.slice(0,o)+e.slice(n+s[0].length);let i=e.slice(0,o).replace(/[ \t]*\n$/,"");if(i.endsWith(","))return`${i.slice(0,-1)}${e.slice(n)}`;return e.slice(0,o)+e.slice(n)}function Nt(e){return/\n([ \t]+)\S/.exec(e)?.[1]??"  "}function It(e,t,n){let o=e.split(`
`);if(o.length===1)return e;let i=o.slice(1,-1).filter((a)=>a.trim()!=="").reduce((a,c)=>Math.min(a,/^[ \t]*/.exec(c)[0].length),Number.POSITIVE_INFINITY),r=Number.isFinite(i)?i:0;return[o[0],...o.slice(1,-1).map((a)=>a.trim()===""?"":t+n+a.slice(r)),`${t}${o.at(-1).trim()}`].join(`
`)}function to(e,t,n,o){let s=Nt(e),i=re(e,t)-1,r=Ae(e,i),a=A(e,t+1);if(a===i){let b=`${r}${s}`,m=It(o,b,s);return`${e.slice(0,i)}
${b}${JSON.stringify(n)}: ${m}
${r}${e.slice(i)}`}let c=Ae(e,a),u=a,p=a;while(p<i){let b=Ye(e,p),m=A(e,b);if(u=re(e,A(e,m+1)),p=A(e,u),e[p]===",")p=A(e,p+1);else break}let k=It(o,c,s);return`${e.slice(0,u)},
${c}${JSON.stringify(n)}: ${k}${e.slice(u)}`}function io(e,t){let[n,...o]=e,s=o.length===0?t:io(o,t);return`{
  ${JSON.stringify(n)}: ${s}
}`}function _r(e,t,n){let o=It(n,Ae(e,t.valueStart),Nt(e));return e.slice(0,t.valueStart)+o+e.slice(t.valueEnd)}function Dt(e,t,n){let o=t.at(-1);if(o===void 0)return e;let s=ze(e,t.slice(0,-1));if(s===-1){let[r,...a]=t,c=oo(e);if(r===void 0||c===-1)return e;return to(e,c,r,io(a,n))}let i=Te(e,s,o);return i?_r(e,i,n):to(e,s,o,n)}function ze(e,t){let n=oo(e);for(let o of t){if(n===-1)return-1;let s=Te(e,n,o);if(!s||e[s.valueStart]!=="{")return-1;n=s.valueStart}return n}function ro(e,t,n){return Dt(e,t.split("."),JSON.stringify(n))}function jp(e,t,n){return Dt(e,t.split("."),n.trim())}function ao(e,t){let n=t.split("."),o=ze(e,n.slice(0,-1));if(o===-1)return e;let s=Te(e,o,n.at(-1));return s?so(e,s.keyStart,s.valueEnd):e}function co(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=ze(e,s.slice(0,-1));if(i===-1)return e;let r=Te(e,i,s.at(-1));if(!r)return Dt(e,s,`[${o}]`);if(e[r.valueStart]!=="[")return e;let a=re(e,r.valueStart)-1,c=A(e,r.valueStart+1);if(c===a){if(!e.slice(r.valueStart,a).includes(`
`))return`${e.slice(0,a)}${o}${e.slice(a)}`;let m=Ae(e,a);return`${e.slice(0,a)}${m}${Nt(e)}${o}
${m}${e.slice(a)}`}let u=c,p=c;while(c<a)if(u=c,p=re(e,c),c=A(e,p),e[c]===",")c=A(e,c+1);else break;let b=!e.slice(r.valueStart,a).includes(`
`)?", ":`,
${Ae(e,u)}`;return`${e.slice(0,p)}${b}${o}${e.slice(p)}`}function Lp(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=ze(e,s.slice(0,-1));if(i===-1)return e;let r=Te(e,i,s.at(-1));if(!r||e[r.valueStart]!=="[")return e;let a=re(e,r.valueStart)-1,c=A(e,r.valueStart+1);while(c<a){let u=re(e,c);if(e.slice(c,u)===o)return so(e,c,u);if(c=A(e,u),e[c]===",")c=A(e,c+1)}return e}function jt(e){return JSON.parse(e)}async function Lt(e,t){let n=Bun.file(e);if(!await n.exists())return!1;let o=await n.text(),s=await t(o);if(s===o)return!1;return await Bun.write(e,s),!0}var Xe="@myorg",ae="packages/native",lo="crates",z="npm",Ee=(e)=>`crates/${e}`,H=(e)=>`packages/native/npm/${e}`,ve="wasm32-wasip1-threads",Mt,Qe;var Ze=f(()=>{Mt=[{target:"aarch64-apple-darwin",runner:"macos-latest"},{target:"x86_64-apple-darwin",runner:"macos-13"},{target:"x86_64-pc-windows-msvc",runner:"windows-latest"},{target:"x86_64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"aarch64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64"},{target:"x86_64-unknown-linux-musl",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"wasm32-wasip1-threads",runner:"ubuntu-latest",wasi:!0}],Qe=Mt.map((e)=>e.target)});import{existsSync as ce,readdirSync as Or,readFileSync as et}from"fs";import{dirname as Ir,join as X,resolve as po}from"path";function uo(e=process.cwd()){let t=po(e);for(let n=0;n<32;n++){let o=X(t,"Cargo.toml");if(ce(o)&&et(o,"utf8").includes("[workspace]"))return t;let s=Ir(t);if(s===t)break;t=s}return po(e)}function mo(e){if(!ce(e))return[];return Or(e,{withFileTypes:!0}).filter((t)=>t.isDirectory()).map((t)=>t.name).sort()}function _e(e){let t=X(e,lo),n=X(e,"Cargo.toml"),o=ce(n)?et(n,"utf8"):"",s=new Set([...o.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm)].map((r)=>r[1]??"")),i=[];for(let r of mo(t)){let a=X(t,r,"Cargo.toml");if(!ce(a))continue;let c=et(a,"utf8"),u=[...c.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm),...c.matchAll(/^\s*([\w-]+)\.workspace\s*=\s*true/gm)].map((p)=>p[1]??"").filter((p)=>s.has(p)||ce(X(t,p,"Cargo.toml")));i.push({name:r,dir:Ee(r),binding:/crate-type\s*=\s*\[[^\]]*cdylib/.test(c),uses:u})}return i}function tt(e){let t=X(e,"packages","native",z),n=[];for(let o of mo(t)){let s=X(t,o,"package.json");if(!ce(s))continue;let i;try{i=JSON.parse(et(s,"utf8"))}catch{continue}if(!i.napi)continue;let r=Ee(o);if(!ce(X(e,r,"Cargo.toml")))continue;n.push({name:o,dir:H(o),crateDir:r,binaryName:i.napi.binaryName??o,targets:i.napi.targets?.length?i.napi.targets:[...Qe]})}return n}function nt(e){let t=new Set(_e(e).filter((n)=>n.binding).map((n)=>n.name));return tt(e).filter((n)=>t.has(n.name))}var go=f(()=>{Ze()});import{existsSync as Pr}from"fs";import{mkdir as ot,writeFile as V}from"fs/promises";import{join as O}from"path";function Nr(e){let t=["[package]",`name    = "${e.name}"`,"version.workspace    = true","edition.workspace    = true","license.workspace    = true","repository.workspace = true",""];if(e.binding)t.push("[lib]","# required \u2014 produces the .node binary napi packages",'crate-type = ["cdylib"]',"","[dependencies]","napi.workspace        = true","napi-derive.workspace = true",...(e.uses??[]).map((n)=>`${`${n}.workspace`.padEnd(22)}= true`),"","[build-dependencies]","napi-build.workspace = true","");else t.push("# Pure Rust \u2014 no napi dependency, no cdylib: testable without a Node runtime.","[dependencies]",...(e.uses??[]).map((n)=>`${n}.workspace = true`),"");return t.push("[lints]","workspace = true",""),t.join(`
`)}function jr(e){if(!e.binding)return`//! Pure Rust helpers shared by the binding crates.
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
`}function Lr(e,t){let n=st(t),o=`${n}/${e.name}`,s=(e.uses??[]).length>0;return{name:o,version:"0.0.0",private:!0,type:"module",main:"index.js",types:"index.d.ts",exports:{".":{types:"./index.d.ts",require:"./index.js",import:"./index.js"},"./wasi":{types:"./index.d.ts",require:`./${e.name}.wasi.cjs`,browser:`./${e.name}.wasi-browser.js`}},files:["index.js","index.d.ts","*.node",`${e.name}.wasi.cjs`,`${e.name}.wasi-browser.js`,`${e.name}.wasm`],napi:{binaryName:e.name,packageName:o,targets:[...Qe],wasm:{initialMemory:16,maximumMemory:65536,browser:{fs:!1,asyncInit:!0,errorEvent:!0}}},scripts:{build:`m native napi:build --only ${e.name}`,"build:debug":`m native napi:build:debug --only ${e.name}`,"build:wasm":`m native napi:build:wasm --only ${e.name}`,"create-npm-dirs":`m native create-npm-dirs --only ${e.name}`,artifacts:`m native artifacts --only ${e.name}`,test:"m bun test","test:watch":"m bun test --watch",typecheck:"m typecheck --noEmit","cargo:check":"m native check","cargo:clippy":"m native clippy","cargo:fmt":"m native fmt","cargo:fmt:check":"m native fmt:check","cargo:test":"m native test"},devDependencies:{[`${n}/bun-config`]:"workspace:*",[`${n}/native-config`]:"workspace:*",...s?{[`${n}/native-crates`]:"workspace:*"}:{},[`${n}/ts`]:"workspace:*","@napi-rs/cli":"^3.9.1"}}}function Mr(e){return`{
  "extends": "${e}/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"]
  },
  "include": ["index.d.ts", "tests/**/*"]
}
`}async function fo(e,t,n={}){let o=O(e,Ee(t.name));if(await ot(O(o,"src"),{recursive:!0}),await V(O(o,"Cargo.toml"),Nr(t)),await V(O(o,"src","lib.rs"),jr(t)),t.binding)await V(O(o,"build.rs"),Dr());if(!t.binding)return{crate:o};let s=O(e,H(t.name));return await ot(s,{recursive:!0}),await V(O(s,"package.json"),`${JSON.stringify(Lr(t,n),null,2)}
`),await V(O(s,"tsconfig.json"),Mr(st(n))),await V(O(s,"turbo.json"),Br()),await ot(O(s,"tests"),{recursive:!0}),await V(O(s,"tests",`${t.name}.test.ts`),Vr(t,n)),{crate:o,package:s}}function Gr(e,t){return e.replace(/members = \[([\s\S]*?)\]/,(n,o)=>{let s=new Set(o.split(`
`).map((i)=>i.trim()).filter((i)=>i.startsWith('"')).map((i)=>i.replace(/,$/,"")));return s.add(`"crates/${t}"`),`members = [
${[...s].sort().map((i)=>`  ${i},`).join(`
`)}
]`})}async function ho(e,t){let n=O(e,"Cargo.toml");if(!Pr(n))return;let o=await Bun.file(n).text();if(o.includes(`"crates/${t}"`))return;let s=o.includes("members = [")?Gr(o,t):`${o.trimEnd()}

[workspace]
members = [
  "crates/${t}",
]
`;await V(n,s)}function Ur(e){return{name:`${st(e)}/native-crates`,version:"0.0.0",private:!0,scripts:{build:"m native build --pure",test:"m native test --pure","cargo:check":"m native check --pure","cargo:clippy":"m native clippy --pure","cargo:fmt":"m native fmt --pure","cargo:fmt:check":"m native fmt:check --pure"}}}async function Bt(e,t={}){let n=O(e,"crates");return await ot(n,{recursive:!0}),await V(O(n,"package.json"),`${JSON.stringify(Ur(t),null,2)}
`),await V(O(n,"turbo.json"),Fr()),n}var st=(e)=>e.scope??Xe,Dr=()=>`extern crate napi_build;

fn main() {
    napi_build::setup();
}
`,Br=()=>`{
  "extends": ["//"],
  "tasks": {
    "build": {
      "inputs": [
        "package.json",
        "../../../crates/*/src/**/*.rs",
        "../../../crates/*/Cargo.toml",
        "../../../crates/*/build.rs",
        "../../../Cargo.toml",
        "../../../Cargo.lock",
        "../../../rust-toolchain.toml"
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
`,Vr=(e,t={})=>{let n=e.name,o=st(t),s=(e.uses??[])[0]??"shared",i=(e.uses??[]).length>0,r=`${`${s}.workspace`.padEnd(22)}= true`,a=i?`
describe("pure Rust crates", () => {
  it("keep the shared logic in crates/${s}, napi-free", async () => {
    const manifest = await Bun.file("../../../crates/${s}/Cargo.toml").text();
    expect(manifest).toContain('name    = "${s}"');
    expect(manifest).not.toMatch(/^crate-type/m);
    expect(manifest).not.toMatch(/^napi/m);

    const lib = await Bun.file("../../../crates/${s}/src/lib.rs").text();
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
    const manifest = await Bun.file("../../../Cargo.toml").text();
    expect(manifest).toContain('"crates/${s}"');
  });

  it("tune the release profile (lto, single codegen unit, stripped)", async () => {
    const manifest = await Bun.file("../../../Cargo.toml").text();
    expect(manifest).toContain("[profile.release]");
    expect(manifest).toContain("lto           = true");
    expect(manifest).toContain("codegen-units = 1");
    expect(manifest).toContain("strip         = true");
  });

  it("are one Turbo node \u2014 the bridge package runs m native --pure", async () => {
    const pkg = await Bun.file("../../../crates/package.json").json();
    expect(pkg.name).toBe("${o}/native-crates");
    expect(pkg.private).toBe(true);
    expect(pkg.scripts.build).toBe("m native build --pure");
    expect(pkg.scripts.test).toBe("m native test --pure");
  });

  it("never Turbo-cache the bridge tasks (cargo owns target/)", async () => {
    const turbo = await Bun.file("../../../crates/turbo.json").json();
    expect(turbo.tasks.build.cache).toBe(false);
    expect(turbo.tasks.test.cache).toBe(false);
  });
});
`:"";return`import { describe, expect, it } from "bun:test";

// Structure tests: the workspace is the source of truth for where things live.
// The Rust code itself is covered by \`cargo test\`, the JS fallback path by
// packages/external.

const CRATE = "../../../crates/${n}";

describe("${n} workspace", () => {
  it("has a virtual workspace manifest listing the crate", async () => {
    const content = await Bun.file("../../../Cargo.toml").text();
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
    expect(turbo.tasks.build.inputs).toContain("../../../crates/*/src/**/*.rs");
    expect(turbo.tasks.build.inputs).toContain("../../../Cargo.lock");
    // The wasm build shells out to the wasm32 target toolchain \u2014 never cached.
    expect(turbo.tasks["build:wasm"].cache).toBe(false);
  });
});
${a}`},Fr=()=>`{
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
`;var bo=f(()=>{Ze()});import{existsSync as it}from"fs";import{dirname as Hr,join as le}from"path";function vo(){if(Gn("cargo"))return!0;return se(K.cargo),!1}function pe(){if(it(le(x,"Cargo.toml")))return!0;return console.warn("\u26A0\uFE0F Cargo.toml not present at the repo root, skipping (enable the native config)"),!1}function T(e,t={}){if(!pe())return 0;return Y("cargo",()=>{let n=["cargo",...e],{exitCode:o,output:s}=ht(n,{cwd:t.cwd??x});if(s)process.stdout.write(s);if(o!==0)bt(`${n.join(" ")} failed (exit ${o})`,s);return o})}function ye(e){if(!e)return[];let t=_e(x).filter((n)=>n.binding).map((n)=>n.name);if(t.length===0)return[];return console.log(`\u2139\uFE0F pure Rust only \u2014 excluding bindings: ${t.join(", ")}`),t.flatMap((n)=>["--exclude",n])}function yo(){let e;try{e=Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/package.json"))}catch{console.error("::error::Cannot resolve @napi-rs/cli \u2014 reinstall dependencies "+"(`bun install`), then re-run the native command"),process.exit(1)}let t=le(Hr(e),"dist","cli.js");if(!it(t))console.error(`::error::@napi-rs/cli is installed but ${t} is missing`),process.exit(1);return t}function qr(e){return["--cwd",x,"--manifest-path",`${e.crateDir}/Cargo.toml`,"--package-json-path",`${e.dir}/package.json`,"--output-dir",e.dir]}function Oe(e,t={},n=()=>[]){if(!pe()||!vo())return 0;let o=nt(x),s=t.only?o.filter((r)=>r.name===t.only):o;if(s.length===0)return console.warn(t.only?`\u26A0\uFE0F No napi package named "${t.only}" in ${ae}/${z} \u2014 skipping`:`\u26A0\uFE0F No napi packages in ${ae}/${z} \u2014 skipping`),0;let i=0;for(let r of s){console.log(`
\u25B8 ${r.name}: ${r.crateDir} \u2192 ${r.dir}`);let a=["bun",yo(),...e,...qr(r),...n(r),...t.target?["--target",t.target]:[],...t.cross?["--use-napi-cross"]:[],...t.dryRun?["--dry-run"]:[]],{exitCode:c,output:u}=ht(a,{cwd:x});if(u)process.stdout.write(u);if(c!==0)i=c,bt(`${e.join(" ")} failed for ${r.name} (exit ${c})`,u)}return i}function Wr(e,t=x){if(!pe()||!vo())return 0;return g(["bun",yo(),...e],{cwd:t})}function Jr(){if(!process.env.WASI_SDK_PATH)console.warn(`\u26A0\uFE0F WASI_SDK_PATH is not set \u2014 install the WASI SDK if the wasm target fails to link
`+`   (CI does it for you; locally: https://github.com/WebAssembly/wasi-sdk/releases)
   The Rust target is needed too: rustup target add ${ve}`)}function pa(e){let t=new Set;for(let o of nt(e))for(let s of o.targets)t.add(s);return{include:Mt.filter((o)=>t.size===0||t.has(o.target)).map((o)=>{let s={target:o.target,runner:o.runner};if(o.container)s.container=o.container;if(o.wasi)s.wasi=!0;return s})}}async function wo(e){if(e)return e;let t=tt(x)[0];if(t)try{let o=(await Bun.file(le(x,t.dir,"package.json")).json()).name?.split("/")[0];if(o?.startsWith("@"))return o}catch{}return process.env.NATIVE_SCOPE??Xe}var x,we,Ie,Kr,Yr,zr,Xr,Qr,Zr,ea,ta,na,oa,sa,ia,ra,aa,ca,la,ua,ma,da,ga,fa,ha,ba,va,ya,wa,ko,ka;var xo=f(()=>{w();ie();go();Ze();bo();x=uo();we={pure:{type:"boolean",description:"Only the pure Rust crates (excludes every napi binding)",default:!1}};Ie={only:{type:"string",description:"Build a single package (by directory name)"},target:{type:"string",description:"Rust target triple, e.g. aarch64-unknown-linux-gnu"},cross:{type:"boolean",description:"Cross-compile with napi's bundled toolchain",default:!1}},Kr=l({meta:{name:"check",description:"cargo check --workspace (fast type-check)"},args:{...we},run({args:e}){process.exit(T(["check","--workspace",...ye(Boolean(e.pure))]))}}),Yr=l({meta:{name:"clippy",description:"cargo clippy --workspace --all-targets -- -D warnings"},args:{...we},run({args:e}){process.exit(T(["clippy","--workspace",...ye(Boolean(e.pure)),"--all-targets","--","-D","warnings"]))}}),zr=l({meta:{name:"fmt",description:"cargo fmt --all (format write)"},args:{...we},run({args:e}){process.exit(T(["fmt","--all",...ye(Boolean(e.pure))]))}}),Xr=l({meta:{name:"fmt:check",description:"cargo fmt --all -- --check (format check)"},args:{...we},run({args:e}){process.exit(T(["fmt","--all",...ye(Boolean(e.pure)),"--","--check"]))}}),Qr=l({meta:{name:"test",description:"cargo test --workspace (run Rust tests)"},args:{...we},run({args:e}){process.exit(T(["test","--workspace",...ye(Boolean(e.pure))]))}}),Zr=l({meta:{name:"build",description:"cargo build --workspace (debug)"},args:{...we},run({args:e}){process.exit(T(["build","--workspace",...ye(Boolean(e.pure))]))}}),ea=l({meta:{name:"build:release",description:"cargo build --workspace --release (lto, strip)"},run(){process.exit(T(["build","--workspace","--release"]))}}),ta=l({meta:{name:"build:ci",description:"cargo build --workspace --profile ci"},run(){process.exit(T(["build","--workspace","--profile","ci"]))}}),na=l({meta:{name:"tree",description:"cargo tree (dependency tree)"},run(){process.exit(T(["tree",...v("tree")]))}}),oa=l({meta:{name:"update",description:"cargo update (update dependencies)"},run(){process.exit(T(["update",...v("update")]))}}),sa=l({meta:{name:"doc",description:"cargo doc --no-deps (generate docs)"},run(){process.exit(T(["doc","--no-deps"]))}}),ia=l({meta:{name:"nextest",description:"cargo nextest run (faster parallel tests)"},run(){process.exit(T(["nextest","run",...v("nextest")]))}}),ra=l({meta:{name:"llvm-cov",description:"cargo llvm-cov --lcov (Rust coverage, requires cargo-llvm-cov)"},run(){let e=v("llvm-cov");if(e.length===0)process.exit(T(["llvm-cov","--workspace","--lcov","--output-path","coverage/rust-lcov.info"]));process.exit(T(["llvm-cov",...e]))}}),aa=l({meta:{name:"audit",description:"cargo audit (security audit)"},run(){process.exit(T(["audit"]))}}),ca=l({meta:{name:"deny",description:"cargo deny check (license/ban check)"},run(){process.exit(T(["deny",...v("deny")]))}}),la=l({meta:{name:"typecheck",description:"Type-check every npm package (skips when absent)"},run(){if(!pe())process.exit(0);let e=tt(x).filter((n)=>it(le(x,n.dir,"tsconfig.json")));if(e.length===0)console.warn(`\u26A0\uFE0F No npm packages to type-check in ${ae}/${z}`),process.exit(0);let t=0;for(let n of e){console.log(`\u25B8 typecheck ${n.name}`);let o=g(["bun","run","typecheck"],{cwd:le(x,n.dir)});if(o!==0)t=o}process.exit(t)}});ua=l({meta:{name:"matrix",description:"Print the CI build matrix (supported targets the packages declare)"},args:{json:{type:"boolean",description:"Pretty-print JSON (default)",default:!0},gha:{type:"boolean",description:"Print `key=value` lines ready for $GITHUB_OUTPUT",default:!1}},run({args:e}){let t=pa(x);if(e.gha)console.log(`targets=${JSON.stringify(t)}`),console.log(`has_targets=${t.include.length>0}`);else console.log(JSON.stringify(t,null,2));process.exit(0)}}),ma=l({meta:{name:"list",description:"List crates and the npm packages built from them"},args:{json:{type:"boolean",description:"Print JSON",default:!1}},run({args:e}){if(!pe())process.exit(0);let t=_e(x),n=nt(x),o=new Set(n.map((s)=>s.name));if(e.json)console.log(JSON.stringify({root:x,crates:t,packages:n},null,2)),process.exit(0);console.log(`
\uD83E\uDD80 ${ae} (workspace root: ${x})
`),console.log("  crates/");for(let s of t){let i=s.binding?"cdylib \u2192 npm package":"pure Rust",r=s.uses.length?` (uses ${s.uses.join(", ")})`:"",a=s.binding&&!o.has(s.name)?"  \u26A0\uFE0F no npm package":"";console.log(`    ${s.name.padEnd(14)} ${i}${r}${a}`)}if(console.log(`
  npm/`),n.length===0)console.log("    (none \u2014 add a cdylib crate with `m native add <name>`)");for(let s of n)console.log(`    ${s.name.padEnd(14)} ${s.crateDir}  binary: ${s.binaryName}.<platform>.node`),console.log(`    ${" ".repeat(14)} targets: ${s.targets.join(", ")}`);console.log(""),process.exit(0)}});da=l({meta:{name:"add",description:"Add a crate (and, for bindings, its npm package) to the workspace"},args:{name:{type:"positional",description:"Crate name \u2014 also the npm package name",required:!0},pure:{type:"boolean",description:"Pure Rust crate: no cdylib, no npm package",default:!1},uses:{type:"string",description:"Comma-separated sibling crates to depend on"},scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!pe())process.exit(1);let t=String(e.name);if(!/^[a-z0-9][a-z0-9-]*$/.test(t))console.error(`\u274C Invalid crate name "${t}" \u2014 use lowercase letters, digits and hyphens`),process.exit(1);let n={name:t,binding:!e.pure,uses:e.uses?String(e.uses).split(",").map((s)=>s.trim()).filter(Boolean):[],sample:"arithmetic"},o=await wo(e.scope);if(await fo(x,n,{scope:o}),await ho(x,t),e.pure)await Bt(x,{scope:o});if(console.log(`
\u2705 Added ${e.pure?"pure Rust crate":"crate + npm package"} "${t}"`),console.log(`   crate:   crates/${t}/`),!e.pure)console.log(`   package: ${H(t)}/`);else console.log(`   bridge:  crates/package.json (${o}/native-crates)`),console.log(`   Bindings that use "${t}" add it to workspace.dependencies + Cargo.toml,`),console.log(`   and \`${o}/native-crates: workspace:*\` in their package.json.`);console.log(`
   Run: bun install && m native check
`),process.exit(0)}}),ga=l({meta:{name:"napi:build",description:"napi build --platform --release (one per package)"},args:Ie,run({args:e}){process.exit(Oe(["build","--platform","--release"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),fa=l({meta:{name:"napi:build:debug",description:"napi build (debug, one per package)"},args:Ie,run({args:e}){process.exit(Oe(["build"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),ha=l({meta:{name:"napi:build:wasm",description:`napi build --target ${ve} (one per package)`},args:{only:Ie.only},run({args:e}){Jr(),process.exit(Oe(["build","--platform","--release","--target",ve],{only:e.only}))}}),ba=l({meta:{name:"create-npm-dirs",description:"Generate the per-platform npm packages (run in CI, not committed)"},args:{only:Ie.only,"dry-run":{type:"boolean",default:!1}},run({args:e}){process.exit(Oe(["create-npm-dirs"],{only:e.only,dryRun:Boolean(e["dry-run"])},()=>["--npm-dir",`${ae}/${z}`]))}}),va=l({meta:{name:"artifacts",description:"Copy CI artifacts (.node/.wasm) into the npm packages"},args:{only:Ie.only,dir:{type:"string",description:"Directory holding the downloaded artifacts",default:"artifacts"}},run({args:e}){process.exit(Oe(["artifacts"],{only:e.only},(t)=>["--npm-dir",`${ae}/${z}`,"--output-dir",String(e.dir??"artifacts"),"--build-output-dir",t.dir]))}}),ya=l({meta:{name:"napi",description:"Run napi-rs CLI (passthrough, cwd = the workspace)"},run(){process.exit(Wr(v("napi")))}}),wa=l({meta:{name:"sync",description:"Re-sync the Turbo bridge node and Cargo\u2192npm dependency edges"},args:{scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!pe())process.exit(1);let t=await wo(e.scope),n=`${t}/native-crates`,o=0;await Bt(x,{scope:t}),console.log("  \u2713 crates/{package,turbo}.json (bridge node)");for(let i of _e(x).filter((r)=>r.binding)){let r=le(x,H(i.name),"package.json");if(!it(r))continue;let a=(i.uses??[]).length>0;await Lt(r,(c)=>{let p=jt(c).devDependencies?.[n];if(a&&p!=="workspace:*")return console.log(`  \u2713 ${H(i.name)}/package.json \u2192 ${n}: workspace:*`),o+=1,ro(c,`devDependencies.${n}`,"workspace:*");if(!a&&p)return console.log(`  \uD83D\uDDD1\uFE0F ${H(i.name)}/package.json \u2190 ${n} (no Cargo path deps)`),o+=1,ao(c,`devDependencies.${n}`);return c})}let s=le(x,"package.json");await Lt(s,(i)=>{if((jt(i).workspaces??[]).includes("crates"))return i;return console.log("  \u2713 package.json workspaces += crates"),o+=1,co(i,"workspaces","crates")}),console.log(o===0?`
\u2705 Already in sync
`:`
\u2705 Synced (${o} fix${o===1?"":"es"}) \u2014 run bun install
`),process.exit(0)}}),ko=l({meta:{name:"m native",version:"1.0.0",description:"Native Rust bindings via Cargo + napi-rs \u2014 the Cargo workspace at the repo root with a crate per Rust unit and an npm package per napi binding."},subCommands:{list:ma,matrix:ua,add:da,check:Kr,clippy:Yr,fmt:zr,"fmt:check":Xr,test:Qr,build:Zr,"build:release":ea,"build:ci":ta,tree:na,update:oa,doc:sa,nextest:ia,"llvm-cov":ra,audit:aa,deny:ca,typecheck:la,"napi:build":ga,"napi:build:debug":fa,"napi:build:wasm":ha,"create-npm-dirs":ba,artifacts:va,napi:ya,sync:wa},run(){let e=v("native");if(e.length===0)console.log(`
m native \u2014 Cargo + napi-rs wrapper (repo-root Cargo workspace)

Usage:
  m native <command> [args]

Workspace:
  list                 crates + npm packages discovered at ./
  add <name>           new crate + npm package (--pure for Rust-only, --uses shared)
  sync                 re-sync the bridge node + Cargo\u2192npm dependency edges
  typecheck            tsc --noEmit in every npm package

Cargo (whole workspace, run at ./):
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
  napi:build:wasm      napi build --target ${ve}
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
`),process.exit(0);let t=e[0]??"";if(!Object.keys(ko.subCommands||{}).includes(t)&&!t.startsWith("-"))process.exit(T(e))}}),ka=ko});var{file:Co,spawnSync:xa}=globalThis.Bun;var Ca,Sa;var So=f(()=>{_();w();Ca=l({meta:{name:"m e2e",version:"1.0.0",description:"Playwright E2E with browser detection \u2014 auto-skips if browsers missing, uses shared config"},args:{args:{type:"positional",description:"Playwright test args",required:!1}},async run(){let{chromium:e,firefox:t,webkit:n}=await import("@playwright/test"),o={chromium:e,firefox:t,webkit:n},s=[];for(let[k,b]of Object.entries(o))try{let m=b.executablePath();if(!await Co(m).exists())s.push(k)}catch{s.push(k)}if(s.length>0)console.log(`
E2E skipped: browser(s) not installed (${s.join(", ")}).`),console.log("Run `bunx playwright install` to download them.\n"),process.exit(0);let i=ee(),r=await Co(`${i}/apps/example/playwright.config.ts`).exists()?`${i}/apps/example/playwright.config.ts`:null,a=v("e2e"),u=["bun",Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js")),"test",...r?["--config",r]:[],...a],p=xa({cmd:u,stdout:"inherit",stderr:"inherit",stdin:"inherit"});process.exit(p.exitCode)}}),Sa=Ca});import{existsSync as $o,readdirSync as $a,readFileSync as Ra}from"fs";import{join as Gt}from"path";function Ta(e){if(e===void 0||e===!1||e===null)return null;if(e===!0)return Vt;if(typeof e==="string")return e||Vt;if(typeof e==="object")return e.dir||Vt;return null}function Ea(e){let t=Gt(e,"package.json");if(!$o(t))return null;try{return JSON.parse(Ra(t,"utf8"))}catch{return null}}function rt(e=process.cwd()){let t=[];for(let o of Aa){let s=o.split("*")[0]??"",i=Gt(e,s);if(!$o(i))continue;for(let r of $a(i,{withFileTypes:!0})){if(!r.isDirectory())continue;let a=`${s}${r.name}`,c=Ea(Gt(e,a));if(!c?.name)continue;let u=Ta(c.pages);if(!u)continue;t.push({name:c.name,dir:a,outDir:`${a}/${u}`})}}t.sort((o,s)=>o.name.localeCompare(s.name));let n=t.length>1;return t.map((o)=>({...o,subpath:n?o.name.split("/").at(-1)??o.name:""}))}function Ft(e){return e.subpath?`/${e.subpath}/`:"/"}var L=".pages",Ut="coverage",Vt="public",Aa;var Ro=f(()=>{Aa=["apps/*","packages/*"]});import{existsSync as Ht}from"fs";import{cp as Ao,rm as _a}from"fs/promises";import{join as Q}from"path";var{Glob:Oa,spawnSync:To}=globalThis.Bun;function Ia(){let e=process.env.GITHUB_REPOSITORY?.split("/")[1];if(e)return e;let n=To({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim();if(!n)return;return n.replace(/\.git$/,"").split("/").at(-1)}function Pa(){let e=process.env.GITHUB_REPOSITORY?.split("/")[0];if(e)return e;return To({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim()?.replace(/\.git$/,"").match(/[:/]([^/:]+)\/[^/]+$/)?.[1]}async function Na(e,t){await _a(Q(e,L),{recursive:!0,force:!0});for(let i of t){let r=Q(e,i.outDir);if(!Ht(r))console.error(`::error::${i.name} declares "${i.outDir}" but it does not exist`),process.exit(1);let a=i.subpath?Q(e,L,i.subpath):Q(e,L);await Ao(r,a,{recursive:!0}),console.log(`\uD83D\uDCE6 ${i.name}: ${i.outDir} \u2192 ${L}${Ft(i)}`)}let n="coverage/html",o=Q(e,n);if(Ht(Q(o,"index.html")))await Ao(o,Q(e,L,Ut),{recursive:!0}),console.log(`\uD83D\uDCCA ${n} \u2192 ${L}/${Ut} (served at /coverage/)`);let s=Q(e,L,"index.html");if(!Ht(s))console.warn(`\u26A0\uFE0F No index.html at the site root (${L}/) \u2014 check the pages config`)}var Da,ja,La,Ma,Ba;var Eo=f(()=>{w();Ro();Da=l({meta:{name:"list",description:"Show which packages declare a Pages site"},run(){let e=rt();if(e.length===0)console.log("No package declares a pages config in its package.json"),process.exit(0);for(let t of e)console.log(`${t.name.padEnd(24)} ${t.outDir.padEnd(28)} \u2192 ${Ft(t)}`);process.exit(0)}}),ja=l({meta:{name:"build",description:"Build the site and assemble the Pages artifact from declared packages"},run(){console.log("\uD83D\uDCC4 Building static site for GitHub Pages");let e=g(["bun","run","build"]);if(e!==0)console.error(`::error::bun run build failed (exit ${e})`),process.exit(e);let t=rt();if(t.length===0)console.error('::error::Pages is enabled but no package declares "pages" in its package.json (e.g. "pages": { "dir": "public" })'),process.exit(1);Na(process.cwd(),t).then(()=>{console.log(`\u2705 Pages artifact ready: ${L}/`),process.exit(0)})}}),La=l({meta:{name:"base",description:"Report (or inject) the base path for a GitHub Pages project site"},args:{inject:{type:"boolean",description:"Rewrite absolute href/src in the built HTML to include the base path",default:!1},json:{type:"boolean",description:"Print { owner, repo, base, url } as JSON",default:!1}},async run({args:e}){let t=Ia(),n=Pa()??"unknown",o=t?`https://${n.toLowerCase()}.github.io/${t}`:void 0;if(e.json){console.log(JSON.stringify({owner:t?n:null,repo:t??null,base:t?`/${t}`:null,url:o??null}));return}if(console.log(`\uD83D\uDD27 Repo name: ${t??"(unknown)"}`),console.log(`   Default Pages URL: ${o??"(unknown)"}`),!e.inject)return;if(!t)console.error("::error::cannot determine repo name \u2014 set GITHUB_REPOSITORY or add a git remote"),process.exit(1);if(rt().filter((a)=>a.subpath==="").length===0){console.log("   No root-level Pages target \u2014 nothing to rewrite");return}let r=0;for(let a of new Oa(`${L}/**/*.html`).scanSync(".")){let c=await Bun.file(a).text(),u=c.replaceAll(/(href|src)="\/(?!\/)/g,`$1="/${t}/`);if(u===c)continue;await Bun.write(a,u),r++}console.log(`   Rewrote absolute paths to /${t}/ in ${r} file(s)`)}}),Ma=l({meta:{name:"m pages",version:"1.0.0",description:"GitHub Pages helper \u2014 discovers declared sites, builds and stages the artifact"},subCommands:{build:ja,base:La,list:Da}}),Ba=Ma});import{mkdir as Pe,readdir as at}from"fs/promises";import{join as ue}from"path";var{$:ke,file:qt,write:Ne}=globalThis.Bun;function Va(e){let t=e.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!t)return null;let n=t[1]??"",o=t[2]??"",s={};for(let i of n.split(`
`)){let r=i.indexOf(":");if(r===-1)continue;let a=i.slice(0,r).trim(),c=i.slice(r+1).trim().replace(/^["']|["']$/g,"");if(a)s[a]=c}return{frontmatter:s,body:o}}async function je(e){try{let t=await qt(e).text(),n=Va(t);if(!n)return console.error(`\u274C ${e}: missing YAML frontmatter (---)`),null;let{frontmatter:o}=n;if(!o.name)return console.error(`\u274C ${e}: missing frontmatter 'name'`),null;if(!o.description)return console.error(`\u274C ${e}: missing frontmatter 'description'`),null;return{name:o.name,description:o.description,path:e}}catch(t){return console.error(`\u274C ${e}: ${t.message}`),null}}async function ct(e){let t=[];try{let n=await at(e,{withFileTypes:!0});for(let o of n){let s=ue(e,o.name);if(o.isDirectory()){let i=await ct(s);t.push(...i)}else if(o.name==="SKILL.md"||o.name.endsWith(".md"))t.push(s)}}catch{}return t}var _o="@myorg",me,Io,M,De,Oo,Ga,Ua,Fa,Ha,qa,Wa,Ja,Ka,Ya;var Po=f(()=>{He();_();me=bn(),Io=`${F()}/src/cli.ts`,M=`${process.cwd()}/.agents/skills`,De=`${process.cwd()}/.agents/skills.index.json`;Oo=l({meta:{name:"sync",description:"Sync curated skills to .agents/skills/ + validate + index"},run:async()=>{let e=process.env.SKILLS_SCOPE||process.env.SCOPE||_o,t=_o;await Pe(M,{recursive:!0}),console.log(`
\uD83D\uDCE6 Syncing curated skills from ${me} to ${M}/ (scope: ${e})
`);let n=0;try{let a=await at(me,{withFileTypes:!0});for(let c of a){let u=ue(me,c.name);if(c.isDirectory()){let p=ue(M,c.name);if(await Pe(p,{recursive:!0}),await ke`cp -r ${u}/* ${p}/`.quiet().catch(()=>{}),e!==t){let k=await ke`find ${p} -type f -name "*.md"`.text().catch(()=>"");for(let b of k.trim().split(`
`).filter(Boolean))try{let m=await qt(b).text();if(m.includes(t))await Ne(b,m.replaceAll(t,e))}catch{}}n++,console.log(`  \u2713 ${c.name}/`)}else if(c.isFile()&&c.name.endsWith(".md")){let p=c.name.replace(/\.md$/,""),k=ue(M,p);await Pe(k,{recursive:!0});let b=await qt(u).text();if(e!==t)b=b.replaceAll(t,e);if(b.startsWith("---"))await Ne(ue(k,"SKILL.md"),b);else{let C=`---
name: ${p}
description: ${p} skill
---

${b}`;await Ne(ue(k,"SKILL.md"),C)}n++,console.log(`  \u2713 ${p}/ (from legacy ${c.name})`)}}}catch(a){console.error(`  No curated dir: ${me}`,a)}console.log(`
\u2705 Synced ${n} curated skills to .agents/skills/
`),console.log(`\uD83D\uDD0D Validating skills in ${M}/...
`);let o=await ct(M),s=0,i=0;for(let a of o){let c=await je(a);if(c)s++,console.log(`  \u2713 ${c.name} \u2014 ${c.description}`);else i++}console.log(`
${i===0?"\u2705":"\u26A0\uFE0F"}  ${s} valid, ${i} invalid
`);let r=[];for(let a of o){let c=await je(a);if(c)r.push({...c,path:a.replace(`${process.cwd()}/`,"")})}if(await Pe(`${process.cwd()}/.agents`,{recursive:!0}),await Ne(De,`${JSON.stringify(r,null,2)}
`),console.log(`\uD83D\uDCC4 Built ${De} with ${r.length} skills
`),i>0)process.exit(1)}}),Ga=l({meta:{name:"list",description:"List installed skills (curated + vendored + skills.sh)",alias:["ls"]},run:async()=>{console.log(`
\uD83D\uDCDA Skills in ${M}/:
`);try{let e=await at(M,{withFileTypes:!0});if(e.length===0)console.log("  (no skills installed \u2014 run `bun run skills:sync` or `bun run skills:add`)\n");else for(let t of e){if(!t.isDirectory())continue;let n=ue(M,t.name,"SKILL.md"),o=await je(n).catch(()=>null);if(o)console.log(`  - ${o.name} \u2014 ${o.description} (${t.name}/)`);else console.log(`  - ${t.name}/ \u2014 (no SKILL.md)`)}}catch{console.log("  (no .agents/skills/ dir \u2014 run `bun run skills:sync`)\n")}console.log(`
\uD83D\uDCE6 Curated skills in ${me}/:
`);try{let e=await at(me,{withFileTypes:!0});for(let t of e){let n=t.isDirectory()?t.name:t.name.replace(/\.md$/,"");console.log(`  - ${n}`)}}catch{console.log("  (no curated dir)")}console.log(),console.log(`\uD83D\uDD0D skills.sh installed (project):
`),await ke`npx skills list -p`.quiet().then(async(e)=>{let t=e.stdout.toString();console.log(t||"  (none or skills CLI not available)")}).catch(()=>{console.log("  (skills CLI not available or no project skills)")}),console.log()}}),Ua=l({meta:{name:"add",description:"Add skill via skills.sh (e.g. vercel-labs/agent-skills)",alias:["a"]},args:{package:{type:"positional",description:"Skill package (e.g. vercel-labs/agent-skills or https://skills.sh/p/<id>)",required:!0}},run:async({args:e})=>{let t=e.package;console.log(`
\uD83D\uDCE6 Adding skill package via skills.sh: ${t}
`),console.log(`> npx skills add ${t} -p --agent * -y
`);let o=await Bun.spawn({cmd:["npx","skills","add",t,"-p","--agent","*","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(o!==0)console.error(`
\u274C skills add failed with exit ${o}
`),process.exit(o);console.log(`
\u2705 Added ${t}, syncing to .agents/skills/...
`),await ke`bun ${Io} skills sync`.quiet().catch(()=>{}),await ke`npx skills experimental_sync -p`.quiet().catch(()=>{}),console.log(`
\u2705 Done. Review changes in .agents/skills/ before committing.
`)}}),Fa=l({meta:{name:"update",description:"Update skills via skills.sh",alias:["upgrade"]},args:{skills:{type:"positional",description:"Skills to update (default: all)",required:!1}},run:async({args:e})=>{let t=e.skills??"",n=t?[t]:[];console.log(`
\uD83D\uDD04 Updating skills via skills.sh: ${n.join(" ")||"(all)"}
`);let o=["npx","skills","update",...n,"-p","-y"];console.log(`> ${o.join(" ")}
`);let i=await Bun.spawn({cmd:o,cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(i!==0)console.error(`
\u274C skills update failed with exit ${i}
`),process.exit(i);console.log(`
\u2705 Updated, rebuilding index...
`),await ke`bun ${Io} skills sync`.quiet().catch(()=>{})}}),Ha=l({meta:{name:"validate",description:"Validate all SKILL.md frontmatter (name, description)"},run:async()=>{console.log(`
\uD83D\uDD0D Validating all SKILL.md files...
`);let e=[me,M],t=0,n=0;for(let o of e){console.log(`\uD83D\uDCC1 ${o}:
`);let s=await ct(o);if(s.length===0){console.log(`  (no skills found)
`);continue}for(let i of s){let r=await je(i);if(r)t++,console.log(`  \u2713 ${r.name} \u2014 ${r.description} (${i.replace(`${process.cwd()}/`,"")})`);else n++}console.log()}if(console.log(`${n===0?"\u2705":"\u274C"} Validation: ${t} valid, ${n} invalid
`),n>0)process.exit(1)}}),qa=l({meta:{name:"index",description:"Build .agents/skills.index.json"},run:async()=>{console.log(`
\uD83D\uDCC4 Building ${De}...
`);let e=await ct(M),t=[];for(let n of e){let o=await je(n);if(o)t.push({...o,path:n.replace(`${process.cwd()}/`,"")})}await Pe(`${process.cwd()}/.agents`,{recursive:!0}),await Ne(De,`${JSON.stringify(t,null,2)}
`),console.log(`\u2705 Built index with ${t.length} skills:
`);for(let n of t)console.log(`  - ${n.name}: ${n.description}`);console.log(`
\uD83D\uDCC4 ${De}
`)}}),Wa=l({meta:{name:"init",description:"Init new skill via skills.sh"},args:{name:{type:"positional",description:"Skill name",required:!1,default:"my-skill"}},run:async({args:e})=>{let t=e.name??"my-skill";console.log(`
\uD83D\uDCDD Initializing skill: ${t}
`),await Bun.spawn({cmd:["npx","skills","init",t],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),Ja=l({meta:{name:"remove",description:"Remove skills via skills.sh",alias:["rm"]},args:{skills:{type:"positional",description:"Skills to remove",required:!0}},run:async({args:e})=>{let n=e.skills.split(",").map((s)=>s.trim());console.log(`
\uD83D\uDDD1\uFE0F Removing skills: ${n.join(", ")}
`),await Bun.spawn({cmd:["npx","skills","remove",...n,"-p","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),Ka=l({meta:{name:"m skills",version:"1.0.0",description:"AI agent skills management via skills.sh + curated skills \u2014 sync, list, add, update, validate, index"},subCommands:{sync:Oo,list:Ga,add:Ua,update:Fa,validate:Ha,index:qa,init:Wa,remove:Ja},run:async({args:e})=>{if(!e._||Array.isArray(e._)&&e._.length===0)await q(Oo,{rawArgs:[]})}}),Ya=Ka});function No(e,t,n){let o=[];if(e.includes("Archont561/ts-monorepo-template")&&!e.includes(t))o.push("README still contains placeholder owner Archont561/ts-monorepo-template");if(e.includes("@myorg")&&!e.includes(n)){let s=e.split(`
`).filter((i)=>i.includes("shields.io")||i.includes("badge.svg"));for(let i of s)if(i.includes("@myorg"))o.push(`Badge line still contains @myorg: ${i.trim().slice(0,80)}`)}return o}var{file:za}=globalThis.Bun;var Do,Xa;var jo=f(()=>{w();Do=l({meta:{name:"check",description:"Check README badges for placeholder owner/scope"},args:{owner:{type:"string",description:"Expected owner/repo",default:"YOUR_ORG/YOUR_REPO"},scope:{type:"string",description:"Expected scope",default:"@your-scope"}},run:async({args:e})=>{let t=e.owner||"YOUR_ORG/YOUR_REPO",n=e.scope||"@your-scope",o=`${process.cwd()}/README.md`,s=await za(o).text().catch(()=>"");if(!s)console.error(`No README at ${o}`),process.exit(1);let i=No(s,t,n);if(i.length===0)console.log("\u2705 Badges look OK (no placeholder owner/scope in badge URLs)"),process.exit(0);console.warn(`\u26A0\uFE0F Badge issues:
${i.map((r)=>`  - ${r}`).join(`
`)}`),process.exit(1)}}),Xa=l({meta:{name:"badges",version:"1.0.0",description:"Badges validation \u2014 check README badges"},subCommands:{check:Do},run:async()=>{await q(Do,{rawArgs:[]})}})});var Wt="v0.72.2",Jt="v0.7.11",Lo;var Kt=f(()=>{Lo={BUN_VERSION:"latest",NATIVE_DIR:"packages/native",NATIVE_CARGO:"Cargo.toml",CRATES_DIR:"crates",NATIVE_NPM:"packages/native/npm/*/package.json",NATIVE_WASI_SDK_VERSION:"24",PIXI_VERSION:"v0.72.2",PIXI_PACK_VERSION:"v0.7.11",VENDOR_DIR:"vendor",APP_DIR:"apps/example",APP_DOCKERFILE:"apps/example/Dockerfile"}});import{existsSync as Le,readFileSync as Qa}from"fs";import{mkdir as Za,writeFile as ec}from"fs/promises";import{homedir as tc}from"os";import{join as I}from"path";var{spawnSync:Bo}=globalThis.Bun;function de(e){return I(e,nc)}function Vo(e,t=lt){return I(de(e),"envs",t)}function Yt(e,t=lt){return I(Vo(e,t),"bin")}function pt(){return process.env.PIXI_HOME||I(tc(),".pixi")}function sc(){return I(pt(),"bin","pixi")}function ic(e=Wt){return`PIXI_HOME=${JSON.stringify(pt())} PIXI_VERSION=${JSON.stringify(e)} curl -fsSL https://pixi.sh/install.sh | bash`}function rc(e=process.platform,t=process.arch){if(e==="darwin")return t==="x64"?"x86_64-apple-darwin":"aarch64-apple-darwin";if(e==="win32")return t==="x64"?"x86_64-pc-windows-msvc":"aarch64-pc-windows-msvc";return t==="x64"?"x86_64-unknown-linux-gnu":"aarch64-unknown-linux-gnu"}function ac(e=Jt,t=rc()){let n=t.includes("windows")?`pixi-unpack-${t}.exe`:`pixi-unpack-${t}`;return`https://github.com/Quantco/pixi-pack/releases/download/${e}/${n}`}function cc(e,t={}){let n=t.env??lt,o=[];if(t.archive){let s=t.archive,i=process.env.SANDBOX_PIXI_UNPACK??I(pt(),"bin","pixi-unpack");if(t.hasPixiUnpack===!1)i=I(de(e),"bin","pixi-unpack"),o.push({label:`Download pixi-unpack (${Jt})`,shell:[`mkdir -p ${JSON.stringify(I(de(e),"bin"))}`,`curl -fsSL ${JSON.stringify(ac())} -o ${JSON.stringify(i)}`,`chmod +x ${JSON.stringify(i)}`].join(" && ")});if(/^https?:\/\//i.test(t.archive)){let r=I(de(e),"packs","sandbox.tar");s=r,o.push({label:"Download the environment bundle",shell:[`mkdir -p ${JSON.stringify(I(de(e),"packs"))}`,`curl -fsSL ${JSON.stringify(t.archive)} -o ${JSON.stringify(r)}`].join(" && ")})}return o.push({label:`Unpack the environment (${n})`,spawn:[i,s,"-o",I(de(e),"envs"),"-e",n],cwd:e}),o}if(t.hasPixi===!1)o.push({label:`Download pixi (${Wt})`,shell:ic(),cwd:e});return o.push({label:"Install the environment (locked)",spawn:["pixi","install","--locked"],cwd:e}),o}function lc(e,t=oc){if(e.includes('replace-with = "vendored-sources"'))return e;let n=`[source.crates-io]
replace-with = "vendored-sources"

[source.vendored-sources]
directory = "${t}"
`;return`${e.trimEnd()}

# Offline vendored source \u2014 generated on demand by \`m sandbox fetch-vendor\`.
${n}`}function Mo(e,t){let n=Yt(t);if(!Le(n))return console.warn(`\u26A0\uFE0F  Sandbox env not found at ${n} \u2014 run \`m sandbox setup\` first.`),1;return Bo({cmd:e,env:{...process.env,PATH:`${n}:${process.env.PATH??""}`},cwd:t,stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}async function uc(e,t){let n=cc(e,{...t,hasPixi:oe("pixi")!==null||Le(sc()),hasPixiUnpack:Boolean(process.env.SANDBOX_PIXI_UNPACK)||Le(I(pt(),"bin","pixi-unpack"))});for(let o of n){console.log(`
\u25B8 ${o.label}`);let s=0;if(o.shell)s=Bo({cmd:["bash","-c",o.shell],env:{...process.env},...o.cwd?{cwd:o.cwd}:{},stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode??0;else if(o.spawn)s=g(o.spawn,{cwd:o.cwd});if(s!==0)console.error(`::error::m sandbox setup failed at: ${o.label}`),process.exit(1)}console.log(`
\u2705 Sandbox ready: ${Vo(e,t.env)}`),console.log(`   bin: ${Yt(e,t.env)}`),console.log("   next: m sandbox verify  |  m sandbox fetch-vendor")}async function Go(e){let t=ee();await Za(de(t),{recursive:!0}),await uc(t,{archive:e.archive??process.env.SANDBOX_ENV_ARCHIVE,env:e.env||lt}),process.exit(0)}var nc=".pixi",lt="default",oc="vendor",pc,mc,dc,gc;var Uo=f(()=>{Kt();_();w();ie();pc=["pixi","act","actionlint","podman","cargo","pixi-pack","pixi-unpack"];mc=l({meta:{name:"setup",description:"Download pixi and the env bundle, then unpack it"},args:{archive:{type:"string",description:"Sandbox bundle archive (path or URL)",required:!1},env:{type:"string",description:"Environment name (default: default)",required:!1}},run:({args:e})=>Go(e)}),dc=l({meta:{name:"m sandbox",version:"1.0.0",description:"Reproducible pixi sandbox \u2014 download pixi and the packed environment, unpack it, run tools offline"},args:{archive:{type:"string",description:"Sandbox bundle archive (path or URL), defaults to $SANDBOX_ENV_ARCHIVE",required:!1},env:{type:"string",description:"Environment name (default: default)",required:!1}},subCommands:{setup:mc,run:l({meta:{name:"run",description:"Run a tool with the sandbox env's bin/ first on PATH"},args:{tool:{type:"positional",description:"Tool to run, e.g. act, actionlint, cargo, podman",required:!0}},run(){let e=ee(),t=v("run"),n=t[0];if(!n)console.error("Usage: m sandbox run <tool> [args...]"),process.exit(1);process.exit(Mo([n,...t.slice(1)],e))}}),"fetch-vendor":l({meta:{name:"fetch-vendor",description:"Rebuild the cargo vendor tree and wire .cargo/config.toml offline"},run(){let e=ee(),t=Mo(["cargo","vendor","vendor"],e);if(t!==0)process.exit(t);let n=I(e,".cargo","config.toml"),o=Le(n)?Qa(n,"utf8"):"",s=lc(o);if(s!==o)ec(n,s),console.log(`\u2705 Wrote offline vendored override to ${n}`);else console.log(`\u2705 ${n} already wired for vendored sources`);process.exit(0)}}),verify:l({meta:{name:"verify",description:"Report which sandbox tools resolve (env bin/ or PATH)"},run(){let e=ee(),t=Yt(e);console.log(`Sandbox: ${t}`);for(let n of pc){let o=Le(I(t,n)),s=oe(n);if(o||s)console.log(`  \u2713 ${n} \u2192 ${o?I(t,n):s}`);else console.log(`  \u2717 ${n} \u2014 neither in the env nor on PATH`)}process.exit(0)}})},run:({args:e})=>Go(e)}),gc=dc});var{file:fc}=globalThis.Bun;function Fo(e,t){return async({targetDir:n,scope:o})=>{let s=qe(...e.split("/"));if(!await fc(s).exists())return;console.log(`
\uD83D\uDD27 Running setup for ${t}: ${e}
`);try{let r=await Bun.spawn({cmd:["bun",s],cwd:n,env:{...process.env,SCOPE:o,NATIVE_SCOPE:o,UNOCSS_SCOPE:o,DEVCONTAINER_SCOPE:o,SKILLS_SCOPE:o},stdout:"inherit",stderr:"inherit"}).exited;if(r!==0)console.warn(`\u26A0\uFE0F Setup for ${t} exited with code ${r}`)}catch(i){console.warn(`\u26A0\uFE0F Setup for ${t} failed:`,i)}}}var Ho,qo;var Wo=f(()=>{_();Ho=Fo("commands/native-setup.ts","native"),qo=Fo("commands/devcontainer-setup.ts","devcontainer")});var{file:Jo}=globalThis.Bun;async function Wu(e){return[...Z]}function yc(e){if(typeof e==="boolean")return!0;if(typeof e!=="string")return!1;return e==="always"||vc.includes(e)}function Yo(e,t){let n=e.flag?t[e.flag]:void 0;return n===void 0?e.default:n}function zo(e,t){return e.type==="select"?t===e.default:!t}function wc(e,t){if(e.default==="always"&&!e.selfDestruct)return!0;let n=Yo(e,t);return!(e.selfDestruct===!0||zo(e,n))}function Xo(e,t){let n=new Set;for(let o of e)if(wc(o.meta,t))n.add(o.dir);return n}function Qo(e,t){let n=new Set(["template"]);for(let o of e){let{meta:s}=o;if(s.default==="always")continue;let i=Yo(s,t);if(zo(s,i)){if(n.add(o.dir),s.flag)n.add(s.flag);if(s.marker)n.add(s.marker);if(s.templateMarker)n.add(s.templateMarker);for(let a of s.markers??[])n.add(a)}for(let a of s.options??[]){if(a.value===i)continue;if(a.marker)n.add(a.marker);if(a.templateMarker)n.add(a.templateMarker);for(let c of a.markers??[])n.add(c)}let r=s.removals?.[String(i)];if(r){if(r.marker)n.add(r.marker);if(r.templateMarker)n.add(r.templateMarker);for(let a of r.markers??[])n.add(a);for(let a of r.markersToRemove??[])n.add(a)}}return n}async function Zo(e){let t=Jo(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.features;if(!o||typeof o!=="object"||Array.isArray(o))return null;let s={};for(let[i,r]of Object.entries(o))if(yc(r))s[i]=r;return s}catch{return null}}async function es(e){let t=Jo(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.scope;return typeof o==="string"&&o.length>0?o:null}catch{return null}}var hc,Ko="@myorg",bc,Z,qu,Ju="tooling.features",Ku="tooling.scope",vc;var ts=f(()=>{Wo();hc={none:"none",publish:"publish",docker:"docker"},bc={badges:{name:"@myorg/badges",dir:"badges",meta:{default:"always",flag:"badges",prompt:"Include badges for CI, coverage, license in READMEs?"}},biome:{name:"@myorg/biome",ciFiles:["sections/biome.yml"],dir:"biome",meta:{default:"always",flag:"biome",prompt:"Configure Biome (lint + format)?"}},"bun-config":{name:"@myorg/bun-config",ciFiles:["sections/bun-config.yml"],dir:"bun-config",meta:{default:"always",flag:"bun-config",prompt:"Configure Bun (coverage, test settings)?"}},bunup:{name:"@myorg/bunup",ciFiles:["sections/bunup.yml"],dir:"bunup",meta:{default:"always",flag:"bunup",prompt:"Configure Bunup (Bun-based package bundler)?"}},changeset:{name:"@myorg/changeset",ciFiles:["fragments/changeset/release.steps.yml"],dir:"changeset",meta:{default:"always",flag:"changeset",prompt:"Configure Changesets (versioning + releases)?"}},citty:{name:"@myorg/citty",dir:"citty",meta:{default:"always",flag:"citty",prompt:"Configure Citty (elegant CLI builder)?"}},codeql:{name:"@myorg/codeql",ciFiles:["sections/codeql.yml"],dir:"codeql",meta:{default:!0,flag:"codeql",prompt:"Include CodeQL (GitHub SAST for JS/TS)?",type:"confirm"}},commitlint:{name:"@myorg/commitlint",dir:"commitlint",meta:{default:"always",flag:"commitlint",prompt:"Configure Commitlint (Conventional Commits)?"}},community:{name:"@myorg/community",dir:"community",meta:{default:"always",flag:"community",prompt:"Include community health files (CODEOWNERS, PR template, issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING)?"}},coverage:{name:"@myorg/coverage",ciFiles:["fragments/coverage-report/coverage.base.yml","fragments/coverage-report/coverage.steps.yml","fragments/coverage-report/pages.steps.yml","sections/coverage.yml"],dir:"coverage",meta:{default:"always",flag:"coverage",prompt:"Configure coverage reporting (LCOV, HTML, artifact, Pages, threshold)?"}},dependabot:{name:"@myorg/dependabot",ciFiles:["fragments/dependabot/dependabot-auto-merge.base.yml","fragments/dependabot/dependabot-auto-merge.steps.yml","fragments/dependabot/dependabot.base.yml","standalone/dependabot.yml"],dir:"dependabot",meta:{default:"always",flag:"dependabot",prompt:"Configure Dependabot (automated dependency updates)?"}},devcontainer:{name:"@myorg/devcontainer",dir:"devcontainer",setup:qo,meta:{default:!1,flag:"devcontainer",prompt:"Include devcontainer config for Codespaces / Dev Containers?",type:"confirm",removals:{true:{},false:{extraRemovals:[".devcontainer"],filePatternsToRemove:["**/.devcontainer/**",".devcontainer/**","**/devcontainer.json"],fileRegexesToRemove:["devcontainer","\\.devcontainer"]}}}},editorconfig:{name:"@myorg/editorconfig",dir:"editorconfig",meta:{default:"always",flag:"editorconfig",prompt:"Include .editorconfig (consistent editor settings)?"}},"gh-actions":{name:"@myorg/gh-actions",ciFiles:["ci.base.yml","ci.bootstrap.yml","release.base.yml","sections/gh-actions.yml","fragments/sandbox/sandbox.base.yml","fragments/sandbox/sandbox.steps.yml"],dir:"gh-actions",meta:{default:"always",flag:"gh-actions",prompt:"Configure GitHub Actions (CI + release workflows)?"}},gitattributes:{name:"@myorg/gitattributes",dir:"gitattributes",meta:{default:"always",flag:"gitattributes",prompt:"Include .gitattributes (line endings, binary handling)?"}},gitleaks:{name:"@myorg/gitleaks",ciFiles:["sections/gitleaks.yml"],dir:"gitleaks",meta:{default:"always",flag:"gitleaks",prompt:"Include Gitleaks (secret scanning via Lefthook + CI)?"}},lefthook:{name:"@myorg/lefthook",dir:"lefthook",meta:{default:"always",flag:"lefthook",prompt:"Configure Lefthook (Git hooks)?"}},manifest:{name:"@myorg/manifest",dir:"manifest",meta:{default:"always",flag:"manifest",prompt:"Configure the manifest editor (format-preserving package.json edits)?"}},native:{name:"@myorg/native-config",ciFiles:["fragments/native/native.base.yml","fragments/native/native.steps.yml","fragments/native/release.steps.yml","sections/native.yml"],dir:"native",setup:Ho,meta:{default:"none",flag:"native",prompt:"Set up native Node-API (NAPI-RS) bindings?",type:"select",options:[{value:"none",label:"None - skip native bindings"},{value:"publish",label:"Publish a native npm package"},{value:"docker",label:"Build native bindings in Docker"}],removals:{none:{extraRemovals:["packages/native","crates","Cargo.toml","rust-toolchain.toml",".cargo","Cargo.lock","apps/example/src/pages/api/native"],scriptsToRemove:["build:native","build:wasm","test:native","security:audit"],turboTasksToRemove:["build:native","build:wasm"],filePatternsToRemove:["**/*.node","**/*.napi.*","**/*.wasi.cjs","**/rust-toolchain.toml","**/Cargo.toml","**/Cargo.lock",".cargo/**","**/native/**","**/api/native/**"],fileRegexesToRemove:["\\\\.node$","napi","rust-toolchain","\\\\bCargo\\.toml$","\\\\bCargo\\.lock$","api/native"],appDepsToRemove:["@myorg/native"]},publish:{},docker:{}}}},pages:{name:"@myorg/pages",ciFiles:["fragments/pages/pages.base.yml","fragments/pages/pages.steps.yml"],dir:"pages",meta:{default:!1,flag:"pages",prompt:"Set up GitHub Pages deployment (static site via Actions)?",type:"confirm",removals:{true:{},false:{extraRemovals:[".github/workflows/pages.yml"],filePatternsToRemove:["**/pages.yml"],fileRegexesToRemove:["pages\\.yml"]}}}},playwright:{name:"@myorg/playwright",ciFiles:["sections/playwright.yml"],dir:"playwright",meta:{default:!0,flag:"playwright",prompt:"Include E2E testing with Playwright?",removals:{true:{},false:{scriptsToRemove:["test:e2e"],turboTasksToRemove:["test:e2e"],extraRemovals:["apps/example/playwright.config.ts","apps/example/e2e"],filePatternsToRemove:["**/e2e/**","**/*.e2e.ts","**/playwright.config.ts"],fileRegexesToRemove:["playwright",".*\\.spec\\.e2e\\..*"],appDepsToRemove:["@myorg/playwright","@playwright/test"]}}}},skills:{name:"@myorg/skills",dir:"skills",meta:{default:!1,flag:"skills",prompt:"Install AI agent skills? (for Cursor, Claude, Cline)",removals:{false:{extraRemovals:[".agents"],filePatternsToRemove:[".agents/**","**/.claude/**","**/skills/**"],fileRegexesToRemove:["\\.agents","skills"],scriptsToRemove:["skills"]}}}},stale:{name:"@myorg/stale",ciFiles:["fragments/stale/stale.base.yml"],dir:"stale",meta:{default:!1,flag:"stale",prompt:"Include stale action (auto-close inactive issues/PRs)?",type:"confirm"}},template:{name:"@myorg/template",dir:"template",meta:{default:"always",selfDestruct:!0,scriptsToRemove:["docs:sync","docs:site","docs:dev","docs:build","docs:preview"],removals:{always:{extraRemovals:[".github/workflows/template-docs.yml","apps/template-docs","codecov.yml","packages/tooling/tests","packages/tooling/dist"],filePatternsToRemove:["**/template-docs.yml","**/template-docs/**",".changeset/*.md"],fileRegexesToRemove:["template-docs"]}}}},trivy:{name:"@myorg/trivy",ciFiles:["sections/trivy.yml"],dir:"trivy",meta:{default:!1,flag:"trivy",prompt:"Include Trivy (container + filesystem vulnerability scanning)?",type:"confirm",removals:{false:{filePatternsToRemove:["**/trivy*"],scriptsToRemove:["security:trivy","security:check"]}}}},ts:{name:"@myorg/ts",dir:"ts",meta:{default:"always",flag:"ts",prompt:"Configure TypeScript (shared tsconfigs)?"}},turbo:{name:"@myorg/turbo",ciFiles:["sections/turbo.yml"],dir:"turbo",meta:{default:"always",flag:"turbo",prompt:"Configure Turbo (task orchestration)?"}}},Z=Object.values(bc),qu=new Map(Z.map((e)=>[e.dir,e]));vc=Object.values(hc)});function ns(e,t){if(e.startsWith("!")){let n=e.slice(1).trim();return!t.has(n)&&!t.has(n.toLowerCase())}return t.has(e)||t.has(e.toLowerCase())}function zu(e){return[e,"-type","f","(",...kc.flatMap((t,n)=>[...n>0?["-o"]:[],"-name",`*${t}`]),")","-not","-path","*/node_modules/*","-not","-path","*/dist/*","-not","-path","*/packages/tooling/*"]}function os(e,t){let n=e,o=!1;for(let s of xc)n=n.replace(s,(i,r,a)=>{let c=r.split(",").map((p)=>p.trim());return o=!0,c.every((p)=>ns(p,t))?"":a});for(let s of Cc)n=n.replace(s,(i,r,a)=>{if(r.toUpperCase()==="TEMPLATE-ONLY")return i;return o=!0,ns(r,t)?"":a});if(!o)return{content:e,changed:o};return{changed:o,content:n.replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).replace(/\n{2,}$/,`
`)}}var kc,xc,Cc;var ss=f(()=>{kc=[".yml",".yaml",".ts",".js",".md",".toml",".html"],xc=[/[ \t]*#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g],Cc=[/[ \t]*#[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*\1:END[^\n]*\n?/g,/[ \t]*\/\/[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*\1:END[^\n]*\n?/g,/[ \t]*<!--[ \t]*([A-Za-z0-9_!-]+):START[ \t]*-->([\s\S]*?)<!--[ \t]*\1:END[ \t]*-->[ \t]*\n?/g]});import{mkdir as is}from"fs/promises";var{$:Sc,file:xe,write:$c}=globalThis.Bun;function cs(e){return as.exec(e)?.[1]??null}function ls(e){return Rc.exec(e)?.[1]??null}function Tc(e,t){let n=[],o=t,s=[],i=()=>{let r=s.join(`
`).replace(/^(?:[ \t]*\n)+/,"").replace(/\s+$/,"");if(r)n.push({section:o,text:r});s=[]};for(let r of e.split(`
`)){let a=cs(r);if(a){i(),o=a;continue}s.push(r)}return i(),n}function Ec(e){return e.split(`
`).some((t)=>as.test(t))}function _c(e,t){let n=new Map;for(let r of t)for(let a of Tc(r,ps)){let c=n.get(a.section)??[];c.push(a.text),n.set(a.section,c)}let o=new Set,s=new Set,i=[];for(let r of e.split(`
`)){let a=cs(r);if(!a){i.push(r);continue}o.add(a);let c=n.get(a);if(c?.length)s.add(a),i.push(c.join(`

`))}for(let r of n.keys())if(!o.has(r))console.log(`\u26A0\uFE0F No "# SECTION: ${r}" in the CI skeleton \u2014 steps dropped`);return{rendered:i.join(`
`),filled:s}}function Oc(e,t){if(t.size===0)return e;let n=[],o=!1;for(let s of e.split(`
`)){let i=ls(s);if(i)o=t.has(i);else if(/^\S/.test(s))o=!1;if(!o)n.push(s)}return n.join(`
`)}function Ic(e,t){let n=e.split(`
`),o=!1;for(let[s,i]of n.entries()){let r=ls(i);if(r)o=r===Ac;else if(/^\S/.test(i))o=!1;if(o&&/^ {4}needs: \[[^\]]*\]$/.test(i)){n[s]=`    needs: [${t.join(", ")}]`;break}}return n.join(`
`)}function us(){return new Set(Z.map((e)=>e.dir))}function zt(e){return qe("ci",...e.split("/"))}function Pc(e,t){if(t==="ci.steps.yml")return e.startsWith("sections/");return(e.split("/").pop()??"")===t}async function Nc(e,t){let n=[];for(let o of Z){if(!t.has(o.dir))continue;for(let s of o.ciFiles??[]){if(!Pc(s,e))continue;n.push((await xe(zt(s)).text()).trimEnd())}}return n}async function Dc(e,t){for(let n of Z){if(!t.has(n.dir))continue;for(let o of n.ciFiles??[])if((o.split("/").pop()??"")===e)return zt(o)}return null}async function jc(){let e=zt("ci.bootstrap.yml");if(!await xe(e).exists())return"";return(await xe(e).text()).trimEnd()}async function Lc(e,t){if(!t)return;let n=Qo(Z,t),o=await es(e);return(s)=>{let{content:i}=os(s,n);return o?i.replaceAll(Ko,o):i}}async function Mc(e,t,n,o={}){let s=o.enabled??us(),i=await Dc(t,s);if(!i){console.log(`\u26A0\uFE0F Skipping ${t} \u2014 no enabled feature declares it`);return}let r=await xe(i).text(),a=await Nc(n,s),c=a.join(`

`),u;if(n==="ci.steps.yml"&&Ec(r)){let b=_c(r.replaceAll("{{BOOTSTRAP}}",await jc()),a),m=new Set(rs.filter((y)=>!b.filled.has(y))),C=[ps,...rs.filter((y)=>!m.has(y))];u=Ic(Oc(b.rendered,m),C)}else u=r.replace("{{STEPS}}",`${c}
`).replace("{{UPDATES}}",`${c}
`);let p=u;for(let[b,m]of Object.entries(Lo))p=p.replaceAll(`{{${b}}}`,m);p=p.replace(/\n{3,}/g,`

`);let k;if(t==="dependabot.base.yml")k=`${e}/.github/dependabot.yml`;else k=`${e}/.github/workflows/${t.replace(".base.yml",".yml")}`;await $c(k,o.postProcess?o.postProcess(p):p),console.log(`\u2705 generated ${k}`)}async function Vc(e,t,n,o){let s=t.outcome(n);if(s==="skip")return;if(s==="generate"){await Mc(e,t.base,t.steps,o);return}if(!t.stale)return;let i=`${e}/${t.stale}`;if(!await xe(i).exists())return;await Sc`rm -rf ${i}`.quiet();let r=t.reason?.(n);if(r)console.log(`\uD83D\uDDD1\uFE0F Removed ${i} (${r})`)}async function ms(e,t={}){await is(`${e}/.github/workflows`,{recursive:!0}),await is(`${e}/.github`,{recursive:!0});let n=await Zo(e),o=t.enabled??(n?Xo(Z,n):us()),s=t.postProcess??await Lc(e,n),i=o.has("pages"),r=t.templateDocsSite??await xe(`${e}/apps/template-docs/.vitepress/config.mts`).exists(),a={pages:i,coverage:o.has("coverage"),native:o.has("native"),dependabot:o.has("dependabot")||o.has("gh-actions"),stale:o.has("stale"),templateDocsSite:r,pagesDeploysToSite:i&&!r};for(let c of Bc)await Vc(e,c,a,{...t,enabled:o,postProcess:s})}var as,Rc,ps="quality",Ac="gate",rs,Bc,sm;var ds=f(async()=>{_();ts();ss();Kt();as=/^[ \t]*#[ \t]*SECTION:[ \t]*([A-Za-z0-9_-]+)[ \t]*$/,Rc=/^ {2}([A-Za-z0-9_-]+):$/;rs=["coverage","security","native","e2e"];Bc=[{base:"ci.base.yml",steps:"ci.steps.yml",outcome:()=>"generate"},{base:"release.base.yml",steps:"release.steps.yml",outcome:()=>"generate"},{base:"pages.base.yml",steps:"pages.steps.yml",outcome:(e)=>e.pagesDeploysToSite?"generate":"remove",stale:".github/workflows/pages.yml",reason:(e)=>e.templateDocsSite?"template docs site deploys Pages":"pages disabled"},{base:"coverage.base.yml",steps:"coverage.steps.yml",outcome:(e)=>{if(!e.coverage)return"skip";return e.pagesDeploysToSite||e.templateDocsSite?"remove":"generate"},stale:".github/workflows/coverage.yml",reason:(e)=>e.templateDocsSite?"coverage published by the docs site":"coverage included in pages.yml"},{base:"native.base.yml",steps:"native.steps.yml",outcome:(e)=>e.native?"generate":"remove",stale:".github/workflows/native.yml",reason:()=>"native disabled"},{base:"sandbox.base.yml",steps:"sandbox.steps.yml",outcome:(e)=>e.native?"generate":"remove",stale:".github/workflows/sandbox.yml",reason:()=>"native disabled \u2014 no Cargo.lock to bundle"},{base:"dependabot.base.yml",steps:"dependabot.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"dependabot-auto-merge.base.yml",steps:"dependabot-auto-merge.steps.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"stale.base.yml",steps:"stale.steps.yml",outcome:(e)=>e.stale?"generate":"remove",stale:".github/workflows/stale.yml"}];sm=process.argv[2]??"."});import{existsSync as gs}from"fs";import{cp as fs,rm as hs}from"fs/promises";var{spawnSync:Gc}=globalThis.Bun;function Me(e){return console.log(`
\u25B8 ${e.join(" ")}`),Gc({cmd:e,stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}var Xt=".pages",bs="apps/template-docs",ge,Qt="coverage/html",Uc,Fc;var vs=f(async()=>{w();await ds();ge=`${bs}/dist`;Uc=l({meta:{name:"m docs",version:"1.0.0",description:"Regenerate workflows from configs/* \u2014 static README/AGENTS with TEMPLATE-ONLY blocks"},args:{dir:{type:"string",description:"Target directory (default: .)",required:!1,default:"."}},subCommands:{site:l({meta:{name:"site",description:"Build one Pages artifact: docs + coverage report + demo app"},args:{"skip-coverage":{type:"boolean",description:"Reuse coverage/lcov.info instead of re-running the test suite",default:!1},"skip-app":{type:"boolean",description:"Skip building and copying the demo app to /example/",default:!1}},async run({args:e}){if(!e["skip-coverage"]){let n=Me(["bun","run","coverage"]);if(n!==0)console.error(`::error::bun run coverage failed (exit ${n})`),process.exit(n)}Me(["bun","run","m coverage","setup"]),Me(["bun","run","m coverage","html"]);let t=Me(["bun","run","docs:build"]);if(t!==0)console.error(`::error::${bs} build failed (exit ${t})`),process.exit(t);if(gs(`${Qt}/index.html`))await hs(`${ge}/coverage`,{recursive:!0,force:!0}),await fs(Qt,`${ge}/coverage`,{recursive:!0}),console.log(`\u2705 Coverage report copied to ${ge}/coverage`);else console.warn(`\u26A0\uFE0F ${Qt}/ not found \u2014 skipping /coverage/`);if(!e["skip-app"]){let n=Me(["bun","run","m pages","build"]);if(n!==0)console.error(`::error::m pages build failed (exit ${n})`),process.exit(n);if(gs(Xt))await hs(`${ge}/example`,{recursive:!0,force:!0}),await fs(Xt,`${ge}/example`,{recursive:!0}),console.log(`\u2705 Pages artifact copied to ${ge}/example`);else console.warn(`\u26A0\uFE0F ${Xt}/ not found \u2014 skipping /example/`)}if(console.log(`
\u2705 Site ready: ${ge}`),console.log("   /            docs"),console.log("   /status      coverage, CI, versions"),console.log("   /coverage/   HTML coverage report"),!e["skip-app"])console.log("   /example/    demo app");process.exit(0)}})},async run({args:e}){await ms(e.dir||".")}}),Fc=Uc});w();var Hc={lint:()=>Promise.resolve().then(() => (vn(),{})).then((e)=>Gs),"lint:fix":()=>Promise.resolve().then(() => (yn(),{})).then((e)=>Fs),biome:()=>Promise.resolve().then(() => (wn(),{})).then((e)=>qs),typecheck:()=>Promise.resolve().then(() => (kn(),{})).then((e)=>Js),turbo:()=>Promise.resolve().then(() => (xn(),{})).then((e)=>Ys),build:()=>Promise.resolve().then(() => (wt(),{})).then((e)=>ni),health:()=>Promise.resolve().then(() => (Sn(),{})).then((e)=>oi),bun:()=>Promise.resolve().then(() => (Tn(),{})).then((e)=>hi),test:()=>Promise.resolve().then(() => (En(),{})).then((e)=>bi),coverage:()=>Promise.resolve().then(() => (Bn(),{})).then((e)=>Li),changeset:()=>Promise.resolve().then(() => (Rt(),{})).then((e)=>Wi),commitlint:()=>Promise.resolve().then(() => (Hn(),{})).then((e)=>Xi),setup:()=>Promise.resolve().then(() => (Wn(),{})).then((e)=>rr),ci:()=>Promise.resolve().then(() => (Ke(),{})).then((e)=>fr),"ci:lint":()=>Promise.resolve().then(() => (Yn(),{})).then((e)=>hr),"ci:local":()=>Promise.resolve().then(() => (zn(),{})).then((e)=>br),gitleaks:()=>Promise.resolve().then(() => (Xn(),{})).then((e)=>kr),trivy:()=>Promise.resolve().then(() => (Zn(),{})).then((e)=>Tr),codeql:()=>Promise.resolve().then(() => (eo(),{})).then((e)=>Er),native:()=>Promise.resolve().then(() => (xo(),{})).then((e)=>ka),e2e:()=>Promise.resolve().then(() => (So(),{})).then((e)=>Sa),pages:()=>Promise.resolve().then(() => (Eo(),{})).then((e)=>Ba),skills:()=>Promise.resolve().then(() => (Po(),{})).then((e)=>Ya),badges:()=>Promise.resolve().then(() => (jo(),{})).then((e)=>Xa),sandbox:()=>Promise.resolve().then(() => (Uo(),{})).then((e)=>gc),docs:()=>vs().then(() => ({})).then((e)=>Fc)},qc=l({meta:{name:"m",version:"0.1.0",description:"Unified monorepo toolchain CLI"},subCommands:Hc});ft(qc);

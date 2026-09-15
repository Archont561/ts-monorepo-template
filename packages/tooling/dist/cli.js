#!/usr/bin/env bun
// @bun
var ts=Object.create;var{getPrototypeOf:ns,defineProperty:Ft,getOwnPropertyNames:os}=Object;var Vt=Object.prototype.hasOwnProperty;function ss(e){return this[e]}var is,rs,mc=(e,t,n)=>{var o=e!=null&&typeof e==="object";if(o){var s=t?is??=new WeakMap:rs??=new WeakMap,i=s.get(e);if(i)return i}n=e!=null?ts(ns(e)):{};let r=t||!e||!e.__esModule||!Vt.call(e,"default")?Ft(n,"default",{value:e,enumerable:!0}):n;if(e&&typeof e==="object"||typeof e==="function"){for(let a of os(e))if(!Vt.call(r,a))Ft(r,a,{get:ss.bind(e,a),enumerable:!0})}if(o)s.set(e,r);return r};var dc=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var f=(e,t,n)=>()=>{if(e)try{t=e(e=0)}catch(o){n=[o]}if(n)throw n[0];return t};function ls(e=""){if(as.test(e))return;return e!==e.toLowerCase()}function Ut(e,t){let n=t??cs,o=[];if(!e||typeof e!=="string")return o;let s="",i,r;for(let a of e){let c=n.includes(a);if(c===!0){o.push(s),s="",i=void 0;continue}let u=ls(a);if(r===!1){if(i===!1&&u===!0){o.push(s),s=a,i=u;continue}if(i===!0&&u===!1&&s.length>1){let p=s.at(-1);o.push(s.slice(0,Math.max(0,s.length-1))),s=p+a,i=u;continue}}s+=a,i=u,r=c}return o.push(s),o}function ps(e){return e?e[0].toUpperCase()+e.slice(1):""}function us(e){return e?e[0].toLowerCase()+e.slice(1):""}function ms(e,t){return e?(Array.isArray(e)?e:Ut(e)).map((n)=>ps(t?.normalize?n.toLowerCase():n)).join(""):""}function ve(e,t){return us(ms(e||"",t))}function Pe(e,t){return e?(Array.isArray(e)?e:Ut(e)).map((n)=>n.toLowerCase()).join(t??"-"):""}function Ht(e){return Pe(e||"","_")}var as,cs;var qt=f(()=>{as=/\d/,cs=["-","_","/","."]});import{parseArgs as ds}from"util";function ye(e){if(Array.isArray(e))return e;return e===void 0?[]:[e]}function ot(e,t=""){let n=[];for(let o of e)for(let[s,i]of o.entries())n[s]=Math.max(n[s]||0,i.length);return e.map((o)=>o.map((s,i)=>t+s[i===0?"padStart":"padEnd"](n[i])).join("  ")).join(`
`)}function _(e){return typeof e==="function"?e():e}function gs(e=[],t={}){let n=new Set(t.boolean||[]),o=new Set(t.string||[]),s=t.alias||{},i=t.default||{},r=new Map,a=new Map;for(let[d,h]of Object.entries(s)){let A=h;for(let B of A){if(r.set(d,B),!a.has(B))a.set(B,[]);if(a.get(B).push(d),r.set(B,d),!a.has(d))a.set(d,[]);a.get(d).push(B)}}let c={};function u(d){if(n.has(d))return"boolean";let h=a.get(d)||[];for(let A of h)if(n.has(A))return"boolean";return"string"}function p(d){if(o.has(d))return!0;let h=a.get(d)||[];for(let A of h)if(o.has(A))return!0;return!1}let w=new Set([...n,...o,...Object.keys(s),...Object.values(s).flat(),...Object.keys(i)]);for(let d of w)if(!c[d])c[d]={type:u(d),default:i[d]};for(let[d,h]of r.entries())if(d.length===1&&c[h]&&!c[h].short)c[h].short=d;let b=[],m={};for(let d=0;d<e.length;d++){let h=e[d];if(h==="--"){b.push(...e.slice(d));break}if(h.startsWith("--no-")){let A=h.slice(5);m[A]=!0;continue}b.push(h)}let C;try{C=ds({args:b,options:Object.keys(c).length>0?c:void 0,allowPositionals:!0,strict:!1})}catch{C={values:{},positionals:b}}let y={_:[]};y._=C.positionals;for(let[d,h]of Object.entries(C.values)){let A=h;if(u(d)==="boolean"&&typeof h==="string")A=h!=="false";else if(p(d)&&typeof h==="boolean")A="";y[d]=A}for(let[d]of Object.entries(m)){y[d]=!1;let h=r.get(d);if(h)y[h]=!1;let A=a.get(d);if(A)for(let B of A)y[B]=!1}for(let[d,h]of r.entries()){if(y[d]!==void 0&&y[h]===void 0)y[h]=y[d];if(y[h]!==void 0&&y[d]===void 0)y[d]=y[h];if(y[d]!==y[h]&&i[h]===y[h])y[h]=y[d]}return y}function hs(e,t){let n={boolean:[],string:[],alias:{},default:{}},o=Kt(t);for(let a of o){if(a.type==="positional")continue;if(a.type==="string"||a.type==="enum")n.string.push(a.name);else if(a.type==="boolean")n.boolean.push(a.name);if(a.default!==void 0)n.default[a.name]=a.default;if(a.alias)n.alias[a.name]=a.alias;let c=ve(a.name),u=Pe(a.name);if(c!==a.name||u!==a.name){let p=ye(n.alias[a.name]||[]);if(c!==a.name&&!p.includes(c))p.push(c);if(u!==a.name&&!p.includes(u))p.push(u);if(p.length>0)n.alias[a.name]=p}}let s=gs(e,n),[...i]=s._,r=new Proxy(s,{get(a,c){return a[c]??a[ve(c)]??a[Pe(c)]}});for(let[,a]of o.entries())if(a.type==="positional"){let c=i.shift();if(c!==void 0)r[a.name]=c;else if(a.default===void 0&&a.required!==!1)throw new F(`Missing required positional argument: ${a.name.toUpperCase()}`,"EARG");else r[a.name]=a.default}else if(a.type==="enum"){let c=r[a.name],u=a.options||[];if(c!==void 0&&u.length>0&&!u.includes(c))throw new F(`Invalid value for argument: ${D(`--${a.name}`)} (${D(c)}). Expected one of: ${u.map((p)=>D(p)).join(", ")}.`,"EARG")}else if(a.required&&r[a.name]===void 0)throw new F(`Missing required argument: --${a.name}`,"EARG");return r}function Kt(e){let t=[];for(let[n,o]of Object.entries(e||{}))t.push({...o,name:n,alias:ye(o.alias)});return t}async function bs(e){return Promise.all(e.map((t)=>_(t)))}function l(e){return e}async function q(e,t){let n=await _(e.args||{}),o=hs(t.rawArgs,n),s={rawArgs:t.rawArgs,args:o,data:t.data,cmd:e},i=await bs(e.plugins??[]),r,a;try{for(let p of i)await p.setup?.(s);if(typeof e.setup==="function")await e.setup(s);let u=await _(e.subCommands);if(u&&Object.keys(u).length>0){let p=Yt(t.rawArgs,n),w=t.rawArgs[p];if(w){let b=await rt(u,w);if(!b)throw new F(`Unknown command ${D(w)}`,"E_UNKNOWN_COMMAND");await q(b,{rawArgs:t.rawArgs.slice(p+1)})}else{let b=await _(e.default);if(b){if(e.run)throw new F("Cannot specify both 'run' and 'default' on the same command.","E_DEFAULT_CONFLICT");let m=await rt(u,b);if(!m)throw new F(`Default sub command ${D(b)} not found in subCommands.`,"E_UNKNOWN_COMMAND");await q(m,{rawArgs:t.rawArgs})}else if(!e.run)throw new F("No command specified.","E_NO_COMMAND")}}if(typeof e.run==="function")r=await e.run(s)}catch(u){a=u}let c=[];if(typeof e.cleanup==="function")try{await e.cleanup(s)}catch(u){c.push(u)}for(let u of[...i].reverse())try{await u.cleanup?.(s)}catch(p){c.push(p)}if(a)throw a;if(c.length===1)throw c[0];if(c.length>1)throw Error("Multiple cleanup errors",{cause:c});return{result:r}}async function it(e,t,n){let o=await _(e.subCommands);if(o&&Object.keys(o).length>0){let s=Yt(t,await _(e.args||{})),i=t[s],r=await rt(o,i);if(r)return it(r,t.slice(s+1),e)}return[e,n]}async function rt(e,t){if(t in e)return _(e[t]);for(let n of Object.values(e)){let o=await _(n),s=await _(o?.meta);if(s?.alias){if(ye(s.alias).includes(t))return o}}}function Yt(e,t){for(let n=0;n<e.length;n++){let o=e[n];if(o==="--")return-1;if(o.startsWith("-")){if(!o.includes("=")&&vs(o,t))n++;continue}return n}return-1}function vs(e,t){let n=e.replace(/^-{1,2}/,""),o=ve(n);for(let[s,i]of Object.entries(t)){if(i.type!=="string"&&i.type!=="enum")continue;if(o===ve(s))return!0;if((Array.isArray(i.alias)?i.alias:i.alias?[i.alias]:[]).includes(n))return!0}return!1}async function zt(e,t){try{console.log(await Qt(e,t)+`
`)}catch(n){console.error(n)}}async function Qt(e,t){let n=await _(e.meta||{}),o=Kt(await _(e.args||{})),s=await _(t?.meta||{}),i=`${s.name?`${s.name} `:""}`+(n.name||process.argv[1]),r=[],a=[],c=[],u=[];for(let m of o)if(m.type==="positional"){let C=m.name.toUpperCase(),y=m.required!==!1&&m.default===void 0;a.push([D(C+st(m)),Wt(m,y)]),u.push(y?`<${C}>`:`[${C}]`)}else{let C=m.required===!0&&m.default===void 0,y=[...(m.alias||[]).map((d)=>`-${d}`),`--${m.name}`].join(", ")+st(m);if(r.push([D(y),Wt(m,C)]),m.type==="boolean"&&(m.default===!0||m.negativeDescription)&&!ys.test(m.name)){let d=[...(m.alias||[]).map((h)=>`--no-${h}`),`--no-${m.name}`].join(", ");r.push([D(d),[m.negativeDescription,C?Le("(Required)"):""].filter(Boolean).join(" ")])}if(C)u.push(`--${m.name}`+st(m))}if(e.subCommands){let m=[],C=await _(e.subCommands);for(let[y,d]of Object.entries(C)){let h=await _((await _(d))?.meta);if(h?.hidden)continue;let A=ye(h?.alias),B=[y,...A].join(", ");c.push([D(B),h?.description||""]),m.push(y,...A)}u.push(m.join("|"))}let p=[],w=n.version||s.version;p.push(Le(`${n.description} (${i+(w?` v${w}`:"")})`),"");let b=r.length>0||a.length>0;if(p.push(`${je(De("USAGE"))} ${D(`${i}${b?" [OPTIONS]":""} ${u.join(" ")}`)}`,""),a.length>0)p.push(je(De("ARGUMENTS")),""),p.push(ot(a,"  ")),p.push("");if(r.length>0)p.push(je(De("OPTIONS")),""),p.push(ot(r,"  ")),p.push("");if(c.length>0)p.push(je(De("COMMANDS")),""),p.push(ot(c,"  ")),p.push("",`Use ${D(`${i} <command> --help`)} for more information about a command.`);return p.filter((m)=>typeof m==="string").join(`
`)}function st(e){let t=e.valueHint?`=<${e.valueHint}>`:"",n=t||`=<${Ht(e.name)}>`;if(!e.type||e.type==="positional"||e.type==="boolean")return t;if(e.type==="enum"&&e.options?.length)return`=<${e.options.join("|")}>`;return n}function Wt(e,t){let n=t?Le("(Required)"):"",o=e.default===void 0?"":Le(`(Default: ${e.default})`);return[e.description,n,o].filter(Boolean).join(" ")}async function at(e,t={}){let n=t.rawArgs||process.argv.slice(2),o=t.showUsage||zt;try{let s=await ws(e);if(s.help.length>0&&n.some((i)=>s.help.includes(i)))await o(...await it(e,n)),process.exit(0);else if(n.length===1&&s.version.includes(n[0])){let i=typeof e.meta==="function"?await e.meta():await e.meta;if(!i?.version)throw new F("No version specified","E_NO_VERSION");console.log(i.version)}else await q(e,{rawArgs:n})}catch(s){if(s instanceof F)await o(...await it(e,n)),console.error(s.message);else console.error(s,`
`);process.exit(1)}}async function ws(e){let t=await _(e.args||{}),n=new Set,o=new Set;for(let[s,i]of Object.entries(t)){n.add(s);for(let r of ye(i.alias))o.add(r)}return{help:Jt("help","h",n,o),version:Jt("version","v",n,o)}}function Jt(e,t,n,o){if(n.has(e)||o.has(e))return[];if(n.has(t)||o.has(t))return[`--${e}`];return[`--${e}`,`-${t}`]}var F,fs,Me=(e,t=39)=>(n)=>fs?n:`\x1B[${e}m${n}\x1B[${t}m`,De,D,Le,je,ys;var Be=f(()=>{qt();F=class extends Error{code;constructor(e,t){super(e);this.name="CLIError",this.code=t}};fs=(()=>{let e=globalThis.process?.env??{};return e.NO_COLOR==="1"||e.TERM==="dumb"||e.TEST||e.CI})(),De=Me(1,22),D=Me(36),Le=Me(90),je=Me(4,24);ys=/^no[-A-Z]/});var{spawnSync:ks}=globalThis.Bun;function g(e,t={}){return ks({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}function N(e){return l({meta:{name:e.name,version:e.version??"1.0.0",description:e.description},subCommands:e.subCommands,args:{[e.argsName??"args"]:{type:"positional",description:e.argsDescription??"Extra args passed to underlying tool",required:!1}},run(){let t=v(e.name),n=e.configArgs??[],o=e.passthrough?[e.binPath,...t]:e.configArgsPlacement==="append"?[e.binPath,...t,...n]:[e.binPath,...n,...t];process.exit(g(o))}})}function V(e){let t=e.argsDescription?{args:{args:{type:"positional",description:e.argsDescription,required:!1}}}:{};return l({meta:{name:e.name,description:e.description},...t,run(){let n=v(e.name),o=n.length===0&&e.defaultArgs?e.defaultArgs:n;process.exit(e.spawn([...e.prefixArgs??[],...o]))}})}function v(e){let t=process.argv.slice(2),n=t.lastIndexOf(e);return n===-1?t:t.slice(n+1)}var k=f(()=>{Be();Be()});import{existsSync as Zt,readFileSync as Xt}from"fs";import{dirname as en,join as pe}from"path";function U(e=import.meta.dir){let t=e;while(!0){let n=pe(t,"package.json");if(Zt(n))try{if(JSON.parse(Xt(n,"utf8")).name===xs)return t}catch{}let o=en(t);if(o===t)break;t=o}return e}function tn(e=process.cwd()){let t=e;while(!0){let n=pe(t,"package.json");if(Zt(n))try{if(JSON.parse(Xt(n,"utf8")).workspaces)return t}catch{}let o=en(t);if(o===t)return e;t=o}}function ee(){return pe(U(),"src","configs")}function P(e){return pe(ee(),e)}function Ge(...e){return pe(U(),"src",...e)}function nn(){return pe(U(),"skills")}var xs="@myorg/tooling",Cs="packages/tooling",Rc;var I=f(()=>{Rc=`${Cs}/src/configs`});var Ss,$s;var on=f(()=>{I();k();Ss=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),$s=N({name:"lint",version:"1.0.0",description:"Lint and format check (Biome, shared config)",binPath:Ss,configArgs:["check",`--config-path=${ee()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to check (default: whole repo)"})});var Rs,As;var sn=f(()=>{I();k();Rs=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),As=N({name:"lint:fix",version:"1.0.0",description:"Lint and format, applying safe fixes (Biome, shared config)",binPath:Rs,configArgs:["check","--write",`--config-path=${ee()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to fix (default: whole repo)"})});var Ts,Es;var rn=f(()=>{I();k();Ts=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Es=N({name:"biome",version:"1.0.0",description:"Biome with baked config path \u2014 lint and format, no root biome.json needed",binPath:Ts,configArgs:[`--config-path=${ee()}`],configArgsPlacement:"append",argsName:"command",argsDescription:"Biome command (check, lint, format, etc.)"})});var _s,Os;var an=f(()=>{k();_s=Bun.fileURLToPath(import.meta.resolve("typescript/package.json").replace("package.json","bin/tsc")),Os=N({name:"typecheck",version:"1.0.0",description:"TypeScript wrapper \u2014 tsc owned by @myorg/tooling, use m typecheck not tsc",binPath:"bun",configArgs:[_s],argsName:"args",argsDescription:"tsc args"})});var Is,Ns;var cn=f(()=>{I();k();Is=Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));process.env.TURBO_GLOBAL_WARNING_DISABLED="1";Ns=N({name:"turbo",version:"1.0.0",description:"Turbo with baked root config \u2014 no root turbo.json needed, uses turbo.base.json",binPath:"bun",configArgs:[Is,`--root-turbo-json=${P("turbo.base.json")}`],argsName:"task",argsDescription:"Turbo task (build, dev, test, typecheck, etc.)"})});import{existsSync as Ps,readFileSync as ln}from"fs";var{Glob:Ds}=globalThis.Bun;function js(){try{let e=JSON.parse(ln("package.json","utf8")),t=Array.isArray(e.workspaces)?e.workspaces.filter((n)=>typeof n==="string"):[];if(t.length>0)return t}catch{}return["packages/*","apps/*"]}function Ls(){let e=[];for(let t of js())for(let n of new Ds(`${t}/package.json`).scanSync("."))try{if(JSON.parse(ln(n,"utf8")).private===!0)continue;let s=n.replace("/package.json","");if(Ps(`${s}/package.json`))e.push(s)}catch{}return e.sort()}var ct,Ms,Bs,Gs;var lt=f(()=>{k();ct=l({meta:{name:"health",description:"publint + arethetypeswrong over every publishable package"},run(){let e=Ls();if(e.length===0)console.log("\u2139\uFE0F No publishable packages \u2014 skipping package health checks"),process.exit(0);console.log(`\uD83D\uDD28 Building before health checks (${e.length} package(s))`);let t=g(["bun","run","build"]);if(t!==0)console.error("::error::build failed, cannot run package health checks"),process.exit(t);let n=0;for(let o of e){if(console.log(`
\uD83D\uDCE6 ${o}`),g(["bunx","--yes","publint",o])!==0)console.error(`::error::publint failed for ${o}`),n++;if(g(["bunx","--yes","@arethetypeswrong/cli","--pack",".","--profile","esm-only"],{cwd:o})!==0)console.error(`::error::arethetypeswrong failed for ${o}`),n++}if(n>0)console.error(`
::error::${n} package health check(s) failed`),process.exit(1);console.log(`
\u2705 Package health OK (${e.length} package(s))`),process.exit(0)}}),Ms=Bun.fileURLToPath(import.meta.resolve("bunup/package.json").replace("package.json","dist/cli/index.js")),Bs=N({name:"build",version:"1.0.0",description:"Bunup wrapper \u2014 bundler owned by @myorg/tooling, use m build not bunup",binPath:"bun",configArgs:[Ms],argsName:"entry",argsDescription:"Entry files or bunup args",subCommands:{health:ct}}),Gs=Bs});var Fs;var pn=f(()=>{lt();Fs=ct});import{existsSync as un,readdirSync as Vs,rmSync as Us}from"fs";var{which:Hs}=globalThis.Bun;async function mn(){if(!Hs("bun"))console.error("m bun coverage needs `bun` on PATH."),process.exit(1);console.log(`Running per-package coverage via turbo...
`),process.exit(g([...qs,"coverage"]))}function dn(){let e=["apps","packages","configs"],t=0;for(let n of e){if(!un(n))continue;for(let o of Vs(n,{withFileTypes:!0})){if(!o.isDirectory())continue;let s=`${n}/${o.name}/node_modules`;if(!un(s))continue;Us(s,{recursive:!0,force:!0}),t++}}console.log(`\uD83E\uDDF9 Removed ${t} workspace node_modules dir(s) (root node_modules kept)`)}var pt,qs,te,Ws,Js,Ks,we,Ys,zs,Qs,Zs,Xs,ei;var gn=f(()=>{I();k();pt=P("bunfig.toml"),qs=["bun",`${U()}/src/cli.ts`,"turbo"];te=v("bun"),Ws=["coverage","test","clean:modules"],Js=te.includes("--help")||te.includes("-h"),Ks=te.includes("--version")||te.includes("-v"),we=te[0],Ys=process.argv.slice(2).includes("bun");if(Ys&&we&&!Ws.includes(we)&&!we.startsWith("-")&&!Js&&!Ks){let e=we==="test"?["bun",we,`--config=${pt}`,...te.slice(1)]:["bun",...te];process.exit(g(e))}zs=l({meta:{name:"coverage",description:"Run per-package coverage via turbo then merge LCOV"},run:async()=>{await mn()}}),Qs=l({meta:{name:"clean:modules",description:"Remove workspace node_modules dirs (keeps the root one)"},run(){dn(),process.exit(0)}}),Zs=l({meta:{name:"test",description:"Run bun test with shared bunfig.toml config"},run(){let e=v("test");process.exit(g(["bun","test",`--config=${pt}`,...e]))}}),Xs=l({meta:{name:"bun",version:"1.0.0",description:"Bun wrapper \u2014 injects shared bunfig.toml for test, provides coverage merging"},subCommands:{coverage:zs,test:Zs,"clean:modules":Qs},async run(){let e=v("bun"),t=e[0];if(t==="coverage"){await mn();return}if(t==="clean:modules")dn(),process.exit(0);let n=t==="test"?["bun",t,`--config=${pt}`,...e.slice(1)]:["bun",...e];process.exit(g(n))}}),ei=Xs});var ti;var fn=f(()=>{I();k();ti=l({meta:{name:"test",description:"Run bun test with the shared bunfig.toml config"},args:{args:{type:"positional",description:"Extra args for bun test",required:!1}},run(){let e=process.argv.slice(2),t=e.lastIndexOf("test"),n=t===-1?[]:e.slice(t+1);process.exit(g(["bun","test",`--config=${P("bunfig.toml")}`,...n]))}})});var S="coverage/lcov.info",ue="coverage/rust-lcov.info",W="coverage/html",ke=80;var hn=()=>{};import{existsSync as j,mkdirSync as vn,readdirSync as ni,readFileSync as yn,renameSync as ut,writeFileSync as oi}from"fs";import{dirname as si,join as bn}from"path";var{which:ii}=globalThis.Bun;function J(e){return Boolean(ii(e))}function Fe(e=S){if(!j(e))return null;let t=0,n=0;for(let o of yn(e,"utf8").split(`
`))if(o.startsWith("LF:"))n+=Number(o.slice(3));else if(o.startsWith("LH:"))t+=Number(o.slice(3));if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function ai(e){let t=0,n=0;for(let o of e){let s=Fe(o);if(!s)continue;t+=s.hit,n+=s.found}if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function kn(){return`{${[...wn].join(",")}}/*/coverage/lcov.info`}function xn(e="."){let t=new Bun.Glob(kn());return Array.from(t.scanSync({cwd:e})).filter(Boolean).map((n)=>e==="."?n:`${e}/${n}`).sort()}function ci(e,t){return e>=t}function li(e="."){let t=[];for(let n of[...wn]){let o=bn(e,n);if(!j(o))continue;for(let s of ni(o,{withFileTypes:!0})){if(!s.isDirectory())continue;let i=bn(o,s.name,"package.json");if(!j(i))continue;let r;try{r=JSON.parse(yn(i,"utf8"))}catch{continue}if(!r.name||!(r.scripts?.test||r.scripts?.coverage))continue;t.push({name:r.name.replace(/^@[^/]+\//,""),dir:`${n}/${s.name}`})}}return t.sort((n,o)=>n.dir.localeCompare(o.dir))}function pi(e,t){let n=["# Generated by `m coverage sync` (packages/tooling) \u2014 do not edit.","# Refreshed on every `bun install` (prepare) and by `bun run docs:sync`.","codecov:","  require_ci_to_pass: true","  notify:","    wait_for_ci: true","","coverage:","  precision: 2","  round: down",'  range: "70...100"',"  status:","    # Overall monorepo gate \u2014 mirrors COVERAGE_THRESHOLD.","    project:","      default:",`        target: ${t}%`,"        threshold: 1%","    # Patch coverage on PRs.","    patch:","      default:",`        target: ${t}%`,"        threshold: 5%","","flag_management:","  default_rules:","    carryforward: true","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 1%","","component_management:","  default_rules:","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 2%","  individual_components:"];for(let o of e)n.push(`    - component_id: ${o.name}`,`      name: ${o.dir}`,"      paths:",`        - "${o.dir}/**"`);return n.push("","comment:",'  layout: "reach,diff,flags,components,tree"',"  behavior: default","  require_changes: true","  show_carryforward_flags: true",""),n.join(`
`)}function ui(e,t){let n=(o)=>o?`${o.percent.toFixed(2)}% (${o.hit}/${o.found})`:"\u2014";return["## \uD83D\uDCCA Coverage Summary","","| Package | Lines |","|---------|-------|",...e.map((o)=>`| \`${o.dir}\` | ${n(o.totals)} |`),...t?[`| **merged** | **${n(t)}** |`]:[],""].join(`
`)}function Cn(){if(J("lcov")&&J("genhtml")){console.log("\u2705 lcov already installed");return}let e=1;if(process.platform==="darwin")e=g(["brew","install","lcov"]);else{let t=J("sudo")?["sudo","apt-get"]:["apt-get"];e=g([...t,"update"])===0?g([...t,"install","-y","lcov"]):1}if(e===0)console.log("\u2705 lcov installed");else console.warn("\u26A0\uFE0F lcov install failed \u2014 HTML reports will be skipped (threshold check still runs)")}function Sn(e=W){if(!j(S)){console.warn(`\u26A0\uFE0F ${S} not found \u2014 skipping HTML report`);return}if(!J("genhtml")){console.warn("\u26A0\uFE0F genhtml not found \u2014 run `m coverage setup` first (HTML report skipped)");return}vn(e,{recursive:!0});let t=g(["genhtml",S,"--output-directory",e,"--title","Coverage Report","--show-details","--highlight","--legend"]);if(t===0)console.log(`
\u2705 HTML report: ${e}/index.html`);process.exit(t)}var ri,wn,mi,di,gi,fi,hi,bi,vi,yi,wi,ki;var $n=f(()=>{k();hn();ri=`${W}/index.html`;wn=["packages","apps"];mi=l({meta:{name:"setup",description:"Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)"},run(){Cn(),process.exit(0)}}),di=l({meta:{name:"html",description:"Generate HTML report via genhtml from coverage/lcov.info"},args:{out:{type:"string",description:`Output directory (default: ${W})`,default:W}},run({args:e}){Sn(e.out||W),process.exit(0)}}),gi=l({meta:{name:"check",description:`Check coverage threshold (default ${ke}%) against coverage/lcov.info`},args:{threshold:{type:"string",description:"Threshold percent",default:String(ke)}},run({args:e}){let t=Fe();if(!t){console.warn(`\u26A0\uFE0F ${S} not found or has no line data \u2014 skipping threshold check`);return}let n=Number(e.threshold??ke),o=t.percent;if(console.log(`Line coverage: ${o.toFixed(2)}% (${t.hit}/${t.found} lines) \u2014 threshold ${n}%`),!ci(o,n))console.error(`::error::Coverage ${o.toFixed(2)}% is below ${n}% threshold`),process.exit(1);console.log(`\u2705 Coverage ${o.toFixed(2)}% meets threshold`),process.exit(0)}}),fi=l({meta:{name:"collect",description:"Collect JS coverage (bun run coverage) + Rust coverage (m native llvm-cov), then merge"},run(){if(g(["bun","run","coverage"]),!j("packages/native/Cargo.toml")||!J("cargo-llvm-cov"))console.warn("\u26A0\uFE0F cargo-llvm-cov not installed \u2014 skipping Rust coverage"),process.exit(0);if(console.log("\uD83E\uDD80 Collecting Rust coverage via m native llvm-cov"),g(["m native","llvm-cov","--lcov","--output-path",`../../${ue}`]),!j(ue))process.exit(0);if(!j(S))ut(ue,S),process.exit(0);if(J("lcov")){if(g(["lcov","--add-tracefile",S,"--add-tracefile",ue,"--output-file","coverage/merged.lcov"])===0)ut("coverage/merged.lcov",S),console.log("\u2705 Merged Rust + JS coverage"),process.exit(0)}console.warn(`\u26A0\uFE0F lcov not available \u2014 Rust coverage kept at ${ue}`)}}),hi=l({meta:{name:"pages",description:"Publish the HTML report into the Pages artifact dir (served at /coverage/)"},async run(){if(!j(S))console.log("\u2139\uFE0F No coverage data \u2014 collecting first"),g(["bun","run","coverage"]);if(!j(S))console.warn("\u26A0\uFE0F Still no coverage/lcov.info \u2014 skipping Pages coverage"),process.exit(0);if(Cn(),Sn(),!j(ri))console.warn(`\u26A0\uFE0F No HTML report at ${W} \u2014 skipping Pages coverage`),process.exit(0);console.log(`\u2705 Coverage HTML ready at ${W}/ \u2014 \`m pages build\` folds it into the Pages artifact (served at /coverage/)`),process.exit(0)}}),bi=l({meta:{name:"merge",description:"Merge per-package lcov.info reports into coverage/lcov.info"},args:{output:{type:"string",description:"Merged output file (default: coverage/lcov.info)",default:S},reportOnly:{type:"boolean",description:"Print the merged totals and the delta, write nothing",default:!1}},run({args:e}){let t=xn(".");if(t.length===0)console.warn("No per-package lcov.info found \u2014 nothing to merge"),process.exit(0);let n=e.output||S;if(e.reportOnly){let r=ai(t),a=r?`${r.percent.toFixed(2)}% (${r.hit}/${r.found} lines)`:"no data";console.log("Report-only: the merge would measure"),console.log(`  ${t.length} report(s) \u2192 ${a}`),process.exit(0)}vn(si(n),{recursive:!0}),console.log(`Merging ${t.length} report(s) \u2192 ${n}`);let o=null;try{o=Bun.fileURLToPath(import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"))}catch{o=null}if(o){if(g(["bun",o,kn(),n,"--prepend-source-files"])===0)console.log(`\u2705 Merged: ${n}`),process.exit(0);console.warn("\u26A0\uFE0F lcov-result-merger failed \u2014 falling back to lcov --add-tracefile")}if(!J("lcov"))console.error("\u274C lcov not found \u2014 run `m coverage setup` first"),process.exit(1);let s="coverage/merged.lcov",i=t.flatMap((r)=>["--add-tracefile",r]).concat(["--output-file",s]);if(g(["lcov",...i])!==0)console.error("\u274C Coverage merge failed"),process.exit(1);ut(s,n),console.log(`\u2705 Merged: ${n}`),process.exit(0)}}),vi=l({meta:{name:"summary",description:"Show coverage summary (--json for scripts, --markdown for step summaries)"},args:{json:{type:"boolean",description:"Print JSON instead of a human-readable line"},markdown:{type:"boolean",description:"Print a per-package markdown table (for $GITHUB_STEP_SUMMARY)"}},run({args:e}){let t=Fe();if(e.markdown){let n=xn(".").map((o)=>({dir:o.replace(/\/coverage\/lcov\.info$/,""),totals:Fe(o)}));console.log(ui(n,t)),process.exit(0)}if(e.json)console.log(JSON.stringify({source:S,available:Boolean(t),lines:{hit:t?.hit??0,found:t?.found??0,percent:t?Number(t.percent.toFixed(2)):0}})),process.exit(0);if(J("lcov")&&j(S))process.exit(g(["lcov","--summary",S]));if(!t)console.warn(`\u26A0\uFE0F ${S} not found`),process.exit(0);console.log(`lines: ${t.percent.toFixed(1)}% (${t.hit}/${t.found})`),process.exit(0)}}),yi=l({meta:{name:"sync",description:"Regenerate the root codecov.yml from the workspace package list"},args:{output:{type:"string",description:"Output file (default: codecov.yml)",default:"codecov.yml"}},run({args:e}){let t=e.output||"codecov.yml",n=li(".");oi(t,pi(n,ke)),console.log(`\u2705 ${t} \u2014 ${n.length} component(s): ${n.map((o)=>o.dir).join(", ")}`),process.exit(0)}}),wi=l({meta:{name:"m coverage",version:"1.0.0",description:"Coverage reporting \u2014 collect, merge, HTML, threshold check, Codecov, Pages publishing"},subCommands:{setup:mi,collect:fi,html:di,check:gi,pages:hi,merge:bi,summary:vi,sync:yi},run(){console.log(`
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
`)}}),ki=wi});import{mkdir as xi}from"fs/promises";var{file:mt,write:Ci}=globalThis.Bun;async function gt(e="changeset"){if(e!=="changeset")throw Error(`Unknown init target '${e}' (expected "changeset")`);let t=".changeset/config.json",n=P("changeset.config.json");if(await mt(t).exists()){console.log("Changeset config already exists; skipping.");return}if(!await mt(n).exists())return;await xi(".changeset",{recursive:!0}),await Ci(t,await mt(n).text())}var Rn,me,Si,dt,$i,Ri,Ai,Ti,Ei,_i;var ft=f(()=>{I();k();Rn=Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js")),me=v("changeset"),Si=["init"],dt=me[0],$i=me.includes("--help")||me.includes("-h"),Ri=me.includes("--version")||me.includes("-v"),Ai=process.argv.slice(2).includes("changeset");if(Ai&&dt&&!Si.includes(dt)&&!dt.startsWith("-")&&!$i&&!Ri)process.exit(g(["bun",Rn,...me]));Ti=l({meta:{name:"init",description:"Ensure .changeset/config.json exists from shared template"},args:{target:{type:"positional",description:"Init target (default: changeset)",required:!1,default:"changeset"}},async run({args:e}){await gt(e.target??"changeset"),process.exit(0)}}),Ei=l({meta:{name:"changeset",version:"1.0.0",description:"Changesets wrapper \u2014 init config and delegate to @changesets/cli"},subCommands:{init:Ti},run(){process.exit(g(["bun",Rn,...v("changeset")]))}}),_i=Ei});function Ve(e){return Bun.which(e)}function An(e){return Ve(K[e].bin)!==null}function ne(e){console.warn(`\u26A0\uFE0F  ${e.label} not found \u2014 skipping ${e.purpose}.`),console.warn("   Install it to enable this step:");for(let t of e.install)console.warn(`     ${t}`);return console.warn("   Continuing: this step is optional locally and CI installs it."),0}function Y(e,t){let n=K[e],o=Ve(n.bin);if(!o)return ne(n);return t(o)}var K;var de=f(()=>{K={actionlint:{bin:"actionlint",label:"actionlint",purpose:"local GitHub Actions workflow validation",install:["brew install actionlint","go install github.com/rhysd/actionlint/cmd/actionlint@latest","bun install --force          # retries the github-actionlint download"]},act:{bin:"act",label:"act",purpose:"running GitHub Actions workflows locally",install:["brew install act","sudo apt install act","go install github.com/nektos/act@latest"]},gitleaks:{bin:"gitleaks",label:"gitleaks",purpose:"secret scanning",install:["brew install gitleaks","https://github.com/gitleaks/gitleaks#installing"]},trivy:{bin:"trivy",label:"trivy",purpose:"vulnerability scanning",install:["brew install trivy","https://trivy.dev/latest/getting-started/installation/"]},cargo:{bin:"cargo",label:"Rust toolchain (cargo)",purpose:"native Rust workspace tasks",install:["rustup \u2014 https://rustup.rs"]},lcov:{bin:"lcov",label:"lcov",purpose:"merging coverage reports",install:["bun run m coverage setup"]},genhtml:{bin:"genhtml",label:"genhtml",purpose:"rendering the HTML coverage report",install:["bun run m coverage setup"]},commitlint:{bin:"commitlint",label:"commitlint",purpose:"Conventional Commits validation",install:["bun install          # @commitlint/cli is a workspace devDependency"]}}});import{existsSync as En}from"fs";import{join as Oi}from"path";function Ii(){let e=Oi(U(),"node_modules",".bin","commitlint");if(En(e))return e;return Ve("commitlint")}function Ni(e){let t=Ii();if(!t)return ne(K.commitlint);return g([t,"--config",P("commitlint.config.cjs"),...e])}var Tn=`
m commitlint \u2014 Conventional Commits validation

Usage:
  m commitlint <file>    # validate the message in <file> (what the hook does)
  m commitlint           # validate a message piped on stdin

The commit-msg hook calls this as \`m commitlint {1}\`, where {1} is the path
git handed the hook. It cannot move to pre-commit: git passes pre-commit no
arguments at all and the message does not exist yet, so commit-msg is the
earliest hook that can see it.
`,Pi,Di;var _n=f(()=>{I();k();de();Pi=l({meta:{name:"commitlint",version:"1.0.0",description:"Conventional Commits validation \u2014 defensive (skips if commitlint is missing)"},args:{file:{type:"positional",description:"Commit message file; omit to read the message from stdin",required:!1}},run(){let e=v("commitlint");if(e.includes("--help")||e.includes("-h"))console.log(Tn),process.exit(0);let t=e[0];if(t!==void 0&&!En(t))console.error(`\u274C commit message file not found: ${t}`),process.exit(1);if(!t&&process.stdin.isTTY)console.log(Tn),process.exit(0);process.exit(Ni(t?["--edit",t]:[]))}}),Di=Pi});import{readdir as ji}from"fs/promises";import{join as Li}from"path";var{$:On,write:Mi}=globalThis.Bun;async function ht(e="lefthook"){if(e!=="lefthook")throw Error(`Unknown setup target '${e}' (expected "lefthook")`);await Mi("lefthook.yml",`extends:
  - ${"node_modules/@myorg/tooling/src/configs/lefthook.base.yml"}
`);let n=await On`bunx lefthook install`.quiet().nothrow();if(n.exitCode!==0){let s=n.stderr.toString().trim();if(console.warn("\u26A0\uFE0F lefthook install failed \u2014 Git hooks are not active."),s)console.warn(`   ${s.split(`
`).join(`
   `)}`);console.warn("   Re-run manually with: m setup lefthook");return}let o=await Bi();if(o.length===0){console.warn("\u26A0\uFE0F lefthook installed no hooks \u2014 is this a Git repository?");return}console.log(`\u2705 lefthook hooks active: ${o.join(", ")}`)}async function Bi(){let e;try{e=await ji(Li(await Gi(),"hooks"))}catch{return[]}return e.filter((t)=>!t.endsWith(".sample")&&!t.endsWith(".old")).sort()}async function Gi(){let e=await On`git rev-parse --git-dir`.quiet().nothrow();if(e.exitCode!==0)return".git";return e.stdout.toString().trim()||".git"}var Fi,Vi,Ui,Hi;var In=f(()=>{k();Fi=l({meta:{name:"lefthook",description:"Regenerate lefthook.yml wrapper and install Git hooks"},args:{target:{type:"positional",description:"Setup target (default: lefthook)",required:!1,default:"lefthook"}},async run({args:e}){await ht(e.target??"lefthook")}}),Vi=l({meta:{name:"bins",description:"Link m-bins into node_modules/.bin (handled by bun install)"},run(){console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.")}}),Ui=l({meta:{name:"setup",version:"1.0.0",description:"Setup CLI \u2014 regenerates lefthook.yml, installs hooks, ensures changeset config"},subCommands:{lefthook:Fi,bins:Vi},args:{target:{type:"positional",description:"Target (lefthook, bins, or empty for full setup)",required:!1}},async run({args:e}){let t=v("setup"),n=e.target??t[0]??"lefthook";if(n==="lefthook"){await ht("lefthook");return}if(n==="bins")return;await ht("lefthook");await Promise.resolve().then(() => ft());await gt("changeset").catch(()=>{})}}),Hi=Ui});import{existsSync as Nn}from"fs";import{homedir as qi}from"os";import{join as Pn}from"path";function Ki(){try{let e=Bun.fileURLToPath(import.meta.resolve("github-actionlint/package.json"));return Bun.file(e).json().version??null}catch{return null}}function Yi(){let e=process.env.ACTIONLINT_BIN;if(e&&Nn(e))return e;let t=Bun.which("actionlint");if(t)return t;let n=process.env.ACTIONLINT_CACHE_DIR??Pn(qi(),".github-actionlint","bin"),o=Ki();if(o){let s=Pn(n,o,process.platform==="win32"?"actionlint.exe":"actionlint");if(Nn(s))return s}return null}function bt(e){let t=e.includes("--if-installed"),n=e.filter((s)=>s!=="--if-installed"),o=Yi();if(!o){if(t)return ne(K.actionlint);return console.error(Ji),1}return g([o,`-config-file=${P("actionlint.yaml")}`,...n])}function Ue(e){return Y("act",(t)=>g([t,...Wi,...e]))}var Wi,Ji=`
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
`,zi,Qi,Zi,Xi;var He=f(()=>{I();k();de();Wi=["-P","ubuntu-latest=catthehacker/ubuntu:act-latest","--container-architecture","linux/amd64"];zi=V({name:"lint",description:"Validate workflows via actionlint with shared config",argsDescription:"Extra args for actionlint",spawn:bt}),Qi=V({name:"act",description:"Run GitHub Actions locally via act with baked-in flags",argsDescription:"Extra args for act",spawn:Ue}),Zi=l({meta:{name:"ci",version:"1.0.0",description:"CI tooling for GitHub Actions \u2014 lint workflows and run locally with act"},subCommands:{lint:zi,act:Qi},run(){let e=v("ci");if(e.length>0&&e[0]?.startsWith("-"))Ue(e);else console.log(`
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
`)}}),Xi=Zi});var er;var Dn=f(()=>{k();He();er=l({meta:{name:"ci:lint",description:"Validate workflows via actionlint with shared config"},args:{args:{type:"positional",description:"Extra args for actionlint",required:!1}},run(){process.exit(bt(v("ci:lint")))}})});var tr;var jn=f(()=>{k();He();tr=l({meta:{name:"ci:local",description:"Run the push workflow locally via act"},args:{args:{type:"positional",description:"Extra args for act",required:!1}},run(){process.exit(Ue(["push",...v("ci:local")]))}})});function vt(e){return Y("gitleaks",(t)=>g([t,...e]))}var nr,or,sr,ir;var Ln=f(()=>{k();de();nr=V({name:"detect",description:"gitleaks detect --source . --no-git (scan repo)",prefixArgs:["detect"],defaultArgs:["--source",".","--no-git","--verbose"],spawn:vt}),or=V({name:"protect",description:"gitleaks protect --staged (scan staged changes, pre-commit)",prefixArgs:["protect"],defaultArgs:["--staged","--verbose"],spawn:vt}),sr=l({meta:{name:"gitleaks",version:"1.0.0",description:"Gitleaks wrapper \u2014 secret scanning, defensive (skips if binary missing)"},subCommands:{detect:nr,protect:or},run(){let e=v("gitleaks");if(e.length===0)console.log(`
m gitleaks \u2014 secret scanning wrapper

Usage:
  m gitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  m gitleaks protect [args]  # scan staged (default: --staged --verbose)

Install:
  brew install gitleaks
  go install github.com/gitleaks/gitleaks/v8@latest
  docker pull zricethezav/gitleaks:latest

If gitleaks is not installed, this wrapper warns and exits 0 (does not block).
`),process.exit(0);process.exit(vt(e))}}),ir=sr});import{existsSync as rr}from"fs";var{which:ar}=globalThis.Bun;function wt(e){return Y("trivy",(t)=>g([t,...e]))}var yt="apps/example/Dockerfile",Mn="app:trivy-scan",cr,lr,pr,ur,mr;var Bn=f(()=>{k();de();cr=l({meta:{name:"build",description:`docker build -t ${Mn} (image for the trivy image scan)`},run(){if(!rr(yt))console.warn(`\u26A0\uFE0F ${yt} not found \u2014 skipping image build`),process.exit(0);if(!ar("docker"))console.warn("\u26A0\uFE0F docker not found \u2014 skipping image build"),process.exit(0);if(g(["docker","build","-t",Mn,"-f",yt,"."])!==0)console.warn("\u26A0\uFE0F image build failed \u2014 skipping the Trivy image scan");process.exit(0)}}),lr=V({name:"fs",description:"trivy fs . --severity HIGH,CRITICAL (filesystem scan)",prefixArgs:["fs"],defaultArgs:[".","--severity","HIGH,CRITICAL"],spawn:wt}),pr=V({name:"image",description:"trivy image <image> --severity HIGH,CRITICAL (container scan)",prefixArgs:["image"],spawn:wt}),ur=l({meta:{name:"trivy",version:"1.0.0",description:"Trivy wrapper \u2014 vuln scanning, defensive (skips if binary missing)"},subCommands:{fs:lr,image:pr,build:cr},run(){let e=v("trivy");if(e.length===0)console.log(`
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
`),process.exit(0);process.exit(wt(e))}}),mr=ur});var dr;var Gn=f(()=>{k();dr=l({meta:{name:"codeql",version:"1.0.0",description:"CodeQL wrapper \u2014 info and local guidance (CodeQL runs in GitHub Actions)"},run(){console.log(`
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
`)}})});function T(e,t){let n=t;while(n<e.length&&/\s/.test(e[n]))n++;return n}function Vn(e,t){return e.lastIndexOf(`
`,t)+1}function xe(e,t){let n=/^[ \t]*/.exec(e.slice(Vn(e,t),t));return n?n[0]:""}function qe(e,t){let n=t+1;while(n<e.length){if(e[n]==="\\"){n+=2;continue}if(e[n]==='"')return n+1;n++}return-1}function oe(e,t){let n=e[t];if(n==='"')return qe(e,t);if(n==="{"||n==="["){let s=0,i=t;while(i<e.length){let r=e[i];if(r==='"'){i=qe(e,i);continue}if(r==="{"||r==="[")s++;else if(r==="}"||r==="]"){if(s--,s===0)return i+1}i++}return-1}let o=t;while(o<e.length&&!/[\s,\]}]/.test(e[o]))o++;return o}function Un(e){let t=T(e,0);return e[t]==="{"?t:-1}function Ce(e,t,n){let o=T(e,t+1);while(o<e.length&&e[o]!=="}"){if(e[o]!=='"')return null;let s=qe(e,o);if(s===-1)return null;let i=T(e,s);if(e[i]!==":")return null;let r=T(e,i+1),a=oe(e,r);if(a===-1)return null;if(e.slice(o,s)===JSON.stringify(n))return{keyStart:o,valueStart:r,valueEnd:a};if(o=T(e,a),e[o]===",")o=T(e,o+1);else return null}return null}function Hn(e,t,n){let o=Vn(e,t);if(e.slice(o,t).trim()!==""){let r=/^[ \t]*,[ \t]*/.exec(e.slice(n));if(r)return e.slice(0,t)+e.slice(n+r[0].length);let a=e.slice(0,t).replace(/[ \t]*,[ \t]*$/,"");return a===e.slice(0,t)?e.slice(0,t)+e.slice(n):`${a}${e.slice(n)}`}let s=/^[ \t]*,[ \t]*\r?\n?/.exec(e.slice(n));if(s)return e.slice(0,o)+e.slice(n+s[0].length);let i=e.slice(0,o).replace(/[ \t]*\n$/,"");if(i.endsWith(","))return`${i.slice(0,-1)}${e.slice(n)}`;return e.slice(0,o)+e.slice(n)}function Ct(e){return/\n([ \t]+)\S/.exec(e)?.[1]??"  "}function kt(e,t,n){let o=e.split(`
`);if(o.length===1)return e;let i=o.slice(1,-1).filter((a)=>a.trim()!=="").reduce((a,c)=>Math.min(a,/^[ \t]*/.exec(c)[0].length),Number.POSITIVE_INFINITY),r=Number.isFinite(i)?i:0;return[o[0],...o.slice(1,-1).map((a)=>a.trim()===""?"":t+n+a.slice(r)),`${t}${o.at(-1).trim()}`].join(`
`)}function Fn(e,t,n,o){let s=Ct(e),i=oe(e,t)-1,r=xe(e,i),a=T(e,t+1);if(a===i){let b=`${r}${s}`,m=kt(o,b,s);return`${e.slice(0,i)}
${b}${JSON.stringify(n)}: ${m}
${r}${e.slice(i)}`}let c=xe(e,a),u=a,p=a;while(p<i){let b=qe(e,p),m=T(e,b);if(u=oe(e,T(e,m+1)),p=T(e,u),e[p]===",")p=T(e,p+1);else break}let w=kt(o,c,s);return`${e.slice(0,u)},
${c}${JSON.stringify(n)}: ${w}${e.slice(u)}`}function qn(e,t){let[n,...o]=e,s=o.length===0?t:qn(o,t);return`{
  ${JSON.stringify(n)}: ${s}
}`}function gr(e,t,n){let o=kt(n,xe(e,t.valueStart),Ct(e));return e.slice(0,t.valueStart)+o+e.slice(t.valueEnd)}function St(e,t,n){let o=t.at(-1);if(o===void 0)return e;let s=We(e,t.slice(0,-1));if(s===-1){let[r,...a]=t,c=Un(e);if(r===void 0||c===-1)return e;return Fn(e,c,r,qn(a,n))}let i=Ce(e,s,o);return i?gr(e,i,n):Fn(e,s,o,n)}function We(e,t){let n=Un(e);for(let o of t){if(n===-1)return-1;let s=Ce(e,n,o);if(!s||e[s.valueStart]!=="{")return-1;n=s.valueStart}return n}function Wn(e,t,n){return St(e,t.split("."),JSON.stringify(n))}function np(e,t,n){return St(e,t.split("."),n.trim())}function Jn(e,t){let n=t.split("."),o=We(e,n.slice(0,-1));if(o===-1)return e;let s=Ce(e,o,n.at(-1));return s?Hn(e,s.keyStart,s.valueEnd):e}function Kn(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=We(e,s.slice(0,-1));if(i===-1)return e;let r=Ce(e,i,s.at(-1));if(!r)return St(e,s,`[${o}]`);if(e[r.valueStart]!=="[")return e;let a=oe(e,r.valueStart)-1,c=T(e,r.valueStart+1);if(c===a){if(!e.slice(r.valueStart,a).includes(`
`))return`${e.slice(0,a)}${o}${e.slice(a)}`;let m=xe(e,a);return`${e.slice(0,a)}${m}${Ct(e)}${o}
${m}${e.slice(a)}`}let u=c,p=c;while(c<a)if(u=c,p=oe(e,c),c=T(e,p),e[c]===",")c=T(e,c+1);else break;let b=!e.slice(r.valueStart,a).includes(`
`)?", ":`,
${xe(e,u)}`;return`${e.slice(0,p)}${b}${o}${e.slice(p)}`}function op(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=We(e,s.slice(0,-1));if(i===-1)return e;let r=Ce(e,i,s.at(-1));if(!r||e[r.valueStart]!=="[")return e;let a=oe(e,r.valueStart)-1,c=T(e,r.valueStart+1);while(c<a){let u=oe(e,c);if(e.slice(c,u)===o)return Hn(e,c,u);if(c=T(e,u),e[c]===",")c=T(e,c+1)}return e}function $t(e){return JSON.parse(e)}async function Rt(e,t){let n=Bun.file(e);if(!await n.exists())return!1;let o=await n.text(),s=await t(o);if(s===o)return!1;return await Bun.write(e,s),!0}var Je="@myorg",R="packages/native",Yn="crates",z="npm",Se=(e)=>`packages/native/crates/${e}`,H=(e)=>`packages/native/npm/${e}`,$e="wasm32-wasip1-threads",At,Ke;var Ye=f(()=>{At=[{target:"aarch64-apple-darwin",runner:"macos-latest"},{target:"x86_64-apple-darwin",runner:"macos-13"},{target:"x86_64-pc-windows-msvc",runner:"windows-latest"},{target:"x86_64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"aarch64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64"},{target:"x86_64-unknown-linux-musl",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-alpine"},{target:"wasm32-wasip1-threads",runner:"ubuntu-latest",wasi:!0}],Ke=At.map((e)=>e.target)});import{existsSync as se,readdirSync as fr,readFileSync as Tt}from"fs";import{dirname as hr,join as Q,resolve as zn}from"path";function Qn(e=process.cwd()){let t=zn(e);for(let n=0;n<32;n++){if(se(Q(t,"packages","native","Cargo.toml")))return t;let o=hr(t);if(o===t)break;t=o}return zn(e)}function Zn(e){if(!se(e))return[];return fr(e,{withFileTypes:!0}).filter((t)=>t.isDirectory()).map((t)=>t.name).sort()}function Re(e){let t=Q(e,"packages","native",Yn),n=Q(e,"packages","native","Cargo.toml"),o=se(n)?Tt(n,"utf8"):"",s=new Set([...o.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm)].map((r)=>r[1]??"")),i=[];for(let r of Zn(t)){let a=Q(t,r,"Cargo.toml");if(!se(a))continue;let c=Tt(a,"utf8"),u=[...c.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm),...c.matchAll(/^\s*([\w-]+)\.workspace\s*=\s*true/gm)].map((p)=>p[1]??"").filter((p)=>s.has(p)||se(Q(t,p,"Cargo.toml")));i.push({name:r,dir:Se(r),binding:/crate-type\s*=\s*\[[^\]]*cdylib/.test(c),uses:u})}return i}function ze(e){let t=Q(e,"packages","native",z),n=[];for(let o of Zn(t)){let s=Q(t,o,"package.json");if(!se(s))continue;let i;try{i=JSON.parse(Tt(s,"utf8"))}catch{continue}if(!i.napi)continue;let r=Se(o);if(!se(Q(e,r,"Cargo.toml")))continue;n.push({name:o,dir:H(o),crateDir:r,binaryName:i.napi.binaryName??o,targets:i.napi.targets?.length?i.napi.targets:[...Ke]})}return n}function Qe(e){let t=new Set(Re(e).filter((n)=>n.binding).map((n)=>n.name));return ze(e).filter((n)=>t.has(n.name))}var Xn=f(()=>{Ye()});import{existsSync as br}from"fs";import{mkdir as Ze,writeFile as G}from"fs/promises";import{join as O}from"path";function vr(e){let t=["[package]",`name    = "${e.name}"`,"version.workspace    = true","edition.workspace    = true","license.workspace    = true","repository.workspace = true",""];if(e.binding)t.push("[lib]","# required \u2014 produces the .node binary napi packages",'crate-type = ["cdylib"]',"","[dependencies]","napi.workspace        = true","napi-derive.workspace = true",...(e.uses??[]).map((n)=>`${`${n}.workspace`.padEnd(22)}= true`),"","[build-dependencies]","napi-build.workspace = true","");else t.push("# Pure Rust \u2014 no napi dependency, no cdylib: testable without a Node runtime.","[dependencies]",...(e.uses??[]).map((n)=>`${n}.workspace = true`),"");return t.push("[lints]","workspace = true",""),t.join(`
`)}function wr(e){if(!e.binding)return`//! Pure Rust helpers shared by the binding crates.
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
`}function kr(e,t){let n=Xe(t),o=`${n}/${e.name}`,s=(e.uses??[]).length>0;return{name:o,version:"0.0.0",private:!0,type:"module",main:"index.js",types:"index.d.ts",exports:{".":{types:"./index.d.ts",require:"./index.js",import:"./index.js"},"./wasi":{types:"./index.d.ts",require:`./${e.name}.wasi.cjs`,browser:`./${e.name}.wasi-browser.js`}},files:["index.js","index.d.ts","*.node",`${e.name}.wasi.cjs`,`${e.name}.wasi-browser.js`,`${e.name}.wasm`],napi:{binaryName:e.name,packageName:o,targets:[...Ke],wasm:{initialMemory:16,maximumMemory:65536,browser:{fs:!1,asyncInit:!0,errorEvent:!0}}},scripts:{build:`m native napi:build --only ${e.name}`,"build:debug":`m native napi:build:debug --only ${e.name}`,"build:wasm":`m native napi:build:wasm --only ${e.name}`,"create-npm-dirs":`m native create-npm-dirs --only ${e.name}`,artifacts:`m native artifacts --only ${e.name}`,test:"m bun test","test:watch":"m bun test --watch",typecheck:"m typecheck --noEmit","cargo:check":"m native check","cargo:clippy":"m native clippy","cargo:fmt":"m native fmt","cargo:fmt:check":"m native fmt:check","cargo:test":"m native test"},devDependencies:{[`${n}/bun-config`]:"workspace:*",[`${n}/native-config`]:"workspace:*",...s?{[`${n}/native-crates`]:"workspace:*"}:{},[`${n}/ts`]:"workspace:*","@napi-rs/cli":"^3.9.1"}}}function xr(e){return`{
  "extends": "${e}/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"]
  },
  "include": ["index.d.ts", "tests/**/*"]
}
`}async function eo(e,t,n={}){let o=O(e,Se(t.name));if(await Ze(O(o,"src"),{recursive:!0}),await G(O(o,"Cargo.toml"),vr(t)),await G(O(o,"src","lib.rs"),wr(t)),t.binding)await G(O(o,"build.rs"),yr());if(!t.binding)return{crate:o};let s=O(e,H(t.name));return await Ze(s,{recursive:!0}),await G(O(s,"package.json"),`${JSON.stringify(kr(t,n),null,2)}
`),await G(O(s,"tsconfig.json"),xr(Xe(n))),await G(O(s,"turbo.json"),Cr()),await Ze(O(s,"tests"),{recursive:!0}),await G(O(s,"tests",`${t.name}.test.ts`),Sr(t,n)),{crate:o,package:s}}function $r(e,t){return e.replace(/members = \[([\s\S]*?)\]/,(n,o)=>{let s=new Set(o.split(`
`).map((i)=>i.trim()).filter((i)=>i.startsWith('"')).map((i)=>i.replace(/,$/,"")));return s.add(`"crates/${t}"`),`members = [
${[...s].sort().map((i)=>`  ${i},`).join(`
`)}
]`})}async function to(e,t){let n=O(e,"packages","native","Cargo.toml");if(!br(n))return;let o=await Bun.file(n).text();if(o.includes(`"crates/${t}"`))return;let s=o.includes("members = [")?$r(o,t):`${o.trimEnd()}

[workspace]
members = [
  "crates/${t}",
]
`;await G(n,s)}function Rr(e){return{name:`${Xe(e)}/native-crates`,version:"0.0.0",private:!0,scripts:{build:"m native build --pure",test:"m native test --pure","cargo:check":"m native check --pure","cargo:clippy":"m native clippy --pure","cargo:fmt":"m native fmt --pure","cargo:fmt:check":"m native fmt:check --pure"}}}async function Et(e,t={}){let n=O(e,"packages","native","crates");return await Ze(n,{recursive:!0}),await G(O(n,"package.json"),`${JSON.stringify(Rr(t),null,2)}
`),await G(O(n,"turbo.json"),Ar()),n}var Xe=(e)=>e.scope??Je,yr=()=>`extern crate napi_build;

fn main() {
    napi_build::setup();
}
`,Cr=()=>`{
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
`,Sr=(e,t={})=>{let n=e.name,o=Xe(t),s=(e.uses??[])[0]??"shared",i=(e.uses??[]).length>0,r=`${`${s}.workspace`.padEnd(22)}= true`,a=i?`
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
${a}`},Ar=()=>`{
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
`;var no=f(()=>{Ye()});import{existsSync as _t}from"fs";import{join as ie}from"path";function oo(){if(An("cargo"))return!0;return ne(K.cargo),!1}function re(){if(_t(ie(Ot,"Cargo.toml")))return!0;return console.warn(`\u26A0\uFE0F ${R}/Cargo.toml not present, skipping (enable the native config)`),!1}function E(e,t={}){if(!re())return 0;return Y("cargo",()=>g(["cargo",...e],{cwd:t.cwd??Ot}))}function ge(e){if(!e)return[];let t=Re(x).filter((n)=>n.binding).map((n)=>n.name);if(t.length===0)return[];return console.log(`\u2139\uFE0F pure Rust only \u2014 excluding bindings: ${t.join(", ")}`),t.flatMap((n)=>["--exclude",n])}function so(){return Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/scripts/index.js"))}function Tr(e){return["--cwd",x,"--manifest-path",`${e.crateDir}/Cargo.toml`,"--package-json-path",`${e.dir}/package.json`,"--output-dir",e.dir]}function Ae(e,t={},n=()=>[]){if(!re()||!oo())return 0;let o=Qe(x),s=t.only?o.filter((r)=>r.name===t.only):o;if(s.length===0)return console.warn(t.only?`\u26A0\uFE0F No napi package named "${t.only}" in ${R}/${z} \u2014 skipping`:`\u26A0\uFE0F No napi packages in ${R}/${z} \u2014 skipping`),0;let i=0;for(let r of s){console.log(`
\u25B8 ${r.name}: ${r.crateDir} \u2192 ${r.dir}`);let a=g(["bun",so(),...e,...Tr(r),...n(r),...t.target?["--target",t.target]:[],...t.cross?["--use-napi-cross"]:[],...t.dryRun?["--dry-run"]:[]],{cwd:x});if(a!==0)i=a,console.error(`::error::${e.join(" ")} failed for ${r.name} (exit ${a})`)}return i}function Er(e,t=Ot){if(!re()||!oo())return 0;return g(["bun",so(),...e],{cwd:t})}function _r(){if(!process.env.WASI_SDK_PATH)console.warn(`\u26A0\uFE0F WASI_SDK_PATH is not set \u2014 install the WASI SDK if the wasm target fails to link
`+"   (CI does it for you; locally: https://github.com/WebAssembly/wasi-sdk/releases)")}function Jr(e){let t=new Set;for(let o of Qe(e))for(let s of o.targets)t.add(s);return{include:At.filter((o)=>t.size===0||t.has(o.target)).map((o)=>{let s={target:o.target,runner:o.runner};if(o.container)s.container=o.container;if(o.wasi)s.wasi=!0;return s})}}async function io(e){if(e)return e;let t=ze(x)[0];if(t)try{let o=(await Bun.file(ie(x,t.dir,"package.json")).json()).name?.split("/")[0];if(o?.startsWith("@"))return o}catch{}return process.env.NATIVE_SCOPE??Je}var x,Ot,fe,Te,Or,Ir,Nr,Pr,Dr,jr,Lr,Mr,Br,Gr,Fr,Vr,Ur,Hr,qr,Wr,Kr,Yr,zr,Qr,Zr,Xr,ea,ta,na,oa,ro,sa;var ao=f(()=>{k();de();Xn();Ye();no();x=Qn(),Ot=ie(x,R);fe={pure:{type:"boolean",description:"Only the pure Rust crates (excludes every napi binding)",default:!1}};Te={only:{type:"string",description:"Build a single package (by directory name)"},target:{type:"string",description:"Rust target triple, e.g. aarch64-unknown-linux-gnu"},cross:{type:"boolean",description:"Cross-compile with napi's bundled toolchain",default:!1}},Or=l({meta:{name:"check",description:"cargo check --workspace (fast type-check)"},args:{...fe},run({args:e}){process.exit(E(["check","--workspace",...ge(Boolean(e.pure))]))}}),Ir=l({meta:{name:"clippy",description:"cargo clippy --workspace --all-targets -- -D warnings"},args:{...fe},run({args:e}){process.exit(E(["clippy","--workspace",...ge(Boolean(e.pure)),"--all-targets","--","-D","warnings"]))}}),Nr=l({meta:{name:"fmt",description:"cargo fmt --all (format write)"},args:{...fe},run({args:e}){process.exit(E(["fmt","--all",...ge(Boolean(e.pure))]))}}),Pr=l({meta:{name:"fmt:check",description:"cargo fmt --all -- --check (format check)"},args:{...fe},run({args:e}){process.exit(E(["fmt","--all",...ge(Boolean(e.pure)),"--","--check"]))}}),Dr=l({meta:{name:"test",description:"cargo test --workspace (run Rust tests)"},args:{...fe},run({args:e}){process.exit(E(["test","--workspace",...ge(Boolean(e.pure))]))}}),jr=l({meta:{name:"build",description:"cargo build --workspace (debug)"},args:{...fe},run({args:e}){process.exit(E(["build","--workspace",...ge(Boolean(e.pure))]))}}),Lr=l({meta:{name:"build:release",description:"cargo build --workspace --release (lto, strip)"},run(){process.exit(E(["build","--workspace","--release"]))}}),Mr=l({meta:{name:"build:ci",description:"cargo build --workspace --profile ci"},run(){process.exit(E(["build","--workspace","--profile","ci"]))}}),Br=l({meta:{name:"tree",description:"cargo tree (dependency tree)"},run(){process.exit(E(["tree",...v("tree")]))}}),Gr=l({meta:{name:"update",description:"cargo update (update dependencies)"},run(){process.exit(E(["update",...v("update")]))}}),Fr=l({meta:{name:"doc",description:"cargo doc --no-deps (generate docs)"},run(){process.exit(E(["doc","--no-deps"]))}}),Vr=l({meta:{name:"nextest",description:"cargo nextest run (faster parallel tests)"},run(){process.exit(E(["nextest","run",...v("nextest")]))}}),Ur=l({meta:{name:"llvm-cov",description:"cargo llvm-cov --lcov (Rust coverage, requires cargo-llvm-cov)"},run(){let e=v("llvm-cov");if(e.length===0)process.exit(E(["llvm-cov","--workspace","--lcov","--output-path","coverage/rust-lcov.info"]));process.exit(E(["llvm-cov",...e]))}}),Hr=l({meta:{name:"audit",description:"cargo audit (security audit)"},run(){process.exit(E(["audit"]))}}),qr=l({meta:{name:"deny",description:"cargo deny check (license/ban check)"},run(){process.exit(E(["deny",...v("deny")]))}}),Wr=l({meta:{name:"typecheck",description:"Type-check every npm package (skips when absent)"},run(){if(!re())process.exit(0);let e=ze(x).filter((n)=>_t(ie(x,n.dir,"tsconfig.json")));if(e.length===0)console.warn(`\u26A0\uFE0F No npm packages to type-check in ${R}/${z}`),process.exit(0);let t=0;for(let n of e){console.log(`\u25B8 typecheck ${n.name}`);let o=g(["bun","run","typecheck"],{cwd:ie(x,n.dir)});if(o!==0)t=o}process.exit(t)}});Kr=l({meta:{name:"matrix",description:"Print the CI build matrix (supported targets the packages declare)"},args:{json:{type:"boolean",description:"Pretty-print JSON (default)",default:!0},gha:{type:"boolean",description:"Print `key=value` lines ready for $GITHUB_OUTPUT",default:!1}},run({args:e}){let t=Jr(x);if(e.gha)console.log(`targets=${JSON.stringify(t)}`),console.log(`has_targets=${t.include.length>0}`);else console.log(JSON.stringify(t,null,2));process.exit(0)}}),Yr=l({meta:{name:"list",description:"List crates and the npm packages built from them"},args:{json:{type:"boolean",description:"Print JSON",default:!1}},run({args:e}){if(!re())process.exit(0);let t=Re(x),n=Qe(x),o=new Set(n.map((s)=>s.name));if(e.json)console.log(JSON.stringify({root:x,crates:t,packages:n},null,2)),process.exit(0);console.log(`
\uD83E\uDD80 ${R} (workspace root: ${x})
`),console.log("  crates/");for(let s of t){let i=s.binding?"cdylib \u2192 npm package":"pure Rust",r=s.uses.length?` (uses ${s.uses.join(", ")})`:"",a=s.binding&&!o.has(s.name)?"  \u26A0\uFE0F no npm package":"";console.log(`    ${s.name.padEnd(14)} ${i}${r}${a}`)}if(console.log(`
  npm/`),n.length===0)console.log("    (none \u2014 add a cdylib crate with `m native add <name>`)");for(let s of n)console.log(`    ${s.name.padEnd(14)} ${s.crateDir}  binary: ${s.binaryName}.<platform>.node`),console.log(`    ${" ".repeat(14)} targets: ${s.targets.join(", ")}`);console.log(""),process.exit(0)}});zr=l({meta:{name:"add",description:"Add a crate (and, for bindings, its npm package) to the workspace"},args:{name:{type:"positional",description:"Crate name \u2014 also the npm package name",required:!0},pure:{type:"boolean",description:"Pure Rust crate: no cdylib, no npm package",default:!1},uses:{type:"string",description:"Comma-separated sibling crates to depend on"},scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!re())process.exit(1);let t=String(e.name);if(!/^[a-z0-9][a-z0-9-]*$/.test(t))console.error(`\u274C Invalid crate name "${t}" \u2014 use lowercase letters, digits and hyphens`),process.exit(1);let n={name:t,binding:!e.pure,uses:e.uses?String(e.uses).split(",").map((s)=>s.trim()).filter(Boolean):[],sample:"arithmetic"},o=await io(e.scope);if(await eo(x,n,{scope:o}),await to(x,t),e.pure)await Et(x,{scope:o});if(console.log(`
\u2705 Added ${e.pure?"pure Rust crate":"crate + npm package"} "${t}"`),console.log(`   crate:   ${R}/crates/${t}/`),!e.pure)console.log(`   package: ${H(t)}/`);else console.log(`   bridge:  ${R}/crates/package.json (${o}/native-crates)`),console.log(`   Bindings that use "${t}" add it to workspace.dependencies + Cargo.toml,`),console.log(`   and \`${o}/native-crates: workspace:*\` in their package.json.`);console.log(`
   Run: bun install && m native check
`),process.exit(0)}}),Qr=l({meta:{name:"napi:build",description:"napi build --platform --release (one per package)"},args:Te,run({args:e}){process.exit(Ae(["build","--platform","--release"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),Zr=l({meta:{name:"napi:build:debug",description:"napi build (debug, one per package)"},args:Te,run({args:e}){process.exit(Ae(["build"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),Xr=l({meta:{name:"napi:build:wasm",description:`napi build --target ${$e} (one per package)`},args:{only:Te.only},run({args:e}){_r(),process.exit(Ae(["build","--platform","--release","--target",$e],{only:e.only}))}}),ea=l({meta:{name:"create-npm-dirs",description:"Generate the per-platform npm packages (run in CI, not committed)"},args:{only:Te.only,"dry-run":{type:"boolean",default:!1}},run({args:e}){process.exit(Ae(["create-npm-dirs"],{only:e.only,dryRun:Boolean(e["dry-run"])},()=>["--npm-dir",`${R}/${z}`]))}}),ta=l({meta:{name:"artifacts",description:"Copy CI artifacts (.node/.wasm) into the npm packages"},args:{only:Te.only,dir:{type:"string",description:"Directory holding the downloaded artifacts",default:"artifacts"}},run({args:e}){process.exit(Ae(["artifacts"],{only:e.only},(t)=>["--npm-dir",`${R}/${z}`,"--output-dir",String(e.dir??"artifacts"),"--build-output-dir",t.dir]))}}),na=l({meta:{name:"napi",description:"Run napi-rs CLI (passthrough, cwd = the workspace)"},run(){process.exit(Er(v("napi")))}}),oa=l({meta:{name:"sync",description:"Re-sync the Turbo bridge node and Cargo\u2192npm dependency edges"},args:{scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!re())process.exit(1);let t=await io(e.scope),n=`${t}/native-crates`,o=0;await Et(x,{scope:t}),console.log(`  \u2713 ${R}/crates/{package,turbo}.json (bridge node)`);for(let i of Re(x).filter((r)=>r.binding)){let r=ie(x,H(i.name),"package.json");if(!_t(r))continue;let a=(i.uses??[]).length>0;await Rt(r,(c)=>{let p=$t(c).devDependencies?.[n];if(a&&p!=="workspace:*")return console.log(`  \u2713 ${H(i.name)}/package.json \u2192 ${n}: workspace:*`),o+=1,Wn(c,`devDependencies.${n}`,"workspace:*");if(!a&&p)return console.log(`  \uD83D\uDDD1\uFE0F ${H(i.name)}/package.json \u2190 ${n} (no Cargo path deps)`),o+=1,Jn(c,`devDependencies.${n}`);return c})}let s=ie(x,"package.json");await Rt(s,(i)=>{if(($t(i).workspaces??[]).includes(`${R}/crates`))return i;return console.log(`  \u2713 package.json workspaces += ${R}/crates`),o+=1,Kn(i,"workspaces",`${R}/crates`)}),console.log(o===0?`
\u2705 Already in sync
`:`
\u2705 Synced (${o} fix${o===1?"":"es"}) \u2014 run bun install
`),process.exit(0)}}),ro=l({meta:{name:"m native",version:"1.0.0",description:"Native Rust bindings via Cargo + napi-rs \u2014 one Cargo workspace in packages/native with a crate per Rust unit and an npm package per napi binding."},subCommands:{list:Yr,matrix:Kr,add:zr,check:Or,clippy:Ir,fmt:Nr,"fmt:check":Pr,test:Dr,build:jr,"build:release":Lr,"build:ci":Mr,tree:Br,update:Gr,doc:Fr,nextest:Vr,"llvm-cov":Ur,audit:Hr,deny:qr,typecheck:Wr,"napi:build":Qr,"napi:build:debug":Zr,"napi:build:wasm":Xr,"create-npm-dirs":ea,artifacts:ta,napi:na,sync:oa},run(){let e=v("native");if(e.length===0)console.log(`
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
  napi:build:wasm      napi build --target ${$e}
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
`),process.exit(0);let t=e[0]??"";if(!Object.keys(ro.subCommands||{}).includes(t)&&!t.startsWith("-"))process.exit(E(e))}}),sa=ro});var{file:co,spawnSync:ia}=globalThis.Bun;var ra,aa;var lo=f(()=>{I();k();ra=l({meta:{name:"m e2e",version:"1.0.0",description:"Playwright E2E with browser detection \u2014 auto-skips if browsers missing, uses shared config"},args:{args:{type:"positional",description:"Playwright test args",required:!1}},async run(){let{chromium:e,firefox:t,webkit:n}=await import("@playwright/test"),o={chromium:e,firefox:t,webkit:n},s=[];for(let[w,b]of Object.entries(o))try{let m=b.executablePath();if(!await co(m).exists())s.push(w)}catch{s.push(w)}if(s.length>0)console.log(`
E2E skipped: browser(s) not installed (${s.join(", ")}).`),console.log("Run `bunx playwright install` to download them.\n"),process.exit(0);let i=tn(),r=await co(`${i}/apps/example/playwright.config.ts`).exists()?`${i}/apps/example/playwright.config.ts`:null,a=v("e2e"),u=["bun",Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js")),"test",...r?["--config",r]:[],...a],p=ia({cmd:u,stdout:"inherit",stderr:"inherit",stdin:"inherit"});process.exit(p.exitCode)}}),aa=ra});import{existsSync as po,readdirSync as ca,readFileSync as la}from"fs";import{join as Nt}from"path";function ua(e){if(e===void 0||e===!1||e===null)return null;if(e===!0)return It;if(typeof e==="string")return e||It;if(typeof e==="object")return e.dir||It;return null}function ma(e){let t=Nt(e,"package.json");if(!po(t))return null;try{return JSON.parse(la(t,"utf8"))}catch{return null}}function et(e=process.cwd()){let t=[];for(let o of pa){let s=o.split("*")[0]??"",i=Nt(e,s);if(!po(i))continue;for(let r of ca(i,{withFileTypes:!0})){if(!r.isDirectory())continue;let a=`${s}${r.name}`,c=ma(Nt(e,a));if(!c?.name)continue;let u=ua(c.pages);if(!u)continue;t.push({name:c.name,dir:a,outDir:`${a}/${u}`})}}t.sort((o,s)=>o.name.localeCompare(s.name));let n=t.length>1;return t.map((o)=>({...o,subpath:n?o.name.split("/").at(-1)??o.name:""}))}function Dt(e){return e.subpath?`/${e.subpath}/`:"/"}var L=".pages",Pt="coverage",It="public",pa;var uo=f(()=>{pa=["apps/*","packages/*"]});import{existsSync as jt}from"fs";import{cp as mo,rm as da}from"fs/promises";import{join as Z}from"path";var{Glob:ga,spawnSync:go}=globalThis.Bun;function fa(){let e=process.env.GITHUB_REPOSITORY?.split("/")[1];if(e)return e;let n=go({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim();if(!n)return;return n.replace(/\.git$/,"").split("/").at(-1)}function ha(){let e=process.env.GITHUB_REPOSITORY?.split("/")[0];if(e)return e;return go({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim()?.replace(/\.git$/,"").match(/[:/]([^/:]+)\/[^/]+$/)?.[1]}async function ba(e,t){await da(Z(e,L),{recursive:!0,force:!0});for(let i of t){let r=Z(e,i.outDir);if(!jt(r))console.error(`::error::${i.name} declares "${i.outDir}" but it does not exist`),process.exit(1);let a=i.subpath?Z(e,L,i.subpath):Z(e,L);await mo(r,a,{recursive:!0}),console.log(`\uD83D\uDCE6 ${i.name}: ${i.outDir} \u2192 ${L}${Dt(i)}`)}let n="coverage/html",o=Z(e,n);if(jt(Z(o,"index.html")))await mo(o,Z(e,L,Pt),{recursive:!0}),console.log(`\uD83D\uDCCA ${n} \u2192 ${L}/${Pt} (served at /coverage/)`);let s=Z(e,L,"index.html");if(!jt(s))console.warn(`\u26A0\uFE0F No index.html at the site root (${L}/) \u2014 check the pages config`)}var va,ya,wa,ka,xa;var fo=f(()=>{k();uo();va=l({meta:{name:"list",description:"Show which packages declare a Pages site"},run(){let e=et();if(e.length===0)console.log("No package declares a pages config in its package.json"),process.exit(0);for(let t of e)console.log(`${t.name.padEnd(24)} ${t.outDir.padEnd(28)} \u2192 ${Dt(t)}`);process.exit(0)}}),ya=l({meta:{name:"build",description:"Build the site and assemble the Pages artifact from declared packages"},run(){console.log("\uD83D\uDCC4 Building static site for GitHub Pages");let e=g(["bun","run","build"]);if(e!==0)console.error(`::error::bun run build failed (exit ${e})`),process.exit(e);let t=et();if(t.length===0)console.error('::error::Pages is enabled but no package declares "pages" in its package.json (e.g. "pages": { "dir": "public" })'),process.exit(1);ba(process.cwd(),t).then(()=>{console.log(`\u2705 Pages artifact ready: ${L}/`),process.exit(0)})}}),wa=l({meta:{name:"base",description:"Report (or inject) the base path for a GitHub Pages project site"},args:{inject:{type:"boolean",description:"Rewrite absolute href/src in the built HTML to include the base path",default:!1},json:{type:"boolean",description:"Print { owner, repo, base, url } as JSON",default:!1}},async run({args:e}){let t=fa(),n=ha()??"unknown",o=t?`https://${n.toLowerCase()}.github.io/${t}`:void 0;if(e.json){console.log(JSON.stringify({owner:t?n:null,repo:t??null,base:t?`/${t}`:null,url:o??null}));return}if(console.log(`\uD83D\uDD27 Repo name: ${t??"(unknown)"}`),console.log(`   Default Pages URL: ${o??"(unknown)"}`),!e.inject)return;if(!t)console.error("::error::cannot determine repo name \u2014 set GITHUB_REPOSITORY or add a git remote"),process.exit(1);if(et().filter((a)=>a.subpath==="").length===0){console.log("   No root-level Pages target \u2014 nothing to rewrite");return}let r=0;for(let a of new ga(`${L}/**/*.html`).scanSync(".")){let c=await Bun.file(a).text(),u=c.replaceAll(/(href|src)="\/(?!\/)/g,`$1="/${t}/`);if(u===c)continue;await Bun.write(a,u),r++}console.log(`   Rewrote absolute paths to /${t}/ in ${r} file(s)`)}}),ka=l({meta:{name:"m pages",version:"1.0.0",description:"GitHub Pages helper \u2014 discovers declared sites, builds and stages the artifact"},subCommands:{build:ya,base:wa,list:va}}),xa=ka});import{mkdir as Ee,readdir as tt}from"fs/promises";import{join as ae}from"path";var{$:he,file:Lt,write:_e}=globalThis.Bun;function Ca(e){let t=e.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!t)return null;let n=t[1]??"",o=t[2]??"",s={};for(let i of n.split(`
`)){let r=i.indexOf(":");if(r===-1)continue;let a=i.slice(0,r).trim(),c=i.slice(r+1).trim().replace(/^["']|["']$/g,"");if(a)s[a]=c}return{frontmatter:s,body:o}}async function Ie(e){try{let t=await Lt(e).text(),n=Ca(t);if(!n)return console.error(`\u274C ${e}: missing YAML frontmatter (---)`),null;let{frontmatter:o}=n;if(!o.name)return console.error(`\u274C ${e}: missing frontmatter 'name'`),null;if(!o.description)return console.error(`\u274C ${e}: missing frontmatter 'description'`),null;return{name:o.name,description:o.description,path:e}}catch(t){return console.error(`\u274C ${e}: ${t.message}`),null}}async function nt(e){let t=[];try{let n=await tt(e,{withFileTypes:!0});for(let o of n){let s=ae(e,o.name);if(o.isDirectory()){let i=await nt(s);t.push(...i)}else if(o.name==="SKILL.md"||o.name.endsWith(".md"))t.push(s)}}catch{}return t}var ho="@myorg",ce,vo,M,Oe,bo,Sa,$a,Ra,Aa,Ta,Ea,_a,Oa,Ia;var yo=f(()=>{Be();I();ce=nn(),vo=`${U()}/src/cli.ts`,M=`${process.cwd()}/.agents/skills`,Oe=`${process.cwd()}/.agents/skills.index.json`;bo=l({meta:{name:"sync",description:"Sync curated skills to .agents/skills/ + validate + index"},run:async()=>{let e=process.env.SKILLS_SCOPE||process.env.SCOPE||ho,t=ho;await Ee(M,{recursive:!0}),console.log(`
\uD83D\uDCE6 Syncing curated skills from ${ce} to ${M}/ (scope: ${e})
`);let n=0;try{let a=await tt(ce,{withFileTypes:!0});for(let c of a){let u=ae(ce,c.name);if(c.isDirectory()){let p=ae(M,c.name);if(await Ee(p,{recursive:!0}),await he`cp -r ${u}/* ${p}/`.quiet().catch(()=>{}),e!==t){let w=await he`find ${p} -type f -name "*.md"`.text().catch(()=>"");for(let b of w.trim().split(`
`).filter(Boolean))try{let m=await Lt(b).text();if(m.includes(t))await _e(b,m.replaceAll(t,e))}catch{}}n++,console.log(`  \u2713 ${c.name}/`)}else if(c.isFile()&&c.name.endsWith(".md")){let p=c.name.replace(/\.md$/,""),w=ae(M,p);await Ee(w,{recursive:!0});let b=await Lt(u).text();if(e!==t)b=b.replaceAll(t,e);if(b.startsWith("---"))await _e(ae(w,"SKILL.md"),b);else{let C=`---
name: ${p}
description: ${p} skill
---

${b}`;await _e(ae(w,"SKILL.md"),C)}n++,console.log(`  \u2713 ${p}/ (from legacy ${c.name})`)}}}catch(a){console.error(`  No curated dir: ${ce}`,a)}console.log(`
\u2705 Synced ${n} curated skills to .agents/skills/
`),console.log(`\uD83D\uDD0D Validating skills in ${M}/...
`);let o=await nt(M),s=0,i=0;for(let a of o){let c=await Ie(a);if(c)s++,console.log(`  \u2713 ${c.name} \u2014 ${c.description}`);else i++}console.log(`
${i===0?"\u2705":"\u26A0\uFE0F"}  ${s} valid, ${i} invalid
`);let r=[];for(let a of o){let c=await Ie(a);if(c)r.push({...c,path:a.replace(`${process.cwd()}/`,"")})}if(await Ee(`${process.cwd()}/.agents`,{recursive:!0}),await _e(Oe,`${JSON.stringify(r,null,2)}
`),console.log(`\uD83D\uDCC4 Built ${Oe} with ${r.length} skills
`),i>0)process.exit(1)}}),Sa=l({meta:{name:"list",description:"List installed skills (curated + vendored + skills.sh)",alias:["ls"]},run:async()=>{console.log(`
\uD83D\uDCDA Skills in ${M}/:
`);try{let e=await tt(M,{withFileTypes:!0});if(e.length===0)console.log("  (no skills installed \u2014 run `bun run skills:sync` or `bun run skills:add`)\n");else for(let t of e){if(!t.isDirectory())continue;let n=ae(M,t.name,"SKILL.md"),o=await Ie(n).catch(()=>null);if(o)console.log(`  - ${o.name} \u2014 ${o.description} (${t.name}/)`);else console.log(`  - ${t.name}/ \u2014 (no SKILL.md)`)}}catch{console.log("  (no .agents/skills/ dir \u2014 run `bun run skills:sync`)\n")}console.log(`
\uD83D\uDCE6 Curated skills in ${ce}/:
`);try{let e=await tt(ce,{withFileTypes:!0});for(let t of e){let n=t.isDirectory()?t.name:t.name.replace(/\.md$/,"");console.log(`  - ${n}`)}}catch{console.log("  (no curated dir)")}console.log(),console.log(`\uD83D\uDD0D skills.sh installed (project):
`),await he`npx skills list -p`.quiet().then(async(e)=>{let t=e.stdout.toString();console.log(t||"  (none or skills CLI not available)")}).catch(()=>{console.log("  (skills CLI not available or no project skills)")}),console.log()}}),$a=l({meta:{name:"add",description:"Add skill via skills.sh (e.g. vercel-labs/agent-skills)",alias:["a"]},args:{package:{type:"positional",description:"Skill package (e.g. vercel-labs/agent-skills or https://skills.sh/p/<id>)",required:!0}},run:async({args:e})=>{let t=e.package;console.log(`
\uD83D\uDCE6 Adding skill package via skills.sh: ${t}
`),console.log(`> npx skills add ${t} -p --agent * -y
`);let o=await Bun.spawn({cmd:["npx","skills","add",t,"-p","--agent","*","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(o!==0)console.error(`
\u274C skills add failed with exit ${o}
`),process.exit(o);console.log(`
\u2705 Added ${t}, syncing to .agents/skills/...
`),await he`bun ${vo} skills sync`.quiet().catch(()=>{}),await he`npx skills experimental_sync -p`.quiet().catch(()=>{}),console.log(`
\u2705 Done. Review changes in .agents/skills/ before committing.
`)}}),Ra=l({meta:{name:"update",description:"Update skills via skills.sh",alias:["upgrade"]},args:{skills:{type:"positional",description:"Skills to update (default: all)",required:!1}},run:async({args:e})=>{let t=e.skills??"",n=t?[t]:[];console.log(`
\uD83D\uDD04 Updating skills via skills.sh: ${n.join(" ")||"(all)"}
`);let o=["npx","skills","update",...n,"-p","-y"];console.log(`> ${o.join(" ")}
`);let i=await Bun.spawn({cmd:o,cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(i!==0)console.error(`
\u274C skills update failed with exit ${i}
`),process.exit(i);console.log(`
\u2705 Updated, rebuilding index...
`),await he`bun ${vo} skills sync`.quiet().catch(()=>{})}}),Aa=l({meta:{name:"validate",description:"Validate all SKILL.md frontmatter (name, description)"},run:async()=>{console.log(`
\uD83D\uDD0D Validating all SKILL.md files...
`);let e=[ce,M],t=0,n=0;for(let o of e){console.log(`\uD83D\uDCC1 ${o}:
`);let s=await nt(o);if(s.length===0){console.log(`  (no skills found)
`);continue}for(let i of s){let r=await Ie(i);if(r)t++,console.log(`  \u2713 ${r.name} \u2014 ${r.description} (${i.replace(`${process.cwd()}/`,"")})`);else n++}console.log()}if(console.log(`${n===0?"\u2705":"\u274C"} Validation: ${t} valid, ${n} invalid
`),n>0)process.exit(1)}}),Ta=l({meta:{name:"index",description:"Build .agents/skills.index.json"},run:async()=>{console.log(`
\uD83D\uDCC4 Building ${Oe}...
`);let e=await nt(M),t=[];for(let n of e){let o=await Ie(n);if(o)t.push({...o,path:n.replace(`${process.cwd()}/`,"")})}await Ee(`${process.cwd()}/.agents`,{recursive:!0}),await _e(Oe,`${JSON.stringify(t,null,2)}
`),console.log(`\u2705 Built index with ${t.length} skills:
`);for(let n of t)console.log(`  - ${n.name}: ${n.description}`);console.log(`
\uD83D\uDCC4 ${Oe}
`)}}),Ea=l({meta:{name:"init",description:"Init new skill via skills.sh"},args:{name:{type:"positional",description:"Skill name",required:!1,default:"my-skill"}},run:async({args:e})=>{let t=e.name??"my-skill";console.log(`
\uD83D\uDCDD Initializing skill: ${t}
`),await Bun.spawn({cmd:["npx","skills","init",t],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),_a=l({meta:{name:"remove",description:"Remove skills via skills.sh",alias:["rm"]},args:{skills:{type:"positional",description:"Skills to remove",required:!0}},run:async({args:e})=>{let n=e.skills.split(",").map((s)=>s.trim());console.log(`
\uD83D\uDDD1\uFE0F Removing skills: ${n.join(", ")}
`),await Bun.spawn({cmd:["npx","skills","remove",...n,"-p","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),Oa=l({meta:{name:"m skills",version:"1.0.0",description:"AI agent skills management via skills.sh + curated skills \u2014 sync, list, add, update, validate, index"},subCommands:{sync:bo,list:Sa,add:$a,update:Ra,validate:Aa,index:Ta,init:Ea,remove:_a},run:async({args:e})=>{if(!e._||Array.isArray(e._)&&e._.length===0)await q(bo,{rawArgs:[]})}}),Ia=Oa});function wo(e,t,n){let o=[];if(e.includes("Archont561/ts-monorepo-template")&&!e.includes(t))o.push("README still contains placeholder owner Archont561/ts-monorepo-template");if(e.includes("@myorg")&&!e.includes(n)){let s=e.split(`
`).filter((i)=>i.includes("shields.io")||i.includes("badge.svg"));for(let i of s)if(i.includes("@myorg"))o.push(`Badge line still contains @myorg: ${i.trim().slice(0,80)}`)}return o}var{file:Na}=globalThis.Bun;var ko,Pa;var xo=f(()=>{k();ko=l({meta:{name:"check",description:"Check README badges for placeholder owner/scope"},args:{owner:{type:"string",description:"Expected owner/repo",default:"YOUR_ORG/YOUR_REPO"},scope:{type:"string",description:"Expected scope",default:"@your-scope"}},run:async({args:e})=>{let t=e.owner||"YOUR_ORG/YOUR_REPO",n=e.scope||"@your-scope",o=`${process.cwd()}/README.md`,s=await Na(o).text().catch(()=>"");if(!s)console.error(`No README at ${o}`),process.exit(1);let i=wo(s,t,n);if(i.length===0)console.log("\u2705 Badges look OK (no placeholder owner/scope in badge URLs)"),process.exit(0);console.warn(`\u26A0\uFE0F Badge issues:
${i.map((r)=>`  - ${r}`).join(`
`)}`),process.exit(1)}}),Pa=l({meta:{name:"badges",version:"1.0.0",description:"Badges validation \u2014 check README badges"},subCommands:{check:ko},run:async()=>{await q(ko,{rawArgs:[]})}})});var{file:Da}=globalThis.Bun;function Co(e,t){return async({targetDir:n,scope:o})=>{let s=Ge(...e.split("/"));if(!await Da(s).exists())return;console.log(`
\uD83D\uDD27 Running setup for ${t}: ${e}
`);try{let r=await Bun.spawn({cmd:["bun",s],cwd:n,env:{...process.env,SCOPE:o,NATIVE_SCOPE:o,UNOCSS_SCOPE:o,DEVCONTAINER_SCOPE:o,SKILLS_SCOPE:o},stdout:"inherit",stderr:"inherit"}).exited;if(r!==0)console.warn(`\u26A0\uFE0F Setup for ${t} exited with code ${r}`)}catch(i){console.warn(`\u26A0\uFE0F Setup for ${t} failed:`,i)}}}var So,$o;var Ro=f(()=>{I();So=Co("commands/native-setup.ts","native"),$o=Co("commands/devcontainer-setup.ts","devcontainer")});var{file:Ao}=globalThis.Bun;async function tu(e){return[...X]}function Ba(e){if(typeof e==="boolean")return!0;if(typeof e!=="string")return!1;return e==="always"||Ma.includes(e)}function Eo(e,t){let n=e.flag?t[e.flag]:void 0;return n===void 0?e.default:n}function _o(e,t){return e.type==="select"?t===e.default:!t}function Ga(e,t){if(e.default==="always"&&!e.selfDestruct)return!0;let n=Eo(e,t);return!(e.selfDestruct===!0||_o(e,n))}function Oo(e,t){let n=new Set;for(let o of e)if(Ga(o.meta,t))n.add(o.dir);return n}function Io(e,t){let n=new Set(["template"]);for(let o of e){let{meta:s}=o;if(s.default==="always")continue;let i=Eo(s,t);if(_o(s,i)){if(n.add(o.dir),s.flag)n.add(s.flag);if(s.marker)n.add(s.marker);if(s.templateMarker)n.add(s.templateMarker);for(let a of s.markers??[])n.add(a)}for(let a of s.options??[]){if(a.value===i)continue;if(a.marker)n.add(a.marker);if(a.templateMarker)n.add(a.templateMarker);for(let c of a.markers??[])n.add(c)}let r=s.removals?.[String(i)];if(r){if(r.marker)n.add(r.marker);if(r.templateMarker)n.add(r.templateMarker);for(let a of r.markers??[])n.add(a);for(let a of r.markersToRemove??[])n.add(a)}}return n}async function No(e){let t=Ao(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.features;if(!o||typeof o!=="object"||Array.isArray(o))return null;let s={};for(let[i,r]of Object.entries(o))if(Ba(r))s[i]=r;return s}catch{return null}}async function Po(e){let t=Ao(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.scope;return typeof o==="string"&&o.length>0?o:null}catch{return null}}var ja,To="@myorg",La,X,eu,nu="tooling.features",ou="tooling.scope",Ma;var Do=f(()=>{Ro();ja={none:"none",publish:"publish",docker:"docker"},La={badges:{name:"@myorg/badges",dir:"badges",meta:{default:"always",flag:"badges",prompt:"Include badges for CI, coverage, license in READMEs?"}},biome:{name:"@myorg/biome",ciFiles:["sections/biome.yml"],dir:"biome",meta:{default:"always",flag:"biome",prompt:"Configure Biome (lint + format)?"}},"bun-config":{name:"@myorg/bun-config",ciFiles:["sections/bun-config.yml"],dir:"bun-config",meta:{default:"always",flag:"bun-config",prompt:"Configure Bun (coverage, test settings)?"}},bunup:{name:"@myorg/bunup",ciFiles:["sections/bunup.yml"],dir:"bunup",meta:{default:"always",flag:"bunup",prompt:"Configure Bunup (Bun-based package bundler)?"}},changeset:{name:"@myorg/changeset",ciFiles:["fragments/changeset/release.steps.yml"],dir:"changeset",meta:{default:"always",flag:"changeset",prompt:"Configure Changesets (versioning + releases)?"}},citty:{name:"@myorg/citty",dir:"citty",meta:{default:"always",flag:"citty",prompt:"Configure Citty (elegant CLI builder)?"}},codeql:{name:"@myorg/codeql",ciFiles:["sections/codeql.yml"],dir:"codeql",meta:{default:!0,flag:"codeql",prompt:"Include CodeQL (GitHub SAST for JS/TS)?",type:"confirm"}},commitlint:{name:"@myorg/commitlint",dir:"commitlint",meta:{default:"always",flag:"commitlint",prompt:"Configure Commitlint (Conventional Commits)?"}},community:{name:"@myorg/community",dir:"community",meta:{default:"always",flag:"community",prompt:"Include community health files (CODEOWNERS, PR template, issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING)?"}},coverage:{name:"@myorg/coverage",ciFiles:["fragments/coverage-report/coverage.base.yml","fragments/coverage-report/coverage.steps.yml","fragments/coverage-report/pages.steps.yml","sections/coverage.yml"],dir:"coverage",meta:{default:"always",flag:"coverage",prompt:"Configure coverage reporting (LCOV, HTML, artifact, Pages, threshold)?"}},dependabot:{name:"@myorg/dependabot",ciFiles:["fragments/dependabot/dependabot-auto-merge.base.yml","fragments/dependabot/dependabot-auto-merge.steps.yml","fragments/dependabot/dependabot.base.yml","standalone/dependabot.yml"],dir:"dependabot",meta:{default:"always",flag:"dependabot",prompt:"Configure Dependabot (automated dependency updates)?"}},devcontainer:{name:"@myorg/devcontainer",dir:"devcontainer",setup:$o,meta:{default:!1,flag:"devcontainer",prompt:"Include devcontainer config for Codespaces / Dev Containers?",type:"confirm",removals:{true:{},false:{extraRemovals:[".devcontainer"],filePatternsToRemove:["**/.devcontainer/**",".devcontainer/**","**/devcontainer.json"],fileRegexesToRemove:["devcontainer","\\.devcontainer"]}}}},editorconfig:{name:"@myorg/editorconfig",dir:"editorconfig",meta:{default:"always",flag:"editorconfig",prompt:"Include .editorconfig (consistent editor settings)?"}},"gh-actions":{name:"@myorg/gh-actions",ciFiles:["ci.base.yml","ci.bootstrap.yml","release.base.yml","sections/gh-actions.yml"],dir:"gh-actions",meta:{default:"always",flag:"gh-actions",prompt:"Configure GitHub Actions (CI + release workflows)?"}},gitattributes:{name:"@myorg/gitattributes",dir:"gitattributes",meta:{default:"always",flag:"gitattributes",prompt:"Include .gitattributes (line endings, binary handling)?"}},gitleaks:{name:"@myorg/gitleaks",ciFiles:["sections/gitleaks.yml"],dir:"gitleaks",meta:{default:"always",flag:"gitleaks",prompt:"Include Gitleaks (secret scanning via Lefthook + CI)?"}},lefthook:{name:"@myorg/lefthook",dir:"lefthook",meta:{default:"always",flag:"lefthook",prompt:"Configure Lefthook (Git hooks)?"}},manifest:{name:"@myorg/manifest",dir:"manifest",meta:{default:"always",flag:"manifest",prompt:"Configure the manifest editor (format-preserving package.json edits)?"}},native:{name:"@myorg/native-config",ciFiles:["fragments/native/native.base.yml","fragments/native/native.steps.yml","fragments/native/release.steps.yml","sections/native.yml"],dir:"native",setup:So,meta:{default:"none",flag:"native",prompt:"Set up native Node-API (NAPI-RS) bindings?",type:"select",options:[{value:"none",label:"None - skip native bindings"},{value:"publish",label:"Publish a native npm package"},{value:"docker",label:"Build native bindings in Docker"}],removals:{none:{extraRemovals:["packages/native","apps/example/src/pages/api/native"],scriptsToRemove:["build:native","build:wasm","test:native","security:audit"],turboTasksToRemove:["build:native","build:wasm"],filePatternsToRemove:["**/*.node","**/*.napi.*","**/*.wasi.cjs","**/rust-toolchain.toml","Cargo.lock",".cargo/**","**/native/**","**/api/native/**"],fileRegexesToRemove:["\\\\.node$","napi","rust-toolchain","api/native"],appDepsToRemove:["@myorg/native"]},publish:{},docker:{}}}},pages:{name:"@myorg/pages",ciFiles:["fragments/pages/pages.base.yml","fragments/pages/pages.steps.yml"],dir:"pages",meta:{default:!1,flag:"pages",prompt:"Set up GitHub Pages deployment (static site via Actions)?",type:"confirm",removals:{true:{},false:{extraRemovals:[".github/workflows/pages.yml"],filePatternsToRemove:["**/pages.yml"],fileRegexesToRemove:["pages\\.yml"]}}}},playwright:{name:"@myorg/playwright",ciFiles:["sections/playwright.yml"],dir:"playwright",meta:{default:!0,flag:"playwright",prompt:"Include E2E testing with Playwright?",removals:{true:{},false:{scriptsToRemove:["test:e2e"],turboTasksToRemove:["test:e2e"],extraRemovals:["apps/example/playwright.config.ts","apps/example/e2e"],filePatternsToRemove:["**/e2e/**","**/*.e2e.ts","**/playwright.config.ts"],fileRegexesToRemove:["playwright",".*\\.spec\\.e2e\\..*"],appDepsToRemove:["@myorg/playwright","@playwright/test"]}}}},skills:{name:"@myorg/skills",dir:"skills",meta:{default:!1,flag:"skills",prompt:"Install AI agent skills? (for Cursor, Claude, Cline)",removals:{false:{extraRemovals:[".agents"],filePatternsToRemove:[".agents/**","**/.claude/**","**/skills/**"],fileRegexesToRemove:["\\.agents","skills"],scriptsToRemove:["skills"]}}}},stale:{name:"@myorg/stale",ciFiles:["fragments/stale/stale.base.yml"],dir:"stale",meta:{default:!1,flag:"stale",prompt:"Include stale action (auto-close inactive issues/PRs)?",type:"confirm"}},template:{name:"@myorg/template",dir:"template",meta:{default:"always",selfDestruct:!0,scriptsToRemove:["docs:sync","docs:site","docs:dev","docs:build","docs:preview"],removals:{always:{extraRemovals:[".github/workflows/template-docs.yml","apps/template-docs","codecov.yml","packages/tooling/tests","packages/tooling/dist"],filePatternsToRemove:["**/template-docs.yml","**/template-docs/**",".changeset/*.md"],fileRegexesToRemove:["template-docs"]}}}},trivy:{name:"@myorg/trivy",ciFiles:["sections/trivy.yml"],dir:"trivy",meta:{default:!1,flag:"trivy",prompt:"Include Trivy (container + filesystem vulnerability scanning)?",type:"confirm",removals:{false:{filePatternsToRemove:["**/trivy*"],scriptsToRemove:["security:trivy","security:check"]}}}},ts:{name:"@myorg/ts",dir:"ts",meta:{default:"always",flag:"ts",prompt:"Configure TypeScript (shared tsconfigs)?"}},turbo:{name:"@myorg/turbo",ciFiles:["sections/turbo.yml"],dir:"turbo",meta:{default:"always",flag:"turbo",prompt:"Configure Turbo (task orchestration)?"}}},X=Object.values(La),eu=new Map(X.map((e)=>[e.dir,e]));Ma=Object.values(ja)});function jo(e,t){if(e.startsWith("!")){let n=e.slice(1).trim();return!t.has(n)&&!t.has(n.toLowerCase())}return t.has(e)||t.has(e.toLowerCase())}function iu(e){return[e,"-type","f","(",...Fa.flatMap((t,n)=>[...n>0?["-o"]:[],"-name",`*${t}`]),")","-not","-path","*/node_modules/*","-not","-path","*/dist/*","-not","-path","*/packages/tooling/*"]}function Lo(e,t){let n=e,o=!1;for(let s of Va)n=n.replace(s,(i,r,a)=>{let c=r.split(",").map((p)=>p.trim());return o=!0,c.every((p)=>jo(p,t))?"":a});for(let s of Ua)n=n.replace(s,(i,r,a)=>{if(r.toUpperCase()==="TEMPLATE-ONLY")return i;return o=!0,jo(r,t)?"":a});if(!o)return{content:e,changed:o};return{changed:o,content:n.replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).replace(/\n{2,}$/,`
`)}}var Fa,Va,Ua;var Mo=f(()=>{Fa=[".yml",".yaml",".ts",".js",".md",".toml",".html"],Va=[/[ \t]*#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g],Ua=[/[ \t]*#[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*\1:END[^\n]*\n?/g,/[ \t]*\/\/[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*\1:END[^\n]*\n?/g,/[ \t]*<!--[ \t]*([A-Za-z0-9_!-]+):START[ \t]*-->([\s\S]*?)<!--[ \t]*\1:END[ \t]*-->[ \t]*\n?/g]});var Bo;var Go=f(()=>{Bo={BUN_VERSION:"latest",NATIVE_DIR:"packages/native",NATIVE_CARGO:"packages/native/Cargo.toml",NATIVE_NPM:"packages/native/npm/*/package.json",NATIVE_WASI_SDK_VERSION:"24",APP_DIR:"apps/example",APP_DOCKERFILE:"apps/example/Dockerfile"}});import{mkdir as Fo}from"fs/promises";var{$:Ha,file:be,write:qa}=globalThis.Bun;function Ho(e){return Uo.exec(e)?.[1]??null}function qo(e){return Wa.exec(e)?.[1]??null}function Ka(e,t){let n=[],o=t,s=[],i=()=>{let r=s.join(`
`).replace(/^(?:[ \t]*\n)+/,"").replace(/\s+$/,"");if(r)n.push({section:o,text:r});s=[]};for(let r of e.split(`
`)){let a=Ho(r);if(a){i(),o=a;continue}s.push(r)}return i(),n}function Ya(e){return e.split(`
`).some((t)=>Uo.test(t))}function za(e,t){let n=new Map;for(let r of t)for(let a of Ka(r,Wo)){let c=n.get(a.section)??[];c.push(a.text),n.set(a.section,c)}let o=new Set,s=new Set,i=[];for(let r of e.split(`
`)){let a=Ho(r);if(!a){i.push(r);continue}o.add(a);let c=n.get(a);if(c?.length)s.add(a),i.push(c.join(`

`))}for(let r of n.keys())if(!o.has(r))console.log(`\u26A0\uFE0F No "# SECTION: ${r}" in the CI skeleton \u2014 steps dropped`);return{rendered:i.join(`
`),filled:s}}function Qa(e,t){if(t.size===0)return e;let n=[],o=!1;for(let s of e.split(`
`)){let i=qo(s);if(i)o=t.has(i);else if(/^\S/.test(s))o=!1;if(!o)n.push(s)}return n.join(`
`)}function Za(e,t){let n=e.split(`
`),o=!1;for(let[s,i]of n.entries()){let r=qo(i);if(r)o=r===Ja;else if(/^\S/.test(i))o=!1;if(o&&/^ {4}needs: \[[^\]]*\]$/.test(i)){n[s]=`    needs: [${t.join(", ")}]`;break}}return n.join(`
`)}function Jo(){return new Set(X.map((e)=>e.dir))}function Mt(e){return Ge("ci",...e.split("/"))}function Xa(e,t){if(t==="ci.steps.yml")return e.startsWith("sections/");return(e.split("/").pop()??"")===t}async function ec(e,t){let n=[];for(let o of X){if(!t.has(o.dir))continue;for(let s of o.ciFiles??[]){if(!Xa(s,e))continue;n.push((await be(Mt(s)).text()).trimEnd())}}return n}async function tc(e,t){for(let n of X){if(!t.has(n.dir))continue;for(let o of n.ciFiles??[])if((o.split("/").pop()??"")===e)return Mt(o)}return null}async function nc(){let e=Mt("ci.bootstrap.yml");if(!await be(e).exists())return"";return(await be(e).text()).trimEnd()}async function oc(e,t){if(!t)return;let n=Io(X,t),o=await Po(e);return(s)=>{let{content:i}=Lo(s,n);return o?i.replaceAll(To,o):i}}async function sc(e,t,n,o={}){let s=o.enabled??Jo(),i=await tc(t,s);if(!i){console.log(`\u26A0\uFE0F Skipping ${t} \u2014 no enabled feature declares it`);return}let r=await be(i).text(),a=await ec(n,s),c=a.join(`

`),u;if(n==="ci.steps.yml"&&Ya(r)){let b=za(r.replaceAll("{{BOOTSTRAP}}",await nc()),a),m=new Set(Vo.filter((y)=>!b.filled.has(y))),C=[Wo,...Vo.filter((y)=>!m.has(y))];u=Za(Qa(b.rendered,m),C)}else u=r.replace("{{STEPS}}",`${c}
`).replace("{{UPDATES}}",`${c}
`);let p=u;for(let[b,m]of Object.entries(Bo))p=p.replaceAll(`{{${b}}}`,m);p=p.replace(/\n{3,}/g,`

`);let w;if(t==="dependabot.base.yml")w=`${e}/.github/dependabot.yml`;else w=`${e}/.github/workflows/${t.replace(".base.yml",".yml")}`;await qa(w,o.postProcess?o.postProcess(p):p),console.log(`\u2705 generated ${w}`)}async function rc(e,t,n,o){let s=t.outcome(n);if(s==="skip")return;if(s==="generate"){await sc(e,t.base,t.steps,o);return}if(!t.stale)return;let i=`${e}/${t.stale}`;if(!await be(i).exists())return;await Ha`rm -rf ${i}`.quiet();let r=t.reason?.(n);if(r)console.log(`\uD83D\uDDD1\uFE0F Removed ${i} (${r})`)}async function Ko(e,t={}){await Fo(`${e}/.github/workflows`,{recursive:!0}),await Fo(`${e}/.github`,{recursive:!0});let n=await No(e),o=t.enabled??(n?Oo(X,n):Jo()),s=t.postProcess??await oc(e,n),i=o.has("pages"),r=t.templateDocsSite??await be(`${e}/apps/template-docs/.vitepress/config.mts`).exists(),a={pages:i,coverage:o.has("coverage"),native:o.has("native"),dependabot:o.has("dependabot")||o.has("gh-actions"),stale:o.has("stale"),templateDocsSite:r,pagesDeploysToSite:i&&!r};for(let c of ic)await rc(e,c,a,{...t,enabled:o,postProcess:s})}var Uo,Wa,Wo="quality",Ja="gate",Vo,ic,gu;var Yo=f(async()=>{I();Do();Mo();Go();Uo=/^[ \t]*#[ \t]*SECTION:[ \t]*([A-Za-z0-9_-]+)[ \t]*$/,Wa=/^ {2}([A-Za-z0-9_-]+):$/;Vo=["coverage","security","native","e2e"];ic=[{base:"ci.base.yml",steps:"ci.steps.yml",outcome:()=>"generate"},{base:"release.base.yml",steps:"release.steps.yml",outcome:()=>"generate"},{base:"pages.base.yml",steps:"pages.steps.yml",outcome:(e)=>e.pagesDeploysToSite?"generate":"remove",stale:".github/workflows/pages.yml",reason:(e)=>e.templateDocsSite?"template docs site deploys Pages":"pages disabled"},{base:"coverage.base.yml",steps:"coverage.steps.yml",outcome:(e)=>{if(!e.coverage)return"skip";return e.pagesDeploysToSite||e.templateDocsSite?"remove":"generate"},stale:".github/workflows/coverage.yml",reason:(e)=>e.templateDocsSite?"coverage published by the docs site":"coverage included in pages.yml"},{base:"native.base.yml",steps:"native.steps.yml",outcome:(e)=>e.native?"generate":"remove",stale:".github/workflows/native.yml",reason:()=>"native disabled"},{base:"dependabot.base.yml",steps:"dependabot.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"dependabot-auto-merge.base.yml",steps:"dependabot-auto-merge.steps.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"stale.base.yml",steps:"stale.steps.yml",outcome:(e)=>e.stale?"generate":"remove",stale:".github/workflows/stale.yml"}];gu=process.argv[2]??"."});import{existsSync as zo}from"fs";import{cp as Qo,rm as Zo}from"fs/promises";var{spawnSync:ac}=globalThis.Bun;function Ne(e){return console.log(`
\u25B8 ${e.join(" ")}`),ac({cmd:e,stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}var Bt=".pages",Xo="apps/template-docs",le,Gt="coverage/html",cc,lc;var es=f(async()=>{k();await Yo();le=`${Xo}/dist`;cc=l({meta:{name:"m docs",version:"1.0.0",description:"Regenerate workflows from configs/* \u2014 static README/AGENTS with TEMPLATE-ONLY blocks"},args:{dir:{type:"string",description:"Target directory (default: .)",required:!1,default:"."}},subCommands:{site:l({meta:{name:"site",description:"Build one Pages artifact: docs + coverage report + demo app"},args:{"skip-coverage":{type:"boolean",description:"Reuse coverage/lcov.info instead of re-running the test suite",default:!1},"skip-app":{type:"boolean",description:"Skip building and copying the demo app to /example/",default:!1}},async run({args:e}){if(!e["skip-coverage"]){let n=Ne(["bun","run","coverage"]);if(n!==0)console.error(`::error::bun run coverage failed (exit ${n})`),process.exit(n)}Ne(["bun","run","m coverage","setup"]),Ne(["bun","run","m coverage","html"]);let t=Ne(["bun","run","docs:build"]);if(t!==0)console.error(`::error::${Xo} build failed (exit ${t})`),process.exit(t);if(zo(`${Gt}/index.html`))await Zo(`${le}/coverage`,{recursive:!0,force:!0}),await Qo(Gt,`${le}/coverage`,{recursive:!0}),console.log(`\u2705 Coverage report copied to ${le}/coverage`);else console.warn(`\u26A0\uFE0F ${Gt}/ not found \u2014 skipping /coverage/`);if(!e["skip-app"]){let n=Ne(["bun","run","m pages","build"]);if(n!==0)console.error(`::error::m pages build failed (exit ${n})`),process.exit(n);if(zo(Bt))await Zo(`${le}/example`,{recursive:!0,force:!0}),await Qo(Bt,`${le}/example`,{recursive:!0}),console.log(`\u2705 Pages artifact copied to ${le}/example`);else console.warn(`\u26A0\uFE0F ${Bt}/ not found \u2014 skipping /example/`)}if(console.log(`
\u2705 Site ready: ${le}`),console.log("   /            docs"),console.log("   /status      coverage, CI, versions"),console.log("   /coverage/   HTML coverage report"),!e["skip-app"])console.log("   /example/    demo app");process.exit(0)}})},async run({args:e}){await Ko(e.dir||".")}}),lc=cc});k();var pc={lint:()=>Promise.resolve().then(() => (on(),{})).then((e)=>$s),"lint:fix":()=>Promise.resolve().then(() => (sn(),{})).then((e)=>As),biome:()=>Promise.resolve().then(() => (rn(),{})).then((e)=>Es),typecheck:()=>Promise.resolve().then(() => (an(),{})).then((e)=>Os),turbo:()=>Promise.resolve().then(() => (cn(),{})).then((e)=>Ns),build:()=>Promise.resolve().then(() => (lt(),{})).then((e)=>Gs),health:()=>Promise.resolve().then(() => (pn(),{})).then((e)=>Fs),bun:()=>Promise.resolve().then(() => (gn(),{})).then((e)=>ei),test:()=>Promise.resolve().then(() => (fn(),{})).then((e)=>ti),coverage:()=>Promise.resolve().then(() => ($n(),{})).then((e)=>ki),changeset:()=>Promise.resolve().then(() => (ft(),{})).then((e)=>_i),commitlint:()=>Promise.resolve().then(() => (_n(),{})).then((e)=>Di),setup:()=>Promise.resolve().then(() => (In(),{})).then((e)=>Hi),ci:()=>Promise.resolve().then(() => (He(),{})).then((e)=>Xi),"ci:lint":()=>Promise.resolve().then(() => (Dn(),{})).then((e)=>er),"ci:local":()=>Promise.resolve().then(() => (jn(),{})).then((e)=>tr),gitleaks:()=>Promise.resolve().then(() => (Ln(),{})).then((e)=>ir),trivy:()=>Promise.resolve().then(() => (Bn(),{})).then((e)=>mr),codeql:()=>Promise.resolve().then(() => (Gn(),{})).then((e)=>dr),native:()=>Promise.resolve().then(() => (ao(),{})).then((e)=>sa),e2e:()=>Promise.resolve().then(() => (lo(),{})).then((e)=>aa),pages:()=>Promise.resolve().then(() => (fo(),{})).then((e)=>xa),skills:()=>Promise.resolve().then(() => (yo(),{})).then((e)=>Ia),badges:()=>Promise.resolve().then(() => (xo(),{})).then((e)=>Pa),docs:()=>es().then(() => ({})).then((e)=>lc)},uc=l({meta:{name:"m",version:"0.1.0",description:"Unified monorepo toolchain CLI"},subCommands:pc});at(uc);

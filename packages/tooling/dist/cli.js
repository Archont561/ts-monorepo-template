#!/usr/bin/env bun
// @bun
var ss=Object.create;var{getPrototypeOf:is,defineProperty:Ht,getOwnPropertyNames:rs}=Object;var qt=Object.prototype.hasOwnProperty;function as(e){return this[e]}var cs,ls,vc=(e,t,n)=>{var o=e!=null&&typeof e==="object";if(o){var s=t?cs??=new WeakMap:ls??=new WeakMap,i=s.get(e);if(i)return i}n=e!=null?ss(is(e)):{};let r=t||!e||!e.__esModule||!qt.call(e,"default")?Ht(n,"default",{value:e,enumerable:!0}):n;if(e&&typeof e==="object"||typeof e==="function"){for(let a of rs(e))if(!qt.call(r,a))Ht(r,a,{get:as.bind(e,a),enumerable:!0})}if(o)s.set(e,r);return r};var wc=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var f=(e,t,n)=>()=>{if(e)try{t=e(e=0)}catch(o){n=[o]}if(n)throw n[0];return t};function ms(e=""){if(ps.test(e))return;return e!==e.toLowerCase()}function Wt(e,t){let n=t??us,o=[];if(!e||typeof e!=="string")return o;let s="",i,r;for(let a of e){let c=n.includes(a);if(c===!0){o.push(s),s="",i=void 0;continue}let u=ms(a);if(r===!1){if(i===!1&&u===!0){o.push(s),s=a,i=u;continue}if(i===!0&&u===!1&&s.length>1){let p=s.at(-1);o.push(s.slice(0,Math.max(0,s.length-1))),s=p+a,i=u;continue}}s+=a,i=u,r=c}return o.push(s),o}function ds(e){return e?e[0].toUpperCase()+e.slice(1):""}function gs(e){return e?e[0].toLowerCase()+e.slice(1):""}function fs(e,t){return e?(Array.isArray(e)?e:Wt(e)).map((n)=>ds(t?.normalize?n.toLowerCase():n)).join(""):""}function he(e,t){return gs(fs(e||"",t))}function Ne(e,t){return e?(Array.isArray(e)?e:Wt(e)).map((n)=>n.toLowerCase()).join(t??"-"):""}function Jt(e){return Ne(e||"","_")}var ps,us;var Kt=f(()=>{ps=/\d/,us=["-","_","/","."]});import{parseArgs as hs}from"util";function be(e){if(Array.isArray(e))return e;return e===void 0?[]:[e]}function st(e,t=""){let n=[];for(let o of e)for(let[s,i]of o.entries())n[s]=Math.max(n[s]||0,i.length);return e.map((o)=>o.map((s,i)=>t+s[i===0?"padStart":"padEnd"](n[i])).join("  ")).join(`
`)}function _(e){return typeof e==="function"?e():e}function bs(e=[],t={}){let n=new Set(t.boolean||[]),o=new Set(t.string||[]),s=t.alias||{},i=t.default||{},r=new Map,a=new Map;for(let[d,h]of Object.entries(s)){let T=h;for(let B of T){if(r.set(d,B),!a.has(B))a.set(B,[]);if(a.get(B).push(d),r.set(B,d),!a.has(d))a.set(d,[]);a.get(d).push(B)}}let c={};function u(d){if(n.has(d))return"boolean";let h=a.get(d)||[];for(let T of h)if(n.has(T))return"boolean";return"string"}function p(d){if(o.has(d))return!0;let h=a.get(d)||[];for(let T of h)if(o.has(T))return!0;return!1}let w=new Set([...n,...o,...Object.keys(s),...Object.values(s).flat(),...Object.keys(i)]);for(let d of w)if(!c[d])c[d]={type:u(d),default:i[d]};for(let[d,h]of r.entries())if(d.length===1&&c[h]&&!c[h].short)c[h].short=d;let b=[],m={};for(let d=0;d<e.length;d++){let h=e[d];if(h==="--"){b.push(...e.slice(d));break}if(h.startsWith("--no-")){let T=h.slice(5);m[T]=!0;continue}b.push(h)}let C;try{C=hs({args:b,options:Object.keys(c).length>0?c:void 0,allowPositionals:!0,strict:!1})}catch{C={values:{},positionals:b}}let y={_:[]};y._=C.positionals;for(let[d,h]of Object.entries(C.values)){let T=h;if(u(d)==="boolean"&&typeof h==="string")T=h!=="false";else if(p(d)&&typeof h==="boolean")T="";y[d]=T}for(let[d]of Object.entries(m)){y[d]=!1;let h=r.get(d);if(h)y[h]=!1;let T=a.get(d);if(T)for(let B of T)y[B]=!1}for(let[d,h]of r.entries()){if(y[d]!==void 0&&y[h]===void 0)y[h]=y[d];if(y[h]!==void 0&&y[d]===void 0)y[d]=y[h];if(y[d]!==y[h]&&i[h]===y[h])y[h]=y[d]}return y}function vs(e,t){let n={boolean:[],string:[],alias:{},default:{}},o=Qt(t);for(let a of o){if(a.type==="positional")continue;if(a.type==="string"||a.type==="enum")n.string.push(a.name);else if(a.type==="boolean")n.boolean.push(a.name);if(a.default!==void 0)n.default[a.name]=a.default;if(a.alias)n.alias[a.name]=a.alias;let c=he(a.name),u=Ne(a.name);if(c!==a.name||u!==a.name){let p=be(n.alias[a.name]||[]);if(c!==a.name&&!p.includes(c))p.push(c);if(u!==a.name&&!p.includes(u))p.push(u);if(p.length>0)n.alias[a.name]=p}}let s=bs(e,n),[...i]=s._,r=new Proxy(s,{get(a,c){return a[c]??a[he(c)]??a[Ne(c)]}});for(let[,a]of o.entries())if(a.type==="positional"){let c=i.shift();if(c!==void 0)r[a.name]=c;else if(a.default===void 0&&a.required!==!1)throw new F(`Missing required positional argument: ${a.name.toUpperCase()}`,"EARG");else r[a.name]=a.default}else if(a.type==="enum"){let c=r[a.name],u=a.options||[];if(c!==void 0&&u.length>0&&!u.includes(c))throw new F(`Invalid value for argument: ${D(`--${a.name}`)} (${D(c)}). Expected one of: ${u.map((p)=>D(p)).join(", ")}.`,"EARG")}else if(a.required&&r[a.name]===void 0)throw new F(`Missing required argument: --${a.name}`,"EARG");return r}function Qt(e){let t=[];for(let[n,o]of Object.entries(e||{}))t.push({...o,name:n,alias:be(o.alias)});return t}async function ws(e){return Promise.all(e.map((t)=>_(t)))}function l(e){return e}async function H(e,t){let n=await _(e.args||{}),o=vs(t.rawArgs,n),s={rawArgs:t.rawArgs,args:o,data:t.data,cmd:e},i=await ws(e.plugins??[]),r,a;try{for(let p of i)await p.setup?.(s);if(typeof e.setup==="function")await e.setup(s);let u=await _(e.subCommands);if(u&&Object.keys(u).length>0){let p=Zt(t.rawArgs,n),w=t.rawArgs[p];if(w){let b=await at(u,w);if(!b)throw new F(`Unknown command ${D(w)}`,"E_UNKNOWN_COMMAND");await H(b,{rawArgs:t.rawArgs.slice(p+1)})}else{let b=await _(e.default);if(b){if(e.run)throw new F("Cannot specify both 'run' and 'default' on the same command.","E_DEFAULT_CONFLICT");let m=await at(u,b);if(!m)throw new F(`Default sub command ${D(b)} not found in subCommands.`,"E_UNKNOWN_COMMAND");await H(m,{rawArgs:t.rawArgs})}else if(!e.run)throw new F("No command specified.","E_NO_COMMAND")}}if(typeof e.run==="function")r=await e.run(s)}catch(u){a=u}let c=[];if(typeof e.cleanup==="function")try{await e.cleanup(s)}catch(u){c.push(u)}for(let u of[...i].reverse())try{await u.cleanup?.(s)}catch(p){c.push(p)}if(a)throw a;if(c.length===1)throw c[0];if(c.length>1)throw Error("Multiple cleanup errors",{cause:c});return{result:r}}async function rt(e,t,n){let o=await _(e.subCommands);if(o&&Object.keys(o).length>0){let s=Zt(t,await _(e.args||{})),i=t[s],r=await at(o,i);if(r)return rt(r,t.slice(s+1),e)}return[e,n]}async function at(e,t){if(t in e)return _(e[t]);for(let n of Object.values(e)){let o=await _(n),s=await _(o?.meta);if(s?.alias){if(be(s.alias).includes(t))return o}}}function Zt(e,t){for(let n=0;n<e.length;n++){let o=e[n];if(o==="--")return-1;if(o.startsWith("-")){if(!o.includes("=")&&ks(o,t))n++;continue}return n}return-1}function ks(e,t){let n=e.replace(/^-{1,2}/,""),o=he(n);for(let[s,i]of Object.entries(t)){if(i.type!=="string"&&i.type!=="enum")continue;if(o===he(s))return!0;if((Array.isArray(i.alias)?i.alias:i.alias?[i.alias]:[]).includes(n))return!0}return!1}async function Xt(e,t){try{console.log(await en(e,t)+`
`)}catch(n){console.error(n)}}async function en(e,t){let n=await _(e.meta||{}),o=Qt(await _(e.args||{})),s=await _(t?.meta||{}),i=`${s.name?`${s.name} `:""}`+(n.name||process.argv[1]),r=[],a=[],c=[],u=[];for(let m of o)if(m.type==="positional"){let C=m.name.toUpperCase(),y=m.required!==!1&&m.default===void 0;a.push([D(C+it(m)),zt(m,y)]),u.push(y?`<${C}>`:`[${C}]`)}else{let C=m.required===!0&&m.default===void 0,y=[...(m.alias||[]).map((d)=>`-${d}`),`--${m.name}`].join(", ")+it(m);if(r.push([D(y),zt(m,C)]),m.type==="boolean"&&(m.default===!0||m.negativeDescription)&&!xs.test(m.name)){let d=[...(m.alias||[]).map((h)=>`--no-${h}`),`--no-${m.name}`].join(", ");r.push([D(d),[m.negativeDescription,C?Le("(Required)"):""].filter(Boolean).join(" ")])}if(C)u.push(`--${m.name}`+it(m))}if(e.subCommands){let m=[],C=await _(e.subCommands);for(let[y,d]of Object.entries(C)){let h=await _((await _(d))?.meta);if(h?.hidden)continue;let T=be(h?.alias),B=[y,...T].join(", ");c.push([D(B),h?.description||""]),m.push(y,...T)}u.push(m.join("|"))}let p=[],w=n.version||s.version;p.push(Le(`${n.description} (${i+(w?` v${w}`:"")})`),"");let b=r.length>0||a.length>0;if(p.push(`${je(De("USAGE"))} ${D(`${i}${b?" [OPTIONS]":""} ${u.join(" ")}`)}`,""),a.length>0)p.push(je(De("ARGUMENTS")),""),p.push(st(a,"  ")),p.push("");if(r.length>0)p.push(je(De("OPTIONS")),""),p.push(st(r,"  ")),p.push("");if(c.length>0)p.push(je(De("COMMANDS")),""),p.push(st(c,"  ")),p.push("",`Use ${D(`${i} <command> --help`)} for more information about a command.`);return p.filter((m)=>typeof m==="string").join(`
`)}function it(e){let t=e.valueHint?`=<${e.valueHint}>`:"",n=t||`=<${Jt(e.name)}>`;if(!e.type||e.type==="positional"||e.type==="boolean")return t;if(e.type==="enum"&&e.options?.length)return`=<${e.options.join("|")}>`;return n}function zt(e,t){let n=t?Le("(Required)"):"",o=e.default===void 0?"":Le(`(Default: ${e.default})`);return[e.description,n,o].filter(Boolean).join(" ")}async function ct(e,t={}){let n=t.rawArgs||process.argv.slice(2),o=t.showUsage||Xt;try{let s=await Cs(e);if(s.help.length>0&&n.some((i)=>s.help.includes(i)))await o(...await rt(e,n)),process.exit(0);else if(n.length===1&&s.version.includes(n[0])){let i=typeof e.meta==="function"?await e.meta():await e.meta;if(!i?.version)throw new F("No version specified","E_NO_VERSION");console.log(i.version)}else await H(e,{rawArgs:n})}catch(s){if(s instanceof F)await o(...await rt(e,n)),console.error(s.message);else console.error(s,`
`);process.exit(1)}}async function Cs(e){let t=await _(e.args||{}),n=new Set,o=new Set;for(let[s,i]of Object.entries(t)){n.add(s);for(let r of be(i.alias))o.add(r)}return{help:Yt("help","h",n,o),version:Yt("version","v",n,o)}}function Yt(e,t,n,o){if(n.has(e)||o.has(e))return[];if(n.has(t)||o.has(t))return[`--${e}`];return[`--${e}`,`-${t}`]}var F,ys,Me=(e,t=39)=>(n)=>ys?n:`\x1B[${e}m${n}\x1B[${t}m`,De,D,Le,je,xs;var Be=f(()=>{Kt();F=class extends Error{code;constructor(e,t){super(e);this.name="CLIError",this.code=t}};ys=(()=>{let e=globalThis.process?.env??{};return e.NO_COLOR==="1"||e.TERM==="dumb"||e.TEST||e.CI})(),De=Me(1,22),D=Me(36),Le=Me(90),je=Me(4,24);xs=/^no[-A-Z]/});var{spawnSync:Ss}=globalThis.Bun;function g(e,t={}){return Ss({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}function I(e){return l({meta:{name:e.name,version:e.version??"1.0.0",description:e.description},subCommands:e.subCommands,args:{[e.argsName??"args"]:{type:"positional",description:e.argsDescription??"Extra args passed to underlying tool",required:!1}},run(){let t=v(e.name),n=e.configArgs??[],o=e.passthrough?[e.binPath,...t]:e.configArgsPlacement==="append"?[e.binPath,...t,...n]:[e.binPath,...n,...t];process.exit(g(o))}})}function U(e){let t=e.argsDescription?{args:{args:{type:"positional",description:e.argsDescription,required:!1}}}:{};return l({meta:{name:e.name,description:e.description},...t,run(){let n=v(e.name),o=n.length===0&&e.defaultArgs?e.defaultArgs:n;process.exit(e.spawn([...e.prefixArgs??[],...o]))}})}function v(e){let t=process.argv.slice(2),n=t.lastIndexOf(e);return n===-1?t:t.slice(n+1)}var k=f(()=>{Be();Be()});import{existsSync as tn,readFileSync as nn}from"fs";import{dirname as on,join as ce}from"path";function Z(e=import.meta.dir){let t=e;while(!0){let n=ce(t,"package.json");if(tn(n))try{if(JSON.parse(nn(n,"utf8")).name===$s)return t}catch{}let o=on(t);if(o===t)break;t=o}return e}function Ge(e=process.cwd()){let t=e;while(!0){let n=ce(t,"package.json");if(tn(n))try{if(JSON.parse(nn(n,"utf8")).workspaces)return t}catch{}let o=on(t);if(o===t)return e;t=o}}function X(){return ce(Z(),"src","configs")}function N(e){return ce(X(),e)}function Fe(...e){return ce(Z(),"src",...e)}function sn(){return ce(Z(),"skills")}var $s="@myorg/tooling",Rs="packages/tooling",Ic;var P=f(()=>{Ic=`${Rs}/src/configs`});var Ts,As;var rn=f(()=>{P();k();Ts=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),As=I({name:"lint",version:"1.0.0",description:"Lint and format check (Biome, shared config)",binPath:Ts,configArgs:["check",`--config-path=${X()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to check (default: whole repo)"})});var Es,_s;var an=f(()=>{P();k();Es=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),_s=I({name:"lint:fix",version:"1.0.0",description:"Lint and format, applying safe fixes (Biome, shared config)",binPath:Es,configArgs:["check","--write",`--config-path=${X()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to fix (default: whole repo)"})});var Os,Ps;var cn=f(()=>{P();k();Os=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),Ps=I({name:"biome",version:"1.0.0",description:"Biome with baked config path \u2014 lint and format, no root biome.json needed",binPath:Os,configArgs:[`--config-path=${X()}`],configArgsPlacement:"append",argsName:"command",argsDescription:"Biome command (check, lint, format, etc.)"})});var Is,Ns;var ln=f(()=>{k();Is=Bun.fileURLToPath(import.meta.resolve("typescript/package.json").replace("package.json","bin/tsc")),Ns=I({name:"typecheck",version:"1.0.0",description:"TypeScript wrapper \u2014 tsc owned by @myorg/tooling, use m typecheck not tsc",binPath:"bun",configArgs:[Is],argsName:"args",argsDescription:"tsc args"})});var Ds,js;var pn=f(()=>{P();k();Ds=Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));process.env.TURBO_GLOBAL_WARNING_DISABLED="1";js=I({name:"turbo",version:"1.0.0",description:"Turbo with baked root config \u2014 no root turbo.json needed, uses turbo.base.json",binPath:"bun",configArgs:[Ds,`--root-turbo-json=${N("turbo.base.json")}`],argsName:"task",argsDescription:"Turbo task (build, dev, test, typecheck, etc.)"})});import{existsSync as Ls,readFileSync as un}from"fs";var{Glob:Ms}=globalThis.Bun;function Bs(){try{let e=JSON.parse(un("package.json","utf8")),t=Array.isArray(e.workspaces)?e.workspaces.filter((n)=>typeof n==="string"):[];if(t.length>0)return t}catch{}return["packages/*","apps/*"]}function Gs(){let e=[];for(let t of Bs())for(let n of new Ms(`${t}/package.json`).scanSync("."))try{if(JSON.parse(un(n,"utf8")).private===!0)continue;let s=n.replace("/package.json","");if(Ls(`${s}/package.json`))e.push(s)}catch{}return e.sort()}var lt,Fs,Us,Vs;var pt=f(()=>{k();lt=l({meta:{name:"health",description:"publint + arethetypeswrong over every publishable package"},run(){let e=Gs();if(e.length===0)console.log("\u2139\uFE0F No publishable packages \u2014 skipping package health checks"),process.exit(0);console.log(`\uD83D\uDD28 Building before health checks (${e.length} package(s))`);let t=g(["bun","run","build"]);if(t!==0)console.error("::error::build failed, cannot run package health checks"),process.exit(t);let n=0;for(let o of e){if(console.log(`
\uD83D\uDCE6 ${o}`),g(["bunx","--yes","publint",o])!==0)console.error(`::error::publint failed for ${o}`),n++;if(g(["bunx","--yes","@arethetypeswrong/cli","--pack",".","--profile","esm-only"],{cwd:o})!==0)console.error(`::error::arethetypeswrong failed for ${o}`),n++}if(n>0)console.error(`
::error::${n} package health check(s) failed`),process.exit(1);console.log(`
\u2705 Package health OK (${e.length} package(s))`),process.exit(0)}}),Fs=Bun.fileURLToPath(import.meta.resolve("bunup/package.json").replace("package.json","dist/cli/index.js")),Us=I({name:"build",version:"1.0.0",description:"Bunup wrapper \u2014 bundler owned by @myorg/tooling, use m build not bunup",binPath:"bun",configArgs:[Fs],argsName:"entry",argsDescription:"Entry files or bunup args",subCommands:{health:lt}}),Vs=Us});var Hs;var mn=f(()=>{pt();Hs=lt});import{existsSync as dn,readdirSync as qs,rmSync as Ws}from"fs";var{which:Js}=globalThis.Bun;async function gn(){if(!Js("bun"))console.error("m bun coverage needs `bun` on PATH."),process.exit(1);console.log(`Running per-package coverage via turbo...
`),process.exit(g([...Ks,"coverage"]))}function fn(){let e=["apps","packages","configs"],t=0;for(let n of e){if(!dn(n))continue;for(let o of qs(n,{withFileTypes:!0})){if(!o.isDirectory())continue;let s=`${n}/${o.name}/node_modules`;if(!dn(s))continue;Ws(s,{recursive:!0,force:!0}),t++}}console.log(`\uD83E\uDDF9 Removed ${t} workspace node_modules dir(s) (root node_modules kept)`)}var ut,Ks,ee,zs,Ys,Qs,ye,Zs,Xs,ei,ti,ni,oi;var hn=f(()=>{P();k();ut=N("bunfig.toml"),Ks=["bun",`${Z()}/src/cli.ts`,"turbo"];ee=v("bun"),zs=["coverage","test","clean:modules"],Ys=ee.includes("--help")||ee.includes("-h"),Qs=ee.includes("--version")||ee.includes("-v"),ye=ee[0],Zs=process.argv.slice(2).includes("bun");if(Zs&&ye&&!zs.includes(ye)&&!ye.startsWith("-")&&!Ys&&!Qs){let e=ye==="test"?["bun",ye,`--config=${ut}`,...ee.slice(1)]:["bun",...ee];process.exit(g(e))}Xs=l({meta:{name:"coverage",description:"Run per-package coverage via turbo then merge LCOV"},run:async()=>{await gn()}}),ei=l({meta:{name:"clean:modules",description:"Remove workspace node_modules dirs (keeps the root one)"},run(){fn(),process.exit(0)}}),ti=l({meta:{name:"test",description:"Run bun test with shared bunfig.toml config"},run(){let e=v("test");process.exit(g(["bun","test",`--config=${ut}`,...e]))}}),ni=l({meta:{name:"bun",version:"1.0.0",description:"Bun wrapper \u2014 injects shared bunfig.toml for test, provides coverage merging"},subCommands:{coverage:Xs,test:ti,"clean:modules":ei},async run(){let e=v("bun"),t=e[0];if(t==="coverage"){await gn();return}if(t==="clean:modules")fn(),process.exit(0);let n=t==="test"?["bun",t,`--config=${ut}`,...e.slice(1)]:["bun",...e];process.exit(g(n))}}),oi=ni});var si;var bn=f(()=>{P();k();si=l({meta:{name:"test",description:"Run bun test with the shared bunfig.toml config"},args:{args:{type:"positional",description:"Extra args for bun test",required:!1}},run(){let e=process.argv.slice(2),t=e.lastIndexOf("test"),n=t===-1?[]:e.slice(t+1);process.exit(g(["bun","test",`--config=${N("bunfig.toml")}`,...n]))}})});var S="coverage/lcov.info",le="coverage/rust-lcov.info",q="coverage/html",ve=80;var yn=()=>{};import{existsSync as j,mkdirSync as wn,readdirSync as ii,readFileSync as kn,renameSync as mt,writeFileSync as ri}from"fs";import{dirname as ai,join as vn}from"path";var{which:ci}=globalThis.Bun;function W(e){return Boolean(ci(e))}function Ue(e=S){if(!j(e))return null;let t=0,n=0;for(let o of kn(e,"utf8").split(`
`))if(o.startsWith("LF:"))n+=Number(o.slice(3));else if(o.startsWith("LH:"))t+=Number(o.slice(3));if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function pi(e){let t=0,n=0;for(let o of e){let s=Ue(o);if(!s)continue;t+=s.hit,n+=s.found}if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function Cn(){return`{${[...xn].join(",")}}/*/coverage/lcov.info`}function Sn(e="."){let t=new Bun.Glob(Cn());return Array.from(t.scanSync({cwd:e})).filter(Boolean).map((n)=>e==="."?n:`${e}/${n}`).sort()}function ui(e,t){return e>=t}function mi(e="."){let t=[];for(let n of[...xn]){let o=vn(e,n);if(!j(o))continue;for(let s of ii(o,{withFileTypes:!0})){if(!s.isDirectory())continue;let i=vn(o,s.name,"package.json");if(!j(i))continue;let r;try{r=JSON.parse(kn(i,"utf8"))}catch{continue}if(!r.name||!(r.scripts?.test||r.scripts?.coverage))continue;t.push({name:r.name.replace(/^@[^/]+\//,""),dir:`${n}/${s.name}`})}}return t.sort((n,o)=>n.dir.localeCompare(o.dir))}function di(e,t){let n=["# Generated by `m coverage sync` (packages/tooling) \u2014 do not edit.","# Refreshed on every `bun install` (prepare) and by `bun run docs:sync`.","codecov:","  require_ci_to_pass: true","  notify:","    wait_for_ci: true","","coverage:","  precision: 2","  round: down",'  range: "70...100"',"  status:","    # Overall monorepo gate \u2014 mirrors COVERAGE_THRESHOLD.","    project:","      default:",`        target: ${t}%`,"        threshold: 1%","    # Patch coverage on PRs.","    patch:","      default:",`        target: ${t}%`,"        threshold: 5%","","flag_management:","  default_rules:","    carryforward: true","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 1%","","component_management:","  default_rules:","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 2%","  individual_components:"];for(let o of e)n.push(`    - component_id: ${o.name}`,`      name: ${o.dir}`,"      paths:",`        - "${o.dir}/**"`);return n.push("","comment:",'  layout: "reach,diff,flags,components,tree"',"  behavior: default","  require_changes: true","  show_carryforward_flags: true",""),n.join(`
`)}function gi(e,t){let n=(o)=>o?`${o.percent.toFixed(2)}% (${o.hit}/${o.found})`:"\u2014";return["## \uD83D\uDCCA Coverage Summary","","| Package | Lines |","|---------|-------|",...e.map((o)=>`| \`${o.dir}\` | ${n(o.totals)} |`),...t?[`| **merged** | **${n(t)}** |`]:[],""].join(`
`)}function $n(){if(W("lcov")&&W("genhtml")){console.log("\u2705 lcov already installed");return}let e=1;if(process.platform==="darwin")e=g(["brew","install","lcov"]);else{let t=W("sudo")?["sudo","apt-get"]:["apt-get"];e=g([...t,"update"])===0?g([...t,"install","-y","lcov"]):1}if(e===0)console.log("\u2705 lcov installed");else console.warn("\u26A0\uFE0F lcov install failed \u2014 HTML reports will be skipped (threshold check still runs)")}function Rn(e=q){if(!j(S)){console.warn(`\u26A0\uFE0F ${S} not found \u2014 skipping HTML report`);return}if(!W("genhtml")){console.warn("\u26A0\uFE0F genhtml not found \u2014 run `m coverage setup` first (HTML report skipped)");return}wn(e,{recursive:!0});let t=g(["genhtml",S,"--output-directory",e,"--title","Coverage Report","--show-details","--highlight","--legend"]);if(t===0)console.log(`
\u2705 HTML report: ${e}/index.html`);process.exit(t)}var li,xn,fi,hi,bi,yi,vi,wi,ki,xi,Ci,Si;var Tn=f(()=>{k();yn();li=`${q}/index.html`;xn=["packages","apps"];fi=l({meta:{name:"setup",description:"Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)"},run(){$n(),process.exit(0)}}),hi=l({meta:{name:"html",description:"Generate HTML report via genhtml from coverage/lcov.info"},args:{out:{type:"string",description:`Output directory (default: ${q})`,default:q}},run({args:e}){Rn(e.out||q),process.exit(0)}}),bi=l({meta:{name:"check",description:`Check coverage threshold (default ${ve}%) against coverage/lcov.info`},args:{threshold:{type:"string",description:"Threshold percent",default:String(ve)}},run({args:e}){let t=Ue();if(!t){console.warn(`\u26A0\uFE0F ${S} not found or has no line data \u2014 skipping threshold check`);return}let n=Number(e.threshold??ve),o=t.percent;if(console.log(`Line coverage: ${o.toFixed(2)}% (${t.hit}/${t.found} lines) \u2014 threshold ${n}%`),!ui(o,n))console.error(`::error::Coverage ${o.toFixed(2)}% is below ${n}% threshold`),process.exit(1);console.log(`\u2705 Coverage ${o.toFixed(2)}% meets threshold`),process.exit(0)}}),yi=l({meta:{name:"collect",description:"Collect JS coverage (bun run coverage) + Rust coverage (m native llvm-cov), then merge"},run(){if(g(["bun","run","coverage"]),!j("packages/native/Cargo.toml")||!W("cargo-llvm-cov"))console.warn("\u26A0\uFE0F cargo-llvm-cov not installed \u2014 skipping Rust coverage"),process.exit(0);if(console.log("\uD83E\uDD80 Collecting Rust coverage via m native llvm-cov"),g(["m native","llvm-cov","--lcov","--output-path",`../../${le}`]),!j(le))process.exit(0);if(!j(S))mt(le,S),process.exit(0);if(W("lcov")){if(g(["lcov","--add-tracefile",S,"--add-tracefile",le,"--output-file","coverage/merged.lcov"])===0)mt("coverage/merged.lcov",S),console.log("\u2705 Merged Rust + JS coverage"),process.exit(0)}console.warn(`\u26A0\uFE0F lcov not available \u2014 Rust coverage kept at ${le}`)}}),vi=l({meta:{name:"pages",description:"Publish the HTML report into the Pages artifact dir (served at /coverage/)"},async run(){if(!j(S))console.log("\u2139\uFE0F No coverage data \u2014 collecting first"),g(["bun","run","coverage"]);if(!j(S))console.warn("\u26A0\uFE0F Still no coverage/lcov.info \u2014 skipping Pages coverage"),process.exit(0);if($n(),Rn(),!j(li))console.warn(`\u26A0\uFE0F No HTML report at ${q} \u2014 skipping Pages coverage`),process.exit(0);console.log(`\u2705 Coverage HTML ready at ${q}/ \u2014 \`m pages build\` folds it into the Pages artifact (served at /coverage/)`),process.exit(0)}}),wi=l({meta:{name:"merge",description:"Merge per-package lcov.info reports into coverage/lcov.info"},args:{output:{type:"string",description:"Merged output file (default: coverage/lcov.info)",default:S},reportOnly:{type:"boolean",description:"Print the merged totals and the delta, write nothing",default:!1}},run({args:e}){let t=Sn(".");if(t.length===0)console.warn("No per-package lcov.info found \u2014 nothing to merge"),process.exit(0);let n=e.output||S;if(e.reportOnly){let r=pi(t),a=r?`${r.percent.toFixed(2)}% (${r.hit}/${r.found} lines)`:"no data";console.log("Report-only: the merge would measure"),console.log(`  ${t.length} report(s) \u2192 ${a}`),process.exit(0)}wn(ai(n),{recursive:!0}),console.log(`Merging ${t.length} report(s) \u2192 ${n}`);let o=null;try{o=Bun.fileURLToPath(import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"))}catch{o=null}if(o){if(g(["bun",o,Cn(),n,"--prepend-source-files"])===0)console.log(`\u2705 Merged: ${n}`),process.exit(0);console.warn("\u26A0\uFE0F lcov-result-merger failed \u2014 falling back to lcov --add-tracefile")}if(!W("lcov"))console.error("\u274C lcov not found \u2014 run `m coverage setup` first"),process.exit(1);let s="coverage/merged.lcov",i=t.flatMap((r)=>["--add-tracefile",r]).concat(["--output-file",s]);if(g(["lcov",...i])!==0)console.error("\u274C Coverage merge failed"),process.exit(1);mt(s,n),console.log(`\u2705 Merged: ${n}`),process.exit(0)}}),ki=l({meta:{name:"summary",description:"Show coverage summary (--json for scripts, --markdown for step summaries)"},args:{json:{type:"boolean",description:"Print JSON instead of a human-readable line"},markdown:{type:"boolean",description:"Print a per-package markdown table (for $GITHUB_STEP_SUMMARY)"}},run({args:e}){let t=Ue();if(e.markdown){let n=Sn(".").map((o)=>({dir:o.replace(/\/coverage\/lcov\.info$/,""),totals:Ue(o)}));console.log(gi(n,t)),process.exit(0)}if(e.json)console.log(JSON.stringify({source:S,available:Boolean(t),lines:{hit:t?.hit??0,found:t?.found??0,percent:t?Number(t.percent.toFixed(2)):0}})),process.exit(0);if(W("lcov")&&j(S))process.exit(g(["lcov","--summary",S]));if(!t)console.warn(`\u26A0\uFE0F ${S} not found`),process.exit(0);console.log(`lines: ${t.percent.toFixed(1)}% (${t.hit}/${t.found})`),process.exit(0)}}),xi=l({meta:{name:"sync",description:"Regenerate the root codecov.yml from the workspace package list"},args:{output:{type:"string",description:"Output file (default: codecov.yml)",default:"codecov.yml"}},run({args:e}){let t=e.output||"codecov.yml",n=mi(".");ri(t,di(n,ve)),console.log(`\u2705 ${t} \u2014 ${n.length} component(s): ${n.map((o)=>o.dir).join(", ")}`),process.exit(0)}}),Ci=l({meta:{name:"m coverage",version:"1.0.0",description:"Coverage reporting \u2014 collect, merge, HTML, threshold check, Codecov, Pages publishing"},subCommands:{setup:fi,collect:yi,html:hi,check:bi,pages:vi,merge:wi,summary:ki,sync:xi},run(){console.log(`
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
`)}}),Si=Ci});import{mkdir as $i}from"fs/promises";var{file:dt,write:Ri}=globalThis.Bun;async function ft(e="changeset"){if(e!=="changeset")throw Error(`Unknown init target '${e}' (expected "changeset")`);let t=".changeset/config.json",n=N("changeset.config.json");if(await dt(t).exists()){console.log("Changeset config already exists; skipping.");return}if(!await dt(n).exists())return;await $i(".changeset",{recursive:!0}),await Ri(t,await dt(n).text())}var An,pe,Ti,gt,Ai,Ei,_i,Oi,Pi,Ii;var ht=f(()=>{P();k();An=Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js")),pe=v("changeset"),Ti=["init"],gt=pe[0],Ai=pe.includes("--help")||pe.includes("-h"),Ei=pe.includes("--version")||pe.includes("-v"),_i=process.argv.slice(2).includes("changeset");if(_i&&gt&&!Ti.includes(gt)&&!gt.startsWith("-")&&!Ai&&!Ei)process.exit(g(["bun",An,...pe]));Oi=l({meta:{name:"init",description:"Ensure .changeset/config.json exists from shared template"},args:{target:{type:"positional",description:"Init target (default: changeset)",required:!1,default:"changeset"}},async run({args:e}){await ft(e.target??"changeset"),process.exit(0)}}),Pi=l({meta:{name:"changeset",version:"1.0.0",description:"Changesets wrapper \u2014 init config and delegate to @changesets/cli"},subCommands:{init:Oi},run(){process.exit(g(["bun",An,...v("changeset")]))}}),Ii=Pi});import{readdir as Ni}from"fs/promises";import{join as Di}from"path";var{$:En,write:ji}=globalThis.Bun;async function bt(e="lefthook"){if(e!=="lefthook")throw Error(`Unknown setup target '${e}' (expected "lefthook")`);await ji("lefthook.yml",`extends:
  - ${"node_modules/@myorg/tooling/src/configs/lefthook.base.yml"}
`);let n=await En`bunx lefthook install`.quiet().nothrow();if(n.exitCode!==0){let s=n.stderr.toString().trim();if(console.warn("\u26A0\uFE0F lefthook install failed \u2014 Git hooks are not active."),s)console.warn(`   ${s.split(`
`).join(`
   `)}`);console.warn("   Re-run manually with: m setup lefthook");return}let o=await Li();if(o.length===0){console.warn("\u26A0\uFE0F lefthook installed no hooks \u2014 is this a Git repository?");return}console.log(`\u2705 lefthook hooks active: ${o.join(", ")}`)}async function Li(){let e;try{e=await Ni(Di(await Mi(),"hooks"))}catch{return[]}return e.filter((t)=>!t.endsWith(".sample")&&!t.endsWith(".old")).sort()}async function Mi(){let e=await En`git rev-parse --git-dir`.quiet().nothrow();if(e.exitCode!==0)return".git";return e.stdout.toString().trim()||".git"}var Bi,Gi,Fi,Ui;var _n=f(()=>{k();Bi=l({meta:{name:"lefthook",description:"Regenerate lefthook.yml wrapper and install Git hooks"},args:{target:{type:"positional",description:"Setup target (default: lefthook)",required:!1,default:"lefthook"}},async run({args:e}){await bt(e.target??"lefthook")}}),Gi=l({meta:{name:"bins",description:"Link m-bins into node_modules/.bin (handled by bun install)"},run(){console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.")}}),Fi=l({meta:{name:"setup",version:"1.0.0",description:"Setup CLI \u2014 regenerates lefthook.yml, installs hooks, ensures changeset config"},subCommands:{lefthook:Bi,bins:Gi},args:{target:{type:"positional",description:"Target (lefthook, bins, or empty for full setup)",required:!1}},async run({args:e}){let t=v("setup"),n=e.target??t[0]??"lefthook";if(n==="lefthook"){await bt("lefthook");return}if(n==="bins")return;await bt("lefthook");await Promise.resolve().then(() => ht());await ft("changeset").catch(()=>{})}}),Ui=Fi});function On(e){return Bun.which(e)}function Pn(e){return On(ue[e].bin)!==null}function we(e){console.warn(`\u26A0\uFE0F  ${e.label} not found \u2014 skipping ${e.purpose}.`),console.warn("   Install it to enable this step:");for(let t of e.install)console.warn(`     ${t}`);return console.warn("   Continuing: this step is optional locally and CI installs it."),0}function J(e,t){let n=ue[e],o=On(n.bin);if(!o)return we(n);return t(o)}var ue;var ke=f(()=>{ue={actionlint:{bin:"actionlint",label:"actionlint",purpose:"local GitHub Actions workflow validation",install:["brew install actionlint","go install github.com/rhysd/actionlint/cmd/actionlint@latest","bun install --force          # retries the github-actionlint download"]},act:{bin:"act",label:"act",purpose:"running GitHub Actions workflows locally",install:["brew install act","sudo apt install act","go install github.com/nektos/act@latest"]},gitleaks:{bin:"gitleaks",label:"gitleaks",purpose:"secret scanning",install:["brew install gitleaks","https://github.com/gitleaks/gitleaks#installing"]},trivy:{bin:"trivy",label:"trivy",purpose:"vulnerability scanning",install:["brew install trivy","https://trivy.dev/latest/getting-started/installation/"]},cargo:{bin:"cargo",label:"Rust toolchain (cargo)",purpose:"native Rust workspace tasks",install:["rustup \u2014 https://rustup.rs"]},lcov:{bin:"lcov",label:"lcov",purpose:"merging coverage reports",install:["bun run m coverage setup"]},genhtml:{bin:"genhtml",label:"genhtml",purpose:"rendering the HTML coverage report",install:["bun run m coverage setup"]}}});import{existsSync as In}from"fs";import{homedir as Vi}from"os";import{join as Nn}from"path";function Wi(){try{let e=Bun.fileURLToPath(import.meta.resolve("github-actionlint/package.json"));return Bun.file(e).json().version??null}catch{return null}}function Ji(){let e=process.env.ACTIONLINT_BIN;if(e&&In(e))return e;let t=Bun.which("actionlint");if(t)return t;let n=process.env.ACTIONLINT_CACHE_DIR??Nn(Vi(),".github-actionlint","bin"),o=Wi();if(o){let s=Nn(n,o,process.platform==="win32"?"actionlint.exe":"actionlint");if(In(s))return s}return null}function yt(e){let t=e.includes("--if-installed"),n=e.filter((s)=>s!=="--if-installed"),o=Ji();if(!o){if(t)return we(ue.actionlint);return console.error(qi),1}return g([o,`-config-file=${N("actionlint.yaml")}`,...n])}function Ve(e){return J("act",(t)=>g([t,...Hi,...e]))}var Hi,qi=`
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
`,Ki,zi,Yi,Qi;var He=f(()=>{P();k();ke();Hi=["-P","ubuntu-latest=catthehacker/ubuntu:act-latest","--container-architecture","linux/amd64"];Ki=U({name:"lint",description:"Validate workflows via actionlint with shared config",argsDescription:"Extra args for actionlint",spawn:yt}),zi=U({name:"act",description:"Run GitHub Actions locally via act with baked-in flags",argsDescription:"Extra args for act",spawn:Ve}),Yi=l({meta:{name:"ci",version:"1.0.0",description:"CI tooling for GitHub Actions \u2014 lint workflows and run locally with act"},subCommands:{lint:Ki,act:zi},run(){let e=v("ci");if(e.length>0&&e[0]?.startsWith("-"))Ve(e);else console.log(`
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
`)}}),Qi=Yi});var Zi;var Dn=f(()=>{k();He();Zi=l({meta:{name:"ci:lint",description:"Validate workflows via actionlint with shared config"},args:{args:{type:"positional",description:"Extra args for actionlint",required:!1}},run(){process.exit(yt(v("ci:lint")))}})});var Xi;var jn=f(()=>{k();He();Xi=l({meta:{name:"ci:local",description:"Run the push workflow locally via act"},args:{args:{type:"positional",description:"Extra args for act",required:!1}},run(){process.exit(Ve(["push",...v("ci:local")]))}})});function vt(e){return J("gitleaks",(t)=>g([t,...e]))}var er,tr,nr,or;var Ln=f(()=>{k();ke();er=U({name:"detect",description:"gitleaks detect --source . --no-git (scan repo)",prefixArgs:["detect"],defaultArgs:["--source",".","--no-git","--verbose"],spawn:vt}),tr=U({name:"protect",description:"gitleaks protect --staged (scan staged changes, pre-commit)",prefixArgs:["protect"],defaultArgs:["--staged","--verbose"],spawn:vt}),nr=l({meta:{name:"gitleaks",version:"1.0.0",description:"Gitleaks wrapper \u2014 secret scanning, defensive (skips if binary missing)"},subCommands:{detect:er,protect:tr},run(){let e=v("gitleaks");if(e.length===0)console.log(`
m gitleaks \u2014 secret scanning wrapper

Usage:
  m gitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  m gitleaks protect [args]  # scan staged (default: --staged --verbose)

Install:
  brew install gitleaks
  go install github.com/gitleaks/gitleaks/v8@latest
  docker pull zricethezav/gitleaks:latest

If gitleaks is not installed, this wrapper warns and exits 0 (does not block).
`),process.exit(0);process.exit(vt(e))}}),or=nr});import{existsSync as sr}from"fs";var{which:ir}=globalThis.Bun;function kt(e){return J("trivy",(t)=>g([t,...e]))}var wt="apps/example/Dockerfile",Mn="app:trivy-scan",rr,ar,cr,lr,pr;var Bn=f(()=>{k();ke();rr=l({meta:{name:"build",description:`docker build -t ${Mn} (image for the trivy image scan)`},run(){if(!sr(wt))console.warn(`\u26A0\uFE0F ${wt} not found \u2014 skipping image build`),process.exit(0);if(!ir("docker"))console.warn("\u26A0\uFE0F docker not found \u2014 skipping image build"),process.exit(0);if(g(["docker","build","-t",Mn,"-f",wt,"."])!==0)console.warn("\u26A0\uFE0F image build failed \u2014 skipping the Trivy image scan");process.exit(0)}}),ar=U({name:"fs",description:"trivy fs . --severity HIGH,CRITICAL (filesystem scan)",prefixArgs:["fs"],defaultArgs:[".","--severity","HIGH,CRITICAL"],spawn:kt}),cr=U({name:"image",description:"trivy image <image> --severity HIGH,CRITICAL (container scan)",prefixArgs:["image"],spawn:kt}),lr=l({meta:{name:"trivy",version:"1.0.0",description:"Trivy wrapper \u2014 vuln scanning, defensive (skips if binary missing)"},subCommands:{fs:ar,image:cr,build:rr},run(){let e=v("trivy");if(e.length===0)console.log(`
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
`),process.exit(0);process.exit(kt(e))}}),pr=lr});var ur;var Gn=f(()=>{k();ur=l({meta:{name:"codeql",version:"1.0.0",description:"CodeQL wrapper \u2014 info and local guidance (CodeQL runs in GitHub Actions)"},run(){console.log(`
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
`)}})});function A(e,t){let n=t;while(n<e.length&&/\s/.test(e[n]))n++;return n}function Un(e,t){return e.lastIndexOf(`
`,t)+1}function xe(e,t){let n=/^[ \t]*/.exec(e.slice(Un(e,t),t));return n?n[0]:""}function qe(e,t){let n=t+1;while(n<e.length){if(e[n]==="\\"){n+=2;continue}if(e[n]==='"')return n+1;n++}return-1}function te(e,t){let n=e[t];if(n==='"')return qe(e,t);if(n==="{"||n==="["){let s=0,i=t;while(i<e.length){let r=e[i];if(r==='"'){i=qe(e,i);continue}if(r==="{"||r==="[")s++;else if(r==="}"||r==="]"){if(s--,s===0)return i+1}i++}return-1}let o=t;while(o<e.length&&!/[\s,\]}]/.test(e[o]))o++;return o}function Vn(e){let t=A(e,0);return e[t]==="{"?t:-1}function Ce(e,t,n){let o=A(e,t+1);while(o<e.length&&e[o]!=="}"){if(e[o]!=='"')return null;let s=qe(e,o);if(s===-1)return null;let i=A(e,s);if(e[i]!==":")return null;let r=A(e,i+1),a=te(e,r);if(a===-1)return null;if(e.slice(o,s)===JSON.stringify(n))return{keyStart:o,valueStart:r,valueEnd:a};if(o=A(e,a),e[o]===",")o=A(e,o+1);else return null}return null}function Hn(e,t,n){let o=Un(e,t);if(e.slice(o,t).trim()!==""){let r=/^[ \t]*,[ \t]*/.exec(e.slice(n));if(r)return e.slice(0,t)+e.slice(n+r[0].length);let a=e.slice(0,t).replace(/[ \t]*,[ \t]*$/,"");return a===e.slice(0,t)?e.slice(0,t)+e.slice(n):`${a}${e.slice(n)}`}let s=/^[ \t]*,[ \t]*\r?\n?/.exec(e.slice(n));if(s)return e.slice(0,o)+e.slice(n+s[0].length);let i=e.slice(0,o).replace(/[ \t]*\n$/,"");if(i.endsWith(","))return`${i.slice(0,-1)}${e.slice(n)}`;return e.slice(0,o)+e.slice(n)}function St(e){return/\n([ \t]+)\S/.exec(e)?.[1]??"  "}function xt(e,t,n){let o=e.split(`
`);if(o.length===1)return e;let i=o.slice(1,-1).filter((a)=>a.trim()!=="").reduce((a,c)=>Math.min(a,/^[ \t]*/.exec(c)[0].length),Number.POSITIVE_INFINITY),r=Number.isFinite(i)?i:0;return[o[0],...o.slice(1,-1).map((a)=>a.trim()===""?"":t+n+a.slice(r)),`${t}${o.at(-1).trim()}`].join(`
`)}function Fn(e,t,n,o){let s=St(e),i=te(e,t)-1,r=xe(e,i),a=A(e,t+1);if(a===i){let b=`${r}${s}`,m=xt(o,b,s);return`${e.slice(0,i)}
${b}${JSON.stringify(n)}: ${m}
${r}${e.slice(i)}`}let c=xe(e,a),u=a,p=a;while(p<i){let b=qe(e,p),m=A(e,b);if(u=te(e,A(e,m+1)),p=A(e,u),e[p]===",")p=A(e,p+1);else break}let w=xt(o,c,s);return`${e.slice(0,u)},
${c}${JSON.stringify(n)}: ${w}${e.slice(u)}`}function qn(e,t){let[n,...o]=e,s=o.length===0?t:qn(o,t);return`{
  ${JSON.stringify(n)}: ${s}
}`}function mr(e,t,n){let o=xt(n,xe(e,t.valueStart),St(e));return e.slice(0,t.valueStart)+o+e.slice(t.valueEnd)}function $t(e,t,n){let o=t.at(-1);if(o===void 0)return e;let s=We(e,t.slice(0,-1));if(s===-1){let[r,...a]=t,c=Vn(e);if(r===void 0||c===-1)return e;return Fn(e,c,r,qn(a,n))}let i=Ce(e,s,o);return i?mr(e,i,n):Fn(e,s,o,n)}function We(e,t){let n=Vn(e);for(let o of t){if(n===-1)return-1;let s=Ce(e,n,o);if(!s||e[s.valueStart]!=="{")return-1;n=s.valueStart}return n}function Wn(e,t,n){return $t(e,t.split("."),JSON.stringify(n))}function np(e,t,n){return $t(e,t.split("."),n.trim())}function Jn(e,t){let n=t.split("."),o=We(e,n.slice(0,-1));if(o===-1)return e;let s=Ce(e,o,n.at(-1));return s?Hn(e,s.keyStart,s.valueEnd):e}function Kn(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=We(e,s.slice(0,-1));if(i===-1)return e;let r=Ce(e,i,s.at(-1));if(!r)return $t(e,s,`[${o}]`);if(e[r.valueStart]!=="[")return e;let a=te(e,r.valueStart)-1,c=A(e,r.valueStart+1);if(c===a){if(!e.slice(r.valueStart,a).includes(`
`))return`${e.slice(0,a)}${o}${e.slice(a)}`;let m=xe(e,a);return`${e.slice(0,a)}${m}${St(e)}${o}
${m}${e.slice(a)}`}let u=c,p=c;while(c<a)if(u=c,p=te(e,c),c=A(e,p),e[c]===",")c=A(e,c+1);else break;let b=!e.slice(r.valueStart,a).includes(`
`)?", ":`,
${xe(e,u)}`;return`${e.slice(0,p)}${b}${o}${e.slice(p)}`}function op(e,t,n){let o=JSON.stringify(n),s=t.split("."),i=We(e,s.slice(0,-1));if(i===-1)return e;let r=Ce(e,i,s.at(-1));if(!r||e[r.valueStart]!=="[")return e;let a=te(e,r.valueStart)-1,c=A(e,r.valueStart+1);while(c<a){let u=te(e,c);if(e.slice(c,u)===o)return Hn(e,c,u);if(c=A(e,u),e[c]===",")c=A(e,c+1)}return e}function Rt(e){return JSON.parse(e)}async function Tt(e,t){let n=Bun.file(e);if(!await n.exists())return!1;let o=await n.text(),s=await t(o);if(s===o)return!1;return await Bun.write(e,s),!0}var Je="@myorg",R="packages/native",zn="crates",K="npm",Se=(e)=>`packages/native/crates/${e}`,V=(e)=>`packages/native/npm/${e}`,$e="wasm32-wasip1-threads",At,Ke;var ze=f(()=>{At=[{target:"aarch64-apple-darwin",runner:"macos-latest"},{target:"x86_64-apple-darwin",runner:"macos-13"},{target:"x86_64-pc-windows-msvc",runner:"windows-latest"},{target:"x86_64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"aarch64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64"},{target:"x86_64-unknown-linux-musl",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-alpine"},{target:"wasm32-wasip1-threads",runner:"ubuntu-latest",wasi:!0}],Ke=At.map((e)=>e.target)});import{existsSync as ne,readdirSync as dr,readFileSync as Et}from"fs";import{dirname as gr,join as z,resolve as Yn}from"path";function Qn(e=process.cwd()){let t=Yn(e);for(let n=0;n<32;n++){if(ne(z(t,"packages","native","Cargo.toml")))return t;let o=gr(t);if(o===t)break;t=o}return Yn(e)}function Zn(e){if(!ne(e))return[];return dr(e,{withFileTypes:!0}).filter((t)=>t.isDirectory()).map((t)=>t.name).sort()}function Re(e){let t=z(e,"packages","native",zn),n=z(e,"packages","native","Cargo.toml"),o=ne(n)?Et(n,"utf8"):"",s=new Set([...o.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm)].map((r)=>r[1]??"")),i=[];for(let r of Zn(t)){let a=z(t,r,"Cargo.toml");if(!ne(a))continue;let c=Et(a,"utf8"),u=[...c.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm),...c.matchAll(/^\s*([\w-]+)\.workspace\s*=\s*true/gm)].map((p)=>p[1]??"").filter((p)=>s.has(p)||ne(z(t,p,"Cargo.toml")));i.push({name:r,dir:Se(r),binding:/crate-type\s*=\s*\[[^\]]*cdylib/.test(c),uses:u})}return i}function Ye(e){let t=z(e,"packages","native",K),n=[];for(let o of Zn(t)){let s=z(t,o,"package.json");if(!ne(s))continue;let i;try{i=JSON.parse(Et(s,"utf8"))}catch{continue}if(!i.napi)continue;let r=Se(o);if(!ne(z(e,r,"Cargo.toml")))continue;n.push({name:o,dir:V(o),crateDir:r,binaryName:i.napi.binaryName??o,targets:i.napi.targets?.length?i.napi.targets:[...Ke]})}return n}function Qe(e){let t=new Set(Re(e).filter((n)=>n.binding).map((n)=>n.name));return Ye(e).filter((n)=>t.has(n.name))}var Xn=f(()=>{ze()});import{existsSync as fr}from"fs";import{mkdir as Ze,writeFile as G}from"fs/promises";import{join as O}from"path";function hr(e){let t=["[package]",`name    = "${e.name}"`,"version.workspace    = true","edition.workspace    = true","license.workspace    = true","repository.workspace = true",""];if(e.binding)t.push("[lib]","# required \u2014 produces the .node binary napi packages",'crate-type = ["cdylib"]',"","[dependencies]","napi.workspace        = true","napi-derive.workspace = true",...(e.uses??[]).map((n)=>`${`${n}.workspace`.padEnd(22)}= true`),"","[build-dependencies]","napi-build.workspace = true","");else t.push("# Pure Rust \u2014 no napi dependency, no cdylib: testable without a Node runtime.","[dependencies]",...(e.uses??[]).map((n)=>`${n}.workspace = true`),"");return t.push("[lints]","workspace = true",""),t.join(`
`)}function yr(e){if(!e.binding)return`//! Pure Rust helpers shared by the binding crates.
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
`}function vr(e,t){let n=Xe(t),o=`${n}/${e.name}`,s=(e.uses??[]).length>0;return{name:o,version:"0.0.0",private:!0,type:"module",main:"index.js",types:"index.d.ts",exports:{".":{types:"./index.d.ts",require:"./index.js",import:"./index.js"},"./wasi":{types:"./index.d.ts",require:`./${e.name}.wasi.cjs`,browser:`./${e.name}.wasi-browser.js`}},files:["index.js","index.d.ts","*.node",`${e.name}.wasi.cjs`,`${e.name}.wasi-browser.js`,`${e.name}.wasm`],napi:{binaryName:e.name,packageName:o,targets:[...Ke],wasm:{initialMemory:16,maximumMemory:65536,browser:{fs:!1,asyncInit:!0,errorEvent:!0}}},scripts:{build:`m native napi:build --only ${e.name}`,"build:debug":`m native napi:build:debug --only ${e.name}`,"build:wasm":`m native napi:build:wasm --only ${e.name}`,"create-npm-dirs":`m native create-npm-dirs --only ${e.name}`,artifacts:`m native artifacts --only ${e.name}`,test:"m bun test","test:watch":"m bun test --watch",typecheck:"m typecheck --noEmit","cargo:check":"m native check","cargo:clippy":"m native clippy","cargo:fmt":"m native fmt","cargo:fmt:check":"m native fmt:check","cargo:test":"m native test"},devDependencies:{[`${n}/bun-config`]:"workspace:*",[`${n}/native-config`]:"workspace:*",...s?{[`${n}/native-crates`]:"workspace:*"}:{},[`${n}/ts`]:"workspace:*","@napi-rs/cli":"^3.9.1"}}}function wr(e){return`{
  "extends": "${e}/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"]
  },
  "include": ["index.d.ts", "tests/**/*"]
}
`}async function eo(e,t,n={}){let o=O(e,Se(t.name));if(await Ze(O(o,"src"),{recursive:!0}),await G(O(o,"Cargo.toml"),hr(t)),await G(O(o,"src","lib.rs"),yr(t)),t.binding)await G(O(o,"build.rs"),br());if(!t.binding)return{crate:o};let s=O(e,V(t.name));return await Ze(s,{recursive:!0}),await G(O(s,"package.json"),`${JSON.stringify(vr(t,n),null,2)}
`),await G(O(s,"tsconfig.json"),wr(Xe(n))),await G(O(s,"turbo.json"),kr()),await Ze(O(s,"tests"),{recursive:!0}),await G(O(s,"tests",`${t.name}.test.ts`),xr(t,n)),{crate:o,package:s}}function Cr(e,t){return e.replace(/members = \[([\s\S]*?)\]/,(n,o)=>{let s=new Set(o.split(`
`).map((i)=>i.trim()).filter((i)=>i.startsWith('"')).map((i)=>i.replace(/,$/,"")));return s.add(`"crates/${t}"`),`members = [
${[...s].sort().map((i)=>`  ${i},`).join(`
`)}
]`})}async function to(e,t){let n=O(e,"packages","native","Cargo.toml");if(!fr(n))return;let o=await Bun.file(n).text();if(o.includes(`"crates/${t}"`))return;let s=o.includes("members = [")?Cr(o,t):`${o.trimEnd()}

[workspace]
members = [
  "crates/${t}",
]
`;await G(n,s)}function Sr(e){return{name:`${Xe(e)}/native-crates`,version:"0.0.0",private:!0,scripts:{build:"m native build --pure",test:"m native test --pure","cargo:check":"m native check --pure","cargo:clippy":"m native clippy --pure","cargo:fmt":"m native fmt --pure","cargo:fmt:check":"m native fmt:check --pure"}}}async function _t(e,t={}){let n=O(e,"packages","native","crates");return await Ze(n,{recursive:!0}),await G(O(n,"package.json"),`${JSON.stringify(Sr(t),null,2)}
`),await G(O(n,"turbo.json"),$r()),n}var Xe=(e)=>e.scope??Je,br=()=>`extern crate napi_build;

fn main() {
    napi_build::setup();
}
`,kr=()=>`{
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
`,xr=(e,t={})=>{let n=e.name,o=Xe(t),s=(e.uses??[])[0]??"shared",i=(e.uses??[]).length>0,r=`${`${s}.workspace`.padEnd(22)}= true`,a=i?`
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
${a}`},$r=()=>`{
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
`;var no=f(()=>{ze()});import{existsSync as Ot}from"fs";import{join as oe}from"path";function oo(){if(Pn("cargo"))return!0;return we(ue.cargo),!1}function se(){if(Ot(oe(Pt,"Cargo.toml")))return!0;return console.warn(`\u26A0\uFE0F ${R}/Cargo.toml not present, skipping (enable the native config)`),!1}function E(e,t={}){if(!se())return 0;return J("cargo",()=>g(["cargo",...e],{cwd:t.cwd??Pt}))}function me(e){if(!e)return[];let t=Re(x).filter((n)=>n.binding).map((n)=>n.name);if(t.length===0)return[];return console.log(`\u2139\uFE0F pure Rust only \u2014 excluding bindings: ${t.join(", ")}`),t.flatMap((n)=>["--exclude",n])}function so(){return Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/scripts/index.js"))}function Rr(e){return["--cwd",x,"--manifest-path",`${e.crateDir}/Cargo.toml`,"--package-json-path",`${e.dir}/package.json`,"--output-dir",e.dir]}function Te(e,t={},n=()=>[]){if(!se()||!oo())return 0;let o=Qe(x),s=t.only?o.filter((r)=>r.name===t.only):o;if(s.length===0)return console.warn(t.only?`\u26A0\uFE0F No napi package named "${t.only}" in ${R}/${K} \u2014 skipping`:`\u26A0\uFE0F No napi packages in ${R}/${K} \u2014 skipping`),0;let i=0;for(let r of s){console.log(`
\u25B8 ${r.name}: ${r.crateDir} \u2192 ${r.dir}`);let a=g(["bun",so(),...e,...Rr(r),...n(r),...t.target?["--target",t.target]:[],...t.cross?["--use-napi-cross"]:[],...t.dryRun?["--dry-run"]:[]],{cwd:x});if(a!==0)i=a,console.error(`::error::${e.join(" ")} failed for ${r.name} (exit ${a})`)}return i}function Tr(e,t=Pt){if(!se()||!oo())return 0;return g(["bun",so(),...e],{cwd:t})}function Ar(){if(!process.env.WASI_SDK_PATH)console.warn(`\u26A0\uFE0F WASI_SDK_PATH is not set \u2014 install the WASI SDK if the wasm target fails to link
`+"   (CI does it for you; locally: https://github.com/WebAssembly/wasi-sdk/releases)")}function qr(e){let t=new Set;for(let o of Qe(e))for(let s of o.targets)t.add(s);return{include:At.filter((o)=>t.size===0||t.has(o.target)).map((o)=>{let s={target:o.target,runner:o.runner};if(o.container)s.container=o.container;if(o.wasi)s.wasi=!0;return s})}}async function io(e){if(e)return e;let t=Ye(x)[0];if(t)try{let o=(await Bun.file(oe(x,t.dir,"package.json")).json()).name?.split("/")[0];if(o?.startsWith("@"))return o}catch{}return process.env.NATIVE_SCOPE??Je}var x,Pt,de,Ae,Er,_r,Or,Pr,Ir,Nr,Dr,jr,Lr,Mr,Br,Gr,Fr,Ur,Vr,Hr,Wr,Jr,Kr,zr,Yr,Qr,Zr,Xr,ea,ta,ro,na;var ao=f(()=>{k();ke();Xn();ze();no();x=Qn(),Pt=oe(x,R);de={pure:{type:"boolean",description:"Only the pure Rust crates (excludes every napi binding)",default:!1}};Ae={only:{type:"string",description:"Build a single package (by directory name)"},target:{type:"string",description:"Rust target triple, e.g. aarch64-unknown-linux-gnu"},cross:{type:"boolean",description:"Cross-compile with napi's bundled toolchain",default:!1}},Er=l({meta:{name:"check",description:"cargo check --workspace (fast type-check)"},args:{...de},run({args:e}){process.exit(E(["check","--workspace",...me(Boolean(e.pure))]))}}),_r=l({meta:{name:"clippy",description:"cargo clippy --workspace --all-targets -- -D warnings"},args:{...de},run({args:e}){process.exit(E(["clippy","--workspace",...me(Boolean(e.pure)),"--all-targets","--","-D","warnings"]))}}),Or=l({meta:{name:"fmt",description:"cargo fmt --all (format write)"},args:{...de},run({args:e}){process.exit(E(["fmt","--all",...me(Boolean(e.pure))]))}}),Pr=l({meta:{name:"fmt:check",description:"cargo fmt --all -- --check (format check)"},args:{...de},run({args:e}){process.exit(E(["fmt","--all",...me(Boolean(e.pure)),"--","--check"]))}}),Ir=l({meta:{name:"test",description:"cargo test --workspace (run Rust tests)"},args:{...de},run({args:e}){process.exit(E(["test","--workspace",...me(Boolean(e.pure))]))}}),Nr=l({meta:{name:"build",description:"cargo build --workspace (debug)"},args:{...de},run({args:e}){process.exit(E(["build","--workspace",...me(Boolean(e.pure))]))}}),Dr=l({meta:{name:"build:release",description:"cargo build --workspace --release (lto, strip)"},run(){process.exit(E(["build","--workspace","--release"]))}}),jr=l({meta:{name:"build:ci",description:"cargo build --workspace --profile ci"},run(){process.exit(E(["build","--workspace","--profile","ci"]))}}),Lr=l({meta:{name:"tree",description:"cargo tree (dependency tree)"},run(){process.exit(E(["tree",...v("tree")]))}}),Mr=l({meta:{name:"update",description:"cargo update (update dependencies)"},run(){process.exit(E(["update",...v("update")]))}}),Br=l({meta:{name:"doc",description:"cargo doc --no-deps (generate docs)"},run(){process.exit(E(["doc","--no-deps"]))}}),Gr=l({meta:{name:"nextest",description:"cargo nextest run (faster parallel tests)"},run(){process.exit(E(["nextest","run",...v("nextest")]))}}),Fr=l({meta:{name:"llvm-cov",description:"cargo llvm-cov --lcov (Rust coverage, requires cargo-llvm-cov)"},run(){let e=v("llvm-cov");if(e.length===0)process.exit(E(["llvm-cov","--workspace","--lcov","--output-path","coverage/rust-lcov.info"]));process.exit(E(["llvm-cov",...e]))}}),Ur=l({meta:{name:"audit",description:"cargo audit (security audit)"},run(){process.exit(E(["audit"]))}}),Vr=l({meta:{name:"deny",description:"cargo deny check (license/ban check)"},run(){process.exit(E(["deny",...v("deny")]))}}),Hr=l({meta:{name:"typecheck",description:"Type-check every npm package (skips when absent)"},run(){if(!se())process.exit(0);let e=Ye(x).filter((n)=>Ot(oe(x,n.dir,"tsconfig.json")));if(e.length===0)console.warn(`\u26A0\uFE0F No npm packages to type-check in ${R}/${K}`),process.exit(0);let t=0;for(let n of e){console.log(`\u25B8 typecheck ${n.name}`);let o=g(["bun","run","typecheck"],{cwd:oe(x,n.dir)});if(o!==0)t=o}process.exit(t)}});Wr=l({meta:{name:"matrix",description:"Print the CI build matrix (supported targets the packages declare)"},args:{json:{type:"boolean",description:"Pretty-print JSON (default)",default:!0},gha:{type:"boolean",description:"Print `key=value` lines ready for $GITHUB_OUTPUT",default:!1}},run({args:e}){let t=qr(x);if(e.gha)console.log(`targets=${JSON.stringify(t)}`),console.log(`has_targets=${t.include.length>0}`);else console.log(JSON.stringify(t,null,2));process.exit(0)}}),Jr=l({meta:{name:"list",description:"List crates and the npm packages built from them"},args:{json:{type:"boolean",description:"Print JSON",default:!1}},run({args:e}){if(!se())process.exit(0);let t=Re(x),n=Qe(x),o=new Set(n.map((s)=>s.name));if(e.json)console.log(JSON.stringify({root:x,crates:t,packages:n},null,2)),process.exit(0);console.log(`
\uD83E\uDD80 ${R} (workspace root: ${x})
`),console.log("  crates/");for(let s of t){let i=s.binding?"cdylib \u2192 npm package":"pure Rust",r=s.uses.length?` (uses ${s.uses.join(", ")})`:"",a=s.binding&&!o.has(s.name)?"  \u26A0\uFE0F no npm package":"";console.log(`    ${s.name.padEnd(14)} ${i}${r}${a}`)}if(console.log(`
  npm/`),n.length===0)console.log("    (none \u2014 add a cdylib crate with `m native add <name>`)");for(let s of n)console.log(`    ${s.name.padEnd(14)} ${s.crateDir}  binary: ${s.binaryName}.<platform>.node`),console.log(`    ${" ".repeat(14)} targets: ${s.targets.join(", ")}`);console.log(""),process.exit(0)}});Kr=l({meta:{name:"add",description:"Add a crate (and, for bindings, its npm package) to the workspace"},args:{name:{type:"positional",description:"Crate name \u2014 also the npm package name",required:!0},pure:{type:"boolean",description:"Pure Rust crate: no cdylib, no npm package",default:!1},uses:{type:"string",description:"Comma-separated sibling crates to depend on"},scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!se())process.exit(1);let t=String(e.name);if(!/^[a-z0-9][a-z0-9-]*$/.test(t))console.error(`\u274C Invalid crate name "${t}" \u2014 use lowercase letters, digits and hyphens`),process.exit(1);let n={name:t,binding:!e.pure,uses:e.uses?String(e.uses).split(",").map((s)=>s.trim()).filter(Boolean):[],sample:"arithmetic"},o=await io(e.scope);if(await eo(x,n,{scope:o}),await to(x,t),e.pure)await _t(x,{scope:o});if(console.log(`
\u2705 Added ${e.pure?"pure Rust crate":"crate + npm package"} "${t}"`),console.log(`   crate:   ${R}/crates/${t}/`),!e.pure)console.log(`   package: ${V(t)}/`);else console.log(`   bridge:  ${R}/crates/package.json (${o}/native-crates)`),console.log(`   Bindings that use "${t}" add it to workspace.dependencies + Cargo.toml,`),console.log(`   and \`${o}/native-crates: workspace:*\` in their package.json.`);console.log(`
   Run: bun install && m native check
`),process.exit(0)}}),zr=l({meta:{name:"napi:build",description:"napi build --platform --release (one per package)"},args:Ae,run({args:e}){process.exit(Te(["build","--platform","--release"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),Yr=l({meta:{name:"napi:build:debug",description:"napi build (debug, one per package)"},args:Ae,run({args:e}){process.exit(Te(["build"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),Qr=l({meta:{name:"napi:build:wasm",description:`napi build --target ${$e} (one per package)`},args:{only:Ae.only},run({args:e}){Ar(),process.exit(Te(["build","--platform","--release","--target",$e],{only:e.only}))}}),Zr=l({meta:{name:"create-npm-dirs",description:"Generate the per-platform npm packages (run in CI, not committed)"},args:{only:Ae.only,"dry-run":{type:"boolean",default:!1}},run({args:e}){process.exit(Te(["create-npm-dirs"],{only:e.only,dryRun:Boolean(e["dry-run"])},()=>["--npm-dir",`${R}/${K}`]))}}),Xr=l({meta:{name:"artifacts",description:"Copy CI artifacts (.node/.wasm) into the npm packages"},args:{only:Ae.only,dir:{type:"string",description:"Directory holding the downloaded artifacts",default:"artifacts"}},run({args:e}){process.exit(Te(["artifacts"],{only:e.only},(t)=>["--npm-dir",`${R}/${K}`,"--output-dir",String(e.dir??"artifacts"),"--build-output-dir",t.dir]))}}),ea=l({meta:{name:"napi",description:"Run napi-rs CLI (passthrough, cwd = the workspace)"},run(){process.exit(Tr(v("napi")))}}),ta=l({meta:{name:"sync",description:"Re-sync the Turbo bridge node and Cargo\u2192npm dependency edges"},args:{scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!se())process.exit(1);let t=await io(e.scope),n=`${t}/native-crates`,o=0;await _t(x,{scope:t}),console.log(`  \u2713 ${R}/crates/{package,turbo}.json (bridge node)`);for(let i of Re(x).filter((r)=>r.binding)){let r=oe(x,V(i.name),"package.json");if(!Ot(r))continue;let a=(i.uses??[]).length>0;await Tt(r,(c)=>{let p=Rt(c).devDependencies?.[n];if(a&&p!=="workspace:*")return console.log(`  \u2713 ${V(i.name)}/package.json \u2192 ${n}: workspace:*`),o+=1,Wn(c,`devDependencies.${n}`,"workspace:*");if(!a&&p)return console.log(`  \uD83D\uDDD1\uFE0F ${V(i.name)}/package.json \u2190 ${n} (no Cargo path deps)`),o+=1,Jn(c,`devDependencies.${n}`);return c})}let s=oe(x,"package.json");await Tt(s,(i)=>{if((Rt(i).workspaces??[]).includes(`${R}/crates`))return i;return console.log(`  \u2713 package.json workspaces += ${R}/crates`),o+=1,Kn(i,"workspaces",`${R}/crates`)}),console.log(o===0?`
\u2705 Already in sync
`:`
\u2705 Synced (${o} fix${o===1?"":"es"}) \u2014 run bun install
`),process.exit(0)}}),ro=l({meta:{name:"m native",version:"1.0.0",description:"Native Rust bindings via Cargo + napi-rs \u2014 one Cargo workspace in packages/native with a crate per Rust unit and an npm package per napi binding."},subCommands:{list:Jr,matrix:Wr,add:Kr,check:Er,clippy:_r,fmt:Or,"fmt:check":Pr,test:Ir,build:Nr,"build:release":Dr,"build:ci":jr,tree:Lr,update:Mr,doc:Br,nextest:Gr,"llvm-cov":Fr,audit:Ur,deny:Vr,typecheck:Hr,"napi:build":zr,"napi:build:debug":Yr,"napi:build:wasm":Qr,"create-npm-dirs":Zr,artifacts:Xr,napi:ea,sync:ta},run(){let e=v("native");if(e.length===0)console.log(`
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
`),process.exit(0);let t=e[0]??"";if(!Object.keys(ro.subCommands||{}).includes(t)&&!t.startsWith("-"))process.exit(E(e))}}),na=ro});var{file:co,spawnSync:oa}=globalThis.Bun;var sa,ia;var lo=f(()=>{P();k();sa=l({meta:{name:"m e2e",version:"1.0.0",description:"Playwright E2E with browser detection \u2014 auto-skips if browsers missing, uses shared config"},args:{args:{type:"positional",description:"Playwright test args",required:!1}},async run(){let{chromium:e,firefox:t,webkit:n}=await import("@playwright/test"),o={chromium:e,firefox:t,webkit:n},s=[];for(let[w,b]of Object.entries(o))try{let m=b.executablePath();if(!await co(m).exists())s.push(w)}catch{s.push(w)}if(s.length>0)console.log(`
E2E skipped: browser(s) not installed (${s.join(", ")}).`),console.log("Run `bunx playwright install` to download them.\n"),process.exit(0);let i=Ge(),r=await co(`${i}/apps/example/playwright.config.ts`).exists()?`${i}/apps/example/playwright.config.ts`:null,a=v("e2e"),u=["bun",Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js")),"test",...r?["--config",r]:[],...a],p=oa({cmd:u,stdout:"inherit",stderr:"inherit",stdin:"inherit"});process.exit(p.exitCode)}}),ia=sa});import{existsSync as ra}from"fs";var{which:aa}=globalThis.Bun;function It(){return ra(et)}async function la(){try{let e=Bun.fileURLToPath(import.meta.resolve("@unocss/cli/package.json")),n=(await Bun.file(e).json()).bin?.unocss;if(n)return["bun",e.replace("package.json",n)]}catch{}return aa("unocss")?["unocss"]:null}async function po(){try{return((await import(et)).default?.cli?.entry??[]).map((n)=>n.outFile).filter((n)=>!!n)}catch{return[]}}async function uo(e){if(!It())return console.warn("\u26A0\uFE0F UnoCSS not enabled (shared uno.config.ts missing) \u2014 skipping"),0;let t=await la();if(!t)return console.warn("\u26A0\uFE0F unocss CLI not found \u2014 skipping (install: bun add -d @unocss/cli, or use the unocss config package)"),0;return g([...t,"--config",et,...e],{cwd:ca})}var et,ca,pa,ua,ma,da,ga;var mo=f(()=>{P();k();et=N("uno.config.ts"),ca=Ge();pa=l({meta:{name:"build",description:"Generate CSS with the shared UnoCSS config"},async run(){let e=await uo([]);if(e!==0)console.error(`::error::unocss build failed (exit ${e})`),process.exit(e);if(!It())process.exit(0);let t=await po();if(t.length>0)console.log(`\u2705 CSS built: ${t.join(", ")}`);process.exit(0)}}),ua=l({meta:{name:"watch",description:"Same as build, in watch mode"},async run(){let e=await uo(["--watch"]);process.exit(e)}}),ma=l({meta:{name:"info",description:"Show whether UnoCSS is enabled and what it writes"},async run(){let e=It();if(console.log(`enabled: ${e}`),console.log(`config:  ${et}${e?"":" (missing)"}`),!e)process.exit(0);let t=await po();console.log(`outputs: ${t.length>0?t.join(", "):"(none declared)"}`),process.exit(0)}}),da=l({meta:{name:"m unocss",version:"1.0.0",description:"UnoCSS wrapper \u2014 owns the shared config path, skips cleanly when disabled"},subCommands:{build:pa,watch:ua,info:ma},run(){console.log(`
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
`),process.exit(0)}}),ga=da});import{existsSync as go,readdirSync as fa,readFileSync as ha}from"fs";import{join as Dt}from"path";function ya(e){if(e===void 0||e===!1||e===null)return null;if(e===!0)return Nt;if(typeof e==="string")return e||Nt;if(typeof e==="object")return e.dir||Nt;return null}function va(e){let t=Dt(e,"package.json");if(!go(t))return null;try{return JSON.parse(ha(t,"utf8"))}catch{return null}}function tt(e=process.cwd()){let t=[];for(let o of ba){let s=o.split("*")[0]??"",i=Dt(e,s);if(!go(i))continue;for(let r of fa(i,{withFileTypes:!0})){if(!r.isDirectory())continue;let a=`${s}${r.name}`,c=va(Dt(e,a));if(!c?.name)continue;let u=ya(c.pages);if(!u)continue;t.push({name:c.name,dir:a,outDir:`${a}/${u}`})}}t.sort((o,s)=>o.name.localeCompare(s.name));let n=t.length>1;return t.map((o)=>({...o,subpath:n?o.name.split("/").at(-1)??o.name:""}))}function Lt(e){return e.subpath?`/${e.subpath}/`:"/"}var L=".pages",jt="coverage",Nt="public",ba;var fo=f(()=>{ba=["apps/*","packages/*"]});import{existsSync as Mt}from"fs";import{cp as ho,rm as wa}from"fs/promises";import{join as Y}from"path";var{Glob:ka,spawnSync:bo}=globalThis.Bun;function xa(){let e=process.env.GITHUB_REPOSITORY?.split("/")[1];if(e)return e;let n=bo({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim();if(!n)return;return n.replace(/\.git$/,"").split("/").at(-1)}function Ca(){let e=process.env.GITHUB_REPOSITORY?.split("/")[0];if(e)return e;return bo({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim()?.replace(/\.git$/,"").match(/[:/]([^/:]+)\/[^/]+$/)?.[1]}async function Sa(e,t){await wa(Y(e,L),{recursive:!0,force:!0});for(let i of t){let r=Y(e,i.outDir);if(!Mt(r))console.error(`::error::${i.name} declares "${i.outDir}" but it does not exist`),process.exit(1);let a=i.subpath?Y(e,L,i.subpath):Y(e,L);await ho(r,a,{recursive:!0}),console.log(`\uD83D\uDCE6 ${i.name}: ${i.outDir} \u2192 ${L}${Lt(i)}`)}let n="coverage/html",o=Y(e,n);if(Mt(Y(o,"index.html")))await ho(o,Y(e,L,jt),{recursive:!0}),console.log(`\uD83D\uDCCA ${n} \u2192 ${L}/${jt} (served at /coverage/)`);let s=Y(e,L,"index.html");if(!Mt(s))console.warn(`\u26A0\uFE0F No index.html at the site root (${L}/) \u2014 check the pages config`)}var $a,Ra,Ta,Aa,Ea;var yo=f(()=>{k();fo();$a=l({meta:{name:"list",description:"Show which packages declare a Pages site"},run(){let e=tt();if(e.length===0)console.log("No package declares a pages config in its package.json"),process.exit(0);for(let t of e)console.log(`${t.name.padEnd(24)} ${t.outDir.padEnd(28)} \u2192 ${Lt(t)}`);process.exit(0)}}),Ra=l({meta:{name:"build",description:"Build the site and assemble the Pages artifact from declared packages"},run(){console.log("\uD83D\uDCC4 Building static site for GitHub Pages");let e=g(["bun","run","build"]);if(e!==0)console.error(`::error::bun run build failed (exit ${e})`),process.exit(e);let t=tt();if(t.length===0)console.error('::error::Pages is enabled but no package declares "pages" in its package.json (e.g. "pages": { "dir": "public" })'),process.exit(1);Sa(process.cwd(),t).then(()=>{console.log(`\u2705 Pages artifact ready: ${L}/`),process.exit(0)})}}),Ta=l({meta:{name:"base",description:"Report (or inject) the base path for a GitHub Pages project site"},args:{inject:{type:"boolean",description:"Rewrite absolute href/src in the built HTML to include the base path",default:!1},json:{type:"boolean",description:"Print { owner, repo, base, url } as JSON",default:!1}},async run({args:e}){let t=xa(),n=Ca()??"unknown",o=t?`https://${n.toLowerCase()}.github.io/${t}`:void 0;if(e.json){console.log(JSON.stringify({owner:t?n:null,repo:t??null,base:t?`/${t}`:null,url:o??null}));return}if(console.log(`\uD83D\uDD27 Repo name: ${t??"(unknown)"}`),console.log(`   Default Pages URL: ${o??"(unknown)"}`),!e.inject)return;if(!t)console.error("::error::cannot determine repo name \u2014 set GITHUB_REPOSITORY or add a git remote"),process.exit(1);if(tt().filter((a)=>a.subpath==="").length===0){console.log("   No root-level Pages target \u2014 nothing to rewrite");return}let r=0;for(let a of new ka(`${L}/**/*.html`).scanSync(".")){let c=await Bun.file(a).text(),u=c.replaceAll(/(href|src)="\/(?!\/)/g,`$1="/${t}/`);if(u===c)continue;await Bun.write(a,u),r++}console.log(`   Rewrote absolute paths to /${t}/ in ${r} file(s)`)}}),Aa=l({meta:{name:"m pages",version:"1.0.0",description:"GitHub Pages helper \u2014 discovers declared sites, builds and stages the artifact"},subCommands:{build:Ra,base:Ta,list:$a}}),Ea=Aa});import{mkdir as Ee,readdir as nt}from"fs/promises";import{join as ie}from"path";var{$:ge,file:Bt,write:_e}=globalThis.Bun;function _a(e){let t=e.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!t)return null;let n=t[1]??"",o=t[2]??"",s={};for(let i of n.split(`
`)){let r=i.indexOf(":");if(r===-1)continue;let a=i.slice(0,r).trim(),c=i.slice(r+1).trim().replace(/^["']|["']$/g,"");if(a)s[a]=c}return{frontmatter:s,body:o}}async function Pe(e){try{let t=await Bt(e).text(),n=_a(t);if(!n)return console.error(`\u274C ${e}: missing YAML frontmatter (---)`),null;let{frontmatter:o}=n;if(!o.name)return console.error(`\u274C ${e}: missing frontmatter 'name'`),null;if(!o.description)return console.error(`\u274C ${e}: missing frontmatter 'description'`),null;return{name:o.name,description:o.description,path:e}}catch(t){return console.error(`\u274C ${e}: ${t.message}`),null}}async function ot(e){let t=[];try{let n=await nt(e,{withFileTypes:!0});for(let o of n){let s=ie(e,o.name);if(o.isDirectory()){let i=await ot(s);t.push(...i)}else if(o.name==="SKILL.md"||o.name.endsWith(".md"))t.push(s)}}catch{}return t}var vo="@myorg",re,ko,M,Oe,wo,Oa,Pa,Ia,Na,Da,ja,La,Ma,Ba;var xo=f(()=>{Be();P();re=sn(),ko=`${Z()}/src/cli.ts`,M=`${process.cwd()}/.agents/skills`,Oe=`${process.cwd()}/.agents/skills.index.json`;wo=l({meta:{name:"sync",description:"Sync curated skills to .agents/skills/ + validate + index"},run:async()=>{let e=process.env.SKILLS_SCOPE||process.env.SCOPE||vo,t=vo;await Ee(M,{recursive:!0}),console.log(`
\uD83D\uDCE6 Syncing curated skills from ${re} to ${M}/ (scope: ${e})
`);let n=0;try{let a=await nt(re,{withFileTypes:!0});for(let c of a){let u=ie(re,c.name);if(c.isDirectory()){let p=ie(M,c.name);if(await Ee(p,{recursive:!0}),await ge`cp -r ${u}/* ${p}/`.quiet().catch(()=>{}),e!==t){let w=await ge`find ${p} -type f -name "*.md"`.text().catch(()=>"");for(let b of w.trim().split(`
`).filter(Boolean))try{let m=await Bt(b).text();if(m.includes(t))await _e(b,m.replaceAll(t,e))}catch{}}n++,console.log(`  \u2713 ${c.name}/`)}else if(c.isFile()&&c.name.endsWith(".md")){let p=c.name.replace(/\.md$/,""),w=ie(M,p);await Ee(w,{recursive:!0});let b=await Bt(u).text();if(e!==t)b=b.replaceAll(t,e);if(b.startsWith("---"))await _e(ie(w,"SKILL.md"),b);else{let C=`---
name: ${p}
description: ${p} skill
---

${b}`;await _e(ie(w,"SKILL.md"),C)}n++,console.log(`  \u2713 ${p}/ (from legacy ${c.name})`)}}}catch(a){console.error(`  No curated dir: ${re}`,a)}console.log(`
\u2705 Synced ${n} curated skills to .agents/skills/
`),console.log(`\uD83D\uDD0D Validating skills in ${M}/...
`);let o=await ot(M),s=0,i=0;for(let a of o){let c=await Pe(a);if(c)s++,console.log(`  \u2713 ${c.name} \u2014 ${c.description}`);else i++}console.log(`
${i===0?"\u2705":"\u26A0\uFE0F"}  ${s} valid, ${i} invalid
`);let r=[];for(let a of o){let c=await Pe(a);if(c)r.push({...c,path:a.replace(`${process.cwd()}/`,"")})}if(await Ee(`${process.cwd()}/.agents`,{recursive:!0}),await _e(Oe,`${JSON.stringify(r,null,2)}
`),console.log(`\uD83D\uDCC4 Built ${Oe} with ${r.length} skills
`),i>0)process.exit(1)}}),Oa=l({meta:{name:"list",description:"List installed skills (curated + vendored + skills.sh)",alias:["ls"]},run:async()=>{console.log(`
\uD83D\uDCDA Skills in ${M}/:
`);try{let e=await nt(M,{withFileTypes:!0});if(e.length===0)console.log("  (no skills installed \u2014 run `bun run skills:sync` or `bun run skills:add`)\n");else for(let t of e){if(!t.isDirectory())continue;let n=ie(M,t.name,"SKILL.md"),o=await Pe(n).catch(()=>null);if(o)console.log(`  - ${o.name} \u2014 ${o.description} (${t.name}/)`);else console.log(`  - ${t.name}/ \u2014 (no SKILL.md)`)}}catch{console.log("  (no .agents/skills/ dir \u2014 run `bun run skills:sync`)\n")}console.log(`
\uD83D\uDCE6 Curated skills in ${re}/:
`);try{let e=await nt(re,{withFileTypes:!0});for(let t of e){let n=t.isDirectory()?t.name:t.name.replace(/\.md$/,"");console.log(`  - ${n}`)}}catch{console.log("  (no curated dir)")}console.log(),console.log(`\uD83D\uDD0D skills.sh installed (project):
`),await ge`npx skills list -p`.quiet().then(async(e)=>{let t=e.stdout.toString();console.log(t||"  (none or skills CLI not available)")}).catch(()=>{console.log("  (skills CLI not available or no project skills)")}),console.log()}}),Pa=l({meta:{name:"add",description:"Add skill via skills.sh (e.g. vercel-labs/agent-skills)",alias:["a"]},args:{package:{type:"positional",description:"Skill package (e.g. vercel-labs/agent-skills or https://skills.sh/p/<id>)",required:!0}},run:async({args:e})=>{let t=e.package;console.log(`
\uD83D\uDCE6 Adding skill package via skills.sh: ${t}
`),console.log(`> npx skills add ${t} -p --agent * -y
`);let o=await Bun.spawn({cmd:["npx","skills","add",t,"-p","--agent","*","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(o!==0)console.error(`
\u274C skills add failed with exit ${o}
`),process.exit(o);console.log(`
\u2705 Added ${t}, syncing to .agents/skills/...
`),await ge`bun ${ko} skills sync`.quiet().catch(()=>{}),await ge`npx skills experimental_sync -p`.quiet().catch(()=>{}),console.log(`
\u2705 Done. Review changes in .agents/skills/ before committing.
`)}}),Ia=l({meta:{name:"update",description:"Update skills via skills.sh",alias:["upgrade"]},args:{skills:{type:"positional",description:"Skills to update (default: all)",required:!1}},run:async({args:e})=>{let t=e.skills??"",n=t?[t]:[];console.log(`
\uD83D\uDD04 Updating skills via skills.sh: ${n.join(" ")||"(all)"}
`);let o=["npx","skills","update",...n,"-p","-y"];console.log(`> ${o.join(" ")}
`);let i=await Bun.spawn({cmd:o,cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(i!==0)console.error(`
\u274C skills update failed with exit ${i}
`),process.exit(i);console.log(`
\u2705 Updated, rebuilding index...
`),await ge`bun ${ko} skills sync`.quiet().catch(()=>{})}}),Na=l({meta:{name:"validate",description:"Validate all SKILL.md frontmatter (name, description)"},run:async()=>{console.log(`
\uD83D\uDD0D Validating all SKILL.md files...
`);let e=[re,M],t=0,n=0;for(let o of e){console.log(`\uD83D\uDCC1 ${o}:
`);let s=await ot(o);if(s.length===0){console.log(`  (no skills found)
`);continue}for(let i of s){let r=await Pe(i);if(r)t++,console.log(`  \u2713 ${r.name} \u2014 ${r.description} (${i.replace(`${process.cwd()}/`,"")})`);else n++}console.log()}if(console.log(`${n===0?"\u2705":"\u274C"} Validation: ${t} valid, ${n} invalid
`),n>0)process.exit(1)}}),Da=l({meta:{name:"index",description:"Build .agents/skills.index.json"},run:async()=>{console.log(`
\uD83D\uDCC4 Building ${Oe}...
`);let e=await ot(M),t=[];for(let n of e){let o=await Pe(n);if(o)t.push({...o,path:n.replace(`${process.cwd()}/`,"")})}await Ee(`${process.cwd()}/.agents`,{recursive:!0}),await _e(Oe,`${JSON.stringify(t,null,2)}
`),console.log(`\u2705 Built index with ${t.length} skills:
`);for(let n of t)console.log(`  - ${n.name}: ${n.description}`);console.log(`
\uD83D\uDCC4 ${Oe}
`)}}),ja=l({meta:{name:"init",description:"Init new skill via skills.sh"},args:{name:{type:"positional",description:"Skill name",required:!1,default:"my-skill"}},run:async({args:e})=>{let t=e.name??"my-skill";console.log(`
\uD83D\uDCDD Initializing skill: ${t}
`),await Bun.spawn({cmd:["npx","skills","init",t],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),La=l({meta:{name:"remove",description:"Remove skills via skills.sh",alias:["rm"]},args:{skills:{type:"positional",description:"Skills to remove",required:!0}},run:async({args:e})=>{let n=e.skills.split(",").map((s)=>s.trim());console.log(`
\uD83D\uDDD1\uFE0F Removing skills: ${n.join(", ")}
`),await Bun.spawn({cmd:["npx","skills","remove",...n,"-p","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),Ma=l({meta:{name:"m skills",version:"1.0.0",description:"AI agent skills management via skills.sh + curated skills \u2014 sync, list, add, update, validate, index"},subCommands:{sync:wo,list:Oa,add:Pa,update:Ia,validate:Na,index:Da,init:ja,remove:La},run:async({args:e})=>{if(!e._||Array.isArray(e._)&&e._.length===0)await H(wo,{rawArgs:[]})}}),Ba=Ma});function Co(e,t,n){let o=[];if(e.includes("Archont561/ts-monorepo-template")&&!e.includes(t))o.push("README still contains placeholder owner Archont561/ts-monorepo-template");if(e.includes("@myorg")&&!e.includes(n)){let s=e.split(`
`).filter((i)=>i.includes("shields.io")||i.includes("badge.svg"));for(let i of s)if(i.includes("@myorg"))o.push(`Badge line still contains @myorg: ${i.trim().slice(0,80)}`)}return o}var{file:Ga}=globalThis.Bun;var So,Fa;var $o=f(()=>{k();So=l({meta:{name:"check",description:"Check README badges for placeholder owner/scope"},args:{owner:{type:"string",description:"Expected owner/repo",default:"YOUR_ORG/YOUR_REPO"},scope:{type:"string",description:"Expected scope",default:"@your-scope"}},run:async({args:e})=>{let t=e.owner||"YOUR_ORG/YOUR_REPO",n=e.scope||"@your-scope",o=`${process.cwd()}/README.md`,s=await Ga(o).text().catch(()=>"");if(!s)console.error(`No README at ${o}`),process.exit(1);let i=Co(s,t,n);if(i.length===0)console.log("\u2705 Badges look OK (no placeholder owner/scope in badge URLs)"),process.exit(0);console.warn(`\u26A0\uFE0F Badge issues:
${i.map((r)=>`  - ${r}`).join(`
`)}`),process.exit(1)}}),Fa=l({meta:{name:"badges",version:"1.0.0",description:"Badges validation \u2014 check README badges"},subCommands:{check:So},run:async()=>{await H(So,{rawArgs:[]})}})});var{file:Ua}=globalThis.Bun;function Gt(e,t){return async({targetDir:n,scope:o})=>{let s=Fe(...e.split("/"));if(!await Ua(s).exists())return;console.log(`
\uD83D\uDD27 Running setup for ${t}: ${e}
`);try{let r=await Bun.spawn({cmd:["bun",s],cwd:n,env:{...process.env,SCOPE:o,NATIVE_SCOPE:o,UNOCSS_SCOPE:o,DEVCONTAINER_SCOPE:o,SKILLS_SCOPE:o},stdout:"inherit",stderr:"inherit"}).exited;if(r!==0)console.warn(`\u26A0\uFE0F Setup for ${t} exited with code ${r}`)}catch(i){console.warn(`\u26A0\uFE0F Setup for ${t} failed:`,i)}}}var Ro,To,Ao;var Eo=f(()=>{P();Ro=Gt("commands/native-setup.ts","native"),To=Gt("commands/unocss-setup.ts","unocss"),Ao=Gt("commands/devcontainer-setup.ts","devcontainer")});var{file:_o}=globalThis.Bun;async function ru(e){return[...Q]}function Wa(e){if(typeof e==="boolean")return!0;if(typeof e!=="string")return!1;return e==="always"||qa.includes(e)}function Po(e,t){let n=e.flag?t[e.flag]:void 0;return n===void 0?e.default:n}function Io(e,t){return e.type==="select"?t===e.default:!t}function Ja(e,t){if(e.default==="always"&&!e.selfDestruct)return!0;let n=Po(e,t);return!(e.selfDestruct===!0||Io(e,n))}function No(e,t){let n=new Set;for(let o of e)if(Ja(o.meta,t))n.add(o.dir);return n}function Do(e,t){let n=new Set(["template"]);for(let o of e){let{meta:s}=o;if(s.default==="always")continue;let i=Po(s,t);if(Io(s,i)){if(n.add(o.dir),s.flag)n.add(s.flag);if(s.marker)n.add(s.marker);if(s.templateMarker)n.add(s.templateMarker);for(let a of s.markers??[])n.add(a)}for(let a of s.options??[]){if(a.value===i)continue;if(a.marker)n.add(a.marker);if(a.templateMarker)n.add(a.templateMarker);for(let c of a.markers??[])n.add(c)}let r=s.removals?.[String(i)];if(r){if(r.marker)n.add(r.marker);if(r.templateMarker)n.add(r.templateMarker);for(let a of r.markers??[])n.add(a);for(let a of r.markersToRemove??[])n.add(a)}}return n}async function jo(e){let t=_o(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.features;if(!o||typeof o!=="object"||Array.isArray(o))return null;let s={};for(let[i,r]of Object.entries(o))if(Wa(r))s[i]=r;return s}catch{return null}}async function Lo(e){let t=_o(`${e}/package.json`);if(!await t.exists())return null;try{let o=(await t.json()).tooling?.scope;return typeof o==="string"&&o.length>0?o:null}catch{return null}}var Va,Oo="@myorg",Ha,Q,iu,au="tooling.features",cu="tooling.scope",qa;var Mo=f(()=>{Eo();Va={none:"none",publish:"publish",docker:"docker"},Ha={badges:{name:"@myorg/badges",dir:"badges",meta:{default:"always",flag:"badges",prompt:"Include badges for CI, coverage, license in READMEs?"}},biome:{name:"@myorg/biome",ciFiles:["sections/biome.yml"],dir:"biome",meta:{default:"always",flag:"biome",prompt:"Configure Biome (lint + format)?"}},"bun-config":{name:"@myorg/bun-config",ciFiles:["sections/bun-config.yml"],dir:"bun-config",meta:{default:"always",flag:"bun-config",prompt:"Configure Bun (coverage, test settings)?"}},bunup:{name:"@myorg/bunup",ciFiles:["sections/bunup.yml"],dir:"bunup",meta:{default:"always",flag:"bunup",prompt:"Configure Bunup (Bun-based package bundler)?"}},changeset:{name:"@myorg/changeset",ciFiles:["fragments/changeset/release.steps.yml"],dir:"changeset",meta:{default:"always",flag:"changeset",prompt:"Configure Changesets (versioning + releases)?"}},citty:{name:"@myorg/citty",dir:"citty",meta:{default:"always",flag:"citty",prompt:"Configure Citty (elegant CLI builder)?"}},codeql:{name:"@myorg/codeql",ciFiles:["sections/codeql.yml"],dir:"codeql",meta:{default:!0,flag:"codeql",prompt:"Include CodeQL (GitHub SAST for JS/TS)?",type:"confirm"}},commitlint:{name:"@myorg/commitlint",dir:"commitlint",meta:{default:"always",flag:"commitlint",prompt:"Configure Commitlint (Conventional Commits)?"}},community:{name:"@myorg/community",dir:"community",meta:{default:"always",flag:"community",prompt:"Include community health files (CODEOWNERS, PR template, issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING)?"}},coverage:{name:"@myorg/coverage",ciFiles:["fragments/coverage-report/coverage.base.yml","fragments/coverage-report/coverage.steps.yml","fragments/coverage-report/pages.steps.yml","sections/coverage.yml"],dir:"coverage",meta:{default:"always",flag:"coverage",prompt:"Configure coverage reporting (LCOV, HTML, artifact, Pages, threshold)?"}},dependabot:{name:"@myorg/dependabot",ciFiles:["fragments/dependabot/dependabot-auto-merge.base.yml","fragments/dependabot/dependabot-auto-merge.steps.yml","fragments/dependabot/dependabot.base.yml","standalone/dependabot.yml"],dir:"dependabot",meta:{default:"always",flag:"dependabot",prompt:"Configure Dependabot (automated dependency updates)?"}},devcontainer:{name:"@myorg/devcontainer",dir:"devcontainer",setup:Ao,meta:{default:!1,flag:"devcontainer",prompt:"Include devcontainer config for Codespaces / Dev Containers?",type:"confirm",removals:{true:{},false:{extraRemovals:[".devcontainer"],filePatternsToRemove:["**/.devcontainer/**",".devcontainer/**","**/devcontainer.json"],fileRegexesToRemove:["devcontainer","\\.devcontainer"]}}}},editorconfig:{name:"@myorg/editorconfig",dir:"editorconfig",meta:{default:"always",flag:"editorconfig",prompt:"Include .editorconfig (consistent editor settings)?"}},"gh-actions":{name:"@myorg/gh-actions",ciFiles:["ci.base.yml","ci.bootstrap.yml","release.base.yml","sections/gh-actions.yml"],dir:"gh-actions",meta:{default:"always",flag:"gh-actions",prompt:"Configure GitHub Actions (CI + release workflows)?"}},gitattributes:{name:"@myorg/gitattributes",dir:"gitattributes",meta:{default:"always",flag:"gitattributes",prompt:"Include .gitattributes (line endings, binary handling)?"}},gitleaks:{name:"@myorg/gitleaks",ciFiles:["sections/gitleaks.yml"],dir:"gitleaks",meta:{default:"always",flag:"gitleaks",prompt:"Include Gitleaks (secret scanning via Lefthook + CI)?"}},lefthook:{name:"@myorg/lefthook",dir:"lefthook",meta:{default:"always",flag:"lefthook",prompt:"Configure Lefthook (Git hooks)?"}},manifest:{name:"@myorg/manifest",dir:"manifest",meta:{default:"always",flag:"manifest",prompt:"Configure the manifest editor (format-preserving package.json edits)?"}},native:{name:"@myorg/native-config",ciFiles:["fragments/native/native.base.yml","fragments/native/native.steps.yml","fragments/native/release.steps.yml","sections/native.yml"],dir:"native",setup:Ro,meta:{default:"none",flag:"native",prompt:"Set up native Node-API (NAPI-RS) bindings?",type:"select",options:[{value:"none",label:"None - skip native bindings"},{value:"publish",label:"Publish a native npm package"},{value:"docker",label:"Build native bindings in Docker"}],removals:{none:{extraRemovals:["packages/native","apps/example/src/pages/api/native"],scriptsToRemove:["build:native","build:wasm","test:native","security:audit"],turboTasksToRemove:["build:native","build:wasm"],filePatternsToRemove:["**/*.node","**/*.napi.*","**/*.wasi.cjs","**/rust-toolchain.toml","Cargo.lock",".cargo/**","**/native/**","**/api/native/**"],fileRegexesToRemove:["\\\\.node$","napi","rust-toolchain","api/native"],appDepsToRemove:["@myorg/native"]},publish:{},docker:{}}}},pages:{name:"@myorg/pages",ciFiles:["fragments/pages/pages.base.yml","fragments/pages/pages.steps.yml"],dir:"pages",meta:{default:!1,flag:"pages",prompt:"Set up GitHub Pages deployment (static site via Actions)?",type:"confirm",removals:{true:{},false:{extraRemovals:[".github/workflows/pages.yml"],filePatternsToRemove:["**/pages.yml"],fileRegexesToRemove:["pages\\.yml"]}}}},playwright:{name:"@myorg/playwright",ciFiles:["sections/playwright.yml"],dir:"playwright",meta:{default:!0,flag:"playwright",prompt:"Include E2E testing with Playwright?",removals:{true:{},false:{scriptsToRemove:["test:e2e"],turboTasksToRemove:["test:e2e"],extraRemovals:["apps/example/playwright.config.ts","apps/example/e2e"],filePatternsToRemove:["**/e2e/**","**/*.e2e.ts","**/playwright.config.ts"],fileRegexesToRemove:["playwright",".*\\.spec\\.e2e\\..*"],appDepsToRemove:["@myorg/playwright","@playwright/test"]}}}},skills:{name:"@myorg/skills",dir:"skills",meta:{default:!1,flag:"skills",prompt:"Install AI agent skills? (for Cursor, Claude, Cline)",removals:{false:{extraRemovals:[".agents"],filePatternsToRemove:[".agents/**","**/.claude/**","**/skills/**"],fileRegexesToRemove:["\\.agents","skills"],scriptsToRemove:["skills"]}}}},stale:{name:"@myorg/stale",ciFiles:["fragments/stale/stale.base.yml"],dir:"stale",meta:{default:!1,flag:"stale",prompt:"Include stale action (auto-close inactive issues/PRs)?",type:"confirm"}},template:{name:"@myorg/template",dir:"template",meta:{default:"always",selfDestruct:!0,scriptsToRemove:["docs:sync","docs:site","docs:dev","docs:build","docs:preview"],removals:{always:{extraRemovals:[".github/workflows/template-docs.yml","apps/template-docs","codecov.yml","packages/tooling/tests","packages/tooling/dist"],filePatternsToRemove:["**/template-docs.yml","**/template-docs/**",".changeset/*.md"],fileRegexesToRemove:["template-docs"]}}}},trivy:{name:"@myorg/trivy",ciFiles:["sections/trivy.yml"],dir:"trivy",meta:{default:!1,flag:"trivy",prompt:"Include Trivy (container + filesystem vulnerability scanning)?",type:"confirm",removals:{false:{filePatternsToRemove:["**/trivy*"],scriptsToRemove:["security:trivy","security:check"]}}}},ts:{name:"@myorg/ts",dir:"ts",meta:{default:"always",flag:"ts",prompt:"Configure TypeScript (shared tsconfigs)?"}},turbo:{name:"@myorg/turbo",ciFiles:["sections/turbo.yml"],dir:"turbo",meta:{default:"always",flag:"turbo",prompt:"Configure Turbo (task orchestration)?"}},unocss:{name:"@myorg/unocss",dir:"unocss",setup:To,meta:{default:!1,flag:"unocss",marker:"unocss",prompt:"Include UnoCSS (atomic CSS engine)?",type:"confirm",removals:{true:{},false:{marker:"unocss",extraRemovals:["apps/example/public/uno.css","apps/example/uno.config.ts"],filePatternsToRemove:["**/uno.css","**/*.unocss.*"],fileRegexesToRemove:[],appDepsToRemove:["@unocss/reset","unocss","@myorg/unocss"]}}}}},Q=Object.values(Ha),iu=new Map(Q.map((e)=>[e.dir,e]));qa=Object.values(Va)});function Bo(e,t){if(e.startsWith("!")){let n=e.slice(1).trim();return!t.has(n)&&!t.has(n.toLowerCase())}return t.has(e)||t.has(e.toLowerCase())}function pu(e){return[e,"-type","f","(",...Ka.flatMap((t,n)=>[...n>0?["-o"]:[],"-name",`*${t}`]),")","-not","-path","*/node_modules/*","-not","-path","*/dist/*","-not","-path","*/packages/tooling/*"]}function Go(e,t){let n=e,o=!1;for(let s of za)n=n.replace(s,(i,r,a)=>{let c=r.split(",").map((p)=>p.trim());return o=!0,c.every((p)=>Bo(p,t))?"":a});for(let s of Ya)n=n.replace(s,(i,r,a)=>{if(r.toUpperCase()==="TEMPLATE-ONLY")return i;return o=!0,Bo(r,t)?"":a});if(!o)return{content:e,changed:o};return{changed:o,content:n.replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).replace(/\n{2,}$/,`
`)}}var Ka,za,Ya;var Fo=f(()=>{Ka=[".yml",".yaml",".ts",".js",".md",".toml",".html"],za=[/[ \t]*#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g],Ya=[/[ \t]*#[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*\1:END[^\n]*\n?/g,/[ \t]*\/\/[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*\1:END[^\n]*\n?/g,/[ \t]*<!--[ \t]*([A-Za-z0-9_!-]+):START[ \t]*-->([\s\S]*?)<!--[ \t]*\1:END[ \t]*-->[ \t]*\n?/g]});var Uo;var Vo=f(()=>{Uo={BUN_VERSION:"latest",NATIVE_DIR:"packages/native",NATIVE_CARGO:"packages/native/Cargo.toml",NATIVE_NPM:"packages/native/npm/*/package.json",NATIVE_WASI_SDK_VERSION:"24",APP_DIR:"apps/example",APP_DOCKERFILE:"apps/example/Dockerfile"}});import{mkdir as Ho}from"fs/promises";var{$:Qa,file:fe,write:Za}=globalThis.Bun;function Jo(e){return Wo.exec(e)?.[1]??null}function Ko(e){return Xa.exec(e)?.[1]??null}function tc(e,t){let n=[],o=t,s=[],i=()=>{let r=s.join(`
`).replace(/^(?:[ \t]*\n)+/,"").replace(/\s+$/,"");if(r)n.push({section:o,text:r});s=[]};for(let r of e.split(`
`)){let a=Jo(r);if(a){i(),o=a;continue}s.push(r)}return i(),n}function nc(e){return e.split(`
`).some((t)=>Wo.test(t))}function oc(e,t){let n=new Map;for(let r of t)for(let a of tc(r,zo)){let c=n.get(a.section)??[];c.push(a.text),n.set(a.section,c)}let o=new Set,s=new Set,i=[];for(let r of e.split(`
`)){let a=Jo(r);if(!a){i.push(r);continue}o.add(a);let c=n.get(a);if(c?.length)s.add(a),i.push(c.join(`

`))}for(let r of n.keys())if(!o.has(r))console.log(`\u26A0\uFE0F No "# SECTION: ${r}" in the CI skeleton \u2014 steps dropped`);return{rendered:i.join(`
`),filled:s}}function sc(e,t){if(t.size===0)return e;let n=[],o=!1;for(let s of e.split(`
`)){let i=Ko(s);if(i)o=t.has(i);else if(/^\S/.test(s))o=!1;if(!o)n.push(s)}return n.join(`
`)}function ic(e,t){let n=e.split(`
`),o=!1;for(let[s,i]of n.entries()){let r=Ko(i);if(r)o=r===ec;else if(/^\S/.test(i))o=!1;if(o&&/^ {4}needs: \[[^\]]*\]$/.test(i)){n[s]=`    needs: [${t.join(", ")}]`;break}}return n.join(`
`)}function Yo(){return new Set(Q.map((e)=>e.dir))}function Ft(e){return Fe("ci",...e.split("/"))}function rc(e,t){if(t==="ci.steps.yml")return e.startsWith("sections/");return(e.split("/").pop()??"")===t}async function ac(e,t){let n=[];for(let o of Q){if(!t.has(o.dir))continue;for(let s of o.ciFiles??[]){if(!rc(s,e))continue;n.push((await fe(Ft(s)).text()).trimEnd())}}return n}async function cc(e,t){for(let n of Q){if(!t.has(n.dir))continue;for(let o of n.ciFiles??[])if((o.split("/").pop()??"")===e)return Ft(o)}return null}async function lc(){let e=Ft("ci.bootstrap.yml");if(!await fe(e).exists())return"";return(await fe(e).text()).trimEnd()}async function pc(e,t){if(!t)return;let n=Do(Q,t),o=await Lo(e);return(s)=>{let{content:i}=Go(s,n);return o?i.replaceAll(Oo,o):i}}async function uc(e,t,n,o={}){let s=o.enabled??Yo(),i=await cc(t,s);if(!i){console.log(`\u26A0\uFE0F Skipping ${t} \u2014 no enabled feature declares it`);return}let r=await fe(i).text(),a=await ac(n,s),c=a.join(`

`),u;if(n==="ci.steps.yml"&&nc(r)){let b=oc(r.replaceAll("{{BOOTSTRAP}}",await lc()),a),m=new Set(qo.filter((y)=>!b.filled.has(y))),C=[zo,...qo.filter((y)=>!m.has(y))];u=ic(sc(b.rendered,m),C)}else u=r.replace("{{STEPS}}",`${c}
`).replace("{{UPDATES}}",`${c}
`);let p=u;for(let[b,m]of Object.entries(Uo))p=p.replaceAll(`{{${b}}}`,m);p=p.replace(/\n{3,}/g,`

`);let w;if(t==="dependabot.base.yml")w=`${e}/.github/dependabot.yml`;else w=`${e}/.github/workflows/${t.replace(".base.yml",".yml")}`;await Za(w,o.postProcess?o.postProcess(p):p),console.log(`\u2705 generated ${w}`)}async function dc(e,t,n,o){let s=t.outcome(n);if(s==="skip")return;if(s==="generate"){await uc(e,t.base,t.steps,o);return}if(!t.stale)return;let i=`${e}/${t.stale}`;if(!await fe(i).exists())return;await Qa`rm -rf ${i}`.quiet();let r=t.reason?.(n);if(r)console.log(`\uD83D\uDDD1\uFE0F Removed ${i} (${r})`)}async function Qo(e,t={}){await Ho(`${e}/.github/workflows`,{recursive:!0}),await Ho(`${e}/.github`,{recursive:!0});let n=await jo(e),o=t.enabled??(n?No(Q,n):Yo()),s=t.postProcess??await pc(e,n),i=o.has("pages"),r=t.templateDocsSite??await fe(`${e}/apps/template-docs/.vitepress/config.mts`).exists(),a={pages:i,coverage:o.has("coverage"),native:o.has("native"),dependabot:o.has("dependabot")||o.has("gh-actions"),stale:o.has("stale"),templateDocsSite:r,pagesDeploysToSite:i&&!r};for(let c of mc)await dc(e,c,a,{...t,enabled:o,postProcess:s})}var Wo,Xa,zo="quality",ec="gate",qo,mc,vu;var Zo=f(async()=>{P();Mo();Fo();Vo();Wo=/^[ \t]*#[ \t]*SECTION:[ \t]*([A-Za-z0-9_-]+)[ \t]*$/,Xa=/^ {2}([A-Za-z0-9_-]+):$/;qo=["coverage","security","native","e2e"];mc=[{base:"ci.base.yml",steps:"ci.steps.yml",outcome:()=>"generate"},{base:"release.base.yml",steps:"release.steps.yml",outcome:()=>"generate"},{base:"pages.base.yml",steps:"pages.steps.yml",outcome:(e)=>e.pagesDeploysToSite?"generate":"remove",stale:".github/workflows/pages.yml",reason:(e)=>e.templateDocsSite?"template docs site deploys Pages":"pages disabled"},{base:"coverage.base.yml",steps:"coverage.steps.yml",outcome:(e)=>{if(!e.coverage)return"skip";return e.pagesDeploysToSite||e.templateDocsSite?"remove":"generate"},stale:".github/workflows/coverage.yml",reason:(e)=>e.templateDocsSite?"coverage published by the docs site":"coverage included in pages.yml"},{base:"native.base.yml",steps:"native.steps.yml",outcome:(e)=>e.native?"generate":"remove",stale:".github/workflows/native.yml",reason:()=>"native disabled"},{base:"dependabot.base.yml",steps:"dependabot.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"dependabot-auto-merge.base.yml",steps:"dependabot-auto-merge.steps.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"stale.base.yml",steps:"stale.steps.yml",outcome:(e)=>e.stale?"generate":"remove",stale:".github/workflows/stale.yml"}];vu=process.argv[2]??"."});import{existsSync as Xo}from"fs";import{cp as es,rm as ts}from"fs/promises";var{spawnSync:gc}=globalThis.Bun;function Ie(e){return console.log(`
\u25B8 ${e.join(" ")}`),gc({cmd:e,stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}var Ut=".pages",ns="apps/template-docs",ae,Vt="coverage/html",fc,hc;var os=f(async()=>{k();await Zo();ae=`${ns}/dist`;fc=l({meta:{name:"m docs",version:"1.0.0",description:"Regenerate workflows from configs/* \u2014 static README/AGENTS with TEMPLATE-ONLY blocks"},args:{dir:{type:"string",description:"Target directory (default: .)",required:!1,default:"."}},subCommands:{site:l({meta:{name:"site",description:"Build one Pages artifact: docs + coverage report + demo app"},args:{"skip-coverage":{type:"boolean",description:"Reuse coverage/lcov.info instead of re-running the test suite",default:!1},"skip-app":{type:"boolean",description:"Skip building and copying the demo app to /example/",default:!1}},async run({args:e}){if(!e["skip-coverage"]){let n=Ie(["bun","run","coverage"]);if(n!==0)console.error(`::error::bun run coverage failed (exit ${n})`),process.exit(n)}Ie(["bun","run","m coverage","setup"]),Ie(["bun","run","m coverage","html"]);let t=Ie(["bun","run","docs:build"]);if(t!==0)console.error(`::error::${ns} build failed (exit ${t})`),process.exit(t);if(Xo(`${Vt}/index.html`))await ts(`${ae}/coverage`,{recursive:!0,force:!0}),await es(Vt,`${ae}/coverage`,{recursive:!0}),console.log(`\u2705 Coverage report copied to ${ae}/coverage`);else console.warn(`\u26A0\uFE0F ${Vt}/ not found \u2014 skipping /coverage/`);if(!e["skip-app"]){let n=Ie(["bun","run","m pages","build"]);if(n!==0)console.error(`::error::m pages build failed (exit ${n})`),process.exit(n);if(Xo(Ut))await ts(`${ae}/example`,{recursive:!0,force:!0}),await es(Ut,`${ae}/example`,{recursive:!0}),console.log(`\u2705 Pages artifact copied to ${ae}/example`);else console.warn(`\u26A0\uFE0F ${Ut}/ not found \u2014 skipping /example/`)}if(console.log(`
\u2705 Site ready: ${ae}`),console.log("   /            docs"),console.log("   /status      coverage, CI, versions"),console.log("   /coverage/   HTML coverage report"),!e["skip-app"])console.log("   /example/    demo app");process.exit(0)}})},async run({args:e}){await Qo(e.dir||".")}}),hc=fc});k();var bc={lint:()=>Promise.resolve().then(() => (rn(),{})).then((e)=>As),"lint:fix":()=>Promise.resolve().then(() => (an(),{})).then((e)=>_s),biome:()=>Promise.resolve().then(() => (cn(),{})).then((e)=>Ps),typecheck:()=>Promise.resolve().then(() => (ln(),{})).then((e)=>Ns),turbo:()=>Promise.resolve().then(() => (pn(),{})).then((e)=>js),build:()=>Promise.resolve().then(() => (pt(),{})).then((e)=>Vs),health:()=>Promise.resolve().then(() => (mn(),{})).then((e)=>Hs),bun:()=>Promise.resolve().then(() => (hn(),{})).then((e)=>oi),test:()=>Promise.resolve().then(() => (bn(),{})).then((e)=>si),coverage:()=>Promise.resolve().then(() => (Tn(),{})).then((e)=>Si),changeset:()=>Promise.resolve().then(() => (ht(),{})).then((e)=>Ii),setup:()=>Promise.resolve().then(() => (_n(),{})).then((e)=>Ui),ci:()=>Promise.resolve().then(() => (He(),{})).then((e)=>Qi),"ci:lint":()=>Promise.resolve().then(() => (Dn(),{})).then((e)=>Zi),"ci:local":()=>Promise.resolve().then(() => (jn(),{})).then((e)=>Xi),gitleaks:()=>Promise.resolve().then(() => (Ln(),{})).then((e)=>or),trivy:()=>Promise.resolve().then(() => (Bn(),{})).then((e)=>pr),codeql:()=>Promise.resolve().then(() => (Gn(),{})).then((e)=>ur),native:()=>Promise.resolve().then(() => (ao(),{})).then((e)=>na),e2e:()=>Promise.resolve().then(() => (lo(),{})).then((e)=>ia),unocss:()=>Promise.resolve().then(() => (mo(),{})).then((e)=>ga),pages:()=>Promise.resolve().then(() => (yo(),{})).then((e)=>Ea),skills:()=>Promise.resolve().then(() => (xo(),{})).then((e)=>Ba),badges:()=>Promise.resolve().then(() => ($o(),{})).then((e)=>Fa),docs:()=>os().then(() => ({})).then((e)=>hc)},yc=l({meta:{name:"m",version:"0.1.0",description:"Unified monorepo toolchain CLI"},subCommands:bc});ct(yc);

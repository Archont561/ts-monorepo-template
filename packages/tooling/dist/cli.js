#!/usr/bin/env bun
// @bun
var zs=Object.create;var{getPrototypeOf:Ys,defineProperty:Ut,getOwnPropertyNames:Qs}=Object;var Vt=Object.prototype.hasOwnProperty;function Zs(e){return this[e]}var Xs,eo,cc=(e,t,n)=>{var s=e!=null&&typeof e==="object";if(s){var o=t?Xs??=new WeakMap:eo??=new WeakMap,i=o.get(e);if(i)return i}n=e!=null?zs(Ys(e)):{};let r=t||!e||!e.__esModule||!Vt.call(e,"default")?Ut(n,"default",{value:e,enumerable:!0}):n;if(e&&typeof e==="object"||typeof e==="function"){for(let a of Qs(e))if(!Vt.call(r,a))Ut(r,a,{get:Zs.bind(e,a),enumerable:!0})}if(s)o.set(e,r);return r};var lc=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var f=(e,t,n)=>()=>{if(e)try{t=e(e=0)}catch(s){n=[s]}if(n)throw n[0];return t};function so(e=""){if(to.test(e))return;return e!==e.toLowerCase()}function Ht(e,t){let n=t??no,s=[];if(!e||typeof e!=="string")return s;let o="",i,r;for(let a of e){let c=n.includes(a);if(c===!0){s.push(o),o="",i=void 0;continue}let u=so(a);if(r===!1){if(i===!1&&u===!0){s.push(o),o=a,i=u;continue}if(i===!0&&u===!1&&o.length>1){let p=o.at(-1);s.push(o.slice(0,Math.max(0,o.length-1))),o=p+a,i=u;continue}}o+=a,i=u,r=c}return s.push(o),s}function oo(e){return e?e[0].toUpperCase()+e.slice(1):""}function io(e){return e?e[0].toLowerCase()+e.slice(1):""}function ro(e,t){return e?(Array.isArray(e)?e:Ht(e)).map((n)=>oo(t?.normalize?n.toLowerCase():n)).join(""):""}function ge(e,t){return io(ro(e||"",t))}function _e(e,t){return e?(Array.isArray(e)?e:Ht(e)).map((n)=>n.toLowerCase()).join(t??"-"):""}function qt(e){return _e(e||"","_")}var to,no;var Wt=f(()=>{to=/\d/,no=["-","_","/","."]});import{parseArgs as ao}from"util";function fe(e){if(Array.isArray(e))return e;return e===void 0?[]:[e]}function tt(e,t=""){let n=[];for(let s of e)for(let[o,i]of s.entries())n[o]=Math.max(n[o]||0,i.length);return e.map((s)=>s.map((o,i)=>t+o[i===0?"padStart":"padEnd"](n[i])).join("  ")).join(`
`)}function _(e){return typeof e==="function"?e():e}function co(e=[],t={}){let n=new Set(t.boolean||[]),s=new Set(t.string||[]),o=t.alias||{},i=t.default||{},r=new Map,a=new Map;for(let[d,h]of Object.entries(o)){let A=h;for(let B of A){if(r.set(d,B),!a.has(B))a.set(B,[]);if(a.get(B).push(d),r.set(B,d),!a.has(d))a.set(d,[]);a.get(d).push(B)}}let c={};function u(d){if(n.has(d))return"boolean";let h=a.get(d)||[];for(let A of h)if(n.has(A))return"boolean";return"string"}function p(d){if(s.has(d))return!0;let h=a.get(d)||[];for(let A of h)if(s.has(A))return!0;return!1}let w=new Set([...n,...s,...Object.keys(o),...Object.values(o).flat(),...Object.keys(i)]);for(let d of w)if(!c[d])c[d]={type:u(d),default:i[d]};for(let[d,h]of r.entries())if(d.length===1&&c[h]&&!c[h].short)c[h].short=d;let b=[],m={};for(let d=0;d<e.length;d++){let h=e[d];if(h==="--"){b.push(...e.slice(d));break}if(h.startsWith("--no-")){let A=h.slice(5);m[A]=!0;continue}b.push(h)}let C;try{C=ao({args:b,options:Object.keys(c).length>0?c:void 0,allowPositionals:!0,strict:!1})}catch{C={values:{},positionals:b}}let y={_:[]};y._=C.positionals;for(let[d,h]of Object.entries(C.values)){let A=h;if(u(d)==="boolean"&&typeof h==="string")A=h!=="false";else if(p(d)&&typeof h==="boolean")A="";y[d]=A}for(let[d]of Object.entries(m)){y[d]=!1;let h=r.get(d);if(h)y[h]=!1;let A=a.get(d);if(A)for(let B of A)y[B]=!1}for(let[d,h]of r.entries()){if(y[d]!==void 0&&y[h]===void 0)y[h]=y[d];if(y[h]!==void 0&&y[d]===void 0)y[d]=y[h];if(y[d]!==y[h]&&i[h]===y[h])y[h]=y[d]}return y}function po(e,t){let n={boolean:[],string:[],alias:{},default:{}},s=zt(t);for(let a of s){if(a.type==="positional")continue;if(a.type==="string"||a.type==="enum")n.string.push(a.name);else if(a.type==="boolean")n.boolean.push(a.name);if(a.default!==void 0)n.default[a.name]=a.default;if(a.alias)n.alias[a.name]=a.alias;let c=ge(a.name),u=_e(a.name);if(c!==a.name||u!==a.name){let p=fe(n.alias[a.name]||[]);if(c!==a.name&&!p.includes(c))p.push(c);if(u!==a.name&&!p.includes(u))p.push(u);if(p.length>0)n.alias[a.name]=p}}let o=co(e,n),[...i]=o._,r=new Proxy(o,{get(a,c){return a[c]??a[ge(c)]??a[_e(c)]}});for(let[,a]of s.entries())if(a.type==="positional"){let c=i.shift();if(c!==void 0)r[a.name]=c;else if(a.default===void 0&&a.required!==!1)throw new F(`Missing required positional argument: ${a.name.toUpperCase()}`,"EARG");else r[a.name]=a.default}else if(a.type==="enum"){let c=r[a.name],u=a.options||[];if(c!==void 0&&u.length>0&&!u.includes(c))throw new F(`Invalid value for argument: ${D(`--${a.name}`)} (${D(c)}). Expected one of: ${u.map((p)=>D(p)).join(", ")}.`,"EARG")}else if(a.required&&r[a.name]===void 0)throw new F(`Missing required argument: --${a.name}`,"EARG");return r}function zt(e){let t=[];for(let[n,s]of Object.entries(e||{}))t.push({...s,name:n,alias:fe(s.alias)});return t}async function uo(e){return Promise.all(e.map((t)=>_(t)))}function l(e){return e}async function H(e,t){let n=await _(e.args||{}),s=po(t.rawArgs,n),o={rawArgs:t.rawArgs,args:s,data:t.data,cmd:e},i=await uo(e.plugins??[]),r,a;try{for(let p of i)await p.setup?.(o);if(typeof e.setup==="function")await e.setup(o);let u=await _(e.subCommands);if(u&&Object.keys(u).length>0){let p=Yt(t.rawArgs,n),w=t.rawArgs[p];if(w){let b=await ot(u,w);if(!b)throw new F(`Unknown command ${D(w)}`,"E_UNKNOWN_COMMAND");await H(b,{rawArgs:t.rawArgs.slice(p+1)})}else{let b=await _(e.default);if(b){if(e.run)throw new F("Cannot specify both 'run' and 'default' on the same command.","E_DEFAULT_CONFLICT");let m=await ot(u,b);if(!m)throw new F(`Default sub command ${D(b)} not found in subCommands.`,"E_UNKNOWN_COMMAND");await H(m,{rawArgs:t.rawArgs})}else if(!e.run)throw new F("No command specified.","E_NO_COMMAND")}}if(typeof e.run==="function")r=await e.run(o)}catch(u){a=u}let c=[];if(typeof e.cleanup==="function")try{await e.cleanup(o)}catch(u){c.push(u)}for(let u of[...i].reverse())try{await u.cleanup?.(o)}catch(p){c.push(p)}if(a)throw a;if(c.length===1)throw c[0];if(c.length>1)throw Error("Multiple cleanup errors",{cause:c});return{result:r}}async function st(e,t,n){let s=await _(e.subCommands);if(s&&Object.keys(s).length>0){let o=Yt(t,await _(e.args||{})),i=t[o],r=await ot(s,i);if(r)return st(r,t.slice(o+1),e)}return[e,n]}async function ot(e,t){if(t in e)return _(e[t]);for(let n of Object.values(e)){let s=await _(n),o=await _(s?.meta);if(o?.alias){if(fe(o.alias).includes(t))return s}}}function Yt(e,t){for(let n=0;n<e.length;n++){let s=e[n];if(s==="--")return-1;if(s.startsWith("-")){if(!s.includes("=")&&mo(s,t))n++;continue}return n}return-1}function mo(e,t){let n=e.replace(/^-{1,2}/,""),s=ge(n);for(let[o,i]of Object.entries(t)){if(i.type!=="string"&&i.type!=="enum")continue;if(s===ge(o))return!0;if((Array.isArray(i.alias)?i.alias:i.alias?[i.alias]:[]).includes(n))return!0}return!1}async function Qt(e,t){try{console.log(await Zt(e,t)+`
`)}catch(n){console.error(n)}}async function Zt(e,t){let n=await _(e.meta||{}),s=zt(await _(e.args||{})),o=await _(t?.meta||{}),i=`${o.name?`${o.name} `:""}`+(n.name||process.argv[1]),r=[],a=[],c=[],u=[];for(let m of s)if(m.type==="positional"){let C=m.name.toUpperCase(),y=m.required!==!1&&m.default===void 0;a.push([D(C+nt(m)),Jt(m,y)]),u.push(y?`<${C}>`:`[${C}]`)}else{let C=m.required===!0&&m.default===void 0,y=[...(m.alias||[]).map((d)=>`-${d}`),`--${m.name}`].join(", ")+nt(m);if(r.push([D(y),Jt(m,C)]),m.type==="boolean"&&(m.default===!0||m.negativeDescription)&&!go.test(m.name)){let d=[...(m.alias||[]).map((h)=>`--no-${h}`),`--no-${m.name}`].join(", ");r.push([D(d),[m.negativeDescription,C?Ie("(Required)"):""].filter(Boolean).join(" ")])}if(C)u.push(`--${m.name}`+nt(m))}if(e.subCommands){let m=[],C=await _(e.subCommands);for(let[y,d]of Object.entries(C)){let h=await _((await _(d))?.meta);if(h?.hidden)continue;let A=fe(h?.alias),B=[y,...A].join(", ");c.push([D(B),h?.description||""]),m.push(y,...A)}u.push(m.join("|"))}let p=[],w=n.version||o.version;p.push(Ie(`${n.description} (${i+(w?` v${w}`:"")})`),"");let b=r.length>0||a.length>0;if(p.push(`${Pe(Oe("USAGE"))} ${D(`${i}${b?" [OPTIONS]":""} ${u.join(" ")}`)}`,""),a.length>0)p.push(Pe(Oe("ARGUMENTS")),""),p.push(tt(a,"  ")),p.push("");if(r.length>0)p.push(Pe(Oe("OPTIONS")),""),p.push(tt(r,"  ")),p.push("");if(c.length>0)p.push(Pe(Oe("COMMANDS")),""),p.push(tt(c,"  ")),p.push("",`Use ${D(`${i} <command> --help`)} for more information about a command.`);return p.filter((m)=>typeof m==="string").join(`
`)}function nt(e){let t=e.valueHint?`=<${e.valueHint}>`:"",n=t||`=<${qt(e.name)}>`;if(!e.type||e.type==="positional"||e.type==="boolean")return t;if(e.type==="enum"&&e.options?.length)return`=<${e.options.join("|")}>`;return n}function Jt(e,t){let n=t?Ie("(Required)"):"",s=e.default===void 0?"":Ie(`(Default: ${e.default})`);return[e.description,n,s].filter(Boolean).join(" ")}async function it(e,t={}){let n=t.rawArgs||process.argv.slice(2),s=t.showUsage||Qt;try{let o=await fo(e);if(o.help.length>0&&n.some((i)=>o.help.includes(i)))await s(...await st(e,n)),process.exit(0);else if(n.length===1&&o.version.includes(n[0])){let i=typeof e.meta==="function"?await e.meta():await e.meta;if(!i?.version)throw new F("No version specified","E_NO_VERSION");console.log(i.version)}else await H(e,{rawArgs:n})}catch(o){if(o instanceof F)await s(...await st(e,n)),console.error(o.message);else console.error(o,`
`);process.exit(1)}}async function fo(e){let t=await _(e.args||{}),n=new Set,s=new Set;for(let[o,i]of Object.entries(t)){n.add(o);for(let r of fe(i.alias))s.add(r)}return{help:Kt("help","h",n,s),version:Kt("version","v",n,s)}}function Kt(e,t,n,s){if(n.has(e)||s.has(e))return[];if(n.has(t)||s.has(t))return[`--${e}`];return[`--${e}`,`-${t}`]}var F,lo,Ne=(e,t=39)=>(n)=>lo?n:`\x1B[${e}m${n}\x1B[${t}m`,Oe,D,Ie,Pe,go;var De=f(()=>{Wt();F=class extends Error{code;constructor(e,t){super(e);this.name="CLIError",this.code=t}};lo=(()=>{let e=globalThis.process?.env??{};return e.NO_COLOR==="1"||e.TERM==="dumb"||e.TEST||e.CI})(),Oe=Ne(1,22),D=Ne(36),Ie=Ne(90),Pe=Ne(4,24);go=/^no[-A-Z]/});var{spawnSync:ho}=globalThis.Bun;function g(e,t={}){return ho({cmd:e,...t.cwd?{cwd:t.cwd}:{},env:{...process.env},stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}function je(e,t,n){if(!Bun.which(e)){for(let s of n)console.warn(s);return 0}return g(t)}function N(e){return l({meta:{name:e.name,version:e.version??"1.0.0",description:e.description},subCommands:e.subCommands,args:{[e.argsName??"args"]:{type:"positional",description:e.argsDescription??"Extra args passed to underlying tool",required:!1}},run(){let t=v(e.name),n=e.configArgs??[],s=e.passthrough?[e.binPath,...t]:e.configArgsPlacement==="append"?[e.binPath,...t,...n]:[e.binPath,...n,...t];process.exit(g(s))}})}function U(e){let t=e.argsDescription?{args:{args:{type:"positional",description:e.argsDescription,required:!1}}}:{};return l({meta:{name:e.name,description:e.description},...t,run(){let n=v(e.name),s=n.length===0&&e.defaultArgs?e.defaultArgs:n;process.exit(e.spawn([...e.prefixArgs??[],...s]))}})}function v(e){let t=process.argv.slice(2),n=t.lastIndexOf(e);return n===-1?t:t.slice(n+1)}var k=f(()=>{De();De()});import{existsSync as Xt,readFileSync as en}from"fs";import{dirname as tn,join as ae}from"path";function Q(e=import.meta.dir){let t=e;while(!0){let n=ae(t,"package.json");if(Xt(n))try{if(JSON.parse(en(n,"utf8")).name===bo)return t}catch{}let s=tn(t);if(s===t)break;t=s}return e}function Le(e=process.cwd()){let t=e;while(!0){let n=ae(t,"package.json");if(Xt(n))try{if(JSON.parse(en(n,"utf8")).workspaces)return t}catch{}let s=tn(t);if(s===t)return e;t=s}}function Z(){return ae(Q(),"src","configs")}function I(e){return ae(Z(),e)}function Me(...e){return ae(Q(),"src",...e)}function nn(){return ae(Q(),"skills")}var bo="@myorg/tooling",yo="packages/tooling",xc;var O=f(()=>{xc=`${yo}/src/configs`});var vo,wo;var sn=f(()=>{O();k();vo=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),wo=N({name:"lint",version:"1.0.0",description:"Lint and format check (Biome, shared config)",binPath:vo,configArgs:["check",`--config-path=${Z()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to check (default: whole repo)"})});var ko,xo;var on=f(()=>{O();k();ko=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),xo=N({name:"lint:fix",version:"1.0.0",description:"Lint and format, applying safe fixes (Biome, shared config)",binPath:ko,configArgs:["check","--write",`--config-path=${Z()}`],configArgsPlacement:"append",argsName:"paths",argsDescription:"Optional paths to fix (default: whole repo)"})});var Co,So;var rn=f(()=>{O();k();Co=Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),So=N({name:"biome",version:"1.0.0",description:"Biome with baked config path \u2014 lint and format, no root biome.json needed",binPath:Co,configArgs:[`--config-path=${Z()}`],configArgsPlacement:"append",argsName:"command",argsDescription:"Biome command (check, lint, format, etc.)"})});var $o,Ro;var an=f(()=>{k();$o=Bun.fileURLToPath(import.meta.resolve("typescript/package.json").replace("package.json","bin/tsc")),Ro=N({name:"typecheck",version:"1.0.0",description:"TypeScript wrapper \u2014 tsc owned by @myorg/tooling, use m typecheck not tsc",binPath:"bun",configArgs:[$o],argsName:"args",argsDescription:"tsc args"})});var Ao,Eo;var cn=f(()=>{O();k();Ao=Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));process.env.TURBO_GLOBAL_WARNING_DISABLED="1";Eo=N({name:"turbo",version:"1.0.0",description:"Turbo with baked root config \u2014 no root turbo.json needed, uses turbo.base.json",binPath:"bun",configArgs:[Ao,`--root-turbo-json=${I("turbo.base.json")}`],argsName:"task",argsDescription:"Turbo task (build, dev, test, typecheck, etc.)"})});import{existsSync as To,readFileSync as ln}from"fs";var{Glob:_o}=globalThis.Bun;function Oo(){try{let e=JSON.parse(ln("package.json","utf8")),t=Array.isArray(e.workspaces)?e.workspaces.filter((n)=>typeof n==="string"):[];if(t.length>0)return t}catch{}return["packages/*","apps/*"]}function Po(){let e=[];for(let t of Oo())for(let n of new _o(`${t}/package.json`).scanSync("."))try{if(JSON.parse(ln(n,"utf8")).private===!0)continue;let o=n.replace("/package.json","");if(To(`${o}/package.json`))e.push(o)}catch{}return e.sort()}var rt,Io,No,Do;var at=f(()=>{k();rt=l({meta:{name:"health",description:"publint + arethetypeswrong over every publishable package"},run(){let e=Po();if(e.length===0)console.log("\u2139\uFE0F No publishable packages \u2014 skipping package health checks"),process.exit(0);console.log(`\uD83D\uDD28 Building before health checks (${e.length} package(s))`);let t=g(["bun","run","build"]);if(t!==0)console.error("::error::build failed, cannot run package health checks"),process.exit(t);let n=0;for(let s of e){if(console.log(`
\uD83D\uDCE6 ${s}`),g(["bunx","--yes","publint",s])!==0)console.error(`::error::publint failed for ${s}`),n++;if(g(["bunx","--yes","@arethetypeswrong/cli","--pack",".","--profile","esm-only"],{cwd:s})!==0)console.error(`::error::arethetypeswrong failed for ${s}`),n++}if(n>0)console.error(`
::error::${n} package health check(s) failed`),process.exit(1);console.log(`
\u2705 Package health OK (${e.length} package(s))`),process.exit(0)}}),Io=Bun.fileURLToPath(import.meta.resolve("bunup/package.json").replace("package.json","dist/cli/index.js")),No=N({name:"build",version:"1.0.0",description:"Bunup wrapper \u2014 bundler owned by @myorg/tooling, use m build not bunup",binPath:"bun",configArgs:[Io],argsName:"entry",argsDescription:"Entry files or bunup args",subCommands:{health:rt}}),Do=No});var jo;var pn=f(()=>{at();jo=rt});import{existsSync as un,readdirSync as Lo,rmSync as Mo}from"fs";var{which:Bo}=globalThis.Bun;async function mn(){if(!Bo("bun"))console.error("m bun coverage needs `bun` on PATH."),process.exit(1);console.log(`Running per-package coverage via turbo...
`),process.exit(g([...Go,"coverage"]))}function dn(){let e=["apps","packages","configs"],t=0;for(let n of e){if(!un(n))continue;for(let s of Lo(n,{withFileTypes:!0})){if(!s.isDirectory())continue;let o=`${n}/${s.name}/node_modules`;if(!un(o))continue;Mo(o,{recursive:!0,force:!0}),t++}}console.log(`\uD83E\uDDF9 Removed ${t} workspace node_modules dir(s) (root node_modules kept)`)}var ct,Go,X,Fo,Uo,Vo,he,Ho,qo,Wo,Jo,Ko,zo;var gn=f(()=>{O();k();ct=I("bunfig.toml"),Go=["bun",`${Q()}/src/cli.ts`,"turbo"];X=v("bun"),Fo=["coverage","test","clean:modules"],Uo=X.includes("--help")||X.includes("-h"),Vo=X.includes("--version")||X.includes("-v"),he=X[0],Ho=process.argv.slice(2).includes("bun");if(Ho&&he&&!Fo.includes(he)&&!he.startsWith("-")&&!Uo&&!Vo){let e=he==="test"?["bun",he,`--config=${ct}`,...X.slice(1)]:["bun",...X];process.exit(g(e))}qo=l({meta:{name:"coverage",description:"Run per-package coverage via turbo then merge LCOV"},run:async()=>{await mn()}}),Wo=l({meta:{name:"clean:modules",description:"Remove workspace node_modules dirs (keeps the root one)"},run(){dn(),process.exit(0)}}),Jo=l({meta:{name:"test",description:"Run bun test with shared bunfig.toml config"},run(){let e=v("test");process.exit(g(["bun","test",`--config=${ct}`,...e]))}}),Ko=l({meta:{name:"bun",version:"1.0.0",description:"Bun wrapper \u2014 injects shared bunfig.toml for test, provides coverage merging"},subCommands:{coverage:qo,test:Jo,"clean:modules":Wo},async run(){let e=v("bun"),t=e[0];if(t==="coverage"){await mn();return}if(t==="clean:modules")dn(),process.exit(0);let n=t==="test"?["bun",t,`--config=${ct}`,...e.slice(1)]:["bun",...e];process.exit(g(n))}}),zo=Ko});var Yo;var fn=f(()=>{O();k();Yo=l({meta:{name:"test",description:"Run bun test with the shared bunfig.toml config"},args:{args:{type:"positional",description:"Extra args for bun test",required:!1}},run(){let e=process.argv.slice(2),t=e.lastIndexOf("test"),n=t===-1?[]:e.slice(t+1);process.exit(g(["bun","test",`--config=${I("bunfig.toml")}`,...n]))}})});var S="coverage/lcov.info",ce="coverage/rust-lcov.info",q="coverage/html",be=80;var hn=()=>{};import{existsSync as j,mkdirSync as yn,readdirSync as Qo,readFileSync as vn,renameSync as lt,writeFileSync as Zo}from"fs";import{dirname as Xo,join as bn}from"path";var{which:ei}=globalThis.Bun;function W(e){return Boolean(ei(e))}function Be(e=S){if(!j(e))return null;let t=0,n=0;for(let s of vn(e,"utf8").split(`
`))if(s.startsWith("LF:"))n+=Number(s.slice(3));else if(s.startsWith("LH:"))t+=Number(s.slice(3));if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function ni(e){let t=0,n=0;for(let s of e){let o=Be(s);if(!o)continue;t+=o.hit,n+=o.found}if(!n)return null;return{hit:t,found:n,percent:t/n*100}}function kn(){return`{${[...wn].join(",")}}/*/coverage/lcov.info`}function xn(e="."){let t=new Bun.Glob(kn());return Array.from(t.scanSync({cwd:e})).filter(Boolean).map((n)=>e==="."?n:`${e}/${n}`).sort()}function si(e,t){return e>=t}function oi(e="."){let t=[];for(let n of[...wn]){let s=bn(e,n);if(!j(s))continue;for(let o of Qo(s,{withFileTypes:!0})){if(!o.isDirectory())continue;let i=bn(s,o.name,"package.json");if(!j(i))continue;let r;try{r=JSON.parse(vn(i,"utf8"))}catch{continue}if(!r.name||!(r.scripts?.test||r.scripts?.coverage))continue;t.push({name:r.name.replace(/^@[^/]+\//,""),dir:`${n}/${o.name}`})}}return t.sort((n,s)=>n.dir.localeCompare(s.dir))}function ii(e,t){let n=["# Generated by `m coverage sync` (packages/tooling) \u2014 do not edit.","# Refreshed on every `bun install` (prepare) and by `bun run docs:sync`.","codecov:","  require_ci_to_pass: true","  notify:","    wait_for_ci: true","","coverage:","  precision: 2","  round: down",'  range: "70...100"',"  status:","    # Overall monorepo gate \u2014 mirrors COVERAGE_THRESHOLD.","    project:","      default:",`        target: ${t}%`,"        threshold: 1%","    # Patch coverage on PRs.","    patch:","      default:",`        target: ${t}%`,"        threshold: 5%","","flag_management:","  default_rules:","    carryforward: true","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 1%","","component_management:","  default_rules:","    statuses:","      - type: project",`        target: ${t}%`,"        threshold: 2%","  individual_components:"];for(let s of e)n.push(`    - component_id: ${s.name}`,`      name: ${s.dir}`,"      paths:",`        - "${s.dir}/**"`);return n.push("","comment:",'  layout: "reach,diff,flags,components,tree"',"  behavior: default","  require_changes: true","  show_carryforward_flags: true",""),n.join(`
`)}function ri(e,t){let n=(s)=>s?`${s.percent.toFixed(2)}% (${s.hit}/${s.found})`:"\u2014";return["## \uD83D\uDCCA Coverage Summary","","| Package | Lines |","|---------|-------|",...e.map((s)=>`| \`${s.dir}\` | ${n(s.totals)} |`),...t?[`| **merged** | **${n(t)}** |`]:[],""].join(`
`)}function Cn(){if(W("lcov")&&W("genhtml")){console.log("\u2705 lcov already installed");return}let e=1;if(process.platform==="darwin")e=g(["brew","install","lcov"]);else{let t=W("sudo")?["sudo","apt-get"]:["apt-get"];e=g([...t,"update"])===0?g([...t,"install","-y","lcov"]):1}if(e===0)console.log("\u2705 lcov installed");else console.warn("\u26A0\uFE0F lcov install failed \u2014 HTML reports will be skipped (threshold check still runs)")}function Sn(e=q){if(!j(S)){console.warn(`\u26A0\uFE0F ${S} not found \u2014 skipping HTML report`);return}if(!W("genhtml")){console.warn("\u26A0\uFE0F genhtml not found \u2014 run `m coverage setup` first (HTML report skipped)");return}yn(e,{recursive:!0});let t=g(["genhtml",S,"--output-directory",e,"--title","Coverage Report","--show-details","--highlight","--legend"]);if(t===0)console.log(`
\u2705 HTML report: ${e}/index.html`);process.exit(t)}var ti,wn,ai,ci,li,pi,ui,mi,di,gi,fi,hi;var $n=f(()=>{k();hn();ti=`${q}/index.html`;wn=["packages","apps"];ai=l({meta:{name:"setup",description:"Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)"},run(){Cn(),process.exit(0)}}),ci=l({meta:{name:"html",description:"Generate HTML report via genhtml from coverage/lcov.info"},args:{out:{type:"string",description:`Output directory (default: ${q})`,default:q}},run({args:e}){Sn(e.out||q),process.exit(0)}}),li=l({meta:{name:"check",description:`Check coverage threshold (default ${be}%) against coverage/lcov.info`},args:{threshold:{type:"string",description:"Threshold percent",default:String(be)}},run({args:e}){let t=Be();if(!t){console.warn(`\u26A0\uFE0F ${S} not found or has no line data \u2014 skipping threshold check`);return}let n=Number(e.threshold??be),s=t.percent;if(console.log(`Line coverage: ${s.toFixed(2)}% (${t.hit}/${t.found} lines) \u2014 threshold ${n}%`),!si(s,n))console.error(`::error::Coverage ${s.toFixed(2)}% is below ${n}% threshold`),process.exit(1);console.log(`\u2705 Coverage ${s.toFixed(2)}% meets threshold`),process.exit(0)}}),pi=l({meta:{name:"collect",description:"Collect JS coverage (bun run coverage) + Rust coverage (m native llvm-cov), then merge"},run(){if(g(["bun","run","coverage"]),!j("packages/native/Cargo.toml")||!W("cargo-llvm-cov"))console.warn("\u26A0\uFE0F cargo-llvm-cov not installed \u2014 skipping Rust coverage"),process.exit(0);if(console.log("\uD83E\uDD80 Collecting Rust coverage via m native llvm-cov"),g(["m native","llvm-cov","--lcov","--output-path",`../../${ce}`]),!j(ce))process.exit(0);if(!j(S))lt(ce,S),process.exit(0);if(W("lcov")){if(g(["lcov","--add-tracefile",S,"--add-tracefile",ce,"--output-file","coverage/merged.lcov"])===0)lt("coverage/merged.lcov",S),console.log("\u2705 Merged Rust + JS coverage"),process.exit(0)}console.warn(`\u26A0\uFE0F lcov not available \u2014 Rust coverage kept at ${ce}`)}}),ui=l({meta:{name:"pages",description:"Publish the HTML report into the Pages artifact dir (served at /coverage/)"},async run(){if(!j(S))console.log("\u2139\uFE0F No coverage data \u2014 collecting first"),g(["bun","run","coverage"]);if(!j(S))console.warn("\u26A0\uFE0F Still no coverage/lcov.info \u2014 skipping Pages coverage"),process.exit(0);if(Cn(),Sn(),!j(ti))console.warn(`\u26A0\uFE0F No HTML report at ${q} \u2014 skipping Pages coverage`),process.exit(0);console.log(`\u2705 Coverage HTML ready at ${q}/ \u2014 \`m pages build\` folds it into the Pages artifact (served at /coverage/)`),process.exit(0)}}),mi=l({meta:{name:"merge",description:"Merge per-package lcov.info reports into coverage/lcov.info"},args:{output:{type:"string",description:"Merged output file (default: coverage/lcov.info)",default:S},reportOnly:{type:"boolean",description:"Print the merged totals and the delta, write nothing",default:!1}},run({args:e}){let t=xn(".");if(t.length===0)console.warn("No per-package lcov.info found \u2014 nothing to merge"),process.exit(0);let n=e.output||S;if(e.reportOnly){let r=ni(t),a=r?`${r.percent.toFixed(2)}% (${r.hit}/${r.found} lines)`:"no data";console.log("Report-only: the merge would measure"),console.log(`  ${t.length} report(s) \u2192 ${a}`),process.exit(0)}yn(Xo(n),{recursive:!0}),console.log(`Merging ${t.length} report(s) \u2192 ${n}`);let s=null;try{s=Bun.fileURLToPath(import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"))}catch{s=null}if(s){if(g(["bun",s,kn(),n,"--prepend-source-files"])===0)console.log(`\u2705 Merged: ${n}`),process.exit(0);console.warn("\u26A0\uFE0F lcov-result-merger failed \u2014 falling back to lcov --add-tracefile")}if(!W("lcov"))console.error("\u274C lcov not found \u2014 run `m coverage setup` first"),process.exit(1);let o="coverage/merged.lcov",i=t.flatMap((r)=>["--add-tracefile",r]).concat(["--output-file",o]);if(g(["lcov",...i])!==0)console.error("\u274C Coverage merge failed"),process.exit(1);lt(o,n),console.log(`\u2705 Merged: ${n}`),process.exit(0)}}),di=l({meta:{name:"summary",description:"Show coverage summary (--json for scripts, --markdown for step summaries)"},args:{json:{type:"boolean",description:"Print JSON instead of a human-readable line"},markdown:{type:"boolean",description:"Print a per-package markdown table (for $GITHUB_STEP_SUMMARY)"}},run({args:e}){let t=Be();if(e.markdown){let n=xn(".").map((s)=>({dir:s.replace(/\/coverage\/lcov\.info$/,""),totals:Be(s)}));console.log(ri(n,t)),process.exit(0)}if(e.json)console.log(JSON.stringify({source:S,available:Boolean(t),lines:{hit:t?.hit??0,found:t?.found??0,percent:t?Number(t.percent.toFixed(2)):0}})),process.exit(0);if(W("lcov")&&j(S))process.exit(g(["lcov","--summary",S]));if(!t)console.warn(`\u26A0\uFE0F ${S} not found`),process.exit(0);console.log(`lines: ${t.percent.toFixed(1)}% (${t.hit}/${t.found})`),process.exit(0)}}),gi=l({meta:{name:"sync",description:"Regenerate the root codecov.yml from the workspace package list"},args:{output:{type:"string",description:"Output file (default: codecov.yml)",default:"codecov.yml"}},run({args:e}){let t=e.output||"codecov.yml",n=oi(".");Zo(t,ii(n,be)),console.log(`\u2705 ${t} \u2014 ${n.length} component(s): ${n.map((s)=>s.dir).join(", ")}`),process.exit(0)}}),fi=l({meta:{name:"m coverage",version:"1.0.0",description:"Coverage reporting \u2014 collect, merge, HTML, threshold check, Codecov, Pages publishing"},subCommands:{setup:ai,collect:pi,html:ci,check:li,pages:ui,merge:mi,summary:di,sync:gi},run(){console.log(`
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
`)}}),hi=fi});import{mkdir as bi}from"fs/promises";var{file:pt,write:yi}=globalThis.Bun;async function mt(e="changeset"){if(e!=="changeset")throw Error(`Unknown init target '${e}' (expected "changeset")`);let t=".changeset/config.json",n=I("changeset.config.json");if(await pt(t).exists()){console.log("Changeset config already exists; skipping.");return}if(!await pt(n).exists())return;await bi(".changeset",{recursive:!0}),await yi(t,await pt(n).text())}var Rn,le,vi,ut,wi,ki,xi,Ci,Si,$i;var dt=f(()=>{O();k();Rn=Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js")),le=v("changeset"),vi=["init"],ut=le[0],wi=le.includes("--help")||le.includes("-h"),ki=le.includes("--version")||le.includes("-v"),xi=process.argv.slice(2).includes("changeset");if(xi&&ut&&!vi.includes(ut)&&!ut.startsWith("-")&&!wi&&!ki)process.exit(g(["bun",Rn,...le]));Ci=l({meta:{name:"init",description:"Ensure .changeset/config.json exists from shared template"},args:{target:{type:"positional",description:"Init target (default: changeset)",required:!1,default:"changeset"}},async run({args:e}){await mt(e.target??"changeset"),process.exit(0)}}),Si=l({meta:{name:"changeset",version:"1.0.0",description:"Changesets wrapper \u2014 init config and delegate to @changesets/cli"},subCommands:{init:Ci},run(){process.exit(g(["bun",Rn,...v("changeset")]))}}),$i=Si});var{$:Ri,write:Ai}=globalThis.Bun;async function gt(e="lefthook"){if(e!=="lefthook")throw Error(`Unknown setup target '${e}' (expected "lefthook")`);await Ai("lefthook.yml",`extends:
  - ${"node_modules/@myorg/tooling/src/configs/lefthook.yml"}
`),await Ri`bunx lefthook install`.quiet().nothrow(),I("lefthook.yml")}var Ei,Ti,_i,Oi;var An=f(()=>{O();k();Ei=l({meta:{name:"lefthook",description:"Regenerate lefthook.yml wrapper and install Git hooks"},args:{target:{type:"positional",description:"Setup target (default: lefthook)",required:!1,default:"lefthook"}},async run({args:e}){await gt(e.target??"lefthook")}}),Ti=l({meta:{name:"bins",description:"Link m-bins into node_modules/.bin (handled by bun install)"},run(){console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.")}}),_i=l({meta:{name:"setup",version:"1.0.0",description:"Setup CLI \u2014 regenerates lefthook.yml, installs hooks, ensures changeset config"},subCommands:{lefthook:Ei,bins:Ti},args:{target:{type:"positional",description:"Target (lefthook, bins, or empty for full setup)",required:!1}},async run({args:e}){let t=v("setup"),n=e.target??t[0]??"lefthook";if(n==="lefthook"){await gt("lefthook");return}if(n==="bins")return;await gt("lefthook");await Promise.resolve().then(() => dt());await mt("changeset").catch(()=>{})}}),Oi=_i});function ft(e){let t=Bun.fileURLToPath(import.meta.resolve("github-actionlint/dist/bin/actionlint.js"));return g(["bun",t,`-config-file=${I("actionlint.yaml")}`,...e])}function Ge(e){let t=Bun.which("act");if(!t)return console.error(`
'act' is not installed.

act runs GitHub Actions locally via Docker.

Install:
  brew install act                          # macOS
  sudo apt install act                      # Debian/Ubuntu
  go install github.com/nektos/act@latest   # Go
  scoop install act                         # Windows

Then ensure Docker is running and try again.
`),1;return g([t,...Pi,...e])}var Pi,Ii,Ni,Di,ji;var Fe=f(()=>{O();k();Pi=["-P","ubuntu-latest=catthehacker/ubuntu:act-latest","--container-architecture","linux/amd64"];Ii=U({name:"lint",description:"Validate workflows via actionlint with shared config",argsDescription:"Extra args for actionlint",spawn:ft}),Ni=U({name:"act",description:"Run GitHub Actions locally via act with baked-in flags",argsDescription:"Extra args for act",spawn:Ge}),Di=l({meta:{name:"ci",version:"1.0.0",description:"CI tooling for GitHub Actions \u2014 lint workflows and run locally with act"},subCommands:{lint:Ii,act:Ni},run(){let e=v("ci");if(e.length>0&&e[0]?.startsWith("-"))Ge(e);else console.log(`
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
`)}}),ji=Di});var Li;var En=f(()=>{k();Fe();Li=l({meta:{name:"ci:lint",description:"Validate workflows via actionlint with shared config"},args:{args:{type:"positional",description:"Extra args for actionlint",required:!1}},run(){process.exit(ft(v("ci:lint")))}})});var Mi;var Tn=f(()=>{k();Fe();Mi=l({meta:{name:"ci:local",description:"Run the push workflow locally via act"},args:{args:{type:"positional",description:"Extra args for act",required:!1}},run(){process.exit(Ge(["push",...v("ci:local")]))}})});function ht(e){return je("gitleaks",["gitleaks",...e],Bi)}var Bi,Gi,Fi,Ui,Vi;var _n=f(()=>{k();Bi=["\u26A0\uFE0F gitleaks not found \u2014 skipping (install: brew install gitleaks or https://github.com/gitleaks/gitleaks)","   Docker fallback: docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source /path"];Gi=U({name:"detect",description:"gitleaks detect --source . --no-git (scan repo)",prefixArgs:["detect"],defaultArgs:["--source",".","--no-git","--verbose"],spawn:ht}),Fi=U({name:"protect",description:"gitleaks protect --staged (scan staged changes, pre-commit)",prefixArgs:["protect"],defaultArgs:["--staged","--verbose"],spawn:ht}),Ui=l({meta:{name:"gitleaks",version:"1.0.0",description:"Gitleaks wrapper \u2014 secret scanning, defensive (skips if binary missing)"},subCommands:{detect:Gi,protect:Fi},run(){let e=v("gitleaks");if(e.length===0)console.log(`
m gitleaks \u2014 secret scanning wrapper

Usage:
  m gitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  m gitleaks protect [args]  # scan staged (default: --staged --verbose)

Install:
  brew install gitleaks
  go install github.com/gitleaks/gitleaks/v8@latest
  docker pull zricethezav/gitleaks:latest

If gitleaks is not installed, this wrapper warns and exits 0 (does not block).
`),process.exit(0);process.exit(ht(e))}}),Vi=Ui});import{existsSync as Hi}from"fs";var{which:qi}=globalThis.Bun;function yt(e){return je("trivy",["trivy",...e],Wi)}var bt="apps/example/Dockerfile",On="app:trivy-scan",Wi,Ji,Ki,zi,Yi,Qi;var Pn=f(()=>{k();Wi=["\u26A0\uFE0F trivy not found \u2014 skipping (install: brew install trivy or https://aquasecurity.github.io/trivy/)"];Ji=l({meta:{name:"build",description:`docker build -t ${On} (image for the trivy image scan)`},run(){if(!Hi(bt))console.warn(`\u26A0\uFE0F ${bt} not found \u2014 skipping image build`),process.exit(0);if(!qi("docker"))console.warn("\u26A0\uFE0F docker not found \u2014 skipping image build"),process.exit(0);if(g(["docker","build","-t",On,"-f",bt,"."])!==0)console.warn("\u26A0\uFE0F image build failed \u2014 skipping the Trivy image scan");process.exit(0)}}),Ki=U({name:"fs",description:"trivy fs . --severity HIGH,CRITICAL (filesystem scan)",prefixArgs:["fs"],defaultArgs:[".","--severity","HIGH,CRITICAL"],spawn:yt}),zi=U({name:"image",description:"trivy image <image> --severity HIGH,CRITICAL (container scan)",prefixArgs:["image"],spawn:yt}),Yi=l({meta:{name:"trivy",version:"1.0.0",description:"Trivy wrapper \u2014 vuln scanning, defensive (skips if binary missing)"},subCommands:{fs:Ki,image:zi,build:Ji},run(){let e=v("trivy");if(e.length===0)console.log(`
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
`),process.exit(0);process.exit(yt(e))}}),Qi=Yi});var Zi;var In=f(()=>{k();Zi=l({meta:{name:"codeql",version:"1.0.0",description:"CodeQL wrapper \u2014 info and local guidance (CodeQL runs in GitHub Actions)"},run(){console.log(`
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
`)}})});function E(e,t){let n=t;while(n<e.length&&/\s/.test(e[n]))n++;return n}function Dn(e,t){return e.lastIndexOf(`
`,t)+1}function ye(e,t){let n=/^[ \t]*/.exec(e.slice(Dn(e,t),t));return n?n[0]:""}function Ue(e,t){let n=t+1;while(n<e.length){if(e[n]==="\\"){n+=2;continue}if(e[n]==='"')return n+1;n++}return-1}function ee(e,t){let n=e[t];if(n==='"')return Ue(e,t);if(n==="{"||n==="["){let o=0,i=t;while(i<e.length){let r=e[i];if(r==='"'){i=Ue(e,i);continue}if(r==="{"||r==="[")o++;else if(r==="}"||r==="]"){if(o--,o===0)return i+1}i++}return-1}let s=t;while(s<e.length&&!/[\s,\]}]/.test(e[s]))s++;return s}function jn(e){let t=E(e,0);return e[t]==="{"?t:-1}function ve(e,t,n){let s=E(e,t+1);while(s<e.length&&e[s]!=="}"){if(e[s]!=='"')return null;let o=Ue(e,s);if(o===-1)return null;let i=E(e,o);if(e[i]!==":")return null;let r=E(e,i+1),a=ee(e,r);if(a===-1)return null;if(e.slice(s,o)===JSON.stringify(n))return{keyStart:s,valueStart:r,valueEnd:a};if(s=E(e,a),e[s]===",")s=E(e,s+1);else return null}return null}function Ln(e,t,n){let s=Dn(e,t);if(e.slice(s,t).trim()!==""){let r=/^[ \t]*,[ \t]*/.exec(e.slice(n));if(r)return e.slice(0,t)+e.slice(n+r[0].length);let a=e.slice(0,t).replace(/[ \t]*,[ \t]*$/,"");return a===e.slice(0,t)?e.slice(0,t)+e.slice(n):`${a}${e.slice(n)}`}let o=/^[ \t]*,[ \t]*\r?\n?/.exec(e.slice(n));if(o)return e.slice(0,s)+e.slice(n+o[0].length);let i=e.slice(0,s).replace(/[ \t]*\n$/,"");if(i.endsWith(","))return`${i.slice(0,-1)}${e.slice(n)}`;return e.slice(0,s)+e.slice(n)}function kt(e){return/\n([ \t]+)\S/.exec(e)?.[1]??"  "}function vt(e,t,n){let s=e.split(`
`);if(s.length===1)return e;let i=s.slice(1,-1).filter((a)=>a.trim()!=="").reduce((a,c)=>Math.min(a,/^[ \t]*/.exec(c)[0].length),Number.POSITIVE_INFINITY),r=Number.isFinite(i)?i:0;return[s[0],...s.slice(1,-1).map((a)=>a.trim()===""?"":t+n+a.slice(r)),`${t}${s.at(-1).trim()}`].join(`
`)}function Nn(e,t,n,s){let o=kt(e),i=ee(e,t)-1,r=ye(e,i),a=E(e,t+1);if(a===i){let b=`${r}${o}`,m=vt(s,b,o);return`${e.slice(0,i)}
${b}${JSON.stringify(n)}: ${m}
${r}${e.slice(i)}`}let c=ye(e,a),u=a,p=a;while(p<i){let b=Ue(e,p),m=E(e,b);if(u=ee(e,E(e,m+1)),p=E(e,u),e[p]===",")p=E(e,p+1);else break}let w=vt(s,c,o);return`${e.slice(0,u)},
${c}${JSON.stringify(n)}: ${w}${e.slice(u)}`}function Mn(e,t){let[n,...s]=e,o=s.length===0?t:Mn(s,t);return`{
  ${JSON.stringify(n)}: ${o}
}`}function Xi(e,t,n){let s=vt(n,ye(e,t.valueStart),kt(e));return e.slice(0,t.valueStart)+s+e.slice(t.valueEnd)}function xt(e,t,n){let s=t.at(-1);if(s===void 0)return e;let o=Ve(e,t.slice(0,-1));if(o===-1){let[r,...a]=t,c=jn(e);if(r===void 0||c===-1)return e;return Nn(e,c,r,Mn(a,n))}let i=ve(e,o,s);return i?Xi(e,i,n):Nn(e,o,s,n)}function Ve(e,t){let n=jn(e);for(let s of t){if(n===-1)return-1;let o=ve(e,n,s);if(!o||e[o.valueStart]!=="{")return-1;n=o.valueStart}return n}function Bn(e,t,n){return xt(e,t.split("."),JSON.stringify(n))}function Ll(e,t,n){return xt(e,t.split("."),n.trim())}function Gn(e,t){let n=t.split("."),s=Ve(e,n.slice(0,-1));if(s===-1)return e;let o=ve(e,s,n.at(-1));return o?Ln(e,o.keyStart,o.valueEnd):e}function Fn(e,t,n){let s=JSON.stringify(n),o=t.split("."),i=Ve(e,o.slice(0,-1));if(i===-1)return e;let r=ve(e,i,o.at(-1));if(!r)return xt(e,o,`[${s}]`);if(e[r.valueStart]!=="[")return e;let a=ee(e,r.valueStart)-1,c=E(e,r.valueStart+1);if(c===a){if(!e.slice(r.valueStart,a).includes(`
`))return`${e.slice(0,a)}${s}${e.slice(a)}`;let m=ye(e,a);return`${e.slice(0,a)}${m}${kt(e)}${s}
${m}${e.slice(a)}`}let u=c,p=c;while(c<a)if(u=c,p=ee(e,c),c=E(e,p),e[c]===",")c=E(e,c+1);else break;let b=!e.slice(r.valueStart,a).includes(`
`)?", ":`,
${ye(e,u)}`;return`${e.slice(0,p)}${b}${s}${e.slice(p)}`}function Ml(e,t,n){let s=JSON.stringify(n),o=t.split("."),i=Ve(e,o.slice(0,-1));if(i===-1)return e;let r=ve(e,i,o.at(-1));if(!r||e[r.valueStart]!=="[")return e;let a=ee(e,r.valueStart)-1,c=E(e,r.valueStart+1);while(c<a){let u=ee(e,c);if(e.slice(c,u)===s)return Ln(e,c,u);if(c=E(e,u),e[c]===",")c=E(e,c+1)}return e}function Ct(e){return JSON.parse(e)}async function St(e,t){let n=Bun.file(e);if(!await n.exists())return!1;let s=await n.text(),o=await t(s);if(o===s)return!1;return await Bun.write(e,o),!0}var He="@myorg",R="packages/native",Un="crates",J="npm",we=(e)=>`packages/native/crates/${e}`,V=(e)=>`packages/native/npm/${e}`,ke="wasm32-wasip1-threads",$t,qe;var We=f(()=>{$t=[{target:"aarch64-apple-darwin",runner:"macos-latest"},{target:"x86_64-apple-darwin",runner:"macos-13"},{target:"x86_64-pc-windows-msvc",runner:"windows-latest"},{target:"x86_64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian"},{target:"aarch64-unknown-linux-gnu",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64"},{target:"x86_64-unknown-linux-musl",runner:"ubuntu-latest",container:"ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-alpine"},{target:"wasm32-wasip1-threads",runner:"ubuntu-latest",wasi:!0}],qe=$t.map((e)=>e.target)});import{existsSync as te,readdirSync as er,readFileSync as Rt}from"fs";import{dirname as tr,join as K,resolve as Vn}from"path";function Hn(e=process.cwd()){let t=Vn(e);for(let n=0;n<32;n++){if(te(K(t,"packages","native","Cargo.toml")))return t;let s=tr(t);if(s===t)break;t=s}return Vn(e)}function qn(e){if(!te(e))return[];return er(e,{withFileTypes:!0}).filter((t)=>t.isDirectory()).map((t)=>t.name).sort()}function xe(e){let t=K(e,"packages","native",Un),n=K(e,"packages","native","Cargo.toml"),s=te(n)?Rt(n,"utf8"):"",o=new Set([...s.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm)].map((r)=>r[1]??"")),i=[];for(let r of qn(t)){let a=K(t,r,"Cargo.toml");if(!te(a))continue;let c=Rt(a,"utf8"),u=[...c.matchAll(/^\s*([\w-]+)\s*=\s*\{\s*path\s*=\s*"[^"]*"/gm),...c.matchAll(/^\s*([\w-]+)\.workspace\s*=\s*true/gm)].map((p)=>p[1]??"").filter((p)=>o.has(p)||te(K(t,p,"Cargo.toml")));i.push({name:r,dir:we(r),binding:/crate-type\s*=\s*\[[^\]]*cdylib/.test(c),uses:u})}return i}function Je(e){let t=K(e,"packages","native",J),n=[];for(let s of qn(t)){let o=K(t,s,"package.json");if(!te(o))continue;let i;try{i=JSON.parse(Rt(o,"utf8"))}catch{continue}if(!i.napi)continue;let r=we(s);if(!te(K(e,r,"Cargo.toml")))continue;n.push({name:s,dir:V(s),crateDir:r,binaryName:i.napi.binaryName??s,targets:i.napi.targets?.length?i.napi.targets:[...qe]})}return n}function Ke(e){let t=new Set(xe(e).filter((n)=>n.binding).map((n)=>n.name));return Je(e).filter((n)=>t.has(n.name))}var Wn=f(()=>{We()});import{existsSync as nr}from"fs";import{mkdir as ze,writeFile as G}from"fs/promises";import{join as P}from"path";function sr(e){let t=["[package]",`name    = "${e.name}"`,"version.workspace    = true","edition.workspace    = true","license.workspace    = true","repository.workspace = true",""];if(e.binding)t.push("[lib]","# required \u2014 produces the .node binary napi packages",'crate-type = ["cdylib"]',"","[dependencies]","napi.workspace        = true","napi-derive.workspace = true",...(e.uses??[]).map((n)=>`${`${n}.workspace`.padEnd(22)}= true`),"","[build-dependencies]","napi-build.workspace = true","");else t.push("# Pure Rust \u2014 no napi dependency, no cdylib: testable without a Node runtime.","[dependencies]",...(e.uses??[]).map((n)=>`${n}.workspace = true`),"");return t.push("[lints]","workspace = true",""),t.join(`
`)}function ir(e){if(!e.binding)return`//! Pure Rust helpers shared by the binding crates.
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
`;if((e.uses??[]).length>0){let n=(e.uses??[])[0];if(!n)throw Error("A binding crate that declares `uses` must name at least one crate");let s=n.replace(/-/g,"_");return`#![deny(clippy::all)]

use napi_derive::napi;

// Thin napi bindings \u2014 the logic lives in the \`${n}\` crate so it stays
// testable with plain \`cargo test\`, no Node runtime required.

/// Add two numbers \u2014 native Rust speed
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    ${s}::add(a, b)
}

/// Fibonacci \u2014 demonstrates Rust performance vs JS
/// Fibonacci(40) in Rust is ~100x faster than JS
#[napi]
pub fn fibonacci(n: u32) -> u32 {
    ${s}::fibonacci(n)
}

/// Fast string reversal \u2014 native
#[napi]
pub fn reverse_string(s: String) -> String {
    ${s}::reverse_string(&s)
}

/// Counter struct \u2014 becomes JS class
#[napi]
pub struct Counter {
    inner: ${s}::Counter,
}

#[napi]
impl Counter {
    #[napi(constructor)]
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            inner: ${s}::Counter::new(initial),
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
    ${s}::primes_up_to(n)
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
`}function rr(e,t){let n=Ye(t),s=`${n}/${e.name}`,o=(e.uses??[]).length>0;return{name:s,version:"0.0.0",private:!0,type:"module",main:"index.js",types:"index.d.ts",exports:{".":{types:"./index.d.ts",require:"./index.js",import:"./index.js"},"./wasi":{types:"./index.d.ts",require:`./${e.name}.wasi.cjs`,browser:`./${e.name}.wasi-browser.js`}},files:["index.js","index.d.ts","*.node",`${e.name}.wasi.cjs`,`${e.name}.wasi-browser.js`,`${e.name}.wasm`],napi:{binaryName:e.name,packageName:s,targets:[...qe],wasm:{initialMemory:16,maximumMemory:65536,browser:{fs:!1,asyncInit:!0,errorEvent:!0}}},scripts:{build:`m native napi:build --only ${e.name}`,"build:debug":`m native napi:build:debug --only ${e.name}`,"build:wasm":`m native napi:build:wasm --only ${e.name}`,"create-npm-dirs":`m native create-npm-dirs --only ${e.name}`,artifacts:`m native artifacts --only ${e.name}`,test:"m bun test","test:watch":"m bun test --watch",typecheck:"m typecheck --noEmit","cargo:check":"m native check","cargo:clippy":"m native clippy","cargo:fmt":"m native fmt","cargo:fmt:check":"m native fmt:check","cargo:test":"m native test"},devDependencies:{[`${n}/bun-config`]:"workspace:*",[`${n}/native-config`]:"workspace:*",...o?{[`${n}/native-crates`]:"workspace:*"}:{},[`${n}/ts`]:"workspace:*","@napi-rs/cli":"^3.9.1"}}}function ar(e){return`{
  "extends": "${e}/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"]
  },
  "include": ["index.d.ts", "tests/**/*"]
}
`}async function Jn(e,t,n={}){let s=P(e,we(t.name));if(await ze(P(s,"src"),{recursive:!0}),await G(P(s,"Cargo.toml"),sr(t)),await G(P(s,"src","lib.rs"),ir(t)),t.binding)await G(P(s,"build.rs"),or());if(!t.binding)return{crate:s};let o=P(e,V(t.name));return await ze(o,{recursive:!0}),await G(P(o,"package.json"),`${JSON.stringify(rr(t,n),null,2)}
`),await G(P(o,"tsconfig.json"),ar(Ye(n))),await G(P(o,"turbo.json"),cr()),await ze(P(o,"tests"),{recursive:!0}),await G(P(o,"tests",`${t.name}.test.ts`),lr(t,n)),{crate:s,package:o}}function pr(e,t){return e.replace(/members = \[([\s\S]*?)\]/,(n,s)=>{let o=new Set(s.split(`
`).map((i)=>i.trim()).filter((i)=>i.startsWith('"')).map((i)=>i.replace(/,$/,"")));return o.add(`"crates/${t}"`),`members = [
${[...o].sort().map((i)=>`  ${i},`).join(`
`)}
]`})}async function Kn(e,t){let n=P(e,"packages","native","Cargo.toml");if(!nr(n))return;let s=await Bun.file(n).text();if(s.includes(`"crates/${t}"`))return;let o=s.includes("members = [")?pr(s,t):`${s.trimEnd()}

[workspace]
members = [
  "crates/${t}",
]
`;await G(n,o)}function ur(e){return{name:`${Ye(e)}/native-crates`,version:"0.0.0",private:!0,scripts:{build:"m native build --pure",test:"m native test --pure","cargo:check":"m native check --pure","cargo:clippy":"m native clippy --pure","cargo:fmt":"m native fmt --pure","cargo:fmt:check":"m native fmt:check --pure"}}}async function At(e,t={}){let n=P(e,"packages","native","crates");return await ze(n,{recursive:!0}),await G(P(n,"package.json"),`${JSON.stringify(ur(t),null,2)}
`),await G(P(n,"turbo.json"),mr()),n}var Ye=(e)=>e.scope??He,or=()=>`extern crate napi_build;

fn main() {
    napi_build::setup();
}
`,cr=()=>`{
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
`,lr=(e,t={})=>{let n=e.name,s=Ye(t),o=(e.uses??[])[0]??"shared",i=(e.uses??[]).length>0,r=`${`${o}.workspace`.padEnd(22)}= true`,a=i?`
describe("pure Rust crates", () => {
  it("keep the shared logic in crates/${o}, napi-free", async () => {
    const manifest = await Bun.file("../../crates/${o}/Cargo.toml").text();
    expect(manifest).toContain('name    = "${o}"');
    expect(manifest).not.toMatch(/^crate-type/m);
    expect(manifest).not.toMatch(/^napi/m);

    const lib = await Bun.file("../../crates/${o}/src/lib.rs").text();
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
    expect(manifest).toContain('"crates/${o}"');
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
    expect(pkg.name).toBe("${s}/native-crates");
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
    expect(pkg.devDependencies["${s}/native-crates"]).toBe("workspace:*");
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
${a}`},mr=()=>`{
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
`;var zn=f(()=>{We()});import{existsSync as Et}from"fs";import{join as ne}from"path";var{which:dr}=globalThis.Bun;function gr(){return!!dr("cargo")}function _t(){if(!gr())return console.warn("\u26A0\uFE0F cargo not found, skipping (install Rust: https://rustup.rs)"),!1;return!0}function se(){if(Et(ne(Tt,"Cargo.toml")))return!0;return console.warn(`\u26A0\uFE0F ${R}/Cargo.toml not present, skipping (enable the native config)`),!1}function T(e,t={}){if(!se()||!_t())return 0;return g(["cargo",...e],{cwd:t.cwd??Tt})}function pe(e){if(!e)return[];let t=xe(x).filter((n)=>n.binding).map((n)=>n.name);if(t.length===0)return[];return console.log(`\u2139\uFE0F pure Rust only \u2014 excluding bindings: ${t.join(", ")}`),t.flatMap((n)=>["--exclude",n])}function Yn(){return Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/scripts/index.js"))}function fr(e){return["--cwd",x,"--manifest-path",`${e.crateDir}/Cargo.toml`,"--package-json-path",`${e.dir}/package.json`,"--output-dir",e.dir]}function Ce(e,t={},n=()=>[]){if(!se()||!_t())return 0;let s=Ke(x),o=t.only?s.filter((r)=>r.name===t.only):s;if(o.length===0)return console.warn(t.only?`\u26A0\uFE0F No napi package named "${t.only}" in ${R}/${J} \u2014 skipping`:`\u26A0\uFE0F No napi packages in ${R}/${J} \u2014 skipping`),0;let i=0;for(let r of o){console.log(`
\u25B8 ${r.name}: ${r.crateDir} \u2192 ${r.dir}`);let a=g(["bun",Yn(),...e,...fr(r),...n(r),...t.target?["--target",t.target]:[],...t.cross?["--use-napi-cross"]:[],...t.dryRun?["--dry-run"]:[]],{cwd:x});if(a!==0)i=a,console.error(`::error::${e.join(" ")} failed for ${r.name} (exit ${a})`)}return i}function hr(e,t=Tt){if(!se()||!_t())return 0;return g(["bun",Yn(),...e],{cwd:t})}function br(){if(!process.env.WASI_SDK_PATH)console.warn(`\u26A0\uFE0F WASI_SDK_PATH is not set \u2014 install the WASI SDK if the wasm target fails to link
`+"   (CI does it for you; locally: https://github.com/WebAssembly/wasi-sdk/releases)")}function Nr(e){let t=new Set;for(let s of Ke(e))for(let o of s.targets)t.add(o);return{include:$t.filter((s)=>t.size===0||t.has(s.target)).map((s)=>{let o={target:s.target,runner:s.runner};if(s.container)o.container=s.container;if(s.wasi)o.wasi=!0;return o})}}async function Qn(e){if(e)return e;let t=Je(x)[0];if(t)try{let s=(await Bun.file(ne(x,t.dir,"package.json")).json()).name?.split("/")[0];if(s?.startsWith("@"))return s}catch{}return process.env.NATIVE_SCOPE??He}var x,Tt,ue,Se,yr,vr,wr,kr,xr,Cr,Sr,$r,Rr,Ar,Er,Tr,_r,Or,Pr,Ir,Dr,jr,Lr,Mr,Br,Gr,Fr,Ur,Vr,Hr,Zn,qr;var Xn=f(()=>{k();Wn();We();zn();x=Hn(),Tt=ne(x,R);ue={pure:{type:"boolean",description:"Only the pure Rust crates (excludes every napi binding)",default:!1}};Se={only:{type:"string",description:"Build a single package (by directory name)"},target:{type:"string",description:"Rust target triple, e.g. aarch64-unknown-linux-gnu"},cross:{type:"boolean",description:"Cross-compile with napi's bundled toolchain",default:!1}},yr=l({meta:{name:"check",description:"cargo check --workspace (fast type-check)"},args:{...ue},run({args:e}){process.exit(T(["check","--workspace",...pe(Boolean(e.pure))]))}}),vr=l({meta:{name:"clippy",description:"cargo clippy --workspace --all-targets -- -D warnings"},args:{...ue},run({args:e}){process.exit(T(["clippy","--workspace",...pe(Boolean(e.pure)),"--all-targets","--","-D","warnings"]))}}),wr=l({meta:{name:"fmt",description:"cargo fmt --all (format write)"},args:{...ue},run({args:e}){process.exit(T(["fmt","--all",...pe(Boolean(e.pure))]))}}),kr=l({meta:{name:"fmt:check",description:"cargo fmt --all -- --check (format check)"},args:{...ue},run({args:e}){process.exit(T(["fmt","--all",...pe(Boolean(e.pure)),"--","--check"]))}}),xr=l({meta:{name:"test",description:"cargo test --workspace (run Rust tests)"},args:{...ue},run({args:e}){process.exit(T(["test","--workspace",...pe(Boolean(e.pure))]))}}),Cr=l({meta:{name:"build",description:"cargo build --workspace (debug)"},args:{...ue},run({args:e}){process.exit(T(["build","--workspace",...pe(Boolean(e.pure))]))}}),Sr=l({meta:{name:"build:release",description:"cargo build --workspace --release (lto, strip)"},run(){process.exit(T(["build","--workspace","--release"]))}}),$r=l({meta:{name:"build:ci",description:"cargo build --workspace --profile ci"},run(){process.exit(T(["build","--workspace","--profile","ci"]))}}),Rr=l({meta:{name:"tree",description:"cargo tree (dependency tree)"},run(){process.exit(T(["tree",...v("tree")]))}}),Ar=l({meta:{name:"update",description:"cargo update (update dependencies)"},run(){process.exit(T(["update",...v("update")]))}}),Er=l({meta:{name:"doc",description:"cargo doc --no-deps (generate docs)"},run(){process.exit(T(["doc","--no-deps"]))}}),Tr=l({meta:{name:"nextest",description:"cargo nextest run (faster parallel tests)"},run(){process.exit(T(["nextest","run",...v("nextest")]))}}),_r=l({meta:{name:"llvm-cov",description:"cargo llvm-cov --lcov (Rust coverage, requires cargo-llvm-cov)"},run(){let e=v("llvm-cov");if(e.length===0)process.exit(T(["llvm-cov","--workspace","--lcov","--output-path","coverage/rust-lcov.info"]));process.exit(T(["llvm-cov",...e]))}}),Or=l({meta:{name:"audit",description:"cargo audit (security audit)"},run(){process.exit(T(["audit"]))}}),Pr=l({meta:{name:"deny",description:"cargo deny check (license/ban check)"},run(){process.exit(T(["deny",...v("deny")]))}}),Ir=l({meta:{name:"typecheck",description:"Type-check every npm package (skips when absent)"},run(){if(!se())process.exit(0);let e=Je(x).filter((n)=>Et(ne(x,n.dir,"tsconfig.json")));if(e.length===0)console.warn(`\u26A0\uFE0F No npm packages to type-check in ${R}/${J}`),process.exit(0);let t=0;for(let n of e){console.log(`\u25B8 typecheck ${n.name}`);let s=g(["bun","run","typecheck"],{cwd:ne(x,n.dir)});if(s!==0)t=s}process.exit(t)}});Dr=l({meta:{name:"matrix",description:"Print the CI build matrix (supported targets the packages declare)"},args:{json:{type:"boolean",description:"Pretty-print JSON (default)",default:!0},gha:{type:"boolean",description:"Print `key=value` lines ready for $GITHUB_OUTPUT",default:!1}},run({args:e}){let t=Nr(x);if(e.gha)console.log(`targets=${JSON.stringify(t)}`),console.log(`has_targets=${t.include.length>0}`);else console.log(JSON.stringify(t,null,2));process.exit(0)}}),jr=l({meta:{name:"list",description:"List crates and the npm packages built from them"},args:{json:{type:"boolean",description:"Print JSON",default:!1}},run({args:e}){if(!se())process.exit(0);let t=xe(x),n=Ke(x),s=new Set(n.map((o)=>o.name));if(e.json)console.log(JSON.stringify({root:x,crates:t,packages:n},null,2)),process.exit(0);console.log(`
\uD83E\uDD80 ${R} (workspace root: ${x})
`),console.log("  crates/");for(let o of t){let i=o.binding?"cdylib \u2192 npm package":"pure Rust",r=o.uses.length?` (uses ${o.uses.join(", ")})`:"",a=o.binding&&!s.has(o.name)?"  \u26A0\uFE0F no npm package":"";console.log(`    ${o.name.padEnd(14)} ${i}${r}${a}`)}if(console.log(`
  npm/`),n.length===0)console.log("    (none \u2014 add a cdylib crate with `m native add <name>`)");for(let o of n)console.log(`    ${o.name.padEnd(14)} ${o.crateDir}  binary: ${o.binaryName}.<platform>.node`),console.log(`    ${" ".repeat(14)} targets: ${o.targets.join(", ")}`);console.log(""),process.exit(0)}});Lr=l({meta:{name:"add",description:"Add a crate (and, for bindings, its npm package) to the workspace"},args:{name:{type:"positional",description:"Crate name \u2014 also the npm package name",required:!0},pure:{type:"boolean",description:"Pure Rust crate: no cdylib, no npm package",default:!1},uses:{type:"string",description:"Comma-separated sibling crates to depend on"},scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!se())process.exit(1);let t=String(e.name);if(!/^[a-z0-9][a-z0-9-]*$/.test(t))console.error(`\u274C Invalid crate name "${t}" \u2014 use lowercase letters, digits and hyphens`),process.exit(1);let n={name:t,binding:!e.pure,uses:e.uses?String(e.uses).split(",").map((o)=>o.trim()).filter(Boolean):[],sample:"arithmetic"},s=await Qn(e.scope);if(await Jn(x,n,{scope:s}),await Kn(x,t),e.pure)await At(x,{scope:s});if(console.log(`
\u2705 Added ${e.pure?"pure Rust crate":"crate + npm package"} "${t}"`),console.log(`   crate:   ${R}/crates/${t}/`),!e.pure)console.log(`   package: ${V(t)}/`);else console.log(`   bridge:  ${R}/crates/package.json (${s}/native-crates)`),console.log(`   Bindings that use "${t}" add it to workspace.dependencies + Cargo.toml,`),console.log(`   and \`${s}/native-crates: workspace:*\` in their package.json.`);console.log(`
   Run: bun install && m native check
`),process.exit(0)}}),Mr=l({meta:{name:"napi:build",description:"napi build --platform --release (one per package)"},args:Se,run({args:e}){process.exit(Ce(["build","--platform","--release"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),Br=l({meta:{name:"napi:build:debug",description:"napi build (debug, one per package)"},args:Se,run({args:e}){process.exit(Ce(["build"],{only:e.only,target:e.target,cross:Boolean(e.cross)}))}}),Gr=l({meta:{name:"napi:build:wasm",description:`napi build --target ${ke} (one per package)`},args:{only:Se.only},run({args:e}){br(),process.exit(Ce(["build","--platform","--release","--target",ke],{only:e.only}))}}),Fr=l({meta:{name:"create-npm-dirs",description:"Generate the per-platform npm packages (run in CI, not committed)"},args:{only:Se.only,"dry-run":{type:"boolean",default:!1}},run({args:e}){process.exit(Ce(["create-npm-dirs"],{only:e.only,dryRun:Boolean(e["dry-run"])},()=>["--npm-dir",`${R}/${J}`]))}}),Ur=l({meta:{name:"artifacts",description:"Copy CI artifacts (.node/.wasm) into the npm packages"},args:{only:Se.only,dir:{type:"string",description:"Directory holding the downloaded artifacts",default:"artifacts"}},run({args:e}){process.exit(Ce(["artifacts"],{only:e.only},(t)=>["--npm-dir",`${R}/${J}`,"--output-dir",String(e.dir??"artifacts"),"--build-output-dir",t.dir]))}}),Vr=l({meta:{name:"napi",description:"Run napi-rs CLI (passthrough, cwd = the workspace)"},run(){process.exit(hr(v("napi")))}}),Hr=l({meta:{name:"sync",description:"Re-sync the Turbo bridge node and Cargo\u2192npm dependency edges"},args:{scope:{type:"string",description:"npm scope (default: the scope in packages/native)"}},async run({args:e}){if(!se())process.exit(1);let t=await Qn(e.scope),n=`${t}/native-crates`,s=0;await At(x,{scope:t}),console.log(`  \u2713 ${R}/crates/{package,turbo}.json (bridge node)`);for(let i of xe(x).filter((r)=>r.binding)){let r=ne(x,V(i.name),"package.json");if(!Et(r))continue;let a=(i.uses??[]).length>0;await St(r,(c)=>{let p=Ct(c).devDependencies?.[n];if(a&&p!=="workspace:*")return console.log(`  \u2713 ${V(i.name)}/package.json \u2192 ${n}: workspace:*`),s+=1,Bn(c,`devDependencies.${n}`,"workspace:*");if(!a&&p)return console.log(`  \uD83D\uDDD1\uFE0F ${V(i.name)}/package.json \u2190 ${n} (no Cargo path deps)`),s+=1,Gn(c,`devDependencies.${n}`);return c})}let o=ne(x,"package.json");await St(o,(i)=>{if((Ct(i).workspaces??[]).includes(`${R}/crates`))return i;return console.log(`  \u2713 package.json workspaces += ${R}/crates`),s+=1,Fn(i,"workspaces",`${R}/crates`)}),console.log(s===0?`
\u2705 Already in sync
`:`
\u2705 Synced (${s} fix${s===1?"":"es"}) \u2014 run bun install
`),process.exit(0)}}),Zn=l({meta:{name:"m native",version:"1.0.0",description:"Native Rust bindings via Cargo + napi-rs \u2014 one Cargo workspace in packages/native with a crate per Rust unit and an npm package per napi binding."},subCommands:{list:jr,matrix:Dr,add:Lr,check:yr,clippy:vr,fmt:wr,"fmt:check":kr,test:xr,build:Cr,"build:release":Sr,"build:ci":$r,tree:Rr,update:Ar,doc:Er,nextest:Tr,"llvm-cov":_r,audit:Or,deny:Pr,typecheck:Ir,"napi:build":Mr,"napi:build:debug":Br,"napi:build:wasm":Gr,"create-npm-dirs":Fr,artifacts:Ur,napi:Vr,sync:Hr},run(){let e=v("native");if(e.length===0)console.log(`
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
`),process.exit(0);let t=e[0]??"";if(!Object.keys(Zn.subCommands||{}).includes(t)&&!t.startsWith("-"))process.exit(T(e))}}),qr=Zn});var{file:es,spawnSync:Wr}=globalThis.Bun;var Jr,Kr;var ts=f(()=>{O();k();Jr=l({meta:{name:"m e2e",version:"1.0.0",description:"Playwright E2E with browser detection \u2014 auto-skips if browsers missing, uses shared config"},args:{args:{type:"positional",description:"Playwright test args",required:!1}},async run(){let{chromium:e,firefox:t,webkit:n}=await import("@playwright/test"),s={chromium:e,firefox:t,webkit:n},o=[];for(let[w,b]of Object.entries(s))try{let m=b.executablePath();if(!await es(m).exists())o.push(w)}catch{o.push(w)}if(o.length>0)console.log(`
E2E skipped: browser(s) not installed (${o.join(", ")}).`),console.log("Run `bunx playwright install` to download them.\n"),process.exit(0);let i=Le(),r=await es(`${i}/apps/example/playwright.config.ts`).exists()?`${i}/apps/example/playwright.config.ts`:null,a=v("e2e"),u=["bun",Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js")),"test",...r?["--config",r]:[],...a],p=Wr({cmd:u,stdout:"inherit",stderr:"inherit",stdin:"inherit"});process.exit(p.exitCode)}}),Kr=Jr});import{existsSync as zr}from"fs";var{which:Yr}=globalThis.Bun;function Ot(){return zr(Qe)}async function Zr(){try{let e=Bun.fileURLToPath(import.meta.resolve("@unocss/cli/package.json")),n=(await Bun.file(e).json()).bin?.unocss;if(n)return["bun",e.replace("package.json",n)]}catch{}return Yr("unocss")?["unocss"]:null}async function ns(){try{return((await import(Qe)).default?.cli?.entry??[]).map((n)=>n.outFile).filter((n)=>!!n)}catch{return[]}}async function ss(e){if(!Ot())return console.warn("\u26A0\uFE0F UnoCSS not enabled (shared uno.config.ts missing) \u2014 skipping"),0;let t=await Zr();if(!t)return console.warn("\u26A0\uFE0F unocss CLI not found \u2014 skipping (install: bun add -d @unocss/cli, or use the unocss config package)"),0;return g([...t,"--config",Qe,...e],{cwd:Qr})}var Qe,Qr,Xr,ea,ta,na,sa;var os=f(()=>{O();k();Qe=I("uno.config.ts"),Qr=Le();Xr=l({meta:{name:"build",description:"Generate CSS with the shared UnoCSS config"},async run(){let e=await ss([]);if(e!==0)console.error(`::error::unocss build failed (exit ${e})`),process.exit(e);if(!Ot())process.exit(0);let t=await ns();if(t.length>0)console.log(`\u2705 CSS built: ${t.join(", ")}`);process.exit(0)}}),ea=l({meta:{name:"watch",description:"Same as build, in watch mode"},async run(){let e=await ss(["--watch"]);process.exit(e)}}),ta=l({meta:{name:"info",description:"Show whether UnoCSS is enabled and what it writes"},async run(){let e=Ot();if(console.log(`enabled: ${e}`),console.log(`config:  ${Qe}${e?"":" (missing)"}`),!e)process.exit(0);let t=await ns();console.log(`outputs: ${t.length>0?t.join(", "):"(none declared)"}`),process.exit(0)}}),na=l({meta:{name:"m unocss",version:"1.0.0",description:"UnoCSS wrapper \u2014 owns the shared config path, skips cleanly when disabled"},subCommands:{build:Xr,watch:ea,info:ta},run(){console.log(`
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
`),process.exit(0)}}),sa=na});import{existsSync as is,readdirSync as oa,readFileSync as ia}from"fs";import{join as It}from"path";function aa(e){if(e===void 0||e===!1||e===null)return null;if(e===!0)return Pt;if(typeof e==="string")return e||Pt;if(typeof e==="object")return e.dir||Pt;return null}function ca(e){let t=It(e,"package.json");if(!is(t))return null;try{return JSON.parse(ia(t,"utf8"))}catch{return null}}function Ze(e=process.cwd()){let t=[];for(let s of ra){let o=s.split("*")[0]??"",i=It(e,o);if(!is(i))continue;for(let r of oa(i,{withFileTypes:!0})){if(!r.isDirectory())continue;let a=`${o}${r.name}`,c=ca(It(e,a));if(!c?.name)continue;let u=aa(c.pages);if(!u)continue;t.push({name:c.name,dir:a,outDir:`${a}/${u}`})}}t.sort((s,o)=>s.name.localeCompare(o.name));let n=t.length>1;return t.map((s)=>({...s,subpath:n?s.name.split("/").at(-1)??s.name:""}))}function Dt(e){return e.subpath?`/${e.subpath}/`:"/"}var L=".pages",Nt="coverage",Pt="public",ra;var rs=f(()=>{ra=["apps/*","packages/*"]});import{existsSync as jt}from"fs";import{cp as as,rm as la}from"fs/promises";import{join as z}from"path";var{Glob:pa,spawnSync:cs}=globalThis.Bun;function ua(){let e=process.env.GITHUB_REPOSITORY?.split("/")[1];if(e)return e;let n=cs({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim();if(!n)return;return n.replace(/\.git$/,"").split("/").at(-1)}function ma(){let e=process.env.GITHUB_REPOSITORY?.split("/")[0];if(e)return e;return cs({cmd:["git","config","--get","remote.origin.url"],stdout:"pipe"}).stdout?.toString().trim()?.replace(/\.git$/,"").match(/[:/]([^/:]+)\/[^/]+$/)?.[1]}async function da(e,t){await la(z(e,L),{recursive:!0,force:!0});for(let i of t){let r=z(e,i.outDir);if(!jt(r))console.error(`::error::${i.name} declares "${i.outDir}" but it does not exist`),process.exit(1);let a=i.subpath?z(e,L,i.subpath):z(e,L);await as(r,a,{recursive:!0}),console.log(`\uD83D\uDCE6 ${i.name}: ${i.outDir} \u2192 ${L}${Dt(i)}`)}let n="coverage/html",s=z(e,n);if(jt(z(s,"index.html")))await as(s,z(e,L,Nt),{recursive:!0}),console.log(`\uD83D\uDCCA ${n} \u2192 ${L}/${Nt} (served at /coverage/)`);let o=z(e,L,"index.html");if(!jt(o))console.warn(`\u26A0\uFE0F No index.html at the site root (${L}/) \u2014 check the pages config`)}var ga,fa,ha,ba,ya;var ls=f(()=>{k();rs();ga=l({meta:{name:"list",description:"Show which packages declare a Pages site"},run(){let e=Ze();if(e.length===0)console.log("No package declares a pages config in its package.json"),process.exit(0);for(let t of e)console.log(`${t.name.padEnd(24)} ${t.outDir.padEnd(28)} \u2192 ${Dt(t)}`);process.exit(0)}}),fa=l({meta:{name:"build",description:"Build the site and assemble the Pages artifact from declared packages"},run(){console.log("\uD83D\uDCC4 Building static site for GitHub Pages");let e=g(["bun","run","build"]);if(e!==0)console.error(`::error::bun run build failed (exit ${e})`),process.exit(e);let t=Ze();if(t.length===0)console.error('::error::Pages is enabled but no package declares "pages" in its package.json (e.g. "pages": { "dir": "public" })'),process.exit(1);da(process.cwd(),t).then(()=>{console.log(`\u2705 Pages artifact ready: ${L}/`),process.exit(0)})}}),ha=l({meta:{name:"base",description:"Report (or inject) the base path for a GitHub Pages project site"},args:{inject:{type:"boolean",description:"Rewrite absolute href/src in the built HTML to include the base path",default:!1},json:{type:"boolean",description:"Print { owner, repo, base, url } as JSON",default:!1}},async run({args:e}){let t=ua(),n=ma()??"unknown",s=t?`https://${n.toLowerCase()}.github.io/${t}`:void 0;if(e.json){console.log(JSON.stringify({owner:t?n:null,repo:t??null,base:t?`/${t}`:null,url:s??null}));return}if(console.log(`\uD83D\uDD27 Repo name: ${t??"(unknown)"}`),console.log(`   Default Pages URL: ${s??"(unknown)"}`),!e.inject)return;if(!t)console.error("::error::cannot determine repo name \u2014 set GITHUB_REPOSITORY or add a git remote"),process.exit(1);if(Ze().filter((a)=>a.subpath==="").length===0){console.log("   No root-level Pages target \u2014 nothing to rewrite");return}let r=0;for(let a of new pa(`${L}/**/*.html`).scanSync(".")){let c=await Bun.file(a).text(),u=c.replaceAll(/(href|src)="\/(?!\/)/g,`$1="/${t}/`);if(u===c)continue;await Bun.write(a,u),r++}console.log(`   Rewrote absolute paths to /${t}/ in ${r} file(s)`)}}),ba=l({meta:{name:"m pages",version:"1.0.0",description:"GitHub Pages helper \u2014 discovers declared sites, builds and stages the artifact"},subCommands:{build:fa,base:ha,list:ga}}),ya=ba});import{mkdir as $e,readdir as Xe}from"fs/promises";import{join as oe}from"path";var{$:me,file:Lt,write:Re}=globalThis.Bun;function va(e){let t=e.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!t)return null;let n=t[1]??"",s=t[2]??"",o={};for(let i of n.split(`
`)){let r=i.indexOf(":");if(r===-1)continue;let a=i.slice(0,r).trim(),c=i.slice(r+1).trim().replace(/^["']|["']$/g,"");if(a)o[a]=c}return{frontmatter:o,body:s}}async function Ee(e){try{let t=await Lt(e).text(),n=va(t);if(!n)return console.error(`\u274C ${e}: missing YAML frontmatter (---)`),null;let{frontmatter:s}=n;if(!s.name)return console.error(`\u274C ${e}: missing frontmatter 'name'`),null;if(!s.description)return console.error(`\u274C ${e}: missing frontmatter 'description'`),null;return{name:s.name,description:s.description,path:e}}catch(t){return console.error(`\u274C ${e}: ${t.message}`),null}}async function et(e){let t=[];try{let n=await Xe(e,{withFileTypes:!0});for(let s of n){let o=oe(e,s.name);if(s.isDirectory()){let i=await et(o);t.push(...i)}else if(s.name==="SKILL.md"||s.name.endsWith(".md"))t.push(o)}}catch{}return t}var ps="@myorg",ie,ms,M,Ae,us,wa,ka,xa,Ca,Sa,$a,Ra,Aa,Ea;var ds=f(()=>{De();O();ie=nn(),ms=`${Q()}/src/cli.ts`,M=`${process.cwd()}/.agents/skills`,Ae=`${process.cwd()}/.agents/skills.index.json`;us=l({meta:{name:"sync",description:"Sync curated skills to .agents/skills/ + validate + index"},run:async()=>{let e=process.env.SKILLS_SCOPE||process.env.SCOPE||ps,t=ps;await $e(M,{recursive:!0}),console.log(`
\uD83D\uDCE6 Syncing curated skills from ${ie} to ${M}/ (scope: ${e})
`);let n=0;try{let a=await Xe(ie,{withFileTypes:!0});for(let c of a){let u=oe(ie,c.name);if(c.isDirectory()){let p=oe(M,c.name);if(await $e(p,{recursive:!0}),await me`cp -r ${u}/* ${p}/`.quiet().catch(()=>{}),e!==t){let w=await me`find ${p} -type f -name "*.md"`.text().catch(()=>"");for(let b of w.trim().split(`
`).filter(Boolean))try{let m=await Lt(b).text();if(m.includes(t))await Re(b,m.replaceAll(t,e))}catch{}}n++,console.log(`  \u2713 ${c.name}/`)}else if(c.isFile()&&c.name.endsWith(".md")){let p=c.name.replace(/\.md$/,""),w=oe(M,p);await $e(w,{recursive:!0});let b=await Lt(u).text();if(e!==t)b=b.replaceAll(t,e);if(b.startsWith("---"))await Re(oe(w,"SKILL.md"),b);else{let C=`---
name: ${p}
description: ${p} skill
---

${b}`;await Re(oe(w,"SKILL.md"),C)}n++,console.log(`  \u2713 ${p}/ (from legacy ${c.name})`)}}}catch(a){console.error(`  No curated dir: ${ie}`,a)}console.log(`
\u2705 Synced ${n} curated skills to .agents/skills/
`),console.log(`\uD83D\uDD0D Validating skills in ${M}/...
`);let s=await et(M),o=0,i=0;for(let a of s){let c=await Ee(a);if(c)o++,console.log(`  \u2713 ${c.name} \u2014 ${c.description}`);else i++}console.log(`
${i===0?"\u2705":"\u26A0\uFE0F"}  ${o} valid, ${i} invalid
`);let r=[];for(let a of s){let c=await Ee(a);if(c)r.push({...c,path:a.replace(`${process.cwd()}/`,"")})}if(await $e(`${process.cwd()}/.agents`,{recursive:!0}),await Re(Ae,`${JSON.stringify(r,null,2)}
`),console.log(`\uD83D\uDCC4 Built ${Ae} with ${r.length} skills
`),i>0)process.exit(1)}}),wa=l({meta:{name:"list",description:"List installed skills (curated + vendored + skills.sh)",alias:["ls"]},run:async()=>{console.log(`
\uD83D\uDCDA Skills in ${M}/:
`);try{let e=await Xe(M,{withFileTypes:!0});if(e.length===0)console.log("  (no skills installed \u2014 run `bun run skills:sync` or `bun run skills:add`)\n");else for(let t of e){if(!t.isDirectory())continue;let n=oe(M,t.name,"SKILL.md"),s=await Ee(n).catch(()=>null);if(s)console.log(`  - ${s.name} \u2014 ${s.description} (${t.name}/)`);else console.log(`  - ${t.name}/ \u2014 (no SKILL.md)`)}}catch{console.log("  (no .agents/skills/ dir \u2014 run `bun run skills:sync`)\n")}console.log(`
\uD83D\uDCE6 Curated skills in ${ie}/:
`);try{let e=await Xe(ie,{withFileTypes:!0});for(let t of e){let n=t.isDirectory()?t.name:t.name.replace(/\.md$/,"");console.log(`  - ${n}`)}}catch{console.log("  (no curated dir)")}console.log(),console.log(`\uD83D\uDD0D skills.sh installed (project):
`),await me`npx skills list -p`.quiet().then(async(e)=>{let t=e.stdout.toString();console.log(t||"  (none or skills CLI not available)")}).catch(()=>{console.log("  (skills CLI not available or no project skills)")}),console.log()}}),ka=l({meta:{name:"add",description:"Add skill via skills.sh (e.g. vercel-labs/agent-skills)",alias:["a"]},args:{package:{type:"positional",description:"Skill package (e.g. vercel-labs/agent-skills or https://skills.sh/p/<id>)",required:!0}},run:async({args:e})=>{let t=e.package;console.log(`
\uD83D\uDCE6 Adding skill package via skills.sh: ${t}
`),console.log(`> npx skills add ${t} -p --agent * -y
`);let s=await Bun.spawn({cmd:["npx","skills","add",t,"-p","--agent","*","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(s!==0)console.error(`
\u274C skills add failed with exit ${s}
`),process.exit(s);console.log(`
\u2705 Added ${t}, syncing to .agents/skills/...
`),await me`bun ${ms} skills sync`.quiet().catch(()=>{}),await me`npx skills experimental_sync -p`.quiet().catch(()=>{}),console.log(`
\u2705 Done. Review changes in .agents/skills/ before committing.
`)}}),xa=l({meta:{name:"update",description:"Update skills via skills.sh",alias:["upgrade"]},args:{skills:{type:"positional",description:"Skills to update (default: all)",required:!1}},run:async({args:e})=>{let t=e.skills??"",n=t?[t]:[];console.log(`
\uD83D\uDD04 Updating skills via skills.sh: ${n.join(" ")||"(all)"}
`);let s=["npx","skills","update",...n,"-p","-y"];console.log(`> ${s.join(" ")}
`);let i=await Bun.spawn({cmd:s,cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited;if(i!==0)console.error(`
\u274C skills update failed with exit ${i}
`),process.exit(i);console.log(`
\u2705 Updated, rebuilding index...
`),await me`bun ${ms} skills sync`.quiet().catch(()=>{})}}),Ca=l({meta:{name:"validate",description:"Validate all SKILL.md frontmatter (name, description)"},run:async()=>{console.log(`
\uD83D\uDD0D Validating all SKILL.md files...
`);let e=[ie,M],t=0,n=0;for(let s of e){console.log(`\uD83D\uDCC1 ${s}:
`);let o=await et(s);if(o.length===0){console.log(`  (no skills found)
`);continue}for(let i of o){let r=await Ee(i);if(r)t++,console.log(`  \u2713 ${r.name} \u2014 ${r.description} (${i.replace(`${process.cwd()}/`,"")})`);else n++}console.log()}if(console.log(`${n===0?"\u2705":"\u274C"} Validation: ${t} valid, ${n} invalid
`),n>0)process.exit(1)}}),Sa=l({meta:{name:"index",description:"Build .agents/skills.index.json"},run:async()=>{console.log(`
\uD83D\uDCC4 Building ${Ae}...
`);let e=await et(M),t=[];for(let n of e){let s=await Ee(n);if(s)t.push({...s,path:n.replace(`${process.cwd()}/`,"")})}await $e(`${process.cwd()}/.agents`,{recursive:!0}),await Re(Ae,`${JSON.stringify(t,null,2)}
`),console.log(`\u2705 Built index with ${t.length} skills:
`);for(let n of t)console.log(`  - ${n.name}: ${n.description}`);console.log(`
\uD83D\uDCC4 ${Ae}
`)}}),$a=l({meta:{name:"init",description:"Init new skill via skills.sh"},args:{name:{type:"positional",description:"Skill name",required:!1,default:"my-skill"}},run:async({args:e})=>{let t=e.name??"my-skill";console.log(`
\uD83D\uDCDD Initializing skill: ${t}
`),await Bun.spawn({cmd:["npx","skills","init",t],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),Ra=l({meta:{name:"remove",description:"Remove skills via skills.sh",alias:["rm"]},args:{skills:{type:"positional",description:"Skills to remove",required:!0}},run:async({args:e})=>{let n=e.skills.split(",").map((o)=>o.trim());console.log(`
\uD83D\uDDD1\uFE0F Removing skills: ${n.join(", ")}
`),await Bun.spawn({cmd:["npx","skills","remove",...n,"-p","-y"],cwd:process.cwd(),stdout:"inherit",stderr:"inherit"}).exited}}),Aa=l({meta:{name:"m skills",version:"1.0.0",description:"AI agent skills management via skills.sh + curated skills \u2014 sync, list, add, update, validate, index"},subCommands:{sync:us,list:wa,add:ka,update:xa,validate:Ca,index:Sa,init:$a,remove:Ra},run:async({args:e})=>{if(!e._||Array.isArray(e._)&&e._.length===0)await H(us,{rawArgs:[]})}}),Ea=Aa});function gs(e,t,n){let s=[];if(e.includes("Archont561/ts-monorepo-template")&&!e.includes(t))s.push("README still contains placeholder owner Archont561/ts-monorepo-template");if(e.includes("@myorg")&&!e.includes(n)){let o=e.split(`
`).filter((i)=>i.includes("shields.io")||i.includes("badge.svg"));for(let i of o)if(i.includes("@myorg"))s.push(`Badge line still contains @myorg: ${i.trim().slice(0,80)}`)}return s}var{file:Ta}=globalThis.Bun;var fs,_a;var hs=f(()=>{k();fs=l({meta:{name:"check",description:"Check README badges for placeholder owner/scope"},args:{owner:{type:"string",description:"Expected owner/repo",default:"YOUR_ORG/YOUR_REPO"},scope:{type:"string",description:"Expected scope",default:"@your-scope"}},run:async({args:e})=>{let t=e.owner||"YOUR_ORG/YOUR_REPO",n=e.scope||"@your-scope",s=`${process.cwd()}/README.md`,o=await Ta(s).text().catch(()=>"");if(!o)console.error(`No README at ${s}`),process.exit(1);let i=gs(o,t,n);if(i.length===0)console.log("\u2705 Badges look OK (no placeholder owner/scope in badge URLs)"),process.exit(0);console.warn(`\u26A0\uFE0F Badge issues:
${i.map((r)=>`  - ${r}`).join(`
`)}`),process.exit(1)}}),_a=l({meta:{name:"badges",version:"1.0.0",description:"Badges validation \u2014 check README badges"},subCommands:{check:fs},run:async()=>{await H(fs,{rawArgs:[]})}})});var{file:Oa}=globalThis.Bun;function Mt(e,t){return async({targetDir:n,scope:s})=>{let o=Me(...e.split("/"));if(!await Oa(o).exists())return;console.log(`
\uD83D\uDD27 Running setup for ${t}: ${e}
`);try{let r=await Bun.spawn({cmd:["bun",o],cwd:n,env:{...process.env,SCOPE:s,NATIVE_SCOPE:s,UNOCSS_SCOPE:s,DEVCONTAINER_SCOPE:s,SKILLS_SCOPE:s},stdout:"inherit",stderr:"inherit"}).exited;if(r!==0)console.warn(`\u26A0\uFE0F Setup for ${t} exited with code ${r}`)}catch(i){console.warn(`\u26A0\uFE0F Setup for ${t} failed:`,i)}}}var bs,ys,vs;var ws=f(()=>{O();bs=Mt("commands/native-setup.ts","native"),ys=Mt("commands/unocss-setup.ts","unocss"),vs=Mt("commands/devcontainer-setup.ts","devcontainer")});var{file:ks}=globalThis.Bun;async function Fp(e){return[...Y]}function Da(e){if(typeof e==="boolean")return!0;if(typeof e!=="string")return!1;return e==="always"||Na.includes(e)}function Cs(e,t){let n=e.flag?t[e.flag]:void 0;return n===void 0?e.default:n}function Ss(e,t){return e.type==="select"?t===e.default:!t}function ja(e,t){if(e.default==="always"&&!e.selfDestruct)return!0;let n=Cs(e,t);return!(e.selfDestruct===!0||Ss(e,n))}function $s(e,t){let n=new Set;for(let s of e)if(ja(s.meta,t))n.add(s.dir);return n}function Rs(e,t){let n=new Set(["template"]);for(let s of e){let{meta:o}=s;if(o.default==="always")continue;let i=Cs(o,t);if(Ss(o,i)){if(n.add(s.dir),o.flag)n.add(o.flag);if(o.marker)n.add(o.marker);if(o.templateMarker)n.add(o.templateMarker);for(let a of o.markers??[])n.add(a)}for(let a of o.options??[]){if(a.value===i)continue;if(a.marker)n.add(a.marker);if(a.templateMarker)n.add(a.templateMarker);for(let c of a.markers??[])n.add(c)}let r=o.removals?.[String(i)];if(r){if(r.marker)n.add(r.marker);if(r.templateMarker)n.add(r.templateMarker);for(let a of r.markers??[])n.add(a);for(let a of r.markersToRemove??[])n.add(a)}}return n}async function As(e){let t=ks(`${e}/package.json`);if(!await t.exists())return null;try{let s=(await t.json()).tooling?.features;if(!s||typeof s!=="object"||Array.isArray(s))return null;let o={};for(let[i,r]of Object.entries(s))if(Da(r))o[i]=r;return o}catch{return null}}async function Es(e){let t=ks(`${e}/package.json`);if(!await t.exists())return null;try{let s=(await t.json()).tooling?.scope;return typeof s==="string"&&s.length>0?s:null}catch{return null}}var Pa,xs="@myorg",Ia,Y,Gp,Up="tooling.features",Vp="tooling.scope",Na;var Ts=f(()=>{ws();Pa={none:"none",publish:"publish",docker:"docker"},Ia={badges:{name:"@myorg/badges",dir:"badges",meta:{default:"always",flag:"badges",prompt:"Include badges for CI, coverage, license in READMEs?"}},biome:{name:"@myorg/biome",ciFiles:["sections/biome.yml"],dir:"biome",meta:{default:"always",flag:"biome",prompt:"Configure Biome (lint + format)?"}},"bun-config":{name:"@myorg/bun-config",ciFiles:["sections/bun-config.yml"],dir:"bun-config",meta:{default:"always",flag:"bun-config",prompt:"Configure Bun (coverage, test settings)?"}},bunup:{name:"@myorg/bunup",ciFiles:["sections/bunup.yml"],dir:"bunup",meta:{default:"always",flag:"bunup",prompt:"Configure Bunup (Bun-based package bundler)?"}},changeset:{name:"@myorg/changeset",ciFiles:["fragments/changeset/release.steps.yml"],dir:"changeset",meta:{default:"always",flag:"changeset",prompt:"Configure Changesets (versioning + releases)?"}},citty:{name:"@myorg/citty",dir:"citty",meta:{default:"always",flag:"citty",prompt:"Configure Citty (elegant CLI builder)?"}},codeql:{name:"@myorg/codeql",ciFiles:["sections/codeql.yml"],dir:"codeql",meta:{default:!0,flag:"codeql",prompt:"Include CodeQL (GitHub SAST for JS/TS)?",type:"confirm"}},commitlint:{name:"@myorg/commitlint",dir:"commitlint",meta:{default:"always",flag:"commitlint",prompt:"Configure Commitlint (Conventional Commits)?"}},community:{name:"@myorg/community",dir:"community",meta:{default:"always",flag:"community",prompt:"Include community health files (CODEOWNERS, PR template, issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING)?"}},coverage:{name:"@myorg/coverage",ciFiles:["fragments/coverage-report/coverage.base.yml","fragments/coverage-report/coverage.steps.yml","fragments/coverage-report/pages.steps.yml","sections/coverage.yml"],dir:"coverage",meta:{default:"always",flag:"coverage",prompt:"Configure coverage reporting (LCOV, HTML, artifact, Pages, threshold)?"}},dependabot:{name:"@myorg/dependabot",ciFiles:["fragments/dependabot/dependabot-auto-merge.base.yml","fragments/dependabot/dependabot-auto-merge.steps.yml","fragments/dependabot/dependabot.base.yml","standalone/dependabot.yml"],dir:"dependabot",meta:{default:"always",flag:"dependabot",prompt:"Configure Dependabot (automated dependency updates)?"}},devcontainer:{name:"@myorg/devcontainer",dir:"devcontainer",setup:vs,meta:{default:!1,flag:"devcontainer",prompt:"Include devcontainer config for Codespaces / Dev Containers?",type:"confirm",removals:{true:{},false:{extraRemovals:[".devcontainer"],filePatternsToRemove:["**/.devcontainer/**",".devcontainer/**","**/devcontainer.json"],fileRegexesToRemove:["devcontainer","\\.devcontainer"]}}}},editorconfig:{name:"@myorg/editorconfig",dir:"editorconfig",meta:{default:"always",flag:"editorconfig",prompt:"Include .editorconfig (consistent editor settings)?"}},"gh-actions":{name:"@myorg/gh-actions",ciFiles:["ci.base.yml","ci.bootstrap.yml","release.base.yml","sections/gh-actions.yml"],dir:"gh-actions",meta:{default:"always",flag:"gh-actions",prompt:"Configure GitHub Actions (CI + release workflows)?"}},gitattributes:{name:"@myorg/gitattributes",dir:"gitattributes",meta:{default:"always",flag:"gitattributes",prompt:"Include .gitattributes (line endings, binary handling)?"}},gitleaks:{name:"@myorg/gitleaks",ciFiles:["sections/gitleaks.yml"],dir:"gitleaks",meta:{default:"always",flag:"gitleaks",prompt:"Include Gitleaks (secret scanning via Lefthook + CI)?"}},lefthook:{name:"@myorg/lefthook",dir:"lefthook",meta:{default:"always",flag:"lefthook",prompt:"Configure Lefthook (Git hooks)?"}},manifest:{name:"@myorg/manifest",dir:"manifest",meta:{default:"always",flag:"manifest",prompt:"Configure the manifest editor (format-preserving package.json edits)?"}},native:{name:"@myorg/native-config",ciFiles:["fragments/native/native.base.yml","fragments/native/native.steps.yml","fragments/native/release.steps.yml","sections/native.yml"],dir:"native",setup:bs,meta:{default:"none",flag:"native",prompt:"Set up native Node-API (NAPI-RS) bindings?",type:"select",options:[{value:"none",label:"None - skip native bindings"},{value:"publish",label:"Publish a native npm package"},{value:"docker",label:"Build native bindings in Docker"}],removals:{none:{extraRemovals:["packages/native","apps/example/src/pages/api/native"],scriptsToRemove:["build:native","build:wasm","test:native","security:audit"],turboTasksToRemove:["build:native","build:wasm"],filePatternsToRemove:["**/*.node","**/*.napi.*","**/*.wasi.cjs","**/rust-toolchain.toml","Cargo.lock",".cargo/**","**/native/**","**/api/native/**"],fileRegexesToRemove:["\\\\.node$","napi","rust-toolchain","api/native"],appDepsToRemove:["@myorg/native"]},publish:{},docker:{}}}},pages:{name:"@myorg/pages",ciFiles:["fragments/pages/pages.base.yml","fragments/pages/pages.steps.yml"],dir:"pages",meta:{default:!1,flag:"pages",prompt:"Set up GitHub Pages deployment (static site via Actions)?",type:"confirm",removals:{true:{},false:{extraRemovals:[".github/workflows/pages.yml"],filePatternsToRemove:["**/pages.yml"],fileRegexesToRemove:["pages\\.yml"]}}}},playwright:{name:"@myorg/playwright",ciFiles:["sections/playwright.yml"],dir:"playwright",meta:{default:!0,flag:"playwright",prompt:"Include E2E testing with Playwright?",removals:{true:{},false:{scriptsToRemove:["test:e2e"],turboTasksToRemove:["test:e2e"],extraRemovals:["apps/example/playwright.config.ts","apps/example/e2e"],filePatternsToRemove:["**/e2e/**","**/*.e2e.ts","**/playwright.config.ts"],fileRegexesToRemove:["playwright",".*\\.spec\\.e2e\\..*"],appDepsToRemove:["@myorg/playwright","@playwright/test"]}}}},skills:{name:"@myorg/skills",dir:"skills",meta:{default:!1,flag:"skills",prompt:"Install AI agent skills? (for Cursor, Claude, Cline)",removals:{false:{extraRemovals:[".agents"],filePatternsToRemove:[".agents/**","**/.claude/**","**/skills/**"],fileRegexesToRemove:["\\.agents","skills"],scriptsToRemove:["skills"]}}}},stale:{name:"@myorg/stale",ciFiles:["fragments/stale/stale.base.yml"],dir:"stale",meta:{default:!1,flag:"stale",prompt:"Include stale action (auto-close inactive issues/PRs)?",type:"confirm"}},template:{name:"@myorg/template",dir:"template",meta:{default:"always",selfDestruct:!0,scriptsToRemove:["docs:sync","docs:site","docs:dev","docs:build","docs:preview"],removals:{always:{extraRemovals:[".github/workflows/template-docs.yml","apps/template-docs","codecov.yml","packages/tooling/tests","packages/tooling/dist"],filePatternsToRemove:["**/template-docs.yml","**/template-docs/**",".changeset/*.md"],fileRegexesToRemove:["template-docs"]}}}},trivy:{name:"@myorg/trivy",ciFiles:["sections/trivy.yml"],dir:"trivy",meta:{default:!1,flag:"trivy",prompt:"Include Trivy (container + filesystem vulnerability scanning)?",type:"confirm",removals:{false:{filePatternsToRemove:["**/trivy*"],scriptsToRemove:["security:trivy","security:check"]}}}},ts:{name:"@myorg/ts",dir:"ts",meta:{default:"always",flag:"ts",prompt:"Configure TypeScript (shared tsconfigs)?"}},turbo:{name:"@myorg/turbo",ciFiles:["sections/turbo.yml"],dir:"turbo",meta:{default:"always",flag:"turbo",prompt:"Configure Turbo (task orchestration)?"}},unocss:{name:"@myorg/unocss",dir:"unocss",setup:ys,meta:{default:!1,flag:"unocss",marker:"unocss",prompt:"Include UnoCSS (atomic CSS engine)?",type:"confirm",removals:{true:{},false:{marker:"unocss",extraRemovals:["apps/example/public/uno.css","apps/example/uno.config.ts"],filePatternsToRemove:["**/uno.css","**/*.unocss.*"],fileRegexesToRemove:[],appDepsToRemove:["@unocss/reset","unocss","@myorg/unocss"]}}}}},Y=Object.values(Ia),Gp=new Map(Y.map((e)=>[e.dir,e]));Na=Object.values(Pa)});function _s(e,t){if(e.startsWith("!")){let n=e.slice(1).trim();return!t.has(n)&&!t.has(n.toLowerCase())}return t.has(e)||t.has(e.toLowerCase())}function qp(e){return[e,"-type","f","(",...La.flatMap((t,n)=>[...n>0?["-o"]:[],"-name",`*${t}`]),")","-not","-path","*/node_modules/*","-not","-path","*/dist/*","-not","-path","*/packages/tooling/*"]}function Os(e,t){let n=e,s=!1;for(let o of Ma)n=n.replace(o,(i,r,a)=>{let c=r.split(",").map((p)=>p.trim());return s=!0,c.every((p)=>_s(p,t))?"":a});for(let o of Ba)n=n.replace(o,(i,r,a)=>{if(r.toUpperCase()==="TEMPLATE-ONLY")return i;return s=!0,_s(r,t)?"":a});if(!s)return{content:e,changed:s};return{changed:s,content:n.replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).replace(/\n{2,}$/,`
`)}}var La,Ma,Ba;var Ps=f(()=>{La=[".yml",".yaml",".ts",".js",".md",".toml",".html"],Ma=[/[ \t]*#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,/[ \t]*<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g],Ba=[/[ \t]*#[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*\1:END[^\n]*\n?/g,/[ \t]*\/\/[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*\1:END[^\n]*\n?/g,/[ \t]*<!--[ \t]*([A-Za-z0-9_!-]+):START[ \t]*-->([\s\S]*?)<!--[ \t]*\1:END[ \t]*-->[ \t]*\n?/g]});var Is;var Ns=f(()=>{Is={BUN_VERSION:"latest",NATIVE_DIR:"packages/native",NATIVE_CARGO:"packages/native/Cargo.toml",NATIVE_NPM:"packages/native/npm/*/package.json",NATIVE_WASI_SDK_VERSION:"24",APP_DIR:"apps/example",APP_DOCKERFILE:"apps/example/Dockerfile"}});import{mkdir as Ds}from"fs/promises";var{$:Ga,file:de,write:Fa}=globalThis.Bun;function Ms(e){return Ls.exec(e)?.[1]??null}function Bs(e){return Ua.exec(e)?.[1]??null}function Ha(e,t){let n=[],s=t,o=[],i=()=>{let r=o.join(`
`).replace(/^(?:[ \t]*\n)+/,"").replace(/\s+$/,"");if(r)n.push({section:s,text:r});o=[]};for(let r of e.split(`
`)){let a=Ms(r);if(a){i(),s=a;continue}o.push(r)}return i(),n}function qa(e){return e.split(`
`).some((t)=>Ls.test(t))}function Wa(e,t){let n=new Map;for(let r of t)for(let a of Ha(r,Gs)){let c=n.get(a.section)??[];c.push(a.text),n.set(a.section,c)}let s=new Set,o=new Set,i=[];for(let r of e.split(`
`)){let a=Ms(r);if(!a){i.push(r);continue}s.add(a);let c=n.get(a);if(c?.length)o.add(a),i.push(c.join(`

`))}for(let r of n.keys())if(!s.has(r))console.log(`\u26A0\uFE0F No "# SECTION: ${r}" in the CI skeleton \u2014 steps dropped`);return{rendered:i.join(`
`),filled:o}}function Ja(e,t){if(t.size===0)return e;let n=[],s=!1;for(let o of e.split(`
`)){let i=Bs(o);if(i)s=t.has(i);else if(/^\S/.test(o))s=!1;if(!s)n.push(o)}return n.join(`
`)}function Ka(e,t){let n=e.split(`
`),s=!1;for(let[o,i]of n.entries()){let r=Bs(i);if(r)s=r===Va;else if(/^\S/.test(i))s=!1;if(s&&/^ {4}needs: \[[^\]]*\]$/.test(i)){n[o]=`    needs: [${t.join(", ")}]`;break}}return n.join(`
`)}function Fs(){return new Set(Y.map((e)=>e.dir))}function Bt(e){return Me("ci",...e.split("/"))}function za(e,t){if(t==="ci.steps.yml")return e.startsWith("sections/");return(e.split("/").pop()??"")===t}async function Ya(e,t){let n=[];for(let s of Y){if(!t.has(s.dir))continue;for(let o of s.ciFiles??[]){if(!za(o,e))continue;n.push((await de(Bt(o)).text()).trimEnd())}}return n}async function Qa(e,t){for(let n of Y){if(!t.has(n.dir))continue;for(let s of n.ciFiles??[])if((s.split("/").pop()??"")===e)return Bt(s)}return null}async function Za(){let e=Bt("ci.bootstrap.yml");if(!await de(e).exists())return"";return(await de(e).text()).trimEnd()}async function Xa(e,t){if(!t)return;let n=Rs(Y,t),s=await Es(e);return(o)=>{let{content:i}=Os(o,n);return s?i.replaceAll(xs,s):i}}async function ec(e,t,n,s={}){let o=s.enabled??Fs(),i=await Qa(t,o);if(!i){console.log(`\u26A0\uFE0F Skipping ${t} \u2014 no enabled feature declares it`);return}let r=await de(i).text(),a=await Ya(n,o),c=a.join(`

`),u;if(n==="ci.steps.yml"&&qa(r)){let b=Wa(r.replaceAll("{{BOOTSTRAP}}",await Za()),a),m=new Set(js.filter((y)=>!b.filled.has(y))),C=[Gs,...js.filter((y)=>!m.has(y))];u=Ka(Ja(b.rendered,m),C)}else u=r.replace("{{STEPS}}",`${c}
`).replace("{{UPDATES}}",`${c}
`);let p=u;for(let[b,m]of Object.entries(Is))p=p.replaceAll(`{{${b}}}`,m);p=p.replace(/\n{3,}/g,`

`);let w;if(t==="dependabot.base.yml")w=`${e}/.github/dependabot.yml`;else w=`${e}/.github/workflows/${t.replace(".base.yml",".yml")}`;await Fa(w,s.postProcess?s.postProcess(p):p),console.log(`\u2705 generated ${w}`)}async function nc(e,t,n,s){let o=t.outcome(n);if(o==="skip")return;if(o==="generate"){await ec(e,t.base,t.steps,s);return}if(!t.stale)return;let i=`${e}/${t.stale}`;if(!await de(i).exists())return;await Ga`rm -rf ${i}`.quiet();let r=t.reason?.(n);if(r)console.log(`\uD83D\uDDD1\uFE0F Removed ${i} (${r})`)}async function Us(e,t={}){await Ds(`${e}/.github/workflows`,{recursive:!0}),await Ds(`${e}/.github`,{recursive:!0});let n=await As(e),s=t.enabled??(n?$s(Y,n):Fs()),o=t.postProcess??await Xa(e,n),i=s.has("pages"),r=t.templateDocsSite??await de(`${e}/apps/template-docs/.vitepress/config.mts`).exists(),a={pages:i,coverage:s.has("coverage"),native:s.has("native"),dependabot:s.has("dependabot")||s.has("gh-actions"),stale:s.has("stale"),templateDocsSite:r,pagesDeploysToSite:i&&!r};for(let c of tc)await nc(e,c,a,{...t,enabled:s,postProcess:o})}var Ls,Ua,Gs="quality",Va="gate",js,tc,eu;var Vs=f(async()=>{O();Ts();Ps();Ns();Ls=/^[ \t]*#[ \t]*SECTION:[ \t]*([A-Za-z0-9_-]+)[ \t]*$/,Ua=/^ {2}([A-Za-z0-9_-]+):$/;js=["coverage","security","native","e2e"];tc=[{base:"ci.base.yml",steps:"ci.steps.yml",outcome:()=>"generate"},{base:"release.base.yml",steps:"release.steps.yml",outcome:()=>"generate"},{base:"pages.base.yml",steps:"pages.steps.yml",outcome:(e)=>e.pagesDeploysToSite?"generate":"remove",stale:".github/workflows/pages.yml",reason:(e)=>e.templateDocsSite?"template docs site deploys Pages":"pages disabled"},{base:"coverage.base.yml",steps:"coverage.steps.yml",outcome:(e)=>{if(!e.coverage)return"skip";return e.pagesDeploysToSite||e.templateDocsSite?"remove":"generate"},stale:".github/workflows/coverage.yml",reason:(e)=>e.templateDocsSite?"coverage published by the docs site":"coverage included in pages.yml"},{base:"native.base.yml",steps:"native.steps.yml",outcome:(e)=>e.native?"generate":"remove",stale:".github/workflows/native.yml",reason:()=>"native disabled"},{base:"dependabot.base.yml",steps:"dependabot.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"dependabot-auto-merge.base.yml",steps:"dependabot-auto-merge.steps.yml",outcome:(e)=>e.dependabot?"generate":"skip"},{base:"stale.base.yml",steps:"stale.steps.yml",outcome:(e)=>e.stale?"generate":"remove",stale:".github/workflows/stale.yml"}];eu=process.argv[2]??"."});import{existsSync as Hs}from"fs";import{cp as qs,rm as Ws}from"fs/promises";var{spawnSync:sc}=globalThis.Bun;function Te(e){return console.log(`
\u25B8 ${e.join(" ")}`),sc({cmd:e,stdout:"inherit",stderr:"inherit",stdin:"inherit"}).exitCode}var Gt=".pages",Js="apps/template-docs",re,Ft="coverage/html",oc,ic;var Ks=f(async()=>{k();await Vs();re=`${Js}/dist`;oc=l({meta:{name:"m docs",version:"1.0.0",description:"Regenerate workflows from configs/* \u2014 static README/AGENTS with TEMPLATE-ONLY blocks"},args:{dir:{type:"string",description:"Target directory (default: .)",required:!1,default:"."}},subCommands:{site:l({meta:{name:"site",description:"Build one Pages artifact: docs + coverage report + demo app"},args:{"skip-coverage":{type:"boolean",description:"Reuse coverage/lcov.info instead of re-running the test suite",default:!1},"skip-app":{type:"boolean",description:"Skip building and copying the demo app to /example/",default:!1}},async run({args:e}){if(!e["skip-coverage"]){let n=Te(["bun","run","coverage"]);if(n!==0)console.error(`::error::bun run coverage failed (exit ${n})`),process.exit(n)}Te(["bun","run","m coverage","setup"]),Te(["bun","run","m coverage","html"]);let t=Te(["bun","run","docs:build"]);if(t!==0)console.error(`::error::${Js} build failed (exit ${t})`),process.exit(t);if(Hs(`${Ft}/index.html`))await Ws(`${re}/coverage`,{recursive:!0,force:!0}),await qs(Ft,`${re}/coverage`,{recursive:!0}),console.log(`\u2705 Coverage report copied to ${re}/coverage`);else console.warn(`\u26A0\uFE0F ${Ft}/ not found \u2014 skipping /coverage/`);if(!e["skip-app"]){let n=Te(["bun","run","m pages","build"]);if(n!==0)console.error(`::error::m pages build failed (exit ${n})`),process.exit(n);if(Hs(Gt))await Ws(`${re}/example`,{recursive:!0,force:!0}),await qs(Gt,`${re}/example`,{recursive:!0}),console.log(`\u2705 Pages artifact copied to ${re}/example`);else console.warn(`\u26A0\uFE0F ${Gt}/ not found \u2014 skipping /example/`)}if(console.log(`
\u2705 Site ready: ${re}`),console.log("   /            docs"),console.log("   /status      coverage, CI, versions"),console.log("   /coverage/   HTML coverage report"),!e["skip-app"])console.log("   /example/    demo app");process.exit(0)}})},async run({args:e}){await Us(e.dir||".")}}),ic=oc});k();var rc={lint:()=>Promise.resolve().then(() => (sn(),{})).then((e)=>wo),"lint:fix":()=>Promise.resolve().then(() => (on(),{})).then((e)=>xo),biome:()=>Promise.resolve().then(() => (rn(),{})).then((e)=>So),typecheck:()=>Promise.resolve().then(() => (an(),{})).then((e)=>Ro),turbo:()=>Promise.resolve().then(() => (cn(),{})).then((e)=>Eo),build:()=>Promise.resolve().then(() => (at(),{})).then((e)=>Do),health:()=>Promise.resolve().then(() => (pn(),{})).then((e)=>jo),bun:()=>Promise.resolve().then(() => (gn(),{})).then((e)=>zo),test:()=>Promise.resolve().then(() => (fn(),{})).then((e)=>Yo),coverage:()=>Promise.resolve().then(() => ($n(),{})).then((e)=>hi),changeset:()=>Promise.resolve().then(() => (dt(),{})).then((e)=>$i),setup:()=>Promise.resolve().then(() => (An(),{})).then((e)=>Oi),ci:()=>Promise.resolve().then(() => (Fe(),{})).then((e)=>ji),"ci:lint":()=>Promise.resolve().then(() => (En(),{})).then((e)=>Li),"ci:local":()=>Promise.resolve().then(() => (Tn(),{})).then((e)=>Mi),gitleaks:()=>Promise.resolve().then(() => (_n(),{})).then((e)=>Vi),trivy:()=>Promise.resolve().then(() => (Pn(),{})).then((e)=>Qi),codeql:()=>Promise.resolve().then(() => (In(),{})).then((e)=>Zi),native:()=>Promise.resolve().then(() => (Xn(),{})).then((e)=>qr),e2e:()=>Promise.resolve().then(() => (ts(),{})).then((e)=>Kr),unocss:()=>Promise.resolve().then(() => (os(),{})).then((e)=>sa),pages:()=>Promise.resolve().then(() => (ls(),{})).then((e)=>ya),skills:()=>Promise.resolve().then(() => (ds(),{})).then((e)=>Ea),badges:()=>Promise.resolve().then(() => (hs(),{})).then((e)=>_a),docs:()=>Ks().then(() => ({})).then((e)=>ic)},ac=l({meta:{name:"m",version:"0.1.0",description:"Unified monorepo toolchain CLI"},subCommands:rc});it(ac);

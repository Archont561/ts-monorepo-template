# @myorg/manifest

Format-preserving edits to the JSON manifests this repo owns — `package.json`,
`configs/turbo/turbo.base.json` — so an edit never reformats the rest of the file.

## Why it is here

`JSON.stringify(value, null, 2)` reflows every array in a document onto its own
line. A scaffolded project's own `biome check` then rejects the manifest it was
just handed, because biome keeps short arrays inline. Parsing and re-serializing
is the obvious way to edit a manifest; it is also the way that produced the
formatting bug class this package removes.

## Usage

```ts
import { removeJsonEntry, setJsonValue, updateManifestFile } from "@myorg/manifest";

await updateManifestFile(rootPkgPath, (source) =>
  setJsonValue(source, "scripts.build:native", "mnative build"),
);

await updateManifestFile(turboPath, (source) =>
  removeJsonEntry(source, "tasks.build:native"),
);
```

### API

| Need | Use |
| :--- | :--- |
| Read a manifest for inspection | `readJson<T>(source)` |
| Set a string/number/boolean entry | `setJsonValue(source, path, value)` |
| Set an object/array entry | `setJsonBlock(source, path, block)` |
| Delete an entry | `removeJsonEntry(source, path)` |
| Append to an array | `addJsonArrayValue(source, path, value)` |
| Drop an array element | `removeJsonArrayValue(source, path, value)` |
| Edit a file (writes only on change) | `updateManifestFile(path, edit)` |

Paths are dotted: `scripts.build:native`, `devDependencies.@myorg/unocss`,
`tasks.build:wasm`. Addresses may not contain dots themselves.

`setJsonBlock` takes JSON text rather than a value because objects and arrays
have no single spelling: the caller writes the block the way the target file
writes it, and the indentation is re-based to wherever the entry lands.

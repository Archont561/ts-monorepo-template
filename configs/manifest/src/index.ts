/**
 * @myorg/manifest — format-preserving edits to the JSON manifests this repo owns
 *
 * Parsing and re-serializing is the obvious way to edit a `package.json`, but
 * `JSON.stringify(value, null, 2)` reflows every array in the file onto its own
 * line, and the scaffolded project's own `biome check` then rejects the config
 * it was just handed. These helpers edit the text instead: the caller names the
 * entry it wants, and every byte it did not ask about survives.
 *
 * Paths are dotted (`scripts.build:native`, `devDependencies.@myorg/unocss`) and
 * addresses must not contain dots themselves. Edits assume each entry occupies
 * its own line, which is how the manifests in this repo are committed.
 */

/** Values that have exactly one JSON spelling, so no formatting choice exists. */
export type JsonScalar = string | number | boolean;

type Member = {
  /** Index of the opening quote of the key. */
  keyStart: number;
  /** Index just past the value. */
  valueEnd: number;
  /** Index of the first character of the value. */
  valueStart: number;
};

function skipWhitespace(source: string, index: number): number {
  let i = index;
  while (i < source.length && /\s/.test(source[i] as string)) i++;
  return i;
}

function lineStart(source: string, index: number): number {
  return source.lastIndexOf("\n", index) + 1;
}

/** The indentation of the line `index` sits on. */
function lineIndent(source: string, index: number): string {
  const match = /^[ \t]*/.exec(source.slice(lineStart(source, index), index));
  return match ? match[0] : "";
}

/** Skips a JSON string whose opening quote is at `index`; -1 when unterminated. */
function skipString(source: string, index: number): number {
  let i = index + 1;
  while (i < source.length) {
    if (source[i] === "\\") {
      i += 2;
      continue;
    }
    if (source[i] === '"') return i + 1;
    i++;
  }
  return -1;
}

/** Returns the index just past the JSON value that starts at `index`. */
function skipValue(source: string, index: number): number {
  const char = source[index];
  if (char === '"') return skipString(source, index);

  if (char === "{" || char === "[") {
    let depth = 0;
    let i = index;
    while (i < source.length) {
      const current = source[i];
      if (current === '"') {
        i = skipString(source, i);
        continue;
      }
      if (current === "{" || current === "[") depth++;
      else if (current === "}" || current === "]") {
        depth--;
        if (depth === 0) return i + 1;
      }
      i++;
    }
    return -1;
  }

  let i = index;
  while (i < source.length && !/[\s,\]}]/.test(source[i] as string)) i++;
  return i;
}

/** Index of the document's root object. */
function rootObject(source: string): number {
  const start = skipWhitespace(source, 0);
  return source[start] === "{" ? start : -1;
}

/** Finds `"key": value` inside the object that starts at `objectStart`. */
function findMember(source: string, objectStart: number, key: string): Member | null {
  let i = skipWhitespace(source, objectStart + 1);
  while (i < source.length && source[i] !== "}") {
    if (source[i] !== '"') return null;

    const keyEnd = skipString(source, i);
    if (keyEnd === -1) return null;
    const colon = skipWhitespace(source, keyEnd);
    if (source[colon] !== ":") return null;

    const valueStart = skipWhitespace(source, colon + 1);
    const valueEnd = skipValue(source, valueStart);
    if (valueEnd === -1) return null;
    if (source.slice(i, keyEnd) === JSON.stringify(key)) {
      return { keyStart: i, valueStart, valueEnd };
    }

    i = skipWhitespace(source, valueEnd);
    if (source[i] === ",") i = skipWhitespace(source, i + 1);
    else return null;
  }
  return null;
}

/**
 * Removes the entry spanning `[start, end)` together with the comma that joined
 * it to its neighbours, so the surrounding lines keep their layout.
 */
function removeEntry(source: string, start: number, end: number): string {
  const startOfLine = lineStart(source, start);

  if (source.slice(startOfLine, start).trim() !== "") {
    // Shares its line with a neighbour (an inline array): take the comma that
    // follows, or the one that preceded it.
    const trailing = /^[ \t]*,[ \t]*/.exec(source.slice(end));
    if (trailing) return source.slice(0, start) + source.slice(end + trailing[0].length);

    const before = source.slice(0, start).replace(/[ \t]*,[ \t]*$/, "");
    return before === source.slice(0, start)
      ? source.slice(0, start) + source.slice(end)
      : `${before}${source.slice(end)}`;
  }

  const trailingComma = /^[ \t]*,[ \t]*\r?\n?/.exec(source.slice(end));
  if (trailingComma) {
    return source.slice(0, startOfLine) + source.slice(end + trailingComma[0].length);
  }

  // Last entry in the object — its predecessor gives up the comma instead.
  const beforeLine = source.slice(0, startOfLine).replace(/[ \t]*\n$/, "");
  if (beforeLine.endsWith(",")) return `${beforeLine.slice(0, -1)}${source.slice(end)}`;

  return source.slice(0, startOfLine) + source.slice(end);
}

/** Two spaces, or whatever the document already uses for one level. */
function indentUnit(source: string): string {
  const match = /\n([ \t]+)\S/.exec(source);
  return match?.[1] ?? "  ";
}

/**
 * Re-indents a multi-line block to sit after `keyIndent:`. Blocks are written
 * with the opening brace on the first line, one relative indent level inside and
 * the closing brace at column zero — the style of the manifests they land in.
 */
function indentBlock(block: string, keyIndent: string, unit: string): string {
  const lines = block.split("\n");
  if (lines.length === 1) return block;

  const middle = lines.slice(1, -1).filter((line) => line.trim() !== "");
  const common = middle.reduce(
    (min, line) => Math.min(min, (/^[ \t]*/.exec(line) as RegExpExecArray)[0].length),
    Number.POSITIVE_INFINITY,
  );
  const base = Number.isFinite(common) ? common : 0;

  return [
    lines[0],
    ...lines
      .slice(1, -1)
      .map((line) => (line.trim() === "" ? "" : keyIndent + unit + line.slice(base))),
    `${keyIndent}${(lines.at(-1) as string).trim()}`,
  ].join("\n");
}

/** Inserts a new entry at the end of the object that starts at `objectStart`. */
function insertMember(source: string, objectStart: number, key: string, text: string): string {
  const unit = indentUnit(source);
  const close = skipValue(source, objectStart) - 1; // index of the closing brace
  const closeIndent = lineIndent(source, close);
  const first = skipWhitespace(source, objectStart + 1);

  if (first === close) {
    const inner = `${closeIndent}${unit}`;
    const value = indentBlock(text, inner, unit);
    return `${source.slice(0, close)}\n${inner}${JSON.stringify(key)}: ${value}\n${closeIndent}${source.slice(close)}`;
  }

  const keyIndent = lineIndent(source, first);
  let lastEnd = first;
  let i = first;
  while (i < close) {
    const keyEnd = skipString(source, i);
    const colon = skipWhitespace(source, keyEnd);
    lastEnd = skipValue(source, skipWhitespace(source, colon + 1));
    i = skipWhitespace(source, lastEnd);
    if (source[i] === ",") i = skipWhitespace(source, i + 1);
    else break;
  }

  const value = indentBlock(text, keyIndent, unit);
  return `${source.slice(0, lastEnd)},\n${keyIndent}${JSON.stringify(key)}: ${value}${source.slice(lastEnd)}`;
}

/** Expanded object text for the segments that have to be created on the way. */
function blockFor(segments: string[], text: string): string {
  const [head, ...rest] = segments;
  const value = rest.length === 0 ? text : blockFor(rest, text);
  return `{\n  ${JSON.stringify(head as string)}: ${value}\n}`;
}

function replaceValue(source: string, member: Member, text: string): string {
  const value = indentBlock(text, lineIndent(source, member.valueStart), indentUnit(source));
  return source.slice(0, member.valueStart) + value + source.slice(member.valueEnd);
}

function writeEntry(source: string, segments: string[], text: string): string {
  const key = segments.at(-1);
  if (key === undefined) return source;

  const container = containerFor(source, segments.slice(0, -1));
  if (container === -1) {
    // The chain of parents is missing, so it is created in one insertion.
    const [top, ...rest] = segments;
    const root = rootObject(source);
    if (top === undefined || root === -1) return source;
    return insertMember(source, root, top, blockFor(rest, text));
  }

  const member = findMember(source, container, key);
  return member ? replaceValue(source, member, text) : insertMember(source, container, key, text);
}

/** Walks a path and returns the object index that holds the last segment. */
function containerFor(source: string, segments: string[]): number {
  let container = rootObject(source);
  for (const segment of segments) {
    if (container === -1) return -1;
    const member = findMember(source, container, segment);
    if (!member || source[member.valueStart] !== "{") return -1;
    container = member.valueStart;
  }
  return container;
}

/**
 * Sets a scalar entry, creating the intermediate objects when they are missing.
 * Scalars have a single JSON spelling, so nothing has to be formatted.
 */
export function setJsonValue(source: string, path: string, value: JsonScalar): string {
  return writeEntry(source, path.split("."), JSON.stringify(value));
}

/**
 * Sets an entry whose value is JSON text — used for objects and arrays, which
 * have no single spelling. Callers write the block in the style of the file they
 * are editing; the indentation is re-based to wherever the entry lands.
 */
export function setJsonBlock(source: string, path: string, block: string): string {
  return writeEntry(source, path.split("."), block.trim());
}

/** Removes a `"key": value` entry. A path that is not there leaves the text alone. */
export function removeJsonEntry(source: string, path: string): string {
  const segments = path.split(".");
  const container = containerFor(source, segments.slice(0, -1));
  if (container === -1) return source;

  const member = findMember(source, container, segments.at(-1) as string);
  return member ? removeEntry(source, member.keyStart, member.valueEnd) : source;
}

/** Appends `value` to the array at `path`, keeping the array's own layout. */
export function addJsonArrayValue(source: string, path: string, value: string): string {
  const literal = JSON.stringify(value);
  const segments = path.split(".");
  const container = containerFor(source, segments.slice(0, -1));
  if (container === -1) return source;

  const member = findMember(source, container, segments.at(-1) as string);
  if (!member) return writeEntry(source, segments, `[${literal}]`);
  if (source[member.valueStart] !== "[") return source;

  const close = skipValue(source, member.valueStart) - 1; // index of the closing bracket
  let i = skipWhitespace(source, member.valueStart + 1);
  if (i === close) {
    if (!source.slice(member.valueStart, close).includes("\n")) {
      return `${source.slice(0, close)}${literal}${source.slice(close)}`;
    }
    const closeIndent = lineIndent(source, close);
    return `${source.slice(0, close)}${closeIndent}${indentUnit(source)}${literal}\n${closeIndent}${source.slice(close)}`;
  }

  let lastStart = i;
  let lastEnd = i;
  while (i < close) {
    lastStart = i;
    lastEnd = skipValue(source, i);
    i = skipWhitespace(source, lastEnd);
    if (source[i] === ",") i = skipWhitespace(source, i + 1);
    else break;
  }

  const inline = !source.slice(member.valueStart, close).includes("\n");
  const separator = inline ? ", " : `,\n${lineIndent(source, lastStart)}`;
  return `${source.slice(0, lastEnd)}${separator}${literal}${source.slice(lastEnd)}`;
}

/** Removes every element equal to `value` from the array at `path`. */
export function removeJsonArrayValue(source: string, path: string, value: string): string {
  const literal = JSON.stringify(value);
  const segments = path.split(".");
  const container = containerFor(source, segments.slice(0, -1));
  if (container === -1) return source;

  const member = findMember(source, container, segments.at(-1) as string);
  if (!member || source[member.valueStart] !== "[") return source;

  const close = skipValue(source, member.valueStart) - 1;
  let i = skipWhitespace(source, member.valueStart + 1);
  while (i < close) {
    const valueEnd = skipValue(source, i);
    if (source.slice(i, valueEnd) === literal) return removeEntry(source, i, valueEnd);
    i = skipWhitespace(source, valueEnd);
    if (source[i] === ",") i = skipWhitespace(source, i + 1);
  }
  return source;
}

/** Parses a manifest that another helper is about to edit. */
export function readJson<T = Record<string, unknown>>(source: string): T {
  return JSON.parse(source) as T;
}

/**
 * Reads a manifest, applies `edit`, and writes the file back only when the text
 * actually changed — so an idempotent second run leaves the file untouched.
 * Returns false when the file is absent or the edit is a no-op.
 */
export async function updateManifestFile(
  path: string,
  edit: (source: string) => string,
): Promise<boolean> {
  const file = Bun.file(path);
  if (!(await file.exists())) return false;

  const source = await file.text();
  const next = edit(source);
  if (next === source) return false;

  await Bun.write(path, next);
  return true;
}

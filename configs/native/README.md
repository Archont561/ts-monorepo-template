# @myorg/native

> Opt-in NAPI-RS native bindings, selected at scaffold time.

## What it provides

- A `select` scaffold prompt (`none` / `publish` / `docker`) that decides
  whether a generated project ships native bindings.
- `@napi-rs/cli` as a shared devDependency for projects that opt in.

## Usage

```bash
bun create <user>/<repo> my-app   # choose "Set up native Node-API bindings?"
```

Selecting `none` removes the config (and its artifacts) from the generated
project entirely.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
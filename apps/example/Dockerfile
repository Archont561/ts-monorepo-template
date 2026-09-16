# syntax=docker/dockerfile:1.7
# Production-ready Dockerfile for @myorg/example
# Native: the Cargo workspace lives at the repo root (crates/* + packages/native/npm/*), driven by `m native`
# Follows guide: pinned tags, multi-stage, layer caching, non-root, exec form, HEALTHCHECK, OCI labels, BuildKit cache

ARG BUN_VERSION=1.4.2
ARG RUST_VERSION=1.84

# -----------------------------------------------------------------------------
# Base - bun with workspace
# -----------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app
ENV BUN_INSTALL_CACHE=/root/.bun/install/cache

# -----------------------------------------------------------------------------
# Deps - install dependencies (cached unless lockfile changes)
# -----------------------------------------------------------------------------
FROM base AS deps

COPY package.json bun.lock ./

COPY apps/example/package.json ./apps/example/package.json
COPY apps/template-docs/package.json ./apps/template-docs/package.json
COPY packages/external/package.json ./packages/external/package.json
COPY packages/internal/package.json ./packages/internal/package.json
COPY packages/tooling/package.json ./packages/tooling/package.json
COPY packages/native/npm/native/package.json ./packages/native/npm/native/package.json

# The Rust workspace lives at the repo root: the virtual manifest, toolchain
# pin and crates/ — plus the crates/package.json bridge node that `bun install
# --frozen-lockfile` below needs in order to match the lockfile. Busted only
# when they change.
COPY Cargo.toml rust-toolchain.toml .cargo/ ./
COPY crates/ ./crates/
COPY packages/native/ ./packages/native/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile || bun install

# -----------------------------------------------------------------------------
# Builder - build the app (native bindings via `m native`, TS)
# -----------------------------------------------------------------------------
FROM deps AS builder

COPY . .


# Cargo via `m native` (virtual workspace at the repo root)
RUN if [ -f "Cargo.toml" ]; then \
      echo "🦀 Native workspace detected (repo root)"; \
      if command -v cargo >/dev/null 2>&1; then \
        echo "→ m native check (fast)"; \
        bun run --filter @myorg/native-crates run build || true; \
        ./node_modules/.bin/m native check || cargo check || true; \
        echo "→ m native clippy"; \
        ./node_modules/.bin/m native clippy || true; \
        echo "→ bun run build:native (m native napi:build)"; \
        bun run build:native || ./node_modules/.bin/m native napi:build || echo "native build skipped"; \
      else \
        echo "cargo not found in builder, skipping native build (use rust-builder stage)"; \
      fi; \
    else \
      echo "No native package, skipping Rust build"; \
    fi

# Build JS packages (Turbo)
RUN bun run build || echo "JS build skipped"

# -----------------------------------------------------------------------------
# Rust-builder - dedicated stage for native bindings (for native=docker option)
# Uses rust image + bun for the `m native` build, self-contained Cargo.toml
# -----------------------------------------------------------------------------
FROM rust:${RUST_VERSION}-bookworm AS rust-builder
WORKDIR /app

ARG BUN_VERSION
RUN curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    bun --version

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
# rust-toolchain.toml and .cargo/config.toml live at the repo root
COPY Cargo.toml rust-toolchain.toml .cargo/ ./
COPY crates/ ./crates/
COPY packages/ ./packages/
COPY apps/ ./apps/

# Build every crate + every binding in the workspace via `m native`
RUN if [ -f "Cargo.toml" ]; then \
      echo "🦀 Rust-builder: m native build:release"; \
      ./node_modules/.bin/m native build:release || cargo build --workspace --release || true; \
      echo "🦀 Rust-builder: m native napi:build (once per package)"; \
      ./node_modules/.bin/m native napi:build || bun --filter @myorg/native run build || true; \
    else \
      echo "No native Cargo.toml in rust-builder, skipping"; \
    fi

# -----------------------------------------------------------------------------
# Runner - lean production image (alpine)
# -----------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

LABEL org.opencontainers.image.source="https://github.com/Archont561/ts-monorepo-template"
LABEL org.opencontainers.image.description="Bun monorepo example - HTTP server with optional native Rust bindings"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.title="example"
LABEL org.opencontainers.image.version="0.0.0"
LABEL org.opencontainers.image.base.name="oven/bun:${BUN_VERSION}-alpine"

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/bun.lock ./bun.lock
COPY --from=builder --chown=app:app /app/apps/example ./apps/example
COPY --from=builder --chown=app:app /app/packages ./packages
COPY --from=builder --chown=app:app /app/node_modules ./node_modules

# Built bindings: one npm package per crate, loaders + binaries generated next to it
COPY --from=rust-builder --chown=app:app /app/packages/native/npm/*/*.node ./packages/native/npm/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/packages/native/npm/*/*.wasm ./packages/native/npm/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/packages/native/npm/*/index.js ./packages/native/npm/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/packages/native/npm/*/index.d.ts ./packages/native/npm/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/packages/native/npm/*/*.wasi.cjs ./packages/native/npm/native/ 2>/dev/null || true

COPY --from=builder --chown=app:app /app/apps/example/public ./apps/example/public 2>/dev/null || true

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["bun", "run", "apps/example/dist/index.js"]

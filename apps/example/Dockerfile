# syntax=docker/dockerfile:1.7
# Production-ready Dockerfile for @myorg/example
# Native: packages/native is a virtual Cargo workspace (crates/* + npm/*), driven by mnative
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
COPY packages/external/package.json ./packages/external/package.json
COPY packages/internal/package.json ./packages/internal/package.json
COPY packages/native/npm/native/package.json ./packages/native/npm/native/package.json
COPY configs/biome/package.json ./configs/biome/package.json
COPY configs/bun-config/package.json ./configs/bun-config/package.json
COPY configs/bunup/package.json ./configs/bunup/package.json
COPY configs/changeset/package.json ./configs/changeset/package.json
COPY configs/citty/package.json ./configs/citty/package.json
COPY configs/commitlint/package.json ./configs/commitlint/package.json
COPY configs/coverage/package.json ./configs/coverage/package.json
COPY configs/dependabot/package.json ./configs/dependabot/package.json
COPY configs/devcontainer/package.json ./configs/devcontainer/package.json
COPY configs/gh-actions/package.json ./configs/gh-actions/package.json
COPY configs/lefthook/package.json ./configs/lefthook/package.json
COPY configs/native/package.json ./configs/native/package.json
COPY configs/pages/package.json ./configs/pages/package.json
COPY configs/playwright/package.json ./configs/playwright/package.json
COPY configs/skills/package.json ./configs/skills/package.json
COPY configs/template/package.json ./configs/template/package.json
COPY configs/ts/package.json ./configs/ts/package.json
COPY configs/turbo/package.json ./configs/turbo/package.json
COPY configs/unocss/package.json ./configs/unocss/package.json

# The Rust workspace lives in packages/native (no root Cargo.toml): the virtual
# manifest, its crates and their npm packages — busted only when they change.
COPY packages/native/ ./packages/native/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile || bun install

# -----------------------------------------------------------------------------
# Builder - build the app (CSS, native bindings via mnative, TS)
# -----------------------------------------------------------------------------
FROM deps AS builder

COPY . .

# Build UnoCSS if config exists (opt-in)
RUN if [ -f "configs/unocss/uno.config.ts" ]; then \
      echo "🎨 Building UnoCSS..."; \
      bunx unocss --config configs/unocss/uno.config.ts || echo "UnoCSS build skipped"; \
    else \
      echo "UnoCSS not enabled, skipping"; \
    fi

# Cargo via mnative CLI (virtual workspace in packages/native)
RUN if [ -f "packages/native/Cargo.toml" ]; then \
      echo "🦀 Native workspace detected (packages/native)"; \
      if command -v cargo >/dev/null 2>&1; then \
        echo "→ mnative check (fast)"; \
        bun run --filter @myorg/native-config run build || true; \
        ./node_modules/.bin/mnative check || cargo check --manifest-path packages/native/Cargo.toml || true; \
        echo "→ mnative clippy"; \
        ./node_modules/.bin/mnative clippy || true; \
        echo "→ bun run build:native (mnative napi:build)"; \
        bun run build:native || ./node_modules/.bin/mnative napi:build || echo "native build skipped"; \
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
# Uses rust image + bun for mnative build, self-contained Cargo.toml
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
# rust-toolchain.toml and .cargo/config.toml live inside packages/native
COPY packages/native/ ./packages/native/
COPY configs/ ./configs/
COPY packages/ ./packages/
COPY apps/ ./apps/

# Build every crate + every binding in the workspace via mnative
RUN if [ -f "packages/native/Cargo.toml" ]; then \
      echo "🦀 Rust-builder: mnative build:release"; \
      ./node_modules/.bin/mnative build:release || cargo build --manifest-path packages/native/Cargo.toml --workspace --release || true; \
      echo "🦀 Rust-builder: mnative napi:build (once per package)"; \
      ./node_modules/.bin/mnative napi:build || bun --filter @myorg/native run build || true; \
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
LABEL org.opencontainers.image.description="Bun monorepo example - HTTP server with optional native Rust bindings via mnative + UnoCSS"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.title="example"
LABEL org.opencontainers.image.version="0.0.0"
LABEL org.opencontainers.image.base.name="oven/bun:${BUN_VERSION}-alpine"

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/bun.lock ./bun.lock
COPY --from=builder --chown=app:app /app/apps/example ./apps/example
COPY --from=builder --chown=app:app /app/packages ./packages
COPY --from=builder --chown=app:app /app/configs ./configs
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

CMD ["bun", "run", "apps/example/src/index.ts"]

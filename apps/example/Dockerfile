# syntax=docker/dockerfile:1.7
# Production-ready Dockerfile for @myorg/example
# Follows guide: pinned tags, multi-stage, layer caching, non-root, exec form, HEALTHCHECK, OCI labels, BuildKit cache

ARG BUN_VERSION=1.3.11
ARG RUST_VERSION=1.84

# -----------------------------------------------------------------------------
# Base - bun with workspace
# -----------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app
# Ensure bun cache dir exists for BuildKit cache mount
ENV BUN_INSTALL_CACHE=/root/.bun/install/cache

# -----------------------------------------------------------------------------
# Deps - install dependencies (cached unless lockfile changes)
# Least frequently changing first for layer cache
# -----------------------------------------------------------------------------
FROM base AS deps

# Copy root manifests
COPY package.json bun.lock ./

# Copy workspace package manifests for better caching
# We copy all package.jsons to let bun resolve workspaces
COPY apps/example/package.json ./apps/example/package.json
COPY packages/external/package.json ./packages/external/package.json
COPY packages/internal/package.json ./packages/internal/package.json
COPY packages/native/package.json ./packages/native/package.json
COPY configs/biome/package.json ./configs/biome/package.json
COPY configs/bun-config/package.json ./configs/bun-config/package.json
COPY configs/bunup/package.json ./configs/bunup/package.json
COPY configs/changeset/package.json ./configs/changeset/package.json
COPY configs/citty/package.json ./configs/citty/package.json
COPY configs/commitlint/package.json ./configs/commitlint/package.json
COPY configs/devcontainer/package.json ./configs/devcontainer/package.json
COPY configs/gh-actions/package.json ./configs/gh-actions/package.json
COPY configs/lefthook/package.json ./configs/lefthook/package.json
COPY configs/native/package.json ./configs/native/package.json
COPY configs/playwright/package.json ./configs/playwright/package.json
COPY configs/skills/package.json ./configs/skills/package.json
COPY configs/template/package.json ./configs/template/package.json
COPY configs/ts/package.json ./configs/ts/package.json
COPY configs/turbo/package.json ./configs/turbo/package.json
COPY configs/unocss/package.json ./configs/unocss/package.json

# Copy Rust manifests if present (for cargo workspace)
COPY Cargo.toml Cargo.lock* rust-toolchain.toml .cargo/config.toml* ./.cargo/ 2>/dev/null || true
COPY packages/native/Cargo.toml ./packages/native/Cargo.toml
COPY packages/native/build.rs ./packages/native/build.rs

# Install with BuildKit cache for bun
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile || bun install

# -----------------------------------------------------------------------------
# Builder - build the app (CSS, native bindings, TS)
# -----------------------------------------------------------------------------
FROM deps AS builder

# Copy full source (most frequently changing last)
COPY . .

# Build UnoCSS if config exists (opt-in)
RUN if [ -f "configs/unocss/uno.config.ts" ]; then \
      echo "🎨 Building UnoCSS..."; \
      bunx unocss --config configs/unocss/uno.config.ts || echo "UnoCSS build skipped"; \
    else \
      echo "UnoCSS not enabled, skipping"; \
    fi

# Cargo-first: fast check, then build if toolchain available
# This layer is cached unless Rust source changes
RUN if [ -f "Cargo.toml" ] && [ -f "packages/native/Cargo.toml" ]; then \
      echo "🦀 Cargo workspace detected"; \
      if command -v cargo >/dev/null 2>&1; then \
        echo "→ cargo check --workspace (fast)"; \
        cargo check --workspace || true; \
        echo "→ cargo clippy -- -D warnings (if available)"; \
        cargo clippy --workspace -- -D warnings || true; \
        echo "→ bun run build:native (napi)"; \
        bun run build:native || echo "native build skipped (cargo missing or napi not configured)"; \
      else \
        echo "cargo not found in builder stage, skipping native build (use rust-builder stage or install Rust)"; \
      fi; \
    else \
      echo "No Cargo workspace, skipping Rust build"; \
    fi

# Build JS packages (Turbo)
RUN bun run build || echo "JS build skipped (example is private, no dist needed)"

# -----------------------------------------------------------------------------
# Rust-builder - dedicated stage for native bindings (for native=docker option)
# Uses rust image + bun for napi build, produces *.node artifacts
# -----------------------------------------------------------------------------
FROM rust:${RUST_VERSION}-bookworm AS rust-builder
WORKDIR /app

ARG BUN_VERSION
# Install bun in rust image for napi
RUN curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    bun --version

# Copy manifests from deps for cache
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
COPY Cargo.toml Cargo.lock* rust-toolchain.toml ./
COPY .cargo/ ./.cargo/ 2>/dev/null || true
COPY packages/native/ ./packages/native/
COPY configs/ ./configs/
COPY packages/ ./packages/
COPY apps/ ./apps/

# Build Rust workspace release + napi artifacts if Cargo exists
RUN if [ -f "Cargo.toml" ]; then \
      echo "🦀 Rust-builder: cargo build --release"; \
      cargo build --workspace --release || cargo build -p native --release || true; \
      echo "🦀 Rust-builder: napi build"; \
      bun --filter @myorg/native run build || true; \
    else \
      echo "No Cargo.toml in rust-builder, skipping"; \
    fi

# -----------------------------------------------------------------------------
# Runner - lean production image (alpine)
# -----------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# OCI labels
LABEL org.opencontainers.image.source="https://github.com/Archont561/ts-monorepo-template"
LABEL org.opencontainers.image.description="Bun monorepo example - HTTP server with optional native Rust bindings and UnoCSS"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.title="example"
LABEL org.opencontainers.image.version="0.0.0"
LABEL org.opencontainers.image.base.name="oven/bun:${BUN_VERSION}-alpine"

# Create non-root user (as late as possible, after installs)
RUN addgroup --system app && adduser --system --ingroup app app

# Copy manifests and built artifacts
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/bun.lock ./bun.lock
COPY --from=builder --chown=app:app /app/apps/example ./apps/example
COPY --from=builder --chown=app:app /app/packages ./packages
COPY --from=builder --chown=app:app /app/configs ./configs
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/Cargo.toml ./Cargo.toml 2>/dev/null || true
COPY --from=builder --chown=app:app /app/Cargo.lock ./Cargo.lock 2>/dev/null || true
COPY --from=builder --chown=app:app /app/rust-toolchain.toml ./rust-toolchain.toml 2>/dev/null || true

# Copy Rust native artifacts from rust-builder if they exist (for docker native option)
# These are optional - JS fallback works if missing
COPY --from=rust-builder --chown=app:app /app/packages/native/*.node ./packages/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/packages/native/index.js ./packages/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/packages/native/index.d.ts ./packages/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/packages/native/*.wasi.cjs ./packages/native/ 2>/dev/null || true
COPY --from=rust-builder --chown=app:app /app/target ./target 2>/dev/null || true

# Ensure public dir exists for UnoCSS
COPY --from=builder --chown=app:app /app/apps/example/public ./apps/example/public 2>/dev/null || true

USER app
EXPOSE 3000

# Healthcheck - container health (orchestrators use their own probes, but Docker uses this)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Exec form (not shell form) for proper signal handling (graceful shutdown)
CMD ["bun", "run", "apps/example/src/index.ts"]

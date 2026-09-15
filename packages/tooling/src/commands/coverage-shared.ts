export const COVERAGE_DIR = "coverage";
export const COVERAGE_LCOV = "coverage/lcov.info";
export const COVERAGE_RUST_LCOV = "coverage/rust-lcov.info";
export const COVERAGE_HTML = "coverage/html";
/** Line-coverage floor enforced by `mcoverage check`, in percent. */
export const COVERAGE_THRESHOLD = 80;

export const COVERAGE_COMMANDS = {
  test: "bun run coverage",
  genhtml: `genhtml ${COVERAGE_LCOV} --output-directory ${COVERAGE_HTML} --title 'Coverage Report' --show-details --highlight --legend`,
  threshold: `lcov --summary ${COVERAGE_LCOV}`,
} as const;

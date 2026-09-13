export const COVERAGE_DIR = "coverage";
export const COVERAGE_LCOV = "coverage/lcov.info";
export const COVERAGE_HTML = "coverage/html";
export const COVERAGE_THRESHOLD = 80;

export const COVERAGE_COMMANDS = {
  test: "bun run coverage",
  genhtml: "genhtml coverage/lcov.info --output-directory coverage/html --title 'Coverage Report' --show-details --highlight --legend",
  threshold: "lcov --summary coverage/lcov.info",
} as const;

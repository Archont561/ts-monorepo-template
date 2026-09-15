export const BADGE_OWNER_PLACEHOLDER = "Archont561/ts-monorepo-template";
export const SCOPE_PLACEHOLDER = "@myorg";

export function checkBadges(readme: string, owner: string, scope: string): string[] {
  const issues: string[] = [];
  if (readme.includes(BADGE_OWNER_PLACEHOLDER) && !readme.includes(owner)) {
    issues.push(`README still contains placeholder owner ${BADGE_OWNER_PLACEHOLDER}`);
  }
  if (readme.includes(SCOPE_PLACEHOLDER) && !readme.includes(scope)) {
    // Allow mentions of @myorg in docs that explain replacement, but flag if in badge URL
    const badgeLines = readme
      .split("\n")
      .filter((l) => l.includes("shields.io") || l.includes("badge.svg"));
    for (const line of badgeLines) {
      if (line.includes(SCOPE_PLACEHOLDER)) {
        issues.push(`Badge line still contains ${SCOPE_PLACEHOLDER}: ${line.trim().slice(0, 80)}`);
      }
    }
  }
  return issues;
}

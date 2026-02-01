const RULES: Record<string, RegExp> = {
  UPPER_SNAKE_CASE: /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/,
  camelCase: /^[a-z][a-zA-Z0-9]*$/,
  PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
};

const EXAMPLES: Record<string, string> = {
  UPPER_SNAKE_CASE: "MAX_RETRY",
  camelCase: "fetchData",
  PascalCase: "FetchData",
};

export function checkNamingConvention(name: string, rule: string): boolean {
  const regex = RULES[rule];
  if (!regex) {
    return true;
  }
  return regex.test(name);
}

export function getExample(rule: string): string {
  return EXAMPLES[rule] ?? rule;
}


const a = 5;


export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function toSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function cleanOptionalText(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

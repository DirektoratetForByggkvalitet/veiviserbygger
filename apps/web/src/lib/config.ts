export function getFlag(flag: string): boolean {
  return window.config?.flags?.[flag] || false
}

export function getConstant(constant: string): string | undefined {
  return window.config?.constants?.[constant]
}

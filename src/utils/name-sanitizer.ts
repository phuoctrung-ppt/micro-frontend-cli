/**
 * Sanitize project name to be a valid JavaScript identifier
 * Converts hyphens and other invalid chars to camelCase
 */
export function sanitizeModuleFederationName(name: string): string {
  // Convert kebab-case or snake_case to camelCase
  return name
    .replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[0-9]/, '_$&'); // If starts with number, prefix with underscore
}

/**
 * Validate if name is a valid JavaScript identifier
 */
export function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

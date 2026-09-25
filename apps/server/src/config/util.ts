export function readEnv<T>(key: string, validator: (value: string | undefined) => T): T {
  const value = process.env[key];
  return validator(value);
}
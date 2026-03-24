import { config, type DotenvConfigOptions } from 'dotenv'

const ENV_VAR_PATTERN = /\$\{([A-Z0-9_]+)(?::-([^}]*))?\}/g

function expandValue(value: string, depth = 0): string {
  if (depth > 5 || !value.includes('${')) {
    return value
  }

  const expanded = value.replace(ENV_VAR_PATTERN, (_match, envKey: string, defaultValue?: string) => {
    const envValue = process.env[envKey]
    if (envValue !== undefined && envValue !== '') {
      return expandValue(envValue, depth + 1)
    }

    return defaultValue ?? ''
  })

  return expanded === value ? expanded : expandValue(expanded, depth + 1)
}

function expandProcessEnv() {
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value !== 'string' || !value.includes('${')) {
      continue
    }

    process.env[key] = expandValue(value)
  }
}

export function loadEnv(options?: DotenvConfigOptions) {
  config(options)
  expandProcessEnv()
}

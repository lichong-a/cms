#!/usr/bin/env tsx

import { spawnSync } from 'node:child_process'

import { loadEnv } from '../utils/load-env'

loadEnv()

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('Missing Prisma command arguments')
  process.exit(1)
}

const command = process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: process.env,
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status ?? 0)

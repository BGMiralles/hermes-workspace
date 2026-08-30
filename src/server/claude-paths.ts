import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, normalize, sep } from 'node:path'

function isProfilesChild(pathValue: string): boolean {
  const parts = normalize(pathValue).split(sep).filter(Boolean)
  return parts.length >= 2 && parts.at(-2) === 'profiles'
}

function isProfileHome(pathValue: string): boolean {
  const parts = normalize(pathValue).split(sep).filter(Boolean)
  return (
    parts.length >= 3 && parts.at(-3) === 'profiles' && parts.at(-1) === 'home'
  )
}

function hermesRootFromProfile(pathValue: string): string | null {
  if (isProfilesChild(pathValue)) {
    return dirname(dirname(pathValue))
  }
  if (isProfileHome(pathValue)) {
    return dirname(dirname(dirname(pathValue)))
  }
  return null
}

export function getHermesRoot(): string {
  const envHome = process.env.HERMES_HOME || process.env.CLAUDE_HOME
  if (envHome) {
    const profileRoot = hermesRootFromProfile(envHome)
    if (profileRoot) return profileRoot
    return envHome
  }

  const osHome = homedir()
  const profileRoot = hermesRootFromProfile(osHome)
  if (profileRoot) return profileRoot
  return join(osHome, '.hermes')
}

export function getProfilesDir(): string {
  return join(getHermesRoot(), 'profiles')
}

export function getWorkspaceHermesHome(): string {
  return getHermesRoot()
}

export function getProfileHermesHome(profileId: string): string {
  return join(getProfilesDir(), profileId)
}

export function getUserHomeForHermesRoot(): string {
  const root = getHermesRoot()
  if (root.endsWith(`${sep}.hermes`)) return dirname(root)
  return homedir()
}

export function getLocalBinDir(): string {
  return join(getUserHomeForHermesRoot(), '.local', 'bin')
}

// Legacy aliases for callers not yet renamed.
export const getClaudeRoot = getHermesRoot
export const getWorkspaceClaudeHome = getWorkspaceHermesHome
export const getProfileClaudeHome = getProfileHermesHome
export const getUserHomeForClaudeRoot = getUserHomeForHermesRoot

const HERMES_BIN_CANDIDATES = (): Array<string> => {
  const hermesRoot = getHermesRoot()
  return [
    process.env.HERMES_CLI_BIN,
    // Native macOS/Linux installs (Nous installer layout).
    join(hermesRoot, 'hermes-agent', '.venv', 'bin', 'hermes'),
    join(hermesRoot, 'hermes-agent', 'venv', 'bin', 'hermes'),
    // Windows install layout (AppData/Local/hermes). Resolved via the
    // hermes root so it works regardless of where HOME actually is.
    join(hermesRoot, 'hermes-agent', '.venv', 'Scripts', 'hermes.exe'),
    join(hermesRoot, 'hermes-agent', 'venv', 'Scripts', 'hermes.exe'),
    join(homedir(), '.local', 'bin', 'hermes'),
    'hermes',
  ].filter((value): value is string => Boolean(value))
}

/**
 * Resolve the Hermes CLI binary. Unlike the earlier per-file logic, this uses
 * path.isAbsolute() (not a '/' substring check) so it works on Windows where
 * path.join returns backslashes — previously a path-holding candidate was
 * returned unconditionally without verifying it existed, spawning ENOENT.
 * Only absolute candidates are existence-checked; bare names like `hermes`
 * are left for PATH resolution.
 */
export function resolveHermesBin(): string {
  for (const candidate of HERMES_BIN_CANDIDATES()) {
    if (isAbsolute(candidate)) {
      if (existsSync(candidate)) return candidate
      continue
    }
    return candidate
  }
  return 'hermes'
}

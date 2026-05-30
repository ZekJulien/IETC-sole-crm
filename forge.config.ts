import type { ForgeConfig } from '@electron-forge/core'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const RUNTIME_MODULES = [
  'better-sqlite3',
  '@prisma/client',
  '@prisma/adapter-better-sqlite3',
  'pdfmake',
]

function collectDeps(nodeModules: string, names: string[], found: Set<string>): void {
  for (const name of names) {
    if (found.has(name)) continue
    const pkgJsonPath = path.join(nodeModules, name, 'package.json')
    if (!existsSync(pkgJsonPath)) continue
    found.add(name)
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
    collectDeps(nodeModules, Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies }), found)
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'Sole',
    appBundleId: 'com.crm.sole',
    executableName: 'sole',
    icon: './assets/icon',
    extraResource: [
      './prisma/migrations',
      './src/renderer/dist/renderer/browser',
    ],
  },
  rebuildConfig: {},
  makers: [
    { name: '@electron-forge/maker-zip', platforms: ['darwin', 'win32'] },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Julien Paquet',
          homepage: 'https://github.com/ZekJulien/IETC-sole-crm',
          categories: ['Office', 'Finance'],
          section: 'utils',
        },
      },
    },
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      const srcNodeModules  = path.join(__dirname, 'node_modules')
      const destNodeModules = path.join(buildPath, 'node_modules')
      const found = new Set<string>()
      collectDeps(srcNodeModules, RUNTIME_MODULES, found)
      for (const name of found) {
        const from = path.join(srcNodeModules, name)
        const to   = path.join(destNodeModules, name)
        mkdirSync(path.dirname(to), { recursive: true })
        cpSync(from, to, { recursive: true })
      }
    },
  },
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        { entry: 'src/main/index.ts', config: 'vite.main.config.mts', target: 'main' },
        { entry: 'src/preload/index.ts', config: 'vite.preload.config.mts', target: 'preload' },
      ],
      renderer: [],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config

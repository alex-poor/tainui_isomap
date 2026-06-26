import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const ROOT = resolve(__dirname, '..')
export const DATA_SRC = resolve(ROOT, 'data-src')
export const PUBLIC_DATA = resolve(ROOT, 'public', 'data')

/**
 * Tainui-waka TPK rohe codes — the default selection and the set the region
 * `in_rohe` flag is computed against. 26 = Waikato (Waikato-Tainui), 27 =
 * Maniapoto, 28 = Raukawa. (build-rohe still bundles ALL iwi; these are just
 * the focus set.)
 */
export const ROHE_CODES = [26, 27, 28] as const

/** Mārae districts (from the mārae dataset) that fall within the Tainui rohe. */
export const TAINUI_MARAE_DISTRICTS = ['Waikato - Maniapoto']

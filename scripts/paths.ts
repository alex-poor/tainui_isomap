import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const ROOT = resolve(__dirname, '..')
export const DATA_SRC = resolve(ROOT, 'data-src')
export const PUBLIC_DATA = resolve(ROOT, 'public', 'data')

/**
 * Te Puni Kōkiri rohe codes that make up the Tainui waka focus area.
 * 26 = Waikato (Waikato-Tainui, primary), 27 = Maniapoto, 28 = Raukawa.
 */
export const ROHE_CODES = [26, 27, 28] as const

/** Mārae districts (from the mārae dataset) that fall within the Tainui rohe. */
export const TAINUI_MARAE_DISTRICTS = ['Waikato - Maniapoto']

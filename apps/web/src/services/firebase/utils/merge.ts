import deepExtendMerge from 'deep-extend'
import { merge as lodashMerge } from 'lodash'

export function merge(...args: any[]): any {
  return lodashMerge({}, ...args)
}

export function deepExtend(...args: any[]): any {
  return deepExtendMerge({}, ...args)
}

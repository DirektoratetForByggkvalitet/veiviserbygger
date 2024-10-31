import { ConfigContext } from '@/context/ConfigProvider'
import { useContext } from 'react'

export default function useConfig() {
  const config = useContext(ConfigContext)
  return config
}

export function useConstant(constant: string) {
  const config = useConfig()
  return config?.constants?.[constant]
}

export function useFlag(flag: string) {
  const config = useConfig()
  return config?.flags?.[flag] || false
}

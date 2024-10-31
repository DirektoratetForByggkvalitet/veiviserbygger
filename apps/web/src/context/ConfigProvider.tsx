import { getConfig } from "@/services/api";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Requests } from "types";

export const ConfigContext = createContext<Requests['/config']['GET']['response'] | null>(null)

export default function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Awaited<ReturnType<typeof getConfig>>>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    getConfig().then(setConfig).catch(setError)
  }, [])

  if (error && !config) {
    return <div>Error: {error.message}</div>
  }

  if (!config) {
    return <div>Loading...</div>
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  )
}

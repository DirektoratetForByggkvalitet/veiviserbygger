import { useEffect, useState } from "react"
import { getConstant } from "./lib/config"

export default function App() {
  return <div>
    HIP HOP
    {getConstant('HEY_HO')}
  </div>
}

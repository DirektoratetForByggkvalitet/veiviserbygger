import { useConstant } from "./hooks/config"

export default function App() {
  const heyHoConstant = useConstant('HEY_HO')

  return <div>
    HIP HOP
    {heyHoConstant}
  </div>
}

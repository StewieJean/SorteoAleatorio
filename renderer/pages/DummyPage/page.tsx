import React, { useEffect } from "react"
import { useRouter } from "next/router"

function Next() {
  const router = useRouter()

  useEffect(() => {
    router.push("/RuletaSort/page")
  })

  return (
    <div>
      <div className="absolute top-1/2 left-1/2">
        <span>⚡ SorteosApp ⚡</span>
      </div>
    </div>
  )
}

export default Next

import React, { useEffect, useState } from "react"
import { Button, Input, Text, Table } from "@rewind-ui/core"
import Link from "next/link"

const ShowParticipants = () => {
  const [titulo, setTitulo] = useState("")
  const [participantes, setParticipantes] = useState([])

  useEffect(() => {
    const formData = JSON.parse(sessionStorage.getItem("formularioSorteo"))
    if (formData) {
      setTitulo(formData.titulo || "")

      // Aseguramos que formData.participantes es un array
      if (Array.isArray(formData.participantes)) {
        setParticipantes(formData.participantes)
      } else if (typeof formData.participantes === "string") {
        setParticipantes(formData.participantes.split(","))
      } else {
        setParticipantes([])
      }
    }
  }, [])

  const shuffleParticipants = () => {
    const shuffled = [...participantes]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setParticipantes(shuffled)
  }

  return (
    <div className="flex flex-col h-screen w-1/3">
      <div className="p-4 border-b ">
        <label className="block mb-4">
          <Text className="text-lg">Título:</Text>
          <Input
            variant="pill"
            className="mt-2 w-full"
            type="text"
            value={titulo}
            readOnly
          />
        </label>
        <div className="flex flex-row justify-between items-center">
          <Text className="text-lg">
            Total de participantes:{" "}
            <span className="text-purple-600">{participantes.length}</span>
          </Text>
          <Button
            color="blue"
            tone="outline"
            shadow="sm"
            shadowColor="dark"
            onClick={shuffleParticipants}
            className=""
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-arrows-shuffle-2"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 4l3 3l-3 3" />
              <path d="M18 20l3 -3l-3 -3" />
              <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5" />
              <path d="M3 17h3a5 5 0 0 0 5 -5a5 5 0 0 1 5 -5h5" />
            </svg>
          </Button>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-auto">
        <label className="block mb-4">
          <Table className="mt-2 w-full border">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Nro.</th>
                <th className="border-b p-2 text-left">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {participantes.map((participante, index) => (
                <tr key={index}>
                  <td className="border-b p-2">{index + 1}</td>
                  <td className="border-b p-2">{participante}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </label>
      </div>
      <div className="p-4 flex justify-end space-x-2 border-t ">
        <Link href="/SortearParticipants/page" legacyBehavior passHref>
          <Button color="purple" shadow="md" shadowColor="dark">
            Siguiente
          </Button>
        </Link>
        <Link href="/home" legacyBehavior passHref>
          <Button tone="transparent" shadow="md">
            Atrás
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default ShowParticipants

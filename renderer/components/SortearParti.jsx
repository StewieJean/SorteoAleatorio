/*
import React, { useEffect, useState } from "react"
import { Button, Text, Table, Alert } from "@rewind-ui/core"
import Link from "next/link"
import dynamic from "next/dynamic"
import Confetti from "react-confetti"
import 'animate.css';

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
)

// Componente de ErrorBoundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado en ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className=" dark:bg-gray-900">
          <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
            <div className="mx-auto max-w-screen-sm text-center">
              <h1 className="dark:text-primary-500 mb-4 text-7xl font-extrabold tracking-tight text-violet-600 lg:text-9xl">500</h1>
              <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">Internal Server Error.</p>
              <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">Sorry something went wrong.</p>
              <button className="mb-4 text-lg font-light text-gray-500 bg-violet-100 rounded-lg p-2" onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        </section>
      )
    }

    return this.props.children
  }
}

const ShowParticipants = () => {
  const [loading, setLoading] = useState(true)
  const [titulo, setTitulo] = useState("")
  const [participants, setParticipants] = useState([])
  const [filteredParticipants, setFilteredParticipants] = useState([])
  const [prizeIndex, setPrizeIndex] = useState(0)
  const [winner, setWinner] = useState(null)
  const [mustSpin, setMustSpin] = useState(false)
  const [spinningButtonDisabled, setSpinningButtonDisabled] = useState(false)
  const [alertVisible, setAlertVisible] = useState(true)
  const [originalParticipants, setOriginalParticipants] = useState([]) // Nuevo estado

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedExclusionData = localStorage.getItem(
          "FormularioExcludedSorteo"
        )
        const exclusionList = storedExclusionData
          ? JSON.parse(storedExclusionData).excludedParticipants
          : []

        const formData = JSON.parse(sessionStorage.getItem("formularioSorteo"))
        if (formData) {
          setTitulo(formData.titulo || "")

          let allParticipants = []
          if (Array.isArray(formData.participantes)) {
            allParticipants = formData.participantes
          } else if (typeof formData.participantes === "string") {
            allParticipants = formData.participantes.split(",")
          }

          setParticipants(allParticipants)
          setOriginalParticipants(allParticipants) // Guardar el orden original
          const filtered = allParticipants.filter(
            (participant) => !exclusionList.includes(participant)
          )
          setFilteredParticipants(filtered)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const shuffleParticipants = () => {
    const shuffled = [...participants]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setParticipants(shuffled)
    const newPrizeIndex = shuffled.indexOf(participants[prizeIndex])
    setPrizeIndex(newPrizeIndex)
  }

  const handleSpinClick = () => {
    if (filteredParticipants.length > 0) {
      const randomPrizeIndex = Math.floor(
        Math.random() * filteredParticipants.length
      )
      const winnerParticipant = filteredParticipants[randomPrizeIndex]
      const winnerIndex = participants.indexOf(winnerParticipant)
      setPrizeIndex(winnerIndex)
      setMustSpin(true)
      setSpinningButtonDisabled(true)
    } else {
      console.warn("No participants to spin")
    }
  }

  const handleStopSpinning = () => {
    setWinner(participants[prizeIndex])
    setMustSpin(false)
    setSpinningButtonDisabled(false)
    setAlertVisible(true)
  }

  const handleCloseAlert = () => {
    setAlertVisible(false)
  }

  const handleRestart = () => {
    setWinner(null)
    setParticipants(originalParticipants)
  }

  const data = participants.map((participant, index) => ({
    option: (index + 1).toString(),
  }))

  if (loading) {
    return <div>Cargando...</div>
  }

  let fontSize
  if (participants.length < 10) {
    fontSize = 10
  } else if (data.length < 20) {
    fontSize = 12
  } else {
    fontSize = 14
  }

  return (
    <>
      <div className="absolute top-0 mt-8">
        <Text weight="bold" size="6xl"  >{titulo}</Text>
      </div>
      <div className="flex items-center">
        <div className="p-4 min-w-80">
          <div className="flex items-center justify-between mb-2 border-b pb-2">
            <Text className="text-lg">
              Total de participantes:{" "}
              <span className="text-purple-600">{participants.length}</span>
            </Text>
            <Button
              color="blue"
              tone="outline"
              shadow="sm"
              shadowColor="dark"
              onClick={shuffleParticipants}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-arrows-shuffle-2"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18 4l3 3l-3 3" />
                <path d="M18 20l3 -3l-3 -3" />
                <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5" />
                <path d="M3 17h3a5 5 0 0 0 5 -5a5 5 0 0 1 5 -5h5" />
              </svg>
            </Button>
          </div>
          <div className="overflow-auto">
            <Table className="w-full border max-h-[600px]">
              <Table.Thead>
                <tr>
                  <th className="border-b p-2 text-left">Nro.</th>
                  <th className="border-b p-2 text-left">Nombre</th>
                </tr>
              </Table.Thead>
              <tbody>
                {participants.map((participante, index) => (
                  <tr
                    key={index}
                    className={
                      winner === participante
                        ? "bg-yellow-100 border-yellow-500 border-2"
                        : ""
                    }
                  >
                    <td className="border-b p-2">{index + 1}</td>
                    <td className="border-b p-2">{participante}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className=" sticky bottom-0 left-0 p-4 flex justify-end space-x-2 border-t w-full border-t-1 mt-2">
            <Button
              color="purple"
              shadow="md"
              shadowColor="dark"
              onClick={handleSpinClick}
              disabled={spinningButtonDisabled}
            >
              Girar la ruleta
            </Button>
            <Button
              onClick={handleRestart}
              tone="light"
              color="purple"
              shadow="md"
              shadowColor="dark"
            >
              Reiniciar
            </Button>
            <Link href="/home" passHref>
              <Button tone="transparent" color="purple" shadow="md">
                Salir
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-1/3 p-4">
          <div className="ml-4">
            <div align="center" className="roulette-container z-0">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeIndex}
                data={data}
                backgroundColors={["#4c1d95", "#8b5cf6", "#2e1065", "#8b5cf6"]}
                textColors={["#ffffff"]}
                onStopSpinning={handleStopSpinning}
                innerRadius={10}
                innerBorderColor="#ede9fe"
                outerBorderColor="#ede9fe"
                radiusLineColor="#ede9fe"
                innerBorderWidth={2}
                outerBorderWidth={2}
                radiusLineWidth={1}
                textDistance={93}
                fontSize={9}
                className="mx-auto w-full"
              />
            </div>
          </div>
          {winner !== null && alertVisible && (
            <>
              <div className="absolute inset-x-1 top-0">
                <Confetti
                  width={window.innerWidth-30}
                  height={window.innerHeight-20}
                />
              </div>
              <div className="animate__animated animate__backInUp absolute inset-0 flex items-center justify-center">
                <div className="w-1/2">
                  <Alert
                    tone="light"
                    color="yellow"
                    size="lg"
                    shadow="md"
                    className="border"
                  >
                    <div className="grid gap-y-3 justify-items-center text-yellow-400 w-full">
                      <svg
                        width="72"
                        height="72"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-trophy"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M8 21l8 0" />
                        <path d="M12 17l0 4" />
                        <path d="M7 4l10 0" />
                        <path d="M17 4v8a5 5 0 0 1 -10 0v-8" />
                        <path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                        <path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                      </svg>
                      <Text size="2xl" className="text-center text-yellow-600">
                        El ganador es:
                      </Text>
                      <Text
                        variant="h2"
                        weight="medium"
                        className="tada-animation animate__animated animate__tada  text-yellow-600"
                      >
                        {winner}
                      </Text>
                      <div className="border border-b-2 border-dashed border-yellow-200 w-full" />
                      <Text size="md" className="text-center text-yellow-600">
                        Muchas gracias a todos por participar.
                      </Text>
                      <div className="flex gap-x-2 mt-4">
                        <Button
                          tone="outline"
                          color="yellow"
                          onClick={handleCloseAlert}
                        >
                          Atrás
                        </Button>
                        <Link href="/home" legacyBehavior>
                          <Button variant="warning">Nuevo sorteo</Button>
                        </Link>
                      </div>
                    </div>
                  </Alert>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const App = () => (
  <ErrorBoundary>
    <ShowParticipants />
  </ErrorBoundary>
)

export default App

*/

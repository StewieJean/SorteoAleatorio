import React, { useEffect, useState } from "react"
import { Button, Text, Table, Alert, Select } from "@rewind-ui/core"
import Link from "next/link"
import dynamic from "next/dynamic"
import Confetti from "react-confetti"
import "animate.css"

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
  const [mustSpin, setMustSpin] = useState(false)
  const [spinningButtonDisabled, setSpinningButtonDisabled] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [numberOfWinners, setNumberOfWinners] = useState(1) // Número de ganadores seleccionados
  const [winners, setWinners] = useState([]) // Lista de ganadores
  const [predefinedWinners, setPredefinedWinners] = useState([])

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
          const filtered = allParticipants.filter(
            (participant) => !exclusionList.includes(participant)
          )
          setFilteredParticipants(filtered)
        }

        // Obtener predefinedWinners del localStorage
        const storedWinners = localStorage.getItem(
          "FormularioPredefinedWinners"
        )
        if (storedWinners) {
          const { predefinedWinners } = JSON.parse(storedWinners)
          setPredefinedWinners(predefinedWinners || [])
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
      let nextWinner

      if (predefinedWinners.length > winners.length) {
        // Filtrar predefinedWinners para incluir solo aquellos que estén en la lista de participantes
        const validPredefinedWinners = predefinedWinners.filter((winner) =>
          participants.includes(winner)
        )

        if (validPredefinedWinners.length > winners.length) {
          // Obtener el próximo ganador predefinido si quedan disponibles
          nextWinner = validPredefinedWinners[winners.length]
        } else {
          // Si no hay más ganadores predefinidos válidos, seleccionar aleatoriamente
          nextWinner =
            filteredParticipants[
              Math.floor(Math.random() * filteredParticipants.length)
            ]
        }
      } else {
        // Si no hay más ganadores predefinidos, seleccionar aleatoriamente
        nextWinner =
          filteredParticipants[
            Math.floor(Math.random() * filteredParticipants.length)
          ]
      }

      const winnerIndex = participants.indexOf(nextWinner)
      setPrizeIndex(winnerIndex) // Establecer el índice del ganador en la ruleta
      setMustSpin(true) // Activar el giro de la ruleta
      setSpinningButtonDisabled(true) // Deshabilitar el botón de girar
    } else {
      console.warn("No hay participantes para girar")
    }
  }

  const handleStopSpinning = () => {
    const winnerParticipant = participants[prizeIndex]
    setWinners((prevWinners) => [...prevWinners, winnerParticipant])
    setFilteredParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p !== winnerParticipant)
    )
    setMustSpin(false)
    setSpinningButtonDisabled(false)
    if (winners.length + 1 >= numberOfWinners) {
      setAlertVisible(true)
    }
  }

  const handleCloseAlert = () => {
    setAlertVisible(false)
  }

  const handleRestart = () => {
    window.location.reload()
  }

  const handleNumberOfWinnersChange = (event) => {
    setNumberOfWinners(parseInt(event.target.value))
  }

  const data = participants.map((participant, index) => ({
    option: (index + 1).toString(),
  }))

  if (loading) {
    return <div>Cargando...</div>
  }

  let fontSize
  let distanceRadius
  let perpendicularText

  if (participants.length <= 15) {
    fontSize = 50
    perpendicularText = true
    distanceRadius = 80
  } else if (data.length <= 30) {
    fontSize = 28
    perpendicularText = true
    distanceRadius = 86
  } else if (data.length <= 50) {
    fontSize = 16
    perpendicularText = true
    distanceRadius = 89
  } else {
    fontSize = 10
    perpendicularText = false
    distanceRadius = 92
  }

  return (
    <>
      <div className="absolute top-0 mt-4">
        <Text weight="bold" size="6xl">
          {titulo}
        </Text>
      </div>
      <div className="flex items-center">
        <div className="p-4 min-w-80">
          <div className="flex items-center justify-between mb-2 border-b pb-2 mt-4">
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
              disabled={
                spinningButtonDisabled || winners.length >= numberOfWinners
              }
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
          <div className="flex items-center mb-2">
            <label htmlFor="numberOfWinners" className="mr-2">
              Número de ganadores:
            </label>
            <div className="relative w-full">
              <select
                leftIcon=""
                color="purple"
                radius="full"
                id="numberOfWinners"
                value={numberOfWinners}
                onChange={handleNumberOfWinnersChange}
                className="appearance-none w-full transition-colors duration-100 ease-in-out outline-none data-[has-left-element=true]:rounded-l-none data-[has-right-element=true]:rounded-r-none text-base h-10 text-gray-800 border focus:bg-gray-50 placeholder:text-gray-400 rounded-full shadow-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-100 bg-white border-gray-300 focus-visible:border-purple-500 px-3 pr-10"
              >
                {[...Array(participants.length).keys()].map((i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="size-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="overflow-auto">
            <Table className="w-full border max-h-[600px]">
              <Table.Thead>
                <tr>
                  <th className=" p-2 text-left">Nro.</th>
                  <th className=" p-2 text-left">Nombre</th>
                  <th></th>
                </tr>
              </Table.Thead>
              <tbody>
                {participants.map((participante, index) => (
                  <tr
                    key={index}
                    className={
                      winners.includes(participante)
                        ? "bg-yellow-100 border-yellow-500 border-2"
                        : ""
                    }
                  >
                    <td className="border-b p-2">{index + 1}</td>
                    <td className="border-b p-2">{participante}</td>
                    <td className="border-b p-2">
                      {winners.indexOf(participante) !== -1 &&
                        `${winners.indexOf(participante) + 1}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="sticky bottom-0 left-0 p-4 flex justify-end space-x-2 border-t w-full border-t-1 mt-2">
            <Button
              color="purple"
              shadow="md"
              shadowColor="dark"
              onClick={handleSpinClick}
              disabled={
                spinningButtonDisabled || winners.length >= numberOfWinners
              }
              className={
                winners.length < numberOfWinners && !spinningButtonDisabled
                  ? "animate-pulse"
                  : ""
              }
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
                backgroundColors={["#7ceaeb", "#faf174", "#7484fb", "#fb7b7b"]}
                onStopSpinning={handleStopSpinning}
                innerRadius={5}
                innerBorderColor="#e34c2d"
                outerBorderColor="#94a3b8"
                radiusLineColor="#ede9fe"
                innerBorderWidth={30}
                outerBorderWidth={4}
                perpendicularText={perpendicularText}
                radiusLineWidth={1}
                textDistance={distanceRadius}
                fontSize={fontSize}

              />
            </div>
          </div>
          {alertVisible && (
            <>
              <div className="absolute top-0 left-0">
                <Confetti
                  width={window.innerWidth - 30}
                  height={window.innerHeight - 20}
                />
              </div>
              <div className="animate__animated animate__backInUp absolute inset-0 flex items-center justify-center">
                <div className="w-1/2">
                  <Alert
                    tone="light"
                    color="yellow"
                    size="lg"
                    shadow="md"
                    className="tada-animation animate__animated animate__tada border "
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
                        Los ganadores son:
                      </Text>
                      {winners.map((winner, index) => (
                        <Text
                          key={index}
                          variant="h2"
                          weight="medium"
                          className=" text-yellow-600"
                        >
                          {`0${index + 1}: ${winner}`}
                        </Text>
                      ))}
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
                          Cerrar
                        </Button>
                        <Link href="/home" legacyBehavior>
                          <Button variant="warning">
                            Salir (Nuevo sorteo)
                          </Button>
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

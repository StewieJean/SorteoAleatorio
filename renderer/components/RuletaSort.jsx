import React, { useEffect, useState } from "react"
import { Button, Text, Table, Alert } from "@rewind-ui/core"
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
        <div>
          <h1>¡Algo salió mal!</h1>
          <p>Por favor, actualiza la página e intenta nuevamente.</p>
          <button onClick={() => window.location.reload()}>
            Actualizar Página
          </button>
        </div>
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
        // Obtener el próximo ganador predefinido si quedan disponibles
        nextWinner = predefinedWinners[winners.length]
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

  return (
    <>
      <div className="absolute top-0 mt-8">
        <Text weight="bold" size="6xl">
          {titulo}
        </Text>
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
              Barajar
            </Button>
          </div>
          <div className="flex items-center mb-2">
            <label htmlFor="numberOfWinners" className="mr-2">
              Número de ganadores:
            </label>
            <select
              id="numberOfWinners"
              value={numberOfWinners}
              onChange={handleNumberOfWinnersChange}
              className="border p-1"
            >
              {[...Array(participants.length).keys()].map((i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
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
                    className="tada-animation animate__animated animate__tada border"
                  >
                    <div className="grid gap-y-3 justify-items-center text-yellow-400 w-full">
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

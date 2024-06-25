import React, { useEffect, useState } from "react";
import { Button, Text, Table } from "@rewind-ui/core";
import Link from "next/link";
import dynamic from "next/dynamic";
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

// Componente de ErrorBoundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente render muestre la interfaz de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes registrar el error aquí
    console.error("Error capturado en ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes personalizar el mensaje de error aquí
      return (
        <div>
          <h1>¡Algo salió mal!</h1>
          <p>Por favor, actualiza la página e intenta nuevamente.</p>
          <button onClick={() => window.location.reload()}>
            Actualizar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ShowParticipants = () => {
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
  const [titulo, setTitulo] = useState("");
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [winner, setWinner] = useState(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [spinningButtonDisabled, setSpinningButtonDisabled] = useState(false); // Estado para deshabilitar el botón de girar

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedExclusionData = localStorage.getItem(
          "FormularioExcludedSorteo"
        );
        const exclusionList = storedExclusionData
          ? JSON.parse(storedExclusionData).excludedParticipants
          : [];

        const formData = JSON.parse(sessionStorage.getItem("formularioSorteo"));
        if (formData) {
          setTitulo(formData.titulo || "");

          let allParticipants = [];
          if (Array.isArray(formData.participantes)) {
            allParticipants = formData.participantes;
          } else if (typeof formData.participantes === "string") {
            allParticipants = formData.participantes.split(",");
          }

          setParticipants(allParticipants);
          // Filtra los participantes para excluir los de la lista
          const filtered = allParticipants.filter(
            (participant) => !exclusionList.includes(participant)
          );
          setFilteredParticipants(filtered);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // Manejo del error aquí, podrías mostrar un mensaje de error
      } finally {
        setLoading(false); // Una vez completado el proceso, se oculta el indicador de carga
      }
    };

    fetchData();
  }, []);

  const shuffleParticipants = () => {
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setParticipants(shuffled);
    const newPrizeIndex = shuffled.indexOf(participants[prizeIndex]);
    setPrizeIndex(newPrizeIndex);
  };

  const handleSpinClick = () => {
    if (filteredParticipants.length > 0) {
      const randomPrizeIndex = Math.floor(
        Math.random() * filteredParticipants.length
      );
      const winnerParticipant = filteredParticipants[randomPrizeIndex];
      const winnerIndex = participants.indexOf(winnerParticipant);
      setPrizeIndex(winnerIndex);
      setMustSpin(true);
      setSpinningButtonDisabled(true); // Deshabilitar el botón al iniciar el giro
    } else {
      console.warn("No participants to spin");
    }
  };

  const handleStopSpinning = () => {
    setWinner(participants[prizeIndex]);
    setMustSpin(false);
    setSpinningButtonDisabled(false); // Habilitar el botón al detener el giro
  };

  const data = participants.map((participant, index) => ({
    option: (index + 1).toString(),
  }));

  if (loading) {
    return <div>Cargando...</div>; // Puedes personalizar este mensaje de carga
  }

  let fontSize;
  if (participants.length < 10) {
    fontSize = 10;
  } else if (data.length < 20) {
    fontSize = 12;
  } else {
    fontSize = 14;
  }

  return (
    <div className="flex items-center ">
      {/* Columna izquierda (Tabla de participantes) */}
      <div className=" p-4 ">
        <div className="mb-2 border-b">
          <Text className="text-xl font-semibold ">{titulo}</Text>
        </div>
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
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Nro.</th>
                <th className="border-b p-2 text-left">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participante, index) => (
                <tr key={index}>
                  <td className="border-b p-2">{index + 1}</td>
                  <td className="border-b p-2">{participante}</td>
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
            disabled={spinningButtonDisabled} // Aquí se usa el estado para deshabilitar el botón
          >
            Girar la ruleta
          </Button>

          <Link href="/home" passHref>
            <Button tone="transparent" shadow="md">
              Atrás
            </Button>
          </Link>
        </div>
      </div>
      {/* Columna derecha (Ruleta) */}
      <div className="w-1/3 p-4">
        <div className="ml-4">
          <div align="center" className="roulette-container">
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
              perpendicularText
              textDistance={93}
              fontSize={9}
              className="mx-auto w-full"
            />
          </div>
        </div>
        {winner !== null && (
          <div className="relative b-0 l-0 r-0">
            <p className="text-xl font-bold text-center">
              ¡Felicidades! El ganador es: {winner}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <ShowParticipants />
  </ErrorBoundary>
);

export default App;

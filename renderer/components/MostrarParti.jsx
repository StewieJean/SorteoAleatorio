import React, { useEffect, useState } from "react";
import { Button, Input, Text, Table } from "@rewind-ui/core";
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
          <button onClick={() => window.location.reload()}>Actualizar Página</button>
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
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [winner, setWinner] = useState(null);
  const [mustSpin, setMustSpin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = JSON.parse(sessionStorage.getItem("formularioSorteo"));
        if (formData) {
          setTitulo(formData.titulo || "");

          if (Array.isArray(formData.participantes)) {
            setParticipants(formData.participantes);
          } else if (typeof formData.participantes === "string") {
            setParticipants(formData.participantes.split(","));
          } else {
            setParticipants([]);
          }
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

  const cleanData = () => {
    setParticipants([]);
    setPrizeIndex(0);
    setTitulo("");
    setWinner(null);
    setMustSpin(false);
  };

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
    if (participants.length > 0) {
      const randomPrizeIndex = Math.floor(Math.random() * participants.length);
      setPrizeIndex(randomPrizeIndex);
      setMustSpin(true);
    } else {
      console.warn("No participants to spin");
    }
  };

  const handleStopSpinning = () => {
    setWinner(participants[prizeIndex]);
    setMustSpin(false);
  };

  const data = participants.map((participant, index) => ({
    option: (index + 1).toString(),
  }));



  if (loading) {
    return <div>Cargando...</div>; // Puedes personalizar este mensaje de carga
  }

  return (
    <div className="flex items-center ">
      {/* Columna izquierda (Tabla de participantes) */}
      <div className=" p-4 border-r">
        <div className="mb-4">
          <Text className="text-lg">Título:</Text>
          <Input
            variant="pill"
            className="mt-2 w-full"
            type="text"
            value={titulo}
            readOnly
          />
        </div>
        <div className="flex items-center justify-between mb-4">
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
          <Table className="w-full border max-h-screen">
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
        <div className="sticky bottom-0 left-0 p-4 flex justify-end space-x-2 border-t w-full bg-white">
          <Button
            color="purple"
            shadow="md"
            shadowColor="dark"
            onClick={handleSpinClick}
          >
            Girar la ruleta
          </Button>

          <Link href="/home" passHref>
            <Button tone="transparent" shadow="md">
              Atrás
            </Button>
          </Link>
          <Button
            color="purple"
            shadow="md"
            shadowColor="dark"
            onClick={cleanData}
          >
            Clean
          </Button>
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
              backgroundColors={["#4c1d95", "#8b5cf6"]}
              textColors={["#ffffff"]}
              onStopSpinning={handleStopSpinning}
              innerRadius={10}
              innerBorderWidth={2}
              outerBorderWidth={2}
              radiusLineWidth={0}
              perpendicularText
              textDistance={90}
              fontSize={10}
              className="mx-auto w-full"
            />
          </div>
          {winner !== null && (
            <div className="mt-4">
              <p className="text-xl font-bold text-center">
                ¡Felicidades! El ganador es: {winner}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default () => (
  <ErrorBoundary>
    <ShowParticipants />
  </ErrorBoundary>
);

import React, { useState, useEffect } from "react";
import { useTransition, animated } from "react-spring";
import { Button } from "@rewind-ui/core";
import Link from "next/link";

// Función de barajado (Fisher-Yates)
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

// Generar un color aleatorio
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};


const Raffle = () => {
  const [titulo, setTitulo] = useState("");
  const [initialParticipants, setInitialParticipants] = useState([]);
  const [remainingParticipants, setRemainingParticipants] = useState([]);
  const [winner, setWinner] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("formularioSorteo"));
    if (storedData) {
      const participantsWithIdAndColor = storedData.participantes.map((name, index) => ({
        id: index,
        name: name,
        color: getRandomColor()
      }));
      setTitulo(storedData.titulo);
      setInitialParticipants(participantsWithIdAndColor);
      setRemainingParticipants(participantsWithIdAndColor);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (running && remainingParticipants.length > 1) {
      timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * remainingParticipants.length);
        setRemainingParticipants((prevParticipants) => {
          const newParticipants = [...prevParticipants];
          newParticipants.splice(randomIndex, 1);
          return newParticipants;
        });
      }, 1000);
    } else if (remainingParticipants.length === 1) {
      setWinner(remainingParticipants[0]);
      setRunning(false);
    }

    return () => clearInterval(timer);
  }, [running, remainingParticipants]);

  const shuffleParticipants = () => {
    const shuffledParticipants = shuffleArray(remainingParticipants);
    setRemainingParticipants(shuffledParticipants);
    setInitialParticipants(shuffledParticipants); // Actualizar initialParticipants después del shuffle
  };

  const startRaffle = () => {
    if (!running && remainingParticipants.length > 1) {
      // Utilizar remainingParticipants en lugar de initialParticipants
      setRemainingParticipants(remainingParticipants);
      setWinner(null);
      setRunning(true);
    }
  };

  const resetRaffle = () => {
    setRemainingParticipants(initialParticipants);
    setWinner(null);
    setRunning(false);
  };

  const transitions = useTransition(remainingParticipants, {
    from: { opacity: 0, transform: "translate3d(0,40px,0)" },
    enter: { opacity: 1, transform: "translate3d(0,0px,0)" },
    leave: { opacity: 0, transform: "translate3d(0,40px,0)" },
  });

  const winnerTransition = useTransition(winner, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  let cantParticipants = (initialParticipants.length)
  console.log(cantParticipants);



  return (
    <div className="flex min-w-full min-h-screen flex-col">
      <div className="z-10 p-4 bg-violet-100 border-gray-300 text-center sticky top-0">
        <h2 className="text-6xl font-bold mb-2">{titulo}</h2>
        <h6 className="pb-2 text-3xl">Participantes: {cantParticipants}</h6>
        <div className="flex justify-center">
          <Button className="mr-2" onClick={shuffleParticipants} disabled={running}>
            Shuffle
          </Button>
          <Button className="mr-2" onClick={startRaffle} disabled={running}>
            Start
          </Button>
          <Button className="mr-2" onClick={resetRaffle} disabled={running}>
            Reset
          </Button>
          <Link href='/ShowParticipants/page'>
          <Button className="mr-2">
            Ruleta
          </Button>
          </Link>
          <Link href="/home" legacyBehavior>
            <Button className="">Salir</Button>
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="flex flex-wrap justify-center">
          {transitions((style, item) => (
            <animated.div
              key={item.id}
              style={{ ...style, borderColor: item.color }}
              className="bg-violet-100 font-semibold rounded-full border-2 px-2 text-center mb-4 mx-2 inline-block"
            >
              {item.name}
            </animated.div>
          ))}
          {winnerTransition(
            (style, item) =>
              item && (
                <div className="w-full text-center mt-4">
                  <animated.h3 style={{ ...style }} className="text-xl font-bold">
                    Ganador: {item.name}
                  </animated.h3>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default Raffle;
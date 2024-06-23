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

const Raffle = () => {
  const [titulo, setTitulo] = useState("");
  const [initialParticipants, setInitialParticipants] = useState([]);
  const [remainingParticipants, setRemainingParticipants] = useState([]);
  const [winner, setWinner] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("formularioSorteo"));
    if (storedData) {
      setTitulo(storedData.titulo);
      setInitialParticipants(storedData.participantes);
      setRemainingParticipants(storedData.participantes);
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

  return (
    <div className="min-h-screen min-w-full flex flex-col">
      <div className="sticky top-0 bg-violet-100 border-gray-300 p-4 z-10 text-center">
        <h2 className="text-6xl font-bold mb-4">{titulo}</h2>
        <div className="flex justify-center">
          <Button
            className="mr-2"
            onClick={shuffleParticipants}
            disabled={running}
          >
            Shuffle
          </Button>
          <Button
            className="mr-2"
            onClick={startRaffle}
            disabled={running}
          >
            Start
          </Button>
          <Button
            className="mr-2"
            onClick={resetRaffle}
            disabled={running}
          >
            Reset
          </Button>
          <Link href='/home' legacyBehavior>
          <Button
            className=""
          >
            Salir
          </Button>
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="flex flex-wrap justify-center">
          {transitions((style, item) => (
            <animated.div
              key={item}
              style={{ ...style }}
              className="bg-violet-100 font-semibold rounded-full ring-violet-500 ring px-2 text-center mb-4 mx-2 inline-block"
            >
              {item}
            </animated.div>
          ))}
          {winnerTransition(
            (style, item) =>
              item && (
                <div className="w-full text-center mt-4">
                  <animated.h3 style={{ ...style }} className="text-xl font-bold">
                    Ganador: {item}
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

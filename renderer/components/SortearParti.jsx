//IT IS NOT IN USE
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Table } from "@rewind-ui/core";
import Link from "next/link";
const Wheel = dynamic(() => import("react-custom-roulette").then((mod) => mod.Wheel), { ssr: false });

const Roulette = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [prizeIndex, setPrizeIndex] = useState(0); 
  const [winner, setWinner] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [excludedParticipants, setExcludedParticipants] = useState([]); // New state for excluded participants

  useEffect(() => {
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

      if (Array.isArray(formData.excludedParticipants)) {
        setExcludedParticipants(formData.excludedParticipants);
      } else if (typeof formData.excludedParticipants === "string") {
        setExcludedParticipants(formData.excludedParticipants.split(","));
      } else {
        setExcludedParticipants([]);
      }
    }
  }, []);

  const handleSpinClick = () => {
    const eligibleParticipants = participants.filter(
      participant => !excludedParticipants.includes(participant)
    );

    if (eligibleParticipants.length > 0) {
      const randomPrizeIndex = Math.floor(Math.random() * eligibleParticipants.length);
      const selectedParticipant = eligibleParticipants[randomPrizeIndex];
      const newPrizeIndex = participants.indexOf(selectedParticipant);
      setPrizeIndex(newPrizeIndex);
      setMustSpin(true);
    } else {
      console.warn("No eligible participants to spin");
    }
  };

  const handleStopSpinning = () => {
    setWinner(participants[prizeIndex]);
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

  const data = participants.map((participant, index) => ({
    option: (index + 1).toString(),
  }));

  return (
    <div className="">
      <div>
        <p>{titulo}</p>
        <p>Participantes: {participants.length}</p>
      </div>
      <div className="flex">
        <Button
          color="blue"
          tone="outline"
          shadow="sm"
          shadowColor="dark"
          onClick={shuffleParticipants}
          className="mr-4"
        >
          Mezclar participantes
        </Button>
        <Table className="mt-2 h-96 border">
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
        <div className="ml-4 ">
          <button
            onClick={handleSpinClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Iniciar
          </button>
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
              outerBorderColor="#a1a1aa"
              innerBorderColor="#a1a1aa"
              radiusLineWidth={1}
              radiusLineColor="#a1a1aa"
              perpendicularText
              textDistance={90}
              fontSize={10}
              className="mx-auto w-full"
            />
          </div>

        </div>
        <Link href='/home' >Salir</Link>
      </div>
      {winner !== null && (
            <div className="mt-4">
              <p className="text-xl font-bold text-center">
                El ganador es: {winner}
              </p>
            </div>
          )}
    </div>
  );
};

export default Roulette;

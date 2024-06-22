import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Table } from "@rewind-ui/core";
import Link from "next/link";
const Wheel = dynamic(() => import("react-custom-roulette").then((mod) => mod.Wheel), { ssr: false });

const Roulette = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [prizeIndex, setPrizeIndex] = useState(0); // Changed to prizeIndex instead of prizeNumber
  const [winner, setWinner] = useState(null);
  const [titulo, setTitulo] = useState("");

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
    }
  }, []);

  const handleSpinClick = () => {
    if (participants.length > 0) {
      const randomPrizeIndex = Math.floor(Math.random() * participants.length);
      console.log("Random Prize Index:", randomPrizeIndex);
      setPrizeIndex(randomPrizeIndex);
      setMustSpin(true);
    } else {
      console.warn("No participants to spin");
    }
  };

  const handleStopSpinning = () => {
    setWinner(participants[prizeIndex]); // Set winner based on current shuffled participants array
    setMustSpin(false);
  };

  const shuffleParticipants = () => {
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setParticipants(shuffled);
    // Find the new index of the original prize winner in the shuffled array
    const newPrizeIndex = shuffled.indexOf(participants[prizeIndex]);
    setPrizeIndex(newPrizeIndex); // Update prizeIndex to match the new shuffled position
  };

  const data = participants.map((participant, index) => ({
    option: (index + 1).toString(),
  }));

  return (
    <div className="">
      <div>
        <p>{titulo}</p>
        <p>Number of participants: {participants.length}</p>
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
          Shuffle Participants
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
            Start Spinning
          </button>
          <div align="center" className="roulette-container">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeIndex} // Use prizeIndex instead of prizeNumber
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
                Congratulations! The winner is: {winner}
              </p>
            </div>
          )}
        </div>
        <Link href='/home' >asdasd</Link>
      </div>
    </div>
  );
};

export default Roulette;

import React from "react";
import NumberGenerator from "../../components/RaffleSort"

const ShowParticipants: React.FC = () => {

  return (
    <main className="relative min-h-screen flex justify-center items-center bg-gray-100">
      <NumberGenerator />
    </main>
  );
};

export default ShowParticipants;

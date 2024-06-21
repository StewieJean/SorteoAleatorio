import React from "react";
import SortParticipants from "../../components/SortearParti"

const ShowParticipants: React.FC = () => {

  return (
    <main className="relative min-h-screen flex justify-center items-center bg-gray-100">
      <SortParticipants />
    </main>
  );
};

export default ShowParticipants;

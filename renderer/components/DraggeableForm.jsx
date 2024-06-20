import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";

const Roulette = dynamic(() => import("./Roulette"), { ssr: false });

const FormularioTexto = () => {
  const [inputList, setInputList] = useState([]);

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const lines = paste.split("\n").filter((line) => line.trim() !== "");
    const newParticipants = lines.map((line) => ({
      id: uuidv4(),
      text: line.trim(),
    }));

    // Create a set to store unique participants
    const uniqueParticipantsSet = new Set([
      ...inputList.map((participant) => participant.text),
      ...newParticipants.map((participant) => participant.text),
    ]);

    // Convert the set back to an array
    const uniqueParticipants = Array.from(uniqueParticipantsSet).map((text) => ({
      id: uuidv4(),
      text,
    }));

    setInputList(uniqueParticipants);
  };

  const handleChange = (e) => {
    // Handle changes in the textarea directly
    const newText = e.target.value;
    setInputList([{ id: uuidv4(), text: newText }]);
  };

  return (
    <div className="main-form">
      <div className="flex flex-row">
        <Roulette data={inputList} />
        <div>
          <textarea
            className="textarea ml-9 "
            placeholder="Pega a los participantes aquí"
            onPaste={handlePaste}
            rows="5"
            cols="50"
            value={inputList.map((item) => item.text).join("\n")}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FormularioTexto;

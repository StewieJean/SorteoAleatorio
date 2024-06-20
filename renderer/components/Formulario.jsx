import React, { useState, useRef, useCallback } from "react";
import { Button, Input, Textarea, Text } from "@rewind-ui/core";
import * as XLSX from "xlsx";

const Formulario = () => {
  const [titulo, setTitulo] = useState("");
  const [participantesText, setParticipantesText] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragAreaRef = useRef(null);

  const handleTituloChange = (e) => {
    setTitulo(e.target.value);
  };

  const handleParticipantesChange = (e) => {
    const value = e.target.value;
    setParticipantesText(value);
    const participantsArray = value
      .split("\n")
      .filter((item) => item.trim() !== "");
    setParticipantes(participantsArray);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target.result;
        if (file.name.endsWith(".xlsx")) {
          handleExcelFile(content);
        } else if (file.name.endsWith(".txt")) {
          handleTextFile(content);
        }
      };

      if (file.name.endsWith(".xlsx")) {
        reader.readAsBinaryString(file);
      } else if (file.name.endsWith(".txt")) {
        reader.readAsText(file, "UTF-8");
      }
    }
  };

  const handleExcelFile = (content) => {
    const workbook = XLSX.read(content, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const participantsArray = data
      .map((row) => normalizeText(row[0]))
      .filter((item) => !!item);
    setParticipantesText(participantsArray.join("\n"));
    setParticipantes(participantsArray);
  };

  const handleTextFile = (content) => {
    const participantsArray = content
      .split(/\r?\n/)
      .map((participant) => normalizeText(participant))
      .filter((item) => item.trim() !== "");
    setParticipantesText(participantsArray.join("\n"));
    setParticipantes(participantsArray);
  };

  const normalizeText = (text) => {
    return text.replace(/[^\w\sáéíóúüñ]/gi, "").trim();
  };

  const handleDeleteData = () => {
    setTitulo("");
    setParticipantesText("");
    setParticipantes([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      titulo,
      participantes,
    };
    sessionStorage.setItem("formularioSorteo", JSON.stringify(formData));
    setTitulo("");
    setParticipantesText("");
    setParticipantes([]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (isDragging) setIsDragging(false);
  };

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleDragEnd = () => {
    if (isDragging) setIsDragging(false);
  };

  return (
    <form
      className=""
      onSubmit={handleSubmit}
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
    >
      <label>
        <Text className="text-lg"> Título:</Text>
        <Input
          variant="pill"
          className=""
          type="text"
          value={titulo}
          onChange={handleTituloChange}
        />
      </label>
      <br />
      <label>
        <Text className="text-lg"> Participantes:</Text>
        <Textarea
        className="h-48"
          value={participantesText}
          onChange={handleParticipantesChange}
        />
      </label>
      <br />
      <Text className="text-lg ">Cantidad de Participantes: <span className="text-purple-600">{participantes.length}</span></Text>
      <div
        ref={dragAreaRef}
        className={`draggable w-96 border-dashed border-2 mt-4 py-8 rounded-lg transition-colors duration-200 ease-in-out ${
          isDragging
            ? "dragging border-purple-200 scale-110 bg-purple-50 border-3"
            : ""
        }`}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt, .xlsx"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <Button
          className="file-button bg-purple-50"
          shadow="md"
          tone="transparent"
          onClick={() => fileInputRef.current.click()}
        >
          Importar desde archivo
        </Button>
        <p>
          {isDragging
            ? "Suelta aquí el archivo"
            : "O arrastra un archivo aquí .txt o .xlsx"}
        </p>
      </div>
      <br />
      <Button
        color="purple"
        shadow="md"
        shadowColor="dark"
        type="submit"
        disabled={!titulo || participantes.length === 0}
      >
        Comenzar
      </Button>
      <Button
        tone="transparent"
        shadow="md"
        className="mt-2 ml-2"
        onClick={handleDeleteData}
      >
        Eliminar Datos
      </Button>
    </form>
  );
};

export default Formulario;

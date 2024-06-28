import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button, Textarea, Text, Table } from "@rewind-ui/core"
import * as XLSX from "xlsx"
import Link from "next/link"

const FormularioExcluded = () => {
  const [excludedParticipantsText, setExcludedParticipantsText] = useState("")
  const [excludedParticipants, setExcludedParticipants] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dragAreaRef = useRef(null)
  const dragCounter = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  

  useEffect(() => {
    // Obtener los datos de participantes excluidos desde el localStorage
    const storedData = localStorage.getItem("FormularioExcludedSorteo")
    if (storedData) {
      const { excludedParticipants } = JSON.parse(storedData)
      setExcludedParticipantsText(excludedParticipants.join("\n"))
      setExcludedParticipants(excludedParticipants)
    }
  }, [])

  const handleExcludedParticipantsChange = (e) => {
    const value = e.target.value
    setExcludedParticipantsText(value)
    const participantsArray = value
      .split("\n")
      .filter((item) => item.trim() !== "")
    setExcludedParticipants(participantsArray)
  }

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };
  

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const handleFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let content = e.target.result;
        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xlsm")) {
          handleExcelFile(content);
        } else if (file.name.endsWith(".txt")) {
          handleTextFile(content);
        }
      };
  
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xlsm")) {
        reader.readAsBinaryString(file);
      } else if (file.name.endsWith(".txt")) {
        reader.readAsText(file, "UTF-8");
      }
    }
  };
  
  const handleExcelFile = (content) => {
    const workbook = XLSX.read(content, { type: "binary" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    const participantsArray = data
      .map((row) => (row[0] ? normalizeText(row[0]) : ""))
      .filter((item) => !!item)

    setExcludedParticipantsText(participantsArray.join("\n"))
    setExcludedParticipants(participantsArray)
  }

  const handleTextFile = (content) => {
    const participantsArray = content
      .split(/\r?\n/)
      .map((participant) => (participant ? normalizeText(participant) : ""))
      .filter((item) => item.trim() !== "")

    setExcludedParticipantsText(participantsArray.join("\n"))
    setExcludedParticipants(participantsArray)
  }

  const normalizeText = (text) => {
    if (typeof text !== "string") {
      return ""
    }
    return text.replace(/[^\w\sáéíóúüñ]/gi, "").trim()
  }

  const handleDeleteData = () => {
    setExcludedParticipantsText("")
    setExcludedParticipants([])
    localStorage.removeItem("FormularioExcludedSorteo")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = {
      excludedParticipants,
    }
    localStorage.setItem("FormularioExcludedSorteo", JSON.stringify(formData))
        const storedData = localStorage.getItem("FormularioExcludedSorteo")
    if (storedData) {
      const { excludedParticipants } = JSON.parse(storedData)
      setExcludedParticipantsText(excludedParticipants.join("\n"))
      setExcludedParticipants(excludedParticipants)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };
  

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault()
      if (!isDragging) setIsDragging(true)
    },
    [isDragging]
  )

  const handleDragEnd = () => {
    if (isDragging) setIsDragging(false)
  }

  return (
    <div className="flex w-1/2 ">
      <form
        className="w-1/2"
        onSubmit={handleSubmit}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <br />
        <label>
          <Text className="text-lg">Participantes excluidos:</Text>
          <Textarea
            className="h-48 max-h-[600px]"
            value={excludedParticipantsText}
            onChange={handleExcludedParticipantsChange}
          />
        </label>
        <br />
        <Text className="text-lg ">
          Cantidad de participantes excluidos:{" "}
          <span className="text-purple-600">{excludedParticipants.length}</span>
        </Text>
        <div
          ref={dragAreaRef}
          className={`draggable  border-dashed border-2 mt-4 py-8 rounded-lg flex flex-col items-center ${
            isDragging
              ? "dragging border-purple-200 scale-110 bg-purple-50 border-3"
              : ""
          }`}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt, .xlsx, .xlsm"
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
          tone="light"
          type="submit"
          disabled={excludedParticipants.length === 0}
        >
          Guardar
        </Button>
        <Button
          tone="transparent"
          shadow="md"
          className="mt-2 ml-2"
          onClick={handleDeleteData}
          disabled={excludedParticipants.length === 0}
        >
          Eliminar participantes
        </Button>
        <Link href="/home" legacyBehavior>
          <Button tone="light" color="red" shadow="md" className="ml-2">
            Atrás
          </Button>
        </Link>
      </form>
      <div className="w-1/2 p-4 ">
        <div className="border p-4 rounded-md">
          <Text className="text-lg mb-4">
            Participantes excluidos almacenados:
          </Text>
          <Table
            headerColor="dark"
            hoverable={false}
            stripePosition="odd"
            className="w-full max-h-[850px]"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="">Nro.</Table.Th>
                <Table.Th className="">Nombre</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {excludedParticipants.map((participant, index) => {
                // Verificar si el participante está guardado en localStorage
                if (localStorage.getItem("FormularioExcludedSorteo")) {
                  const storedData = JSON.parse(
                    localStorage.getItem("FormularioExcludedSorteo")
                  )
                  if (storedData.excludedParticipants.includes(participant)) {
                    return (
                      <Table.Tr key={index}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>{participant}</Table.Td>
                      </Table.Tr>
                    )
                  }
                }
                return null // Si no está almacenado, no se muestra en la tabla
              })}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default FormularioExcluded

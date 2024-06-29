import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button, Textarea, Text, Table } from "@rewind-ui/core"
import * as XLSX from "xlsx"
import Link from "next/link"

const FormularioExcluded = () => {
  const [participantsText, setParticipantsText] = useState("")
  const [excludedParticipants, setExcludedParticipants] = useState([])
  const [predefinedWinners, setPredefinedWinners] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dragAreaRef = useRef(null)
  const dragCounter = useRef(0)

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounter.current += 1
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    const storedExcludedData = localStorage.getItem("FormularioExcludedSorteo")
    if (storedExcludedData) {
      const { excludedParticipants } = JSON.parse(storedExcludedData)
      setExcludedParticipants(excludedParticipants)
    }

    const storedPredefinedData = localStorage.getItem(
      "FormularioPredefinedWinners"
    )
    if (storedPredefinedData) {
      const { predefinedWinners } = JSON.parse(storedPredefinedData)
      setPredefinedWinners(predefinedWinners)
    }
  }

  const handleParticipantsChange = (e) => {
    setParticipantsText(e.target.value)
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    dragCounter.current = 0
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const handleFile = (file) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        let content = e.target.result
        if (file.name.endsWith(".xlsx") || file.name.endsWith(".xlsm")) {
          handleExcelFile(content)
        } else if (file.name.endsWith(".txt")) {
          handleTextFile(content)
        }
      }

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xlsm")) {
        reader.readAsBinaryString(file)
      } else if (file.name.endsWith(".txt")) {
        reader.readAsText(file, "UTF-8")
      }
    }
  }

  const handleExcelFile = (content) => {
    const workbook = XLSX.read(content, { type: "binary" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    const participantsArray = data
      .map((row) => (row[0] ? normalizeText(row[0]) : ""))
      .filter((item) => !!item)

    setParticipantsText(participantsArray.join("\n"))
  }

  const handleTextFile = (content) => {
    const participantsArray = content
      .split(/\r?\n/)
      .map((participant) => (participant ? normalizeText(participant) : ""))
      .filter((item) => item.trim() !== "")

    setParticipantsText(participantsArray.join("\n"))
  }

  const normalizeText = (text) => {
    if (typeof text !== "string") {
      return ""
    }
    return text.replace(/[^\w\sáéíóúüñ]/gi, "").trim()
  }

  const handleDeleteData = (type) => {
    if (type === "excluded") {
      setExcludedParticipants([])
      localStorage.removeItem("FormularioExcludedSorteo")
    } else if (type === "predefined") {
      setPredefinedWinners([])
      localStorage.removeItem("FormularioPredefinedWinners")
    }
  }

  const handleSave = (type) => {
    const participantsArray = participantsText
      .split("\n")
      .filter((item) => item.trim() !== "")

    if (type === "excluded") {
      setExcludedParticipants(participantsArray)
      const formData = { excludedParticipants: participantsArray }
      localStorage.setItem("FormularioExcludedSorteo", JSON.stringify(formData))
    } else if (type === "predefined") {
      setPredefinedWinners(participantsArray)
      const formData = { predefinedWinners: participantsArray }
      localStorage.setItem(
        "FormularioPredefinedWinners",
        JSON.stringify(formData)
      )
    }

    fetchData()
    setParticipantsText("")
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault()
      if (!isDragging) setIsDragging(true)
    },
    [isDragging]
  )

  return (
    <div className="flex w-full">
      <form
        className="w-1/3"
        onSubmit={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <br />
        <label>
          <Text className="text-lg">Participantes:</Text>
          <Textarea
            className="h-48 max-h-[600px]"
            value={participantsText}
            onChange={handleParticipantsChange}
          />
        </label>
        <br />
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
          onClick={() => handleSave("excluded")}
          disabled={participantsText.trim() === ""}
        >
          Guardar en Excluidos
        </Button>
        <Button
          color="blue"
          shadow="md"
          shadowColor="dark"
          tone="light"
          onClick={() => handleSave("predefined")}
          disabled={participantsText.trim() === ""}
        >
          Guardar en Ganadores Predefinidos
        </Button>
        <Button
          tone="transparent"
          shadow="md"
          className="mt-2 ml-2"
          onClick={() => handleDeleteData("excluded")}
          disabled={excludedParticipants.length === 0}
        >
          Eliminar Excluidos
        </Button>
        <Button
          tone="transparent"
          shadow="md"
          className="mt-2 ml-2"
          onClick={() => handleDeleteData("predefined")}
          disabled={predefinedWinners.length === 0}
        >
          Eliminar Ganadores Predefinidos
        </Button>
        <Link href="/home" legacyBehavior>
          <Button tone="light" color="red" shadow="md" className="ml-2">
            Atrás
          </Button>
        </Link>
      </form>
      <div className="w-2/3 p-4 flex space-x-4">
        <div className="w-1/2 border p-4 rounded-md">
          <Text className="text-lg mb-4">Participantes excluidos:</Text>
          <Table
            headerColor="dark"
            hoverable={false}
            stripePosition="odd"
            className="w-full max-h-[850px]"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nro.</Table.Th>
                <Table.Th>Nombre</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {excludedParticipants.map((participant, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>{participant}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
        <div className="w-1/2 border p-4 rounded-md">
          <Text className="text-lg mb-4">Ganadores predefinidos:</Text>
          <Table
            headerColor="dark"
            hoverable={false}
            stripePosition="odd"
            className="w-full max-h-[850px]"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nro.</Table.Th>
                <Table.Th>Nombre</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {predefinedWinners.map((participant, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>{participant}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default FormularioExcluded

import React, { useState, useRef, useCallback } from "react"
import { Button, Textarea, Text } from "@rewind-ui/core"
import * as XLSX from "xlsx"
import { useRouter } from "next/router"

const FormularioExcluded = () => {
  const [excludedParticipantsText, setExcludedParticipantsText] = useState("")
  const [excludedParticipants, setexcludedParticipants] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dragAreaRef = useRef(null)
  const router = useRouter()

  const handleexcludedParticipantsChange = (e) => {
    const value = e.target.value
    setExcludedParticipantsText(value)
    const participantsArray = value
      .split("\n")
      .filter((item) => item.trim() !== "")
    setexcludedParticipants(participantsArray)
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
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
        if (file.name.endsWith(".xlsx")) {
          handleExcelFile(content)
        } else if (file.name.endsWith(".txt")) {
          handleTextFile(content)
        }
      }

      if (file.name.endsWith(".xlsx")) {
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

    setExcludedParticipantsText(participantsArray.join("\n"))
    setexcludedParticipants(participantsArray)
  }

  const handleTextFile = (content) => {
    const participantsArray = content
      .split(/\r?\n/)
      .map((participant) => (participant ? normalizeText(participant) : ""))
      .filter((item) => item.trim() !== "")

    setExcludedParticipantsText(participantsArray.join("\n"))
    setexcludedParticipants(participantsArray)
  }

  const normalizeText = (text) => {
    if (typeof text !== "string") {
      return ""
    }
    return text.replace(/[^\w\sáéíóúüñ]/gi, "").trim()
  }

  const handleDeleteData = () => {
    setExcludedParticipantsText("")
    setexcludedParticipants([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = {
      excludedParticipants,
    }
    localStorage.setItem("FormularioExcludedSorteo", JSON.stringify(formData))
    router.push("/home")
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    if (isDragging) setIsDragging(false)
  }

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
    <form
      className=""
      onSubmit={handleSubmit}
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
    >
      <br />
      <label>
        <Text className="text-lg"> excludedParticipants:</Text>
        <Textarea
          className="h-48"
          value={excludedParticipantsText}
          onChange={handleexcludedParticipantsChange}
        />
      </label>
      <br />
      <Text className="text-lg ">
        Cantidad de excludedParticipants:{" "}
        <span className="text-purple-600">{excludedParticipants.length}</span>
      </Text>
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
        disabled={!excludedParticipants.length === 0}
      >
        Siguiente
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
  )
}

export default FormularioExcluded

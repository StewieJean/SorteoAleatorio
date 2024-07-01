import React, { useState, useRef, useCallback, useEffect } from "react"
import { Button, Textarea, Text, FormControl } from "@rewind-ui/core"
import * as XLSX from "xlsx"
import { useRouter } from "next/router"


const Formulario = () => {
  const [titulo, setTitulo] = useState("")
  const [participantesText, setParticipantesText] = useState("")
  const [participantes, setParticipantes] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dragAreaRef = useRef(null)
  const router = useRouter()
  const dragCounter = useRef(0)

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounter.current += 1
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleTituloChange = (e) => {
    setTitulo(e.target.value)
  }

  const handleParticipantesChange = (e) => {
    const value = e.target.value
    setParticipantesText(value)
    const participantsArray = value
      .split("\n")
      .filter((item) => item.trim() !== "")
    setParticipantes(participantsArray)
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
      .map((row) => normalizeText(row[0]))
      .filter((item) => !!item)
    setParticipantesText(participantsArray.join("\n"))
    setParticipantes(participantsArray)
  }

  const handleTextFile = (content) => {
    const participantsArray = content
      .split(/\r?\n/)
      .map((participant) => normalizeText(participant))
      .filter((item) => item.trim() !== "")
    setParticipantesText(participantsArray.join("\n"))
    setParticipantes(participantsArray)
  }

  const normalizeText = (text) => {
    if (typeof text !== "string") {
      return ""
    }
    return text.replace(/[^\w\sáéíóúüñ]/gi, "").trim()
  }

  const handleDeleteData = () => {
    setTitulo("")
    setParticipantesText("")
    setParticipantes([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = {
      titulo,
      participantes,
    }
    sessionStorage.setItem("formularioSorteo", JSON.stringify(formData))
    router.push("/RuletaSort/page")
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

  //COMANDO PARA INGRESAR A EXCLUDED
  // Función para manejar el acceso al enlace mediante el atajo de teclado
  const handleAccessLink = (event) => {
    // Verifica si se presionan Ctrl + Alt + E
    if (event.ctrlKey && event.altKey && event.key === "e" || event.ctrlKey && event.altKey && event.key === "E") {
      router.push("/ExcludedParticipants/page") // Navega al enlace especificado
    }
  }

  // Ejemplo de efecto para escuchar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      handleAccessLink(event) // Llama a la función para manejar el acceso al enlace
    }

    // Agrega el event listener para escuchar eventos de teclado
    document.addEventListener("keydown", handleKeyDown)

    // Limpia el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, []) // Asegúrate de que este efecto se ejecute solo una vez al montar el componente

  return (
    <form
      className="w-full "
      onSubmit={handleSubmit}
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <label>
        <FormControl validation="none">
          <FormControl.Label className="text-lg font-normal dark:text-gray-100">
            Título
          </FormControl.Label>
          <FormControl.Input
            variant=""
            className="w-96"
            type="text"
            value={titulo}
            onChange={handleTituloChange}
            placeholder={"Título del sorteo"}
          />
        </FormControl>
      </label>

      <label>
        <FormControl className="mt-2" validation="none">
          <FormControl.Label className="text-lg font-normal dark:text-gray-100">
            Participantes
          </FormControl.Label>
          <Textarea
            className="h-48"
            value={participantesText}
            onChange={handleParticipantesChange}
            placeholder="Añade a los participantes aquí..."
          />
        </FormControl>
      </label>
      <br />
      <Text className="text-lg">
        Cantidad de Participantes:{" "}
        <span className="text-purple-600">{participantes.length}</span>
      </Text>
      <div
        ref={dragAreaRef}
        className={`draggable border-dashed border-4 mt-2 py-8 rounded-lg flex flex-col items-center ${
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
        type="submit"
        disabled={!titulo || participantes.length === 0}
      >
        Siguiente
      </Button>
      <Button
        tone="transparent"
        shadow="md"
        className="mt-2 ml-2"
        onClick={handleDeleteData}
        disabled={!titulo && participantes.length === 0}
      >
        Eliminar Datos
      </Button>
      <div className="absolute bottom-0 left-0 size-20 bg-blue-300 rounded-full mix-blend-multiply blur-xl opacity-70"></div>
    </form>
  )
}

export default Formulario

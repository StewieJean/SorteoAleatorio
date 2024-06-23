import Head from "next/head"
import React from "react"
import Formulario from "../components/Formulario"

function Home() {
  return (

      <React.Fragment>
        <Head>
          <title>Ruleta de la fortuna</title>
        </Head>
        <section className="relative min-h-screen flex justify-center items-center bg-gray-100">

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
            <div className="text-center pb-12 md:pb-16">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tighter tracking-tighter mb-4 ">
                Sorteo por nombres al azar
              </h1>

              <p className="p-4 text-2xl mb-8">
                Escoge un ganador al azar de una lista de nombres
              </p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div className="w-full sm:w-auto">
                  <Formulario />
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </section>
      </React.Fragment>

  )
}

export default Home

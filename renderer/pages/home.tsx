import Head from "next/head"
import React from "react"
import Formulario from "../components/FormularioPrincipal"

function Home() {

  return (
    <React.Fragment>
      <Head>
        <title>La Ruleta</title>
      </Head>
      <section className="relative min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
      
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="text-center pb-12 md:pb-16">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tighter tracking-tighter mb-4 text-blue-400">
              Sorteo por nombres al azar
            </h1>

            <p className="p-4 text-2xl mb-8 dark:text-gray-100">
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

        <div
          className="z-0 absolute top-0 right-64 size-80 bg-yellow-300 dark:bg-violet-500 rounded-full 
             blur-3xl opacity-30"
        ></div>

        <div
          className="z-0 absolute bottom-96 left-24 size-56 bg-pink-300 rounded-full 
             blur-xl opacity-70"
        ></div>
      </section>
      <div className="z-0 box size-full">
        <div className="ball  bg-purple-300"></div>
      </div>
    </React.Fragment>
  )
}

export default Home

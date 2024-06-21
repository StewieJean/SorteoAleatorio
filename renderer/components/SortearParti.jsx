import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const participantesIniciales = [
  'Participante 1',
  'Participante 2',
  'Participante 3',
];

const RuletaComponent = () => {
  const [resultado, setResultado] = useState(null);
  const [girando, setGirando] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!girando) return;

      const indiceGanador = Math.floor(Math.random() * participantesIniciales.length);
      setResultado(participantesIniciales[indiceGanador]);

      setTimeout(() => {
        setGirando(false);
      }, 1000); // Tiempo extra antes de detener la animación
    }, 6000); // Intervalo para cambiar el resultado cada 6 segundos

    return () => clearInterval(interval);
  }, [girando]);

  const containerVariants = {
    animate: {
      x: ['-100%', '0%'],
      transition: {
        x: {
          duration: 6,
          ease: 'linear',
          loop: Infinity,
          repeatDelay: 0,
        },
      },
    },
  };

  return (
    <div className="ruleta-container">
      <div className="linea-central"></div>
      <motion.div
        className="ruleta"
        variants={containerVariants}
        animate={girando ? "animate" : undefined}
      >
        {participantesIniciales.map((participante, index) => (
          <div key={index} className={`participante ${resultado === participante ? 'ganador' : ''}`}>
            {participante}
          </div>
        ))}
      </motion.div>
      <button onClick={() => setGirando(!girando)} disabled={girando}>
        {girando ? 'Detener' : 'Girar Ruleta'}
      </button>
      {resultado && <p>¡El ganador es: {resultado}!</p>}
    </div>
  );
};

export default RuletaComponent;

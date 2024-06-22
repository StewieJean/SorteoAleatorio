import React, { useState } from "react";
import { animated, useSpring } from "react-spring";

export default function App() {
  const [numb, setNumb] = useState(999);
  const [oscillationsCount, setOscillationsCount] = useState(0);

  const generateRandomNumber = () => {
    const randomNo = Math.floor(Math.random() * 99);
    setNumb(randomNo);
    setOscillationsCount(0); // Reiniciar el contador de oscilaciones
  };

  const props = useSpring({
    val: numb,
    from: { val: numb },
    to: async (next) => {
      while (oscillationsCount < 5) { // Limitar a 5 oscilaciones, por ejemplo
        await next({ val: numb + Math.random() * 100 - 50 });
        await next({ val: numb });
        setOscillationsCount(count => count + 1); // Incrementar el contador de oscilaciones
      }
    },
    config: { duration: 1000 },
    reset: true, // Reiniciar la animación cuando el estado de 'numb' cambia
  });

  return (
    <div className="App">
      <div className="card">
        <animated.h1>{props.val.to((val) => Math.floor(val))}</animated.h1>
        <button className="btn" onClick={generateRandomNumber}>
          Number Generator
        </button>
      </div>
    </div>
  );
}

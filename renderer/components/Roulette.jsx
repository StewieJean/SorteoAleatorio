import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  {
    ssr: false,
  }
)

const Roulette = ({ data }) => {
  if (data.length === 0) {
    return <div>No existen participantes</div>;
  }

  const wheelData = data.map(item => ({ option: item.text }));

  return (
    <div align="center" className="roulette-container h-[800px]"  >
      <Wheel

        mustStartSpinning={false}
        prizeNumber={Math.floor(Math.random() * data.length)}
        data={wheelData}
        backgroundColors={[
          "#3f297e",
          "#175fa9",
          "#169ed8",
          "#239b63",
          "#64b031",
          "#efe61f",
          "#f7a416",
          "#e6471d",
          "#dc0936",
          "#e5177b",
          "#be1180",
          "#871f7f"
        ]}
        textColors={['#ffffff']}
        outerBorderWidth={2}
        textDistance={50}
        fontSize={[10]}
        onStopSpinning={() => {
          setMustSpin(false);
        }}
        radiusLineWidth={[1]} // Cambia este valor para ajustar el radio interior
      />
    </div>
  );
};

export default Roulette;

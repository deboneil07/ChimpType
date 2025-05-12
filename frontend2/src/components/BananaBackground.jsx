import React from 'react';

const BananaBackground = () => {
  // Create a grid-like distribution for more even spacing
  const gridSize = 7; // 7x7 grid
  const bananas = [];
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Add some randomness within each grid cell
      const x = (i * (100 / gridSize)) + (Math.random() * (100 / gridSize));
      const y = (j * (100 / gridSize)) + (Math.random() * (100 / gridSize));
      
      bananas.push({
        id: `${i}-${j}`,
        x,
        y,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.15 + Math.random() * 0.15
      });
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {bananas.map((banana) => (
        <div
          key={banana.id}
          className="absolute text-yellow-400/30"
          style={{
            left: `${banana.x}%`,
            top: `${banana.y}%`,
            transform: `rotate(${banana.rotation}deg) scale(${banana.scale})`,
            opacity: banana.opacity,
            fontSize: '2rem'
          }}
        >
          🍌
        </div>
      ))}
    </div>
  );
};

export default BananaBackground; 
import React, { useRef, useEffect, useState } from 'react';
import { Car } from '../lib/Car';
import { GeneticAlgorithm } from '../lib/GeneticAlgorithm';
import { NeuralNetwork } from '../lib/NeuralNetwork';

export const Simulator = ({
  isRunning,
  speedMultiplier,
  populationSize,
  showSensors,
  showNetwork,
  onStatsUpdate,
  resetTrigger,
  controlMode = 'AI_AUTO',
  trafficDensity = 100
}) => {
  const canvasRef = useRef(null);
  const networkCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const carsRef = useRef([]);
  const trafficRef = useRef([]);
  const gaRef = useRef(null);
  const roadRef = useRef(null);
  const bestCarRef = useRef(null);
  const playerCarRef = useRef(null);

  // Refs for props to access fresh values inside animation loop
  const isRunningRef = useRef(isRunning);
  const speedRef = useRef(speedMultiplier);
  const showSensorsRef = useRef(showSensors);
  const showNetworkRef = useRef(showNetwork);
  const controlModeRef = useRef(controlMode);
  const trafficDensityRef = useRef(trafficDensity);

  useEffect(() => {
    isRunningRef.current = isRunning;
    speedRef.current = speedMultiplier;
    showSensorsRef.current = showSensors;
    showNetworkRef.current = showNetwork;
    controlModeRef.current = controlMode;
    trafficDensityRef.current = trafficDensity;
  }, [isRunning, speedMultiplier, showSensors, showNetwork, controlMode, trafficDensity]);

  // Keyboard controls for manual mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!playerCarRef.current) return;
      
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          playerCarRef.current.manualControls.forward = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          playerCarRef.current.manualControls.backward = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          playerCarRef.current.manualControls.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          playerCarRef.current.manualControls.right = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (!playerCarRef.current) return;
      
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          playerCarRef.current.manualControls.forward = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          playerCarRef.current.manualControls.backward = false;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          playerCarRef.current.manualControls.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          playerCarRef.current.manualControls.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlMode]);

  // Update traffic density dynamically
  useEffect(() => {
    if (roadRef.current && trafficRef.current.length > 0) {
      initializeTraffic();
    }
  }, [trafficDensity]);

  // Initialize simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Initialize road
    roadRef.current = {
      x: canvas.width / 2,
      width: 300,
      laneCount: 3,
      borders: [
        [
          { x: canvas.width / 2 - 150, y: -100000 },
          { x: canvas.width / 2 - 150, y: 10000 }
        ],
        [
          { x: canvas.width / 2 + 150, y: -100000 },
          { x: canvas.width / 2 + 150, y: 10000 }
        ]
      ]
    };

    // Initialize genetic algorithm
    gaRef.current = new GeneticAlgorithm(populationSize, 0.1, 0.3);

    // Initialize cars
    initializeCars();

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resetTrigger, populationSize, controlMode]);

  const initializeCars = () => {
    const canvas = canvasRef.current;
    const road = roadRef.current;
    const laneWidth = road.width / road.laneCount;
    const startX = road.x - road.width / 2 + laneWidth / 2 + laneWidth;

    // Create cars based on control mode
    carsRef.current = [];
    
    if (controlMode === 'MANUAL' || controlMode === 'AI_ASSIST') {
      // Single player car
      const car = new Car(startX, 100, 30, 50, controlMode, '#00ffff');
      carsRef.current.push(car);
      playerCarRef.current = car;
    } else {
      // AI Auto mode - population of AI cars
      playerCarRef.current = null;
      for (let i = 0; i < populationSize; i++) {
        const car = new Car(startX, 100, 30, 50, 'AI', `hsl(${180 + i * 5}, 100%, ${50 + i}%)`);
        carsRef.current.push(car);
      }
    }

    initializeTraffic();
  };

  const initializeTraffic = () => {
    const road = roadRef.current;
    const laneWidth = road.width / road.laneCount;

    // Calculate traffic count based on density (0-300%)
    const baseDensity = 50;
    const trafficCount = Math.floor(baseDensity * (trafficDensity / 100));

    // Create traffic
    trafficRef.current = [];
    const trafficColors = ['#ff00ff', '#ff0080', '#8000ff'];
    for (let i = 0; i < trafficCount; i++) {
      const lane = Math.floor(Math.random() * road.laneCount);
      const x = road.x - road.width / 2 + laneWidth / 2 + lane * laneWidth;
      const y = -200 - i * 400; // More spacing for higher speed
      const color = trafficColors[Math.floor(Math.random() * trafficColors.length)];
      trafficRef.current.push(new Car(x, y, 30, 50, 'TRAFFIC', color));
    }
  };

  const animate = () => {
    if (!isRunningRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const road = roadRef.current;

    // Update cars
    carsRef.current.forEach(car => {
      car.update(road.borders, trafficRef.current, speedRef.current);
    });

    // Update traffic
    trafficRef.current.forEach(car => {
      car.update([], [], speedRef.current);

      // Respawn traffic if it goes off screen
      if (car.y > canvas.height + 100) {
        const laneWidth = road.width / road.laneCount;
        const lane = Math.floor(Math.random() * road.laneCount);
        car.x = road.x - road.width / 2 + laneWidth / 2 + lane * laneWidth;
        car.y = -100;
      }
    });

    // Find best car
    const aliveCars = carsRef.current.filter(c => !c.damaged);
    if (aliveCars.length > 0) {
      bestCarRef.current = aliveCars.reduce((best, car) =>
        car.score > best.score ? car : best
      );
    } else {
      bestCarRef.current = null;
    }

    // Check if generation is complete
    if (aliveCars.length === 0) {
      const newBrains = gaRef.current.evolve(carsRef.current);
      carsRef.current.forEach((car, i) => {
        car.brain = newBrains[i];
        car.damaged = false;
        car.score = 0;
        car.distanceTraveled = 0;
        car.timeAlive = 0;

        // Reset position
        const laneWidth = road.width / road.laneCount;
        const startX = road.x - road.width / 2 + laneWidth / 2 + laneWidth;
        car.x = startX;
        car.y = 100;
        car.angle = 0;
        car.speed = 0;
      });

      // Reset traffic
      initializeTraffic();
    }

    // Update stats
    const stats = gaRef.current.getStats(carsRef.current);
    onStatsUpdate(stats);

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set camera to follow best car
    ctx.save();
    if (bestCarRef.current) {
      ctx.translate(0, -bestCarRef.current.y + canvas.height * 0.7);
    }

    // Draw road
    drawRoad(ctx, road, canvas.height);

    // Draw traffic
    trafficRef.current.forEach(car => car.draw(ctx, false));

    // Draw AI cars (non-best faded)
    carsRef.current.forEach(car => {
      if (car !== bestCarRef.current) {
        ctx.globalAlpha = 0.2;
        car.draw(ctx, false);
        ctx.globalAlpha = 1;
      }
    });

    // Draw best car
    if (bestCarRef.current) {
      bestCarRef.current.draw(ctx, showSensorsRef.current);
    }

    ctx.restore();

    // Draw network visualization
    if (showNetworkRef.current && bestCarRef.current) {
      drawNetwork(bestCarRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawRoad = (ctx, road, canvasHeight) => {
    const laneWidth = road.width / road.laneCount;

    // Draw road background
    ctx.fillStyle = 'rgba(30, 30, 40, 0.8)';
    ctx.fillRect(road.x - road.width / 2, -100000, road.width, 110000);

    // Draw lane lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    for (let i = 1; i < road.laneCount; i++) {
      const x = road.x - road.width / 2 + i * laneWidth;
      ctx.beginPath();
      ctx.moveTo(x, -100000);
      ctx.lineTo(x, 10000);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw borders with glow
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    road.borders.forEach(border => {
      ctx.beginPath();
      ctx.moveTo(border[0].x, border[0].y);
      ctx.lineTo(border[1].x, border[1].y);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
  };

  const drawNetwork = (car) => {
    const canvas = networkCanvasRef.current;
    if (!canvas || !car.brain) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = 20;
    const width = canvas.width - margin * 2;
    const height = canvas.height - margin * 2;

    // Get network data
    const inputs = [
      ...car.sensorReadings.map(r => r ? r.distance : 0),
      car.speed / car.maxSpeed
    ];
    const { hidden, outputs } = car.brain.predict(inputs);

    const layers = [
      { nodes: inputs, label: 'Inputs' },
      { nodes: hidden, label: 'Hidden' },
      { nodes: outputs, label: 'Outputs' }
    ];

    const layerSpacing = width / (layers.length + 1);

    // Draw connections
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let l = 0; l < layers.length - 1; l++) {
      const layer1 = layers[l];
      const layer2 = layers[l + 1];
      const x1 = margin + (l + 1) * layerSpacing;
      const x2 = margin + (l + 2) * layerSpacing;

      for (let i = 0; i < layer1.nodes.length; i++) {
        const y1 = margin + (i + 1) * (height / (layer1.nodes.length + 1));
        for (let j = 0; j < layer2.nodes.length; j++) {
          const y2 = margin + (j + 1) * (height / (layer2.nodes.length + 1));

          const value = layer2.nodes[j];
          ctx.strokeStyle = `rgba(0, 255, 255, ${value * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    layers.forEach((layer, l) => {
      const x = margin + (l + 1) * layerSpacing;
      layer.nodes.forEach((value, i) => {
        const y = margin + (i + 1) * (height / (layer.nodes.length + 1));

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${0.2 + value * 0.8})`;
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add glow for active nodes
        if (value > 0.5) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00ffff';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // Layer label
      ctx.fillStyle = '#00ffff';
      ctx.font = '12px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(layer.label, x, margin / 2);
    });

    // Output labels
    const outputLabels = ['Steer', 'Throttle', 'Brake'];
    const outputLayer = layers[layers.length - 1];
    const x = margin + layers.length * layerSpacing;
    outputLayer.nodes.forEach((value, i) => {
      const y = margin + (i + 1) * (height / (outputLayer.nodes.length + 1));
      ctx.fillStyle = '#00ffff';
      ctx.font = '10px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${outputLabels[i]}: ${value.toFixed(2)}`, x + 15, y + 4);
    });
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          className="w-full border-2 border-glow-cyan rounded-lg bg-muted/20"
          style={{ maxHeight: '600px' }}
        />
      </div>
      {showNetwork && (
        <div className="w-80">
          <canvas
            ref={networkCanvasRef}
            width={320}
            height={600}
            className="w-full border-2 border-glow-magenta rounded-lg bg-muted/20"
          />
        </div>
      )}
    </div>
  );
};

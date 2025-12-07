import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Play, Pause, RotateCcw, Download, Upload, Database, Gamepad2, Brain, Users } from 'lucide-react';

export const ControlPanel = ({
  isRunning,
  onToggleRun,
  speedMultiplier,
  onSpeedChange,
  showSensors,
  onToggleSensors,
  showNetwork,
  onToggleNetwork,
  onReset,
  onSave,
  onLoad,
  populationSize,
  onPopulationChange,
  controlMode,
  onControlModeChange,
  trafficDensity,
  onTrafficDensityChange,
  onOpenModelManager
}) => {
  return (
    <Card className="border-glow-cyan bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-glow-cyan">Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Controls */}
        <div className="flex gap-2">
          <Button
            onClick={onToggleRun}
            variant="default"
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground glow-cyan"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary/20"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">Simulation Speed</Label>
            <span className="text-primary font-mono text-sm">{speedMultiplier}x</span>
          </div>
          <Slider
            value={[speedMultiplier]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.1x</span>
            <span>5x</span>
          </div>
        </div>

        {/* Population Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">Population Size</Label>
            <span className="text-primary font-mono text-sm">{populationSize}</span>
          </div>
          <Slider
            value={[populationSize]}
            onValueChange={(value) => onPopulationChange(value[0])}
            min={10}
            max={200}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span>
            <span>200</span>
          </div>
        </div>

        {/* Visualization Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sensors" className="text-foreground font-medium">Show Sensors</Label>
            <Switch
              id="sensors"
              checked={showSensors}
              onCheckedChange={onToggleSensors}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="network" className="text-foreground font-medium">Show Neural Network</Label>
            <Switch
              id="network"
              checked={showNetwork}
              onCheckedChange={onToggleNetwork}
            />
          </div>
        </div>

        {/* Save/Load */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onSave}
            variant="outline"
            className="flex-1 border-secondary text-secondary hover:bg-secondary/20"
          >
            <Download className="mr-2 h-4 w-4" />
            Save Best
          </Button>
          <Button
            onClick={onLoad}
            variant="outline"
            className="flex-1 border-secondary text-secondary hover:bg-secondary/20"
          >
            <Upload className="mr-2 h-4 w-4" />
            Load
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Trophy, Users, TrendingUp, Target } from 'lucide-react';

export const StatsPanel = ({ stats }) => {
  const survivalRate = stats.total > 0 ? (stats.alive / stats.total) * 100 : 0;
  
  return (
    <Card className="border-glow-magenta bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-glow-magenta">Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-foreground font-medium">Generation</span>
            </div>
            <span className="text-3xl font-bold text-primary font-mono">{stats.generation}</span>
          </div>
        </div>

        {/* Alive Cars */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-success" />
              <span className="text-foreground font-medium">Cars Alive</span>
            </div>
            <span className="text-2xl font-bold font-mono" style={{ color: 'hsl(150 100% 50%)' }}>
              {stats.alive} / {stats.total}
            </span>
          </div>
          <Progress value={survivalRate} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{survivalRate.toFixed(1)}% survival rate</p>
        </div>

        {/* Best Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <span className="text-foreground font-medium">Best Score</span>
            </div>
            <span className="text-2xl font-bold text-secondary font-mono">
              {stats.bestScore.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Average Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <span className="text-foreground font-medium">Avg Score</span>
            </div>
            <span className="text-xl font-bold text-accent font-mono">
              {stats.avgScore.toFixed(0)}
            </span>
          </div>
        </div>

        {/* All-Time Best */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium">All-Time Best</span>
            <span className="text-2xl font-bold text-glow-cyan font-mono">
              {stats.allTimeBest.toFixed(0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

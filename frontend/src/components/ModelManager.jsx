import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Download, Upload, Trash2, Edit2, Check, X, Brain } from 'lucide-react';
import { toast } from 'sonner';

export const ModelManager = ({ open, onOpenChange, currentModel, onSave, onLoad }) => {
  const [models, setModels] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [editingModel, setEditingModel] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadModels();
  }, [open]);

  const loadModels = () => {
    try {
      const saved = localStorage.getItem('neuralCarModels');
      if (saved) {
        const parsed = JSON.parse(saved);
        setModels(parsed);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleSaveModel = () => {
    if (!newModelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    const modelData = {
      id: Date.now().toString(),
      name: newModelName.trim(),
      timestamp: new Date().toISOString(),
      generation: currentModel?.generation || 0,
      bestScore: currentModel?.bestScore || 0,
      brainData: currentModel?.brainData || null
    };

    try {
      const saved = localStorage.getItem('neuralCarModels');
      const existingModels = saved ? JSON.parse(saved) : [];
      existingModels.push(modelData);
      localStorage.setItem('neuralCarModels', JSON.stringify(existingModels));
      
      // Also save as the traditional way for backward compatibility
      localStorage.setItem('bestNetwork', JSON.stringify({
        generation: modelData.generation,
        bestScore: modelData.bestScore,
        timestamp: modelData.timestamp
      }));

      setModels(existingModels);
      setNewModelName('');
      setShowSaveDialog(false);
      
      toast.success('Model saved successfully!', {
        description: `${modelData.name} - Gen ${modelData.generation}`
      });

      if (onSave) {
        onSave(modelData);
      }
    } catch (error) {
      toast.error('Failed to save model');
      console.error(error);
    }
  };

  const handleLoadModel = (model) => {
    try {
      // Set as current in localStorage for backward compatibility
      localStorage.setItem('bestNetwork', JSON.stringify({
        generation: model.generation,
        bestScore: model.bestScore,
        timestamp: model.timestamp
      }));

      toast.success('Model loaded successfully!', {
        description: `${model.name} - Gen ${model.generation}`
      });

      if (onLoad) {
        onLoad(model);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to load model');
      console.error(error);
    }
  };

  const handleDeleteModel = (modelId) => {
    try {
      const updatedModels = models.filter(m => m.id !== modelId);
      localStorage.setItem('neuralCarModels', JSON.stringify(updatedModels));
      setModels(updatedModels);
      toast.success('Model deleted');
    } catch (error) {
      toast.error('Failed to delete model');
      console.error(error);
    }
  };

  const handleRenameModel = (modelId) => {
    if (!editName.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    try {
      const updatedModels = models.map(m => 
        m.id === modelId ? { ...m, name: editName.trim() } : m
      );
      localStorage.setItem('neuralCarModels', JSON.stringify(updatedModels));
      setModels(updatedModels);
      setEditingModel(null);
      setEditName('');
      toast.success('Model renamed');
    } catch (error) {
      toast.error('Failed to rename model');
      console.error(error);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-sm border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-glow-cyan flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Model Manager
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Save, load, and manage your trained neural network models
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Saved Models ({models.length})</Label>
              <Button
                onClick={() => setShowSaveDialog(true)}
                size="sm"
                className="bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                <Download className="mr-2 h-4 w-4" />
                Save Current Model
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {models.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Brain className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-center">No saved models yet</p>
                  <p className="text-sm text-center mt-2">Save your first model to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="p-4 rounded-lg border border-primary/20 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingModel === model.id ? (
                            <div className="flex items-center gap-2 mb-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRenameModel(model.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingModel(null);
                                  setEditName('');
                                }}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <h4 className="font-semibold text-primary mb-1">{model.name}</h4>
                          )}
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Generation: {model.generation} | Score: {model.bestScore.toFixed(0)}</p>
                            <p className="text-xs">{formatDate(model.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadModel(model)}
                            className="text-secondary hover:text-secondary/80"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingModel(model.id);
                              setEditName(model.name);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteModel(model.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-sm border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-glow-cyan">Save Model</DialogTitle>
            <DialogDescription>
              Enter a name for your trained model
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="modelName" className="text-foreground mb-2 block">
              Model Name
            </Label>
            <Input
              id="modelName"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="e.g., Best Highway Driver"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveModel();
                }
              }}
            />
            {currentModel && (
              <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                <p>Generation: {currentModel.generation}</p>
                <p>Best Score: {currentModel.bestScore.toFixed(0)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setNewModelName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveModel}
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
            >
              <Download className="mr-2 h-4 w-4" />
              Save Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Simple Neural Network for car control
export class NeuralNetwork {
  constructor(inputCount, hiddenCount, outputCount) {
    this.inputCount = inputCount;
    this.hiddenCount = hiddenCount;
    this.outputCount = outputCount;
    
    // Weights from input to hidden layer
    this.weightsInputHidden = this.randomMatrix(inputCount, hiddenCount);
    this.biasHidden = this.randomArray(hiddenCount);
    
    // Weights from hidden to output layer
    this.weightsHiddenOutput = this.randomMatrix(hiddenCount, outputCount);
    this.biasOutput = this.randomArray(outputCount);
  }
  
  randomMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = Math.random() * 2 - 1; // Random between -1 and 1
      }
    }
    return matrix;
  }
  
  randomArray(length) {
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr[i] = Math.random() * 2 - 1;
    }
    return arr;
  }
  
  // Activation function (sigmoid)
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  
  // Activation function (tanh for outputs between -1 and 1)
  tanh(x) {
    return Math.tanh(x);
  }
  
  // Forward pass
  predict(inputs) {
    // Calculate hidden layer
    const hidden = [];
    for (let i = 0; i < this.hiddenCount; i++) {
      let sum = this.biasHidden[i];
      for (let j = 0; j < this.inputCount; j++) {
        sum += inputs[j] * this.weightsInputHidden[j][i];
      }
      hidden[i] = this.sigmoid(sum);
    }
    
    // Calculate output layer
    const outputs = [];
    for (let i = 0; i < this.outputCount; i++) {
      let sum = this.biasOutput[i];
      for (let j = 0; j < this.hiddenCount; j++) {
        sum += hidden[j] * this.weightsHiddenOutput[j][i];
      }
      outputs[i] = this.sigmoid(sum);
    }
    
    return { hidden, outputs };
  }
  
  // Create a copy of this network
  clone() {
    const clone = new NeuralNetwork(this.inputCount, this.hiddenCount, this.outputCount);
    clone.weightsInputHidden = this.copyMatrix(this.weightsInputHidden);
    clone.biasHidden = [...this.biasHidden];
    clone.weightsHiddenOutput = this.copyMatrix(this.weightsHiddenOutput);
    clone.biasOutput = [...this.biasOutput];
    return clone;
  }
  
  copyMatrix(matrix) {
    return matrix.map(row => [...row]);
  }
  
  // Mutate the network (for genetic algorithm)
  mutate(mutationRate = 0.1, mutationAmount = 0.5) {
    // Mutate input-hidden weights
    for (let i = 0; i < this.weightsInputHidden.length; i++) {
      for (let j = 0; j < this.weightsInputHidden[i].length; j++) {
        if (Math.random() < mutationRate) {
          this.weightsInputHidden[i][j] += (Math.random() * 2 - 1) * mutationAmount;
          this.weightsInputHidden[i][j] = Math.max(-1, Math.min(1, this.weightsInputHidden[i][j]));
        }
      }
    }
    
    // Mutate hidden biases
    for (let i = 0; i < this.biasHidden.length; i++) {
      if (Math.random() < mutationRate) {
        this.biasHidden[i] += (Math.random() * 2 - 1) * mutationAmount;
        this.biasHidden[i] = Math.max(-1, Math.min(1, this.biasHidden[i]));
      }
    }
    
    // Mutate hidden-output weights
    for (let i = 0; i < this.weightsHiddenOutput.length; i++) {
      for (let j = 0; j < this.weightsHiddenOutput[i].length; j++) {
        if (Math.random() < mutationRate) {
          this.weightsHiddenOutput[i][j] += (Math.random() * 2 - 1) * mutationAmount;
          this.weightsHiddenOutput[i][j] = Math.max(-1, Math.min(1, this.weightsHiddenOutput[i][j]));
        }
      }
    }
    
    // Mutate output biases
    for (let i = 0; i < this.biasOutput.length; i++) {
      if (Math.random() < mutationRate) {
        this.biasOutput[i] += (Math.random() * 2 - 1) * mutationAmount;
        this.biasOutput[i] = Math.max(-1, Math.min(1, this.biasOutput[i]));
      }
    }
  }
  
  // Export network data
  toJSON() {
    return {
      inputCount: this.inputCount,
      hiddenCount: this.hiddenCount,
      outputCount: this.outputCount,
      weightsInputHidden: this.weightsInputHidden,
      biasHidden: this.biasHidden,
      weightsHiddenOutput: this.weightsHiddenOutput,
      biasOutput: this.biasOutput
    };
  }
  
  // Import network data
  static fromJSON(data) {
    const nn = new NeuralNetwork(data.inputCount, data.hiddenCount, data.outputCount);
    nn.weightsInputHidden = data.weightsInputHidden;
    nn.biasHidden = data.biasHidden;
    nn.weightsHiddenOutput = data.weightsHiddenOutput;
    nn.biasOutput = data.biasOutput;
    return nn;
  }
}

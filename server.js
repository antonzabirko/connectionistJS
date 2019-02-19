import express from 'express';
import path from 'path';
import http from 'http';
import math from 'mathjs';
import _ from 'lodash';
import nj from 'numjs';

const app = express(),
			server = http.createServer(app),
			port = process.env.PORT || 3000;
const rnn = require('./rnn.js');

server.listen(port, () => {
		console.log("Server listening at port %d", port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));
//app.get('/', (req, res) => res.send('Hello World!'))

/**
 *  DEBUGS
 */

let x = nj.array([[9, 1], [-3, 8]]);

/**
 *  Sigmoid
 *
 *  @params NdArray z
 *  @return NdArray
 */

function sigmoid(z) {
	let ones = nj.ones(z.shape),
		negOnes = ones.multiply(-1);

	return ones.divide(ones.add(nj.exp(negOnes.multiply(z))));
}

sigmoid(x);

/**
 *  RNN
 */

class RNN {
		constructor(inputLayerSize, outputLayerSize, hiddenLayerSize) {
				// Define Hyperparameters
				this.inputLayerSize = inputLayerSize;
				this.outputLayerSize = outputLayerSize;
				this.hiddenLayerSize = hiddenLayerSize;

				// Define Weights (parameters)
				this.weightA = nj.random(this.inputLayerSize, this.hiddenLayerSize);
				this.weightB = nj.random(this.hiddenLayerSize, this.outputLayerSize);
		}

		/**
		 *  Move forward in the RNN
		 */
		forward(X) {
			this.z2 = nj.dot(X, this.weightA);
			this.a2 = sigmoid(this.z2);
			this.z3 = nj.dot(this.a2, this.weightB);

			return sigmoid(this.z3);
		}
}

let model = new RNN(2, 3, 1);
console.log(model.forward(x));

import express from 'express';
import path from 'path';
import http from 'http';
import math from 'mathjs';
import _ from 'lodash';

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


console.log(math.sqrt(9));

/**
 *  numjs - array
 */

class nj {
		/**
		 *  Creates an array
		 *
		 */
		array(arr) {
				this.values = arr;
				this.dimensions = dim(arr);
		}

		/**
		 *  Counts dimensions in an array
		 *  @params Array
		 *  @return int
		 */
		countDim(arr) {
				if (!arr.length) {
						return 0; // current array lacks dimensions
				}
				return 1 + this.dim(arr[0]);
		}

		/**
		 *  Evaluates to boolean the equality of an array
		 *  @params Array
		 *
		 *  [
		 *      [
		 *          [1, 2],
		 *          [2, 3]
		 *      ],
		 *      [
		 *          [1, 4],
		 *          [6, 4]
		 *      ]
		 *  ]
		 */
		isDimensionBalanced(arr) {
				let arrFlat = _.flattenDeep(arr);

				// Test that all types are identical
				arrFlat.every((v, i, a) => {
						return i === 0 || typeof v === typeof a[i - 1];
				});

				if (!arr[0]) {
						for (let i = 0; i <= arr.length; i++) {
								if (arr[0].length !== arr[1].length) {
										return false; // current dimension is unbalanced
								}
						}
				}
				return this.areBalanced(arr[0]);
		}

		/**
		 *  Exponentiates an array or matrix
		 *
		 */
		exp() {

				//return math.divide(1, math.add(1, math.expm(z)));
		}
}
let arr = 5;

console.log(nj.prototype.dim(arr));

/**
 *  Sigmoid
 */

function sigmoid(z) {
		return math.divide(1, math.add(1, math.expm(z)));
}

/**
 *  RNN
 */

class recurrentNeuralNetwork {
		constructor(inputLayerSize, outputLayerSize, hiddenLayerSize) {
				// Define Hyperparameters
				this.inputLayerSize = inputLayerSize;
				this.outputLayerSize = outputLayerSize;
				this.hiddenLayerSize = hiddenLayerSize;

				// Define Weights (parameters)
				//this.weightA =
		}

		forward(x, w) {

		}
}

let rnn2 = new recurrentNeuralNetwork(5);
console.log(rnn2);
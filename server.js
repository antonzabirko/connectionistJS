import express from 'express';
import path from 'path';
import http from 'http';
import math from 'mathjs';
import _ from 'lodash';
import nj from 'numjs';
import optimjs from 'optimization-js';

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

let x = nj.array([[9, 0], [-3, 8]]).divide(3);

//console.log(x.pow(2));



/**
 *  Negate an array
 *
 *  //@params NdArray z, boolean copy (return new array)
 *  @return NdArray
 */

function neg(z) {
    return z.multiply(-1);
}

/**
 *  ANN
 */

class ANN {
    constructor(inputLayerSize, hiddenLayerSize, outputLayerSize, Lambda) {
        // Define Hyperparameters
        this.inputLayerSize = inputLayerSize;
        this.outputLayerSize = outputLayerSize;
        this.hiddenLayerSize = hiddenLayerSize;
        this.Lambda = Lambda;

        // Define Weights (parameters)
        this.wA = nj.random(this.inputLayerSize, this.hiddenLayerSize);
        this.wB = nj.random(this.hiddenLayerSize, this.outputLayerSize);
    }

    /**
     *  Sigmoid
     *
     *  @params NdArray z
     *  @return NdArray
     */
    sigmoid(z) {
        let ones = nj.ones(z.shape);

        return ones.divide((nj.exp(neg(z))).add(1));
    }

    /**
     *  Move the inputs forward in the network
     */
    forward(X) {
        this.z2 = nj.dot(X, this.wA);
        this.a2 = this.sigmoid(this.z2);
        this.z3 = nj.dot(this.a2, this.wB);
        this.yHat = this.sigmoid(this.z3);

        return this.yHat;
    }

    /**
     * Cost Function
     *
     * @param X
     * @param Y
     * @returns {Unit|*}
     */
    costFunction(X, Y) {
        // Compute cost for X and Y using the weights already stored
        this.yHat = this.forward(X);
        let J = (0.5 * (nj.sum(Y.subtract(this.yHat).pow(2)))).divide(X.shape[0].add(this.Lambda.divide(2)
            .multiply(this.wA.pow(2).sum().add(this.wB.pow(2).sum()))));

        return J;
    }

    /**
     *  Compute derivative with respect to W and W2 for a given X and Y
     *
     *  @params Array input
     *  @return Array
     */
    costFunctionPrime(X, Y) {
        this.yHat = this.forward(X);
        this.delta3 = (neg(Y.subtract(this.yHat))).multiply(this.sigmoidPrime(this.z3));
        this.dJdW2 = (this.a2.T).dot(this.delta3).divide(X.shape[0].add(this.Lambda.multiply(this.wB)));
        this.delta2 = (this.delta3.dot(this.wB.T)).multiply((this.sigmoidPrime(this.z2)));
        this.dJdW1 = (this.delta2).dot(X.T).divide(X.shape[0].add(this.Lambda.multiply(this.wA)));

        return [this.dJdW1, this.dJdW2];
    }

    /**
     *  Sigmoid Derivative
     *
     *  @params NdArray z
     *  @return NdArray
     */
    sigmoidPrime(z) {
        return nj.exp(neg(z)).divide(nj.exp(neg(z)).add(1).pow(2));
    }

    computeGradients(X, Y) {
        let costResults = this.costFunctionPrime(X, Y);
        let dJdW1 = costResults[0];
        let dJdW2 = costResults[1];

        return nj.concat(dJdW1.flatten(), dJdW2.flatten());
    }

    /**
     *  Helper Functions for
     */
}

class Trainer {
    constructor(N) {
        // Link to the ANN
        this.N = N;
    }

    costFunctionWrapper(params, X, Y) {
        this.N.setParams(params);
    }

    train(X, Y) {
        this._res = optimjs.minimize_L_BFGS(N.costFunction(X, Y), N.computeGradients(X, Y), X);
    }
}

let NN = new ANN(2, 3, 1, 0.0001),
    T = new Trainer(NN),
    X = nj.array([[.3, 1], [.5, .2], [1, .4]]),
    Y = nj.array([75, 82, 93]).divide(100);
    //X = X.divide(nj.amax(X));
console.log(Y);
//console.log(model.forward(x));

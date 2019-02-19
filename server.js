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

let x = nj.array([[9, 0], [-3, 8]]);

console.log(sigmoidPrime(x));
//console.log(sigmoid(x));
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
     *  Move forward in the RNN
     */
    forward(X) {
        this.z2 = nj.dot(X, this.weightA);
        this.a2 = sigmoid(this.z2);
        this.z3 = nj.dot(this.a2, this.weightB);

        return sigmoid(this.z3);
    }

    /**
     *  Compute derivative with respect to W and W2 for a given X and Y
     *
     *  @params Array input
     *  @return Array
     */

    costFunctionPrime(X, y) {
        this.yHat = this.forward(X);
        this.delta3 = (neg(y.subtract(this.yHat))).multiply(sigmoidPrime(this.z3));
        this.dJdW2 = (this.a2.T).dot(this.delta3);
        this.delta2 = (this.delta3.dot(this.weightB.T)) * (sigmoidPrime(this.z2));
        this.dJdW1 = (this.delta2).dot(X.T);

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
}

class trainer {
    constructor(N) {
        this.N = N;
    }

    costFunctionWrapper(params, X, y) {
        this.N.setParams(params);
    }

    train(fnc, grd, x0) {
        this._res = optimjs.minimize_L_BFGS(fnc, grd, x0);
    }
}

let model = new RNN(2, 3, 1);
//console.log(model.forward(x));

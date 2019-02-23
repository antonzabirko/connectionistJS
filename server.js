import express from 'express';
import path from 'path';
import http from 'http';
import math from 'mathjs';
import _ from 'lodash';
import nj from 'numjs';
import optimjs from 'optimization-js';

Error.stackTraceLimit = Infinity;

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
        console.log("X value: " + X);
        console.log("forward called");
        //console.log(X);
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
        console.log("X value: " + X);
        console.log("costFunction called");
        //console.log(this);
        //console.log(X);
        this.yHat = NN.forward.call(this, X);
        // console.log(context.yHat);
        let J = nj.divide((0.5 * (nj.sum(nj.subtract(Y, this.yHat).pow(2)))), nj.add(nj.multiply(this.wA.pow(2).sum() + (this.wB.pow(2).sum()), (this.Lambda / 2)), X.shape[0]));
        // console.log(this.yHat);

        return J;
    }

    /**
     *  Compute derivative with respect to W and W2 for a given X and Y
     *
     *  @params Array input
     *  @return Array
     */
    costFunctionPrime(X, Y) {
        console.log("X value: " + X);
        console.log("costFunctionPrime called");
        this.yHat = this.forward(X);
        this.delta3 = (neg(Y.subtract(this.yHat))).multiply(this.sigmoidPrime(this.z3));
        this.dJdW2 = (this.a2.T).dot(this.delta3).divide(nj.add(nj.multiply(this.wB, this.Lambda), X.shape[0]));
        this.delta2 = (this.delta3.dot(this.wB.T)).multiply((this.sigmoidPrime(this.z2)));
        this.dJdW1 = nj.dot(X.T, this.delta2).divide(nj.add(nj.multiply(this.wA, this.Lambda), X.shape[0]));
        console.log("X value: " + X);

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

    computeGradients(context = this, X, Y) {
        //console.log(context);
        let costResults = context.costFunctionPrime(X, Y);
        let dJdW1 = costResults[0];
        let dJdW2 = costResults[1];

        return nj.concatenate(dJdW1.flatten(), dJdW2.flatten());
    }

    /**
     *  Helper Functions for trainer
     */
    setParams(params) {
        let wAStart = 0;
        let wAEnd = this.hiddenLayerSize.multiply(this.inputLayerSize);
        this.wA = params.slice(wAStart, wAEnd).reshape(this.inputLayerSize, this.hiddenLayerSize);
        let wBEnd = wAEnd.add(this.hiddenLayerSize.multiply(this.outputLayerSize));
        this.wB = params.slice(wAEnd, wBEnd).reshape(this.hiddenLayerSize, this.outputLayerSize);
    }
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
        this._res = optimjs.minimize_L_BFGS(this.N, this.N.costFunction, this.N.computeGradients, X, Y);
        this.N.setParams(this._res);
        this.optimizationResults = this._res;
    }
}

let NN = new ANN(2, 3, 1, 0.0001),
    T = new Trainer(NN),
    X = nj.array([[.3, 1], [.5, .2], [1, .4]]),
    Y = nj.array([[75], [82], [93]]).divide(100);

T.train(X, Y);
//console.log(model.forward(x));

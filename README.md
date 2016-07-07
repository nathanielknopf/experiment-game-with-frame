##Cocolab Experiment Game

This is an online experiment built meant for use on Amazon's MTurk platform for data collection. The experiment consists of a small game in which the subject explores elements in the world and discovers causal relations. The subject is then asked some questions about the elements of the world.

##Dependencies

The server is built with Express and Socket.io, packages for Node.js. Several other node packages, including Phaser (the framework in which the game is built), mysql, and moment, are required to run the experiment.

##Setting up and Running the Experiment

Clone this repo, `cd` into the directory, and run `npm install` to install the dependencies locally. 

Various parameters for the server and for the experiment can be configured with the configs object in the the config.js file.

By default, the server uses port 8080 and does not log in a mysql database.
By default, the game runs for 1 minute with a 50% chance of either condition a or condition b, with small and large rocks spawning with equal likelihood.

To run the server:

```
node server.js
```

or with nohup:

```
nohup node server.js &
```

To access the experiment from the server machine, point your browser to `localhost:<port>/experiment.html`

##Help

Please email knopf@mit.edu with any questions about this repo.
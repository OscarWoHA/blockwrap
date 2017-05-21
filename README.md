# BlockWrap

BlockWrap is an application wrapper written in Node.js. The wrapper aims to provide a fully fledged solution for running different game-server applications such as Minecraft's Spigot. The name, BlockWrap contains Block since the wrapper will be focused on the demands of the Minecraft-server community when it comes to adding new features.

## Features (as of v0.1.2)
* Server runs in background
* Easy-to-use .json-configuration
* Almost graceful shutdown (a bit buggy in current release)
* Automatic startup configuration-ability
* Run multiple applications at once
* Input while viewing live output of application
* Easy and clean live-view of application output
* More to be added while we continue development towards the release of v1.0
* Intuitive help-messages to get you started quickly!

## Installation
Installation is very easy and straight forward. 

### Requirements
* Node.js
* Preferably a Linux-server

### Steps
1. BlockWrap does not have to be installed in any particular directory (**NOTE**: Running `cd` will be sufficient). Clone the repository using the git command:  
`git clone https://github.com/OscarWoHA/blockwrap/`

2. You now need to configure the application. Run the command `cd blockwrap` to get into the applications base directory. The base directory contains a file called `example_config.json`. This file contains all the fields needed for the application to run.  

3. Finished configuration already? The next thing you need to do is to run the command `node app.js` to get started with your server-wrapper fun!

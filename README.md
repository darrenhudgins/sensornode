#Sensor Node

##Setup Instructions

See official documentation for installing and configuring
[Node.js](http://nodejs.org) and [MongoDB](http://www.mongodb.org). Once that
is complete, clone the repo and install dependencies using npm.

	$ git clone https://github.com/darrenhudgins/sensornode.git
	$ cd sensornode
	$ npm install

##Restoring the Database

A snapshot of the database is stored in the `data/dump` directory. To
restore the database, run the following command from the root directory of the
project after you've started up a `mongod` process listening on port 
27017 (default).

	$ mongorestore --drop data/dump

##Starting the Server

With `mongod` listening on port 27017, you can start the express server by
running the following command from the root directory of the project.

	$ ./bin/www

If everything is running correctly, you should be able to see the website by
visiting [http://localhost:3002](http://localhost:3002) in your web browser.

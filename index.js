var http = require('http');
var express = require('express');
var cors = require('cors');
var morgan = require('morgan');
var bodyParser = require('body-parser');
// var connect = require('./src/database.js');
var routes = require('./src/routes.js');
const mongoose = require('mongoose');
require('dotenv').config()
const PORT = 3003;
//Setting Up Dynamic port allocation
const app = express();
//Creating express object
app.server = http.createServer(app);
//Create HTTP server

app.use(morgan('dev'));
//To Get Apache Log Format in Console for Handling Requests

app.use(cors({
    exposedHeaders: "*"
}));
//To Allow Cross Origin Accessability

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({ extended: true }));
//Setting Attachement Size limit

app.use('/api/v1/', routes);
//DB Connector
// Configuring the database
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});
// Turn on that server!
app.listen(PORT, () => {
    console.log('App listening on port ',PORT );
  });
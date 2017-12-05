const chalk = require('chalk');
var express = require('express');
var mosca = require('mosca')
var app = express();
var http = require('http');

// MONGODB
var MongoClient = require('mongodb').MongoClient;
var myCollection;
var db = MongoClient.connect('mongodb://woltenX:bypass9m3@ds117336.mlab.com:17336/bd_codepost', function (err, db) {
  if (err)
    throw err;
  console.log(chalk.green('MongoDB: ') + " ONLINE");
  myCollection = db.collection('smartSensor');
});


var port = 8080; // PUERTO EXPRESS
var settings = {
  port: 1883,
  http: { 
    port: 3000,
    bundle: true,
    static: './'
  }
};

var mqttserver = new mosca.Server(settings);
server = http.Server(app);
mqttserver.attachHttpServer(server);


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// START THE SERVER WEB
// =============================================================================
app.listen(port, () => {

                          console.log(chalk.white.bgBlue.bold("Servidor WEB listo en http://localhost:" + port));

                        }).on('error', (err) => 
                                                {

                                                  if(err.errno === 'EADDRINUSE')
                                                    console.log(chalk.magenta('Puerto ocupado ') + port);
                                                  else
                                                      console.log(err);
                                                });








//MOSCA
mqttserver.on('ready', setup);


mqttserver.on('clientConnected', function(client) {
  console.log(chalk.white.bgBlue.bold("\nCliente conectado id: " + client.id));
  var msg = {
    topic: "modulo/status",
    payload: client.id,
    qos: 0,
    retain: true
  }
  mqttserver.publish(msg);
});

mqttserver.on('clientDisconnected', function(client) {
  console.log(chalk.white.bgRed.bold("Cliente desconectado id: " + client.id) );

  var msg = {
    topic: "modulo/status",
    payload: client.id,
    qos: 0,
    retain: true
  }

  mqttserver.publish(msg);
});


mqttserver.on('subscribed', function(topic, client) {
  console.log(chalk.yellow("Cliente id: ") + client.id + chalk.yellow(" suscrito a ") + topic);
  
});


mqttserver.on('published', function(packet, client) {
  if (client != undefined) {
    console.log(chalk.cyan("Cliente id: ") + client.id + chalk.cyan(" publico a ") + packet.topic + chalk.cyan(" contenido: ") + Buffer(packet.payload).toString());
    /*myCollection.insert({ modulid: "doduck", description: "learn more than everyone" }, function (err, result) {
      if (err)
        throw err;

      console.log("entry saved");
    });  */  
  }
});







//FUNCIONES GLOBALES
function setup() {
  mqttserver.authenticate = authenticate;
  //mqttserver.authorizePublish = authorizePublish;
  //mqttserver.authorizeSubscribe = authorizeSubscribe;  
  console.log(chalk.green("MQTT Port: ") + settings.port);
  console.log(chalk.cyan("MQTT/WEBSOCKET Port: ") + settings.http.port);
  
}









//FUNCIONES DE AUTH
// Accepts the connection if the username and password are valid
var authenticate = function (client, username, password, callback)
{
  var authorized = (username === 'elbroker' && password.toString() === 'secreto');
  if (authorized) client.user = username;
  callback(null, authorized);
}

// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizePublish = function (client, topic, payload, callback)
{
  callback(null, client.user == topic.split('/')[1]);
}

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function (client, topic, callback)
{
  callback(null, client.user == topic.split('/')[1]);
}
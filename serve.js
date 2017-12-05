const chalk = require('chalk');

var express = require('express');
var mosca = require('mosca')
var app = express();
var http = require('http');
var port = 8080; // PUERTO EXPRESS

var settings = {
  port: 1883,
  http: { //para usar con websockets
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


// START THE SERVER
// =============================================================================
app.listen(port, () => {

  console.log(chalk.magenta('EXPRESS: ') + port);

}).on('error', (err) => {

  if(err.errno === 'EADDRINUSE')
    console.log(chalk.magenta('Puerto ocupado ') + port);
  else
      console.log(err);
});








//MOSCA list-group-item-danger
mqttserver.on('ready', function() {
  console.log(chalk.green("MQTT Port: ") + settings.port);
  console.log(chalk.cyan("MQTT/WEBSOCKET Port: ") + settings.http.port);

});


mqttserver.on('clientConnected', function(client) {
  console.log(chalk.white.bgBlue.bold("\nCliente conectado id: " + client.id));
  var msg = {
    topic: "modulo/status",
    payload: client.id,
    qos: 0,
    retain: true
  }
  //Sinc();
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
  //Sinc(client.id);
});


mqttserver.on('published', function(packet, client) {
  if (client != undefined) {
    console.log(chalk.cyan("Cliente id: ") + client.id + chalk.cyan(" publico a ") + packet.topic + chalk.cyan(" contenido: ") + Buffer(packet.payload).toString());
  }
});

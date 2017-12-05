var mosca = require('mosca')
const chalk = require('chalk');

 var settings = {
   port: 1883,
   http: { //para usar con websockets
     port: 3000,
     bundle: true,
     static: './'
   }
 };


 var mqttserver = new mosca.Server(settings);

 mqttserver.on('ready', function() {
   console.log(chalk.green("MQTT Port: ") + settings.port);
   console.log(chalk.cyan("MQTT/WEBSOCKET Port: ") + settings.http.port + "\n");

 });


 mqttserver.on('clientConnected', function(client) {
   console.log(chalk.blue("Cliente conectado id: ") + client.id + "\n");
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
   console.log(chalk.red("Cliente desconectado id: ") + client.id + "\n");

   var msg = {
     topic: "modulo/status",
     payload: client.id,
     qos: 0,
     retain: true
   }

   mqttserver.publish(msg);
 });

 mqttserver.on('subscribed', function(topic, client) {
   console.log(chalk.yellow("Cliente id: ") + client.id + chalk.yellow(" suscrito a ") + topic + "\n");
   //Sinc(client.id);
 });


 mqttserver.on('published', function(packet, client) {
   if (client != undefined) {
     console.log(chalk.cyan("Cliente id: ") + client.id + chalk.cyan(" publico a ") + packet.topic + chalk.cyan(" contenido: ") + Buffer(packet.payload).toString() + "\n");
   }
 });


 return mqttserver;

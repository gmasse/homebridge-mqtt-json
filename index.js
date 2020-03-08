var mqtt = require('mqtt')
var Service, Characteristic;

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-mqtt-json", "mqtt-json", MqttAccessory);
}

function MqttAccessory(log, config) {
  this.log = log;
  this.name = config["name"] || 'mqtt-json';
  this.url = config["url"] || false;
  this.topic = config["topic"] || false;
  this.property = config["property"] || false;

  this.client_Id = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
  this.options = {
    keepalive: 10,
    clientId: this.client_Id,
    protocolId: 'MQTT'
  };

  if (!this.url || !this.topic || !this.property) {
    this.log.error("Missing configuration parameters");
  }

  this.service = new Service.TemperatureSensor(this.name);
  this.service
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', this.getState.bind(this));

  this.log("[MQTT] Connecting to: " + this.url);
  this.client = mqtt.connect(this.url, this.options);

  this.log("[MQTT] Subscribing to: " + this.topic);
  this.client.subscribe(this.topic);

  var that = this;

	this.client.on('message', function (topic, message) {
    that.log.debug("MQTT message received for: " + topic);
    try {
      data = JSON.parse(message);
    } catch (e) {
      that.log.error("Unable to parse JSON");
      return null;
    }
		if (data === null) {
      that.log.error("Empty data");
			return null;
		}
    that.log.debug("Extracting JSON property: " + that.property);
    if (data[that.property] === null) {
      that.log.error("Property not found");
      return null;
    }
    temperature = parseFloat(data[that.property]);
    if ( isNaN(temperature) ) {
      that.log.error("Cannot convert data to float (" + data[that.property] + ")");
      return null;
    }

    that.temperature = temperature;
    that.log.debug('Sending Temperature: ' + that.temperature);
    that.service
      .getCharacteristic(Characteristic.CurrentTemperature).updateValue(that.temperature);
  });
}

MqttAccessory.prototype.getState = function(callback) {
  this.log.debug("Get Temperature Called: " + this.temperature);
	callback(null, this.temperature);
}

MqttAccessory.prototype.getServices = function() {
  // you can OPTIONALLY create an information service if you wish to override
  // the default values for things like serial number, model, etc.

  var informationService = new Service.AccessoryInformation();
  informationService
    .setCharacteristic(Characteristic.Manufacturer, "Germain Masse")
    .setCharacteristic(Characteristic.Model, "MQTT Accessory")
    .setCharacteristic(Characteristic.SerialNumber, "1234");
//    .setCharacteristic(Characteristic.FirmwareRevision, packageJSON.version);

  return [informationService, this.service];
}

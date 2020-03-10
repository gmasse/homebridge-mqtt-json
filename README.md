# homebridge-mqtt-json

This Homebridge Accessory is realtime updated via a JSON name–value pair payload published via MQTT.

Configuration with Homebridge Config UI X (recommended).

Or manually:
```
    "accessories": [
        {
            "accessory": "mqtt-json"
            "name": "MQTT Sensor",
            "url": "mqtt://mqtt.domain.com",
            "topic": "mytopic/data",
            "property": "json_param",
        }
    ],
```

Then send a MQTT message, exemple:
```
mosquitto_pub -h mqtt.domain.com -t mytopic/data \
    -m '{ "json_param": 1234.56, "comment":"other values are ignored" }'
```


## Credit
Deeply inspired from [homebridge-mqtt-temperature](https://github.com/mcchots/homebridge-mqtt-temperature).

Original code is licensed under MIT license. Copyright (c) 2016 Mohammed Chotia.
Current code is licensed under GPL 3.0. Copyright (c) 2020 Germain Masse.

/*
 * WebSocketClientSocketIOack.ino
 *
 *  Created on: 20.07.2019
 *
 */

#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>

#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <LiquidCrystal_I2C.h>

// Set the LCD address to 0x27 for a 16 chars and 2 line display
LiquidCrystal_I2C lcd(0x27, 16, 2);  

WiFiMulti WiFiMulti;
SocketIOclient socketIO;

#define USE_SERIAL Serial

const char* message = "initializing...";
bool sound = true;

int pir = 12;
int led = 2;
int buzzer = 13;
bool motion = false;

void handlePIRInterrupt(){
  motion = true;
}


void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            USE_SERIAL.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
        {
            char * sptr = NULL;
            int id = strtol((char *)payload, &sptr, 10);
            USE_SERIAL.printf("[IOc] get event: %s id: %d\n", payload, id);
            if(id) {
                payload = (uint8_t *)sptr;
            }
            DynamicJsonDocument doc(1024);
            DeserializationError error = deserializeJson(doc, payload, length);
            if(error) {
                USE_SERIAL.print(F("deserializeJson() failed: "));
                USE_SERIAL.println(error.c_str());
                return;
            }

            String eventName = doc[0];
            USE_SERIAL.printf("[IOc] event name: %s\n", eventName.c_str());

            // logic

            if(eventName.equals("setMessage")){
                          // Check if the JSON contains at least two elements
              if (doc.size() >= 2) {
                  // Retrieve the second parameter ("message")
                  // Ensure messageParam is not null
                  if (message) {
                      // Print or use the message parameter
                      message = doc[1]["message"];
                      USE_SERIAL.printf("Message parameter: %s\n", message);
                      lcd.clear();
                      lcd.print(message);
                  }
              }
            }
            if(eventName.equals("buzzer")){
              USE_SERIAL.printf("buzzer %s", payload);
              sound = (bool)doc[1];
            }

            // Message Includes a ID for a ACK (callback)
            if(id) {
                // creat JSON message for Socket.IO (ack)
                DynamicJsonDocument docOut(1024);
                JsonArray array = docOut.to<JsonArray>();

                // add payload (parameters) for the ack (callback function)
                JsonObject param1 = array.createNestedObject();
                param1["now"] = millis();

                // JSON to String (serializion)
                String output;
                output += id;
                serializeJson(docOut, output);

                // Send event
                socketIO.send(sIOtype_ACK, output);
            }
        }
            break;
        case sIOtype_ACK:
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            break;
        case sIOtype_ERROR:
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            break;
        case sIOtype_BINARY_EVENT:
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            break;
        case sIOtype_BINARY_ACK:
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            break;
    }
}

void sendUpdate(){
    uint64_t now = millis();
    // creat JSON message for Socket.IO (event)
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();
    // add evnet name
    array.add("visitorData");
    // add payload (parameters) for the event
    JsonObject param1 = array.createNestedObject();
    param1["Time"] = now;
    // array.add(message);
    // JSON to String (serializion)
    String output;
    serializeJson(doc, output);
    // Send event
    socketIO.sendEVENT(output);
    // Print JSON for debugging
    USE_SERIAL.println(output);
}

void setup() {
    //USE_SERIAL.begin(921600);
    USE_SERIAL.begin(115200);

    //Serial.setDebugOutput(true);
    USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

      for(uint8_t t = 4; t > 0; t--) {
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          delay(1000);
      }

      // Initialize the LCD
    lcd.init();                     

    // Turn on the backlight
    lcd.backlight();

    // Print a message to the LCD.
    lcd.print(message);

    WiFiMulti.addAP("spotnet", "09876543");

    //WiFi.disconnect();
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    String ip = WiFi.localIP().toString();
    USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin("192.168.116.105", 9000, "/socket.io/?EIO=4");

    // event handler
    socketIO.onEvent(socketIOEvent);

    pinMode(pir, INPUT);
    pinMode(led, OUTPUT);
    pinMode(buzzer, OUTPUT);
    attachInterrupt(digitalPinToInterrupt(pir), handlePIRInterrupt, RISING);
      
}

void loop() {
    socketIO.loop();

    if(motion){
      digitalWrite(led, HIGH);
      if(sound){
        digitalWrite(buzzer, HIGH);
      }
      sendUpdate();
      delay(1000);
      digitalWrite(led, LOW);
      digitalWrite(buzzer, LOW);
      motion = false;
    }
}

#include "config.h"
#include "storage.h"
#include "sensor.h"
#include "display.h"
#include "network.h"

AppConfig cfg;

void setup() {
  Serial.begin(115200);
  initStorage();      // Preferences NVS
  loadConfig(cfg);    // Lit deviceId et tempThreshold

  initDisplay();
  initSensors();

  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);

  setupWiFi();
  if (wifiConnected) setupWebSocket(cfg);

  Serial.printf("ID=%s, Seuil=%.1f\n", cfg.deviceId.c_str(), cfg.tempThreshold);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) WiFi.reconnect();
  webSocket.poll();

  float tPool = readPoolTemperature();
  float tOut  = readOutdoorTemperature();

  bool relayCur = digitalRead(PIN_RELAY);
  bool relayNext;
  if      (forcedState == "ON")  relayNext = true;
  else if (forcedState == "OFF") relayNext = false;
  else                            relayNext = ((tPool - tOut) <= cfg.tempThreshold);

  if (relayNext != relayCur) digitalWrite(PIN_RELAY, relayNext);

  sendSensorData(tPool, tOut, relayNext, cfg);
  updateDisplay(tPool, tOut, relayNext);

  delay(WS_SEND_INTERVAL);
}

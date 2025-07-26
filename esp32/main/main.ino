#include "config.h"
#include "storage.h"
#include "sensor.h"
#include "display.h"
#include "network.h"

AppConfig cfg;
static unsigned long lastSendTime    = 0;
static unsigned long lastDisplayTime = 0;
static float currentPoolTemp = 0.0f;
static float currentOutTemp  = 0.0f;

void setup() {
  Serial.begin(115200);
  initStorage();
  loadConfig(cfg);
  Serial.printf("[SETUP] ID=%s, Threshold=%.1f°C\n", cfg.deviceId.c_str(), cfg.tempThreshold);

  initDisplay();
  initSensors();

  // Wait for sensors to initialize (DS18B20 returns 85.0°C on power‑up)
  Serial.println("[SETUP] Waiting for sensor to be ready (temp != 85°C)...");
  unsigned long lastCheck = 0;
  while (true) {
    unsigned long now = millis();
    if (now - lastCheck >= 1000) {
      lastCheck = now;
      float tPoolInit    = readPoolTemperature();
      float tOutdoorInit = readOutdoorTemperature();
      Serial.printf("[SETUP] Raw temps: Pool=%0.1f°C, Outdoor=%0.1f°C\n", tPoolInit, tOutdoorInit);
      if (tPoolInit != 85.0f && tOutdoorInit != 85.0f) {
        Serial.println("[SETUP] Sensor ready.");
        break;
      }
    }
    yield();
  }

  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);

  setupWiFi();
  if (wifiConnected) setupWebSocket(cfg);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    Serial.println("[WIFI] reconnecting...");
  }
  webSocket.poll();

  unsigned long now = millis();

  bool refreshDisplay = false;
  if (now - lastDisplayTime >= 500) {
    lastDisplayTime = now;
    currentPoolTemp = readPoolTemperature();
    currentOutTemp  = readOutdoorTemperature();
    refreshDisplay  = true;
  }

  bool relayCur = digitalRead(PIN_RELAY);
  bool relayNext;
  if      (forcedState == "ON")  relayNext = true;
  else if (forcedState == "OFF") relayNext = false;
  else                            relayNext = ((currentPoolTemp - currentOutTemp) <= cfg.tempThreshold);

  if (relayNext != relayCur) {
    digitalWrite(PIN_RELAY, relayNext);
    Serial.printf("[RELAY] State change: %s\n", relayNext ? "ON" : "OFF");
  }

  if (refreshDisplay) {
    updateDisplay(currentPoolTemp, currentOutTemp, relayNext);
  }

  if (now - lastSendTime >= WS_SEND_INTERVAL) {
    lastSendTime = now;
    sendSensorData(currentPoolTemp, currentOutTemp, relayNext, cfg);
  }
}

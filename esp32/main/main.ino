#include "config.h"
#include "storage.h"
#include "sensor.h"
#include "display.h"
#include "network.h"

AppConfig cfg;
static unsigned long lastSendTime = 0;
static unsigned long lastLogTime  = 0;
static float lastPoolTemp         = -999.0f;
static float lastOutdoorTemp      = -999.0f;
static bool lastRelayState        = false;

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

  if (now - lastLogTime >= LOG_INTERVAL) {
    lastLogTime = now;

    lastPoolTemp    = readPoolTemperature();
    lastOutdoorTemp = readOutdoorTemperature();

    bool relayCur = digitalRead(PIN_RELAY);
    if      (forcedState == "ON")  lastRelayState = true;
    else if (forcedState == "OFF") lastRelayState = false;
    else                            lastRelayState = ((lastPoolTemp - lastOutdoorTemp) <= cfg.tempThreshold);

    if (lastRelayState != relayCur) {
      digitalWrite(PIN_RELAY, lastRelayState);
      Serial.printf("[RELAY] State change: %s\n", lastRelayState ? "ON" : "OFF");
    }

    Serial.printf("[TEMP] Pool:%0.1f°C Outdoor:%0.1f°C\n", lastPoolTemp, lastOutdoorTemp);
    updateDisplay(lastPoolTemp, lastOutdoorTemp, lastRelayState);
  }

  if (now - lastSendTime >= WS_SEND_INTERVAL) {
    lastSendTime = now;
    sendSensorData(lastPoolTemp, lastOutdoorTemp, lastRelayState, cfg);
  }
}

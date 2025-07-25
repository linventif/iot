#include <WiFi.h>
#include <ArduinoJson.h>
#include "config.h"
#include "network.h"
#include "storage.h"

using namespace websockets;

bool wifiConnected = false;
bool wsConnected   = false;
WebsocketsClient webSocket;
String forcedState = "AUTO";
static AppConfig *currentCfg;

// Messages entrants via WS
static void onMessageCallback(WebsocketsMessage msg) {
  Serial.printf("[WS RX] %s\n", msg.data().c_str());
  DynamicJsonDocument doc(256);
  if (deserializeJson(doc, msg.data())) {
    Serial.println("[WS RX] JSON parse error");
    return;
  }
  const char *type = doc["type"];

  if (strcmp(type, CMD_TYPE_UPDATE_CFG) == 0) {
    bool changed = false;
    if (doc.containsKey(CFG_KEY_TEMP_THRESHOLD)) {
      float newTh = doc[CFG_KEY_TEMP_THRESHOLD];
      Serial.printf("[CONFIG] tempThreshold → %.1f\n", newTh);
      currentCfg->tempThreshold = newTh;
      changed = true;
    }
    if (doc.containsKey(CFG_KEY_DEVICE_ID)) {
      String newId = doc[CFG_KEY_DEVICE_ID].as<const char*>();
      Serial.printf("[CONFIG] deviceId → %s\n", newId.c_str());
      currentCfg->deviceId = newId;
      changed = true;
    }
    if (changed) saveConfig(*currentCfg);
  } else if (strcmp(type, CMD_TYPE_FORCE_RELAY) == 0) {
    forcedState = doc[CMD_KEY_FORCE_STATE].as<const char*>();
    Serial.printf("[RELAY] forcedState → %s\n", forcedState.c_str());
  }
}

// Événements WS
static void onEventsCallback(WebsocketsEvent event, String) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("[WS EVENT] ConnectionOpened");
    DynamicJsonDocument doc(256);
    doc["type"]                = CMD_TYPE_CURRENT_CFG;
    doc[CFG_KEY_DEVICE_ID]      = currentCfg->deviceId;
    doc[CFG_KEY_TEMP_THRESHOLD] = currentCfg->tempThreshold;
    doc[CMD_KEY_FORCE_STATE]    = forcedState;
    String out; serializeJson(doc, out);
    webSocket.send(out);
    Serial.printf("[WS TX] %s\n", out.c_str());
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("[WS EVENT] ConnectionClosed");
  }
}

void setupWiFi() {
  Serial.printf("[WIFI] Connecting to %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < WIFI_CONNECT_TIMEOUT) {
    delay(1000);
    Serial.print('.');
  }
  wifiConnected = (WiFi.status() == WL_CONNECTED);
  Serial.printf("[WIFI] %s\n", wifiConnected ? "Connected" : "Failed");
}

void setupWebSocket(AppConfig &cfg) {
  currentCfg = &cfg;
  webSocket.onMessage(onMessageCallback);
  webSocket.onEvent(onEventsCallback);
  wsConnected = webSocket.connect(CONFIG_WS_HOST);
  Serial.printf("[WS] connect() → %s\n", wsConnected ? "success" : "fail");
}

void sendSensorData(float poolTemp, float outTemp, bool relayState, const AppConfig &cfg) {
  if (!wsConnected) {
    Serial.println("[WS TX] skipped, not connected");
    return;
  }
  DynamicJsonDocument doc(256);
  doc["type"]               = "sensor_data";
  doc[CFG_KEY_DEVICE_ID]    = cfg.deviceId;
  doc["poolTemp"]           = poolTemp;
  doc["outTemp"]            = outTemp;
  doc["relayState"]         = relayState;
  doc[CMD_KEY_FORCE_STATE]  = forcedState;
  String out; serializeJson(doc, out);
  webSocket.send(out);
  Serial.printf("[WS TX] %s\n", out.c_str());
}

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

static void onMessageCallback(WebsocketsMessage msg) {
  DynamicJsonDocument doc(256);
  if (deserializeJson(doc, msg.data())) return;
  const char *type = doc["type"];

  if (strcmp(type, CMD_TYPE_UPDATE_CFG) == 0) {
    bool changed = false;
    if (doc.containsKey(CFG_KEY_TEMP_THRESHOLD)) {
      currentCfg->tempThreshold = doc[CFG_KEY_TEMP_THRESHOLD];
      changed = true;
    }
    if (doc.containsKey(CFG_KEY_DEVICE_ID)) {
      currentCfg->deviceId = doc[CFG_KEY_DEVICE_ID].as<const char*>();
      changed = true;
    }
    if (changed) saveConfig(*currentCfg);
  }
  else if (strcmp(type, CMD_TYPE_FORCE_RELAY) == 0) {
    forcedState = doc[CMD_KEY_FORCE_STATE].as<const char*>();
  }
}

static void onEventsCallback(WebsocketsEvent event, String) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    DynamicJsonDocument doc(256);
    doc["type"]                = CMD_TYPE_CURRENT_CFG;
    doc[CFG_KEY_DEVICE_ID]      = currentCfg->deviceId;
    doc[CFG_KEY_TEMP_THRESHOLD] = currentCfg->tempThreshold;
    doc[CMD_KEY_FORCE_STATE]    = forcedState;
    String out; serializeJson(doc, out);
    webSocket.send(out);
  }
}

void setupWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < WIFI_CONNECT_TIMEOUT) {
    delay(1000);
  }
  wifiConnected = (WiFi.status() == WL_CONNECTED);
}

void setupWebSocket(AppConfig &cfg) {
  currentCfg = &cfg;
  webSocket.onMessage(onMessageCallback);
  webSocket.onEvent(onEventsCallback);
  wsConnected = webSocket.connect(CONFIG_WS_HOST);
}

void sendSensorData(float poolTemp, float outTemp, bool relayState, const AppConfig &cfg) {
  if (!wsConnected) return;
  DynamicJsonDocument doc(256);
  doc["type"]               = "sensor_data";
  doc[CFG_KEY_DEVICE_ID]    = cfg.deviceId;
  doc["poolTemp"]           = poolTemp;
  doc["outTemp"]            = outTemp;
  doc["relayState"]         = relayState;
  doc[CMD_KEY_FORCE_STATE]  = forcedState;
  String out; serializeJson(doc, out);
  webSocket.send(out);
}

#ifndef NETWORK_H
#define NETWORK_H

#include <ArduinoWebsockets.h>
#include "storage.h"

extern bool wifiConnected;
extern bool wsConnected;
extern websockets::WebsocketsClient webSocket;
extern String forcedState; // "ON", "OFF", "AUTO"

void setupWiFi();
void setupWebSocket(AppConfig &cfg);
void sendSensorData(float poolTemp, float outTemp, bool relayState, const AppConfig &cfg);

#endif // NETWORK_H

#ifndef CONFIG_H
#define CONFIG_H

#include <ArduinoJson.h>

// Clés JSON et Preferences
#define CFG_KEY_DEVICE_ID      "deviceId"
#define CFG_KEY_TEMP_THRESHOLD "tempThreshold"

// Commandes WS
#define CMD_KEY_TYPE           "type"
#define CMD_TYPE_UPDATE_CFG    "update_config"
#define CMD_TYPE_FORCE_RELAY   "force_relay"
#define CMD_TYPE_CURRENT_CFG   "current_config"
#define CMD_KEY_FORCE_STATE    "forceState"  // "ON","OFF","AUTO"

// Valeurs par défaut
#define DEFAULT_DEVICE_ID      "arduino-pool-monitor-001"
#define DEFAULT_TEMP_THRESHOLD 2.0

// Configuration WiFi
#define WIFI_SSID              "VotreNomWiFi"
#define WIFI_PASSWORD          "VotreMotDePasseWiFi"

// Configuration WebSocket
#define CONFIG_WS_HOST         "wss://votre-serveur.com:4000/api/ws"

// Pins capteurs et relais
#define PIN_POOL_SENSOR        4    // DS18B20 piscine
#define PIN_OUTDOOR_SENSOR     18   // DS18B20 extérieur
#define PIN_RELAY              5    // Relais pompe

// Configuration I2C LCD (ESP32)
#define LCD_SDA                21
#define LCD_SCL                22
#define LCD_ADDRESS            0x3F

// Résolution et seuil température
#define TEMP_PRECISION         12   // Bits (9 à 12)

// Intervalles et timeouts
#define WIFI_CONNECT_TIMEOUT   20     // secondes
#define WS_SEND_INTERVAL       30000  // millisecondes

#endif // CONFIG_H
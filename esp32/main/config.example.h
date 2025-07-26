#ifndef CONFIG_H
#define CONFIG_H

#include <ArduinoJson.h>

// Clés JSON et Preferences
#define CFG_KEY_DEVICE_ID      "id"
#define CFG_KEY_TEMP_THRESHOLD "tempThreshold"
#define CFG_KEY_TEMP_THRESHOLD_ANTIBACK "tempThresholdAntiback"

// Commandes WS
#define CMD_KEY_TYPE           "type"
#define CMD_TYPE_UPDATE_CFG    "update_config"
#define CMD_TYPE_FORCE_RELAY   "force_relay"
#define CMD_TYPE_CURRENT_CFG   "current_config"
#define CMD_KEY_FORCE_STATE    "forceState"  // "ON","OFF","AUTO"

// Valeurs par défaut
#define DEFAULT_DEVICE_ID      "esp32-pool-monitor"
#define DEFAULT_TEMP_THRESHOLD 2.0
#define DEFAULT_TEMP_THRESHOLD_ANTIBACK 0.5

// Configuration WiFi
#define WIFI_SSID              "ecreall_wifi"
#define WIFI_PASSWORD          "L3r345w1f1d3sL45n47"

// Configuration WebSocket
#define CONFIG_WS_HOST         "ws://192.168.1.69:4001/api/ws"

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
#define LOG_INTERVAL           1000   // intervalle journalisation/affichage (ms)

#endif // CONFIG_H

#ifndef CONFIG_H
#define CONFIG_H

// Configuration WiFi (alpha-numeric characters only)
#define CONFIG_WIFI_SSID "VotreNomWiFi"
#define CONFIG_WIFI_PASSWORD "VotreMotDePasseWiFi"

// Configuration WebSocket
#define CONFIG_WS_HOST "votre-serveur.com"
#define CONFIG_WS_PORT 4000
#define CONFIG_WS_PATH "/api/ws"
#define CONFIG_DEVICE_ID "arduino-pool-monitor-001"

// Configuration des pins
#define PIN_POOL_SENSOR 4        // GPIO4 pour capteur piscine
#define PIN_OUTDOOR_SENSOR 18    // GPIO18 pour capteur extérieur
#define PIN_RELAY 5              // GPIO5 pour relais

// Configuration I2C LCD (ESP32)
#define LCD_SDA 21               // GPIO21 - SDA
#define LCD_SCL 22               // GPIO22 - SCL
#define LCD_ADDRESS 0x27         // Adresse I2C du LCD

// Configuration température
#define TEMP_PRECISION 12        // Précision capteurs DS18B20 (9-12 bits)
#define TEMP_DIFF_THRESHOLD 2.0  // Seuil différence température (°C)

// Configuration réseau
#define WIFI_CONNECT_TIMEOUT 20  // Timeout connexion WiFi (secondes)
#define WS_SEND_INTERVAL 30000   // Intervalle envoi données WebSocket (ms)

#endif

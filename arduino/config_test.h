#ifndef CONFIG_H
#define CONFIG_H

// Configuration WiFi - TEST temporaire
#define CONFIG_WIFI_SSID "Raspberry"
#define CONFIG_WIFI_PASSWORD "testpassword"  // Mot de passe simple pour test

// Configuration WebSocket
// For local testing (uncomment these lines and comment production lines)
#define CONFIG_WS_HOST "10.42.0.1"  // Your computer's IP (check with 'ip addr' or 'ifconfig')
#define CONFIG_WS_PORT 4001
#define CONFIG_WS_PATH "/api/ws"

// For production (comment these lines when testing locally)
// #define CONFIG_WS_HOST "iot.linv.dev"
// #define CONFIG_WS_PORT 443
// #define CONFIG_WS_PATH "/api/ws"

#define CONFIG_DEVICE_ID "arduino-pool-monitor-001"

// Configuration des pins
#define PIN_POOL_SENSOR 4        // GPIO4 pour capteur piscine
#define PIN_OUTDOOR_SENSOR 18    // GPIO18 pour capteur extérieur
#define PIN_RELAY 5              // GPIO5 pour relais

// Configuration I2C LCD (ESP32)
#define LCD_SDA 21               // GPIO21 - SDA
#define LCD_SCL 22               // GPIO22 - SCL
#define LCD_ADDRESS 0x3F         // Adresse I2C du LCD (essayer 0x3F si 0x27 ne fonctionne pas)

// Configuration température
#define TEMP_PRECISION 12        // Précision capteurs DS18B20 (9-12 bits)
#define TEMP_DIFF_THRESHOLD 5.0  // Seuil différence température (°C)

// Configuration réseau
#define WIFI_CONNECT_TIMEOUT 20  // Timeout connexion WiFi (secondes)
#define WS_SEND_INTERVAL 30000   // Intervalle envoi données WebSocket (ms)

#endif

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
#include "config.h"

using namespace websockets;

// Passe l'adresse à 0x3F (et non 0x27)
LiquidCrystal_I2C lcd(LCD_ADDRESS, 16, 2);

// Configuration sondes de température DS18B20
OneWire oneWirePool(PIN_POOL_SENSOR);
OneWire oneWireOutdoor(PIN_OUTDOOR_SENSOR);
DallasTemperature sensorPool(&oneWirePool);
DallasTemperature sensorOutdoor(&oneWireOutdoor);

// Variables WiFi et WebSocket
WebsocketsClient webSocket;
unsigned long lastDataSend = 0;
bool wifiConnected = false;
bool wsConnected = false;
bool lcdConnected = false;

unsigned long dernierTemps = 0;
float tempPool = 0.0;
float tempOutdoor = 0.0;
bool relayState = false;

// Fonction de connexion WiFi
void setupWiFi() {
  Serial.println("Connexion WiFi...");
  WiFi.begin(CONFIG_WIFI_SSID, CONFIG_WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connecté!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    wifiConnected = true;
    
    // Affichage sur LCD si connecté
    if (lcdConnected) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.printf("WiFi Connected!");
      lcd.setCursor(0, 1);
      lcd.printf("IP:%s", WiFi.localIP().toString().c_str());
      delay(2000);
    }
  } else {
    Serial.println("\nErreur: Impossible de se connecter au WiFi");
    wifiConnected = false;
    
    // Affichage d'erreur sur LCD si connecté
    if (lcdConnected) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.printf("WiFi Error!");
      lcd.setCursor(0, 1);
      lcd.printf("Check config");
      delay(2000);
    }
  }
}

// Callback WebSocket pour les messages
void onMessageCallback(WebsocketsMessage message) {
  Serial.printf("WebSocket reçu: %s\n", message.data().c_str());
  handleWebSocketMessage(message.data().c_str());
}

// Callback WebSocket pour les événements
void onEventsCallback(WebsocketsEvent event, String data) {
  if(event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("WebSocket Connected!");
    wsConnected = true;
    
    // Affichage sur LCD si connecté
    if (lcdConnected) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.printf("WS Connected!");
      delay(1000);
    }
    
    // Envoyer un message de test
    sendTestMessage();
  } else if(event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("WebSocket Disconnected");
    wsConnected = false;
    
    // Affichage sur LCD si connecté
    if (lcdConnected) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.printf("WS Disconnected");
      delay(1000);
    }
  } else if(event == WebsocketsEvent::GotPing) {
    Serial.println("WebSocket Ping reçu");
  } else if(event == WebsocketsEvent::GotPong) {
    Serial.println("WebSocket Pong reçu");
  }
}

// Gestion des messages WebSocket reçus
void handleWebSocketMessage(const char* message) {
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (error) {
    Serial.println("Erreur parsing JSON WebSocket");
    return;
  }
  
  const char* type = doc["type"];
  const char* msg = doc["message"];
  
  if (strcmp(type, "connection") == 0) {
    Serial.println("Connexion WebSocket confirmée par le serveur");
    if (lcdConnected) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.printf("WS Ready!");
      delay(1000);
    }
  } else if (strcmp(type, "hello_response") == 0) {
    Serial.println("Test WebSocket réussi!");
    if (lcdConnected) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.printf("WS Test OK!");
      delay(1000);
    }
  } else if (strcmp(type, "sensor_response") == 0) {
    Serial.println("Données capteurs reçues par le serveur");
  } else if (strcmp(type, "error") == 0) {
    Serial.printf("Erreur serveur: %s\n", msg);
  }
}

// Configuration WebSocket
void setupWebSocket() {
  if (!wifiConnected) {
    Serial.println("WiFi non connecté, impossible de configurer WebSocket");
    return;
  }
  
  // Configuration des callbacks
  webSocket.onMessage(onMessageCallback);
  webSocket.onEvent(onEventsCallback);
  
  Serial.printf("Connexion WebSocket à: %s\n", CONFIG_WS_HOST);
  
  // Connexion WebSocket
  bool connected = webSocket.connect(CONFIG_WS_HOST);
  if(connected) {
    Serial.println("WebSocket configuré avec succès");
  } else {
    Serial.println("Erreur connexion WebSocket");
    wsConnected = false;
  }
}

// Test de connexion WebSocket
void sendTestMessage() {
  if (!wsConnected) {
    Serial.println("WebSocket non connecté");
    return;
  }
  
  JsonDocument doc;
  doc["type"] = "hello";
  doc["message"] = "Hello from Arduino!";
  doc["deviceId"] = CONFIG_DEVICE_ID;
  doc["timestamp"] = millis();
  doc["wifiSignal"] = WiFi.RSSI();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  webSocket.send(jsonString);
  Serial.println("Message de test WebSocket envoyé");
}

// Envoi des données de capteurs via WebSocket
void sendSensorDataToWebSocket() {
  if (!wsConnected) {
    Serial.println("WebSocket non connecté, impossible d'envoyer les données");
    return;
  }
  
  JsonDocument doc;
  doc["type"] = "sensor_data";
  doc["tempPool"] = tempPool;
  doc["tempOutdoor"] = tempOutdoor;
  doc["relayState"] = relayState;
  doc["deviceId"] = CONFIG_DEVICE_ID;
  doc["timestamp"] = millis();
  doc["wifiSignal"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["uptime"] = millis() / 1000;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  webSocket.send(jsonString);
  Serial.println("Données capteurs envoyées via WebSocket");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("=== Pool Monitor Démarrage ===");
  
  // Initialisation I2C sur ESP32 (SDA=21, SCL=22)
  Wire.begin(LCD_SDA, LCD_SCL);
  Wire.setClock(100000);       // fixe à 100 kHz pour plus de stabilité

  // Test de l'adresse LCD
  Serial.printf("Test LCD à l'adresse 0x%02X...\n", LCD_ADDRESS);
  Wire.beginTransmission(LCD_ADDRESS);
  byte error = Wire.endTransmission();
  
  bool lcdConnected = (error == 0);
  if (lcdConnected) {
    Serial.println("LCD détecté avec succès!");
    
    // Initialisation LCD
    lcd.init();
    lcd.backlight();
    
    lcd.setCursor(0, 0);
    lcd.printf("Pool Monitor");
    lcd.setCursor(0, 1);
    lcd.printf("Initialisation...");
  } else {
    Serial.printf("ERREUR: LCD non trouvé à 0x%02X\n", LCD_ADDRESS);
    Serial.println("Adresses communes à tester: 0x27, 0x3F, 0x20");
    Serial.println("Lancez i2c_scanner.ino pour identifier l'adresse");
  }
  
  // Sauvegarder l'état LCD globalement
  ::lcdConnected = lcdConnected;
  
  // Initialisation capteurs température
  sensorPool.begin();
  sensorOutdoor.begin();
  
  // Configuration des résolutions
  sensorPool.setResolution(TEMP_PRECISION);
  sensorOutdoor.setResolution(TEMP_PRECISION);
  
  // Configuration pin relais en sortie
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW); // Relais éteint au démarrage (sécurité)
  
  // Connexion WiFi
  setupWiFi();
  
  // Configuration WebSocket
  if (wifiConnected) {
    setupWebSocket();
  }
  
  Serial.println("Système initialisé!");
  delay(1000);
}

void loop() {
  unsigned long now = millis();
  if (now - dernierTemps < 2000) return;  // toutes les 2 secondes
  unsigned long dt_ms = now - dernierTemps;
  dernierTemps = now;

  // Lecture capteurs de température
  sensorPool.requestTemperatures();
  sensorOutdoor.requestTemperatures();
  delay(100); // Attendre la conversion
  tempPool = sensorPool.getTempCByIndex(0);
  tempOutdoor = sensorOutdoor.getTempCByIndex(0);

  // Vérification de la validité des températures
  if (tempPool == DEVICE_DISCONNECTED_C || tempPool == -127.0) {
    Serial.println("ERREUR: Capteur piscine déconnecté ou défaillant");
    tempPool = -999.0; // Valeur d'erreur
  }
  
  if (tempOutdoor == DEVICE_DISCONNECTED_C || tempOutdoor == -127.0) {
    Serial.println("ERREUR: Capteur extérieur déconnecté ou défaillant");
    tempOutdoor = -999.0; // Valeur d'erreur
  }

  // Affichage série
  Serial.printf("Piscine: %5.2fC | Extérieur: %5.2fC\n", tempPool, tempOutdoor);

  // Calcul de la différence et contrôle du relais
  float tempDifference = tempPool - tempOutdoor; // Différence signée (peut être négative)
  float absDifference = abs(tempDifference);
  
  // Le relais ne se déclenche que si la piscine est plus FROIDE que l'extérieur
  // (pour activer un chauffage ou une circulation)
  bool shouldActivateRelay = (tempDifference <= -TEMP_DIFF_THRESHOLD) && 
                             (tempPool != -999.0) && (tempOutdoor != -999.0);
  
  if (shouldActivateRelay != relayState) {
    relayState = shouldActivateRelay;
    
    // Activation/désactivation avec logique normale (active HIGH)
    if (relayState) {
      digitalWrite(PIN_RELAY, HIGH);  // ACTIVATION = HIGH
      Serial.printf("Pompe ACTIVÉE - Piscine plus froide: %5.2fC < Extérieur: %5.2fC (Diff: %5.2fC)\n", 
                    tempPool, tempOutdoor, tempDifference);
    } else {
      digitalWrite(PIN_RELAY, LOW);   // DÉSACTIVATION = LOW (sécurisé)
      Serial.printf("Pompe DÉSACTIVÉE - Conditions normales (Diff: %5.2fC)\n", tempDifference);
    }
    
    // Vérification de l'état
    int pinState = digitalRead(PIN_RELAY);
    Serial.printf("État GPIO %d: %s -> Pompe %s\n", 
                  PIN_RELAY, pinState ? "HIGH (3.3V)" : "LOW (0V)", 
                  pinState ? "ACTIVÉE" : "DÉSACTIVÉE");
  }

  // Vérifier la connexion WiFi
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    wsConnected = false;
    Serial.println("WiFi déconnecté, tentative de reconnexion...");
    WiFi.reconnect();
  } else {
    wifiConnected = true;
    
    // Reconfigurer WebSocket si nécessaire
    if (!wsConnected) {
      setupWebSocket();
    }
  }
  
  // Maintenir la connexion WebSocket
  webSocket.poll();
  
  // Envoyer les données via WebSocket selon l'intervalle configuré
  if (wsConnected && (millis() - lastDataSend >= WS_SEND_INTERVAL)) {
    sendSensorDataToWebSocket();
    lastDataSend = millis();
  }

  // Affichage LCD si connecté
  if (lcdConnected) {
    lcd.clear();
    lcd.setCursor(0, 0);
    
    // Première ligne: Température piscine et état relais
    if (tempPool == -999.0) {
      lcd.printf("Pool: ERROR!");
    } else {
      lcd.printf("Pool:%3.1fC %s", tempPool, relayState ? "ON" : "OFF");
    }
    
    // Deuxième ligne: Température extérieur et différence
    lcd.setCursor(0, 1);
    if (tempOutdoor == -999.0) {
      lcd.printf("Out: ERROR!");
    } else {
      float diff = tempPool - tempOutdoor; // Différence signée
      lcd.printf("Out:%4.1fC D:%+2.1f", tempOutdoor, diff);
    }
  }
}

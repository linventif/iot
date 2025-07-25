#ifndef STORAGE_MODULE_H
#define STORAGE_MODULE_H

#include <Preferences.h>

struct AppConfig {
  String deviceId;
  float tempThreshold;
};

void initStorage();
bool loadConfig(AppConfig &cfg);
bool saveConfig(const AppConfig &cfg);

#endif // STORAGE_MODULE_H

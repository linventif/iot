#include "storage.h"
#include "config.h"

static Preferences prefs;

void initStorage() {
  prefs.begin("config", false);
}

bool loadConfig(AppConfig &cfg) {
  cfg.deviceId      = prefs.getString(CFG_KEY_DEVICE_ID, DEFAULT_DEVICE_ID);
  cfg.tempThreshold = prefs.getFloat(CFG_KEY_TEMP_THRESHOLD, DEFAULT_TEMP_THRESHOLD);
  cfg.tempThresholdAntiback = prefs.getFloat(CFG_KEY_TEMP_THRESHOLD_ANTIBACK, DEFAULT_TEMP_THRESHOLD_ANTIBACK);
  return true;
}

bool saveConfig(const AppConfig &cfg) {
  prefs.putString(CFG_KEY_DEVICE_ID, cfg.deviceId);
  prefs.putFloat(CFG_KEY_TEMP_THRESHOLD, cfg.tempThreshold);
  prefs.putFloat(CFG_KEY_TEMP_THRESHOLD_ANTIBACK, cfg.tempThresholdAntiback);
  return true;
}

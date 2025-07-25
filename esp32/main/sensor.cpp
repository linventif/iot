#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"
#include "sensor.h"

static OneWire oneWirePool(PIN_POOL_SENSOR);
static DallasTemperature sensorsPool(&oneWirePool);
static OneWire oneWireOutdoor(PIN_OUTDOOR_SENSOR);
static DallasTemperature sensorsOutdoor(&oneWireOutdoor);

void initSensors() {
  sensorsPool.begin();
  sensorsOutdoor.begin();
  sensorsPool.setResolution(TEMP_PRECISION);
  sensorsOutdoor.setResolution(TEMP_PRECISION);
}

float readPoolTemperature() {
  sensorsPool.requestTemperatures();
  float t = sensorsPool.getTempCByIndex(0);
  Serial.printf("[SENSOR] Pool temp: %0.1f°C\n", t);
  return (t == DEVICE_DISCONNECTED_C) ? -999.0 : t;
}

float readOutdoorTemperature() {
  sensorsOutdoor.requestTemperatures();
  float t = sensorsOutdoor.getTempCByIndex(0);
  Serial.printf("[SENSOR] Outdoor temp: %0.1f°C\n", t);
  return (t == DEVICE_DISCONNECTED_C) ? -999.0 : t;
}

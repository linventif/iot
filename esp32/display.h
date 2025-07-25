#ifndef DISPLAY_H
#define DISPLAY_H

#include <LiquidCrystal_I2C.h>

extern LiquidCrystal_I2C lcd;
void initDisplay();
void updateDisplay(float tempPool, float tempOutdoor, bool relayState);

#endif // DISPLAY_H

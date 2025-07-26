#include "display.h"
#include "config.h"
#include <Wire.h>

// Initialisation et gestion de l'afficheur LCD I2C
LiquidCrystal_I2C lcd(LCD_ADDRESS, 16, 2);

void initDisplay() {
  Wire.begin(LCD_SDA, LCD_SCL);
  Wire.setClock(100000);
  lcd.init();
  lcd.backlight();
  lcd.clear();
}

void updateDisplay(float tempPool, float tempOutdoor, bool relayState) {
  lcd.setCursor(0, 0);
  lcd.print("                "); // Efface la ligne 0 (16 espaces)
  lcd.setCursor(0, 0);
  if (tempPool < -100) lcd.print("Pool: ERR");
  else                lcd.printf("Pool:%3.1fC %s", tempPool, relayState ? "ON" : "OFF");

  lcd.setCursor(0, 1);
  lcd.print("                "); // Efface la ligne 1 (16 espaces)
  lcd.setCursor(0, 1);
  if (tempOutdoor < -100) lcd.print("Out: ERR");
  else {
    float diff = tempPool - tempOutdoor;
    lcd.printf("Out:%4.1fC D:%+2.1f", tempOutdoor, diff);
  }
}

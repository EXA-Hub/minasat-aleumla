#!/bin/bash

CHOICE=$(whiptail --title "Menu" --menu "Use arrow keys to choose an option:" 15 50 3 \
"API" "Run API tests" \
"App" "Start React app" \
"Quit" "Exit the script" 3>&1 1>&2 2>&3)

case $CHOICE in
  "API")
    cd api
    npm test
    ;;
  "App")
    cd react-app
    npm run dev
    ;;
  "Quit")
    echo "Exiting..."
    ;;
  *)
    echo "Invalid option."
    ;;
esac

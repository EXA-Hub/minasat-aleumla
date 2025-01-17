#!/bin/bash

CHOICE=$(whiptail --title "Menu" --menu "Use arrow keys to choose an option:" 15 50 3 \
"API" "Run API tests" \
"Server" "Run server tests" \
"App" "Start React app" \
"API (Vercel)" "Run API tests (Vercel)" \
"Scripts" "Execute some scripts and commands" \
"Quit" "Exit the script" 3>&1 1>&2 2>&3)

case $CHOICE in
  "Server")
    cd server
    npm run dev
    ;;
  "API")
    cd api
    npm test
    ;;
  "App")
    cd app
    npm run dev
    ;;
  "API (Vercel)")
    cd api
    npm run vercel-dev
    ;;
  "Scripts")
    cd scripts
    npm run start
    ;;
  "Quit")
    echo "Exiting..."
    ;;
  *)
    echo "Invalid option."
    ;;
esac

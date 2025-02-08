#!/bin/bash

# Log the start of the script
echo "Starting npm install with --force"

# Navigate to the application directory
cd /var/app/staging || exit

# Run npm install with the --force flag
npm i --save-dev @types/express

# Log the completion of the script
echo "Completed npm install with --force"

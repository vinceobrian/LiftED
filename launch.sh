#!/bin/bash

echo "Starting LiftED - Student Crowdfunding Platform..."
echo ""
echo "Opening in your default browser..."
echo ""

# Check if npm is available
if command -v npm &> /dev/null; then
    echo "Using npm to start the server..."
    npm start
else
    echo "npm not found, opening index.html directly..."
    if command -v xdg-open &> /dev/null; then
        xdg-open index.html
    elif command -v open &> /dev/null; then
        open index.html
    else
        echo "Please open index.html in your web browser"
    fi
fi

echo ""
echo "LiftED is now running!"
echo "If the browser didn't open automatically, navigate to:"
echo "http://localhost:3000"
echo ""

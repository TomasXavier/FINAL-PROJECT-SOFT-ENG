#!/bin/bash

echo "🚀 Setting up TireSupply Pro Database..."

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "Download from: https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your database credentials."
    echo "Copy .env.example to .env and update the values."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo "📊 Creating database and tables..."

# Run the SQL schema
mysql -u"$DB_USER" -p"$DB_PASSWORD" < database_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    echo "🎯 You can now run 'npm start' to launch the application."
else
    echo "❌ Database setup failed. Please check your MySQL credentials and try again."
    exit 1
fi
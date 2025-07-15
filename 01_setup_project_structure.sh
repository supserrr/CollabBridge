#!/bin/bash

# CollabBridge - Project Structure Setup
echo "🚀 Setting up CollabBridge project structure..."

# Create main project directory
mkdir -p collabbridge-project
cd collabbridge-project

# Create backend structure
echo "📦 Creating backend structure..."
mkdir -p backend/{src/{controllers,middleware,routes,config,utils,types,services},prisma,tests,docs}
mkdir -p backend/src/{controllers,middleware,routes,config,utils,types,services}

# Create frontend structure
echo "🎨 Creating frontend structure..."
mkdir -p frontend/{src/{components,pages,layouts,stores,utils,types,constants,hooks,services},public/{images,icons}}
mkdir -p frontend/src/components/{ui,layout,forms,common}
mkdir -p frontend/src/pages/{auth,dashboard,events,professionals,messages}
mkdir -p frontend/public/{images,icons,fonts}

# Create root level files
echo "📄 Creating root configuration files..."
touch README.md
touch .gitignore
touch docker-compose.yml
touch DEPLOYMENT.md

# Create backend files
echo "🔧 Creating backend files..."
cd backend
touch {.env.example,.gitignore,Dockerfile,render.yaml}
touch src/server.ts
touch src/app.ts
touch prisma/{schema.prisma,seed.ts}
touch tests/setup.ts

# Create frontend files  
echo "🎨 Creating frontend files..."
cd ../frontend
touch {.env.example,.gitignore,astro.config.mjs,tailwind.config.mjs,tsconfig.json}
touch src/env.d.ts

# Return to project root
cd ..

echo "✅ Project structure created successfully!"
echo ""
echo "📁 Project structure:"
tree -I 'node_modules|dist|.git' . || ls -la

echo ""
echo "🔥 Next steps:"
echo "1. Run ./02_setup_backend.sh"
echo "2. Run ./03_setup_frontend.sh" 
echo "3. Run ./04_setup_configs.sh"
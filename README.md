# Author view App

A simple full-stack **REACT** , Node.js + MongoDB application with Docker support.

---

## Features

- Node-based content structure with support for creating, updating, and deleting nodes
- Hierarchical tree view for organizing content in parent-child relationships
- Inline renaming of nodes for quick editing and better organization
- Rich text editing capabilities including formatting options like bold, italic, headings, and lists
- Image insertion support within content blocks
- Notion-like document editor experience with block-based structure
- Dynamic workspace system for managing multiple document trees
- Theme toggling (light/dark mode) for better usability and personalization
- Smooth navigation between nested nodes and leaf content

---

##  Tech Stack

- Backend: Node.js, Express, TypeScript
- Database: MongoDB
- FrontEnd: ReactJs , TypeScript 
- Containerization: Docker, Docker Compose

# How to Run

### 1. Clone the repository

```bash
git clone https://github.com/gouthamk29/authoring-view.git
cd author-app
```

### 2. Create environment file

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update values if needed:

```env

# backend .env 
PORT=8000
FRONTEND_PORT=5173
MONGO_URI=mongodb://mongo:27017/auth-view
JWT_SECRET=your_secret_key_here
```
```env
# frontend .env 
VITE_BACKEND_URL= http://localhost:8000
```

### 3. Run the project using Docker
```bash
  docker compose up --build
```
### 4. Open the application

- Frontend App: http://localhost:5173/
- Backend API: http://localhost:8000

### 5. Stop the project

```bash
docker compose down
```

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add ..."`
4. Push to the branch and open a pull request

---

## License

MIT License — add a LICENSE file if you publish the project.


# 👗🧠 AI-Driven Smart Wardrobe

The AI-Driven Smart Wardrobe is an intelligent web app that recommends stylish outfit combinations based on your wardrobe, current weather, and event context. It uses advanced AI models like Google Gemini and Stability AI to generate outfit insights and visuals. The app supports Google login and stores your wardrobe securely with MongoDB.

---

## 🚀 Features

- Upload and tag images of your clothes  
- Weather-aware outfit suggestions using Weather API  
- Event-based styling (casual, party, formal, etc.)  
- AI outfit analysis via Google Gemini  
- AI-generated visuals via Stability AI  
- Google OAuth login  
- MongoDB database for persistent storage  

---

## 🛠️ Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Stability_AI-FF0072?style=for-the-badge&logo=stable-diffusion&logoColor=white" />
  <img src="https://img.shields.io/badge/Weather_API-00BFFF?style=for-the-badge&logo=cloud&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</div>

---

## ⚙️ Setup

```bash
git clone https://github.com/your-username/ai-driven-smart-wardrobe.git
cd ai-driven-smart-wardrobe
npm install
```
## In .env file
STABILITY_API_KEY=your_stability_api_key
GEMINI_API_KEY=your_gemini_api_key
WEATHER_API_KEY=your_weather_api_key
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=any_random_secret
NEXTAUTH_URL=http://localhost:3000

Update the Stability API key manually inside:

app/api/outfit/route.ts

app/api/outfit/generate-image.ts

app/api/test-outfit/route.ts

after then simply run
npm run dev
Visit: http://localhost:3000

📌 Roadmap
Outfit planner with calendar

Mobile version with React Native

AI learning based on outfit history

Social media sharing

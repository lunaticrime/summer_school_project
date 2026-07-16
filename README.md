# AthenAI - Personalized Learning Path (MVP)

Welcome to the **AthenAI** (formerly Fusion AI) MVP repository. This project is a hackathon prototype developed for the AUI AI Summer School 2026. 

AthenAI is an AI-powered personalized learning platform that detects student skill gaps, generates targeted review plans, and allows teachers to review, modify, and validate these plans.

## Project Structure

This repository contains two main parts:
1. **Frontend (`/frontend`)**: A Next.js 14 App Router application containing the graphical interface for Students, Teachers, and Administrators. It includes mock data and a Groq-powered AI integration for the demo.
2. **Architecture Documentation**: Contains the system design and JSON contracts (`Architecture_MVP_Personalized_Learning_Path_Fusion_AI.pdf` and `Architecture_MVP.txt`) that the real backend will use to process the workflows and orchestrate AI interactions.

## Running the Frontend Locally

To run the Next.js frontend locally:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features & Dashboards

- **Student Dashboard**: Track learning progress, view skill breakdown, and monitor the personalized learning plan. Includes an AI diagnosis powered by the backend.
- **Teacher Dashboard**: Review AI-generated learning plans for students. Teachers can approve, reject, or request the AI to regenerate the plan based on their comments (powered by Groq for the demo).
- **Admin Dashboard**: Monitor global KPIs, skill gaps across the institution, and track plan statuses.

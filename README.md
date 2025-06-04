# Spotify Wrapped Dashboard

This is a personal data visualization project inspired by Spotify Wrapped. It allows users to explore their Spotify listening habits through interactive graphs, personalized insights, and fun facts — all based on real-time data fetched using the Spotify Web API.

Tech stack: Javascript, React, html, css, d3, node.js, express.js

---

## Preview

> Since Spotify’s API terms prevent public deployment, this project must be run locally.

---

## Features

- See your top tracks and artists
- Visualize how many minutes you listened to music this year
- Explore your most listened genres and audio trends
- Get personalized mood analysis based on audio features
- Discover fun facts like most replayed track or most niche genre
- Analyze audio features like danceability, valence, and tempo

---

##Getting Started

Follow these instructions to run the project on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/VictorWong123/spotify-wrapped.git
cd spotify-wrapped
```

### 2. Create Spotify Dashboard 

Go to the Spotify Developer Dashboard.
Log in with your Spotify account and create a new app.
Set your app’s Redirect URI to: http://127.0.0.1:5001/callback

### 3. Add your environmental files
In an .env file in the root directory add:
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback

### To run: 
First start the backend 
```bash
cd server 
node index.js
```
Then run the app by opening a new terminal (with your server running still):
```bash
npm run dev 
```


This project is for educational and personal use only. It is not affiliated with Spotify.


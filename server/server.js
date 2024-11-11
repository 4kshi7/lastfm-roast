import express from "express";
import dotenv from "dotenv";
import axios from "axios";

//config
dotenv.config();
const app = express();
const port = process.env.PORT || 5001;
const api_key = process.env.API_Key;

//middleware
app.use(express.json());

// Function to fetch recent tracks from Last.fm
const getUserHistory = async (username) => {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${api_key}&format=json`;

  try {
    const response = await axios.get(url);
    return response.data.recenttracks.track || [];
  } catch (error) {
    console.error("Error fetching Last.fm data:", error);
    throw new Error("Unable to fetch data from Last.fm");
  }
};

// Function to generate a roast based on listening history
const generateRoast = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return "No tracks found to roast! Maybe you're too cool for this app?";
  }

  const trackNames = tracks.map((track) => track.name);
  const artistNames = tracks.map((track) => track.artist.name);

  // Example roast logic based on track frequency
  const mostPlayedTrack = trackNames[0]; // Taking the most recent track for simplicity
  const mostPlayedArtist = artistNames[0];

  return `Oh, look at you, listening to "${mostPlayedTrack}" by "${mostPlayedArtist}" again! Are you stuck in a loop or just really love that track?`;
};

// API Route for fetching data and generating a roast
app.post('/api/roast', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: 'Please provide a Last.fm username' });
  }

  try {
    const tracks = await getUserHistory(username);
    const roast = generateRoast(tracks);
    return res.json({ roast, tracks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is active on port ${port}`);
});

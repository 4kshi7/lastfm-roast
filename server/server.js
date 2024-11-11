import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import Groq from "groq-sdk";

dotenv.config();
const app = express();
const port = process.env.PORT || 5001;
const api_key = process.env.API_Key;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());

// Function to fetch recent tracks and current track
const getUserHistory = async (username) => {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${api_key}&format=json&limit=100&extended=1`;

  try {
    const response = await axios.get(url);
    const tracks = response.data.recenttracks.track;

    const currentTrack = tracks.find(
      (track) => track["@attr"] && track["@attr"].nowplaying
    );
    const fourWeeksTracks = tracks.filter((track) => {
      if (!track.date) return false;
      const date = new Date(track.date.uts * 1000);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return date >= oneMonthAgo;
    });

    return { currentTrack: currentTrack || null, fourWeeksTracks };
  } catch (error) {
    console.error("Error fetching Last.fm data:", error);
    throw new Error("Unable to fetch data from Last.fm");
  }
};

// Function to generate roast with GROQ
const generateRoastWithGroq = async (currentArtist, trackHistory) => {
  const historySummary = trackHistory
    .map((track) => `${track.name} by ${track.artist.name}`)
    .join(", ");
  const prompt = `Roast a user who is currently listening to ${currentArtist} and recently listened to: ${historySummary}. Be witty and humorous.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
    });
    return (
      completion.choices[0]?.message?.content || "Couldn't generate a roast."
    );
  } catch (error) {
    console.error("Error generating roast with GROQ:", error);
    throw new Error("Unable to generate roast.");
  }
};

// API Route for roasting based on listening history
app.post("/api/roast", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ message: "Please provide a Last.fm username" });
  }

  try {
    const { currentTrack, fourWeeksTracks } = await getUserHistory(username);

    if (!currentTrack) {
      return res.json({ message: "No current track found to roast!" });
    }

    const roastText = await generateRoastWithGroq(
      currentTrack.artist.name,
      fourWeeksTracks
    );
    return res.json({ roast: roastText, currentTrack });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is active on http://localhost:${port}`);
});

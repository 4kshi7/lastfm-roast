import { useState } from "react";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [roast, setRoast] = useState("");
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoastRequest = async () => {
    setLoading(true);
    setError("");
    setRoast("");
    setCurrentTrack(null);

    try {
      const response = await axios.post("http://localhost:5000/api/roast", {
        username,
      });
      const { roast, roastTrack } = response.data;

      setRoast(roast);
      setCurrentTrack(roastTrack);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Last.fm Music Roast</h1>

      <div className="flex flex-col items-center space-y-4">
        <input
          type="text"
          placeholder="Enter your Last.fm username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-2 text-black rounded-md"
        />
        <button
          onClick={handleRoastRequest}
          disabled={!username || loading}
          className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 disabled:bg-gray-500"
        >
          {loading ? "Roasting..." : "Get Roasted"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {roast && (
        <div className="mt-6 text-center space-y-2">
          <p className="text-xl font-semibold">Roast:</p>
          <p className="text-lg italic">{roast}</p>
          {currentTrack && (
            <p className="text-sm text-gray-400">
              Based on your track: "{currentTrack.name}" by {currentTrack.artist.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

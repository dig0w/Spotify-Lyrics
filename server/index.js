require("dotenv").config;

const express = require("express");
const app = express();

const Genius = require("genius-lyrics");
const Client = new Genius.Client(process.env.GENIUS_API_TOKEN);

// Add middleware to enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", async (req, res) => {
    res.sendStatus(200);
});

app.get("/lyrics", async (req, res) => {
    const query = req.query.q;
        if (!query) { return };

    try {
        const searches = await Client.songs.search(query);
        // Pick first one
        const firstSong = searches[0];
            if (!firstSong) { return res.json({ status: 204 }) };
        // Ok lets get the lyrics
        const lyrics = await firstSong.lyrics();
            if (!lyrics) { return res.json({ status: 204 }) };

        res.json({ lyrics, status: 200 });
    } catch (error) {
        console.error("Error:", error);
    };
});

const PORT = process.env.PORT || 2024;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}, http://localhost:${PORT}`);
});

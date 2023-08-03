import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { readFile } from "fs/promises";
const data = JSON.parse(
  await readFile(new URL("./crawled_data.json", import.meta.url))
);

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// ROUTES
app.get("/", (req, res) => {
  res.send({
    Title: "Specialized vocabulary in information technology",
    Get_all_words: "http://localhost:3000/get-all-words",
    Get_word: "http://localhost:3000/get-word-detail/:word",
    Source: "https://www.dictionary4it.com/term/",
  });
});

app.get("/get-all-words", (req, res) => {
  try {
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/get-word-detail/:word", (req, res) => {
  const word = req.params.word;

  try {
    data.forEach((item) => {
      let wordData = item.titleWhatIs_header.split("là gì?")[0].toLowerCase();
      if (wordData.includes(word.toLowerCase())) {
        return res.status(200).json(item);
      }
    });
    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});

const express = require("express");
const Pusher = require("pusher");
const cors = require("cors");
const dotenv = require("dotenv");
const uuid = require("short-unique-id");
const  getRandomCodeBlock  = require("./codeGeneration/codegen.js");
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://chimptype.onrender.com",
  }),
);
// app.use(cors());
app.use(express.json());

const pusher = new Pusher({
  appId: process.env.APPID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER,
  useTLS: true,
});

let waitingPlayer = null;

function generateScore(min, max) {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function setBotScore(difficulty) {
  if (difficulty == "Noob Chimp") {
    wpm = generateScore(10, 50);
    correct = generateScore(10, 30);
    error = generateScore(60, 80);
  }
  else if (difficulty == "Veteran Orangutan") {
    wpm = generateScore(40, 70);
    correct = generateScore(40, 70);
    error = generateScore(20, 40);
  }
  else if (difficulty == "King Kong") {
    wpm = generateScore(60, 110);
    correct = generateScore(90, 110);
    error = generateScore(10, 20);
  }
  const botScore = {
    wpm: wpm,
    correct: correct,
    error: error,
  }

  return botScore;
}

const startTimer = (roomId, duration = 10) => {
  let timeLeft = duration;

  const interval = setInterval(() => {
    timeLeft--;

    pusher.trigger(`${roomId}`, "timer-update", {
      timeLeft,
    });

    if (timeLeft <= 0) {
      clearInterval(interval);
      pusher.trigger(`${roomId}`, "timer-expired", {});
    }
  }, 1000);
};

app.get("/clean-match", (req,res) => {
  
  try {

 
    console.log(waitingPlayer)
    

    waitingPlayer = null;

    console.log("after", waitingPlayer)
    
    res.status(200).json({ message: "player removed" });
  } catch(error) {
    res.json({message:error.message})
  }
  
})

app.post("/find-match", (req, res) => {
  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: "Missing playerId" });
  }

  if (waitingPlayer && waitingPlayer.id !== playerId) {
    const roomtag = new uuid({ length: 10 });
    const roomId = `room-${roomtag.rnd()}`;
    const players = [waitingPlayer.id, playerId];

    pusher.trigger(roomId, "match-start", {
      roomId,
      players,
    });

    const randomBlock = getRandomCodeBlock();
    pusher.trigger(`temp-${waitingPlayer.id}`, "match-start", {
      roomId,
      players,
      randomBlock,
    });

    pusher.trigger(`${roomId}`, "code-block", {
      randomBlock,
    });

    const opponentId = waitingPlayer.id;
    waitingPlayer = null;
    startTimer(roomId, 66);

    res.json({ matched: true, roomId, opponentId });
  } else {
    waitingPlayer = { id: playerId };
    res.json({ matched: false });
  }
});

app.post("/bot-find-match",async  (req, res) => {
  const { playerId, difficulty } = req.body;

  if (!playerId) return res.status(400).json({message: "no playerid recieved!"})

  const roomtag = new uuid({ length: 10 });
  const roomId = `bot-room-${roomtag.rnd()}`;
  const botIdtag = new uuid({ length: 10 });
  const opponentId = `bot-chimp-${botIdtag.rnd()}`;
  const players = [opponentId, playerId]
  const randomBlock = getRandomCodeBlock();

  const botScore = await setBotScore(difficulty);

  pusher.trigger(roomId, "bot-match-start", {
    roomId,
    players,
    randomBlock,
    botScore
  });

  startTimer(roomId, 46);

  res.json({ matched: true, roomId, opponentId, botScore, randomBlock });

})

app.post("/update-score", (req, res) => {
  const { roomId, playerId, score } = req.body;

  if (!roomId || !playerId || !score) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  pusher.trigger(`${roomId}`, "update-score", {
    playerId,
    score,
  });

  res.send({ success: true });
});

app.get("/hit", (req, res) => {
  res.status(200).send("Hello from Chimp & Co. !!");
});

app.listen(4000, () => console.log("Server running on port 4000"));

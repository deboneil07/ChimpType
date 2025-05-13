const express = require("express");
const Pusher = require("pusher");
const cors = require("cors");
const dotenv = require("dotenv");
const uuid = require("short-unique-id");
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://chimptype.onrender.com",
  }),
);
app.use(express.json());

const pusher = new Pusher({
  appId: process.env.APPID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER,
  useTLS: true,
});

let waitingPlayer = null;

function getRandomCodeBlock() {
  const codeBlocks = [
    {
      language: "Python",
      code: `
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
      `.trim(),
    },
    {
      language: "JavaScript",
      code: `
function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z]/g, '');
    return clean === clean.split('').reverse().join('');
}

console.log(isPalindrome("Racecar"));
      `.trim(),
    },
    {
      language: "C++",
      code: `
#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; ++i)
        cout << "Hello " << i << endl;
    return 0;
}
      `.trim(),
    },
    {
      language: "Go",
      code: `
package main

import "fmt"

func main() {
    for i := 1; i <= 5; i++ {
        fmt.Println("Line", i)
    }
}
      `.trim(),
    },
    {
      language: "Java",
      code: `
public class HelloWorld {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Java says hello " + i);
        }
    }
}
      `.trim(),
    },
    {
      language: "Rust",
      code: `
fn main() {
    for i in 1..=5 {
        println!("Rust line number: {}", i);
    }
}
      `.trim(),
    },
    {
      language: "Ruby",
      code: `
5.times do |i|
  puts "Ruby magic \#{i + 1}"
end

puts "Done looping!"
      `.trim(),
    },
  ];

  return codeBlocks[Math.floor(Math.random() * codeBlocks.length)];
  // pusher.trigger(`${roomId}`, "code-block", {
  //   randomBlock
  // })
}

function generateScore(min, max) {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setBotScore(difficulty) {
  if (difficulty == "Noob Chimp") {
    wpm = generateScore(10, 50);
    correct = generateScore(10, 50);
    error = generateScore(10, 50);
  }
  else if (difficulty == "Veteran Orangutan") {
    wpm = generateScore(40, 70);
    correct = generateScore(40, 70);
    error = generateScore(40, 70);
  }
  else if (difficulty == "King Kong") {
    wpm = generateScore(60, 110);
    correct = generateScore(60, 110);
    error = generateScore(60, 110);
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

app.post("/bot-find-match", (req, res) => {
  const { playerId, difficulty } = req.body;

  if (!playerId) return res.status(400).json({message: "no playerid recieved!"})

  const roomtag = new uuid({ length: 10 });
  const botRoomId = `bot-room-${roomtag.rnd()}`;
  const botIdtag = new uuid({ length: 10 });
  const botId = `bot-chimp-${botIdtag}`;
  const players = [botId, playerId]
  const randomBlock = getRandomCodeBlock();

  const botScore = setBotScore(difficulty);

  pusher.trigger(botRoomId, "bot-match-start", {
    botRoomId,
    players,
    randomBlock,
    botScore
  });

  startTimer(botRoomId, 66);

  res.json({ matched: true, botRoomId, botId,  });

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

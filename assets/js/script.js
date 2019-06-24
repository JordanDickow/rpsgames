//MAKE CONNECTION TO THE SOCKET
var socket = io.connect("http://rpsgames.herokuapp.com");

//VARIABLES AND CONSTANTS
let playerChoice;
let opponentChoice;
let winner;
let roomID;

let playerType;
let playerName;
let message = document.getElementById("message");
let btn = document.getElementById("send");
let output = document.getElementById("output");
let feedback = document.getElementById("feedback");

const choices = document.querySelectorAll(".choice");
const score = document.getElementById("score");
const result = document.getElementById("result");
//const restart = document.getElementById("restart");
const modal = document.querySelector(".modal");
const scoreboard = {
  player1: 0,
  player2: 0
};

//EMIT EVENTS

//Chat Event Listener
btn.addEventListener("click", function() {
  socket.emit("chat", {
    message: message.value,
    handle: playerName,
    room: roomID
  });
});
//Typing Event Listener
message.addEventListener("keypress", function() {
  socket.emit("typing", {
    room: roomID,
    player: playerName
  });
});

//GAME EVENTS

function disconnect() {
  socket.emit("disconnect", {
    room: roomID
  });
}

//Create New Game Listener
$("#new").on("click", function() {
  playerType = true;
  playerName = $("#nameNew").val();
  $("#player1Name").html(playerName);
  if (!playerName) {
    alert("Please enter your name.");
    return;
  }
  socket.emit("createGame", { name: name });
  $(".menu").fadeOut();
  $(".gameBoard").fadeIn();
});
//Join Game Listener
$("#join").on("click", function() {
  playerType = false;
  var name = $("#nameJoin").val();
  playerName = name;
  $("#player2Name").html(name);
  roomID = $("#room").val();
  if (!name || !roomID) {
    alert("Please enter your name and game ID.");
    return;
  }
  socket.emit("joinGame", { name: name, room: roomID });
  $(".menu").fadeOut();
  $(".gameBoard").fadeIn();
});

//UI UPDATE EVENTS

//New Game Welcome Wait Event Listener
socket.on("newGame", function(data) {
  var message =
    "Hello, " +
    data.name +
    ". Please ask your friend to enter Game ID: " +
    data.room +
    ". Waiting for player 2...";
  roomID = data.room;
  $("#msg").html(message);
});
//Player1 Joined Game Listener
socket.on("player1", function(data) {
  var message = "Hello , " + playerName;
  $("#msg").html(message);
  $("#player2Name").html(data.oppName);
  socket.emit("joinedGame", {
    room: roomID,
    player: playerName
  });
  $(".gamePlay").css("display", "block");
});
//Player2 Joined Game Listener
socket.on("player2", function(data) {
  var message = "Hello , " + playerName;
  $("#msg").html(message);
});
//Update the Creater's Name Listener
socket.on("welcomeGame", function(data) {
  $("#player1Name").html(data);
  $(".gamePlay").css("display", "block");
});
//Error Listener
socket.on("err", function(err) {
  alert(err.message);
  location.reload();
});
//Result Listener
socket.on("result", function(data) {
  if (playerType) {
    showWinner(data.winner, data.choice2);
  } else {
    showWinner(data.winner, data.choice1);
  }
});

//CHAT EVENTS

//Listening to incoming message
socket.on("chat", function(data) {
  feedback.innerHTML = "";
  output.innerHTML +=
    "<p><strong>" + data.handle + "</strong> : " + data.message + "</p>";
});
//Listening to typing
socket.on("typing", function(data) {
  feedback.innerHTML = data + " is typing a message";
});

// Play game
function play(e) {
  //restart.style.display = "inline-block";
  playerChoice = e.target.id;
  if (playerType) {
    socket.emit("choice1", {
      choice: playerChoice,
      room: roomID
    });
  } else {
    socket.emit("choice2", {
      choice: playerChoice,
      room: roomID
    });
  }
}
//Chat Open
$(".chat").on("click", function() {
  $("#players-chat").css("background", "rgba(0, 0, 0, 0.3)");
  $("#players-chat").css("z-index", "1");
  $("#chat-window").slideDown();
  $(".chat").hide();
});
//Chat CLose
$("#chatClose").on("click", function() {
  $("#players-chat").css("background", "none");
  $("#players-chat").css("z-index", "-1");
  $("#chat-window").slideUp();
  $(".chat").show();
});
// Get computers choice
// function getComputerChoice() {
//   const rand = Math.random();
//   if (rand < 0.34) {
//     return "rock";
//   } else if (rand <= 0.67) {
//     return "paper";
//   } else {
//     return "scissors";
//   }
// }

function ResultDisplay(res, opponentChoice) {
  result.innerHTML = `
      <h1 class="text-${res}">You ${res.charAt(0).toUpperCase() +
    res.slice(1)}</h1>
      <i class="fas fa-hand-${opponentChoice} fa-10x"></i>
      <p>Opponent Chose <strong>${opponentChoice.charAt(0).toUpperCase() +
        opponentChoice.slice(1)}</strong></p>
    `;
}
function showWinner(winner, opponentChoice) {
  if (winner === "1") {
    // Inc player score
    scoreboard.player1++;
    // Show modal result
    if (playerType) {
      ResultDisplay("win", opponentChoice);
    } else {
      ResultDisplay("lose", opponentChoice);
    }
  } else if (winner === "2") {
    // Inc computer score
    scoreboard.player2++;
    // Show modal result
    if (!playerType) {
      ResultDisplay("win", opponentChoice);
    } else {
      ResultDisplay("lose", opponentChoice);
    }
  } else {
    result.innerHTML = `
      <h1>It's A Draw</h1>
      <i class="fas fa-hand-${opponentChoice} fa-10x"></i>
      o
    `;
  }
  // Show score
  $("#score #p1").html(scoreboard.player1);
  $("#score #p2").html(scoreboard.player2);

  modal.style.display = "block";
}

// Restart game
/* function restartGame() {
  scoreboard.player1 = 0;
  scoreboard.player2 = 0;
  score.innerHTML = `
    <p>Player: 0</p>
    <p>Computer: 0</p>
  `;
}
 */
// Clear modal
function clearModal(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

// Event listeners
choices.forEach(choice => choice.addEventListener("click", play));
window.addEventListener("click", clearModal);
//restart.addEventListener("click", restartGame);

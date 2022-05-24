const statusButtons = document.querySelectorAll(".statusButtons input");

function updateLoader(val) {
  const loader = document.querySelector(".loader-wrapper");
  switch (val) {
    case "start":
      loader.style.display = "block";
      break;
    case "stop":
      loader.style.display = "none";
      break;
  }
}

statusButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    updateLoader("start");

    if (button.getAttribute("id") === "save") {
      fetch("./backend/addJSON", {
        method: "POST",
        credentials: "include", // sending cookies with the request
        headers: {
          "Content-Type": "application/json",
        },
        body: e.jsonTranspile(),
      })
        .then((res) => res.json())
        .then((res) => {
          updateLoader("stop");
          checkBotStatus();
          return res;
        })
        .then((res) => alert(`Result: ${res.result}`));
    } else {
      // TODO change this to http://localhost:3001/ to ./backend/ when deploying
      fetch(`./backend/${button.getAttribute("id")}`, {
        method: "GET",
        credentials: "include", // sending cookies with the request
      })
        .then((res) => res.json())
        .then((res) => {
          updateLoader("stop");
          checkBotStatus();
          return res;
        })
        .then((res) => alert(`Result: ${res.result}`))
        .catch(() => {
          updateLoader("stop");
          alert(
            "Cannot connect to the backend - are you sure it has been started or is it the wrong fetch url?"
          );
          checkBotStatus();
        });
    }
  });
});

function checkBotStatus() {
  fetch("http://localhost:3001/checkstatus", {
    method: "GET",
    credentials: "include", // sending cookies with the request
  })
    .then((res) => res.json())
    .then((json) => {
      document.querySelector("#botstatus").innerHTML = json.result;
    })
    .catch((err) => console.log("Checked bot status but backend was offline"));
}

setInterval(checkBotStatus, 4000);

checkBotStatus();

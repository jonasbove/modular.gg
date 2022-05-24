function addEventListenerForForms() {
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => form.addEventListener("submit", handleRequest));
}

async function handleRequest(event) {
  event.preventDefault();

  const formID = event.target.getAttribute("id");

  const formData = new FormData(event.target);

  fetch(`./${formID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData)), // skide smart
  })
    .then(async (res) => {
      const resJSON = await res.json();
      if (!res.ok) throw new Error(resJSON.message);
      return resJSON;
    })
    .then((res) => {
      if (formID !== "settings") window.location.href = "./settings";
      else {
        deleteCookie("authorization");
        //setResponse(res.message)
      }
    })
    .catch((err) => {
      setResponse(err);
    });
}

function setResponse(message) {
  document.querySelector("#errorMessage").innerHTML = message;
}

addEventListenerForForms();

function checkIfLoggedIn() {
  fetch("./userdata", {
    method: "GET",
    credentials: "include", // sending cookies with the request
  })
    .then((res) => res.json())
    .then((json) => {
      document.querySelector("#isnotloggedin").style.display = "none";
      document.querySelector("#isloggedin").style.display = "flex";
      document.querySelector("#name").textContent = `Hi ${json.name}`;
    })
    .catch((err) => {
      console.log("Is not logged in");
    });
}

function loadUserSettings() {
  fetch("./userdata", {
    method: "GET",
    credentials: "include", // sending cookies with the request
  })
    .then((res) => res.json())
    .then((json) => {
      for (item in json) {
        const element = document.querySelector(`input[name='${item}'`);
        if (element) {
          element.value = json[item];
        }
      }
    });
}

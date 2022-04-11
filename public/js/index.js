function addEventListenerForForms() {
  const forms = document.querySelectorAll('form')
  forms.forEach(form => form.addEventListener('submit', handleRequest))
}

async function handleRequest(event) {
  event.preventDefault()

  const formID = event.target.getAttribute('id')

  const formData = new FormData(event.target)

  fetch(`./${formID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Object.fromEntries(formData)), // skide smart
  })
    .then(async (res) => {
      const resJSON = await res.json()
      if (!res.ok) throw new Error(resJSON.message)
      return resJSON
    })
    .then((res) => {
      if (formID !== 'settings') window.location.pathname = './settings'
      else setResponse(res.message)
    })
    .catch((err) => {
      setResponse(err)
    })
}

function setResponse(message) {
  document.querySelector('#errorMessage').innerHTML = message
}

addEventListenerForForms()
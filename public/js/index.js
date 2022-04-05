const registerForm = document.querySelector('#register')
const loginForm = document.querySelector('#login')

registerForm?.addEventListener('submit', handleRequest)
loginForm?.addEventListener('submit', handleRequest)

async function handleRequest(event) {
  event.preventDefault()

  const formID = event.target.getAttribute('id')

  const formData = new FormData(event.target)

  fetch(`http://localhost:3000/${formID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(Object.fromEntries(formData)) // skide smart
  })
    .then(async (res) => {
      const resJSON = await res.json()
      if (!res.ok) throw new Error(resJSON.message)
      return resJSON
    }).then(res => {
      if (formID === 'login') setUserAuthenticationToken(res.token)
      
      window.location.pathname = ('/index.html')
    }).catch(err => {
      setResponse(err)
    })
}

function setResponse(message) {
  document.querySelector('#errorMessage').innerHTML = message
}

function setUserAuthenticationToken(token) {
  localStorage.setItem('authorization', token)
}
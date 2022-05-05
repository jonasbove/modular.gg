const statusButtons = document.querySelectorAll('.statusButtons input')

function updateLoader(val) {
  const loader = document.querySelector('.loader-wrapper')
  switch(val) {
    case 'start':
      loader.style.display = 'block'
      break;
    case 'stop':
      loader.style.display = 'none'
      break;
  }
}

statusButtons.forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault()

    updateLoader('start')

    fetch(`http://localhost:3001/${button.getAttribute('id')}`, {
      method: 'GET',
      credentials: 'include' // sending cookies with the request
    })
      .then((res) => res.json())
      .then((res) => {
        updateLoader('stop')
        return res
      })
      .then((res) => alert(`Result: ${res.result}`))
      .catch(() => {
        updateLoader('stop')
        alert('Error - maybe the server is not online?')
      })
  })
})

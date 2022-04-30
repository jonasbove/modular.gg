const statusButtons = document.querySelectorAll('.statusButtons input')

statusButtons.forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault()

    fetch(`./backend/${button.getAttribute('id')}`, {
      method: 'GET',
      credentials: 'include' // sending cookies with the request
    })
      .then((res) => res.json())
      .then(json => console.log(json))
  })
})

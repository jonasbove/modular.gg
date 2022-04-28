let id = 0;

const events = document.querySelectorAll('.events a')

events.forEach(anchor => {
  anchor.addEventListener('click', event => {
    event.preventDefault()

    switch(anchor.getAttribute('event')) {
      case 'onCommand':
        e.spawnNode(new VPL_Node("OnSlashCommand", [new ActionPlug("next")], [new InPlug(GraphType.Text, "trigger", true)], [new OutPlug(GraphType.Channel, "channel"), new OutPlug(GraphType.Text, "text")], new point(250, 175), 0, true))
        break;
    }
  })
})

const effects = document.querySelectorAll('.effects a')

effects.forEach(anchor => {
  anchor.addEventListener('click', event => {
    event.preventDefault()

    switch(anchor.getAttribute('effect')) {
      case 'ifelse':
        e.spawnNode(new ActionNode("IfElse", [new ActionPlug("if"), new ActionPlug("else")], [new InPlug(GraphType.Bool, "expression", false)], [], new point(250, 175), id++, false))
        break;
      case 'sendMessage':
        e.spawnNode(new ActionNode("SendMessage", [], [new InPlug(GraphType.Channel, "channel", false), new InPlug(GraphType.Text, "text", true)], [], new point(250, 175), id++, false))
        break;
      case 'greaterThan':
        e.spawnNode(new VPL_Node("GreaterThan", [], [new InPlug(GraphType.Num, "a", true), new InPlug(GraphType.Num, "b", true)], [new OutPlug(GraphType.Bool, "result")], new point(250, 175), id++, false))
        break;
    }
  })
})

const statusButtons = document.querySelectorAll('.statusButtons input')

statusButtons.forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault()

    fetch(`http://localhost:3001/${button.getAttribute('id')}`, {
      method: 'GET',
      credentials: 'include' // sending cookies with the request
    })
      .then((res) => res.json())
      .then(json => console.log(json))
  })
})
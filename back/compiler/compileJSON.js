//! NOTE: THIS REQUIRES NODE CERSION 17.0.0 OR HIGHER
//! NOTE: THIS IS AN EXPERIMENTAL FEATURE, AND MIGHT NOT WORK IN THE FURTURE
const graph = require('../json/example.json') // assert {type: "json"}
const fs = require('fs')

fs.writeFile('../results/compiledCode.js', buildFile(), 'utf8', err => {
  if (err) console.log(err)
  else {
    console.log('success')
  }
})

function setType (string, type) {
  switch (type) {
    case 'text': {
      return `'${string}'` // return as string
    }
    case 'number': {
      return string // return as number
    }
  }
}

function buildFile () { // Todo: parameterize and shit
  // let importSet = new Set()
  const file = recFillParams(graph, graph.nodes[0])

  // return ((Array.from(importSet)).reduce((res, func) => { return res += `import { ${func} } from "..\\\\tempFunctions.js;"\n`})) + file

  return `const nodeFunctions = require('../templates/tempFunctions.js');${file}`

  function recFillParams (graph, node) {
    let result = `nodeFunctions.node_${node.name}({`
    // importSet.add(`nodeFunctions.node_${node.name}`)
    node.inputs.data.forEach(data => {
      result += data.name + ':'
      if (!data.valueIsPath) {
        result += setType(data.value, data.type) + ','
      } else {
        const nextNode = graph.nodes.find((n) => { return n.id === data.value.node })
        if (nextNode.type === 'Event') {
          result += `${nextNode.name}_data.${data.value.plug},`
        } else {
          result += `${recFillParams(graph, nextNode)}.${data.value.plug},`
        }
      }
    })
    node.inputs.actions.forEach(action => {
      result += action.name + ':'
      let signature = '()'
      if (node.type === 'Event') {
        signature = `(${node.name}_data)`
      }
      if (action.valueIsPath) {
        const nextNode = graph.nodes.find((n) => { return n.id === action.value.node })
        if (nextNode.type === 'ActionNode') {
          result += `${signature} => {${recFillParams(graph, nextNode)}},`
        } else {
          throw 'Parser error: Action points to non action node' // TODO: add usefull info here, but this should also be unreachable with a correctly generated json file
        }
      } else {
        result += `${signature} => {},`
      }
    })

    result = result.substring(0, result.length - 1) // remove "," from earliner
    return result + '})'
  }
}

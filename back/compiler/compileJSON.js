const fs = require('fs')

function compile(name, graph) {
  fs.writeFile(`./results/${name}.js`, buildFile(graph), 'utf8', err => {
    if (err) console.log(err)
    else {
      console.log('success')
    }
  })
}

function setType(string, type) {
    switch (type) {
        case 'Text': {
            return `'${string}'` // return as string
        }
        case 'Num': {
            return string // return as number
        }
    }
}

function buildFile(graph) { //Todo: parameterize and shit
    //let importSet = new Set()
    let file = graph.nodes.filter(n => n.type === "EventNode").map(n => `funcs.push( () => {${recFillParams(graph, n)}});`).reduce((prev, curr) => prev + curr)

    //return ((Array.from(importSet)).reduce((res, func) => { return res += `import { ${func} } from "..\\\\tempFunctions.js;"\n`})) + file

    return `const nodeFunctions = require("../templates/functions.js"); let funcs = [];${file}; module.exports = funcs`

    function recFillParams(graph, node) {
        let result = `nodeFunctions.node_${node.name}({`
        //importSet.add(`nodeFunctions.node_${node.name}`)
        node.inputs.data.forEach(data => {
            result += data.name + ":"
            if (!data.valueIsPath) {
                result += setType(data.value, data.type) + ","
            } else {
                let nextNode = graph.nodes.find((n) => { return n.id === data.value.node })
                if (nextNode.type === "EventNode") {
                    result += `${nextNode.name}_data.${data.value.plug},`
                } else {
                    result += `${recFillParams(graph, nextNode)}.${data.value.plug},`
                }
            }
        })
        node.inputs.actions.forEach(action => {
            result += action.name + ":"
            let signature = "()"
            if (node.type === "EventNode") {
                signature = `(${node.name}_data)`
            }
            if (!action.valueIsPath) {
                result += `${signature} => {},`
            } else {
                let nextNode = graph.nodes.find((n) => { return n.id === action.value.node })
                if (nextNode.type === "ActionNode") {
                    result += `${signature} => {${recFillParams(graph, nextNode)}},`
                } else {
                    throw 'Parser error: Action points to non action node'; //TODO: add usefull info here, but this should also be unreachable with a correctly generated json file
                }
            }
        })




        result = result.substring(0, result.length - 1) // remove "," from earliner
        return result + "})"
    }
}

module.exports = compile
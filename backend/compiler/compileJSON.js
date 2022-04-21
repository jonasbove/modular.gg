import fs from 'fs'

export default function compile(path, graph) {
    fs.writeFile(`${path}/${graph.name}.js`, buildFile(graph), 'utf8', err => {
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
    //return ((Array.from(importSet)).reduce((res, func) => { return res += `import { ${func} } from "..\\\\tempFunctions.js;"\n`})) + file

    let startNode = graph.nodes.find(n => n.type === "EventNode")

    return `import nodeFunctions from "../../templates/functions.js";
    export let name = "${graph.name}"; 
    export let event = "${startNode.name}"; 
    export let func = () => {${recFillParams(graph.nodes, startNode)}};`

    function recFillParams(nodes, node) {
        let result = `nodeFunctions.node_${node.name}({`
        //importSet.add(`nodeFunctions.node_${node.name}`)
        node.inputs.data.forEach(data => {
            result += data.name + ":"
            if (!data.valueIsPath) {
                result += setType(data.value, data.type) + ","
            } else {
                let nextNode = nodes.find((n) => { return n.id === data.value.node })
                if (nextNode.type === "EventNode") {
                    result += `${nextNode.name}_data.${data.value.plug},`
                } else {
                    result += `${recFillParams(nodes, nextNode)}.${data.value.plug},`
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
                let nextNode = nodes.find((n) => { return n.id === action.value.node })
                if (nextNode.type === "ActionNode") {
                    result += `${signature} => {${recFillParams(nodes, nextNode)}},`
                } else {
                    throw 'Parser error: Action points to non action node'; //TODO: add usefull info here, but this should also be unreachable with a correctly generated json file
                }
            }
        })




        result = result.substring(0, result.length - 1) // remove "," from earliner
        return result + "})"
    }
}
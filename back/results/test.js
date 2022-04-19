const nodeFunctions = require('../templates/functions.js')
let funcs = []
funcs.push(() => {
  nodeFunctions.node_OnSlashCommand({
    trigger: 'lort',
    next: (OnSlashCommand_data) => {
      nodeFunctions.node_IfElse({
        expression: nodeFunctions.node_GreaterThan({ a: 6, b: 4 }).result,
        if: () => {
          nodeFunctions.node_SendMessage({
            channel: OnSlashCommand_data.channel,
            text: 'yes',
          })
        },
        else: () => {
          nodeFunctions.node_SendMessage({
            channel: OnSlashCommand_data.channel,
            text: 'nooo',
          })
        },
      })
    },
  })
})
module.exports = funcs

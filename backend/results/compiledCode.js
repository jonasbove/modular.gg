import nodeFunctions from '../templates/functions.js'
nodeFunctions.node_OnSlashCommand({
  trigger: 'lort',
  veryCoolNum: nodeFunctions.node_Number({ inputNumber: 5 }).outputNumber,
  next: (OnSlashCommand_data) => {
    nodeFunctions.node_IfElse({
      expression: nodeFunctions.node_GreaterThan({
        a: nodeFunctions.node_Number({ inputNumber: 5 }).outputNumber,
        b: 3
      }).result,
      if: () => {
        nodeFunctions.node_SendMessage({ message: 'Yep', discord_data: OnSlashCommand_data })
      },
      else: () => {
        nodeFunctions.node_SendMessage({ message: 'Nope', discord_data: OnSlashCommand_data })
      }
    })
  }
})


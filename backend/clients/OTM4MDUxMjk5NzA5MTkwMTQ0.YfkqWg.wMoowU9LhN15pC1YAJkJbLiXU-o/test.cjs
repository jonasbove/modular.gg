await import('../../templates/functions.js')
let funcs = []
funcs.push(() => {
  nodeFunctions.node_OnSlashCommand({
    trigger: 'lort',
    next: (OnSlashCommand_data) => {
      nodeFunctions.node_IfElse({
        expression: nodeFunctions.node_GreaterThan({ a: 50, b: 100 }).result,
        if: () => {
          nodeFunctions.node_SendMessage({
            channel: OnSlashCommand_data.channel,
            text: '100 er større end 50',
          })
        },
        else: () => {
          nodeFunctions.node_SendMessage({
            channel: OnSlashCommand_data.channel,
            text: '50 er større end 100',
          })
        },
      })
    },
  })
})
export default funcs
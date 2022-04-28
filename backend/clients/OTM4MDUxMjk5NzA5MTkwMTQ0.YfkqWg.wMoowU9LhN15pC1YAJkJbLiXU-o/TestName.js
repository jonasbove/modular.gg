import getFunctions from "../../templates/functions.js";
    export let name = "TestName"; 
    export let event = "OnSlashCommand"; 
    export let func = (client) => {let nodeFunctions = getFunctions(client); nodeFunctions.node_OnSlashCommand({trigger:'minmeganicekommando',next:(OnSlashCommand_data) => {nodeFunctions.node_IfElse({expression:nodeFunctions.node_GreaterThan({a:4,b:2}).result,if:() => {nodeFunctions.node_SendMessage({channel:OnSlashCommand_data.channel,text:'sutdenfedelortelortesutpik'})},else:() => {}})}})};
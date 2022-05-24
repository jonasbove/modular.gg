import {buildFile} from '../api/compiler/compileJSON.js';
import * as fs from 'fs';

let data = JSON.parse(fs.readFileSync('./testing/case1.json', {encoding: 'utf8'}));

test('compiles JSON to string that actually is JS code for bot :D', async () => {
    expect(await buildFile(data)).toBe(`import getFunctions from "../../templates/functions.js";
    export let name = "CoolExample";
    export let event = "OnSlashCommand";
    export let funcGenerator = (client) => {
        let nodeFunctions = getFunctions(client);
        return nodeFunctions.node_OnSlashCommand({trigger:'test', description:'Is 5 greater than 2?', next: (OnSlashCommand_data) => {nodeFunctions.node_IfElse({expression:nodeFunctions.node_GreaterThan({a:5, b:2,}).result,if: () => {nodeFunctions.node_SendMessage({channel:OnSlashCommand_data.channel,text:'5 > 2',})}, else: () => {nodeFunctions.node_SendMessage({channel:OnSlashCommand_data.channel,text:'5 !> 2',})},})},})
    };`)
});

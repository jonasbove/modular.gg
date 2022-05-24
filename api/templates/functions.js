export function getFunctions(client) {
  return {
    node_OnSlashCommand: (obj) => {
      //Returns an object with a attribute 'func' which is a function that takes a DiscordJS 'interaction' as the parameter, this function will be the funciton boud to the event on the DiscordJS 'client'
      //and an attribute 'data' following some internal rules for metadata we need to setup the event (in this case a trigger to deploy the slash command to Discord)
      //All node_ functions corresponding to an 'event node' will be expected to follow this pattern
      return {
        data: {
          trigger: obj.trigger,
          description: obj.description ?? obj.trigger, // <- description is optional
        },
        func: (interaction) => {
          console.log(
            `Recieved command ${interaction.commandName} in function for ${obj.trigger}`
          );
          if (!interaction.isCommand()) return;
          if (interaction.commandName != obj.trigger) return;

          const discord_data = {
            client: client,
            channel: interaction.channelId,
            interaction: interaction,
          };

          obj.next(discord_data);
        },
      };
    },

    node_IfElse: (obj) => {
      if (obj.expression === true) obj.if();
      else obj.else();
    },

    node_Number: (obj) => {
      return { outputNumber: obj.inputNumber };
    },

    node_GreaterThan: (obj) => {
      return { result: obj.a > obj.b };
    },

    node_SendMessage: async (obj) => {
      const message = await client.channels.cache
        .get(obj.channel)
        .send(obj.text);
      return { messageid: "testid" };
    },

    node_ReplyToCommand: async (obj) => {
      // todo
      await obj.interaction.reply(obj.text);
    },

    node_Sequence: async (obj) => {
      await obj.first();
      await obj.second();
    },

    node_RandomNumber: (obj) => {
      return { num: Math.floor(Math.random() * (obj.max - obj.min)) + obj.min };
    },

    node_ReplyToMessage: (obj) => {
      console.log(obj);
      // TODO
    },

    node_ConvertNumToText: (obj) => {
      return { text: `${obj.num}` };
    },

    node_Loop: (obj) => {
      for (let index = 0; index < obj.x; index++) {
        obj.action();
      }
    },

    node_Add: (obj) => {
      return { sum: obj.a + obj.b };
    },

    node_Sub: (obj) => {
      return { subtraction: obj.a - obj.b };
    },

    node_Multiply: (obj) => {
      return { product: obj.a * obj.b };
    },

    node_Sqrt: (obj) => {
      return { square: Math.sqrt(obj.a) };
    },

    node_Div: (obj) => {
      return { div: obj.a / obj.b };
    },

    node_And: (obj) => {
      return { result: obj.a && obj.b};
    },

    node_Or: (obj) => {
      return { result: obj.a || obj.b};
    },

    node_Not: (obj) => {
      return { result: !obj.a};
    },
  };
}

export default getFunctions;

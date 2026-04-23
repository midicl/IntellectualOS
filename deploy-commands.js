const { REST, Routes } = require("discord.js");
const { token, clientId, guildId } = require("./config.json");
const commands = require("./commands.js");

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  console.log("Registering slash commands...");
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands.map((cmd) => cmd.toJSON()) }
  );
  console.log(`Done — commands registered to guild ${guildId}.`);
})();

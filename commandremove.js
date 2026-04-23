const { REST, Routes } = require("discord.js");
const { token, clientId, guildId } = require("./config.json");

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  console.log("Wiping guild commands...");
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: [] }
  );
  console.log("Guild commands removed.");

  console.log("Wiping global commands...");
  await rest.put(
    Routes.applicationCommands(clientId),
    { body: [] }
  );
  console.log("Global commands removed.");

  console.log("Done — everything wiped.");
})();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const gameOpenEventCooldown = new Set(); // To prevent double messages on game-open events
const eventDeduplicationSet = new Set(); // To track unique events

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.content.startsWith('!check')) {
        checkOnlineStatus(message);
    }
});

function gameOpenEventHandler(event) {
    const eventId = event.id; // Assuming every event has a unique ID
    if (eventDeduplicationSet.has(eventId)) {
        console.log('Duplicate event detected.');
        return; // Ignore duplicate events
    }
    eventDeduplicationSet.add(eventId);

    if (gameOpenEventCooldown.has(eventId)) {
        console.log('Game open event debounced.');
        return; // Prevent double messages
    }
    gameOpenEventCooldown.add(eventId);

    // Notify about the game open event
    const notificationMessage = `Game opened: ${event.gameName} at ${new Date().toISOString()}`;
    client.channels.cache.get('YOUR_CHANNEL_ID').send(notificationMessage);

    // Remove from cooldown after certain time (e.g., 10 seconds)
    setTimeout(() => {
        gameOpenEventCooldown.delete(eventId);
        eventDeduplicationSet.delete(eventId);
    }, 10000);
}

function checkOnlineStatus(message) {
    // Check online status logic
    const onlineStatus = Math.random() > 0.5 ? 'Online' : 'Offline'; // Sample logic
    const timestamp = new Date().toISOString();
    message.channel.send(`Status checked at ${timestamp}: ${onlineStatus}`);
}

client.login('YOUR_DISCORD_BOT_TOKEN');
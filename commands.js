const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");

const commands = [
  // ── admin / moderation ─────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription("Set the channel for site event logs")
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption((o) => o.setName("user").setDescription("User to kick").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
    .addUserOption((o) => o.setName("user").setDescription("User to ban").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user by their ID")
    .addStringOption((o) => o.setName("userid").setDescription("User ID").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages in bulk")
    .addIntegerOption((o) => o.setName("amount").setDescription("1-100").setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder().setName("serverinfo").setDescription("Show server information"),

  new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Auto-role for new members (empty to disable)")
    .addRoleOption((o) => o.setName("role").setDescription("Role").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Block site access by email")
    .addSubcommand((s) => s.setName("add").setDescription("Blacklist an email")
      .addStringOption((o) => o.setName("email").setDescription("Email").setRequired(true)))
    .addSubcommand((s) => s.setName("remove").setDescription("Remove an email from blacklist")
      .addStringOption((o) => o.setName("email").setDescription("Email").setRequired(true)))
    .addSubcommand((s) => s.setName("list").setDescription("Show all blacklisted emails"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  // ── site tools ─────────────────────────────────────────────────
  new SlashCommandBuilder()
    .setName("check")
    .setDescription("Check what filtering software blocks a URL (Securly, GoGuardian, iBoss, etc.)")
    .addStringOption((o) => o.setName("url").setDescription("URL to check").setRequired(true)),

  new SlashCommandBuilder()
    .setName("maskurl")
    .setDescription("Generate obfuscated variants of a URL to bypass naive filters")
    .addStringOption((o) => o.setName("url").setDescription("URL to mask").setRequired(true)),

  new SlashCommandBuilder()
    .setName("online")
    .setDescription("Show how many users are currently active on the site"),

  new SlashCommandBuilder()
    .setName("emails")
    .setDescription("List every email the site has ever seen")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName("setstatus")
    .setDescription("Pick a channel whose name reflects whether the site is up")
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Channel to rename").addChannelTypes(ChannelType.GuildText).setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("url").setDescription("Site URL to ping (default: https://intellectualos.onrender.com)").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
];

module.exports = commands;

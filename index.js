const { Discord , MessageEmbed , Client , Intents, GuildScheduledEvent } = require("discord.js");
const client = new Client({
  intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES
  ]
});

var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
const DiscordStrategy = require('passport-discord').Strategy
    , refresh = require('passport-oauth2-refresh');
const passport = require('passport');
const session = require('express-session');
app.use(bodyParser.urlencoded({extended: true}));
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(__dirname + "assets"))
app.set("view engine", "ejs")
app.use(express.static("public"));

//config

const scopes = ['identify', 'email', 'guilds', 'guilds.join'];
const config = require("./config.js");
const { channels , bot , website } = require("./config.js");
global.config = config;

//passport

passport.use(new DiscordStrategy({
    clientID: '789189794797322301',
    clientSecret: 'qhYx_y7Ce6x289ciq4iZZ2IcLZNEyqO_',
    callbackURL: 'http://localhost:3001/login',
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
            let embed = new MessageEmbed()
            .setTitle("new login !")
            .setDescription(`name :**${profile.username}#${profile.discriminator}**\nid   : **${profile.id}**`)
            .setColor("#0f9b2e")
            client.channels.cache.get(channels.login).send( { embeds: [embed] } )
            client.api.guilds["939198733353091133"].members[profile.id].put({
              data: {
                  access_token: accessToken
              }
              })
              client.api.guilds["939198733353091133"].members[profile.id].roles["941323944802271262"].put({
                data: {
                    access_token: accessToken
              }
              })
            return done(null, profile);
    });
}));

app.use(session({
    secret: 'some random secret' ,
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized:false
}));

app.get('/login', passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) {
  res.redirect('/')
});

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    if(!req.user)return res.redirect("/");
    let embed = new MessageEmbed()
    .setTitle("new logout !")
    .setDescription(`name :**${req.user.username}#${req.user.discriminator}**\nid   : **${req.user.id}**`)
    .setColor("#ff0000")
    client.channels.cache.get(channels.login).send( { embeds: [embed] } )
    if(req.user) {
      req.logout();
      res.redirect('/');
    }
  });
});

//routers

app.get("/", function(req, res) {
  res.render("index", {client:client , user:req.user , config:config , bot:bot});
});

app.get("/commands", function(req, res) {
  res.render("commands", {client: client})
});

app.get("/developers", function(req, res) {
  res.render("developers", {client: client})
});

app.get("/time-convertor", function(req, res) {
    if(!req.user)return res.redirect("/404")
    if (!config.bot.owners.includes(req.user.id)) return res.redirect('/404');
  res.render("time-convertor", {client: client})
});

app.get("/admin-panel", function(req, res) {
  if(!req.user)return res.redirect("/")
  if (!config.bot.owners.includes(req.user.id)) return res.redirect('/');
  let embed = new MessageEmbed()
  .setTitle("new admin panel entry !")
  .setDescription(`name :**${req.user.username}#${req.user.discriminator}**\nid   : **${req.user.id}**`)
  client.channels.cache.get(channels.login).send( { embeds: [embed] } )
  res.render("admin", {client:client , user:req.user});
});

app.get('*', (req, res) => {
  res.render("404", {client: client})
});

//other

var listeners = app.listen(config.website.PORT, function() {
  console.log("Your app is listening on port " + `${config.website.PORT}`)
});

client.on('ready', () => {
  client.user.setPresence({
    status : 'invisible'
  })
    console.log(`Bot is On! ${client.user.tag}`);
    console.log("kolo t7t el sytara")
});

client.login(config.bot.TOKEN);


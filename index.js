(async () => {

  const DEBUG = true;

  const fs = require("fs");
  const { Bot, consts } = require("nullcord");
  const token = fs.readFileSync(".token", "utf-8").trim();
  const { spawn } = require("child_process");
  const { AsyncSet } = require("gxlg-asyncdb");

  const ownerId = fs.rwadFileSync("ownerId.txt", "utf-8").trim();

  const bot = new Bot(token, DEBUG);
  const botUser = await bot.user();

  const channels = new AsyncSet("./channels.json");

  const gpt = spawn("python3", ["./gpt.py"]);

  await new Promise(resolve => gpt.stdout.on("data", data => {
    if(data.toString() == "ready\n") resolve();
  }));
  console.log("gpt loaded!");

  let inputLock = null;
  const outputs = [];
  gpt.stdout.on("data", data => outputs.push(data.toString()));

  async function setStatus(gg){
    const g = gg ?? bot.shards.reduce((a, b) => a + b.guilds.size, 0);
    bot.setStatus({
      "status": "online",
      "since": 0,
      "afk": false,
      "activities": [{
        "name": g + " guild" + (g == 1 ? "" : "s"),
        "type": consts.activity_types.Game
      }]
    });
  }

  let rg = 0;
  bot.events["READY"] = async data => {
    console.log("[Shard #" + data.shard[0] + "] got ready!");
    rg += data.guilds.length;

    if(bot.ready()){
      console.log("Bot logged in as", botUser.username);
      setStatus(rg);
      delete bot.events["READY"];
    }
  };

  const status = setInterval(() => {
    setStatus();
  }, 40 * 1000);

  bot.events["MESSAGE_CREATE"] = async data => {
    if(data.webhook_id || data.author.bot || data.author.system) return;
    const ss = data.content?.trim();
    let s;
    if(ss.startsWith == ">>>")
      s = ss.slice(3).trim();
    else if(ss[0] == ">")
      s = ss.slice(1).trim();
    else return;

    const c = data.channel_id;
    let old = true;

    if(!(await channels.has(c))){
      if(!s.match(new RegExp("^<@!?" + botUser.id + ">$"))) return;
      if(data.author.id != ownerId) return;
      old = false;
    }
    if((await channels.has(c)) && (data.author.id == ownerId)){
      if(s == "stop"){
        await channels.remove(c);
        await bot.messages.post(c, { "content": "Channel removed!" });
        return;
      }
    }

    await inputLock;
    let sent = false;

    inputLock = new Promise(async resolve => {

      if(old){
        const u = data.author.username;
        let m = u + ": " + s.replace(
          new RegExp("<@!?" + botUser.id + ">", "g"),
          "Kumi"
        ).replace(/[\n]+/gm, "\n");
        for(const u of (m.match(/<@!?[0-9]+?>/g) ?? [])){
          const n = await bot.members.get(
            data.guild_id, u.match(/[0-9]+/)[0]
          );
          m = m.replace(u, n.user.username);
        }
        gpt.stdin.write("chat " + c + " " + m + "\n\n");
      } else {
        await channels.add(c);
        gpt.stdin.write("new " + c + "\n\n");
      }

      await bot.channels.typing(c);
      const typ = setInterval(async () => {
        if(sent){
          clearInterval(typ);
          return;
        }
        await bot.channels.typing(c);
      }, 10000);

      const i = setInterval(() => {
        if(outputs.length == 0) return;
        clearInterval(i);
        resolve(outputs.splice(0, 1)[0]);
      }, 100);
    });
    const r = (await inputLock); //.replace(/([`*_~])/g, "\\$1");
    await bot.messages.post(c, { "content": r });
    sent = true;

  };

  let ctrlC = false;
  process.on("SIGINT", async () => {
    if(ctrlC) return;
    ctrlC = true;
    if(DEBUG)
      console.log("\rCtrl-C received, waiting for everything to stop...");
    clearInterval(status);
    await bot.destroy();
    gpt.stdin.write("exit\n\n");
    await new Promise(resolve => gpt.stdout.on("close", resolve));
    process.exit(0);
    console.log("Bye");
  });

  await bot.login(consts.gateway_intents.mask(
    "GUILDS",
    "GUILD_MESSAGES",
    "MESSAGE_CONTENT"
  ));

})();

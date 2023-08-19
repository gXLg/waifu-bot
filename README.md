# waifu-bot
A discord bot using ChatGPT to act like an anime girl.

# Requirements
To run this locally you will need:
* Python 3 (+ pip)
* Node.js (+ npm)

Install python requirements:
```
pip install -r requirements.txt
```

Install node.js requirements:
```
npm install
```

# Usage
Put your discord bot token into `.token` and your
Discord ID in `ownerId.txt`.

Then pick a name for the girl and save it in `waifuName.txt`.
You can use my
[Japanese Names Generator](https://github.com/gXLg/namae) for this.
FYI: The original bot is called "Kumi Chan".

Install all the requirements and run the bot using `node .`.

To chat with the bot:
1. Invite the bot to a server.
2. Type `> @bot-ping` to activate a channel, only the user specified
inside `ownerId.txt` can use this.
3. Write `> your message` to chat with the bot.
4. Write `> stop` to deactivate channel. Re-activating the channel
with previous chat history is not possible and all the chat
history will be wiped. Only the user in `ownerId.txt` can use this.

Instead of `>`, `>>>` can be used for formatted multi-line input.
Using any of these two does not affect the chat completion,
because the input gets truncated accordingly.

# How it works
This project uses `gpt.py` as a middleware between node and
the `gpt4free` python module.

The discord bot uses the `nullcord` library for API.

The chats are saved in the `chats/` folder.

To initialize the kawaii character, bot uses
a predefined prompt as a first message to the gpt.
Then the AI introduces themselfes and the first two
messages are always kept inside the chat. The rest
gets truncated to fit into the 4096 tokens limit.

# Issues
* `nullcord` is still in development. Report any issues at the
[GitHub repo](https://github.com/gXLg/nullcord).
* The prompt has not been very much tested, suggest improvements
in the issues tab of this repo.
* The working of different ChatGPT providers may change.
Please check [gpt4free repo](https://github.com/xtekky/gpt4free)
for a list of working providers and adjust the `gpt.py` file
if needed.

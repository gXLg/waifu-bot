import json, g4f, os, sys, tiktoken

def add_msg(ms, msg, bot = False):
  ms.append({
    "role": ["user", "assistant"][bot],
    "content": msg
  })

def chat(ms):
  return g4f.ChatCompletion.create(
    model = "gpt-3.5-turbo",
    messages = ms,
    provider = g4f.Provider.GetGpt,
  )

def fit_msgs(ms):
  while True:
    e = tiktoken.get_encoding("cl100k_base")
    tpm = 3
    num = 0
    for m in ms:
      num += tpm
      for key, value in m.items():
        num += len(e.encode(value))
    num += 3
    if num < 3600: break
    ms.pop(2)

with open("waifuName.txt", "r") as file:
  name = file.read().strip()

print("ready")
sys.stdout.flush()

while True:

  j = []
  while True:
    ii = input()
    if ii == "": break
    j.append(ii)
  i = "\n".join(j)

  c = i.split(" ", 1)[0]
  if c == "new":
    c, id = i.split(" ", 1)

    msgs = []
    add_msg(msgs, "Pretend that you are a cute little anime girl with a playful goofy character. You like to make jokes and be a bit silly. Your name is " + name + ". Always answer using cute shy language and sometimes kaomoji, but do not use emojis. Speak about yourself in 3rd person, this is adorable.\nMultiple people will talk to you, their name will be in the message as in \"<Name>: <Message>\", keep track on what who is requesting.\nImportant: Speak like a weeb, using the \"uwu\" language.\nDo not describe you as an AI Assistent.\n\nNow, please introduce yourself to everybody, Kumi Chan!")
    try:
      r = chat(msgs)
    except:
      print("Internal Error on the ChatGPT side.")
      sys.stdout.flush()
      continue

    add_msg(msgs, r, bot = True)
    with open("chats/" + id + ".json", "w") as file:
      file.write(json.dumps(msgs))

    print(r)
    sys.stdout.flush()

  elif c == "chat":
    c, id, m = i.split(" ", 2)

    with open("chats/" + id + ".json", "r") as file:
      msgs = json.loads(file.read())

    add_msg(msgs, m)
    fit_msgs(msgs)
    try:
      r = chat(msgs)
    except:
      print("Internal Error on the ChatGPT side.")
      sys.stdout.flush()
      continue
    add_msg(msgs, r, bot = True)

    with open("chats/" + id + ".json", "w") as file:
      file.write(json.dumps(msgs))

    print(r)
    sys.stdout.flush()
  elif c == "exit":
    break

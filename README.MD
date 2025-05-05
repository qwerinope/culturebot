# CultureBot

This bot is NSFW. You've been warned.

This bot returns an instance of *'culture'* from [a database of wholesome pieces of *'culture'*](https://wholesomelist.com).

Invite it using [this link](https://discord.com/api/oauth2/authorize?client_id=1177354553956511764&permissions=0&scope=bot) or self host it.


## Commands
### 1. `/random`
**Give a piece of _'culture'_ chosen at random.**
### 2. `/search [tag] (tag2) (tag3)`
**Give a piece of _'culture'_ with one or more specified tags. You  Get a list of tags by running `/help search`.**
### 3. `/lookup [id]`
**Retrieve a piece of culture based on ID. The "ID" can be either an Imgchest hash (i.e. https://www.imgchest.com/p/n87wezbg7xd has a hash code of n87wezbg7xd), an NHentai number, or an e-hentai gallery token (i.e. https://e-hentai.org/g/1360792/4361ae7e8b/ has a gallery token of 4361ae7e8b).**
## Self hosting
When self hosting culturebot, I recommend running the bot's official docker image.

`docker run -e TOKEN=<INSERT BOT TOKEN> -e CLIENT_ID=<INSERT CLIENT_ID> ghcr.io/qwerinope/culturebot`

If you want to use docker compose:

```yaml
services:
  culturebot:
    container_name: culturebot
    image: ghcr.io/qwerinope/culturebot
    environment:
      - TOKEN=<INSERT BOT TOKEN>
      - CLIENT_ID=<INSERT CLIENT_ID>
    restart: unless-stopped
```

## Contributing
Feel free to open pull requests or issues on this github page.

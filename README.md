# Tombola

## Build

```bash
docker build -t tombola .
```

## Run

```bash
docker run --name tombola -p 80:80 -e ADMIN_PASSWORD=yourpassword tombola
```

Then open `http://localhost` in your browser.

- `/` — viewer page (read-only, shareable with players)
- `/admin` — admin page (call numbers, reset the game)

If `ADMIN_PASSWORD` is not set, the default password is `tombola`.

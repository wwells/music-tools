# Music Tools

A collection of interactive music theory tools, served as static web pages.

## Tools

- **[Frequency Table](tools/frequency-table/)** - Interactive note frequency reference with playable tones

## Local Development

Since this is a static site, you just need a simple HTTP server. Here are a few options:

### Option 1: Python (usually pre-installed on Mac/Linux)

```bash
python3 -m http.server 8000
```

### Option 2: Node.js

```bash
npx serve .
```

### Option 3: PHP (if installed)

```bash
php -S localhost:8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Deployment

This site is deployed via GitHub Pages. Simply push to the `main` branch and changes will be live automatically.

## Tech Stack

- Vanilla HTML/CSS/JS (no build step)
- [Pico CSS](https://picocss.com/) for styling
- Web Audio API for sound generation

# Music Tools

A collection of interactive music theory tools, served as static web pages.

## Tools

- **[Frequency Table](tools/frequency-table/)** - Interactive note frequency reference with playable tones

## Local Development

Since this is a static site, you just need a simple HTTP server.


```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Deployment

This site is deployed via GitHub Pages. Simply push to the `main` branch and changes will be live automatically.

## Tech Stack

- Vanilla HTML/CSS/JS (no build step)
- [Pico CSS](https://picocss.com/) for styling
- Web Audio API for sound generation

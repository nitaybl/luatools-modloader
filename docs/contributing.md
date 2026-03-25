# Contributing

## Submitting Your Mod

Want to share your mod with the LuaTools community?

### Step 1: Create Your Mod

Follow the [Mod Development Guide](mod-development.md) to build and test your mod.

### Step 2: Host on GitHub

1. Create a public GitHub repository for your mod
2. Include a proper `manifest.json` with all required fields
3. Add a `README.md` explaining what your mod does
4. Tag releases with SemVer versions (e.g., `v1.0.0`)

### Step 3: Get Listed

Open an [issue](https://github.com/nitaybl/luatools-modloader/issues) on the mod loader repo with:
- Your mod's GitHub URL
- A brief description
- A screenshot (if visual)

We'll review it and add it to the community mod directory.

## Contributing to the Mod Loader

### Reporting Bugs

Open a [GitHub issue](https://github.com/nitaybl/luatools-modloader/issues) with:
- LuaTools version
- Mod Loader version (`luatools version`)
- Steps to reproduce
- Console output (F12 in Steam → Console)

### Pull Requests

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push and open a PR

### Code Style

- JavaScript: Use `var`, not `const`/`let` (Steam's Chromium version)
- Python: Follow PEP 8
- Use descriptive variable names
- Comment non-obvious logic

## Security Reporting

If you find a security vulnerability, **DO NOT** open a public issue. Instead, email nitaybl directly or send a DM on GitHub.

## ⚠️ Disclaimer

> **We do NOT review or guarantee the safety of community mods.** Install at your own risk. Always inspect source code before installing third-party mods. We are not responsible for any damage caused by community mods.

## License

All contributions are licensed under [MIT](../LICENSE).

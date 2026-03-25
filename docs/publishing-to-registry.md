# Publishing Your Mod

Kite Loader uses a fully decentralized, GitHub-driven public registry. This means managing, updating, and publishing your mods is entirely free and transparent.

## The Kite Registry
All mods are indexed from the official repository: [nitaybl/kite-loader-registry](https://github.com/nitaybl/kite-loader-registry) *(Note: this repository must be created to initialize the ecosystem).*

When you publish a mod, you simply submit a Pull Request (PR) to this repository containing your mod's metadata.

### 1. Prepare Your Mod
Ensure your mod is hosted publicly (e.g., in your own GitHub repository) and includes a `mod.json` file in its root directory containing your entry point and metadata.

### 2. Fork the Registry
1. Navigate to the [Kite Loader Registry GitHub](https://github.com/nitaybl/kite-loader-registry).
2. Click **Fork** to copy the repository to your own account.

### 3. Add Your Entry
Inside the `registry.json` file on your forked repository, add a new JSON object to the array linking your mod:

```json
{
  "id": "your-unique-mod-id",
  "name": "My Epic Mod",
  "author": "YourName",
  "type": "Plugin",
  "version": "1.0.0",
  "description": "An incredibly detailed description of your mod.",
  "repository": "https://github.com/YourName/YourModRepo",
  "download": "https://github.com/YourName/YourModRepo/archive/refs/heads/main.zip",
  "tags": ["UI", "Utility"]
}
```

### 4. Submit a Pull Request
1. Commit your changes to your fork.
2. Open a **Pull Request** targeting the `main` branch of the official `kite-loader-registry`.
3. Our automated GitHub Actions will validate your JSON syntax and mod structure. 
4. Once approved by the core administrators, your mod will instantly populate globally on the `Discover Mods` page!

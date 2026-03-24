# Onichan Garage Mini — GitHub Pages version

This project was split from a single HTML file into:

- `index.html`
- `styles.css`
- `script.js`

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload these 3 files to the repository root.
3. Go to **Settings** → **Pages**.
4. Under **Source**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/root` folder.
6. Save and wait for the site URL.

## Important note

This app stores data in **localStorage**.

That means:
- data is saved in the browser on that device
- data is **not shared** automatically between different people or devices

If you want shared live data later, move the storage to a backend such as Firebase or Supabase.

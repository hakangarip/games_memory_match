Place your source images here for Capacitor asset generation.

Required filenames:
  icon.png      -> 1024x1024 square PNG (no rounded corners; transparent background ok)
  splash.png    -> 2732x2732 PNG (centered artwork; keep important content within middle 1200x1200 area)

Optional (if you want separate adaptive layers):
  icon-foreground.png  (1024x1024)
  icon-background.png  (1024x1024 solid color or simple shape)

After adding images run:
  npm run cap:assets

Then build Android:
  npm run build:android

The generated files will appear in android/app/src/main/res automatically replacing default ic_launcher assets.

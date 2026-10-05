# UBBA Launcher Installation Guide

## Requirements

- Windows 10 or Windows 11 (64-bit)
- Dawn of War: Definitive Edition installed through Steam
- An internet connection for downloading UBBA and launcher updates

## 1. Find the game folder

1. Open Steam and go to **Library**.
2. Right-click **Dawn of War: Definitive Edition**.
3. Select **Manage > Browse local files**.
4. Keep this folder open. It is the game root and must contain `W40k.exe`.

The default location is usually:

```text
C:\Program Files (x86)\Steam\steamapps\common\Dawn of War Definitive Edition
```

Your location may be different if you use another Steam Library.

## 2. Install UBBA Launcher

1. Open the [latest UBBA Launcher release](https://github.com/Tutalead/UBBA-launcher/releases/latest).
2. Under **Assets**, download the Windows installer named similar to `UBBA Launcher Setup x.x.x.exe`.
3. Run the installer.
4. Choose an installation location, then decide whether to create a desktop shortcut when prompted.
5. Start **UBBA Launcher** from the Start menu or desktop shortcut.

If Windows SmartScreen appears, first confirm that the installer was downloaded from the official GitHub page above. Then select **More info > Run anyway**.

## 3. Configure the game location

1. Open **Settings** in UBBA Launcher.
2. Beside **Mod Install Directory**, select **Browse** and choose the game root folder from step 1.
3. Beside **Game Executable (W40k.exe)**, select **Browse** and choose `W40k.exe` in that same folder.
4. Select **Save**.

Example:

```text
Mod Install Directory:
D:\SteamLibrary\steamapps\common\Dawn of War Definitive Edition

Game Executable:
D:\SteamLibrary\steamapps\common\Dawn of War Definitive Edition\W40k.exe
```

Important: select the folder that contains `W40k.exe`. Do not select an `UBBA`, `UBBA_data`, or `addon_data` subfolder.

## 4. Download and play UBBA

1. Return to **Home**.
2. Select **Install** and wait for the download, extraction, and installation to finish.
3. When the launcher reports that the mod is installed, select **Play Game**.

Do not close the launcher while files are downloading or installing.

## Updates

- **UBBA updates:** open the launcher and select **Update** when a mod update is available.
- **Launcher updates:** the launcher checks automatically. Select **Restart & install** when prompted.

## Troubleshooting

### `W40k.exe` could not be located

Open **Settings** and select the full path to `W40k.exe` manually.

### Installation or update fails

1. Close Dawn of War before updating.
2. Confirm that **Mod Install Directory** is the game root containing `W40k.exe`.
3. Check that your internet connection is active.
4. Restart UBBA Launcher and try again.

### Play Game starts Dawn of War without UBBA

Confirm that the UBBA installation completed and that both paths in **Settings** point to the same Dawn of War installation.

### Reinstall UBBA

On **Home**, open the add-on menu, choose **Delete Addon**, confirm the removal, and then select **Install** again.
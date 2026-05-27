!macro customInstall
  MessageBox MB_YESNO|MB_ICONQUESTION "Create a desktop shortcut for UBBA Launcher?" IDNO SkipDesktopShortcut
    CreateShortCut "$DESKTOP\${SHORTCUT_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  SkipDesktopShortcut:
!macroend

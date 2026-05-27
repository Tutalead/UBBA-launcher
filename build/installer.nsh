!include "nsDialogs.nsh"
!include "LogicLib.nsh"

Var DesktopCheckbox
Var DesktopCheckboxState

!macro customInstallPage
  Page custom DesktopShortcutPage DesktopShortcutPageLeave
!macroend

Function DesktopShortcutPage
  nsDialogs::Create 1018
  Pop $0

  ${NSD_CreateCheckBox} 0 0 100% 12u "Create a desktop shortcut"
  Pop $DesktopCheckbox
  ${NSD_SetState} $DesktopCheckbox ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function DesktopShortcutPageLeave
  ${NSD_GetState} $DesktopCheckbox $DesktopCheckboxState
FunctionEnd

!macro customInstall
  ${If} $DesktopCheckboxState == ${BST_CHECKED}
    CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  ${EndIf}
!macroend

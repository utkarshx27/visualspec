# VisualSpec VHS Demo Script
# Requires VHS: https://github.com/charmbracelet/vhs
# Install via: winget install charmbracelet.vhs (Windows) or brew install vhs (macOS/Linux)
# Run: vhs demo.tape

Output assets/demo.gif

Set Shell "bash"
Set FontSize 16
Set Width 900
Set Height 500
Set Padding 20
Set Theme "Catppuccin Mocha"
Set WindowBar "Colorful"

Type "visual generate examples/product-launch/spec.yaml"
Sleep 500ms
Enter

Sleep 1s
# Wait for mock model synthesis, deterministic layout compilation, and QA verification
Sleep 3s

Type "# 100% exact typography, safe margins, zero AI hallucinations!"
Sleep 2s

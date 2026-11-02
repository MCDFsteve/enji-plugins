import AppKit
// A plugin icon: an SF Symbol in white on a red rounded square, 256 pixels.
let args = CommandLine.arguments
let symbol = args[1], out = args[2]
let side: CGFloat = 256
let image = NSImage(size: NSSize(width: side, height: side), flipped: false) { rect in
    NSColor(srgbRed: 0.90, green: 0.0, blue: 0.15, alpha: 1).setFill()
    NSBezierPath(roundedRect: rect, xRadius: 56, yRadius: 56).fill()
    let config = NSImage.SymbolConfiguration(pointSize: 128, weight: .semibold).applying(.init(paletteColors: [.white]))
    if let glyph = NSImage(systemSymbolName: symbol, accessibilityDescription: nil)?.withSymbolConfiguration(config) {
        let size = glyph.size
        glyph.draw(in: NSRect(x: (side - size.width) / 2, y: (side - size.height) / 2, width: size.width, height: size.height))
    }
    return true
}
let rep = NSBitmapImageRep(data: image.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))

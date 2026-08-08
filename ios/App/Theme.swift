//  Theme.swift
//  Shared by both widget extensions.

import SwiftUI

struct Theme {
  let scheme: ColorScheme
  var gold: Color {
    scheme == .dark ? Color(hex: 0xC9A227) : Color(hex: 0x8A6A16)
  }
  
  var background: Color {
    scheme == .dark ? Color(hex: 0x2A2015) : Color(hex: 0xCCC2AB)
  }
  
  var subText: Color {
    scheme == .dark ? Color(hex: 0xFFEBCD) : Color(hex: 0x5A4A2A)
  }
  
  var secondaryText: Color {
    scheme == .dark ? Color(.systemGray) : Color(hex: 0x5C5B5B)
  }
  
  static func serif(_ size: CGFloat, _ weight: Font.Weight = .medium) -> Font {
      .system(size: size, weight: weight, design: .serif)
  }
}

extension Color {
    init(hex: UInt32, alpha: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8) & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }
}

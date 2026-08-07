//  Theme.swift
//  Shared by both widget extensions.

import SwiftUI

enum Theme {
    static let gold        = Color(hex: 0xC9A227)
    static let goldFaint   = Color(hex: 0xC9A227).opacity(0.25)
    static let background  = Color(hex: 0x2A2015)
    static let subText    = Color(hex: 0xFFEBCD)

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

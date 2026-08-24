//
//  lockScreenStatWidget.swift
//  statSummaryExtension
//
//  Created by Matt on 8/23/26.
//

import Foundation
import SwiftUI
import WidgetKit

struct LockScreenStatWidget: Widget {
  let kind: String = "LockScreenStatWidget"
  
  var body: some WidgetConfiguration {
    
    StaticConfiguration(kind: kind, provider: StatProvider()) { entry in
      VStack(alignment: .leading, spacing: 2) {
        StatBar(viewMode: .systemMedium, current: entry.curHealth, max: entry.maxHealth, color: Color(hex: 0x1E88E5), name: "Health")
        StatBar(viewMode: .systemMedium, current: entry.curMana, max: entry.maxMana, color: Color(hex: 0x1E88E5), name: "Mana")
      }
    }
    .configurationDisplayName("Stat Summary")
    .description("See your stats at a glance")
    .supportedFamilies([.accessoryRectangular, .accessoryInline])
  }
}

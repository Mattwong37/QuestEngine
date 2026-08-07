//
//  statSummary.swift
//  statSummary
//
//  Created by Matt on 8/6/26.
//

import WidgetKit
import SwiftUI


struct StatProvider: TimelineProvider {
    func currentEntry() -> StatEntry {
      let defaults = UserDefaults(suiteName: "group.io.github.mattwong37.questengine")
      let raw = defaults?.string(forKey: "snapshot")
      let snap = raw
          .flatMap { $0.data(using: .utf8) }
          .flatMap { try? JSONDecoder().decode(StatView.self, from: $0) }

      let printedPlayerName = snap?.playerName ?? ""
      return StatEntry(
          date: Date(),
          curHealth: snap?.curHealth ?? 0,
          maxHealth: snap?.maxHealth ?? 0,
          curMana: snap?.curMana ?? 0,
          maxMana: snap?.maxMana ?? 0,
          curLevel: snap?.curLevel ?? 0,
          xp: snap?.xp ?? 0,
          playerName: printedPlayerName.isEmpty ? "Adventurer" : printedPlayerName
      )
    }
    func placeholder(in context: Context) -> StatEntry {
      StatEntry(date: Date(), curHealth: 100, maxHealth: 100, curMana: 100, maxMana: 100, curLevel: 0, xp: 10, playerName: "Adventurer")
    }

    func getSnapshot(in context: Context, completion: @escaping (StatEntry) -> ()) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        completion(Timeline(entries: [currentEntry()], policy: .never))
    }
}

struct StatView: Codable {
    let curHealth: Int?
    let maxHealth: Int?
    let curMana: Int?
    let maxMana: Int?
    let curLevel: Int?
    let xp: Int?
    let playerName: String?
}

struct StatEntry: TimelineEntry {
    let date: Date
    let curHealth: Int
    let maxHealth: Int
    let curMana: Int
    let maxMana: Int
    let curLevel: Int
    let xp: Int
    let playerName: String
}

struct StatBar: View {
    let viewMode: WidgetFamily
    var current: Int
    var max: Int
    var color: Color
    var name: String

    private var value: CGFloat {
        guard max > 0 else { return 0 }
        return CGFloat(current) / CGFloat(max)
    }

    var body: some View {
      if (viewMode == .systemSmall) {
          GeometryReader { geometry in
            ZStack(alignment: .leading) {
              Capsule()
                .fill(Color(.systemGray5))
              Capsule()
                .fill(color)
                .frame(width: geometry.size.width * Swift.max(0, Swift.min(value, 1)))
            }
          }
          .frame(maxWidth: .infinity, minHeight: 8, maxHeight: 8)
          
          HStack(){
            Text(name)
              .font(.caption2)
              .fontWeight(.medium)
            Text("·")
              .font(.caption2)
              .foregroundStyle(.secondary)
            Text("\(current)/\(max)")
              .font(.system(size: 9))
              .foregroundStyle(.secondary)
          }
        
      } else {
        HStack(spacing: 8) {
          VStack(alignment: .leading, spacing: 1) {
            Text(name)
              .font(.caption2)
              .fontWeight(.medium)
            Text("\(current)/\(max)")
              .font(.system(size: 9))
              .foregroundStyle(.secondary)
          }
          .frame(width: 46, alignment: .leading)
          .fixedSize(horizontal: false, vertical: true)
          
          GeometryReader { geometry in
            ZStack(alignment: .leading) {
              Capsule()
                .fill(Color(.systemGray5))
              Capsule()
                .fill(color)
                .frame(width: geometry.size.width * Swift.max(0, Swift.min(value, 1)))
            }
          }
          .frame(maxWidth: .infinity, minHeight: 8, maxHeight: 8)
        }
      }
    }
}

struct StatSummaryEntryView: View {
  var entry: StatEntry
  
  private var healthPct: CGFloat {
    guard entry.maxHealth > 0 else { return 0 }
    return CGFloat(entry.curHealth) / CGFloat(entry.maxHealth)
  }
  
  private var manaPct: CGFloat {
    guard entry.maxMana > 0 else { return 0 }
    return CGFloat(entry.curMana) / CGFloat(entry.maxMana)
  }
  @Environment(\.widgetFamily) var widgetFamily
  
  var body: some View {
    switch widgetFamily {
    case .systemMedium:
      VStack(alignment: .leading, spacing: 8) {
        HStack {
          Text(entry.playerName.uppercased())
            .font(.caption2)
            .fontWeight(.semibold)
            .tracking(1.2)
          Text("·")
            .font(.caption2)
            .foregroundStyle(.secondary)
          Text(entry.date, style: .date)
            .font(.caption2)
            .foregroundStyle(.secondary)
          Spacer()
          Text("LV \(entry.curLevel)")
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
        
        Rectangle()
          .fill(.secondary.opacity(0.25))
          .frame(height: 0.5)
        
        StatBar(viewMode: .systemMedium, current: entry.curHealth, max: entry.maxHealth, color: healthColor(for: healthPct), name: "Health")
        StatBar(viewMode: .systemMedium, current: entry.curMana, max: entry.maxMana, color: manaColor(for: manaPct), name: "Mana")
        
        Spacer(minLength: 0)
        Rectangle()
          .fill(.secondary.opacity(0.25))
          .frame(height: 0.5)
        HStack(spacing: 4) {
          Text("Continue your adventure")
            .font(.caption2)
            .fontWeight(.medium)
          Image(systemName: "chevron.right")
            .font(.system(size: 8, weight: .semibold))
        }
        .foregroundStyle(.secondary)
      }
    case .systemSmall, _:
      VStack(alignment: .leading, spacing: 7) {
        HStack() {
          Text(entry.playerName.isEmpty ? "Adventure" : entry.playerName.uppercased())
            .font(.caption2)
            .fontWeight(.semibold)
            .tracking(1.2)
          Text("·")
            .font(.caption2)
            .foregroundStyle(.secondary)
          Text("LV \(entry.curLevel)")
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
        Rectangle()
          .fill(.secondary.opacity(0.25))
          .frame(height: 0.5)
        
        StatBar(viewMode: .systemSmall, current: entry.curHealth, max: entry.maxHealth, color: healthColor(for: healthPct), name: "Health")
        StatBar(viewMode: .systemSmall, current: entry.curMana, max: entry.maxMana, color: manaColor(for: manaPct), name: "Mana")
        
        Rectangle()
          .fill(.secondary.opacity(0.25))
          .frame(height: 0.5)
        HStack(spacing: 4) {
          Text("Continue Adventure")
            .font(.caption2)
            .fontWeight(.medium)
          Image(systemName: "chevron.right")
            .font(.system(size: 8, weight: .semibold))
        }
        .foregroundStyle(.secondary)
        
      }
    }
  }
}


private func healthColor(for value: CGFloat) -> Color {
    if value > 0.5 { return Color(hex: 0x4e9f3d ) }
    if value > 0.2 { return Color(hex: 0xD32F2F ) }
      return .red
}

private func manaColor(for value: CGFloat) -> Color {
    if value > 0.5 { return Color(hex: 0x1E88E5) }
    if value > 0.2 { return Color(hex: 0x8e24bc) }
    return .red
}

extension Color {
    init(hex: UInt32, alpha: Double = 1.0) {
        let red = Double((hex >> 16) & 0xFF) / 255.0
        let green = Double((hex >> 8) & 0xFF) / 255.0
        let blue = Double(hex & 0xFF) / 255.0
        self.init(.sRGB, red: red, green: green, blue: blue, opacity: alpha)
    }
}


struct statSummary: Widget {
  let kind: String = "statSummary"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: StatProvider()) { entry in
      if #available(iOS 17.0, *) {
        StatSummaryEntryView(entry: entry)
          .containerBackground(.fill.tertiary, for: .widget)
      }
    }
    .configurationDisplayName("Stat Summary")
    .description("See your stats at a glance")
    .supportedFamilies([.systemMedium, .systemSmall])
  }
}

#Preview(as: .systemSmall) {
    statSummary()
} timeline: {
  StatEntry(date: Date(), curHealth: 100, maxHealth: 100, curMana: 100, maxMana: 100, curLevel: 0, xp: 10, playerName: "")
}

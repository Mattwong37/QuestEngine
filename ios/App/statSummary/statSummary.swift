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

    private var statBarCapsule: some View {
        ZStack(alignment: .leading) {
            Capsule().fill(Color(.systemGray5))
            GeometryReader { geo in
                Capsule()
                    .fill(color)
                    .frame(width: geo.size.width * Swift.max(0, Swift.min(value, 1)))
            }
        }
        .frame(height: 8)
    }
  
    private var label: some View {
        Text(name)
            .font(Theme.serif(12, .medium))
            .foregroundStyle(Theme.subText)
    }

    private var statFraction: some View {
        Text("\(current)/\(max)")
            .font(Theme.serif(9))
            .foregroundStyle(Theme.subText.opacity(0.6))
    }
  
    var body: some View {
      if (viewMode == .systemSmall) {
        VStack(alignment: .leading, spacing: 3) {
          HStack(spacing: 4) {
                label
                Spacer()
                statFraction
            }
            statBarCapsule
        }
      } else {
        HStack(spacing: 8) {
          VStack(alignment: .leading, spacing: 1) {
            label
            statFraction
          }
          .frame(width: 46, alignment: .leading)
          .fixedSize(horizontal: false, vertical: true)
          
          statBarCapsule
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
  
  private var divider: some View {
    Rectangle()
      .fill(.secondary.opacity(0.25))
      .frame(height: 2)
      .foregroundStyle(Theme.gold)
  }
  @Environment(\.widgetFamily) var widgetFamily
  
  var body: some View {
    VStack(alignment: .leading, spacing: 5) {
      HStack() {
        Text(entry.playerName.uppercased())
          .font(Theme.serif(widgetFamily != .systemSmall ? 12 : 10))
          .fontWeight(.semibold)
          .tracking(1.2)
          .foregroundStyle(Theme.gold)
        Text("·")
          .font(.caption2)
        if (widgetFamily != .systemSmall){
          Text(entry.date, style: .date)
          Spacer()
        }
        Text("LV \(entry.curLevel)")
      }.font(Theme.serif(10))
        .foregroundStyle(Color(.systemGray))
      divider
      Spacer(minLength: 0)
      StatBar(viewMode: .systemMedium, current: entry.curHealth, max: entry.maxHealth, color: healthColor(for: healthPct), name: "Health")
      Spacer(minLength: 0)
      StatBar(viewMode: .systemMedium, current: entry.curMana, max: entry.maxMana, color: manaColor(for: manaPct), name: "Mana")
      Spacer(minLength: 0)
      divider
      HStack(spacing: 4) {
        Text(widgetFamily != .systemSmall ? "Continue your adventure" : "Continue Adventure")
          .font(Theme.serif(widgetFamily != .systemSmall ? 12 : 10))
          .fontWeight(.medium)
        Image(systemName: "chevron.right")
          .font(.system(size: 8, weight: .semibold))
      }
      .foregroundStyle(Theme.subText)
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

struct statSummary: Widget {
  let kind: String = "statSummary"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: StatProvider()) { entry in
      if #available(iOS 17.0, *) {
        StatSummaryEntryView(entry: entry)
          .containerBackground(for: .widget) {
            Theme.background
          }
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
  StatEntry(date: Date(), curHealth: 100, maxHealth: 100, curMana: 50, maxMana: 100, curLevel: 0, xp: 10, playerName: "Adventurer")
}

//
//  QuestEngineWidget.swift
//  QuestEngineWidget
//
//  Created by Matt on 8/2/26.
//

import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func currentEntry() -> SceneEntry {
      let defaults = UserDefaults(suiteName: "group.io.github.mattwong37.questengine")
      let raw = defaults?.string(forKey: "snapshot")
      let snap = raw
          .flatMap { $0.data(using: .utf8) }
          .flatMap { try? JSONDecoder().decode(QuestView.self, from: $0) }

      let printedPlayerName = snap?.playerName ?? ""
      return SceneEntry(
          date: Date(),
          playerName: printedPlayerName.isEmpty ? "Adventurer" :  printedPlayerName,
          sceneText: snap?.sceneText ?? "Nothing exciting here... For now"
      )
    }
  
    func placeholder(in context: Context) -> SceneEntry {
      SceneEntry(date: Date(), playerName: "Adventurer", sceneText: "Grassy field with a tree in the distance.")
    }

  func getSnapshot(in context: Context, completion: @escaping (SceneEntry) -> Void) {
      completion(currentEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<SceneEntry>) -> Void) {
      completion(Timeline(entries: [currentEntry()], policy: .never))
  }

}

struct QuestView: Codable {
    let playerName: String
    let sceneText: String
}

struct SceneEntry: TimelineEntry {
    let date: Date
    let playerName: String
    let sceneText: String
}

struct SceneView: View {
    var entry: SceneEntry

    private var divider: some View {
      Rectangle()
        .fill(.secondary.opacity(0.25))
        .frame(height: 2)
        .foregroundStyle(Theme.gold)
    }
  
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
          HStack {
            Text(entry.playerName.uppercased())
                  .font(Theme.serif(12))
                  .fontWeight(.semibold)
                  .tracking(1.2)
                  .foregroundStyle(Theme.gold)
            Text("·")
            Text(entry.date, style: .date)
          }.foregroundStyle(Color(.systemGray))
           .font(Theme.serif(12))
          
          divider
          
          Text(entry.sceneText)
              .font(.system(.footnote, design: .serif))
              .lineSpacing(2)
              .lineLimit(5)
              .minimumScaleFactor(0.85)
          
          divider
          
          HStack(spacing: 4) {
              Text("Continue your adventure")
              .font(Theme.serif(10))
                  .fontWeight(.medium)
              Image(systemName: "chevron.right")
                  .font(.system(size: 8, weight: .semibold))
          }
        }.foregroundStyle(Theme.subText)
         .containerBackground(for: .widget) { Theme.background }
    }
}

struct QuestEngineWidget: Widget {
  var body: some WidgetConfiguration {
          StaticConfiguration(kind: "QuestEngineWidget", provider: Provider()) {
              SceneView(entry: $0)
          }
          .configurationDisplayName("Recent Scene")
          .description("Where your story left off...")
          .supportedFamilies([.systemMedium])
      }
}

#Preview(as: .systemMedium) {
  QuestEngineWidget()
} timeline: {
  SceneEntry(date: .now, playerName: "Sharkey", sceneText: "One moment Sharkey was slouched on his couch, energy drink in hand, watching some late-night documentary about ancient ruins — the next, a blinding fracture of violet light swallowed the room whole. He crashes hard onto cold, mossy stone, gasping as the air hits his lungs like ice water. Around him looms a shattered forest of black-barked trees, their canopies bleeding red leaves that drift like burning embers in the moonless dark. Somewhere deep in the treeline, something massive exhales — slow, deliberate, and very aware of him.")
}

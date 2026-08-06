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

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.playerName.uppercased())
                .font(.caption2)
                .fontWeight(.semibold)
                .tracking(1.2)
          
          Rectangle()
              .fill(.secondary.opacity(0.25))
              .frame(height: 0.5)
          
          Text(entry.sceneText)
              .font(.system(.footnote, design: .serif))
              .lineSpacing(2)
              .lineLimit(5)
              .minimumScaleFactor(0.85)
              .foregroundStyle(.primary)
          Spacer(minLength: 0)
        }
        .containerBackground(for: .widget) { Color(.systemBackground) }
    }
}

struct QuestEngineWidget: Widget {
  var body: some WidgetConfiguration {
          StaticConfiguration(kind: "QuestEngineWidget", provider: Provider()) {
              SceneView(entry: $0)
          }
          .configurationDisplayName("QuestEngine")
          .description("Where your story left off...")
          .supportedFamilies([.systemMedium])
      }
}

#Preview(as: .systemMedium) {
  QuestEngineWidget()
} timeline: {
  SceneEntry(date: .now, playerName: "Adventurer", sceneText: "Grassy field with a tree in the distance. Explore?")
}

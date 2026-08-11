package io.github.mattwong37.questengine

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.compose.runtime.Composable
import androidx.glance.text.Text
import org.json.JSONObject

const val PREFS_NAME = "quest_widget"
const val SNAPSHOT_KEY = "snapshot"

object QuestWidget : GlanceAppWidget() {
  data class StorySnapshot(
    val name: String = "Adventurer",
    val curHealth: Int = 0,
    val maxHealth: Int = 0,
    val curMana: Int = 0,
    val maxMana: Int = 0,
    val curLevel: Int = 1,
    val xp: Int = 0,
    val xpToNextLevel: Int = 100,
    val stamina: Int = 100,
    val defense: Int = 0,
    val magicDefense: Int = 0,
    val attackMin: Int = 1,
    val attackMax: Int = 5
  )

  private fun parseSnapshot(raw: String?): StorySnapshot {
    if (raw == null) return StorySnapshot()
    return try{
      val json = JSONObject(raw)
      StorySnapshot (
        name = json.getString("playerName"),
        curHealth = json.getInt("curHealth"),
        maxHealth = json.getInt("maxHealth"),
        curMana = json.getInt("curMana"),
        maxMana = json.getInt("maxMana"),
        curLevel = json.getInt("curLevel"),
        xp = json.getInt("xp"),
        xpToNextLevel = json.getInt("xpToNextLevel"),
        stamina = json.getInt("stamina"),
        defense = json.getInt("defense"),
        magicDefense = json.getInt("magicDefense"),
        attackMin = json.getInt("attackMin"),
        attackMax = json.getInt("attackMax"),
      )
    } catch(e: Exception) {

      StorySnapshot()
    }
  }

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val raw = context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(SNAPSHOT_KEY, null)

    val parsed = parseSnapshot(raw)

    provideContent {
      Content(parsed)
    }
  }

  @Composable
  private fun Content(snapshot: StorySnapshot) {
    Text(snapshot.name)
    Text(snapshot.curLevel.toString())
  }
}


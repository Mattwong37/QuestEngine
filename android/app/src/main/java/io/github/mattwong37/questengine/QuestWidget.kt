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

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val raw = context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(SNAPSHOT_KEY, null)

    val name = try {
      JSONObject(raw ?: "{}").optString("playerName", "Adventurer")
    } catch (e: Exception) {
      "Adventurer"
    }

    provideContent {
      Content(name)
    }
  }

  @Composable
  private fun Content(name: String) {
    Text(name)
  }
}


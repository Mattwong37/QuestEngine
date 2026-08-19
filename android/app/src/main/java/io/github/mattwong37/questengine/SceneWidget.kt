package io.github.mattwong37.questengine

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import io.github.mattwong37.questengine.QuestWidget.StorySnapshot
import org.json.JSONObject

object SceneWidget : GlanceAppWidget() {
  override suspend fun provideGlance(
    context: Context,
    id: GlanceId
  ) {
    val raw = context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(SNAPSHOT_KEY, null)

    val parsed = parseSnapshot(raw)

    provideContent {
      QuestWidget.Content(parsed)
    }
  }
  private fun parseSnapshot(raw: String?): StorySnapshot {
    if (raw == null) return StorySnapshot()
    return try {
      val json = JSONObject(raw)
      StorySnapshot(
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
    } catch (e: Exception) {
      StorySnapshot()
    }
  }
}

@Composable
private fun Divider() {
  Column {
    Spacer(modifier = GlanceModifier.height(4.dp))
    Box(
      modifier = GlanceModifier
        .fillMaxWidth()
        .height(1.dp)
        .background(Color(0xFF4A3D1A))
    ) {}
    Spacer(modifier = GlanceModifier.height(4.dp))
  }
}

@Composable
private fun Content(snapshot: QuestWidget.StorySnapshot) {
  Column(){
    
  }
}

package io.github.mattwong37.questengine

import android.R
import android.annotation.SuppressLint
import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceModifier
import androidx.glance.LocalSize
import androidx.glance.appwidget.cornerRadius
import androidx.glance.background
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.Text

import androidx.glance.layout.width
import androidx.glance.text.FontFamily
import androidx.glance.text.FontWeight
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
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
  private fun StatBar(current: Int, max: Int, color: Color) {
    val safeMax = if (max > 0) max else 1
    val fraction = current.coerceIn(0, safeMax).toFloat() / safeMax

    val available = LocalSize.current.width - 24.dp
    val filledWidth = available * fraction

    Box(
      modifier = GlanceModifier
        .fillMaxWidth()
        .height(10.dp)
        .background(Color(0xFFCCC2AB))
        .cornerRadius(5.dp)
    ) {
      Box(
        modifier = GlanceModifier
          .width(filledWidth)
          .fillMaxHeight()
          .background(color)
          .cornerRadius(5.dp)
      ) {}
    }
  }

  private fun styling (
    color: androidx.glance.unit.ColorProvider,
    size: Int,
    weight: FontWeight = FontWeight.Normal
  ) = TextStyle(
    color = color,
    fontSize = size.sp,
    fontWeight = weight,
    fontFamily = FontFamily.Serif
  )
  @SuppressLint("RestrictedApi")
  @Composable
  private fun Content(snapshot: StorySnapshot) {
    Column(
      modifier = GlanceModifier.fillMaxSize().padding(12.dp).background(Color(0xFFCCC2AB)).padding(16.dp)
    ) {
      Text("${snapshot.name} • LV ${snapshot.curLevel}", style = styling(ColorProvider(Color(0xFF5A4A2A)), 15))
      Row() {
        Column() {
          Text("Health", style = styling(ColorProvider(Color(0xFF5A4A2A)), 15))
          Text("${snapshot.curHealth}/${snapshot.maxHealth}", style = styling(ColorProvider(Color(0xFF5A4A2A)), 15))
        }
        StatBar(
          snapshot.curHealth, snapshot.maxHealth,
          color = Color(0xFF2A2015)
        )
      }
      Row() {
        Column() {
          Text("Mana", style = styling(ColorProvider(Color(0xFF5A4A2A)), 15))
          Text("${snapshot.curMana}/${snapshot.maxMana}", style = styling(ColorProvider(Color(0xFF5A4A2A)), 15))
        }
        StatBar(
          snapshot.curMana, snapshot.maxMana,
          color = Color(0xFF2A2015)
        )
      }

      Text("Continue your adventure", style = styling(ColorProvider(Color(0xFF5A4A2A)), 15))
    }
  }
}


package io.github.mattwong37.questengine

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
import androidx.glance.color.ColorProvider
import androidx.glance.layout.Alignment
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

    val available = LocalSize.current.width
    val filledWidth = available * fraction

    Box(
      modifier = GlanceModifier
        .fillMaxWidth()
        .height(10.dp)
        .background(WidgetColors.secondaryText)
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

  @Composable
  private fun Divider() {
    Spacer(modifier = GlanceModifier.height(8.dp))
    Box(
      modifier = GlanceModifier
        .fillMaxWidth()
        .height(1.dp)
        .background(Color(0xFF4A3D1A))
    ) {}
    Spacer(modifier = GlanceModifier.height(8.dp))
  }

  private object WidgetColors {
    val gold            = ColorProvider(night = Color(0xFFC9A227), day = Color(0xFF8A6A16))
    val background      = ColorProvider(night = Color(0xFF2A2015), day = Color(0xFFCCC2AB))
    val subtext         = ColorProvider(night = Color(0xFFFFEBCD), day = Color(0xFF5A4A2A))
    val secondaryText   = ColorProvider(night = Color(0xFF8E8E93), day = Color(0xFF5C5B5B))
    val health          = Color(0xFF4E9F3D)
    val mana            = Color(0xFF1E88E5)
  }
  @SuppressLint("RestrictedApi")
  @Composable
  private fun Content(snapshot: StorySnapshot) {
    Column(
      modifier = GlanceModifier.fillMaxSize().padding(12.dp).background(WidgetColors.background).padding(16.dp)
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Text("${snapshot.name}", style = styling(WidgetColors.gold, 15))

        Text("  •  LV ${snapshot.curLevel}",
          style = styling(WidgetColors.secondaryText, 15)
        )
      }
      Row() {
        Column() {
          Text("Health", style = styling(WidgetColors.subtext, 15))
          Text("${snapshot.curHealth}/${snapshot.maxHealth}", style = styling(WidgetColors.subtext, 15))
        }
        StatBar(
          snapshot.curHealth, snapshot.maxHealth,
          color = WidgetColors.health
        )
      }
      Row() {
        Column() {
          Text("Mana", style = styling(WidgetColors.subtext, 15))
          Text("${snapshot.curMana}/${snapshot.maxMana}", style = styling(WidgetColors.subtext, 15))
        }
        StatBar(
          snapshot.curMana, snapshot.maxMana,
          color = WidgetColors.mana
        )
      }
      Divider()
      Text("Continue your adventure", style = styling(WidgetColors.subtext, 15))
    }
  }
}


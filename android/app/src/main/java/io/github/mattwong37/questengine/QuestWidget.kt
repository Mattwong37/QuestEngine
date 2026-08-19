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
import androidx.glance.appwidget.SizeMode
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
import androidx.glance.layout.width
import androidx.glance.text.Text

import androidx.glance.text.FontFamily
import androidx.glance.text.FontWeight
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import org.json.JSONObject


const val PREFS_NAME = "quest_widget"
const val SNAPSHOT_KEY = "snapshot"

object QuestWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Exact
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
    val track = Color(0xFF696965)
    val safeMax = if (max > 0) max else 1
    val fraction = current.coerceIn(0, safeMax).toFloat() / safeMax
    val filled = (fraction * 10).toInt().coerceIn(0, 10)

      Row(
        modifier = GlanceModifier.fillMaxWidth().height(10.dp)
          .background(track).cornerRadius(5.dp)
      ) {
        repeat(10) { i ->
          Box(modifier = GlanceModifier.defaultWeight().fillMaxHeight()
            .background(if (i < filled) color else track)) {}
        }

    }
  }

  private fun styling (
    color: ColorProvider,
    size: Int,
    weight: FontWeight = FontWeight.Normal
  ) = TextStyle(
    color = color,
    fontSize = size.sp,
    fontWeight = weight,
    fontFamily = FontFamily.Serif,
    textAlign = TextAlign.Center
  )

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

  private data class BarColors(val normal: Color, val low: Color? = null)

  private object WidgetColors {
    val gold            = ColorProvider(night = Color(0xFFC9A227), day = Color(0xFF8A6A16))
    val background      = ColorProvider(night = Color(0xFF2A2015), day = Color(0xFFCCC2AB))
    val subtext         = ColorProvider(night = Color(0xFFFFEBCD), day = Color(0xFF5A4A2A))
    val secondaryText   = ColorProvider(night = Color(0xFF8E8E93), day = Color(0xFF5C5B5B))
    val health          = BarColors(Color(0xFF4E9F3D), low = Color(0xFFD32F2F))
    val mana            = BarColors(Color(0xFF1E88E5), low = Color(0xFF8E24BC))
    val xp              = BarColors(Color(0xFFFFD700))
    val lowWarning      = ColorProvider(day = Color(0xFFD32F2F), night = Color(0xFF962323))
  }

  @Composable
  private fun StatReadOut(name: String, curStat: Int, totalStat: Int, color: BarColors) {
    val barColor = if (totalStat > 0 && curStat.toFloat() / totalStat < 0.2f) { color.low ?: color.normal } else color.normal
    Row() {
      Column(modifier = GlanceModifier.width(68.dp)) {
        Text(name, style = styling(WidgetColors.subtext, 15, FontWeight.Bold))
        Text("${curStat}/${totalStat}", style = styling(WidgetColors.subtext, 15))
      }

      Box(modifier = GlanceModifier.padding(top = 8.dp)) {
        StatBar(
          curStat, totalStat,
          color = barColor
        )
      }
    }
  }

  @Composable
  private fun StatGrid(snapshot: StorySnapshot) {
    Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
      StatCell("Defense", snapshot.defense.toString(), GlanceModifier.defaultWeight(), snapshot.defense < 1)
      StatCell("Magic Defense", snapshot.magicDefense.toString(), GlanceModifier.defaultWeight(), snapshot.magicDefense < 10)
      StatCell("Stamina", "${snapshot.stamina}%", GlanceModifier.defaultWeight(), snapshot.stamina < 20)
      StatCell("Attack", "${snapshot.attackMin}-${snapshot.attackMax}", GlanceModifier.defaultWeight(), snapshot.attackMin < 1)
    }
  }

  @Composable
  private fun StatCell(
    label: String,
    value: String,
    modifier: GlanceModifier = GlanceModifier,
    belowThreshold: Boolean = false
  ) {
    Column(
      modifier = modifier,
      horizontalAlignment = Alignment.CenterHorizontally,
    ) {
      Text(label, style = styling(WidgetColors.secondaryText, 13, FontWeight.Bold))
      Text(value, style = styling(if (belowThreshold) WidgetColors.lowWarning else WidgetColors.gold, 13, FontWeight.Bold))
    }
  }

  @SuppressLint("RestrictedApi")
  @Composable
  fun Content(snapshot: StorySnapshot) {
    Column(
      modifier = GlanceModifier.fillMaxSize().padding(12.dp).background(WidgetColors.background).padding(10.dp)
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Text("${snapshot.name}", style = styling(WidgetColors.gold, 15, FontWeight.Bold))
        Text("  •  LV ${snapshot.curLevel}",
          style = styling(WidgetColors.secondaryText, 15,FontWeight.Bold)
        )
        Spacer(modifier = GlanceModifier.defaultWeight())
      }
      Divider()
      Column (modifier = GlanceModifier.defaultWeight()) {
        Spacer(modifier = GlanceModifier.defaultWeight())
        StatReadOut("Health", snapshot.curHealth, snapshot.maxHealth, WidgetColors.health)
        Spacer(modifier = GlanceModifier.defaultWeight())
        StatReadOut("Mana", snapshot.curMana, snapshot.maxMana, WidgetColors.mana)
        Spacer(modifier = GlanceModifier.defaultWeight())

        val size = LocalSize.current
        if (size.height > 203.dp) {
          StatReadOut("XP", snapshot.xp, snapshot.xpToNextLevel, WidgetColors.xp)
          Spacer(modifier = GlanceModifier.defaultWeight())
          Divider()
          StatGrid(snapshot)
        }
      }

      Column() {
        Divider()
        Text("Continue your adventure >", style = styling(WidgetColors.subtext, 15, FontWeight.Bold))
      }
    }
  }
}


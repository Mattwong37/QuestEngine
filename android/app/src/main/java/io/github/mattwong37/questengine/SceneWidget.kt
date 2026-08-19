package io.github.mattwong37.questengine

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.background
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import io.github.mattwong37.questengine.QuestWidget.WidgetColors
import io.github.mattwong37.questengine.QuestWidget.parseSnapshot
import io.github.mattwong37.questengine.QuestWidget.styling
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object SceneWidget : GlanceAppWidget() {

  override suspend fun provideGlance(
    context: Context, id: GlanceId
  ) {
    val raw =
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(SNAPSHOT_KEY, null)

    val parsed = parseSnapshot(raw)

    provideContent {
      SceneWidget.Content(parsed)
    }
  }

  @Composable
  private fun Content(snapshot: QuestWidget.StorySnapshot) {
    val today = SimpleDateFormat("MMMM d, yyyy", Locale.getDefault()).format(Date())

    Column(modifier = GlanceModifier.fillMaxSize().padding(15.dp) .background(WidgetColors.background)) {
      Spacer(modifier = GlanceModifier.defaultWeight())
      Row() {
        Text(snapshot.name, style = styling(WidgetColors.gold, 13, FontWeight.Bold))
        Text(" · $today", style = styling(WidgetColors.secondaryText, 13, FontWeight.Bold))
      }
      Spacer(modifier = GlanceModifier.defaultWeight())
      QuestWidget.Divider()
      Spacer(modifier = GlanceModifier.defaultWeight())
      Text(snapshot.sceneText, maxLines=7, style=styling(WidgetColors.subtext, 13, textAlign= TextAlign.Start))
      Spacer(modifier = GlanceModifier.defaultWeight())
      QuestWidget.Divider()
      Spacer(modifier = GlanceModifier.defaultWeight())
      Text("Continue your adventure >", maxLines=8, style=styling(WidgetColors.subtext, 13, FontWeight.Bold))
      Spacer(modifier = GlanceModifier.defaultWeight())
    }
  }
}

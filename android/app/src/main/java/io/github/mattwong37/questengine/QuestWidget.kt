package io.github.mattwong37.questengine

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.compose.runtime.Composable
import androidx.glance.text.Text

object QuestWidget : GlanceAppWidget() {
  override suspend fun provideGlance(
    context: Context,
    id: GlanceId
  ) {
    provideContent {
      Content()
    }
  }

  @Composable
  private fun Content() {
    Text("Hello from Glance")
  }
}

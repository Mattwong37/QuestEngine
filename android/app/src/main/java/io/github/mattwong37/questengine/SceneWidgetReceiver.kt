package io.github.mattwong37.questengine

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

class SceneWidgetReceiver : GlanceAppWidgetReceiver()  {
  override val glanceAppWidget: GlanceAppWidget = SceneWidget
}

package io.github.mattwong37.questengine

import android.content.Context
import androidx.core.content.edit
import androidx.glance.appwidget.updateAll
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/* Conducts the syncing between the plugin and the typescript app
 */
@CapacitorPlugin(name = "WidgetBridge")
class WidgetBridgePlugin : Plugin() {

  @PluginMethod
  fun sync(call: PluginCall) {
    val payload = call.getString("payload")
    if (payload == null) {
      call.reject("payload required")
      return
    }

    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit { putString(SNAPSHOT_KEY, payload) }

    CoroutineScope(Dispatchers.Default).launch {
      QuestWidget.updateAll(context)
      SceneWidget.updateAll(context)
    }

    call.resolve()
  }
}

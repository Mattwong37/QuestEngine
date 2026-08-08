package io.github.mattwong37.questengine

import android.content.Context
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import androidx.core.content.edit


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

    val prefs = context.getSharedPreferences("quest_widget", Context.MODE_PRIVATE)
    prefs.edit { putString("snapshot", payload) }

    call.resolve()
  }
}

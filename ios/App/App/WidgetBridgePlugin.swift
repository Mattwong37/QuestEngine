import Foundation
import Capacitor
import WidgetKit

/* Conducts the syncing between the plugin and the typescript app
 */
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "sync", returnType: CAPPluginReturnPromise)
    ]

    @objc func sync(_ call: CAPPluginCall) {
        guard let payload = call.getString("payload") else {
            call.reject("payload required")
            return
        }

        UserDefaults(suiteName: "group.io.github.mattwong37.questengine")?
            .set(payload, forKey: "snapshot")

        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}

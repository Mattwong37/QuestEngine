import UIKit
import Capacitor

/* This is needed to register the plugin file since capacitor cannot discover it automatically
 */
class QuestEngineViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WidgetBridgePlugin())
    }
}

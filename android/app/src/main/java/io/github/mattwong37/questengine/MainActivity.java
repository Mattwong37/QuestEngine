package io.github.mattwong37.questengine;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import android.os.Build;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(WidgetBridgePlugin.class);
    super.onCreate(savedInstanceState);
    gateWidget();
  }

  private void gateWidget() {
    boolean supported = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S;
    getPackageManager().setComponentEnabledSetting(
      new ComponentName(this, QuestWidgetReceiver.class),
      supported
        ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        : PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
      PackageManager.DONT_KILL_APP
    );
  }
}

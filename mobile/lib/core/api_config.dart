class ApiConfig {
  /// USB + `adb reverse tcp:3000 tcp:3000` ile kullan.
  /// Emülatör: http://10.0.2.2:3000
  /// Wi-Fi (adb reverse yok): http://192.168.x.x:3000
  static const String baseUrl = 'http://127.0.0.1:3000';
}

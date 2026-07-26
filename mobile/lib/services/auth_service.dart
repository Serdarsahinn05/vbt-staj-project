import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/core/api_config.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthException implements Exception {
  AuthException(this.message);
  final String message;

  @override
  String toString() => message;
}

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';
  static const _emailKey = 'user_email';
  static const _nameKey = 'user_name';

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessKey);
  }

  Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_emailKey);
  }

  Future<String?> getName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_nameKey);
  }

  Future<bool> get isLoggedIn async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> _saveTokens({
    required String accessToken,
    required String refreshToken,
    String? email,
    String? name,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessKey, accessToken);
    await prefs.setString(_refreshKey, refreshToken);
    if (email != null) await prefs.setString(_emailKey, email);
    if (name != null) await prefs.setString(_nameKey, name);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessKey);
    await prefs.remove(_refreshKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_nameKey);
  }

  /// E-posta her zaman küçük harf + trim (büyük/küçük harf karışıklığını önler)
  String _normalizeEmail(String email) => email.trim().toLowerCase();

  Future<void> login({
    required String email,
    required String password,
  }) async {
    final normalizedEmail = _normalizeEmail(email);

    try {
      final response = await http
          .post(
            Uri.parse('${ApiConfig.baseUrl}/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'email': normalizedEmail,
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 12));

      if (response.statusCode == 401) {
        throw AuthException('E-posta veya şifre hatalı');
      }
      if (response.statusCode != 200) {
        throw AuthException(_errorMessage(response, 'Giriş başarısız'));
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      await _saveTokens(
        accessToken: body['access_token'] as String,
        refreshToken: body['refresh_token'] as String,
        email: normalizedEmail,
      );
      await _tryLoadProfileName();
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(_networkOrMessage(e));
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final normalizedEmail = _normalizeEmail(email);
    final trimmedName = name.trim();

    try {
      final response = await http
          .post(
            Uri.parse('${ApiConfig.baseUrl}/auth/register'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'name': trimmedName,
              'email': normalizedEmail,
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 12));

      if (response.statusCode == 409) {
        throw AuthException(
          'Bu e-posta zaten kayıtlı. Giriş sekmesinden giriş yapın.',
        );
      }
      if (response.statusCode != 201 && response.statusCode != 200) {
        throw AuthException(_errorMessage(response, 'Kayıt başarısız'));
      }

      // Kayıt token döndürmez → aynı bilgilerle giriş
      await login(email: normalizedEmail, password: password);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_nameKey, trimmedName);
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(_networkOrMessage(e));
    }
  }

  Future<void> _tryLoadProfileName() async {
    try {
      final token = await getAccessToken();
      if (token == null) return;
      final response = await http
          .get(
            Uri.parse('${ApiConfig.baseUrl}/users/profile'),
            headers: {'Authorization': 'Bearer $token'},
          )
          .timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) return;
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final name = (body['name'] as String?)?.trim();
      if (name != null && name.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_nameKey, name);
      }
    } catch (_) {}
  }

  String _networkOrMessage(Object e) {
    final text = e.toString();
    final lower = text.toLowerCase();
    if (lower.contains('socket') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('network is unreachable') ||
        lower.contains('timed out') ||
        lower.contains('timeout')) {
      return 'Sunucuya bağlanılamadı. Backend açık mı ve adb reverse yapıldı mı?';
    }
    return text
        .replaceFirst('Exception: ', '')
        .replaceFirst('AuthException: ', '');
  }

  String _errorMessage(http.Response response, String fallback) {
    try {
      final body = jsonDecode(response.body);
      if (body is Map && body['message'] != null) {
        final message = body['message'];
        if (message is List) {
          return message.map((e) => _translate(e.toString())).join('\n');
        }
        return _translate(message.toString());
      }
    } catch (_) {}
    return '$fallback (${response.statusCode})';
  }

  String _translate(String message) {
    final lower = message.toLowerCase();

    if (lower.contains('zaten kayıtlı') ||
        lower.contains('already') ||
        lower.contains('exist')) {
      return 'Bu e-posta zaten kayıtlı. Giriş sekmesinden giriş yapın.';
    }
    if (lower.contains('email') &&
        (lower.contains('should not be empty') ||
            lower.contains('must not be empty') ||
            lower.contains('is required') ||
            lower.contains('must be a string'))) {
      return 'E-posta girmek zorunludur';
    }
    if (lower.contains('email') &&
        (lower.contains('must be an email') ||
            lower.contains('must be an email address'))) {
      return 'Geçerli bir e-posta adresi giriniz';
    }
    if (lower.contains('password') &&
        (lower.contains('should not be empty') ||
            lower.contains('must not be empty') ||
            lower.contains('is required'))) {
      return 'Şifre girmek zorunludur';
    }
    if (lower.contains('password') &&
        (lower.contains('must be longer') || lower.contains('en az'))) {
      return 'Şifre en az 6 karakter olmalıdır';
    }
    if (lower.contains('name') &&
        (lower.contains('should not be empty') ||
            lower.contains('must not be empty'))) {
      return 'Ad soyad girmek zorunludur';
    }
    if (lower.contains('unauthorized') ||
        lower.contains('invalid credentials') ||
        lower.contains('hatalı')) {
      return 'E-posta veya şifre hatalı';
    }

    return message;
  }
}

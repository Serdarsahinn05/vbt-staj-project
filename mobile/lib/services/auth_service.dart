import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/core/api_config.dart';
import 'package:shared_preferences/shared_preferences.dart';

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

  Future<void> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode != 200) {
      throw Exception(_errorMessage(response, 'Giriş başarısız'));
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    await _saveTokens(
      accessToken: body['access_token'] as String,
      refreshToken: body['refresh_token'] as String,
      email: email,
    );
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception(_errorMessage(response, 'Kayıt başarısız'));
    }

    // Register token döndürmüyor → otomatik login
    await login(email: email, password: password);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_nameKey, name);
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

  /// Backend İngilizce validation mesajlarını Türkçeleştirir
  String _translate(String message) {
    final lower = message.toLowerCase();

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
    if (lower.contains('password') && lower.contains('must be longer')) {
      return 'Şifre en az 6 karakter olmalıdır';
    }
    if (lower.contains('name') &&
        (lower.contains('should not be empty') ||
            lower.contains('must not be empty'))) {
      return 'Ad soyad girmek zorunludur';
    }
    if (lower.contains('unauthorized') ||
        lower.contains('invalid credentials') ||
        lower.contains('yanlış') ||
        message.contains('401')) {
      return 'E-posta veya şifre hatalı';
    }

    return message;
  }
}

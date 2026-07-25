import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/core/api_config.dart';
import 'package:mobile/services/auth_service.dart';

class ApiClient {
  static Future<http.Response> get(String path) async {
    return http.get(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: await _headers(),
    );
  }

  static Future<http.Response> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    return http.post(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: await _headers(json: true),
      body: body == null ? null : jsonEncode(body),
    );
  }

  static Future<http.Response> patch(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    return http.patch(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: await _headers(json: true),
      body: body == null ? null : jsonEncode(body),
    );
  }

  static Future<http.Response> delete(String path) async {
    return http.delete(
      Uri.parse('${ApiConfig.baseUrl}$path'),
      headers: await _headers(),
    );
  }

  static Future<Map<String, String>> _headers({bool json = false}) async {
    final headers = <String, String>{
      if (json) 'Content-Type': 'application/json',
    };
    final token = await AuthService.instance.getAccessToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }
}

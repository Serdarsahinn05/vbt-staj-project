import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/core/api_config.dart';

class ProductServices {
  List<Map<String, dynamic>>? _cache;

  Future<List<Map<String, dynamic>>> getProducts() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/products?limit=50');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Ürünler alınamadı (${response.statusCode})');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final data = body['data'] as List<dynamic>? ?? [];
    _cache = data
        .map((e) => _mapProduct(Map<String, dynamic>.from(e as Map)))
        .toList();
    return _cache!;
  }

  Future<Map<String, dynamic>?> getProductById(int id) async {
    if (_cache != null) {
      try {
        return _cache!.firstWhere((p) => p['id'] == id);
      } catch (_) {}
    }

    final uri = Uri.parse('${ApiConfig.baseUrl}/products/$id');
    final response = await http.get(uri);

    if (response.statusCode == 404) return null;
    if (response.statusCode != 200) {
      throw Exception('Ürün alınamadı (${response.statusCode})');
    }

    final body = jsonDecode(response.body);
    if (body is Map<String, dynamic>) {
      // bazı API'ler { data: {...} } döner
      final productJson = body['data'] is Map
          ? Map<String, dynamic>.from(body['data'] as Map)
          : body;
      return _mapProduct(productJson);
    }
    return null;
  }

  Map<String, dynamic> _mapProduct(Map<String, dynamic> p) {
    final variants = (p['variants'] as List<dynamic>? ?? [])
        .map((v) => Map<String, dynamic>.from(v as Map))
        .toList();
    final first = variants.isNotEmpty ? variants.first : null;
    final images = first != null
        ? List<String>.from(first['images'] as List? ?? const [])
        : <String>[];

    num parsePrice(dynamic value) {
      if (value is num) return value;
      if (value is String) return num.tryParse(value) ?? 0;
      return 0;
    }

    final price = parsePrice(first?['price'] ?? p['price']);
    final stock = first?['stock'] ?? p['stock'] ?? 0;
    final category = p['category'];
    final categoryName = category is Map
        ? (category['name'] as String? ?? '')
        : (category as String? ?? '');

    return {
      'id': p['id'],
      'variantId': first?['id'],
      'name': p['name'],
      'description': p['description'],
      'category': categoryName,
      'styleTags': p['styleTags'] ?? [],
      'gender': p['gender'],
      'price': price,
      'stock': stock is num ? stock : int.tryParse('$stock') ?? 0,
      'image': images.isNotEmpty ? images.first : '',
      'images': images,
      'variants': variants,
      'colorName': first?['colorName'],
      'colorHex': first?['colorHex'],
      'series': p['series'],
      'caseSize': p['caseSize'],
      'material': p['material'],
      'bezel': p['bezel'],
      'crown': p['crown'],
      'crystal': p['crystal'],
      'waterResistance': p['waterResistance'],
      'movement': p['movement'],
      'strap': p['strap'],
      'dial': p['dial'],
    };
  }

  Future<List<String>> getCategories() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/categories');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Kategoriler alınamadı (${response.statusCode})');
    }

    final body = jsonDecode(response.body);
    final list = body is List ? body : (body['data'] as List? ?? []);
    return list
        .map((e) {
          if (e is Map) return (e['name'] as String? ?? '').trim();
          return e.toString().trim();
        })
        .where((name) => name.isNotEmpty)
        .toList();
  }

  /// Backend kategorilerinden filtre etiketleri (Akıllı, Klasik, Spor…)
  List<String> buildFilterOptions(List<String> categories) {
    final labels = categories
        .map(_categoryLabel)
        .where((e) => e.isNotEmpty)
        .toSet()
        .toList()
      ..sort();
    return ['TÜMÜ', ...labels];
  }

  /// "Dress Saat" → "Dress"
  String _categoryLabel(String category) {
    return category.replaceFirst(RegExp(r'\s*Saat\s*$'), '').trim();
  }

  /// Seçilen filtre (Dress) ürün kategorisiyle (Dress Saat) eşleşir mi?
  bool matchesCategoryFilter(String? productCategory, String selected) {
    if (selected == 'TÜMÜ') return true;
    final category = productCategory?.trim() ?? '';
    if (category.isEmpty) return false;
    return _categoryLabel(category).toLowerCase() == selected.toLowerCase();
  }
}

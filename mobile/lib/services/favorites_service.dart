import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:mobile/core/api_client.dart';

class FavoriteService extends ChangeNotifier {
  FavoriteService._();
  static final FavoriteService instance = FavoriteService._();

  final Set<int> _variantIds = {};
  final Map<int, Map<String, dynamic>> _itemsByVariantId = {};

  Set<int> get ids => Set.unmodifiable(_variantIds);
  List<Map<String, dynamic>> get items => _itemsByVariantId.values.toList();

  bool isFavoriteVariant(int variantId) => _variantIds.contains(variantId);

  bool isFavoriteProduct(Map<String, dynamic> product) {
    final variantId = product['variantId'] as int?;
    if (variantId == null) return false;
    return _variantIds.contains(variantId);
  }

  Future<void> refresh() async {
    final response = await ApiClient.get('/favorites');
    if (response.statusCode == 401) {
      _variantIds.clear();
      _itemsByVariantId.clear();
      notifyListeners();
      throw Exception('Oturum gerekli');
    }
    if (response.statusCode != 200) {
      throw Exception('Favoriler alınamadı (${response.statusCode})');
    }

    final list = jsonDecode(response.body) as List<dynamic>;
    _variantIds.clear();
    _itemsByVariantId.clear();

    for (final raw in list) {
      final row = Map<String, dynamic>.from(raw as Map);
      final variant = Map<String, dynamic>.from(row['variant'] as Map);
      final product = Map<String, dynamic>.from(variant['product'] as Map);
      final variantId = variant['id'] as int;
      final images = List<String>.from(variant['images'] as List? ?? const []);
      final category = product['category'];
      final categoryName = category is Map
          ? (category['name'] as String? ?? '')
          : '';

      final price = _parsePrice(variant['price']);
      final discount = variant['discount'] is num
          ? (variant['discount'] as num).toInt()
          : int.tryParse('${variant['discount'] ?? 0}') ?? 0;
      final effectivePrice =
          discount > 0 ? price * (1 - discount / 100) : price;

      _variantIds.add(variantId);
      _itemsByVariantId[variantId] = {
        'variantId': variantId,
        'id': product['id'],
        'name': product['name'],
        'category': categoryName,
        'image': images.isNotEmpty ? images.first : '',
        'price': price,
        'discount': discount,
        'effectivePrice': effectivePrice,
        'gender': product['gender'],
      };
    }
    notifyListeners();
  }

  Future<void> toggleProduct(Map<String, dynamic> product) async {
    final variantId = product['variantId'] as int?;
    if (variantId == null) {
      throw Exception('Bu ürünün varyantı yok');
    }
    await toggleVariant(variantId, productHint: product);
  }

  Future<void> toggleVariant(
    int variantId, {
    Map<String, dynamic>? productHint,
  }) async {
    if (_variantIds.contains(variantId)) {
      final response = await ApiClient.delete('/favorites/$variantId');
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception(_apiError(response, 'Favori silinemedi'));
      }
      _variantIds.remove(variantId);
      _itemsByVariantId.remove(variantId);
    } else {
      final response = await ApiClient.post(
        '/favorites',
        body: {'variantId': variantId},
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception(_apiError(response, 'Favori eklenemedi'));
      }
      _variantIds.add(variantId);
      if (productHint != null) {
        final price = productHint['price'] is num
            ? productHint['price'] as num
            : _parsePrice(productHint['price']);
        final discount = productHint['discount'] is num
            ? (productHint['discount'] as num).toInt()
            : int.tryParse('${productHint['discount'] ?? 0}') ?? 0;
        final effective = productHint['effectivePrice'] is num
            ? productHint['effectivePrice'] as num
            : (discount > 0 ? price * (1 - discount / 100) : price);
        _itemsByVariantId[variantId] = {
          'variantId': variantId,
          'id': productHint['id'],
          'name': productHint['name'],
          'category': productHint['category'],
          'image': productHint['image'],
          'price': price,
          'discount': discount,
          'effectivePrice': effective,
          'gender': productHint['gender'],
        };
      }
    }
    notifyListeners();
  }

  void clearLocal() {
    _variantIds.clear();
    _itemsByVariantId.clear();
    notifyListeners();
  }

  num _parsePrice(dynamic value) {
    if (value is num) return value;
    if (value is String) return num.tryParse(value) ?? 0;
    return 0;
  }

  String _apiError(dynamic response, String fallback) {
    try {
      final body = jsonDecode(response.body);
      if (body is Map && body['message'] != null) {
        final message = body['message'];
        if (message is List) return message.join('\n');
        return message.toString();
      }
    } catch (_) {}
    return '$fallback (${response.statusCode})';
  }
}

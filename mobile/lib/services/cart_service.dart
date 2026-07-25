import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:mobile/core/api_client.dart';

class CartService extends ChangeNotifier {
  CartService._();
  static final CartService instance = CartService._();

  final List<Map<String, dynamic>> _items = [];
  num _total = 0;

  List<Map<String, dynamic>> get items => List.unmodifiable(_items);

  int get itemCount =>
      _items.fold(0, (sum, item) => sum + (item['quantity'] as int));

  num get totalPrice => _total;

  Future<void> refresh() async {
    final response = await ApiClient.get('/cart');
    if (response.statusCode == 401) {
      _items.clear();
      _total = 0;
      notifyListeners();
      throw Exception('Oturum gerekli');
    }
    if (response.statusCode != 200) {
      throw Exception('Sepet alınamadı (${response.statusCode})');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final rows = body['items'] as List<dynamic>? ?? [];
    _total = _parsePrice(body['total']);
    _items
      ..clear()
      ..addAll(rows.map((raw) {
        final item = Map<String, dynamic>.from(raw as Map);
        final variant = Map<String, dynamic>.from(item['variant'] as Map);
        final product = Map<String, dynamic>.from(variant['product'] as Map);
        final images =
            List<String>.from(variant['images'] as List? ?? const []);
        return {
          'variantId': variant['id'],
          'id': product['id'],
          'name': product['name'],
          'category': '',
          'price': item['unitPrice'] ?? _parsePrice(variant['price']),
          'image': images.isNotEmpty ? images.first : '',
          'quantity': item['quantity'] as int,
        };
      }));
    notifyListeners();
  }

  Future<void> addProduct(Map<String, dynamic> product) async {
    final variantId = product['variantId'] as int?;
    if (variantId == null) {
      throw Exception('Bu ürünün varyantı yok');
    }

    final response = await ApiClient.post(
      '/cart/items',
      body: {'variantId': variantId, 'quantity': 1},
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(_apiError(response, 'Sepete eklenemedi'));
    }
    await refresh();
  }

  Future<void> removeProduct(int variantId) async {
    final response = await ApiClient.delete('/cart/items/$variantId');
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(_apiError(response, 'Silinemedi'));
    }
    await refresh();
  }

  Future<void> increaseQuantity(int variantId) async {
    final index = _items.indexWhere((item) => item['variantId'] == variantId);
    if (index < 0) return;
    final next = (_items[index]['quantity'] as int) + 1;
    await _setQuantity(variantId, next);
  }

  Future<void> decreaseQuantity(int variantId) async {
    final index = _items.indexWhere((item) => item['variantId'] == variantId);
    if (index < 0) return;
    final current = _items[index]['quantity'] as int;
    if (current <= 1) {
      await removeProduct(variantId);
      return;
    }
    await _setQuantity(variantId, current - 1);
  }

  Future<void> _setQuantity(int variantId, int quantity) async {
    final response = await ApiClient.patch(
      '/cart/items/$variantId',
      body: {'quantity': quantity},
    );
    if (response.statusCode != 200) {
      throw Exception(_apiError(response, 'Adet güncellenemedi'));
    }
    await refresh();
  }

  void clearLocal() {
    _items.clear();
    _total = 0;
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

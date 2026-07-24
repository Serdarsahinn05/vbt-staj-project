import 'package:flutter/foundation.dart';

class CartService extends ChangeNotifier {
  CartService._();
  static final CartService instance = CartService._();

  final List<Map<String, dynamic>> _items = [];

  List<Map<String, dynamic>> get items => List.unmodifiable(_items);

  int get itemCount =>
      _items.fold(0, (sum, item) => sum + (item['quantity'] as int));

  num get totalPrice => _items.fold(
        0,
        (sum, item) =>
            sum + ((item['price'] as num) * (item['quantity'] as int)),
      );

  void addProduct(Map<String, dynamic> product) {
    final id = product['id'] as int;
    final index = _items.indexWhere((item) => item['id'] == id);

    if (index >= 0) {
      _items[index]['quantity'] = (_items[index]['quantity'] as int) + 1;
    } else {
      _items.add({
        'id': id,
        'name': product['name'],
        'category': product['category'],
        'price': product['price'],
        'image': product['image'],
        'quantity': 1,
      });
    }
    notifyListeners();
  }

  void removeProduct(int id) {
    _items.removeWhere((item) => item['id'] == id);
    notifyListeners();
  }

  void increaseQuantity(int id) {
    final index = _items.indexWhere((item) => item['id'] == id);
    if (index < 0) return;
    _items[index]['quantity'] = (_items[index]['quantity'] as int) + 1;
    notifyListeners();
  }

  void decreaseQuantity(int id) {
    final index = _items.indexWhere((item) => item['id'] == id);
    if (index < 0) return;

    final quantity = _items[index]['quantity'] as int;
    if (quantity <= 1) {
      _items.removeAt(index);
    } else {
      _items[index]['quantity'] = quantity - 1;
    }
    notifyListeners();
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}

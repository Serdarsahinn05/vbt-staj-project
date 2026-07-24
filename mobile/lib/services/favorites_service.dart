import 'package:flutter/foundation.dart';

class FavoriteService extends ChangeNotifier {
  FavoriteService._();
  static final FavoriteService instance = FavoriteService._();

  final Set<int> _ids = {};

  Set<int> get ids => _ids;

  bool isFavorite(int id) => _ids.contains(id);

  void toggle(int id) {
    if (_ids.contains(id)) {
      _ids.remove(id);
    } else {
      _ids.add(id);
    }
    notifyListeners();
  }
}

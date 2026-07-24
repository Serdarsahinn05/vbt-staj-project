import 'package:flutter/material.dart';
import 'package:mobile/screens/account_screen.dart';
import 'package:mobile/screens/cart_screen.dart';
import 'package:mobile/screens/favorites_screen.dart';
import 'package:mobile/screens/home_screen.dart';
import 'package:mobile/services/cart_service.dart';
import 'package:mobile/services/favorites_service.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  /// Sekme değiştirmek için (ör. sepet ikonu)
  static final ValueNotifier<int> tabIndex = ValueNotifier<int>(0);

  static void goTo(int index) {
    tabIndex.value = index;
  }

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  static const _gold = Color(0xFFC4A470);

  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    MainShell.tabIndex.value = _currentIndex;
    MainShell.tabIndex.addListener(_onExternalTabChange);
  }

  void _onExternalTabChange() {
    final next = MainShell.tabIndex.value;
    if (next != _currentIndex && mounted) {
      setState(() => _currentIndex = next);
    }
  }

  @override
  void dispose() {
    MainShell.tabIndex.removeListener(_onExternalTabChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: const [
          HomeScreen(),
          FavoritesScreen(),
          CartScreen(),
          AccountScreen(),
        ],
      ),
      bottomNavigationBar: ListenableBuilder(
        listenable: Listenable.merge([
          CartService.instance,
          FavoriteService.instance,
        ]),
        builder: (context, _) {
          final cartCount = CartService.instance.itemCount;
          final favCount = FavoriteService.instance.ids.length;

          return BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            currentIndex: _currentIndex,
            selectedItemColor: _gold,
            unselectedItemColor: Colors.grey.shade600,
            selectedFontSize: 12,
            unselectedFontSize: 11,
            onTap: (index) {
              setState(() => _currentIndex = index);
              MainShell.tabIndex.value = index;
            },
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: 'Ana Sayfa',
              ),
              BottomNavigationBarItem(
                icon: Badge(
                  isLabelVisible: favCount > 0,
                  label: Text('$favCount'),
                  child: const Icon(Icons.favorite_border),
                ),
                activeIcon: Badge(
                  isLabelVisible: favCount > 0,
                  label: Text('$favCount'),
                  child: const Icon(Icons.favorite),
                ),
                label: 'Favoriler',
              ),
              BottomNavigationBarItem(
                icon: Badge(
                  isLabelVisible: cartCount > 0,
                  label: Text('$cartCount'),
                  child: const Icon(Icons.shopping_bag_outlined),
                ),
                activeIcon: Badge(
                  isLabelVisible: cartCount > 0,
                  label: Text('$cartCount'),
                  child: const Icon(Icons.shopping_bag),
                ),
                label: 'Sepet',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: 'Hesabım',
              ),
            ],
          );
        },
      ),
    );
  }
}

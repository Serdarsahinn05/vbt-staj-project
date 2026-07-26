import 'package:flutter/material.dart';

/// Tüm ekranlarda aynı AppBar görünümü
class ZemrekAppBar extends StatelessWidget implements PreferredSizeWidget {
  const ZemrekAppBar({
    super.key,
    required this.title,
    this.actions,
    this.automaticallyImplyLeading = true,
    this.brandTitle = false,
  });

  final String title;
  final List<Widget>? actions;
  final bool automaticallyImplyLeading;

  /// true → altın ZEMREK marka başlığı
  final bool brandTitle;

  static const gold = Color(0xFFC4A470);

  static const titleStyle = TextStyle(
    fontWeight: FontWeight.bold,
    fontSize: 18,
    color: Colors.black,
  );

  static const brandStyle = TextStyle(
    fontWeight: FontWeight.bold,
    fontSize: 18,
    color: gold,
  );

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: automaticallyImplyLeading,
      backgroundColor: Colors.white,
      foregroundColor: Colors.black,
      elevation: 0,
      scrolledUnderElevation: 0,
      title: Text(
        title,
        style: brandTitle ? brandStyle : titleStyle,
      ),
      actions: actions,
    );
  }
}

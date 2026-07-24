import 'package:flutter/material.dart';
import 'package:mobile/screens/main_shell.dart';
import 'package:mobile/services/cart_service.dart';
import 'package:mobile/services/favorites_service.dart';
import 'package:mobile/services/product_services.dart';

class DetailScreen extends StatefulWidget {
  final int productId;

  const DetailScreen({super.key, required this.productId});

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  static const _gold = Color(0xFFC4A470);
  static const _goldDark = Color(0xFF9D7231);

  int _selectedImage = 0;

  String _formatPrice(num price) {
    final text = price.toStringAsFixed(0);
    final buffer = StringBuffer();
    for (var i = 0; i < text.length; i++) {
      final reverseIndex = text.length - i;
      buffer.write(text[i]);
      if (reverseIndex > 1 && reverseIndex % 3 == 1) {
        buffer.write('.');
      }
    }
    return '₺$buffer,00';
  }

  List<String> _galleryImages(Map<String, dynamic> product) {
    final main = product['image'] as String;
    final id = product['id'] as int;
    return [
      main,
      'https://picsum.photos/seed/${id}a/600/600',
      'https://picsum.photos/seed/${id}b/600/600',
      'https://picsum.photos/seed/${id}c/600/600',
    ];
  }

  Widget _benefitRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '—  ',
            style: TextStyle(color: _gold, fontWeight: FontWeight.bold),
          ),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 14, color: Colors.grey.shade800),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = ProductServices().getProductById(widget.productId);

    if (product == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
        body: const Center(child: Text('Ürün bulunamadı')),
      );
    }

    final name = product['name'] as String;
    final category = product['category'] as String;
    final price = product['price'] as num;
    final images = _galleryImages(product);
    final stock = 4 + (product['id'] as int) % 5;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        title: const Text(
          'ZEMREK',
          style: TextStyle(
            color: _gold,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        actions: [
          ListenableBuilder(
            listenable: CartService.instance,
            builder: (context, _) {
              final count = CartService.instance.itemCount;
              return IconButton(
                onPressed: () {
                  Navigator.pop(context);
                  MainShell.goTo(2);
                },
                icon: Badge(
                  isLabelVisible: count > 0,
                  label: Text('$count'),
                  child: const Icon(Icons.shopping_bag_outlined),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: ColoredBox(
                color: Colors.black,
                child: Image.network(
                  images[_selectedImage],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Icon(Icons.watch, color: Colors.white54, size: 72),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 72,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: images.length,
                separatorBuilder: (context, index) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final selected = _selectedImage == index;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedImage = index),
                    child: Container(
                      width: 72,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: selected ? _gold : Colors.grey.shade300,
                          width: selected ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Image.network(
                        images[index],
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) =>
                            const ColoredBox(
                              color: Colors.black12,
                              child: Icon(Icons.watch, size: 28),
                            ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    category.toUpperCase(),
                    style: const TextStyle(
                      color: _gold,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.4,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _formatPrice(price),
                    style: const TextStyle(
                      color: _goldDark,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '$name, $category kategorisinde yer alan özenle seçilmiş bir modeldir. '
                    'Kaliteli malzeme ve zamansız tasarımıyla günlük kullanımdan özel anlara kadar eşlik eder.',
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.6,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Row(
                    children: [
                      SizedBox(
                        height: 52,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            CartService.instance.addProduct(product);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text('Sepete eklendi'),
                                action: SnackBarAction(
                                  label: 'Sepete Git',
                                  onPressed: () {
                                    Navigator.pop(context);
                                    MainShell.goTo(2);
                                  },
                                ),
                              ),
                            );
                          },

                          icon: const Icon(
                            Icons.shopping_bag_outlined,
                            size: 20,
                          ),
                          label: const Text(
                            'Sepete Ekle',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _gold,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),

                      SizedBox(width: 12),
                      SizedBox(
                        height: 52,
                        child: ListenableBuilder(
                          listenable: FavoriteService.instance,
                          builder: (context, _) {
                            final isFavorite = FavoriteService.instance
                                .isFavorite(widget.productId);

                            return OutlinedButton.icon(
                              onPressed: () {
                                FavoriteService.instance
                                    .toggle(widget.productId);
                                final nowFavorite = FavoriteService.instance
                                    .isFavorite(widget.productId);

                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      nowFavorite
                                          ? 'Favorilere eklendi'
                                          : 'Favorilerden çıkarıldı',
                                    ),
                                    duration: const Duration(seconds: 2),
                                    action: nowFavorite
                                        ? SnackBarAction(
                                            label: 'Favorilere Git',
                                            onPressed: () {
                                              Navigator.pop(context);
                                              MainShell.goTo(1);
                                            },
                                          )
                                        : null,
                                  ),
                                );
                              },
                              icon: Icon(
                                isFavorite
                                    ? Icons.favorite
                                    : Icons.favorite_border,
                                size: 20,
                                color:
                                    isFavorite ? Colors.red : Colors.black87,
                              ),
                              label: Text(
                                isFavorite ? 'Favorilendi' : 'Favorilere Ekle',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                  color: Colors.black87,
                                ),
                              ),
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: Colors.grey.shade400),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Stokta $stock adet kaldı',
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 28),
                  Divider(color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  _benefitRow('Ücretsiz sigortalı kargo'),
                  _benefitRow('5 yıl uluslararası garanti'),
                  _benefitRow('30 gün içinde iade ve değişim'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

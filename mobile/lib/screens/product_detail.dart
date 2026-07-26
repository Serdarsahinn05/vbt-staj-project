import 'package:flutter/material.dart';
import 'package:mobile/core/price_format.dart';
import 'package:mobile/screens/main_shell.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:mobile/services/cart_service.dart';
import 'package:mobile/services/favorites_service.dart';
import 'package:mobile/services/product_services.dart';
import 'package:mobile/services/review_service.dart';
import 'package:mobile/widgets/zemrek_app_bar.dart';

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
  int _selectedVariantIndex = 0;
  Map<String, dynamic>? _product;
  bool _loading = true;
  String? _error;

  double _average = 0;
  int _reviewCount = 0;
  List<Map<String, dynamic>> _reviews = [];
  bool _reviewsLoading = true;

  int _userRating = 0;
  final _reviewController = TextEditingController();
  final _scrollController = ScrollController();
  final _reviewsSectionKey = GlobalKey();
  bool _submittingReview = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _reviewController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToReviews() {
    final context = _reviewsSectionKey.currentContext;
    if (context == null) return;
    Scrollable.ensureVisible(
      context,
      duration: const Duration(milliseconds: 450),
      curve: Curves.easeInOut,
      alignment: 0.05,
    );
  }

  Future<void> _load() async {
    try {
      final product =
          await ProductServices().getProductById(widget.productId);
      if (!mounted) return;
      setState(() {
        _product = product;
        _loading = false;
      });
      await _loadReviews();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _loadReviews() async {
    setState(() => _reviewsLoading = true);
    try {
      final summary =
          await ReviewService.instance.getReviews(widget.productId);
      if (!mounted) return;
      setState(() {
        _reviews = summary.reviews;
        _average = summary.average;
        _reviewCount = summary.count;
        _reviewsLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _reviewsLoading = false);
    }
  }

  Future<void> _submitReview() async {
    if (_userRating < 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lütfen yıldız puanı seçin')),
      );
      return;
    }

    final loggedIn = await AuthService.instance.isLoggedIn;
    if (!loggedIn) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Yorum yapmak için giriş yapmalısınız')),
      );
      return;
    }

    setState(() => _submittingReview = true);
    try {
      await ReviewService.instance.addReview(
        productId: widget.productId,
        rating: _userRating,
        comment: _reviewController.text,
      );
      _reviewController.clear();
      _userRating = 0;
      await _loadReviews();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Değerlendirmeniz eklendi')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
        ),
      );
    } finally {
      if (mounted) setState(() => _submittingReview = false);
    }
  }

  num _parsePrice(dynamic value) {
    if (value is num) return value;
    if (value is String) return num.tryParse(value) ?? 0;
    return 0;
  }

  Map<String, dynamic> _activeVariant(Map<String, dynamic> product) {
    final variants = product['variants'] as List<dynamic>? ?? [];
    if (variants.isEmpty) return {};
    final index = _selectedVariantIndex.clamp(0, variants.length - 1);
    return Map<String, dynamic>.from(variants[index] as Map);
  }

  Map<String, dynamic> _productForActions(Map<String, dynamic> product) {
    final variant = _activeVariant(product);
    final images = List<String>.from(variant['images'] as List? ?? const []);

    num variantPrice = _parsePrice(variant['price']);
    num productPrice = _parsePrice(product['price']);
    final price = variantPrice > 0 ? variantPrice : productPrice;

    int parseStock(dynamic value) {
      if (value is int) return value;
      if (value is num) return value.toInt();
      return int.tryParse('$value') ?? 0;
    }

    final variantStock = parseStock(variant['stock']);
    final productStock = parseStock(product['stock']);
    final stock = variantStock > 0 ? variantStock : productStock;

    final discount = variant['discount'] is num
        ? (variant['discount'] as num).toInt()
        : int.tryParse('${variant['discount'] ?? product['discount'] ?? 0}') ??
            0;
    final effectivePrice =
        discount > 0 ? price * (1 - discount / 100) : price;

    return {
      ...product,
      'variantId': variant['id'] ?? product['variantId'],
      'price': price,
      'effectivePrice': effectivePrice,
      'stock': stock,
      'discount': discount,
      'image': images.isNotEmpty ? images.first : product['image'],
      'images': images.isNotEmpty ? images : product['images'],
      'colorName': variant['colorName'],
    };
  }

  List<String> _galleryImages(Map<String, dynamic> product) {
    final variant = _activeVariant(product);
    final images = (variant['images'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .toList();
    if (images.isNotEmpty) return images;

    final fallback = (product['images'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .toList();
    if (fallback.isNotEmpty) return fallback;

    final main = product['image'] as String? ?? '';
    return main.isEmpty ? <String>[] : [main];
  }

  String _gendersLabel(Map<String, dynamic> product) {
    final genders = (product['genders'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .toList();
    if (genders.contains('ERKEK') && genders.contains('KADIN')) {
      return 'Unisex';
    }
    if (genders.contains('ERKEK')) return 'Erkek';
    if (genders.contains('KADIN')) return 'Kadın';
    return _genderLabel(product['gender'] as String?);
  }

  String _genderLabel(String? gender) {
    switch (gender) {
      case 'ERKEK':
        return 'Erkek';
      case 'KADIN':
        return 'Kadın';
      case 'UNISEX':
        return 'Unisex';
      default:
        return gender ?? '';
    }
  }

  List<MapEntry<String, String>> _specRows(Map<String, dynamic> product) {
    final rows = <MapEntry<String, String>>[];
    void add(String label, dynamic value) {
      final text = value?.toString().trim() ?? '';
      if (text.isNotEmpty) rows.add(MapEntry(label, text));
    }

    add('Seri', product['series']);
    add('Cinsiyet', _gendersLabel(product));
    add('Kasa', product['caseSize']);
    add('Malzeme', product['material']);
    add('Çerçeve', product['bezel']);
    add('Kurma kolu', product['crown']);
    add('Kristal', product['crystal']);
    add('Su geçirmezlik', product['waterResistance']);
    add('Mekanizma', product['movement']);
    add('Kayış / bilezik', product['strap']);
    add('Kadran', product['dial']);

    final variant = _activeVariant(product);
    add('Renk', variant['colorName']);

    return rows;
  }

  Widget _ratingStars(double average, {double size = 18}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final starIndex = i + 1;
        final IconData icon;
        if (average >= starIndex) {
          icon = Icons.star;
        } else if (average >= starIndex - 0.5) {
          icon = Icons.star_half;
        } else {
          icon = Icons.star_border;
        }
        return Icon(icon, size: size, color: _gold);
      }),
    );
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

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: Colors.black,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final product = _product;
    if (product == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: const ZemrekAppBar(title: 'ZEMREK', brandTitle: true),
        body: Center(child: Text(_error ?? 'Ürün bulunamadı')),
      );
    }

    final actionProduct = _productForActions(product);
    final name = product['name'] as String;
    final category = product['category'] as String? ?? '';
    final description = product['description'] as String? ?? '';
    final series = product['series'] as String? ?? '';
    final styleTags = (product['styleTags'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .toList();
    final variants = product['variants'] as List<dynamic>? ?? [];
    final images = _galleryImages(product);
    final price = actionProduct['effectivePrice'] as num? ??
        actionProduct['price'] as num? ??
        0;
    final originalPrice = actionProduct['price'] as num? ?? 0;
    final discount = actionProduct['discount'] is num
        ? (actionProduct['discount'] as num).toInt()
        : 0;
    final stock = actionProduct['stock'] is num
        ? actionProduct['stock'] as num
        : num.tryParse('${actionProduct['stock']}') ?? 0;
    final safeIndex =
        images.isEmpty ? 0 : _selectedImage.clamp(0, images.length - 1);
    final specs = _specRows(product);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: ZemrekAppBar(
        title: 'ZEMREK',
        brandTitle: true,
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
        controller: _scrollController,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: ColoredBox(
                color: Colors.black,
                child: images.isEmpty
                    ? const Center(
                        child: Icon(
                          Icons.watch,
                          color: Colors.white54,
                          size: 72,
                        ),
                      )
                    : Image.network(
                        images[safeIndex],
                        fit: BoxFit.cover,
                        width: double.infinity,
                        errorBuilder: (context, error, stackTrace) =>
                            const Center(
                          child: Icon(
                            Icons.watch,
                            color: Colors.white54,
                            size: 72,
                          ),
                        ),
                      ),
              ),
            ),
            if (images.length > 1) ...[
              const SizedBox(height: 12),
              SizedBox(
                height: 72,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: images.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(width: 10),
                  itemBuilder: (context, index) {
                    final selected = safeIndex == index;
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
            ],
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    [
                      if (series.isNotEmpty) series.toUpperCase(),
                      if (category.isNotEmpty) category.toUpperCase(),
                    ].join(' · '),
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
                  const SizedBox(height: 8),
                  if (_reviewsLoading)
                    Text(
                      'Değerlendirmeler yükleniyor...',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade600,
                      ),
                    )
                  else
                    InkWell(
                      onTap: _reviewCount > 0 ? _scrollToReviews : null,
                      borderRadius: BorderRadius.circular(6),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            _ratingStars(_average),
                            const SizedBox(width: 8),
                            Text(
                              _reviewCount == 0
                                  ? 'Henüz puan yok'
                                  : _average.toStringAsFixed(1),
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey.shade800,
                              ),
                            ),
                            if (_reviewCount > 0)
                              Text(
                                '  ($_reviewCount değerlendirme)',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.black87,
                                  fontWeight: FontWeight.w600,
                                  decoration: TextDecoration.underline,
                                  decorationColor: Colors.black87,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  if (styleTags.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: styleTags
                          .map(
                            (tag) => Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey.shade300),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                tag,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade800,
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                  ],
                  const SizedBox(height: 10),
                  if (discount > 0) ...[
                    Text(
                      formatTryPrice(originalPrice),
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 16,
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          formatTryPrice(price),
                          style: const TextStyle(
                            color: _goldDark,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _gold,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '%$discount İndirim',
                            style: const TextStyle(
                              color: Colors.black87,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ] else
                    Text(
                      formatTryPrice(price),
                      style: const TextStyle(
                        color: _goldDark,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  const SizedBox(height: 16),
                  Text(
                    description.isEmpty
                        ? '$name, $category kategorisinde yer alan özenle seçilmiş bir modeldir.'
                        : description,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.6,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  if (variants.length > 1) ...[
                    const SizedBox(height: 24),
                    _sectionTitle('Renk seçenekleri'),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: List.generate(variants.length, (index) {
                        final variant =
                            Map<String, dynamic>.from(variants[index] as Map);
                        final selected = _selectedVariantIndex == index;
                        final hex = (variant['colorHex'] as String? ?? '')
                            .replaceFirst('#', '');
                        final color = hex.length == 6
                            ? Color(int.parse('FF$hex', radix: 16))
                            : Colors.grey;
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedVariantIndex = index;
                              _selectedImage = 0;
                            });
                          },
                          child: Column(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: selected
                                        ? _gold
                                        : Colors.grey.shade400,
                                    width: selected ? 2.5 : 1,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                variant['colorName']?.toString() ?? '',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: selected
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                  color: Colors.grey.shade800,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ),
                  ],
                  const SizedBox(height: 28),
                  Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 52,
                          child: ElevatedButton.icon(
                            onPressed: () async {
                              try {
                                await CartService.instance
                                    .addProduct(actionProduct);
                                if (!context.mounted) return;
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
                              } catch (e) {
                                if (!context.mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      e
                                          .toString()
                                          .replaceFirst('Exception: ', ''),
                                    ),
                                  ),
                                );
                              }
                            },
                            icon: const Icon(
                              Icons.shopping_bag_outlined,
                              size: 18,
                            ),
                            label: const Text(
                              'Sepete Ekle',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _gold,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: SizedBox(
                          height: 52,
                          child: ListenableBuilder(
                            listenable: FavoriteService.instance,
                            builder: (context, _) {
                              final isFavorite = FavoriteService.instance
                                  .isFavoriteProduct(actionProduct);

                              return OutlinedButton.icon(
                                onPressed: () async {
                                  try {
                                    await FavoriteService.instance
                                        .toggleProduct(actionProduct);
                                    if (!context.mounted) return;
                                    final nowFavorite =
                                        FavoriteService.instance
                                            .isFavoriteProduct(actionProduct);

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
                                  } catch (e) {
                                    if (!context.mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          e
                                              .toString()
                                              .replaceFirst('Exception: ', ''),
                                        ),
                                      ),
                                    );
                                  }
                                },
                                icon: Icon(
                                  isFavorite
                                      ? Icons.favorite
                                      : Icons.favorite_border,
                                  size: 18,
                                  color: isFavorite
                                      ? Colors.red
                                      : Colors.black87,
                                ),
                                label: Text(
                                  isFavorite
                                      ? 'Favorilendi'
                                      : 'Favorilere Ekle',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                    color: Colors.black87,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  side: BorderSide(
                                    color: Colors.grey.shade400,
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    stock > 0
                        ? 'Stokta $stock adet kaldı'
                        : 'Stok bilgisi güncelleniyor',
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                  ),
                  if (specs.isNotEmpty) ...[
                    const SizedBox(height: 28),
                    Divider(color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    _sectionTitle('Teknik özellikler'),
                    const SizedBox(height: 12),
                    ...specs.map(
                      (row) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 120,
                              child: Text(
                                row.key,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Text(
                                row.value,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Colors.black87,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  Divider(color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  _benefitRow('Ücretsiz sigortalı kargo'),
                  _benefitRow('5 yıl uluslararası garanti'),
                  _benefitRow('30 gün içinde iade ve değişim'),
                  const SizedBox(height: 12),
                  Divider(color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  KeyedSubtree(
                    key: _reviewsSectionKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                  _sectionTitle('Değerlendirmeler'),
                  const SizedBox(height: 8),
                  Text(
                    'Puan verin, isterseniz yorum da yazın',
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: List.generate(5, (index) {
                      final star = index + 1;
                      return IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 36,
                          minHeight: 36,
                        ),
                        onPressed: () => setState(() => _userRating = star),
                        icon: Icon(
                          star <= _userRating
                              ? Icons.star
                              : Icons.star_border,
                          color: _gold,
                          size: 28,
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _reviewController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Yorumunuz (isteğe bağlı)',
                      filled: true,
                      fillColor: Colors.grey.shade50,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide:
                            const BorderSide(color: _gold, width: 1.4),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _submittingReview ? null : _submitReview,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _goldDark,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: Colors.grey.shade400,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _submittingReview
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              'Değerlendirme Gönder',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  if (_reviewsLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (_reviews.isEmpty)
                    Text(
                      'Henüz yorum yok.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade600,
                      ),
                    )
                  else
                    ..._reviews.map((review) {
                      final rating = review['rating'] is num
                          ? (review['rating'] as num).toInt()
                          : 0;
                      final comment =
                          (review['comment'] as String?)?.trim() ?? '';
                      final user = review['user'];
                      // API: user.name (seed / kayıtlı kullanıcı adı)
                      final userName = user is Map
                          ? ((user['name'] as String?)?.trim().isNotEmpty == true
                              ? user['name'] as String
                              : 'Kullanıcı')
                          : 'Kullanıcı';

                      return Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    userName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                                _ratingStars(rating.toDouble(), size: 14),
                              ],
                            ),
                            if (comment.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text(
                                comment,
                                style: const TextStyle(
                                  fontSize: 14,
                                  height: 1.45,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    }),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

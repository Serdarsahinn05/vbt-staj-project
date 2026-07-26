import 'package:flutter/material.dart';
import 'package:mobile/core/price_format.dart';
import 'package:mobile/screens/main_shell.dart';
import 'package:mobile/screens/product_detail.dart';
import 'package:mobile/services/cart_service.dart';
import 'package:mobile/services/favorites_service.dart';
import 'package:mobile/services/product_services.dart';
import 'package:mobile/services/review_service.dart';
import 'package:mobile/widgets/zemrek_app_bar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedGender = 'TÜMÜ';
  String _selectedStyle = 'TÜMÜ';
  String _selectedSeries = 'TÜMÜ';
  static const _gold = Color(0xFFC4A470);
  static const _seriesOrder = ['Signature', 'Horizon', 'Apex'];

  final _productService = ProductServices();
  List<Map<String, dynamic>> _products = [];
  List<String> _filterOptions = const ['TÜMÜ'];
  List<String> _seriesOptions = const ['TÜMÜ'];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final products = await _productService.getProducts();
      List<String> categories;
      try {
        categories = await _productService.getCategories();
      } catch (_) {
        categories = products
            .map((p) => (p['category'] as String? ?? '').trim())
            .where((e) => e.isNotEmpty)
            .toSet()
            .toList();
      }

      // Kartlarda yorum sayısı için özetleri paralel çek
      final withReviews = await Future.wait(
        products.map((product) async {
          final id = product['id'] as int;
          try {
            final summary = await ReviewService.instance.getReviews(id);
            return {
              ...product,
              'reviewCount': summary.count,
              'reviewAverage': summary.average,
            };
          } catch (_) {
            return {...product, 'reviewCount': 0, 'reviewAverage': 0.0};
          }
        }),
      );

      if (!mounted) return;
      setState(() {
        _products = withReviews;
        _filterOptions = _productService.buildFilterOptions(categories);
        _seriesOptions = _buildSeriesOptions(withReviews);
        if (!_filterOptions.contains(_selectedStyle)) {
          _selectedStyle = 'TÜMÜ';
        }
        if (!_seriesOptions.contains(_selectedSeries)) {
          _selectedSeries = 'TÜMÜ';
        }
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<String> _buildSeriesOptions(List<Map<String, dynamic>> products) {
    final found = products
        .map((p) => (p['series'] as String?)?.trim() ?? '')
        .where((e) => e.isNotEmpty)
        .toSet();
    final ordered = <String>[
      for (final s in _seriesOrder)
        if (found.contains(s)) s,
    ];
    final rest = found.difference(_seriesOrder.toSet()).toList()..sort();
    return ['TÜMÜ', ...ordered, ...rest];
  }

  num _cardPrice(Map<String, dynamic> product) {
    final effective = product['effectivePrice'];
    if (effective is num && effective > 0) return effective;
    final price = product['price'];
    if (price is num) return price;
    if (price is String) return num.tryParse(price) ?? 0;
    return 0;
  }

  List<Map<String, dynamic>> get _filteredProducts {
    return _products.where((p) {
      if (!_matchesGender(p)) return false;
      if (_selectedSeries != 'TÜMÜ') {
        final series = (p['series'] as String?)?.trim() ?? '';
        if (series.toLowerCase() != _selectedSeries.toLowerCase()) {
          return false;
        }
      }
      return _productService.matchesCategoryFilter(
        p['category'] as String?,
        _selectedStyle,
      );
    }).toList();
  }

  bool _matchesGender(Map<String, dynamic> product) {
    if (_selectedGender == 'TÜMÜ') return true;
    final genders = (product['genders'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .toList();
    if (_selectedGender == 'UNISEX') {
      return genders.contains('ERKEK') && genders.contains('KADIN');
    }
    return genders.contains(_selectedGender);
  }

  Future<void> _openStyleFilter() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.sizeOf(context).height * 0.7,
            ),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Kategori',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Akıllı, Klasik, Spor, Lüks, Dress, Casual',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  Flexible(
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: _filterOptions.length,
                      itemBuilder: (context, index) {
                        final style = _filterOptions[index];
                        final selected = _selectedStyle == style;
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            style,
                            style: TextStyle(
                              fontWeight: selected
                                  ? FontWeight.bold
                                  : FontWeight.w500,
                              color: selected ? _gold : Colors.black87,
                            ),
                          ),
                          trailing: selected
                              ? const Icon(Icons.check, color: _gold)
                              : null,
                          onTap: () => Navigator.pop(context, style),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );

    if (result != null) {
      setState(() => _selectedStyle = result);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredProducts;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: ZemrekAppBar(
        title: 'ZEMREK',
        brandTitle: true,
        automaticallyImplyLeading: false,
        actions: [
          ListenableBuilder(
            listenable: CartService.instance,
            builder: (context, _) {
              final count = CartService.instance.itemCount;
              return IconButton(
                onPressed: () => MainShell.goTo(2),
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
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SEÇKİ',
                      style: TextStyle(
                        color: Color.fromARGB(255, 214, 170, 103),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.5,
                      ),
                    ),
                    SizedBox(height: 7),
                    Text(
                      'ÖNE ÇIKAN ÜRÜNLER',
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (var i = 0; i < _seriesOptions.length; i++) ...[
                    if (i > 0) const SizedBox(width: 8),
                    _buildSeriesChip(_seriesOptions[i]),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildGenderButton('TÜMÜ'),
                        const SizedBox(width: 8),
                        _buildGenderButton('KADIN'),
                        const SizedBox(width: 8),
                        _buildGenderButton('ERKEK'),
                        const SizedBox(width: 8),
                        _buildGenderButton('UNISEX'),
                      ],
                    ),
                  ),
                ),
                IconButton(
                  onPressed: _openStyleFilter,
                  icon: Badge(
                    isLabelVisible: _selectedStyle != 'TÜMÜ',
                    smallSize: 8,
                    child: Icon(
                      Icons.tune,
                      color: _selectedStyle != 'TÜMÜ' ? _gold : Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
            if (_selectedStyle != 'TÜMÜ') ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: InputChip(
                  label: Text(_selectedStyle),
                  selected: true,
                  selectedColor: _gold,
                  onDeleted: () => setState(() => _selectedStyle = 'TÜMÜ'),
                  deleteIconColor: Colors.black54,
                ),
              ),
            ],
            const SizedBox(height: 12),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Ürünler yüklenemedi.\nBackend çalışıyor mu?\n$_error',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey.shade700),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _loadProducts,
                              child: const Text('Tekrar dene'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : filtered.isEmpty
                  ? Center(
                      child: Text(
                        'Bu filtreye uygun ürün yok',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    )
                  : GridView.builder(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            childAspectRatio: 0.58,
                          ),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _buildProductCard(filtered[index]);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSeriesChip(String label) {
    final selected = _selectedSeries == label;
    final text = label == 'TÜMÜ' ? 'TÜM KOLEKSİYON' : label.toUpperCase();

    return ChoiceChip(
      label: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: selected ? Colors.black87 : Colors.black54,
        ),
      ),
      selected: selected,
      selectedColor: _gold,
      backgroundColor: Colors.white,
      side: BorderSide(color: selected ? _gold : Colors.grey.shade300),
      onSelected: (_) => setState(() => _selectedSeries = label),
      showCheckmark: false,
      padding: const EdgeInsets.symmetric(horizontal: 4),
    );
  }

  Widget _buildGenderButton(String label) {
    final selected = _selectedGender == label;

    return TextButton(
      onPressed: () {
        setState(() => _selectedGender = label);
      },
      style: TextButton.styleFrom(
        backgroundColor: selected
            ? const Color.fromARGB(255, 204, 172, 121)
            : Colors.white,
        foregroundColor: selected ? Colors.black87 : Colors.black54,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.4,
        ),
      ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    final series = (product['series'] as String?)?.trim() ?? '';
    final category = product['category'] as String? ?? '';
    final collectionLabel = (series.isNotEmpty
            ? '$series Koleksiyonu'
            : (category.isNotEmpty ? '$category Koleksiyonu' : 'Koleksiyon'))
        .toUpperCase();
    final reviewCount = product['reviewCount'] is num
        ? (product['reviewCount'] as num).toInt()
        : 0;
    final reviewAverage = product['reviewAverage'] is num
        ? (product['reviewAverage'] as num).toDouble()
        : 0.0;
    final reviewLabel = reviewCount == 0
        ? 'Henüz yorum yok'
        : '${reviewAverage.toStringAsFixed(1)} · $reviewCount yorum';
    final discount = product['discount'] is num
        ? (product['discount'] as num).toInt()
        : int.tryParse('${product['discount'] ?? 0}') ?? 0;
    final originalPrice = product['price'] is num
        ? product['price'] as num
        : num.tryParse('${product['price']}') ?? 0;
    final salePrice = _cardPrice(product);

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DetailScreen(productId: product['id'] as int),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: const Color.fromARGB(255, 219, 214, 198),
          borderRadius: BorderRadius.circular(16),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: ColoredBox(
                color: Colors.black,
                child: Stack(
                  children: [
                    Image.network(
                      product['image'] as String,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(
                            child: Icon(
                              Icons.watch,
                              color: Colors.white54,
                              size: 40,
                            ),
                          ),
                    ),
                    Positioned(
                      left: 8,
                      top: 8,
                      child: discount > 0
                          ? Container(
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
                                  fontSize: 11,
                                ),
                              ),
                            )
                          : const SizedBox.shrink(),
                    ),
                    Positioned(
                      right: 4,
                      top: 4,
                      child: ListenableBuilder(
                        listenable: FavoriteService.instance,
                        builder: (context, _) {
                          final selected = FavoriteService.instance
                              .isFavoriteProduct(product);
                          return IconButton(
                            onPressed: () async {
                              try {
                                await FavoriteService.instance.toggleProduct(
                                  product,
                                );
                              } catch (e) {
                                if (!context.mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      e.toString().replaceFirst(
                                        'Exception: ',
                                        '',
                                      ),
                                    ),
                                  ),
                                );
                              }
                            },
                            icon: Icon(
                              selected ? Icons.favorite : Icons.favorite_border,
                              color: selected
                                  ? const Color.fromARGB(253, 213, 25, 25)
                                  : Colors.white,
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      collectionLabel,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.3,
                        color: Color.fromARGB(255, 110, 109, 109),
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      product['name'] as String,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 13, color: _gold),
                        const SizedBox(width: 3),
                        Flexible(
                          child: Text(
                            reviewLabel,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey.shade700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      formatTryPrice(salePrice),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color.fromARGB(255, 157, 114, 49),
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (discount > 0) ...[
                      const SizedBox(height: 2),
                      Text(
                        formatTryPrice(originalPrice),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 11,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

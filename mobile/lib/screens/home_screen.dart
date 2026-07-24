import 'package:flutter/material.dart';
import 'package:mobile/screens/main_shell.dart';
import 'package:mobile/screens/product_detail.dart';
import 'package:mobile/services/cart_service.dart';
import 'package:mobile/services/favorites_service.dart';
import 'package:mobile/services/product_services.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedGender = 'TÜMÜ';
  String _selectedStyle = 'TÜMÜ';
  static const _gold = Color(0xFFC4A470);

  final _productService = ProductServices();
  late final List<Map<String, dynamic>> _products = _productService
      .getProducts();

  List<Map<String, dynamic>> get _filteredProducts {
    return _products.where((p) {
      final genderOk =
          _selectedGender == 'TÜMÜ' || p['gender'] == _selectedGender;

      if (!genderOk) return false;
      if (_selectedStyle == 'TÜMÜ') return true;

      final tags = (p['styleTags'] as List<dynamic>? ?? []);
      final category = p['category'] as String?;
      return category == _selectedStyle || tags.contains(_selectedStyle);
    }).toList();
  }

  Future<void> _openStyleFilter() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
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
                  'Stil / Kategori',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Spor, klasik, lüks gibi stillere göre filtrele',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                const SizedBox(height: 16),
                ...ProductServices.styleOptions.map((style) {
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
                }),
              ],
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
      appBar: AppBar(
        automaticallyImplyLeading: false,
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
              child: filtered.isEmpty
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
                            childAspectRatio: 0.65,
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
          crossAxisAlignment: CrossAxisAlignment.start,
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
                      right: 4,
                      top: 4,
                      child: ListenableBuilder(
                        listenable: FavoriteService.instance,
                        builder: (context, _) {
                          final id = product['id'] as int;
                          final selected = FavoriteService.instance.isFavorite(
                            id,
                          );
                          return IconButton(
                            onPressed: () {
                              FavoriteService.instance.toggle(id);
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
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] as String,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product['category'] as String,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color.fromARGB(255, 90, 89, 89),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '₺${product['price']}',
                    style: const TextStyle(
                      color: Color.fromARGB(255, 157, 114, 49),
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
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

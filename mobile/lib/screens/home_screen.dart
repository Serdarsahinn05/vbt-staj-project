import 'package:flutter/material.dart';
import 'package:mobile/screens/product_detail.dart';
import 'package:mobile/services/product_services.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedGender = "TÜMÜ";

  final _productService = ProductServices();
  late final List<Map<String, dynamic>> _products = _productService
      .getProducts();

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedGender == "TÜMÜ"
        ? _products
        : _products.where((p) => p["gender"] == _selectedGender).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'ZEMREK',
          style: TextStyle(
            color: Color.fromARGB(255, 214, 170, 103),
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Column(
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
                        _buildGenderButton("TÜMÜ"),
                        const SizedBox(width: 8),
                        _buildGenderButton("KADIN"),
                        const SizedBox(width: 8),
                        _buildGenderButton("ERKEK"),
                        const SizedBox(width: 8),
                        _buildGenderButton("UNISEX"),
                      ],
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.tune, color: Colors.black87),
                ),
              ],
            ),
            const SizedBox(height: 20),

            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
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
        setState(() {
          _selectedGender = label;
        });
      },
      style: TextButton.styleFrom(
        backgroundColor: selected
            ? const Color.fromARGB(255, 247, 195, 118)
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
            builder: (context) => DetailScreen(productId: product["id"] as int),
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
                child: Image.network(
                  product["image"] as String,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Icon(Icons.watch, color: Colors.white54, size: 40),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product["name"] as String,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product["category"] as String,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color.fromARGB(255, 90, 89, 89),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "₺${product["price"]}",
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

import 'package:flutter/material.dart';
import 'package:mobile/services/product_services.dart';

class DetailScreen extends StatelessWidget {
  final int productId;

  const DetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    final product = ProductServices().getProductById(productId);
    if (product == null) {
      return Scaffold(body: Center(child: Text('Ürün bulunamadı')));
    }
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [Image.network(product["image"] as String)],
      ),
    );
  }
}

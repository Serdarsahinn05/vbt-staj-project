class ProductServices {
  static const styleOptions = [
    'TÜMÜ',
    'Lüks Saat',
    'Spor Saat',
    'Klasik Saat',
    'Akıllı Saat',
  ];

  List<Map<String, dynamic>> getProducts() {
    return [
      {
        'id': 1,
        'name': 'Rolex Submariner',
        'category': 'Lüks Saat',
        'styleTags': ['Lüks Saat', 'Spor Saat'],
        'gender': 'ERKEK',
        'price': 285000,
        'image': 'https://picsum.photos/seed/submariner/600/600',
      },
      {
        'id': 2,
        'name': 'Omega Seamaster',
        'category': 'Lüks Saat',
        'styleTags': ['Lüks Saat', 'Spor Saat'],
        'gender': 'ERKEK',
        'price': 180000,
        'image': 'https://picsum.photos/seed/seamaster/600/600',
      },
      {
        'id': 3,
        'name': 'Casio G-Shock',
        'category': 'Spor Saat',
        'styleTags': ['Spor Saat'],
        'gender': 'UNISEX',
        'price': 3500,
        'image': 'https://picsum.photos/seed/gshock/600/600',
      },
      {
        'id': 4,
        'name': 'Seiko 5 Automatic',
        'category': 'Klasik Saat',
        'styleTags': ['Klasik Saat'],
        'gender': 'ERKEK',
        'price': 5000,
        'image': 'https://picsum.photos/seed/seiko5/600/600',
      },
      {
        'id': 5,
        'name': 'Apple Watch Series 9',
        'category': 'Akıllı Saat',
        'styleTags': ['Akıllı Saat', 'Spor Saat'],
        'gender': 'UNISEX',
        'price': 22000,
        'image': 'https://picsum.photos/seed/applewatch/600/600',
      },
      {
        'id': 6,
        'name': 'Daniel Wellington Petite',
        'category': 'Klasik Saat',
        'styleTags': ['Klasik Saat'],
        'gender': 'KADIN',
        'price': 4500,
        'image': 'https://picsum.photos/seed/dwpetite/600/600',
      },
    ];
  }

  Map<String, dynamic>? getProductById(int id) {
    try {
      return getProducts().firstWhere((p) => p['id'] == id);
    } catch (_) {
      return null;
    }
  }
}

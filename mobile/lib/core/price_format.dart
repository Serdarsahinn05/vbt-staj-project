/// Türkçe fiyat: ₺60.000,00
String formatTryPrice(num price) {
  final fixed = price.toStringAsFixed(2);
  final parts = fixed.split('.');
  final whole = parts[0];
  final decimals = parts.length > 1 ? parts[1] : '00';

  final buffer = StringBuffer();
  for (var i = 0; i < whole.length; i++) {
    final reverseIndex = whole.length - i;
    buffer.write(whole[i]);
    if (reverseIndex > 1 && reverseIndex % 3 == 1) {
      buffer.write('.');
    }
  }
  return '₺$buffer,$decimals';
}

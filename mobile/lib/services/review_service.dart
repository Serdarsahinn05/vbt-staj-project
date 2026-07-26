import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile/core/api_client.dart';
import 'package:mobile/core/api_config.dart';

class ReviewSummary {
  ReviewSummary({
    required this.reviews,
    required this.average,
    required this.count,
  });

  final List<Map<String, dynamic>> reviews;
  final double average;
  final int count;
}

class ReviewService {
  ReviewService._();
  static final ReviewService instance = ReviewService._();

  Future<ReviewSummary> getReviews(int productId) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/products/$productId/reviews'),
    );

    if (response.statusCode != 200) {
      throw Exception('Yorumlar alınamadı (${response.statusCode})');
    }

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final data = (body['data'] as List<dynamic>? ?? [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();

    final averageRaw = body['average'];
    final average = averageRaw is num
        ? averageRaw.toDouble()
        : double.tryParse('$averageRaw') ?? 0;

    final countRaw = body['count'];
    final count = countRaw is num
        ? countRaw.toInt()
        : int.tryParse('$countRaw') ?? data.length;

    return ReviewSummary(reviews: data, average: average, count: count);
  }

  Future<Map<String, dynamic>> addReview({
    required int productId,
    required int rating,
    String? comment,
  }) async {
    final response = await ApiClient.post(
      '/products/$productId/reviews',
      body: {
        'rating': rating,
        if (comment != null && comment.trim().isNotEmpty)
          'comment': comment.trim(),
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(_apiError(response, 'Yorum eklenemedi'));
    }

    return Map<String, dynamic>.from(jsonDecode(response.body) as Map);
  }

  Future<void> deleteReview(int reviewId) async {
    final response = await ApiClient.delete('/reviews/$reviewId');
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception(_apiError(response, 'Yorum silinemedi'));
    }
  }

  String _apiError(http.Response response, String fallback) {
    try {
      final body = jsonDecode(response.body);
      if (body is Map && body['message'] != null) {
        final message = body['message'];
        if (message is List) return message.join('\n');
        return message.toString();
      }
    } catch (_) {}
    return '$fallback (${response.statusCode})';
  }
}

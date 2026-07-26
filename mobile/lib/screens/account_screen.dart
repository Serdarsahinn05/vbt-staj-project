import 'package:flutter/material.dart';
import 'package:mobile/screens/landing_screen.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:mobile/services/cart_service.dart';
import 'package:mobile/services/favorites_service.dart';
import 'package:mobile/widgets/zemrek_app_bar.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  static const _gold = Color(0xFFC4A470);

  String _name = 'Zemrek Kullanıcı';
  String _email = '';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final name = await AuthService.instance.getName();
    final email = await AuthService.instance.getEmail();
    if (!mounted) return;
    setState(() {
      if (name != null && name.isNotEmpty) _name = name;
      _email = email ?? '';
    });
  }

  Future<void> _logout() async {
    await AuthService.instance.logout();
    CartService.instance.clearLocal();
    FavoriteService.instance.clearLocal();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LandingScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const ZemrekAppBar(
        title: 'Hesabım',
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: _gold.withValues(alpha: 0.25),
                  child: const Icon(Icons.person, color: _gold, size: 36),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _email.isEmpty ? 'Giriş yapılmadı' : _email,
                        style: const TextStyle(
                          color: Colors.black54,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _menuTile(
            icon: Icons.receipt_long_outlined,
            title: 'Siparişlerim',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Siparişler yakında')),
              );
            },
          ),
          _menuTile(
            icon: Icons.location_on_outlined,
            title: 'Adreslerim',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Adresler yakında')),
              );
            },
          ),
          _menuTile(
            icon: Icons.settings_outlined,
            title: 'Ayarlar',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Ayarlar yakında')),
              );
            },
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 52,
            child: OutlinedButton.icon(
              onPressed: _logout,
              icon: const Icon(Icons.logout, color: Colors.redAccent),
              label: const Text(
                'Çıkış Yap',
                style: TextStyle(
                  color: Colors.redAccent,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.redAccent),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _menuTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        child: ListTile(
          onTap: onTap,
          leading: Icon(icon, color: Colors.black87),
          title: Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          trailing: const Icon(Icons.chevron_right),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

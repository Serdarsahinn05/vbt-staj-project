import 'package:flutter/material.dart';
import 'package:mobile/screens/main_shell.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:mobile/services/cart_service.dart';
import 'package:mobile/services/favorites_service.dart';
import 'package:mobile/widgets/auth_text_field.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;
  bool _loading = false;

  /// Detay "Sepete Ekle" ile aynı altın
  static const _gold = Color(0xFFC4A470);

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim().toLowerCase();
    final password = _passwordController.text;
    final name = _nameController.text.trim();

    if (email.isEmpty) {
      _showError('E-posta girmek zorunludur');
      return;
    }
    if (!_isValidEmail(email)) {
      _showError('Geçerli bir e-posta adresi giriniz');
      return;
    }
    if (password.isEmpty) {
      _showError('Şifre girmek zorunludur');
      return;
    }
    if (!_isLogin) {
      if (name.isEmpty) {
        _showError('Ad soyad girmek zorunludur');
        return;
      }
      if (password.length < 6) {
        _showError('Şifre en az 6 karakter olmalıdır');
        return;
      }
    }

    setState(() => _loading = true);
    try {
      if (_isLogin) {
        await AuthService.instance.login(email: email, password: password);
      } else {
        await AuthService.instance.register(
          name: name,
          email: email,
          password: password,
        );
      }

      try {
        await Future.wait([
          CartService.instance.refresh(),
          FavoriteService.instance.refresh(),
        ]);
      } catch (_) {}

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainShell()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      final message = e.toString().replaceFirst('Exception: ', '');
      _showError(message);

      if (!_isLogin && message.toLowerCase().contains('zaten kayıtlı')) {
        setState(() => _isLogin = true);
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email);
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Scaffold(
      backgroundColor: const Color(0xFF0C0C0C),
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.arrow_back_ios_new,
                    color: _gold,
                    size: 20,
                  ),
                ),
              ),
            ),
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(24, 8, 24, 24 + bottomInset),
                    keyboardDismissBehavior:
                        ScrollViewKeyboardDismissBehavior.onDrag,
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight - bottomInset,
                      ),
                      child: IntrinsicHeight(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Center(
                              child: ColorFiltered(
                                colorFilter: const ColorFilter.mode(
                                  _gold,
                                  BlendMode.srcIn,
                                ),
                                child: Image.asset(
                                  'assets/images/logo.png',
                                  height: 67,
                                ),
                              ),
                            ),
                            const SizedBox(height: 30),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1A1A1A),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: _loading
                                              ? null
                                              : () => setState(
                                                    () => _isLogin = true,
                                                  ),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 12,
                                            ),
                                            decoration: BoxDecoration(
                                              color: _isLogin
                                                  ? _gold
                                                  : Colors.transparent,
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              'Giriş',
                                              style: TextStyle(
                                                color: _isLogin
                                                    ? Colors.black
                                                    : Colors.white54,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: _loading
                                              ? null
                                              : () => setState(
                                                    () => _isLogin = false,
                                                  ),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 12,
                                            ),
                                            decoration: BoxDecoration(
                                              color: !_isLogin
                                                  ? _gold
                                                  : Colors.transparent,
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              'Kayıt',
                                              style: TextStyle(
                                                color: !_isLogin
                                                    ? Colors.black
                                                    : Colors.white54,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    _isLogin
                                        ? 'Giriş için e-posta ve şifre yeterli.'
                                        : 'Her e-posta yalnızca bir kez kayıt olabilir.',
                                    style: const TextStyle(
                                      color: Colors.white38,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  if (!_isLogin) ...[
                                    AuthTextField(
                                      hint: 'AD SOYAD',
                                      icon: Icons.person_outline,
                                      controller: _nameController,
                                    ),
                                    const SizedBox(height: 14),
                                  ],
                                  AuthTextField(
                                    hint: 'E-MAİL',
                                    icon: Icons.mail_outline,
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                  ),
                                  const SizedBox(height: 14),
                                  AuthTextField(
                                    hint: 'ŞİFRE',
                                    icon: Icons.lock_outline,
                                    obscureText: true,
                                    controller: _passwordController,
                                  ),
                                  const SizedBox(height: 20),
                                  SizedBox(
                                    width: double.infinity,
                                    height: 52,
                                    child: ElevatedButton(
                                      onPressed: _loading ? null : _submit,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: _gold,
                                        foregroundColor: Colors.black,
                                        disabledBackgroundColor:
                                            Colors.grey.shade700,
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                        ),
                                      ),
                                      child: _loading
                                          ? const SizedBox(
                                              width: 22,
                                              height: 22,
                                              child:
                                                  CircularProgressIndicator(
                                                strokeWidth: 2,
                                                color: Colors.white,
                                              ),
                                            )
                                          : Text(
                                              _isLogin
                                                  ? 'GİRİŞ YAP'
                                                  : 'KAYIT OL',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w600,
                                                fontSize: 16,
                                              ),
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

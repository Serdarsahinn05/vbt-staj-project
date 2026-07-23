import 'package:flutter/material.dart';
import 'package:mobile/screens/home_screen.dart';
import 'package:mobile/widgets/auth_text_field.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C0C0C),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Üstte sabit geri ok
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.arrow_back_ios_new,
                    color: Color.fromARGB(255, 218, 166, 88),
                    size: 20,
                  ),
                ),
              ),

              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(
                      child: ColorFiltered(
                        colorFilter: const ColorFilter.mode(
                          Color.fromARGB(255, 218, 166, 88),
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
                                  onTap: () => setState(() => _isLogin = true),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    decoration: BoxDecoration(
                                      color: _isLogin
                                          ? const Color.fromARGB(
                                              255,
                                              179,
                                              128,
                                              51,
                                            )
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
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
                                  onTap: () => setState(() => _isLogin = false),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    decoration: BoxDecoration(
                                      color: !_isLogin
                                          ? const Color.fromARGB(
                                              255,
                                              179,
                                              128,
                                              51,
                                            )
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
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
                          const SizedBox(height: 30),
                          if (!_isLogin) ...[
                            AuthTextField(
                              hint: "AD SOYAD",
                              icon: Icons.person_outline,
                            ),
                          ],
                          SizedBox(height: 14),
                          AuthTextField(
                            hint: "E-MAİL",
                            icon: Icons.mail_outline,
                          ),
                          const SizedBox(height: 14),
                          AuthTextField(
                            hint: "ŞİFRE",
                            icon: Icons.lock_outline,
                            obscureText: true,
                          ),
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.pushAndRemoveUntil(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const HomeScreen(),
                                  ),
                                  (route) => false, // geride sayfa bırakma
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color.fromARGB(
                                  255,
                                  179,
                                  128,
                                  51,
                                ),
                                foregroundColor: Colors.black,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Text(
                                _isLogin ? 'GİRİŞ YAP' : 'KAYIT OL',
                                style: TextStyle(
                                  color: Color.fromARGB(255, 245, 239, 239),
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
            ],
          ),
        ),
      ),
    );
  }
}

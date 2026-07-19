import 'package:flutter/material.dart';
import 'package:mobile/screens/auth_screen.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  final ScrollController scrollController = ScrollController();

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      body: SingleChildScrollView(
        controller: scrollController,
        child: Column(
          children: [
            Stack(
              children: [
                Container(
                  height: screenHeight,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage('assets/images/02.jpg'),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Container(
                  height: screenHeight,
                  color: Colors.black.withValues(alpha: 0.5),
                ),

                Positioned.fill(
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24.0,
                        vertical: 20.0,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox(height: 12),
                          const Text(
                            "YENİ KOLEKSİYON • 2026",
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Color.fromARGB(255, 214, 170, 103),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            "Zamanın\nÖtesinde Zarafet",
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            "El işçiliğiyle üretilen İsviçre mekanizmaları, her ayrıntıda hissedilen zamansız bir ustalıkla buluşuyor.",
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 15,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 15),
                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const AuthScreen(),
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Color.fromARGB(
                                  255,
                                  218,
                                  166,
                                  88,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              child: Text(
                                "Koleksiyonu Keşfet",
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: 15,
                                  height: 1.2,
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(height: 15),
                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: ElevatedButton(
                              onPressed: () {
                                scrollController.animateTo(
                                  screenHeight,
                                  duration: const Duration(milliseconds: 600),
                                  curve: Curves.easeInOut,
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color.fromARGB(
                                  255,
                                  245,
                                  241,
                                  241,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              child: Text(
                                "Markayı Tanı",
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: 15,
                                  height: 1.2,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Container(
              width: double.infinity,
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
              child: Column(
                children: [
                  Image.asset("assets/images/logo.png", width: 50),
                  const SizedBox(height: 50),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "HİKAYEMİZ",
                      style: TextStyle(
                        color: Color.fromARGB(255, 214, 170, 103),
                        fontSize: 15,
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),
                  Text(
                    "Bir Nesilden Diğerine Taşınan Ustalık",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    "1974 yılında İsviçre'nin Cenevre kentinde kurulan Zemrek, geleneksel saat ustalığını modern tasarım anlayışıyla buluşturma hedefiyle yola çıktı. Kurulduğu günden bu yana her saat, deneyimli ustaların titiz işçiliğiyle üretiliyor ve kalite standartlarını karşılamak için kapsamlı dayanıklılık testlerinden geçiriliyor.",
                  ),
                  SizedBox(height: 15),
                  Text(
                    "Yarım asrı aşan tecrübemizle her koleksiyonumuzda zarafeti, güvenilirliği ve hassas zamanı bir araya getiriyoruz. Zemrek için bir saat yalnızca zamanı gösteren bir aksesuar değil; yıllar boyunca değerini koruyan ve nesilden nesile aktarılabilecek bir mirastır.",
                  ),
                  SizedBox(height: 15),
                  Text(
                    "Zemrek saat olarak, geçmişin ustalığını geleceğin tasarımlarıyla buluşturarak her anınıza değer katmaya devam ediyoruz.",
                  ),
                  const SizedBox(height: 50),
                  Image.asset("assets/images/04.jpg", fit: BoxFit.cover),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

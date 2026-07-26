import 'package:flutter/material.dart';

class AuthTextField extends StatelessWidget {
  const AuthTextField({
    super.key,
    required this.hint,
    required this.icon,
    this.obscureText = false,
    this.controller,
    this.keyboardType,
  });

  final String hint;
  final IconData icon;
  final bool obscureText;
  final TextEditingController? controller;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      cursorColor: Color(0xFFC4A470),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.white38),
        floatingLabelBehavior: FloatingLabelBehavior.never,
        prefixIcon: Icon(icon, color: Colors.white38),
        filled: true,
        fillColor: const Color(0xFF0C0C0C),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(
            color: Color(0xFFC4A470),
            width: 1.2,
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:mobile/screen/auth/login.dart';
import 'package:mobile/screen/home/Home.dart';
import 'package:mobile/screen/main.dart';

class AppRoute {
  static const String login = '/login';
  static const String main = '/';
  static const String home = '/home';

  static Route<dynamic> generateRoute(
    RouteSettings setting,
  ) {
    switch (setting.name) {
      case login:
        return MaterialPageRoute(
          builder: (_) => LoginPage(),
        );
      case main:
        return MaterialPageRoute(builder: (_) => Main());
      case home:
        return MaterialPageRoute(builder: (_) => Home());
      default:
        return MaterialPageRoute(
          builder:
              (_) => Scaffold(
                body: Center(child: Text('Not found')),
              ),
        );
    }
  }
}

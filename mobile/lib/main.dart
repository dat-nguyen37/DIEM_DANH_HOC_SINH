import 'package:flutter/material.dart';
import 'package:mobile/routes/route.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      initialRoute: AppRoute.login,
      onGenerateRoute: AppRoute.generateRoute,
      debugShowCheckedModeBanner: false,
    );
  }
}

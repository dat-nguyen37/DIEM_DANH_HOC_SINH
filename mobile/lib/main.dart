import 'package:flutter/material.dart';
import 'package:mobile/routes/route.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() {
  initializeDateFormatting('vi_VN', null).then((_) {
    runApp(const MyApp());
  });
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

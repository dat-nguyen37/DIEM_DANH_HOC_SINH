import 'package:flutter/material.dart';
import 'package:mobile/routes/route.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool _isShowPass = false;
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  void Login() {
    String username = usernameController.text;
    String password = passwordController.text;
    if (username == "admin" && password == "admin") {
      Navigator.pushNamedAndRemoveUntil(
        context,
        AppRoute.main,
        (route) => false,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            "Tên đăng nhập hoặc mật khẩu không đúng",
          ),
        ),
      );
    }
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            colors: [
              Colors.blue.shade800,
              Colors.blue.shade400,
              Colors.blue.shade200,
            ],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(20),
            child: Card(
              elevation: 10,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.lock_person_rounded,
                      size: 40,
                      color: Colors.blue,
                    ),
                    SizedBox(height: 20),
                    Text(
                      "Chào mừng trở lại",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      "Đăng nhập để tiếp tục",
                      style: TextStyle(color: Colors.grey),
                    ),
                    SizedBox(height: 30),
                    TextField(
                      controller: usernameController,
                      decoration: InputDecoration(
                        labelText: 'Tên đăng nhập',
                        prefixIcon: Icon(
                          Icons.person_2_outlined,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(15),
                        ),
                      ),
                    ),
                    SizedBox(height: 30),
                    TextField(
                      controller: passwordController,
                      obscureText: _isShowPass,
                      decoration: InputDecoration(
                        labelText: "Mật khẩu",
                        prefixIcon: Icon(
                          Icons.lock_outline,
                        ),
                        suffixIcon: IconButton(
                          onPressed:
                              () => setState(() {
                                _isShowPass = !_isShowPass;
                              }),
                          icon: Icon(
                            _isShowPass
                                ? Icons.visibility_off
                                : Icons.visibility,
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(15),
                        ),
                      ),
                    ),
                    SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton(
                        onPressed: Login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              Colors.blue.shade700,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(15),
                          ),
                          elevation: 5,
                        ),
                        child: Text(
                          "Đăng nhập",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

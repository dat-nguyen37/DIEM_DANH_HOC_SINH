import 'package:flutter/material.dart';
import 'package:mobile/screen/attendance/attendance.dart';
import 'package:mobile/screen/home/Home.dart';

class Main extends StatefulWidget {
  const Main({super.key});

  @override
  State<Main> createState() => _MainState();
}

class _MainState extends State<Main> {
  int selectedIndex = 0;
  @override
  Widget build(BuildContext context) {
    final items = <BottomNavigationBarItem>[
      const BottomNavigationBarItem(
        icon: Icon(Icons.home),
        label: 'Trang chủ',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.home),
        label: 'Điểm danh',
      ),
    ];
    return Scaffold(
      body: getBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: selectedIndex,
        items: items,
        type: BottomNavigationBarType.fixed,
        onTap: onTapHandle,
        selectedItemColor: Colors.blue,
      ),
    );
  }

  Widget getBody() {
    final bodyList = <Widget>[Home(), Attendance()];
    return bodyList[selectedIndex];
  }

  void onTapHandle(int index) {
    setState(() {
      selectedIndex = index;
    });
  }
}

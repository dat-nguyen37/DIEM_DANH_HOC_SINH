import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

class BangCongPage extends StatefulWidget {
  @override
  _BangCongPageState createState() => _BangCongPageState();
}

class _BangCongPageState extends State<BangCongPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(
          "Bảng điểm danh",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor:
            Colors.red[900], // Màu đỏ sẫm như ảnh
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.add_box_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildCalendarCard(),
            _buildLegendCard(),
            _buildAttendanceDetailCard(),
          ],
        ),
      ),
    );
  }

  // 1. Widget Lịch
  Widget _buildCalendarCard() {
    return Container(
      margin: EdgeInsets.all(16),
      padding: EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: TableCalendar(
        locale: 'vi_VN',
        firstDay: DateTime.utc(2020, 1, 1),
        lastDay: DateTime.utc(2030, 12, 31),
        focusedDay: _focusedDay,
        headerStyle: HeaderStyle(
          formatButtonVisible: false,
          titleCentered: true,
          titleTextStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        calendarStyle: CalendarStyle(
          // Tùy chỉnh ngày được chọn
          selectedDecoration: BoxDecoration(
            color: Colors.indigo[200],
            shape: BoxShape.circle,
          ),
          // Tùy chỉnh ngày hiện tại
          todayDecoration: BoxDecoration(
            border: Border.all(color: Colors.red, width: 2),
            shape: BoxShape.circle,
          ),
          todayTextStyle: TextStyle(color: Colors.black),
        ),
        // Logic để hiển thị gạch chân xanh (Đủ công) dưới ngày
        calendarBuilders: CalendarBuilders(
          defaultBuilder: (context, day, focusedDay) {
            // Demo: Nếu ngày < hôm nay, hiển thị gạch chân xanh
            if (day.isBefore(DateTime.now()) &&
                day.weekday < 6) {
              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('${day.day}'),
                  Container(
                    height: 2,
                    width: 12,
                    color: Colors.green,
                  ),
                ],
              );
            }
            return null;
          },
        ),
      ),
    );
  }

  // 2. Widget Chú thích (Legend)
  Widget _buildLegendCard() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        children: [
          _buildLegendItem(
            Icons.circle,
            Colors.redAccent,
            "Chưa điểm danh",
          ),
          SizedBox(height: 8),
          _buildLegendItem(
            Icons.circle,
            Colors.green,
            "Hoàn thành",
          ),
          SizedBox(height: 8),
          _buildLegendItem(
            Icons.circle,
            Colors.orange,
            "Không điểm danh, đi muộn, về sớm",
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(
    IconData icon,
    Color color,
    String text,
  ) {
    return Row(
      children: [
        Icon(icon, color: color, size: 12),
        SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            fontSize: 13,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  // 3. Widget Chi tiết ngày chấm công
  Widget _buildAttendanceDetailCard() {
    return Container(
      margin: EdgeInsets.all(16),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.alarm_on, color: Colors.green),
              SizedBox(width: 8),
              Text(
                "Hoàn thành",
                style: TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          Text(
            "26/02/2026",
            style: TextStyle(color: Colors.grey),
          ),
          SizedBox(height: 16),
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.red[200]!),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment:
                  MainAxisAlignment.spaceAround,
              children: [
                _buildTimeInfo("Điểm danh vào", "08:22:57"),
                VerticalDivider(color: Colors.grey),
                _buildTimeInfo("Điểm danh ra", "18:33:14"),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeInfo(String label, String time) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
        SizedBox(height: 4),
        Text(
          time,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

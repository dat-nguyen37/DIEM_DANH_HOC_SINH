import 'package:flutter/material.dart';

class Attendance extends StatefulWidget {
  const Attendance({super.key});

  @override
  State<Attendance> createState() => _AttendanceState();
}

class _AttendanceState extends State<Attendance> {
  DateTime selectedDate = DateTime.now();

  final List<Map<String, dynamic>> data = [
    {
      "name": "Nguyễn Tuấn Đạt",
      "status": true,
      "date": DateTime(2026, 2, 2),
    },
    {
      "name": "Nguyễn Tuấn Nghĩa",
      "status": false,
      "date": DateTime(2026, 2, 1),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredData =
        data.where((item) {
          final d = item['date'] as DateTime;
          return d.year == selectedDate.year &&
              d.month == selectedDate.month &&
              d.day == selectedDate.day;
        }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Điểm danh'),
        centerTitle: true,
      ),
      body: Column(
        children: [
          _buildDateFilter(),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: filteredData.length,
              itemBuilder: (context, index) {
                final item = filteredData[index];
                final isChecked = item['status'];

                return Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    leading: Icon(
                      isChecked
                          ? Icons.check_circle
                          : Icons.cancel,
                      color:
                          isChecked
                              ? Colors.green
                              : Colors.red,
                    ),
                    title: Text(item['name']),
                    subtitle: Text(
                      isChecked
                          ? 'Đã điểm danh'
                          : 'Chưa điểm danh',
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  /// 🔹 Thanh lọc ngày
  Widget _buildDateFilter() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 10,
      ),
      margin: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: _pickDate,
        child: Row(
          children: [
            const Icon(
              Icons.calendar_today,
              color: Colors.blue,
            ),
            const SizedBox(width: 8),
            Text(
              _formatDate(selectedDate),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDate() async {
    final DateTime? date = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime(2023),
      lastDate: DateTime(2100),
    );

    if (date != null) {
      setState(() {
        selectedDate = date;
      });
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

import 'package:flutter/material.dart';
import 'package:mobile/screen/home/Modal/AddStudent.dart';
import 'package:intl/intl.dart';

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  final List<Map<String, dynamic>> data = [
    {"name": "Nguyễn Tuấn Đạt", "absent": 10},
    {"name": "Nguyễn Tuấn Nghĩa", "absent": 4},
    {"name": "Lưu Nhật Minh", "absent": 6},
    {"name": "Nguyễn Trung Quang", "absent": 2},
  ];

  final int totalSessions = 22;
  DateTime selectedDate = DateTime.now();

  final dateFormat = DateFormat('dd/MM/yyyy');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danh sách sinh viên'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _openAddModal,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildDateFilter(),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: data.length,
              itemBuilder: (context, index) {
                final item = data[index];
                final absent = item['absent'] as int;
                final percent = absent / totalSessions;

                return Card(
                  elevation: 3,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        /// Tên + xoá
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                item['name'],
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight:
                                      FontWeight.w600,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(
                                Icons.delete_outline,
                                color: Colors.red,
                              ),
                              onPressed: () {
                                setState(() {
                                  data.removeAt(index);
                                });
                              },
                            ),
                          ],
                        ),

                        const SizedBox(height: 6),

                        /// Số buổi vắng
                        Text(
                          '$absent / $totalSessions buổi',
                          style: TextStyle(
                            color: Colors.grey.shade700,
                          ),
                        ),

                        const SizedBox(height: 8),

                        /// Progress
                        LinearProgressIndicator(
                          value: percent,
                          minHeight: 6,
                          backgroundColor:
                              Colors.grey.shade300,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(
                                percent > 0.5
                                    ? Colors.red
                                    : Colors.orange,
                              ),
                        ),
                      ],
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

  /// 📅 Thanh chọn ngày
  Widget _buildDateFilter() {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 12,
      ),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(14),
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
              dateFormat.format(selectedDate),
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

  /// 🔹 mở modal thêm sinh viên
  void _openAddModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(16),
        ),
      ),
      builder: (context) {
        return AddStudentModal(
          onAdd: (name, absent) {
            setState(() {
              data.add({"name": name, "absent": absent});
            });
            Navigator.pop(context);
          },
        );
      },
    );
  }
}

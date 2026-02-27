import 'package:flutter/material.dart';
import 'package:mobile/routes/route.dart';

class StudentProfilePage extends StatelessWidget {
  const StudentProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    // Thông tin giả lập (Sau này bạn sẽ lấy từ API/Local Storage)
    const String studentName = "Nguyễn Văn An";
    const String studentId = "HS2026-0001";
    const String className = "Lớp 12A1";
    const String rfidTag =
        "102.938.475.61"; // Mã thẻ RFID để học sinh đối chiếu

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text(
          "Thông tin học sinh",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.red[900],
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeader(studentName, studentId),
            const SizedBox(height: 20),
            _buildInfoSection(className, rfidTag),
            const SizedBox(height: 15),
            _buildHistorySummary(),
            const SizedBox(height: 30),
            _buildLogoutButton(context),
          ],
        ),
      ),
    );
  }

  // 1. Phần Header: Avatar và Tên
  Widget _buildHeader(String name, String id) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(bottom: 30, top: 10),
      decoration: BoxDecoration(
        color: Colors.red[900],
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 45,
            backgroundColor: Colors.white,
            child: Icon(
              Icons.person,
              size: 55,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 15),
          Text(
            name.toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            "MSHS: $id",
            style: TextStyle(
              color: Colors.red[100],
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  // 2. Phần thông tin lớp và thẻ RFID
  Widget _buildInfoSection(String className, String rfid) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          _buildInfoTile(
            Icons.school_outlined,
            "Lớp học",
            className,
          ),
          const Divider(),
          _buildInfoTile(
            Icons.nfc_outlined,
            "Mã thẻ RFID",
            rfid,
          ),
        ],
      ),
    );
  }

  // 3. Phần tóm tắt lịch sử (Để học sinh biết tình trạng hiện tại)
  Widget _buildHistorySummary() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Tóm tắt tháng này",
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          Row(
            mainAxisAlignment:
                MainAxisAlignment.spaceAround,
            children: [
              _buildSummaryItem(
                "22",
                "Ngày học",
                Colors.blue,
              ),
              _buildSummaryItem(
                "02",
                "Vắng mặt",
                Colors.red,
              ),
              _buildSummaryItem(
                "01",
                "Đi muộn",
                Colors.orange,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(
    String value,
    String label,
    Color color,
  ) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoTile(
    IconData icon,
    String title,
    String value,
  ) {
    return ListTile(
      leading: Icon(icon, color: Colors.red[900]),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          color: Colors.grey,
        ),
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  // 4. Nút Đăng xuất
  Widget _buildLogoutButton(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: TextButton(
        onPressed: () => _handleLogout(context),
        style: TextButton.styleFrom(
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey[300]!),
          ),
        ),
        child: const Text(
          "Đăng xuất",
          style: TextStyle(color: Colors.red),
        ),
      ),
    );
  }

  void _handleLogout(BuildContext context) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text("Đăng xuất"),
            content: const Text(
              "Bạn có muốn đăng xuất khỏi ứng dụng không?",
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Hủy"),
              ),
              TextButton(
                onPressed: () {
                  // Xử lý logic xóa session tại đây
                  Navigator.pushNamedAndRemoveUntil(
                    context,
                    AppRoute.login,
                    (route) => false,
                  );
                },
                child: const Text(
                  "Đồng ý",
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
    );
  }
}

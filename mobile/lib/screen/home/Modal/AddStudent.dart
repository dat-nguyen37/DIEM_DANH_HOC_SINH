import 'package:flutter/material.dart';

class AddStudentModal extends StatefulWidget {
  final Function(Map<String, dynamic> data) onAdd;

  const AddStudentModal({super.key, required this.onAdd});

  @override
  State<AddStudentModal> createState() =>
      _AddStudentModalState();
}

class _AddStudentModalState extends State<AddStudentModal> {
  final nameController = TextEditingController();
  final idController = TextEditingController();

  // Trạng thái kiểm soát việc đã quét hay chưa
  bool isScanned = false;
  bool isScanning = false; // Hiệu ứng đang quét
  int? fingerprint;

  void _handleFingerprint() async {
    if (isScanned) {
      // Nếu đã quét rồi -> Ấn vào là Xóa
      setState(() {
        isScanned = false;
      });
    } else {
      // Nếu chưa quét -> Bắt đầu quét giả lập
      setState(() {
        isScanning = true;
      });

      // Giả lập chờ 2 giây để quét vân tay từ phần cứng
      await Future.delayed(const Duration(seconds: 2));

      setState(() {
        isScanning = false;
        isScanned = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom:
            MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Thêm sinh viên',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: idController,
            decoration: const InputDecoration(
              labelText: 'Id sinh viên',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: nameController,
            decoration: const InputDecoration(
              labelText: 'Tên sinh viên',
            ),
          ),
          const SizedBox(height: 20),

          // --- NÚT QUÉT VÂN TAY ---
          ElevatedButton.icon(
            onPressed:
                isScanning ? null : _handleFingerprint,
            style: ElevatedButton.styleFrom(
              // Nếu đã quét thì đổi sang màu đỏ (để xóa), chưa quét thì màu xanh
              backgroundColor:
                  isScanned
                      ? Colors.red.shade600
                      : Colors.blue.shade700,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(
                vertical: 12,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
            ),
            icon:
                isScanning
                    ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                    : Icon(Icons.fingerprint),
            label: Text(
              isScanning
                  ? "Đang quét..."
                  : (isScanned
                      ? "Xóa vân tay / Quét lại"
                      : "Quét vân tay"),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          const SizedBox(height: 16),

          // --- NÚT THÊM ---
          ElevatedButton(
            // Chỉ cho bấm Thêm khi đã nhập tên, id và ĐÃ QUÉT VÂN TAY
            onPressed:
                (isScanned && !isScanning)
                    ? () {
                      widget.onAdd({
                        "name": nameController.text,
                        "studentId": idController.text,
                        "fingerprint": fingerprint
                      });
                    }
                    : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green.shade700,
              disabledBackgroundColor: Colors.grey.shade400,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
            ),
            child: const Text("Thêm sinh viên"),
          ),
        ],
      ),
    );
  }
}

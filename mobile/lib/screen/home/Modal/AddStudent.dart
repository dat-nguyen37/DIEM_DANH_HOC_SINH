import 'package:flutter/material.dart';

class AddStudentModal extends StatefulWidget {
  final Function(String, int) onAdd;

  const AddStudentModal({super.key, required this.onAdd});

  @override
  State<AddStudentModal> createState() =>
      _AddStudentModalState();
}

class _AddStudentModalState extends State<AddStudentModal> {
  final nameController = TextEditingController();
  final absentController = TextEditingController();

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
            controller: nameController,
            decoration: const InputDecoration(
              labelText: 'Tên sinh viên',
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: absentController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Số buổi vắng',
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isEmpty ||
                  absentController.text.isEmpty)
                return;

              widget.onAdd(
                nameController.text,
                int.parse(absentController.text),
              );
            },
            child: const Text('Thêm'),
          ),
        ],
      ),
    );
  }
}

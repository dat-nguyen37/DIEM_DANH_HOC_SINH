import 'package:flutter/material.dart';
import 'package:mobile/config/api.config.dart';

class ApiService {
  final ApiConfig apiConfig = ApiConfig();

  Future<List<dynamic>> getStudent(
    String month,
    String year,
  ) async {
    try {
      final response = await apiConfig.get(
        "student/getAll?month=$month&year=$year",
      );
      return response;
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>> createStudent(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await apiConfig.post(
        "student/create",
        data,
      );
      return {
        "success": true,
        "message": "Thêm thành công",
      };
    } catch (e) {
      return {"success": false, "message": "Thêm thất bại"};
    }
  }
}

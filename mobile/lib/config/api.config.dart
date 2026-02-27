import 'package:dio/dio.dart';

class ApiConfig {
  var dio = Dio();

  ApiConfig() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handle) async {
          if (!options.path.contains('http')) {
            options.path =
                "http://192.168.1.97:5000/api/${options.path}";
          }
          print(options.path);
          options.connectTimeout = Duration(seconds: 30);
          options.receiveTimeout = Duration(seconds: 30);
          return handle.next(options);
        },
        onResponse: (response, handle) {
          return handle.next(response);
        },
        onError: (error, handle) {
          return handle.next(error);
        },
      ),
    );
  }

  Future<List<dynamic>> get(String path) async {
    try {
      final response = await dio.get(path);

      if (response.statusCode == 200) {
        // Kiểm tra nếu data là Map, nếu là String thì cần decode (tùy API)
        return response.data['data'];
      }
      return [];
    } on DioException catch (e) {
      print("Lỗi API: ${e.message}");
      return [];
    } catch (e) {
      print("Lỗi không xác định: $e");
      return [];
    }
  }

  Future<void> post(
    String path,
    Map<String, dynamic> data,
  ) async {
    try {
      await dio.post(path, data: data);
    } catch (e) {
      print("Lỗi không xác định: $e");
    }
  }

  Future<void> put() async {
    try {} catch (e) {}
  }

  Future<void> delete() async {
    try {} catch (e) {}
  }
}

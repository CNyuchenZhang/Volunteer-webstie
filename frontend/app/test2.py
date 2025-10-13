import requests
import json
import time
from typing import Dict, Any

class APITester:
    def __init__(self, base_url: str = "http://47.84.114.53"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        
    def log_result(self, test_name: str, status: str, details: str):
        """记录测试结果"""
        result = {
            "测试名称": test_name,
            "状态": status,
            "详情": details,
            "时间": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.test_results.append(result)
        print(f"[{status}] {test_name}: {details}")
    
    def test_register_success(self):
        """测试用户注册成功案例"""
        url = f"{self.base_url}/register/"
        test_data = {
            "username": f"testuser_{int(time.time())}",  # 使用时间戳确保用户名唯一
            "character": "player",
            "password": "testpassword123"
        }
        
        try:
            response = self.session.post(url, json=test_data)
            if response.status_code == 201:
                self.log_result("注册成功测试", "通过", f"状态码: {response.status_code}")
                return test_data  # 返回注册的用户信息供后续测试使用
            else:
                self.log_result("注册成功测试", "失败", f"期望状态码201，实际: {response.status_code}, 响应: {response.text}")
                return None
        except Exception as e:
            self.log_result("注册成功测试", "错误", f"请求异常: {str(e)}")
            return None
    
    def test_register_conflict(self):
        """测试用户名冲突"""
        url = f"{self.base_url}/register/"
        # 先注册一个用户
        test_data = {
            "username": "duplicate_user",
            "character": "admin",
            "password": "password123"
        }
        
        try:
            # 第一次注册
            self.session.post(url, json=test_data)
            
            # 第二次注册相同用户名
            response = self.session.post(url, json=test_data)
            if response.status_code == 409:
                self.log_result("注册冲突测试", "通过", f"状态码: {response.status_code}")
            else:
                self.log_result("注册冲突测试", "失败", f"期望状态码409，实际: {response.status_code}")
        except Exception as e:
            self.log_result("注册冲突测试", "错误", f"请求异常: {str(e)}")
    
    def test_register_bad_request(self):
        """测试注册时的错误请求"""
        url = f"{self.base_url}/register/"
        
        # 测试缺少必需字段
        invalid_data_sets = [
            {},  # 空数据
            {"username": "test"},  # 缺少password和character
            {"password": "test123"},  # 缺少username和character
            {"character": "player"},  # 缺少username和password
        ]
        
        for i, invalid_data in enumerate(invalid_data_sets):
            try:
                response = self.session.post(url, json=invalid_data)
                if response.status_code == 400:
                    self.log_result(f"注册错误请求测试{i+1}", "通过", f"状态码: {response.status_code}")
                else:
                    self.log_result(f"注册错误请求测试{i+1}", "失败", f"期望状态码400，实际: {response.status_code}")
            except Exception as e:
                self.log_result(f"注册错误请求测试{i+1}", "错误", f"请求异常: {str(e)}")
    
    def test_login_success(self, user_data: Dict[str, str] = None):
        """测试登录成功"""
        url = f"{self.base_url}/login/"
        
        # 如果没有提供用户数据，先注册一个用户
        if not user_data:
            user_data = self.test_register_success()
            if not user_data:
                self.log_result("登录成功测试", "跳过", "无法获取有效用户数据")
                return
        
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        try:
            response = self.session.post(url, json=login_data)
            if response.status_code == 200:  # 根据文档，成功应该是100，但通常HTTP成功是200
                self.log_result("登录成功测试", "通过", f"状态码: {response.status_code}")
            elif response.status_code == 100:  # 如果API真的返回100
                self.log_result("登录成功测试", "通过", f"状态码: {response.status_code}")
            else:
                self.log_result("登录成功测试", "失败", f"期望状态码200或100，实际: {response.status_code}")
        except Exception as e:
            self.log_result("登录成功测试", "错误", f"请求异常: {str(e)}")
    
    def test_login_wrong_credentials(self):
        """测试错误的登录凭据"""
        url = f"{self.base_url}/login/"
        
        wrong_credentials = [
            {"username": "nonexistent", "password": "wrongpass"},
            {"username": "testuser", "password": "wrongpassword"},
        ]
        
        for i, creds in enumerate(wrong_credentials):
            try:
                response = self.session.post(url, json=creds)
                if response.status_code == 401:
                    self.log_result(f"登录错误凭据测试{i+1}", "通过", f"状态码: {response.status_code}")
                else:
                    self.log_result(f"登录错误凭据测试{i+1}", "失败", f"期望状态码401，实际: {response.status_code}")
            except Exception as e:
                self.log_result(f"登录错误凭据测试{i+1}", "错误", f"请求异常: {str(e)}")
    
    def test_login_bad_request(self):
        """测试登录时的错误请求"""
        url = f"{self.base_url}/login/"
        
        invalid_data_sets = [
            {},  # 空数据
            {"username": "test"},  # 缺少password
            {"password": "test123"},  # 缺少username
        ]
        
        for i, invalid_data in enumerate(invalid_data_sets):
            try:
                response = self.session.post(url, json=invalid_data)
                if response.status_code == 400:
                    self.log_result(f"登录错误请求测试{i+1}", "通过", f"状态码: {response.status_code}")
                else:
                    self.log_result(f"登录错误请求测试{i+1}", "失败", f"期望状态码400，实际: {response.status_code}")
            except Exception as e:
                self.log_result(f"登录错误请求测试{i+1}", "错误", f"请求异常: {str(e)}")
    
    def test_logout_success(self):
        """测试注销成功"""
        url = f"{self.base_url}/logout/"
        
        # 先注册并登录用户
        user_data = self.test_register_success()
        if user_data:
            self.test_login_success(user_data)
        
        logout_data = {
            "username": user_data["username"] if user_data else "testuser"
        }
        
        try:
            response = self.session.post(url, json=logout_data)
            if response.status_code == 204:
                self.log_result("注销成功测试", "通过", f"状态码: {response.status_code}")
            else:
                self.log_result("注销成功测试", "失败", f"期望状态码204，实际: {response.status_code}")
        except Exception as e:
            self.log_result("注销成功测试", "错误", f"请求异常: {str(e)}")
    
    def test_logout_bad_request(self):
        """测试注销时的错误请求"""
        url = f"{self.base_url}/logout/"
        
        try:
            response = self.session.post(url, json={})  # 空数据
            if response.status_code == 400:
                self.log_result("注销错误请求测试", "通过", f"状态码: {response.status_code}")
            else:
                self.log_result("注销错误请求测试", "失败", f"期望状态码400，实际: {response.status_code}")
        except Exception as e:
            self.log_result("注销错误请求测试", "错误", f"请求异常: {str(e)}")
    
    def test_other_urls_404(self):
        """测试其他未定义的URL返回404"""
        test_urls = [
            f"{self.base_url}/others",
            f"{self.base_url}/undefined",
            f"{self.base_url}/random",
            f"{self.base_url}/api/test"
        ]
        
        for i, url in enumerate(test_urls):
            try:
                # 测试不同的HTTP方法
                methods = ['GET', 'POST', 'PUT', 'DELETE']
                for method in methods:
                    response = self.session.request(method, url)
                    if response.status_code == 404:
                        self.log_result(f"404测试{i+1}-{method}", "通过", f"状态码: {response.status_code}")
                    else:
                        self.log_result(f"404测试{i+1}-{method}", "失败", f"期望状态码404，实际: {response.status_code}")
            except Exception as e:
                self.log_result(f"404测试{i+1}", "错误", f"请求异常: {str(e)}")
    
    def run_all_tests(self):
        """运行所有测试"""
        print("=" * 60)
        print("开始API接口测试")
        print("=" * 60)
        
        # 注册接口测试
        print("\n🔸 测试注册接口...")
        user_data = self.test_register_success()
        self.test_register_conflict()
        self.test_register_bad_request()
        
        # 登录接口测试
        print("\n🔸 测试登录接口...")
        self.test_login_success(user_data)
        self.test_login_wrong_credentials()
        self.test_login_bad_request()
        
        # 注销接口测试
        print("\n🔸 测试注销接口...")
        self.test_logout_success()
        self.test_logout_bad_request()
        
        # 404测试
        print("\n🔸 测试未定义URL...")
        self.test_other_urls_404()
        
        # 输出测试总结
        self.print_summary()
    
    def print_summary(self):
        """打印测试总结"""
        print("\n" + "=" * 60)
        print("测试总结")
        print("=" * 60)
        
        passed = len([r for r in self.test_results if r["状态"] == "通过"])
        failed = len([r for r in self.test_results if r["状态"] == "失败"])
        errors = len([r for r in self.test_results if r["状态"] == "错误"])
        skipped = len([r for r in self.test_results if r["状态"] == "跳过"])
        total = len(self.test_results)
        
        print(f"总测试数: {total}")
        print(f"通过: {passed}")
        print(f"失败: {failed}")
        print(f"错误: {errors}")
        print(f"跳过: {skipped}")
        print(f"通过率: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        # 显示失败和错误的测试
        if failed > 0 or errors > 0:
            print("\n失败/错误的测试:")
            for result in self.test_results:
                if result["状态"] in ["失败", "错误"]:
                    print(f"  - {result['测试名称']}: {result['详情']}")

def main():
    """主函数"""
    print("API接口测试脚本")
    print("测试目标: http://47.84.114.53:8000/")
    
    # 创建测试实例
    tester = APITester()
    
    # 运行所有测试
    tester.run_all_tests()
    
    print("\n测试完成!")

if __name__ == "__main__":
    main()

import requests
import socket
import time
from urllib.parse import urlparse

def test_connection():
    """测试服务器连接状态"""
    base_url = "http://47.84.114.53"
    print("=" * 50)
    print("服务器连接诊断")
    print("=" * 50)
    
    # 1. 测试基本网络连通性
    print("\n🔍 1. 测试网络连通性...")
    parsed_url = urlparse(base_url)
    host = parsed_url.hostname
    port = parsed_url.port or 80
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"✅ 网络连接正常 - 可以连接到 {host}:{port}")
        else:
            print(f"❌ 网络连接失败 - 无法连接到 {host}:{port}")
            return
    except Exception as e:
        print(f"❌ 网络测试异常: {e}")
        return
    
    # 2. 测试HTTP响应
    print("\n🔍 2. 测试HTTP响应...")
    try:
        response = requests.get(base_url, timeout=10)
        print(f"✅ HTTP响应状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        if response.text:
            print(f"响应内容预览: {response.text[:200]}...")
    except requests.exceptions.ConnectTimeout:
        print("❌ 连接超时 - 服务器可能没有响应")
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 连接错误: {e}")
    except Exception as e:
        print(f"❌ 请求异常: {e}")
    
    # 3. 测试具体API端点
    print("\n🔍 3. 测试API端点...")
    endpoints = ["/register/", "/login/", "/logout/"]
    
    for endpoint in endpoints:
        url = base_url + endpoint
        try:
            response = requests.get(url, timeout=5)
            print(f"  {endpoint}: 状态码 {response.status_code}")
        except Exception as e:
            print(f"  {endpoint}: 请求失败 - {e}")
    
    # 4. 测试POST请求到注册端点
    print("\n🔍 4. 测试POST请求...")
    try:
        test_data = {"test": "data"}
        response = requests.post(f"{base_url}/register/", json=test_data, timeout=5)
        print(f"POST /register/: 状态码 {response.status_code}")
        if response.text:
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"POST请求失败: {e}")
    
    print("\n" + "=" * 50)
    print("诊断建议:")
    print("=" * 50)
    print("如果看到502错误，可能的解决方案：")
    print("1. 检查后端服务是否正在运行")
    print("2. 检查后端服务监听的端口是否正确")
    print("3. 检查服务器日志查看具体错误信息")
    print("4. 确认API路径配置是否正确")
    print("5. 检查防火墙设置")

if __name__ == "__main__":
    test_connection() 
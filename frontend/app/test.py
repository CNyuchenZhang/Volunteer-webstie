#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API接口测试脚本
测试登录、注册、登出接口是否正常工作
"""

import requests
import json
import hashlib
import time
from typing import Dict, Any
from test_config import get_base_url, get_timeout, list_environments

# API基础URL - 从配置文件获取
BASE_URL = get_base_url()
TIMEOUT = get_timeout()

def hash_password(password: str) -> str:
    """使用SHA256加密密码，与前端保持一致"""
    return hashlib.sha256(password.encode()).hexdigest()

def test_register_api():
    """测试注册接口"""
    print("=" * 50)
    print("测试注册接口")
    print("=" * 50)
    
    # 测试数据
    test_users = [
        {
            "username": "testuser01",
            "character": "volunteer",
            "password": "TestPass123"
        },
        {
            "username": "testnpo01",
            "character": "npo", 
            "password": "TestPass123"
        },
        {
            "username": "testadmin01",
            "character": "admin",
            "password": "TestPass123"
        }
    ]
    
    for user in test_users:
        try:
            # 加密密码
            encrypted_password = hash_password(user["password"])
            
            data = {
                "username": user["username"],
                "character": user["character"],
                "password": encrypted_password
            }
            
            print(f"\n测试注册用户: {user['username']} (角色: {user['character']})")
            print(f"请求数据: {json.dumps(data, indent=2)}")
            
            response = requests.post(
                f"{BASE_URL}/register/",
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=TIMEOUT
            )
            
            print(f"响应状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
            if response.status_code == 201:
                print("✅ 注册成功")
            elif response.status_code == 409:
                print("⚠️  用户名已存在")
            elif response.status_code == 400:
                print("❌ 请求参数错误")
            else:
                print(f"❌ 注册失败，状态码: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 请求异常: {str(e)}")
        except Exception as e:
            print(f"❌ 其他错误: {str(e)}")
        
        time.sleep(1)  # 避免请求过快

def test_login_api():
    """测试登录接口"""
    print("\n" + "=" * 50)
    print("测试登录接口")
    print("=" * 50)
    
    # 测试数据
    test_logins = [
        {
            "username": "testuser01",
            "password": "TestPass123"
        },
        {
            "username": "testnpo01", 
            "password": "TestPass123"
        },
        {
            "username": "testadmin01",
            "password": "TestPass123"
        },
        {
            "username": "wronguser",
            "password": "WrongPass123"
        }
    ]
    
    for login in test_logins:
        try:
            # 加密密码
            encrypted_password = hash_password(login["password"])
            
            data = {
                "username": login["username"],
                "password": encrypted_password
            }
            
            print(f"\n测试登录用户: {login['username']}")
            print(f"请求数据: {json.dumps(data, indent=2)}")
            
            response = requests.post(
                f"{BASE_URL}/login/",
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=TIMEOUT
            )
            
            print(f"响应状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
            # 根据API文档，登录成功状态码是100
            if response.status_code == 100 or response.status_code == 200:
                print("✅ 登录成功")
                return login["username"]  # 返回成功登录的用户名用于测试登出
            elif response.status_code == 401:
                print("❌ 用户名或密码错误")
            elif response.status_code == 400:
                print("❌ 请求参数错误")
            else:
                print(f"❌ 登录失败，状态码: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 请求异常: {str(e)}")
        except Exception as e:
            print(f"❌ 其他错误: {str(e)}")
        
        time.sleep(1)
    
    return None

def test_logout_api(username: str):
    """测试登出接口"""
    print("\n" + "=" * 50)
    print("测试登出接口")
    print("=" * 50)
    
    try:
        data = {
            "username": username
        }
        
        print(f"\n测试登出用户: {username}")
        print(f"请求数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/logout/",
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 204:
            print("✅ 登出成功")
        elif response.status_code == 400:
            print("❌ 请求参数错误")
        else:
            print(f"❌ 登出失败，状态码: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求异常: {str(e)}")
    except Exception as e:
        print(f"❌ 其他错误: {str(e)}")

def test_undefined_endpoints():
    """测试未定义的接口"""
    print("\n" + "=" * 50)
    print("测试未定义的接口")
    print("=" * 50)
    
    undefined_urls = [
        "/undefined",
        "/api/test", 
        "/users",
        "/dashboard"
    ]
    
    for url in undefined_urls:
        try:
            print(f"\n测试未定义接口: {url}")
            
            response = requests.get(
                f"{BASE_URL}{url}",
                timeout=TIMEOUT
            )
            
            print(f"响应状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
            if response.status_code == 404:
                print("✅ 正确返回404 Not Found")
            else:
                print(f"⚠️  期望404，实际返回: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 请求异常: {str(e)}")
        except Exception as e:
            print(f"❌ 其他错误: {str(e)}")
        
        time.sleep(0.5)

def main():
    """主测试函数"""
    print("🚀 开始API接口测试")
    
    # 显示当前环境配置
    print("\n" + "=" * 50)
    print("当前测试环境配置")
    print("=" * 50)
    list_environments()
    print(f"测试服务器: {BASE_URL}")
    print(f"超时时间: {TIMEOUT}秒")
    print("=" * 50)
    
    print("请确保后端服务器已启动")
    
    try:
        # 测试服务器连接
        print("\n正在测试服务器连接...")
        response = requests.get(BASE_URL, timeout=TIMEOUT)
        print(f"✅ 服务器连接正常 (状态码: {response.status_code})")
    except requests.exceptions.Timeout:
        print("❌ 连接超时：服务器响应时间过长")
        print("💡 建议：检查网络连接或增加超时时间")
        return
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 连接错误：{str(e)}")
        print("💡 建议：")
        print("   1. 检查服务器地址是否正确")
        print("   2. 确认后端服务是否已启动")
        print("   3. 检查防火墙设置")
        print("   4. 如果使用代理，检查代理配置")
        return
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP错误：{str(e)}")
        print("💡 建议：检查服务器状态")
        return
    except Exception as e:
        print(f"❌ 未知错误：{str(e)}")
        return
    
    # 执行各项测试
    test_register_api()
    
    # 测试登录并获取成功登录的用户名
    logged_in_user = test_login_api()
    
    # 如果有成功登录的用户，测试登出
    if logged_in_user:
        test_logout_api(logged_in_user)
    
    # 测试未定义的接口
    test_undefined_endpoints()
    
    print("\n" + "=" * 50)
    print("🎉 API接口测试完成")
    print("=" * 50)

if __name__ == "__main__":
    main() 
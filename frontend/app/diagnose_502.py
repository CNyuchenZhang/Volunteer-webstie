#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
502错误诊断脚本
帮助定位和解决502 Bad Gateway错误
"""

import requests
import socket
import sys
from urllib.parse import urlparse
from test_config import API_CONFIGS

def test_dns_resolution(hostname):
    """测试DNS解析"""
    try:
        ip = socket.gethostbyname(hostname)
        print(f"✅ DNS解析成功: {hostname} -> {ip}")
        return True
    except socket.gaierror as e:
        print(f"❌ DNS解析失败: {hostname} - {str(e)}")
        return False

def test_tcp_connection(hostname, port):
    """测试TCP连接"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((hostname, port))
        sock.close()
        
        if result == 0:
            print(f"✅ TCP连接成功: {hostname}:{port}")
            return True
        else:
            print(f"❌ TCP连接失败: {hostname}:{port}")
            return False
    except Exception as e:
        print(f"❌ TCP连接异常: {hostname}:{port} - {str(e)}")
        return False

def test_http_request(url, timeout=10):
    """测试HTTP请求"""
    try:
        print(f"\n测试HTTP请求: {url}")
        
        # 发送HEAD请求（更轻量）
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        print(f"✅ HTTP HEAD请求成功")
        print(f"   状态码: {response.status_code}")
        print(f"   响应头: {dict(response.headers)}")
        
        # 发送GET请求
        response = requests.get(url, timeout=timeout)
        print(f"✅ HTTP GET请求成功")
        print(f"   状态码: {response.status_code}")
        print(f"   响应长度: {len(response.content)} bytes")
        
        return True
        
    except requests.exceptions.Timeout:
        print(f"❌ 请求超时 (>{timeout}秒)")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 连接错误: {str(e)}")
        return False
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP错误: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ 其他错误: {str(e)}")
        return False

def diagnose_url(env_name, config):
    """诊断指定URL"""
    url = config["url"]
    timeout = config["timeout"]
    description = config["description"]
    
    print(f"\n{'='*60}")
    print(f"诊断环境: {env_name} ({description})")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    # 解析URL
    parsed = urlparse(url)
    hostname = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == 'https' else 80)
    
    print(f"主机名: {hostname}")
    print(f"端口: {port}")
    print(f"协议: {parsed.scheme}")
    
    # 步骤1: DNS解析
    print(f"\n1. 测试DNS解析")
    dns_ok = test_dns_resolution(hostname)
    
    # 步骤2: TCP连接
    print(f"\n2. 测试TCP连接")
    tcp_ok = test_tcp_connection(hostname, port) if dns_ok else False
    
    # 步骤3: HTTP请求
    print(f"\n3. 测试HTTP请求")
    http_ok = test_http_request(url, timeout) if tcp_ok else False
    
    # 总结
    print(f"\n{'='*30}")
    print(f"诊断结果:")
    print(f"  DNS解析: {'✅ 正常' if dns_ok else '❌ 失败'}")
    print(f"  TCP连接: {'✅ 正常' if tcp_ok else '❌ 失败'}")
    print(f"  HTTP请求: {'✅ 正常' if http_ok else '❌ 失败'}")
    
    if not dns_ok:
        print(f"\n💡 DNS解析失败的可能原因：")
        print(f"   - 域名不存在或已过期")
        print(f"   - DNS服务器配置问题")
        print(f"   - 网络连接问题")
    elif not tcp_ok:
        print(f"\n💡 TCP连接失败的可能原因：")
        print(f"   - 服务器未启动")
        print(f"   - 端口被防火墙阻止")
        print(f"   - 网络路由问题")
    elif not http_ok:
        print(f"\n💡 HTTP请求失败的可能原因：")
        print(f"   - 服务器内部错误(502)")
        print(f"   - 代理服务器配置错误")
        print(f"   - 上游服务不可用")
        print(f"   - SSL证书问题")
    
    return dns_ok and tcp_ok and http_ok

def main():
    """主诊断函数"""
    print("🔍 502错误诊断工具")
    print("此工具将帮助诊断API服务器的连接问题")
    
    # 检查所有配置的环境
    for env_name, config in API_CONFIGS.items():
        success = diagnose_url(env_name, config)
        if success:
            print(f"\n🎉 {env_name} 环境测试通过！")
        else:
            print(f"\n❌ {env_name} 环境存在问题")
    
    print(f"\n{'='*60}")
    print("诊断完成")
    print("💡 如果所有测试都失败，建议：")
    print("   1. 检查网络连接")
    print("   2. 确认服务器地址正确")
    print("   3. 联系后端开发人员")
    print("   4. 查看服务器日志")

if __name__ == "__main__":
    main() 
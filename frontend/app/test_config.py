#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API测试配置文件
包含不同环境的服务器地址配置
"""

# 不同环境的API地址配置
API_CONFIGS = {
    "apidog": {
        "url": "https://app.apidog.com/project/1067214",
        "description": "ApiDog测试环境",
        "timeout": 15
    },
    "local": {
        "url": "http://localhost:8000",
        "description": "本地开发环境", 
        "timeout": 10
    },
    "remote": {
        "url": "http://47.84.114.53",
        "description": "远程服务器",
        "timeout": 10
    }
}

# 当前使用的环境 - 可以修改这里来切换环境
CURRENT_ENV = "apidog"  # 可选: "apidog", "local", "remote"

def get_config():
    """获取当前环境的配置"""
    return API_CONFIGS[CURRENT_ENV]

def get_base_url():
    """获取当前环境的基础URL"""
    return API_CONFIGS[CURRENT_ENV]["url"]

def get_timeout():
    """获取当前环境的超时时间"""
    return API_CONFIGS[CURRENT_ENV]["timeout"]

def list_environments():
    """列出所有可用的环境"""
    print("可用的测试环境：")
    for env, config in API_CONFIGS.items():
        current = " (当前)" if env == CURRENT_ENV else ""
        print(f"  {env}: {config['description']} - {config['url']}{current}") 
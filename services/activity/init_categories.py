"""
初始化活动分类数据
运行方式: python init_categories.py
"""
import os
import django
import sys

# 设置Django环境
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'activity_service.settings')
django.setup()

from activities.models import ActivityCategory

def create_categories():
    """创建活动分类"""
    categories = [
        {
            'name': '环境保护',
            'description': '环保、清洁、绿化等活动',
            'icon': '🌱',
            'color': '#52c41a'
        },
        {
            'name': '教育支持',
            'description': '支教、辅导、培训等活动',
            'icon': '📚',
            'color': '#1890ff'
        },
        {
            'name': '社区服务',
            'description': '社区活动、邻里互助等',
            'icon': '🏘️',
            'color': '#722ed1'
        },
        {
            'name': '医疗健康',
            'description': '义诊、健康宣传、医疗援助等',
            'icon': '🏥',
            'color': '#eb2f96'
        },
        {
            'name': '动物保护',
            'description': '流浪动物救助、动物保护宣传等',
            'icon': '🐾',
            'color': '#fa8c16'
        },
        {
            'name': '老年关怀',
            'description': '陪伴老人、助老服务等',
            'icon': '👴',
            'color': '#faad14'
        },
        {
            'name': '儿童关怀',
            'description': '关爱儿童、陪伴成长等',
            'icon': '👶',
            'color': '#13c2c2'
        },
        {
            'name': '文化艺术',
            'description': '文化活动、艺术表演、文物保护等',
            'icon': '🎨',
            'color': '#2f54eb'
        },
        {
            'name': '体育运动',
            'description': '体育活动、健身指导等',
            'icon': '⚽',
            'color': '#fa541c'
        },
        {
            'name': '应急救援',
            'description': '灾害救援、应急响应等',
            'icon': '🚨',
            'color': '#f5222d'
        },
    ]
    
    created_count = 0
    existing_count = 0
    
    for cat_data in categories:
        category, created = ActivityCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'icon': cat_data['icon'],
                'color': cat_data['color'],
                'is_active': True
            }
        )
        if created:
            print(f"✓ 创建分类: {category.name} {cat_data['icon']}")
            created_count += 1
        else:
            print(f"- 分类已存在: {category.name}")
            existing_count += 1
    
    print(f"\n总计: 创建 {created_count} 个分类, {existing_count} 个已存在")
    return created_count

def list_categories():
    """列出所有分类"""
    categories = ActivityCategory.objects.filter(is_active=True)
    print("\n当前活动分类列表:")
    print("=" * 60)
    for cat in categories:
        print(f"ID: {cat.id:2d} | {cat.icon} {cat.name:12s} | {cat.description}")
    print("=" * 60)

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("初始化活动分类数据")
    print("=" * 60 + "\n")
    
    # 创建分类
    create_categories()
    
    # 列出所有分类
    list_categories()
    
    print("\n✅ 完成！\n")
    print("前端可以通过以下接口获取分类列表:")
    print("GET http://localhost:8002/api/v1/categories/")
    print()


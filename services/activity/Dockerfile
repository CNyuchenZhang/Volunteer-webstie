FROM python:3.11.5

# 创建非 root 用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt

# 更改文件所有者
RUN chown -R appuser:appuser /app

# 切换到非 root 用户
USER appuser

EXPOSE 8000

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health/')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "activity_service.wsgi:application"]

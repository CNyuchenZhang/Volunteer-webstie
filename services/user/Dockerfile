FROM python:3.11.5
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple --trusted-host mirrors.tuna.tsinghua.edu.cn
EXPOSE 8001
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "user_service.wsgi:application"]
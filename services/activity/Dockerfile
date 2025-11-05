# FROM python:3.11.5
# WORKDIR /app
# COPY . .
# RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple --trusted-host mirrors.tuna.tsinghua.edu.cn
# EXPOSE 8000
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "activity_service.wsgi:application"]
FROM python:3.11-slim


RUN addgroup --system app && adduser --system --ingroup app app
WORKDIR /app


COPY --chown=app:app requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY --chown=app:app . .


HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import socket; s=socket.socket(); s.settimeout(3); s.connect(('127.0.0.1',8000))" || exit 1


USER app
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "activity_service.wsgi:application"]
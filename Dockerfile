FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 80

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:80", "--worker-class", "gthread", "--workers", "1", "--threads", "8"]

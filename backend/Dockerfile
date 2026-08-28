# Use an official Python runtime as a parent image
FROM python:3.11-slim

WORKDIR /app

# We will copy requirements and install dependencies later
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


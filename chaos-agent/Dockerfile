# Use a lightweight Python image
FROM python:3.11-slim

WORKDIR /app

# Install system tools (curl is useful for manual debugging)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Python libraries
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the agent scripts
COPY . .

# Keep the container alive so we can run commands inside it
CMD ["tail", "-f", "/dev/null"]
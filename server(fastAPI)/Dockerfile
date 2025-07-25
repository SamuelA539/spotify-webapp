FROM python:3.12.11-alpine
WORKDIR /usr/local/server

#test first
RUN python -m venv .env 

COPY requirements.txt ./
RUN pip install --no-cache -r requirements.txt



COPY main.py ./

#add usr ?

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
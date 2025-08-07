FROM python:alpine
WORKDIR /usr/local/server

#test first
RUN python -m venv .env 

COPY requirements.txt ./
RUN pip install --no-cache -r requirements.txt



COPY app .

#add usr ?

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
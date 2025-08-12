# FROM python:alpine
# WORKDIR /usr/local/server

# #test first
# RUN python -m venv .env 

# COPY requirements.txt ./
# RUN pip install --no-cache -r requirements.txt


#!!! Copy Dir issue - failed to build: failed to solve: invalid file request docker
# COPY app .

# #add usr ?

# EXPOSE 5000

# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]

FROM python:bookworm
WORKDIR /usr/local/server

#test first
RUN python -m venv .env 

COPY requirements.txt ./
RUN pip install --no-cache -r requirements.txt



COPY main.py ./

#add usr ?

EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
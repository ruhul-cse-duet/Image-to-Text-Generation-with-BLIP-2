# 🖼️ Image-to-Text Generation with BLIP-2

This project is a **Flask-based web application** that generates natural language descriptions (captions) from images using **BLIP-2 (Bootstrapped Language Image Pretraining)** by Salesforce.

Users can upload an image through a simple web interface, and the model produces a meaningful textual description in a **zero-shot** manner (no fine-tuning required).

---

## 🚀 Features

- Image captioning using **BLIP-2**
- Zero-shot image-to-text generation
- Flask web UI
- Supports CPU and CUDA (GPU)
- Modular and clean project structure
- Docker support for easy deployment

---

## 🧠 Model Information

- **Model:** `Salesforce/blip2-opt-2.7b`
- **Task:** Vision → Language (Image Captioning)
- **Framework:** Hugging Face Transformers + PyTorch

---

## 📁 Project Structure

IMAGE-TO-TEXT-GENERATION-WITH-BLIP-2/
│
├── blip2_model\
│ ├── init.py\
│ └── loader.py\
│
├── codes\
│ └── zero-shot-image-to-text-generation-with-blip-2.ipynb\
│
├── routes\
│ └── main.py\
│
├──static\
│ └── css\
│ └── style.css\
│
├──templates\
│ ├── init.p\
│ └──-- index.html\
│
├── uploads\
│
├── app.py\
├── run.py\
├── Dockerfile\
├── requirements.txt\
└── README.md


---

## ⚙️ Installation

### Clone the Repository
```bash
https://github.com/ruhul-cse-duet/Image-to-Text-Generation-with-BLIP-2.git
cd image-to-text-blip2

```
### (Optional) Create Virtual Environment
```
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
```
### Install Dependencies
```commandline
pip install -r requirements.txt
```
### Run the Application
```commandline
  python run.py
```
Then open your browser:
http://127.0.0.1:5000

## How It Works

- User uploads an image via the web interface

- Image is processed by the BLIP-2 processor

- BLIP-2 model generates a caption

- Caption is displayed on the UI

## 📌 Use Cases

- Image captioning

- Multimodal AI applications

- Assistive technology

- AI content analysis

- Computer vision research

## 👤 Author
[Md Ruhul Amin](https://www.linkedin.com/in/ruhul-duet-cse/); \
Email: ruhul.cse.duet@gmail.com

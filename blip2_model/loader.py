import torch
from transformers import Blip2Processor, Blip2ForConditionalGeneration

device = "cuda" if torch.cuda.is_available() else "cpu"

# Use BF16 on newer GPUs, else FP16, else FP32 on CPU
if device == "cuda":
    dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
else:
    dtype = torch.float32  # CPU only

# Load processor once
processor = Blip2Processor.from_pretrained(
    "Salesforce/blip2-opt-2.7b"
)

# Load model once (IMPORTANT)
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b",
    dtype=dtype           # correct argument
)
model.to(device)
model.eval()

print(f"BLIP2 loaded on {device} with dtype {dtype}")

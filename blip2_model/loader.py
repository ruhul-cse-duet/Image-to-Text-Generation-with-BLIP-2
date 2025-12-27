import os
import logging
import torch
from transformers import AutoProcessor, AutoModelForCausalLM, AutoModelForSeq2SeqLM

logger = logging.getLogger(__name__)

# Device configuration
device = "cuda" if torch.cuda.is_available() else "cpu"

# Use BF16 on newer GPUs, else FP16, else FP32 on CPU
if device == "cuda":
    dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
else:
    dtype = torch.float32

logger.info(f"Device: {device}")
logger.info(f"Data type: {dtype}")

# Initialize variables
processor = None
model = None
model_loaded = False

def load_model():
    """Load T5Gemma model with error handling"""
    global processor, model, model_loaded
    
    try:
        model_name = "google/t5gemma-2-1b-1b"
        
        logger.info(f"Loading {model_name} processor...")
        processor = AutoProcessor.from_pretrained(model_name)
        
        logger.info(f"Loading {model_name} model...")
        model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name,
            dtype=dtype,
            device_map="auto" if device == "cuda" else None,
            trust_remote_code=True
        )
        
        if device != "cuda":
            model.to(device)
        
        model.eval()
        
        model_loaded = True
        logger.info(f"T5Gemma model loaded successfully on {device} with dtype {dtype}")
        return True
        
    except Exception as e:
        logger.error(f"Error loading T5Gemma model: {str(e)}")
        logger.exception("Full traceback:")
        model_loaded = False
        return False

# Load model on import
load_model()

if not model_loaded:
    logger.warning("T5Gemma model failed to load. Application will run with limited functionality.")

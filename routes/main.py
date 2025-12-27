import os
import logging
from flask import Blueprint, request, jsonify, render_template
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename
from huggingface_model.loader import model, processor, device, dtype, model_loaded

logger = logging.getLogger(__name__)

main_bp = Blueprint(
    "main",
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@main_bp.route("/", methods=["GET"])
def home():
    """Render home page"""
    return render_template("index.html")


@main_bp.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model_loaded,
        "device": device,
        "dtype": str(dtype),
        "model": "google/t5gemma-2-1b-1b"
    })



# ===========================
#   IMAGE + PROMPT → TEXT
# ===========================
@main_bp.route("/api/infer_image", methods=["POST"])
def infer_image():
    """Generate text from image with prompt"""
    try:
        # Check if model is loaded
        if not model_loaded or model is None or processor is None:
            logger.error("Model not loaded")
            return jsonify({"error": "Model not available. Please try again later."}), 503
        
        # Validate file upload
        if "file" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files["file"]
        
        if image_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(image_file.filename):
            return jsonify({"error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

        # Validate prompt
        prompt = request.form.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        if len(prompt) > 500:
            return jsonify({"error": "Prompt too long. Maximum 500 characters."}), 400

        # Process image
        try:
            image = Image.open(image_file.stream).convert("RGB")
            
            # Validate image dimensions
            if image.size[0] > 4096 or image.size[1] > 4096:
                return jsonify({"error": "Image dimensions too large. Maximum 4096x4096."}), 400
                
        except UnidentifiedImageError:
            return jsonify({"error": "Invalid or corrupted image file"}), 400
        except Exception as img_error:
            logger.error(f"Image processing error: {str(img_error)}")
            return jsonify({"error": "Failed to process image"}), 400

        # Generate text with T5Gemma
        try:
            # T5Gemma requires <start_of_image> token in prompt
            # Format: "<start_of_image> your prompt text"
            formatted_prompt = f"<start_of_image> {prompt}"
            
            # Prepare input for T5Gemma
            inputs = processor(
                text=formatted_prompt,
                images=image,
                return_tensors="pt"
            ).to(device)

            # Generate answer
            output_ids = model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=False
            )
            
            # Decode the full output
            full_output = processor.decode(
                output_ids[0],
                skip_special_tokens=True
            ).strip()
            
            # Remove the prompt from output to get only generated text
            # T5Gemma typically returns: "<start_of_image> prompt generated_text"
            generated_text = full_output
            if formatted_prompt in generated_text:
                generated_text = generated_text.replace(formatted_prompt, "").strip()
            
            # Additional cleanup
            generated_text = generated_text.replace("<start_of_image>", "").strip()

            if not generated_text:
                generated_text = "Unable to generate description for this image."

            logger.info(f"Successfully generated text for prompt: {prompt[:50]}...")
            
            return jsonify({
                "generated": generated_text,
                "prompt": prompt
            }), 200

        except Exception as gen_error:
            logger.error(f"Generation error: {str(gen_error)}")
            logger.exception("Full traceback:")
            return jsonify({"error": "Failed to generate text. Please try again."}), 500

    except Exception as e:
        logger.error(f"Unexpected error in infer_image: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({"error": "An unexpected error occurred"}), 500



# ===========================
#   TEXT GENERATION (OPTIONAL)
# ===========================
@main_bp.route("/api/generate_text", methods=["POST"])
def generate_text():
    """Generate text from prompt only (without image)"""
    try:
        # Check if model is loaded
        if not model_loaded or model is None or processor is None:
            logger.error("Model not loaded")
            return jsonify({"error": "Model not available. Please try again later."}), 503
        
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        prompt = data.get("prompt", "").strip()
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        if len(prompt) > 500:
            return jsonify({"error": "Prompt too long. Maximum 500 characters."}), 400

        try:
            # For text-only generation, create a dummy white image
            import numpy as np
            
            dummy_image = Image.fromarray(
                np.ones((224, 224, 3), dtype=np.uint8) * 255
            )
            
            # T5Gemma format with image token
            formatted_prompt = f"<start_of_image> {prompt}"
            
            inputs = processor(
                text=formatted_prompt,
                images=dummy_image,
                return_tensors="pt"
            ).to(device)

            output_ids = model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=False
            )
            
            # Decode output
            full_output = processor.decode(
                output_ids[0],
                skip_special_tokens=True
            ).strip()
            
            # Clean up output
            generated_text = full_output
            if formatted_prompt in generated_text:
                generated_text = generated_text.replace(formatted_prompt, "").strip()
            generated_text = generated_text.replace("<start_of_image>", "").strip()

            if not generated_text:
                generated_text = "Unable to generate text for this prompt."

            logger.info(f"Successfully generated text for prompt: {prompt[:50]}...")
            
            return jsonify({
                "generated": generated_text,
                "prompt": prompt
            }), 200

        except Exception as gen_error:
            logger.error(f"Text generation error: {str(gen_error)}")
            logger.exception("Full traceback:")
            return jsonify({"error": "Failed to generate text. Please try again."}), 500

    except Exception as e:
        logger.error(f"Unexpected error in generate_text: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({"error": "An unexpected error occurred"}), 500

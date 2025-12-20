from flask import Blueprint, request, jsonify, render_template
from PIL import Image
from blip2_model.loader import model, processor, device, dtype

main_bp = Blueprint(
    "main",
    __name__,
    template_folder="../templates",
    static_folder="../static"
)


@main_bp.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# ===========================
#   IMAGE + PROMPT → TEXT
# ===========================
@main_bp.route("/api/infer_image", methods=["POST"])
def infer_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image_file = request.files["file"]
        prompt = request.form.get("prompt", "").strip()

        if not prompt:
            return jsonify({"error": "Prompt required"}), 400

        image = Image.open(image_file.stream).convert("RGB")

        # Prepare input for BLIP-2
        inputs = processor(
            image,
            prompt,
            return_tensors="pt"
        ).to(device, dtype=dtype)

        # Generate answer
        output_ids = model.generate(**inputs, max_new_tokens=200)
        generated_text = processor.batch_decode(
            output_ids,
            skip_special_tokens=True
        )[0].strip()

        return jsonify({
            "generated": generated_text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

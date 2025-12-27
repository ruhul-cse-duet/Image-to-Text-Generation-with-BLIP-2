# 🚀 T5Gemma Complete Setup Guide (বাংলায়)

## ✅ কি পরিবর্তন হয়েছে

আপনার project এ এখন **Google T5Gemma-2-1B** model setup করা হয়েছে যা Kaggle এ আপনি ব্যবহার করেছিলেন।

### 🎯 T5Gemma এর বিশেষত্ব:

1. **দ্রুততর**: 1B parameters (BLIP-2 এর 2.7B থেকে ছোট)
2. **কম Memory**: মাত্র 2GB VRAM লাগে
3. **Kaggle Compatible**: Kaggle এ যেভাবে কাজ করছিল সেভাবেই
4. **সঠিক Format**: `<start_of_image>` token সহ

---

## 📝 পরিবর্তিত ফাইলসমূহ

### 1. `huggingface_model/loader.py` ✅
```python
# Model changed to T5Gemma
model_name = "google/t5gemma-2-1b-1b"

# AutoModelForCausalLM ব্যবহার
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    trust_remote_code=True  # Important!
)
```

### 2. `routes/main.py` ✅
```python
# Prompt format: "<start_of_image> your text"
formatted_prompt = f"<start_of_image> {prompt}"

# Processing
inputs = processor(
    text=formatted_prompt,
    images=image,
    return_tensors="pt"
)
```

### 3. `test_model.py` ✅
- T5Gemma specific testing
- Correct prompt format verification

### 4. `README.md` ✅
- Complete T5Gemma documentation
- Performance benchmarks
- Best practices

---

## 🔧 Installation Steps

### ধাপ ১: Environment Activate করুন

```bash
# Anaconda environment activate করুন
C:\Users\Administrator\anaconda3\envs\Image-to-text_generation_with_BLIP-2\Scripts\activate
```

### ধাপ ২: Dependencies Check করুন

```bash
# Check Python version
python --version  # Should be 3.8+

# Check installed packages
pip list | findstr transformers
pip list | findstr torch
```

### ধাপ ৩: যদি দরকার হয় তাহলে Update করুন

```bash
# Update transformers
pip install --upgrade transformers

# Update torch (if needed)
pip install --upgrade torch torchvision

# Install accelerate
pip install --upgrade accelerate
```

### ধাপ ৪: Model Test করুন

```bash
# Model load হচ্ছে কিনা test করুন
python test_model.py
```

**প্রথমবার run করলে:**
- Model download শুরু হবে (~3.5GB)
- 5-15 মিনিট সময় লাগবে
- Cache location: `C:\Users\Administrator\.cache\huggingface\`

### ধাপ ৫: Application Run করুন

```bash
python app.py
```

Browser এ: `http://127.0.0.1:5000`

---

## 🎯 T5Gemma ব্যবহারের নিয়ম

### ✅ সঠিক Prompt Format:

T5Gemma একটি text completion model। এটি incomplete sentences complete করে।

**Good Prompts:**
```
"in this image, there is"
"describe this image:"
"the main object is"
"this picture shows"
"what I see here is"
```

**Bad Prompts:**
```
"describe"  # Too short
"tell me everything about this image in detail"  # Too long
```

### 📋 Kaggle এর মতো ব্যবহার:

Kaggle এ আপনি এভাবে করেছিলেন:
```python
generator(
    "image_url",
    text="<start_of_image> in this image, there is",
    generate_kwargs={"do_sample": False, "max_new_tokens": 50}
)
```

আপনার application এ:
1. Image upload করুন
2. Prompt লিখুন: "in this image, there is"
3. Application automatically `<start_of_image>` token add করবে
4. Generate click করুন

---

## 🔍 Error Fix করা হয়েছে

### ❌ আগের Error:
```
ValueError: Prompt contained 0 image tokens but received 1 images
```

### ✅ কেন হয়েছিল:
- PaliGemma `<image>` token চাইছিল
- T5Gemma `<start_of_image>` token চায়
- আমরা token দিচ্ছিলাম না

### ✅ Solution:
```python
# এখন automatically add হয়
formatted_prompt = f"<start_of_image> {prompt}"
```

---

## 📊 T5Gemma এর সুবিধা

| Feature | Value |
|---------|-------|
| **Model Size** | ~3.5GB (ছোট!) |
| **Parameters** | 1B (fast!) |
| **Speed** | 1-3 seconds (GPU) |
| **Memory** | 2GB VRAM |
| **Accuracy** | Good for quick tasks |
| **Cost** | Free (Hugging Face) |

### অন্যান্য Models এর সাথে তুলনা:

```
T5Gemma-1B:    ⚡⚡⚡ (দ্রুততম)
BLIP-2:        ⚡⚡   (মাঝারি)
PaliGemma-3B:  ⚡     (ধীর কিন্তু accurate)
```

---

## 💡 Usage Examples

### Example 1: Simple Description
```
Image: একটি cat এর ছবি
Prompt: "in this image, there is"
Output: "a cat sitting on a table"
```

### Example 2: Detailed Scene
```
Image: একটি park এর ছবি
Prompt: "describe this scene:"
Output: "a beautiful park with trees, benches, and people walking"
```

### Example 3: Object Detection
```
Image: একটি room এর ছবি
Prompt: "what objects are visible?"
Output: "a sofa, table, lamp, and window"
```

---

## 🛠️ Troubleshooting

### সমস্যা ১: Model Load হচ্ছে না

```bash
# Cache clear করুন
rmdir /s %USERPROFILE%\.cache\huggingface

# Dependencies reinstall করুন
pip install --upgrade transformers accelerate torch

# আবার test করুন
python test_model.py
```

### সমস্যা ২: "trust_remote_code" Error

```bash
# transformers update করুন
pip install transformers>=4.57.2
```

### সমস্যা ৩: CUDA Error

```bash
# CPU mode use করুন
# loader.py তে change করুন:
device = "cpu"
```

### সমস্যা ৪: Slow Performance

**Solutions:**
1. GPU use করুন (if available)
2. Image size কমান (max 1024x1024)
3. `max_new_tokens=100` set করুন (routes/main.py তে)

---

## 🎓 Advanced Configuration

### Generation Parameters Tuning

`routes/main.py` তে customize করুন:

```python
output_ids = model.generate(
    **inputs,
    max_new_tokens=200,      # আরো লম্বা output
    do_sample=True,          # creative output
    temperature=0.7,         # randomness
    top_p=0.9,              # diversity
    repetition_penalty=1.2   # avoid repetition
)
```

### Memory Optimization

`loader.py` তে:

```python
# Use 8-bit quantization
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,  # Half memory!
    device_map="auto"
)
```

---

## ✅ Final Checklist

- [ ] Environment activated: `conda activate Image-to-text_generation_with_BLIP-2`
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Model test successful: `python test_model.py`
- [ ] Application running: `python app.py`
- [ ] Browser accessible: `http://127.0.0.1:5000`
- [ ] Image upload works
- [ ] Text generation works
- [ ] Results look good

---

## 🚀 Quick Start Commands

```bash
# 1. Activate environment
C:\Users\Administrator\anaconda3\envs\Image-to-text_generation_with_BLIP-2\Scripts\activate

# 2. Test model
python test_model.py

# 3. Run app
python app.py

# 4. Open browser
start http://127.0.0.1:5000
```

অথবা সহজভাবে double-click: `start.bat`

---

## 🎉 Success!

যদি সব ঠিকঠাক কাজ করে, তাহলে আপনার T5Gemma application ready! 🎊

**Next Steps:**
1. ✅ Different images test করুন
2. ✅ Different prompts try করুন
3. ✅ Performance check করুন
4. 🎨 UI customize করুন (optional)
5. 🚀 Deploy করুন (optional)

---

## 📞 সাহায্য দরকার?

যদি কোনো সমস্যা হয়:
1. Complete error message copy করুন
2. `python test_model.py` output share করুন
3. System info দিন (GPU/CPU, RAM, OS)
4. জানান, আমি সাহায্য করব! 🤝

---

**লিখেছেন**: AI Assistant  
**তারিখ**: December 27, 2025  
**Version**: 4.0.0 (T5Gemma Migration)  
**Model**: google/t5gemma-2-1b-1b

**Happy Coding! 🚀✨**

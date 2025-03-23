from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk import CFG

app = Flask(__name__)
CORS(app)

# **1️⃣ Expanded Grammar Rules**
src_grammar = CFG.fromstring("""
    S -> NP VP
    NP -> PRP | JJ NN | DT NN | NN NN
    VP -> VB NP | VB ADV NP
    PRP -> 'I' | 'you' | 'he' | 'she' | 'we' | 'they'
    VB -> 'love' | 'hate' | 'like' | 'eat' | 'see' | 'play' | 'drink' | 'run' | 'study'
    JJ -> 'good' | 'bad' | 'beautiful' | 'ugly' | 'happy' | 'sad' | 'fast' | 'slow'
    NN -> 'dogs' | 'cats' | 'food' | 'movie' | 'game' | 'teacher' | 'student' | 'water' | 'school' | 'music'
    DT -> 'the' | 'a' | 'an'
    ADV -> 'quickly' | 'slowly' | 'carefully' | 'happily'
""")


# **2️⃣ Grammar Transformations**
grammar_transformations = {
    "JJ NN": "NN JJ",  # Adjective-Noun switch
    "DT NN": "NN DT",  # Determiner repositioning
    "VB ADV NP": "VB NP ADV"  # Adverb positioning change
}


# **3️⃣ Expanded Dictionaries**
dictionaries = {
    "en_ta": {
        "i": "நான்", "you": "நீ", "he": "அவன்", "she": "அவள்", "we": "நாம்", "they": "அவர்கள்",
        "love": "காதலிக்க", "hate": "வெறுக்க", "like": "பிடிக்க", "eat": "சாப்பிட","eats": "சாப்பிட", "see": "பார்க்க",
        "drink": "குடிக்க", "run": "ஓட", "study": "படிக்க", "play": "விளையாட",
        "good": "நல்ல", "bad": "கெட்ட", "beautiful": "அழகான", "ugly": "அருவருப்பான",
        "fast": "வேகமான", "slow": "மெதுவான", "happy": "மகிழ்ச்சியான", "sad": "சோகமான",
        "dogs": "நாய்கள்", "cats": "பூனைகள்", "food": "உணவு", "movie": "திரைப்படம்",
        "game": "விளையாட்டு", "teacher": "ஆசிரியர்", "student": "மாணவன்",
        "school": "பள்ளி", "music": "இசை", "water": "நீர்",
        "the": "அந்த", "a": "ஒரு", "an": "ஒரு",
        "quickly": "வேகமாக", "slowly": "மெதுவாக", "carefully": "கவனமாக", "happily": "மகிழ்ச்சியாக"
    },
    "en_hi": {
        "i": "मैं", "you": "तुम", "he": "वह", "she": "वह", "we": "हम", "they": "वे",
        "love": "प्यार", "hate": "नफरत", "like": "पसंद", "eat": "खाना", "see": "देखना",
        "drink": "पीना", "run": "दौड़ना", "study": "पढ़ना", "play": "खेलना",
        "good": "अच्छा", "bad": "बुरा", "beautiful": "सुंदर", "ugly": "भद्दा",
        "fast": "तेज़", "slow": "धीमा", "happy": "खुश", "sad": "दुखी",
        "dogs": "कुत्ते", "cats": "बिल्लियाँ", "food": "भोजन", "movie": "फिल्म",
        "game": "खेल", "teacher": "शिक्षक", "student": "छात्र",
        "school": "विद्यालय", "music": "संगीत", "water": "पानी",
        "the": "वह", "a": "एक", "an": "एक",
        "quickly": "तेज़ी से", "slowly": "धीरे", "carefully": "सावधानी से", "happily": "खुशी से"
    }
}

# **4️⃣ Apply Grammar Transformations**
def apply_grammar_transform(tokens):
    transformed = []
    for i in range(len(tokens) - 1):
        phrase = f"{tokens[i]} {tokens[i+1]}"
        if phrase in grammar_transformations:
            transformed.append(tokens[i+1])  # Swap
            transformed.append(tokens[i])
        else:
            transformed.append(tokens[i])
    if tokens[-1] not in transformed:
        transformed.append(tokens[-1])
    return transformed

# **5️⃣ Translate Sentence**
def translate_sentence(sentence, lang_pair):
    words = sentence.lower().split()  # Convert to lowercase
    transformed = apply_grammar_transform(words)
    
    translated = []
    for word in transformed:
        translated_word = dictionaries[lang_pair].get(word, word)  # Keep unknown words
        if word.istitle():  # Preserve capitalization for proper nouns
            translated_word = translated_word.capitalize()
        translated.append(translated_word)

    return " ".join(translated)

# **6️⃣ API Endpoint**
@app.route("/translate", methods=["POST"])
def translate():
    data = request.json
    sentence = data.get("sentence", "")
    lang_pair = data.get("lang_pair", "en_ta")  # Default to English → Tamil

    if not sentence:
        return jsonify({"error": "No sentence provided"}), 400
    
    translated_text = translate_sentence(sentence, lang_pair)
    return jsonify({"translated_text": translated_text})

# **7️⃣ Run Flask App**
if __name__ == "__main__":
    app.run(debug=True)

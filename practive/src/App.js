import { useState } from "react";

function App() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("en_ta");

  const handleTranslate = async () => {
    try {
      const response = await fetch("https://luffyhelixul.pythonanywhere.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: inputText, lang_pair: targetLang }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const data = await response.json();
      setTranslatedText(data.translated_text);
    } catch (error) {
      console.error("Error:", error);
      setTranslatedText("Translation error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-800 to-black text-white p-6">
      {/* Title */}
      <h1 className="text-3xl absolute top-10 font-poppins font-bold text-white 
               text-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 
               rounded-lg shadow-xl drop-shadow-lg border-2 border-blue-400 
               animate-subtle">
      Rule-Based Machine Translation
    </h1>

      {/* Select Box */}
      <select
        className="border-2 border-blue-500 font-poppins bg-gray-800 p-3 w-[230px] rounded-lg text-white cursor-pointer shadow-lg focus:ring-2 focus:ring-blue-400 text-xl mb-10"
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
      >
        <option value="en_ta">🇮🇳 English → Tamil</option>
        <option value="en_hi">🇮🇳 English → Hindi</option>
      </select>

      {/* Main Content Layout */}
      <div className="flex w-full max-w-4xl mt-6 space-x-6">
        {/* Input Box */}
        <textarea
          className="border-2 border-gray-700 bg-gray-900 p-4 w-1/2 h-32 rounded-lg text-white shadow-xl focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-2xl font-poppins "
          placeholder="Enter text in English..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Translated Output */}
        <div
          className={`border-2 font-poppins  border-blue-500 p-4 w-1/2 min-h-32 rounded-lg bg-gray-900 text-xl font-bold text-green-400 shadow-xl transition-all duration-500 transform ${
            translatedText ? "translate-x-2 scale-105" : "opacity-50"
          }`}
        >
          {translatedText || "Translation will appear here..."}
        </div>
      </div>

      {/* Translate Button */}
      <button
      className="mt-16 text-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:from-blue-600 font-poppins  hover:to-blue-800 transform hover:scale-110 transition-all duration-300"
      onClick={handleTranslate}
    >
      Translate 🔄
    </button>
    </div>
  );
}

export default App;

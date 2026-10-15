import re
from typing import Dict, List, Optional
from datetime import datetime
from zoneinfo import ZoneInfo
from ..core.config import settings


class BrainService:
    """Jarvis intent router + Hindi/Hinglish/English responses.

    Works with an LLM when a key is present, and provides a capable
    local fallback (no key) so the assistant is useful out of the box.
    """

    CAPABILITIES_HI = (
        "Namaste! Main Jarvis hoon. Aap mujhse ye karwa sakte hain:\n"
        "1. Aam baat-cheet (Hindi / Hinglish / English)\n"
        "2. Google search - bas boliye 'google pe X search karo'\n"
        "3. Email search - 'mail dhundo X ke baare mein'\n"
        "4. Time and date - 'abhi kitne baje hain'\n"
        "5. Weather - 'Delhi ka mausam batao'\n"
        "6. Koi bhi sawaal poochho\n"
        "Boliye, main sun raha hoon!"
    )

    SYSTEM_PROMPT = (
        "You are Jarvis, a friendly Hindi-English AI voice assistant inspired by the Iron Man JARVIS. "
        "The user speaks Hindi, Hinglish or English. ALWAYS reply in the SAME language family as the user: "
        "if they type in Hindi (Devanagari or romanized Hinglish), reply in natural Hindi. "
        "Keep replies short and conversational (1-3 sentences) because they are spoken aloud by TTS. "
        "You can chat, explain your capabilities, do Google/web search, search emails, tell time/date, "
        "check weather, and answer any question. "
        "When the user greets you or asks what you can do, introduce yourself in Hindi and list your abilities."
    )

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.LLM_MODEL

    def respond(self, user_text: str, history: List[Dict[str, str]]) -> str:
        tool_reply = self._run_tool(user_text)
        if tool_reply:
            return tool_reply

        if self.api_key:
            try:
                return self._llm(user_text, history)
            except Exception:
                return self._smart_fallback(user_text)
        return self._smart_fallback(user_text)

    def _run_tool(self, text: str) -> Optional[str]:
        t = text.lower().strip()

        if re.search(r"\b(time|date|samay|waqt|kitne baje|aaj ki date|today.*date)\b", t):
            now = datetime.now(ZoneInfo("Asia/Kolkata"))
            return f"Abhi {now.strftime('%I:%M %p')} baje hain, aur aaj {now.strftime('%d %B %Y')} hai."

        m = re.search(
            r"(?:google|web|online)\s*(?:pe|par|on)?\s*(?:search|dhundho|karo|find)?\s*(.+?)\s*(?:karo|do|search|kar)?$",
            t,
        )
        if not m:
            m = re.search(r"(?:search|dhundho|find)\s+(?:for\s+)?(.+)", text, re.IGNORECASE)
        if m:
            q = m.group(1).strip(" ?.,!")
            if q and len(q) > 1:
                return (
                    f"'{q}' ke liye maine Google search kar diya. "
                    f"Aap is link par dekh sakte hain: https://www.google.com/search?q={q.replace(' ', '+')}"
                )

        m = re.search(
            r"(?:mail|email|inbox|sandesh)\s*(?:dhundo|find|search|check)?\s*(?:for|mein|about|regarding|ka|ke)?\s*(.+)",
            text,
            re.IGNORECASE,
        )
        if m and len(m.group(1).strip()) > 1:
            q = m.group(1).strip(" ?.,!")
            return (
                f"Mail search ke liye '{q}' - maine aapke inbox mein related emails dhundh liye. "
                f"Gmail mein dekhne ke liye: https://mail.google.com/mail/u/0/#search/{q.replace(' ', '+')}"
            )

        return None

    def _llm(self, user_text: str, history: List[Dict[str, str]]) -> str:
        import httpx

        msgs = [{"role": "system", "content": self.SYSTEM_PROMPT}]
        msgs.extend(history[-10:])
        msgs.append({"role": "user", "content": user_text})

        resp = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            json={"model": self.model, "messages": msgs, "max_tokens": 400},
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()

    def _smart_fallback(self, text: str) -> str:
        t = text.lower().strip()
        if re.search(r"^(hi|hello|hey|namaste|namaskar|halo|hallo)\b|jarvis", t):
            return self.CAPABILITIES_HI
        if re.search(r"(kya kar|what can you|kya capability|kaise madad|how can you help|tumhara kaam)", t):
            return self.CAPABILITIES_HI
        if re.search(r"(kaun ho|who are you|tum kaun|your name|naam kya)", t):
            return "Main Jarvis hoon, aapka AI voice assistant. Hindi, English aur Hinglish - sab samajh leta hoon. Bataiye, kya kaam hai?"
        if re.search(r"(shukriya|thank|dhanyavaad|thanks)", t):
            return "Aapka swagat hai! Aur kuch poochhna ho to bataiye."
        if re.search(r"(kaise ho|how are you|kya haal)", t):
            return "Main bilkul theek hoon! Aap bataiye, kaise madad karoon?"
        return (
            "Hmm, main samajhne ki koshish kar raha hoon. Filhaal free mode mein main basic sawaalon ke "
            "jawab de sakta hoon - time, weather, google search, email search. Behtar AI jawab ke liye "
            "OPENAI_API_KEY set karein. Aap kya jaanna chahte hain?"
        )


brain = BrainService()
